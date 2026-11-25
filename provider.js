// All model calls go through ask(task, ctx, cfg). Providers: groq | gemini | mock (no key, no network).
// Tasks: pip (Teach move), answer (Learn cut-in), check (Learn check question), judge (rubric, temp 0), topic (outline + jargon).
import { PHRASES, LANGS, PACK, mockTopic } from "./topics.js";
import { CONFIG } from "./config.js";

export const DEFAULTS = { provider: "mock", groqModel: "openai/gpt-oss-20b", geminiModel: "gemini-2.5-flash-lite", timeoutMs: 6000 };

// ---------- prompts ----------
// The transcript goes to the model as is; it replies in whatever mix the student used (spec: Hinglish and mixed scripts).
const langLine = (ctx) => `The student's words are raw speech-to-text, possibly mixed Hindi/English or with recognition slips; take them as is.
Reply in the same language mix and script the student used. If unsure, use ${LANGS[ctx.lang || "en"].llm}. Spoken style: no markdown, no emoji, no lists.`;
const outlineText = (ctx) => ctx.topic.outline.map((o, i) => `${i + 1}. ${o.idea}`).join("\n");

const PROMPTS = {
  pip: (ctx) => `You are ${CONFIG.persona}, ${CONFIG.learnerRole}. The student is teaching you "${ctx.topic.title}" out loud.
Stay in character, never lecture, never give the answer. At most 2 short spoken sentences, no lists, no markdown.
Make exactly ONE move:
"flag" = point out one wrong or missing step (use the hidden outline), "why" = ask why, "example" = ask for a real-life example,
"flaw" = repeat their idea back with one planted mistake for them to catch, "pop" = a quick question that tests depth.
Hidden reference outline (never read it out):
${outlineText(ctx)}
${langLine(ctx)}
Return only JSON: {"say": "...", "move": "flag|why|example|flaw|pop"}`,
  answer: (ctx) => `You are ${CONFIG.persona}, ${CONFIG.tutorRole} teaching "${ctx.topic.title}" by voice. You were explaining this part:
"${ctx.chunk.explain}"
The student cut in with a question. Answer it in at most 3 short spoken sentences, plain words. If they ask you to repeat or go slower, re-say that part more simply. Do not ask whether to continue.
${langLine(ctx)}
Return only JSON: {"say": "..."}`,
  check: (ctx) => `You grade a student's spoken answer to a quick check question about "${ctx.topic.title}".
Question: ${ctx.chunk.check}
Reference: ${ctx.chunk.idea}
Be lenient about wording and grammar, strict about the idea. ${langLine(ctx)}
Return only JSON: {"correct": true|false, "say": "one short spoken sentence of feedback"}`,
  judge: (ctx) => `You are a strict, fair examiner. Score ONLY the student's explanation of "${ctx.topic.title}" so far, using this fixed rubric:
correct (0-10): no wrong facts; simple (0-10): plain words, terms explained; complete (0-10): coverage of the reference outline.
Reference outline:
${outlineText(ctx)}
Jargon to watch: ${ctx.topic.jargon.join(", ")}
Quote one short phrase of the student as evidence. gaps = outline ideas missing or wrong (short). vague = terms or claims used without explanation.
Return only JSON: {"correct": n, "simple": n, "complete": n, "evidence": "...", "gaps": ["..."], "vague": ["..."]}`,
  topic: (ctx) => `Make study material for the topic "${ctx.title}" for ${PACK.audience}. ${langLine(ctx)}
Return only JSON: {"title": "...", "jargon": [6-8 key technical terms, lowercase, in the student's script],
"outline": [exactly 5 objects in teaching order: {"idea": "one-line key idea", "explain": "2-3 plain spoken sentences",
"alt": "the same idea explained another way, with an everyday analogy, 2 sentences", "check": "one quick question", "answer": ["2-4 keywords a right answer contains"]}]}`,
};

// What the model sees as the conversation for each task.
function messagesFor(task, ctx) {
  if (task === "pip") return [...(ctx.history || []).slice(-12), { role: "user", content: ctx.text }];
  if (task === "judge") return [{ role: "user", content: `Student's turns so far:\n${ctx.turns.map((t, i) => `${i + 1}. ${t}`).join("\n")}` }];
  if (task === "topic") return [{ role: "user", content: ctx.title }];
  return [{ role: "user", content: ctx.text }];
}
const TEMP = { pip: 0.7, answer: 0.5, check: 0, judge: 0, topic: 0.4 };

