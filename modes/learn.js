// Learn mode: Pip explains in 2-3 sentence chunks, pauses ~2 s, takes cut-in questions, asks a check every 3 chunks.
// io: { say(text, kind) -> Promise<bool finished (false = cut in)>, listen(ms) -> Promise<string|null>, progress(i, n) }
import { PHRASES } from "../topics.js";
import { clarityCard } from "./card.js";

export const LEARN = { pauseMs: 2000, questionMs: 8000, carryOnMs: 4000, checkMs: 15000, checkEvery: 3 };
const YES = /^(yes|yeah|yep|ok|okay|sure|go|carry|continue|haan|han|ha|theek|chalo|हाँ|हां|ठीक)/i;
const NO = /^(no|nope|wait|nahi|ruko|नहीं|रुको)\b/i;

export const sentences = (t) => (t.match(/[^.!?।]+[.!?।]*/g) || [t]).map((s) => s.trim()).filter(Boolean);

export class Learn {
  constructor({ topic, lang = "en", ask, io }) {
    Object.assign(this, { topic, lang, ask, io, p: PHRASES[lang] || PHRASES.en });
    this.idx = 0; this.checks = []; this.questions = []; this.stopped = false; this.log = [];
  }
  stop() { this.stopped = true; }
  async say(text, kind) { this.log.push(kind); return this.io.say(text, kind); }

  async run() {
    const out = this.topic.outline;
    if (!(await this.say(this.p.learnIntro(this.topic.title), "intro"))) await this.cutIn();
    for (this.idx = 0; this.idx < out.length && !this.stopped; this.idx++) {
      const c = out[this.idx];
      this.io.progress?.(this.idx, out.length);
      await this.explain(c.explain, "chunk");
      if (this.stopped) break;
      const q = await this.io.listen(LEARN.pauseMs); // silence = carry on
      if (q) await this.answer(q);
      if (!this.stopped && ((this.idx + 1) % LEARN.checkEvery === 0 || this.idx === out.length - 1)) await this.check(c);
    }
    this.io.progress?.(out.length, out.length);
    if (!this.stopped) await this.say(this.p.done(this.topic.title), "done");
    return this.card();
  }

  // Sentence by sentence, so a cut-in resumes at the exact sentence that was interrupted.
  async explain(text, kind) {
    const ss = sentences(text);
    for (let i = 0; i < ss.length && !this.stopped; ) {
      if (await this.say(ss[i], kind)) i++;
      else await this.cutIn();
    }
  }
  async cutIn() { const q = await this.io.listen(LEARN.questionMs); if (q) await this.answer(q); }

  // Answer, then "Shall I carry on?"; anything other than yes is treated as another question.
  async answer(q) {
    for (let n = 0; q && !this.stopped && n < 5; n++) {
      this.questions.push(q);
      const r = await this.ask("answer", { topic: this.topic, lang: this.lang, chunk: this.topic.outline[this.idx], text: q });
      if (!(await this.say(r.say, "answer"))) { q = await this.io.listen(LEARN.questionMs); continue; }
      await this.say(this.p.carryOn, "carryOn");
      const reply = await this.io.listen(LEARN.carryOnMs);
      if (!reply || YES.test(reply.trim())) return;
      q = NO.test(reply.trim()) && reply.trim().split(/\s+/).length <= 2 ? await this.io.listen(LEARN.questionMs) : reply;
    }
  }

  async check(c) {
    await this.say(`${this.p.checkIntro} ${c.check}`, "check");
    const a = await this.io.listen(LEARN.checkMs);
    if (this.stopped) return;
    if (!a) { this.checks.push({ q: c.check, idx: this.idx, correct: false }); await this.say(this.p.moveOn, "moveOn"); return; }
    const r = await this.ask("check", { topic: this.topic, lang: this.lang, chunk: c, text: a });
    this.checks.push({ q: c.check, idx: this.idx, answer: a, correct: r.correct });
    await this.say(r.say || (r.correct ? this.p.right : this.p.wrong), r.correct ? "right" : "wrong");
    if (!r.correct) await this.explain(c.alt, "reexplain"); // a wrong answer: same idea, explained another way
  }

  card() { return clarityCard({ mode: "learn", topic: this.topic, checks: this.checks, questions: this.questions }); }
}
