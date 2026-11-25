// Turn manager: interim/final ASR results -> end of turn after silence; ignores very short noise; flags garbled text.
export const TURN = { silenceMs: 1100, minSpeechMs: 1000 };

export function isGarbled(text, confidence = 0) {
  // Chrome reports confidence 0 when it doesn't know, so only a real low score counts.
  return (confidence > 0 && confidence < 0.4) || !/[\p{L}\p{M}]{2,}/u.test(text);
}

// Pure decision, called by a timer. Times are ms. Returns "none" | "wait" | "ignore" | "garbled" | "end".
export function decideTurn({ text, firstAt, lastAt, now, confidence = 0, silenceMs = TURN.silenceMs, minSpeechMs = TURN.minSpeechMs }) {
  const t = (text || "").trim();
  if (!t) return "none";
  if (now - lastAt < silenceMs) return "wait";
  // shortcut: "under one second" is measured first-to-last ASR result plus one word guard, real VAD would be better.
  if (lastAt - firstAt < minSpeechMs && t.split(/\s+/).length < 2) return "ignore";
  if (isGarbled(t, confidence)) return "garbled";
  return "end";
}

// Glue around decideTurn. on: { interim(fullText), turn(text), garbled(text) }.
export class TurnManager {
  constructor(on, clock = () => performance.now()) { this.on = on; this.clock = clock; this.reset(); }
  // allowShort: set while Pip waits for an answer, so one quick word isn't dropped as noise.
  reset() { clearTimeout(this.timer); this.final = ""; this.interim = ""; this.firstAt = 0; this.lastAt = 0; this.conf = 0; this.holding = false; }
  get text() { return (this.final + " " + this.interim).trim(); }
  result({ final = "", interim = "", confidence = 0 }) {
    const now = this.clock();
    if (!this.firstAt) this.firstAt = now;
    this.lastAt = now;
    if (final) { this.final += final + " "; if (confidence) this.conf = confidence; }
    this.interim = interim;
    this.on.interim?.(this.text);
    clearTimeout(this.timer);
    if (!this.holding) this.timer = setTimeout(() => this.tick(), TURN.silenceMs);
  }
  tick(force = false) {
    const d = decideTurn({ text: this.text, firstAt: this.firstAt, lastAt: this.lastAt, now: force ? Infinity : this.clock(), confidence: this.conf, minSpeechMs: this.allowShort ? 0 : TURN.minSpeechMs });
    if (d === "wait") { this.timer = setTimeout(() => this.tick(), 100); return; }
    const text = this.text;
    this.reset();
    if (d === "end") this.on.turn?.(text);
    else if (d === "garbled") this.on.garbled?.(text);
  }
  hold(on) { this.holding = on; if (on) clearTimeout(this.timer); else this.tick(true); } // hold-to-talk release ends the turn now
}
