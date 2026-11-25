// Self-checks, no deps. Run: node phase-2/app/check.js
import assert from "node:assert/strict";
import { findUnexplained } from "./jargon.js";
import { decideTurn, isGarbled } from "./turn.js";
import { parseJSON, normalizeJudge, meterFrom, ask, MOCK, isMock } from "./provider.js";
import { TOPICS, TOPIC_I18N, localTopic, mockTopic } from "./topics.js";
import { Teach, firstSentences } from "./modes/teach.js";
import { Learn, LEARN, sentences } from "./modes/learn.js";

const ok = (name) => console.log("ok -", name);

// ---- jargon ----
{
  const terms = TOPICS.photosynthesis.jargon;
  assert.equal(findUnexplained("plants use chlorophyll to catch the light from sun", terms, new Set()), "chlorophyll");
  assert.equal(findUnexplained("chlorophyll means the green stuff in leaves", terms, new Set()), null);
  assert.equal(findUnexplained("chlorophyll is basically a green pigment", terms, new Set()), null);
  assert.equal(findUnexplained("plants use chlorophyll", terms, new Set()), null, "waits for words after the term mid-sentence");
  assert.equal(findUnexplained("plants use chlorophyll", terms, new Set(), true), "chlorophyll", "end of turn decides");
  assert.equal(findUnexplained("chlorophyll matlab hara rang jo light pakadta hai", terms, new Set()), null, "Hinglish cue");
  const seen = new Set(["chlorophyll"]);
  assert.equal(findUnexplained("chlorophyll and then glucose gets made in the leaf", terms, seen), "glucose");
  assert.equal(findUnexplained("the reaction was big and loud today ok", ["action"], new Set()), null, "whole words only");
  assert.equal(findUnexplained("electrons move through the wire very slowly", ["electron"], new Set()), "electron", "plural");
  assert.equal(findUnexplained("anything at all here", [], new Set()), null);
  // buzz must be instant: local and synchronous
  const t0 = performance.now();
  for (let i = 0; i < 1000; i++) findUnexplained("so the plant uses chlorophyll and stomata and glucose in the leaf every day", terms, new Set());
  assert.ok((performance.now() - t0) / 1000 < 1, "buzz check under 1 ms");
  ok("jargon detection");
}

// ---- turn-end timing ----
{
  const base = { text: "the plant makes food", firstAt: 0, lastAt: 2000 };
  assert.equal(decideTurn({ ...base, now: 2500 }), "wait", "under 1.1 s of silence");
  assert.equal(decideTurn({ ...base, now: 3100 }), "end", "1.1 s silence ends the turn");
  assert.equal(decideTurn({ text: "um", firstAt: 0, lastAt: 300, now: 2000 }), "ignore", "short noise ignored");
  assert.equal(decideTurn({ text: "  ", firstAt: 0, lastAt: 0, now: 5000 }), "none");
  assert.equal(decideTurn({ ...base, now: 9000, confidence: 0.2 }), "garbled");
  assert.equal(decideTurn({ ...base, now: 9000, confidence: 0 }), "end", "unknown confidence is not garbled");
  assert.equal(decideTurn({ ...base, now: Infinity }), "end", "hold-to-talk release forces the end");
  assert.ok(isGarbled("?? ..")); assert.ok(!isGarbled("हाँ ठीक है"));
  ok("turn-end timing");
}

// ---- judge JSON parsing ----
{
  assert.deepEqual(parseJSON('{"a":1}'), { a: 1 });
  assert.deepEqual(parseJSON('```json\n{"a": 1,}\n```'), { a: 1 }, "fence + trailing comma");
  assert.deepEqual(parseJSON('Sure! Here you go: {"a": [1, 2,], "b": "x"} hope it helps'), { a: [1, 2], b: "x" });
  assert.throws(() => parseJSON("no json here"));
  assert.throws(() => parseJSON('{"a": '));
  const j = normalizeJudge({ correct: "8", simple: 12, complete: -3, evidence: 5, gaps: "stomata", hand_waved: ["atp"] });
  assert.deepEqual(j, { correct: 8, simple: 10, complete: 0, evidence: "5", gaps: ["stomata"], vague: ["atp"] });
  assert.throws(() => normalizeJudge({ say: "hi" }), "not a judge object");
  assert.equal(meterFrom({ correct: 10, simple: 10, complete: 10 }), 100);
  ok("judge JSON parsing");
}