// ---------- errors: every failure becomes one ApiError kind with a plain message ----------
// kind: auth | rate | timeout | offline | network | server | bad
export class ApiError extends Error {
  constructor(kind, detail = "", status = 0) { super(detail || kind); this.kind = kind; this.status = status; }
}
const NAMES = { groq: "Groq", gemini: "Gemini" };
// test = true drops the "mock answered" half, for the Settings test button.
export function plainError(e, provider, test = false) {
  const p = NAMES[provider] || provider;
  const [core, fallback] = ({
    auth: [`${p} rejected the key. Check it in Settings.`, "Mock mode until you save a new key."],
    rate: [`${p} free limit reached.`, "Mock mode for a minute, then it tries again."],
    timeout: [`${p} took too long.`, "Mock answered this one."],
    offline: ["You're offline.", "Mock mode until the network is back."],
    network: [`Couldn't reach ${p}. Check your network.`, "Mock answered this one."],
    server: [`${p} is having trouble (error ${e.status}).`, "Mock answered this one."],
    bad: [`${p} sent a reply ${CONFIG.appName} couldn't read.`, "Mock answered this one."],
  })[e.kind] || [`${p} failed.`, "Mock answered this one."];
  return test ? core : `${core} ${fallback}`;
}
// Groq: {error:{message,type}}. Gemini: {error:{code,message,status}}; a bad Gemini key has come back as 400 "API key not valid".
async function httpError(r) {
  let body = {}; try { body = await r.json(); } catch {}
  const msg = String(body?.error?.message || "");
  const salvage = body?.error?.failed_generation; // Groq json_object mode: the text it couldn't validate
  if (r.status === 401 || r.status === 403 || /api key/i.test(msg)) return new ApiError("auth", msg, r.status);
  if (r.status === 429 || r.status === 498) return new ApiError("rate", msg, r.status);
  if (salvage) return Object.assign(new ApiError("bad", msg, r.status), { salvage });
  if (r.status >= 500) return new ApiError("server", msg, r.status);
  return new ApiError("bad", msg, r.status);
}
async function post(url, init) {
  let r;
  try { r = await fetch(url, { method: "POST", ...init }); } catch (e) {
    if (e.name === "AbortError") throw new ApiError("timeout");
    throw new ApiError(typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "network", e.message);
  }
  if (!r.ok) throw await httpError(r);
  try { return await r.json(); } catch { throw new ApiError("bad", "response was not JSON"); }
}

// ---------- providers (add one = add one function returning the raw text) ----------
export const providers = {
  // OpenAI-compatible. gpt-oss is a reasoning model: low effort keeps replies fast, and reasoning tokens
  // share max_completion_tokens with the answer, so the cap leaves room for both.
  async groq({ system, messages, temperature, maxTokens = 1500 }, cfg, signal) {
    const j = await post("https://api.groq.com/openai/v1/chat/completions", {
      signal, headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.groqKey}` },
      body: JSON.stringify({ model: cfg.groqModel || DEFAULTS.groqModel, temperature, max_completion_tokens: maxTokens,
        reasoning_effort: "low", include_reasoning: false, response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, ...messages] }),
    });
    const text = j?.choices?.[0]?.message?.content;
    if (!text) throw new ApiError("bad", `empty reply (finish: ${j?.choices?.[0]?.finish_reason})`);
    return text;
  },
  // 2.5 Flash-Lite has thinking off by default. A blocked prompt returns no candidates; thought parts are skipped.
  async gemini({ system, messages, temperature, maxTokens = 1500 }, cfg, signal) {
    const j = await post(`https://generativelanguage.googleapis.com/v1beta/models/${cfg.geminiModel || DEFAULTS.geminiModel}:generateContent`, {
      signal, headers: { "Content-Type": "application/json", "x-goog-api-key": cfg.geminiKey },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        generationConfig: { responseMimeType: "application/json", temperature, maxOutputTokens: maxTokens } }),
    });
    if (j?.promptFeedback?.blockReason) throw new ApiError("bad", `blocked: ${j.promptFeedback.blockReason}`);
    const c = j?.candidates?.[0];
    const text = (c?.content?.parts || []).filter((p) => !p.thought && p.text).map((p) => p.text).join("");
    if (!text) throw new ApiError("bad", `empty reply (finish: ${c?.finishReason})`);
    return text;
  },
};

export const keyFor = (cfg) => (cfg.provider === "groq" ? cfg.groqKey : cfg.provider === "gemini" ? cfg.geminiKey : "");
const offline = () => typeof navigator !== "undefined" && navigator.onLine === false;
// cfg.mockUntil / cfg.mockReason are set after an auth (until settings change) or rate-limit (60 s) failure.
export const isMock = (cfg) => !providers[cfg.provider] || !keyFor(cfg) || offline() || Date.now() < (cfg.mockUntil || 0);
export function mockReason(cfg) {
  if (!providers[cfg.provider] || !keyFor(cfg)) return "nokey";
  if (offline()) return "offline";
  return Date.now() < (cfg.mockUntil || 0) ? cfg.mockReason : "";
}

