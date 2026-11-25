// Tutee app glue: home screen, session wiring (ASR -> turn manager -> mode -> TTS), Clarity Card, settings.
import { TOPICS, PHRASES, LANGS, mockTopic, localTopic } from "./topics.js";
import { ask as rawAsk, isMock, DEFAULTS } from "./provider.js";
import { TurnManager } from "./turn.js";
import * as tts from "./tts.js";
import { pickAsr } from "./asr/index.js";
import { Learn } from "./modes/learn.js";
import { Teach } from "./modes/teach.js";

const $ = (s) => document.querySelector(s);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
const readCfg = () => { try { return JSON.parse(store.get("tutee.cfg") || "{}"); } catch { return {}; } };
let cfg = { ...DEFAULTS, groqKey: "", geminiKey: "", headphones: false, holdOnly: false, mute: false, ...readCfg() };
if (new URLSearchParams(location.search).has("mute")) cfg.mute = true;

// sid changes on every new/ended session so late async callbacks from an old session do nothing.
const S = { sid: 0, mode: null, lang: "en", topic: null, session: null, asr: null, turn: null, waiter: null, queue: [], busy: false, resultAt: 0, last: null };
const ask = (task, ctx) => rawAsk(task, ctx, cfg, toast);
const P = () => PHRASES[S.lang];

// ---------- small UI helpers ----------
// View switch: View Transitions API when available, else a CSS slide-in (.enter). Then re-run the staggered entrance.
function show(view) {
  const swap = () => { for (const v of ["home", "session", "clarity"]) $("#" + v).hidden = v !== view; document.body.dataset.view = view; reveal($("#" + view)); };
  if (document.startViewTransition && document.body.dataset.view !== view) return void document.startViewTransition(swap);
  swap(); const el = $("#" + view); el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter");
}
const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { rootMargin: "0px 0px -5% 0px" }) : null;
function reveal(root) {
  root.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.setProperty("--i", i); el.classList.remove("in");
    io ? (io.unobserve(el), io.observe(el)) : el.classList.add("in");
  });
}
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
function countUp(el, to, ms = 700) {
  const from = Number(el.textContent) || 0, t0 = performance.now();
  cancelAnimationFrame(el._raf);
  if (reduced.matches || from === to) { el.textContent = to; return; }
  const step = (t) => { const k = Math.min(1, (t - t0) / ms); el.textContent = Math.round(from + (to - from) * (1 - (1 - k) ** 3)); if (k < 1) el._raf = requestAnimationFrame(step); };
  el._raf = requestAnimationFrame(step);
}
// Skeleton bubble while Pip waits on the model; shown at least 300 ms so it never just flashes.
async function thinking(promise) {
  const li = document.createElement("li"); li.className = "msg pip thinking"; li.setAttribute("aria-label", "Pip is thinking");
  li.append(document.createElement("i"), document.createElement("i"));
  $("#log").append(li); $("#log").scrollTop = 1e9;
  const prev = document.body.dataset.state; setState("thinking");
  try { return (await Promise.all([promise, new Promise((r) => setTimeout(r, 300))]))[0]; }
  finally { li.remove(); if (document.body.dataset.state === "thinking") setState(prev); }
}
function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("show"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 3500); }
function bubble(who, text, cls = "") {
  const li = document.createElement("li"); li.className = `msg ${who} ${cls}`.trim(); li.textContent = text;
  $("#log").append(li); $("#log").scrollTop = 1e9; return li;
}
function setMeter(v) {
  const n = Math.max(0, Math.min(100, Math.round(v)));
  $("#meterFill").style.transform = `scaleX(${n / 100})`; countUp($("#meterNum"), n); $("#meter").setAttribute("aria-valuenow", n);
}
const STATUS = {
  idle: "", thinking: "Pip is thinking…",
  listening: "Listening… talk any time, or type below",
  speaking: "Pip is speaking — talk or press Space to cut in",
};
function setState(s) { document.body.dataset.state = s; $("#status").textContent = STATUS[s]; }
function updateMockNotice() { $("#mockNotice").hidden = !isMock(cfg); }