// ---- provider fallback: malformed model output and timeouts fall back to mock ----
{
  const { providers } = await import("./provider.js");
  const real = providers.groq;
  const cfg = { provider: "groq", groqKey: "test", timeoutMs: 50 };
  const topic = TOPICS.photosynthesis;
  const ctx = { topic, lang: "en", text: "plants make food from light", turns: ["plants make food from light"], vague: [] };
  let note = "";
  providers.groq = async () => "I think the score is about seven";
  const j = await ask("judge", ctx, cfg, (m) => (note = m));
  assert.ok(note.includes("failed") && typeof j.correct === "number", "malformed -> mock judge + toast");
  providers.groq = (_, __, signal) => new Promise((_, rej) => signal.addEventListener("abort", () => rej(Object.assign(new Error("x"), { name: "AbortError" }))));
  await ask("pip", ctx, cfg, (m) => (note = m));
  assert.ok(note.includes("timed out"), "timeout -> mock");
  providers.groq = async () => '```json\n{"correct": 7, "simple": 8, "complete": 3, "evidence": "make food", "gaps": ["stomata"], "vague": []}\n```';
  assert.equal((await ask("judge", ctx, cfg)).complete, 3, "good output is used");
  providers.groq = real;
  assert.ok(isMock({ provider: "groq", groqKey: "" }) && isMock({ provider: "mock" }) && !isMock(cfg));
  ok("provider fallback");
}

// ---- Teach state machine (mock provider) ----
{
  const topic = { ...TOPICS.photosynthesis, jargon: ["chlorophyll", "stomata"] };
  const t = new Teach({ topic, lang: "en", ask: (task, ctx) => MOCK[task](ctx) });
  assert.equal(t.opening(), "Okay, teach me!");
  const b = t.buzz("so plants have chlorophyll inside their leaves and");
  assert.equal(b.term, "chlorophyll");
  assert.equal(t.buzz("so plants have chlorophyll inside their leaves and"), null, "each term buzzes once");
  const moves = [], meters = [];
  for (const s of [
    "Plants make their own food using light, water and carbon dioxide from the air.",
    "It happens in the chloroplasts of the leaf cells which hold green chlorophyll pigment.",
    "Carbon dioxide enters through tiny holes and water comes up from the roots.",
    "The light energy turns them into glucose and oxygen is released into the air.",
  ]) {
    const r = await t.turn(s);
    moves.push(r.pip.move);
    assert.ok(firstSentences(r.pip.say, 2) === r.pip.say, "max 2 sentences");
    meters.push(r.meter);
  }
  assert.ok(meters.at(-1) > meters[0], "meter rises as more ideas are covered");
  assert.equal(new Set(moves).size, 4, "one move per turn, varied");
  assert.equal((await t.turn("and air gets in through the stomata")).pip.move, "buzz", "term hanging at turn end buzzes");
  const r = await t.turn("the plant needs light");
  assert.ok(["why", "example", "flaw", "flag", "pop", "buzz"].includes(r.pip.move));
  const card = t.card();
  assert.ok(card.well.length && card.weak.length && card.pops.length === 3, "clarity card filled");
  assert.ok(card.weak.some((w) => w.includes("chlorophyll")), "buzzed term shows as vague");
  // Hindi path
  const h = new Teach({ topic: TOPICS.photosynthesis, lang: "hi", ask: (task, ctx) => MOCK[task](ctx) });
  assert.ok(h.opening().includes("सिखाओ"));
  ok("teach state machine");
}

