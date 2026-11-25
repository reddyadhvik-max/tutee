// Self-checks, no deps. Run: node check.js
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
  assert.equal(decideTurn({ text: "oxygen", firstAt: 0, lastAt: 300, now: 2000, minSpeechMs: 0 }), "end", "short answer kept when Pip asked");
  const { TurnManager } = await import("./turn.js");
  let now = 0, got = [];
  const tm = new TurnManager({ turn: (t) => got.push(t) }, () => now);
  tm.result({ final: "yes" }); now = 200; tm.result({ final: "" }); now = 5000; tm.tick();
  assert.deepEqual(got, [], "one short word dropped as noise by default");
  tm.allowShort = true; now = 0; tm.result({ final: "yes" }); now = 5000; tm.tick();
  assert.deepEqual(got, ["yes"], "allowShort keeps it");
  tm.reset();
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
  assert.ok(note.includes("couldn't read") && typeof j.correct === "number", "malformed -> mock judge + toast");
  providers.groq = (_, __, signal) => new Promise((_, rej) => signal.addEventListener("abort", () => rej(Object.assign(new Error("x"), { name: "AbortError" }))));
  await ask("pip", ctx, cfg, (m) => (note = m));
  assert.ok(note.includes("took too long"), "timeout -> mock");
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

// ---- real-API error handling: fetch is stubbed, no network ----
{
  const { testConnection, mockReason } = await import("./provider.js");
  const realFetch = globalThis.fetch;
  const topic = TOPICS.photosynthesis;
  const ctx = { topic, lang: "en", text: "plants make food from light", turns: ["plants make food from light"], vague: [] };
  const reply = (status, body) => async () => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  let seen = null;
  globalThis.fetch = async (url, init) => { seen = { url, body: JSON.parse(init.body), headers: init.headers }; return reply(200, { choices: [{ message: { content: '{"say":"Why though?","move":"why"}' } }] })(); };
  let cfg = { provider: "groq", groqKey: "k" };
  assert.equal((await ask("pip", ctx, cfg)).say, "Why though?", "groq happy path");
  assert.equal(seen.body.reasoning_effort, "low"); assert.ok(seen.body.max_completion_tokens && seen.body.response_format.type === "json_object");
  assert.ok(seen.body.messages[0].content.includes("You are Pip") && seen.body.messages[0].content.includes("same language mix"), "persona + language-mix line in prompt");
  // Gemini happy path, thought parts skipped
  globalThis.fetch = async (url, init) => { seen = { url, body: JSON.parse(init.body), headers: init.headers }; return reply(200, { candidates: [{ content: { parts: [{ text: "thinking...", thought: true }, { text: '{"say":"Hmm, why?","move":"why"}' }] } }] })(); };
  cfg = { provider: "gemini", geminiKey: "g" };
  assert.equal((await ask("pip", ctx, cfg)).say, "Hmm, why?", "gemini happy path");
  assert.ok(seen.url.includes("gemini-2.5-flash-lite:generateContent") && seen.headers["x-goog-api-key"] === "g" && seen.body.systemInstruction);
  // 401 -> plain message, mock answers, stays mock until settings change
  let msgs = [];
  globalThis.fetch = reply(401, { error: { message: "Invalid API Key", type: "invalid_request_error" } });
  cfg = { provider: "groq", groqKey: "bad" };
  const r401 = await ask("pip", ctx, cfg, (m, k) => msgs.push([m, k]));
  assert.ok(r401.say && msgs[0][1] === "auth" && msgs[0][0].includes("rejected the key"), "401 -> auth message + mock");
  assert.ok(isMock(cfg) && mockReason(cfg) === "auth", "stays mock after a bad key");
  // Gemini bad key arrives as 400 "API key not valid"
  globalThis.fetch = reply(400, { error: { code: 400, message: "API key not valid. Please pass a valid API key.", status: "INVALID_ARGUMENT" } });
  msgs = []; cfg = { provider: "gemini", geminiKey: "bad" };
  await ask("judge", ctx, cfg, (m, k) => msgs.push([m, k]));
  assert.equal(msgs[0][1], "auth", "gemini 400 bad key -> auth");
  // 429 -> rate, mock for ~60 s
  globalThis.fetch = reply(429, { error: { message: "Rate limit reached" } });
  msgs = []; cfg = { provider: "groq", groqKey: "k" };
  await ask("judge", ctx, cfg, (m, k) => msgs.push([m, k]));
  assert.ok(msgs[0][1] === "rate" && msgs[0][0].includes("free limit") && cfg.mockUntil > Date.now() + 50000 && mockReason(cfg) === "rate");
  // 5xx, network down, blocked prompt, Groq json_validate_failed salvage
  for (const [f, kind] of [
    [reply(503, { error: { message: "busy" } }), "server"],
    [async () => { throw new TypeError("Failed to fetch"); }, "network"],
    [reply(200, { promptFeedback: { blockReason: "SAFETY" } }), "bad"],
    [reply(200, { candidates: [{ finishReason: "MAX_TOKENS", content: {} }] }), "bad"],
  ]) {
    globalThis.fetch = f; msgs = [];
    await ask("pip", ctx, { provider: "gemini", geminiKey: "g" }, (m, k) => msgs.push(k));
    assert.equal(msgs[0], kind, `-> ${kind}`);
  }
  globalThis.fetch = reply(400, { error: { message: "json_validate_failed", failed_generation: 'Sure: {"say":"Salvaged!","move":"pop"}' } });
  assert.equal((await ask("pip", ctx, { provider: "groq", groqKey: "k" })).say, "Salvaged!", "failed_generation is salvaged");
  // Test connection
  globalThis.fetch = reply(200, { choices: [{ message: { content: '{"ok": true}' } }] });
  assert.ok((await testConnection({ provider: "groq", groqKey: "k" })).ok, "test ok");
  globalThis.fetch = reply(401, { error: { message: "Invalid API Key" } });
  const t401 = await testConnection({ provider: "groq", groqKey: "k" });
  assert.ok(!t401.ok && t401.kind === "auth" && !t401.message.includes("Mock"), "test 401 is plain");
  assert.ok(!(await testConnection({ provider: "gemini", geminiKey: "" })).ok, "test with no key");
  assert.ok((await testConnection({ provider: "mock" })).ok, "mock needs no test");
  globalThis.fetch = realFetch;
  ok("API error handling + test connection");
}

