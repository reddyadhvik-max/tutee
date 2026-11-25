// Common ASR interface. Every adapter: create({ lang, key, onResult({final, interim, confidence}), onError(code), onState(s) })
// returns { kind, continuous, start(), stop() }. A future asr/wispr.js only has to match this shape.
import { webSpeechSupported, createWebSpeech } from "./webspeech.js";
import { whisperSupported, createGroqWhisper } from "./groq-whisper.js";

export function pickAsr(opts) {
  if (webSpeechSupported()) return createWebSpeech(opts);
  if (whisperSupported() && opts.groqKey) return createGroqWhisper(opts);
  return null; // caller falls back to typing
}