// ---------- mic ----------
function micOn() { if (S.asr?.continuous && !cfg.holdOnly) S.asr.start(); }
function micOff() { S.asr?.stop(); }
function micNote(t) { $("#micText").textContent = t; $("#micNote").hidden = !t; }

// ---------- speaking + barge-in ----------
async function say(text, kind = "", cls = kind) {
  const sid = S.sid;
  // Learn chunks: consecutive sentences of one chunk share a bubble, so the explanation reads as a paragraph.
  const key = `${kind}:${S.session?.idx}`;
  if (["chunk", "reexplain"].includes(kind) && S.last?.key === key) S.last.el.textContent += " " + text;
  else S.last = { key, el: bubble("pip", text, cls) };
  setState("speaking");
  if (!cfg.headphones) micOff(); // speakers: no echo cancel for our own TTS, so Pip would hear itself
  const finished = await tts.speak(text, LANGS[S.lang].tts, cfg.mute);
  if (sid !== S.sid) return false;
  setState("listening"); micOn();
  return finished;
}
function bargeIn() {
  if (!tts.speaking()) return;
  tts.cancel(); bubble("sys", "you cut in"); S.last = null; micOn();
}

// ---------- turn handling ----------
function onAsr(r) {
  S.resultAt = performance.now();
  if (tts.speaking() && (r.final || r.interim).trim()) bargeIn(); // only reachable with headphones on
  S.turn.result(r);
}
function onInterim(text) {
  $("#live").textContent = text;
  if (S.mode === "teach" && !S.busy) tryBuzz(text);
}
function tryBuzz(text) {
  const b = S.session.buzz(text);
  if (!b) return false;
  const ms = Math.round(performance.now() - (S.resultAt || performance.now()));
  S.turn.reset(); $("#live").textContent = "";
  bubble("you", text);
  markChip(b.term);
  $("#latency").textContent = `buzz in ${ms} ms`;
  S.busy = true;
  say(b.say, "buzz").then(() => { S.busy = false; drain(); });
  return true;
}
const markChip = (term) => document.querySelector(`.chip[data-term="${CSS.escape(term)}"]`)?.classList.add("hit");
function onTurn(text) {
  $("#live").textContent = ""; $("#heardNote").hidden = true;
  bubble("you", text); S.last = null;
  if (S.mode === "learn") {
    if (tts.speaking()) tts.cancel(); // a finished turn while Pip talks is a cut-in
    if (S.waiter) S.waiter(text); else S.queue.push(text);
  } else { S.queue.push(text); drain(); }
}
function onGarbled(text) {
  $("#live").textContent = "";
  say(P().didntCatch, "sys-pip");
  $("#say").value = text; $("#heardNote").hidden = false; $("#say").focus();
}

// Teach: one turn at a time; Pip and the judge run in parallel inside Teach.turn.
async function drain() {
  if (S.mode !== "teach" || S.busy || !S.queue.length) return;
  const sid = S.sid, text = S.queue.shift();
  S.busy = true;
  const t0 = performance.now();
  const r = await thinking(S.session.turn(text));
  if (sid !== S.sid) return;
  $("#latency").textContent = `${Math.round(performance.now() - t0)} ms to reply`;
  setMeter(r.meter);
  if (r.pip.term) markChip(r.pip.term);
  const j = r.judge;
  $("#judgeLine").hidden = false;
  $("#judgeLine").textContent = `Judge: correct ${j.correct}/10 · simple ${j.simple}/10 · complete ${j.complete}/10${j.gaps[0] ? ` · gap: ${j.gaps[0]}` : ""}`;
  await say(r.pip.say, r.pip.move === "buzz" ? "buzz" : r.pip.move);
  S.busy = false; drain();
}

// Learn talks to the page through this io object (see modes/learn.js).
const learnIo = {
  say: (text, kind) => say(text, kind, kind === "check" ? "check" : ""),
  progress: (i, n) => setMeter((i / n) * 100),
  listen(ms) {
    if (S.queue.length) return Promise.resolve(S.queue.shift());
    setState("listening"); micOn();
    return new Promise((res) => {
      let t;
      const finish = (v) => { S.waiter = null; clearTimeout(t); res(v); };
      // Don't time out while the student is mid-sentence or holding the talk button.
      const arm = (d) => (t = setTimeout(() => (S.turn?.text || S.turn?.holding ? arm(400) : finish(null)), d));
      S.waiter = finish; arm(ms);
    });
  },
};

