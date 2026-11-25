// Fallback when Web Speech is missing (Firefox, Safari): record with MediaRecorder, send to Groq whisper-large-v3-turbo.
// No interim text, so it runs as hold-to-talk: start() on press, stop() on release uploads and returns one final result.
export const whisperSupported = () => typeof window !== "undefined" && !!window.MediaRecorder && !!navigator.mediaDevices?.getUserMedia;

export function createGroqWhisper({ lang, groqKey, onResult, onError }) {
  let rec = null, chunks = [];
  async function start() {
    if (rec) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      chunks = [];
      rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => { stream.getTracks().forEach((t) => t.stop()); upload(new Blob(chunks, { type: rec?.mimeType || "audio/webm" })); rec = null; };
      rec.start();
    } catch { onError("blocked"); }
  }
  async function upload(blob) {
    if (blob.size < 2000) return; // under ~1 s of audio: treat as noise
    const fd = new FormData();
    fd.append("file", blob, "turn.webm");
    fd.append("model", "whisper-large-v3-turbo");
    fd.append("language", lang.slice(0, 2));
    fd.append("response_format", "json");
    try {
      const r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${groqKey}` }, body: fd });
      if (!r.ok) throw new Error(r.status);
      onResult({ final: ((await r.json()).text || "").trim(), interim: "", confidence: 0 });
    } catch { onError("network"); }
  }
  function stop() { if (rec && rec.state !== "inactive") rec.stop(); }
  return { kind: "groq-whisper", continuous: false, start, stop };
}
