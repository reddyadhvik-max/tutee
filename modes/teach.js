// Teach mode: student explains, Pip listens. Jargon buzz on interim text; one Pip move per turn; judge moves the meter.
import { findUnexplained } from "../jargon.js";
import { PHRASES } from "../topics.js";
import { meterFrom, MOCK } from "../provider.js";
import { clarityCard } from "./card.js";

export class Teach {
  // ask(task, ctx) is provider.ask bound to the current settings.
  // judge = false scores locally (keyword coverage) instead of a second LLM call per turn.
  constructor({ topic, lang = "en", ask, judge = true }) {
    Object.assign(this, { topic, lang, ask, useJudge: judge, p: PHRASES[lang] || PHRASES.en });
    this.turns = []; this.history = []; this.handled = new Set(); this.vague = []; this.judge = null; this.meter = 0; this.moves = [];
  }
  opening() { return this.p.teachMe; }

  // Called on every interim transcript. Returns {term, say} the moment an unexplained term is used.
  buzz(text, final = false) {
    const term = findUnexplained(text, this.topic.jargon, this.handled, final);
    if (!term) return null;
    this.handled.add(term); this.vague.push(term);
    if (!final) this.turns.push(text.trim()); // the half-sentence still counts for the judge
    return { term, say: this.p.buzz(term) };
  }

  // End of turn: Pip (one move, max 2 sentences) and the judge run in parallel.
  async turn(text) {
    this.turns.push(text.trim());
    const ctx = { topic: this.topic, lang: this.lang, text, turns: [...this.turns], history: this.history, vague: [...this.vague] };
    const b = this.buzz(text, true); // a term left hanging at the very end of the turn
    const [pip, judge] = await Promise.all([b ? { say: b.say, move: "buzz", term: b.term } : this.ask("pip", ctx), this.useJudge ? this.ask("judge", ctx) : MOCK.judge(ctx)]);
    pip.say = firstSentences(pip.say, 2);
    this.history.push({ role: "user", content: text }, { role: "assistant", content: pip.say });
    this.history = this.history.slice(-12); // shortcut: last 6 turns only, keeps free-tier tokens low
    this.judge = judge; this.meter = meterFrom(judge); this.moves.push(pip.move);
    return { pip, judge, meter: this.meter };
  }

  card() { return clarityCard({ mode: "teach", topic: this.topic, turns: this.turns, judge: this.judge }); }
}

export function firstSentences(s, n) {
  const parts = s.match(/[^.!?।]+[.!?।]*\s*/g) || [s];
  return parts.slice(0, n).join("").trim();
}