// ---------- topics ----------
function renderTopics() {
  const lang = document.querySelector("input[name=lang]:checked")?.value || "en";
  const was = document.querySelector("input[name=topic]:checked")?.value;
  $("#topicOptions").replaceChildren(...Object.keys(TOPICS).map((k, i) => {
    const l = document.createElement("label"); l.className = "pill";
    l.innerHTML = `<input type="radio" name="topic" value="${k}" ${(was ? k === was : !i) ? "checked" : ""}> `;
    l.append(localTopic(k, lang).title); return l;
  }));
}
async function resolveTopic(lang) {
  const typed = $("#customTopic").value.trim();
  if (!typed) return localTopic(document.querySelector("input[name=topic]:checked").value, lang);
  if (TOPICS[typed.toLowerCase()]) return localTopic(typed.toLowerCase(), lang);
  if (isMock(cfg)) return mockTopic(typed);
  const k = `tutee.topic.${lang}.${typed.toLowerCase()}`;
  try { const c = JSON.parse(store.get(k)); if (c?.outline) return c; } catch {}
  toast(`Preparing "${typed}"…`);
  const t = await ask("topic", { title: typed, lang });
  if (!t.mock) store.set(k, JSON.stringify(t)); // only cache real LLM output
  return t;
}

// ---------- session ----------
async function start(mode) {
  const lang = document.querySelector("input[name=lang]:checked").value;
  const btns = [$("#startLearn"), $("#startTeach")]; btns.forEach((b) => (b.disabled = true));
  const topic = await resolveTopic(lang).finally(() => btns.forEach((b) => (b.disabled = false)));
  const sid = ++S.sid;
  Object.assign(S, { mode, lang, topic, queue: [], busy: false, waiter: null, last: null });
  document.documentElement.lang = lang === "hi" ? "hi" : "en";
  $("#log").replaceChildren(); $("#live").textContent = ""; $("#heardNote").hidden = true; $("#judgeLine").hidden = true;
  $("#sessionTitle").textContent = `${mode === "learn" ? "Learn" : "Teach"}: ${topic.title}`;
  $("#meterLabel").textContent = mode === "learn" ? "Progress" : "Understanding";
  $("#latency").textContent = "no replies yet"; setMeter(0);
  $("#chips").hidden = mode !== "teach";
  $("#chips").replaceChildren(...topic.jargon.map((t) => { const c = document.createElement("span"); c.className = "chip"; c.dataset.term = t.toLowerCase(); c.textContent = t; return c; }));
  micNote("");
  S.turn = new TurnManager({ interim: onInterim, turn: onTurn, garbled: onGarbled });
  S.asr = pickAsr({ lang: LANGS[lang].asr, groqKey: cfg.groqKey, onResult: onAsr, onError: asrError });
  if (!S.asr) micNote("This browser has no speech recognition. Use Chrome or Edge (or add a Groq key for Whisper), or type below.");
  else if (!S.asr.continuous) micNote("Hold the talk button while you speak (Whisper mode).");
  show("session");
  if (mode === "learn") {
    S.session = new Learn({ topic, lang, ask: (t, c) => thinking(ask(t, c)), io: learnIo });
    S.session.run().then((card) => { if (sid === S.sid) finish(card); });
  } else {
    S.session = new Teach({ topic, lang, ask });
    await say(S.session.opening(), "opening");
  }
}
function asrError(code) {
  if (code === "blocked") { S.asr = null; micNote("Mic is blocked. Allow it from the address bar, or type below."); }
  else toast("Speech service unreachable. Type below, or check your network.");
}
function stopSession() {
  S.sid++; tts.cancel(); micOff(); S.turn?.reset(); setState("idle");
  if (S.mode === "learn") { S.session.stop(); S.waiter?.(null); }
}
function finish(card) {
  stopSession();
  $("#cardSub").textContent = `${card.title} · ${card.mode === "learn" ? "Learn" : "Teach"}`;
  $("#cardScore").textContent = "0";
  const li = (t) => { const e = document.createElement("li"); e.textContent = t; return e; };
  $("#cardWell").replaceChildren(...card.well.map(li));
  $("#cardWeak").replaceChildren(...card.weak.map(li));
  $("#cardPops").replaceChildren(...card.pops.map(li));
  show("clarity");
  setTimeout(() => countUp($("#cardScore"), card.score, 900), 250);
}

