// Pip's voice: browser speechSynthesis. speak() resolves true when finished, false when cut off.
let current = null;

function pickVoice(lang) {
  const vs = typeof speechSynthesis !== "undefined" ? speechSynthesis.getVoices() : [];
  return vs.find((v) => v.lang === lang) || vs.find((v) => v.lang.replace("_", "-").startsWith(lang.slice(0, 2))) || null;
}

export const speaking = () => !!current;

// mute: text-only mode (quiet room, tests); still "speaks" for a reading-time delay so cut-in works the same.
export function speak(text, lang = "en-IN", mute = false) {
  return new Promise((done) => {
    cancel();
    if (mute || typeof speechSynthesis === "undefined") {
      const u = { _cut: () => finish(false) };
      const finish = (ok) => { if (current !== u) return; current = null; clearTimeout(t); done(ok); };
      const t = setTimeout(() => finish(true), Math.min(2500, 300 + text.length * 15));
      current = u; return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = 1.0; u.pitch = 1.25;
    const v = pickVoice(lang); if (v) u.voice = v;
    const finish = (ok) => { if (current !== u) return; current = null; clearTimeout(guard); done(ok); };
    u._cut = () => finish(false);
    const guard = setTimeout(() => finish(true), 2500 + text.length * 90); // some browsers never fire onend
    u.onend = () => finish(true);
    u.onerror = (e) => finish(e.error !== "interrupted" && e.error !== "canceled");
    current = u;
    speechSynthesis.speak(u);
  });
}

export function cancel() {
  const u = current;
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  if (u) u._cut();
}
