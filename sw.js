// Offline cache for the static app so mock mode works with no network. Same-origin GETs only:
// API calls (Groq, Gemini) are cross-origin POSTs and always go straight to the network, never cached.
// Network first, cache as fallback, so an online reload always gets fresh files. Bump VERSION when FILES changes.
const VERSION = "tutee-v1.0";
const FILES = [
  "./", "index.html", "style.css", "app.js", "config.js", "topics.js", "provider.js", "turn.js", "tts.js", "jargon.js",
  "asr/index.js", "asr/webspeech.js", "asr/groq-whisper.js", "modes/learn.js", "modes/teach.js", "modes/card.js",
  "topics/science.js", "topics/civic.js", "manifest.webmanifest", "icon.svg",
];

self.addEventListener("install", (e) => e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())));

self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // APIs and anything else: browser default
  e.respondWith(fetch(e.request).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html"))));
});