// ---- config + topic packs ----
{
  const { CONFIG } = await import("./config.js");
  const { validatePack, PACK } = await import("./topics.js");
  for (const k of ["appName", "tagline", "persona", "defaultLang", "features", "theme", "pack"]) assert.ok(k in CONFIG, `config.${k}`);
  for (const f of ["learn", "teach", "judge", "whisper"]) assert.equal(typeof CONFIG.features[f], "boolean", `features.${f}`);
  assert.equal(PACK, CONFIG.pack);
  const { readdirSync } = await import("node:fs");
  for (const f of readdirSync(new URL("./topics/", import.meta.url)).filter((f) => f.endsWith(".js"))) {
    const p = (await import(`./topics/${f}`)).default;
    validatePack(p);
    for (const [k, t] of Object.entries(p.topics)) for (const lang of ["en", "hi", "hinglish"]) {
      const lt = { ...t, ...(p.i18n?.[k]?.[lang] || {}) };
      assert.ok(lt.outline.length >= 3 && lt.jargon.length, `${f}:${k}/${lang} usable (falls back to English)`);
    }
  }
  assert.throws(() => validatePack({ id: "x", name: "X", audience: "y", topics: { a: { title: "A", jargon: ["b"], outline: [{ idea: "i" }] } } }), /3\+ outline/);
  assert.throws(() => validatePack({ id: "x", name: "X", audience: "y", topics: {} }), /at least one topic/);
  // judge flag off: no judge call is made, the meter still moves
  const calls = [];
  const t = new Teach({ topic: TOPICS.photosynthesis, ask: async (task, c) => (calls.push(task), MOCK[task](c)), judge: false });
  const r = await t.turn("Plants make their own food using light water and carbon dioxide from the air.");
  assert.ok(!calls.includes("judge") && r.meter > 0, "judge:false scores locally");
  ok("config + topic packs");
}

// ---- service worker never caches API calls ----
{
  const { readFileSync, existsSync } = await import("node:fs");
  const sw = readFileSync(new URL("./sw.js", import.meta.url), "utf8");
  assert.ok(/method !== "GET" \|\| u\.origin !== location\.origin\) return/.test(sw), "sw skips non-GET and cross-origin");
  for (const f of sw.match(/FILES = \[([\s\S]*?)\]/)[1].match(/"([^"]+)"/g).map((x) => x.slice(1, -1)).filter((f) => f !== "./"))
    assert.ok(existsSync(new URL("./" + f, import.meta.url)), `sw caches existing file ${f}`);
  const { execSync } = await import("node:child_process");
  const jsFiles = execSync("git ls-files --cached --others --exclude-standard '*.js'", { cwd: new URL(".", import.meta.url) }).toString().split("\n").filter((f) => f && !["sw.js", "check.js"].includes(f));
  for (const f of jsFiles) assert.ok(sw.includes(`"${f}"`), `sw.js FILES lists ${f} (else it breaks offline)`);
  const manifest = JSON.parse(readFileSync(new URL("./manifest.webmanifest", import.meta.url), "utf8"));
  assert.ok(manifest.name && manifest.icons.length && manifest.start_url);
  ok("offline files");
}
console.log("all checks passed");