// ---- Learn state machine (mock provider, scripted student) ----
{
  Object.assign(LEARN, { pauseMs: 0, questionMs: 0, carryOnMs: 0, checkMs: 0 });
  const topic = TOPICS["newton's third law"];
  const said = [];
  // listen() answers, in order: pause after chunk 1 = silence; cut-in question; carry on = yes; ... check 1 wrong; check 2 right.
  const script = {
    listen: [null, "wait, why?", "yes", null, null, "the moon pulls the sun", null, null, "both feel the same force"],
    say: { 3: false }, // cut Pip off at the 4th line (intro, 2 lines of chunk 1, then chunk 2's first sentence)
  };
  let li = 0, si = 0;
  const io = {
    say: async (text, kind) => { said.push([kind, text]); return script.say[si++] ?? true; },
    listen: async () => script.listen[li++] ?? null,
    progress: () => {},
  };
  const learn = new Learn({ topic, lang: "en", ask: (task, ctx) => MOCK[task](ctx), io });
  const card = await learn.run();
  const kinds = said.map((s) => s[0]);
  const chunk2 = sentences(topic.outline[1].explain)[0];
  const cutAt = 3;
  assert.equal(said[cutAt][1], chunk2, "line 4 is chunk 2's first sentence");
  assert.equal(kinds[cutAt + 1], "answer", "cut-in gets an answer");
  assert.equal(said[cutAt + 2][1], "Shall I carry on?");
  assert.equal(said[cutAt + 3][1], chunk2, "resumes from the same sentence");
  assert.ok(kinds.includes("check") && kinds.includes("wrong") && kinds.includes("reexplain") && kinds.includes("right"));
  assert.equal(kinds.filter((k) => k === "check").length, 2, "checks after chunk 3 and the last chunk");
  assert.equal(kinds.at(-1), "done");
  assert.equal(card.pops.length, 3);
  assert.ok(card.well.some((w) => w.includes("truck")) && card.weak.some((w) => w.includes("Check missed")), "card reflects checks");
  assert.ok(card.weak.some((w) => w.includes("wait, why?")), "card lists cut-in questions");
  // stop mid-way ends cleanly
  const l2 = new Learn({ topic, lang: "en", ask: (task, ctx) => MOCK[task](ctx), io: { say: async () => { l2.stop(); return true; }, listen: async () => null } });
  assert.equal((await l2.run()).mode, "learn");
  ok("learn state machine");
}

// ---- free-text topic without a key ----
{
  const m = mockTopic("black holes");
  assert.equal(m.outline.length, 5); assert.ok(m.jargon.length >= 1);
  assert.equal((await ask("topic", { title: "black holes", lang: "en" }, { provider: "mock" })).title, "black holes");
  ok("mock topic");
}
// ---- every demo topic has en/hi/hinglish content ----
{
  for (const k of Object.keys(TOPICS)) {
    for (const lang of ["en", "hi", "hinglish"]) {
      const t = lang === "en" ? TOPICS[k] : TOPIC_I18N[k]?.[lang];
      assert.ok(t?.title && t.jargon.length >= 3 && t.outline.length === 5, `${k}/${lang} present`);
      for (const o of t.outline) assert.ok(o.idea && o.explain && o.alt && o.check && o.answer.length, `${k}/${lang} idea complete`);
    }
    assert.ok(/[\u0900-\u097F]/.test(TOPIC_I18N[k].hi.outline[0].explain), `${k}/hi is Devanagari`);
    assert.ok(!/[\u0900-\u097F]/.test(TOPIC_I18N[k].hinglish.outline[0].explain), `${k}/hinglish is Roman`);
  }
  const hi = localTopic("photosynthesis", "hi");
  assert.equal(findUnexplained("पौधे में क्लोरोफिल होता है जो पत्ती को हरा बनाता", hi.jargon, new Set()), "क्लोरोफिल", "Hindi buzz");
  assert.equal(findUnexplained("क्लोरोफिल मतलब हरा रंग जो धूप पकड़ता है", hi.jargon, new Set()), null, "Hindi explain cue");
  assert.equal(localTopic("photosynthesis", "en").title, "Photosynthesis");
  ok("topic languages");
}
console.log("all checks passed");