// ---------- settings ----------
function openSettings() {
  for (const k of ["provider", "groqKey", "geminiKey"]) $("#" + k).value = cfg[k] || "";
  for (const k of ["headphones", "holdOnly", "mute"]) $("#" + k).checked = !!cfg[k];
  $("#settings").classList.remove("closing");
  $("#settings").showModal();
}
// Drawer slides out before the dialog actually closes.
function closeSettings(value) {
  const d = $("#settings"); if (d.classList.contains("closing")) return;
  d.classList.add("closing");
  setTimeout(() => { d.close(value); d.classList.remove("closing"); }, reduced.matches ? 150 : 250);
}
$("#settings form").addEventListener("submit", (e) => { e.preventDefault(); closeSettings(e.submitter?.value || "cancel"); });
$("#settings").addEventListener("cancel", (e) => { e.preventDefault(); closeSettings("cancel"); });
$("#settings").addEventListener("click", (e) => { if (e.target === e.currentTarget) closeSettings("cancel"); }); // backdrop click
$("#settings").addEventListener("close", () => {
  if ($("#settings").returnValue !== "save") return;
  for (const k of ["provider", "groqKey", "geminiKey"]) cfg[k] = $("#" + k).value.trim();
  for (const k of ["headphones", "holdOnly", "mute"]) cfg[k] = $("#" + k).checked;
  const { provider, groqKey, geminiKey, headphones, holdOnly, mute } = cfg;
  store.set("tutee.cfg", JSON.stringify({ provider, groqKey, geminiKey, headphones, holdOnly, mute }));
  updateMockNotice(); toast(isMock(cfg) ? "Saved. Mock mode (no key for this provider)." : `Saved. Using ${cfg.provider}.`);
});

// ---------- wiring ----------
renderTopics(); updateMockNotice(); show("home"); setState("idle");
document.querySelectorAll("input[name=lang]").forEach((r) => r.addEventListener("change", renderTopics));
document.querySelector("[data-open-settings]").onclick = openSettings;
$("#typeInstead").onclick = () => $("#say").focus();
if (typeof speechSynthesis !== "undefined") speechSynthesis.getVoices(); // voices load lazily
$("#openSettings").onclick = openSettings;
$("#startLearn").onclick = () => start("learn");
$("#startTeach").onclick = () => start("teach");
$("#end").onclick = () => S.session && finish(S.session.card());
$("#backHome").onclick = () => show("home");
$("#cut").onclick = bargeIn;
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && e.target === document.body && S.mode && !$("#session").hidden) { e.preventDefault(); bargeIn(); }
});
$("#typed").onsubmit = (e) => {
  e.preventDefault();
  const t = $("#say").value.trim(); if (!t || !S.session) return;
  $("#say").value = ""; $("#heardNote").hidden = true;
  bargeIn();
  onTurn(t);
};
const hold = $("#hold");
hold.addEventListener("pointerdown", (e) => {
  e.preventDefault(); if (!S.turn) return;
  bargeIn(); hold.classList.add("held"); hold.setPointerCapture(e.pointerId);
  S.turn.hold(true); S.asr?.start();
});
const release = () => {
  if (!hold.classList.contains("held")) return;
  hold.classList.remove("held");
  S.turn.hold(false); // releasing ends the turn now, no 1.1 s wait
  if (cfg.holdOnly || !S.asr?.continuous) S.asr?.stop();
};
hold.addEventListener("pointerup", release);
hold.addEventListener("pointercancel", release);