// onFallback(message, kind) is called whenever mock had to stand in for a real call.
export async function ask(task, ctx, cfg = DEFAULTS, onFallback = () => {}) {
  if (isMock(cfg)) return MOCK[task](ctx);
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), task === "topic" ? 20000 : cfg.timeoutMs || DEFAULTS.timeoutMs);
  try {
    let raw;
    try { raw = await providers[cfg.provider]({ system: PROMPTS[task](ctx), messages: messagesFor(task, ctx), temperature: TEMP[task] }, cfg, ctl.signal); }
    catch (e) { if (!e.salvage) throw e; raw = e.salvage; }
    try { return CLEAN[task](parseJSON(raw), ctx); } catch (e) { throw new ApiError("bad", e.message); }
  } catch (e) {
    const err = e instanceof ApiError ? e : new ApiError(e.name === "AbortError" ? "timeout" : "bad", e.message);
    if (err.kind === "auth") Object.assign(cfg, { mockUntil: Infinity, mockReason: "auth" });
    if (err.kind === "rate") Object.assign(cfg, { mockUntil: Date.now() + 60000, mockReason: "rate" });
    onFallback(plainError(err, cfg.provider), err.kind);
    return MOCK[task](ctx);
  } finally { clearTimeout(to); }
}

// Settings "Test connection": one tiny call, no fallback. Resolves { ok, message }.
export async function testConnection(cfg) {
  if (!providers[cfg.provider]) return { ok: true, message: "Mock mode needs no connection. Pick Groq or Gemini to test a key." };
  if (!keyFor(cfg)) return { ok: false, message: `Paste your ${NAMES[cfg.provider]} key first.` };
  const ctl = new AbortController(), t0 = Date.now();
  const to = setTimeout(() => ctl.abort(), 10000);
  try {
    const raw = await providers[cfg.provider]({ system: 'Reply with only this JSON: {"ok": true}', messages: [{ role: "user", content: "ping" }], temperature: 0, maxTokens: 300 }, cfg, ctl.signal);
    parseJSON(raw);
    return { ok: true, message: `Connected to ${NAMES[cfg.provider]} in ${Date.now() - t0} ms.` };
  } catch (e) {
    const err = e instanceof ApiError ? e : new ApiError(e.name === "AbortError" ? "timeout" : "bad", e.message);
    return { ok: false, kind: err.kind, message: plainError(err, cfg.provider, true) + (err.message && err.message !== err.kind ? ` (${err.message.slice(0, 120)})` : "") };
  } finally { clearTimeout(to); }
}

