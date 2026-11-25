// Web Speech API adapter: continuous, interim results on, en-IN or hi-IN.
const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
export const webSpeechSupported = () => !!SR;

export function createWebSpeech({ lang, onResult, onError }) {
  let rec = null, want = false;
  function start() {
    want = true;
    if (rec) return;
    rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = lang;
    rec.onresult = (e) => {
      let final = "", interim = "", confidence = 0;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) { final += r[0].transcript + " "; confidence = r[0].confidence; } else interim += r[0].transcript;
      }
      onResult({ final: final.trim(), interim, confidence });
    };
    rec.onerror = (e) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") { want = false; onError("blocked"); } };
    rec.onend = () => { rec = null; if (want) start(); }; // Chrome stops after silence; keep listening
    try { rec.start(); } catch { rec = null; }
  }
  function stop() { want = false; if (rec) { const r = rec; rec = null; r.onend = null; r.abort(); } }
  return { kind: "webspeech", continuous: true, start, stop };
}