// ---------- robust JSON ----------
// Models wrap JSON in fences, add prose, or leave trailing commas. Throws when nothing usable is found.
export function parseJSON(raw) {
  if (raw && typeof raw === "object") return raw;
  let s = String(raw ?? "").replace(/```(?:json)?/gi, "").trim();
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a === -1 || b < a) throw new Error("no JSON object");
  s = s.slice(a, b + 1);
  try { return JSON.parse(s); } catch {}
  return JSON.parse(s.replace(/,\s*([}\]])/g, "$1").replace(/[“”]/g, '"'));
}

const clamp10 = (v) => { const n = Number(v); return Number.isFinite(n) ? Math.max(0, Math.min(10, Math.round(n))) : 0; };
const strList = (v) => (Array.isArray(v) ? v : v ? [v] : []).map(String).filter(Boolean).slice(0, 5);
const needSay = (o) => { if (typeof o.say !== "string" || !o.say.trim()) throw new Error("no say"); return o.say.trim(); };
const MOVES = ["flag", "why", "example", "flaw", "pop"];

export function normalizeJudge(o) {
  if (!o || typeof o !== "object") throw new Error("judge not an object");
  if (!["correct", "simple", "complete"].some((k) => k in o)) throw new Error("judge missing scores");
  return { correct: clamp10(o.correct), simple: clamp10(o.simple), complete: clamp10(o.complete),
    evidence: String(o.evidence || ""), gaps: strList(o.gaps), vague: strList(o.vague ?? o.hand_waved) };
}
export const meterFrom = (j) => Math.round(((j.correct + j.simple + j.complete) / 30) * 100);

const CLEAN = {
  pip: (o) => ({ say: needSay(o), move: MOVES.includes(o.move) ? o.move : "why" }),
  answer: (o) => ({ say: needSay(o) }),
  check: (o) => ({ correct: o.correct === true || o.correct === "true", say: typeof o.say === "string" ? o.say : "" }),
  judge: (o) => normalizeJudge(o),
  topic: (o, ctx) => {
    const outline = (o.outline || []).filter((x) => x && x.idea && x.explain).slice(0, 5)
      .map((x) => ({ idea: x.idea, explain: x.explain, alt: x.alt || x.explain, check: x.check || `Explain: ${x.idea}`, answer: strList(x.answer) }));
    if (outline.length < 3) throw new Error("outline too short");
    return { title: o.title || ctx.title, jargon: strList(o.jargon).slice(0, 8).map((t) => t.toLowerCase()), outline };
  },
};

// ---------- mock: scripted from the topic outline, deterministic, no key ----------
const words = (s) => (s.toLowerCase().match(/[\p{L}\p{M}]{4,}/gu) || []);
const STOP = new Set(["that", "this", "with", "from", "they", "them", "their", "there", "what", "when", "which", "into", "your", "have", "about", "does", "just", "like", "then", "than", "also", "only", "very", "much", "some", "each", "makes", "make", "used"]);
// An outline idea counts as covered when the student used 2+ of its content words (or 1 if it has few).
export function coverage(text, outline) {
  const said = new Set(words(text));
  return outline.map((o) => { const k = words(o.idea).filter((w) => !STOP.has(w)); const hit = k.filter((w) => said.has(w)).length; return hit >= Math.min(2, k.length); });
}
const P = (ctx) => PHRASES[ctx.lang || "en"] || PHRASES.en;

export const MOCK = {
  pip(ctx) {
    const p = P(ctx), n = ctx.text.trim().split(/\s+/).length;
    if (n < 6) return { say: p.lost, move: "why" };
    const cov = coverage(ctx.turns.join(" "), ctx.topic.outline);
    const order = ["why", "example", "flaw", "flag", "pop"];
    const move = order[(ctx.turns.length - 1) % order.length];
    const sentence = (ctx.text.split(/[.?!।]/).find((s) => / (is|are|can|makes|gives) /i.test(s)) || ctx.text.split(/[.?!।]/)[0]).trim().replace(/^\w/, (c) => c.toLowerCase());
    const VERB = / (is|are|can|makes|gives) /i;
    const flawed = VERB.test(sentence) ? sentence.replace(VERB, (m, v) => ` ${v} not `) : `${sentence}, but only at night`;
    const firstGap = ctx.topic.outline.find((_, i) => !cov[i]) || ctx.topic.outline.at(-1);
    const say = {
      why: p.why, example: p.example,
      flaw: p.flaw(flawed),
      flag: p.flag(firstGap.idea), pop: p.pop(firstGap.check),
    }[move];
    return { say, move };
  },
  answer(ctx) {
    const q = ctx.text.toLowerCase();
    if (/slow|again|repeat|phir|dobara|फिर/.test(q)) return { say: ctx.chunk.explain };
    if (/example|udaharan|उदाहरण|real/.test(q)) return { say: ctx.chunk.alt };
    if (/why|kyun|क्यों|how|kaise/.test(q)) return { say: `${P(ctx).goodQ} ${ctx.chunk.alt}` };
    return { say: `${P(ctx).inShort} ${ctx.chunk.idea}` };
  },
  check(ctx) {
    const a = ctx.text.toLowerCase(), keys = ctx.chunk.answer || [];
    const correct = keys.length ? keys.some((k) => a.includes(k.toLowerCase())) : a.split(/\s+/).length >= 4;
    return { correct, say: correct ? P(ctx).right : P(ctx).wrong };
  },
  judge(ctx) {
    const all = ctx.turns.map((t) => t.replace(/[^.?!।]$/, "$&.")).join(" ");
    const cov = coverage(all, ctx.topic.outline);
    const covered = cov.filter(Boolean).length;
    const sentences = all.split(/[.?!]+/).filter((s) => s.trim());
    const avgLen = sentences.length ? all.split(/\s+/).length / sentences.length : 0;
    const vague = (ctx.vague || []).slice(0, 5);
    return {
      correct: Math.min(10, 4 + covered + (/ not /i.test(all) ? 0 : 1)),
      simple: Math.max(0, Math.min(10, (avgLen <= 18 ? 9 : 6) - vague.length)),
      complete: Math.round((covered / ctx.topic.outline.length) * 10),
      evidence: (sentences.at(-1) || "").trim().slice(0, 90),
      gaps: ctx.topic.outline.filter((_, i) => !cov[i]).map((o) => o.idea).slice(0, 3),
      vague,
    };
  },
  topic: (ctx) => mockTopic(ctx.title),
};
