// Language data, Pip's fixed lines and topic helpers. Topic content comes from the pack named in config.js.
import { CONFIG } from "./config.js";

// Throws a plain message naming the first broken field, so a bad pack fails loudly at load time.
export function validatePack(p) {
  const need = (ok, what) => { if (!ok) throw new Error(`topic pack ${p?.id || "?"}: ${what}`); };
  need(p && typeof p.id === "string" && p.name && p.audience, "needs id, name and audience");
  const check = (t, where) => {
    need(t?.title && Array.isArray(t.jargon) && t.jargon.length >= 1, `${where} needs title and jargon[]`);
    need(Array.isArray(t.outline) && t.outline.length >= 3, `${where} needs 3+ outline ideas`);
    t.outline.forEach((o, i) => need(o.idea && o.explain && o.alt && o.check && Array.isArray(o.answer), `${where} idea ${i + 1} needs idea, explain, alt, check, answer[]`));
  };
  const keys = Object.keys(p.topics || {});
  need(keys.length, "needs at least one topic");
  for (const k of keys) {
    check(p.topics[k], k);
    for (const [lang, t] of Object.entries(p.i18n?.[k] || {})) check({ ...p.topics[k], ...t }, `${k}/${lang}`);
  }
  return p;
}

export const PACK = validatePack(CONFIG.pack);
export const TOPICS = PACK.topics;
export const TOPIC_I18N = PACK.i18n || {};

// The demo topic in the picked language (falls back to English).
export const localTopic = (key, lang) => ({ ...TOPICS[key], ...(TOPIC_I18N[key]?.[lang] || {}) });

// No key + unknown topic: a generic outline so the whole flow still runs.
export function mockTopic(title) {
  const t = title.trim();
  const ideas = [
    ["What it is", `Let's start with what ${t} actually is. Think of it in one plain sentence before any big words.`, `Another way to see ${t}: imagine explaining it to a ten-year-old using one picture.`],
    ["Its main parts", `Next, ${t} has a few main parts. Each part has its own job, and together they make the whole thing work.`, `Picture ${t} as a team: every player has a role.`],
    ["How it works", `Now, how does ${t} work, step by step? One thing leads to the next, like dominoes.`, `Think of ${t} as a recipe: first this, then that.`],
    ["A real-life example", `You can see ${t} around you in daily life. Spotting it at home makes it easier to remember.`, `Try to find ${t} in your kitchen, your street or your phone.`],
    ["Why it matters", `Finally, ${t} matters because it explains things we see every day and shows up in exams.`, `If ${t} vanished tomorrow, what would change? That is why it matters.`],
  ];
  return {
    title: t, mock: true,
    jargon: [t.toLowerCase()],
    outline: ideas.map(([idea, explain, alt]) => ({ idea: `${t}: ${idea.toLowerCase()}`, explain, alt, check: `Can you tell me ${idea.toLowerCase()} of ${t}?`, answer: [] })),
  };
}

// Pip's fixed lines, per picked language.
export const LANGS = {
  en: { label: "English", asr: "en-IN", tts: "en-IN", llm: "English" },
  hi: { label: "Hindi", asr: "hi-IN", tts: "hi-IN", llm: "Hindi in Devanagari script" },
  // Hinglish: en-IN ASR returns Roman script, which the model and en-IN voice both handle better than mixed scripts.
  hinglish: { label: "Hinglish", asr: "en-IN", tts: "en-IN", llm: "Hinglish (Hindi and English mixed, in Roman script), the same mix the student uses" },
};

export const PHRASES = {
  en: {
    teachMe: "Okay, teach me!", carryOn: "Shall I carry on?", didntCatch: "Sorry, I didn't catch that, can you say it again?",
    buzz: (t) => `Wait, wait! What does "${t}" mean?`, lost: "Hmm, I'm lost. Can you say a bit more?",
    learnIntro: (t) => `Let's learn ${t} together. Cut in any time by talking.`, checkIntro: "Quick check.",
    right: "Yes, that's right!", wrong: "Not quite. Let me explain that part another way.",
    moveOn: "Okay, let's keep going.", done: (t) => `That's the whole of ${t}. Nicely done!`,
    why: "But why does that happen? I don't get the why yet.", example: "Can you give me a real-life example, like something at home?",
    flaw: (s) => `Okay, so ${s}? Did I get that right?`, pop: (q) => `Pop question! ${q}`, flag: (i) => `Wait, I think a step is missing. What about this: ${i}`,
    ack: "Oh, I think I get it. What comes next?", goodQ: "Good question.", inShort: "Here it is in short:",
  },
  hi: {
    teachMe: "ठीक है, मुझे सिखाओ!", carryOn: "क्या मैं आगे बढ़ूँ?", didntCatch: "माफ़ करना, मैं समझ नहीं पाया, फिर से बोलोगे?",
    buzz: (t) => `रुको, रुको! "${t}" का मतलब क्या है?`, lost: "हम्म, मैं उलझ गया। थोड़ा और बताओ?",
    learnIntro: (t) => `चलो ${t} साथ में सीखते हैं। जब चाहो बोलकर रोक सकते हो।`, checkIntro: "एक छोटा सवाल।",
    right: "हाँ, बिल्कुल सही!", wrong: "पूरा सही नहीं। मैं इसे दूसरे तरीके से समझाता हूँ।",
    moveOn: "ठीक है, आगे चलते हैं।", done: (t) => `${t} पूरा हो गया। बहुत बढ़िया!`,
    why: "पर ऐसा क्यों होता है? मुझे वजह समझ नहीं आई।", example: "कोई असली ज़िंदगी का उदाहरण दो, जैसे घर में?",
    flaw: (s) => `अच्छा, तो ${s}? मैंने सही समझा?`, pop: (q) => `पॉप सवाल! ${q}`, flag: (i) => `रुको, एक कदम छूट गया लगता है: ${i}`,
    ack: "ओह, समझ गया। आगे क्या होता है?", goodQ: "अच्छा सवाल।", inShort: "छोटे में कहूँ तो:",
  },
  hinglish: {
    teachMe: "Okay, mujhe sikhao!", carryOn: "Shall I carry on? Aage badhun?", didntCatch: "Sorry, samajh nahi aaya, ek baar phir bolo?",
    buzz: (t) => `Ruko ruko! "${t}" ka matlab kya hai?`, lost: "Hmm, main lost ho gaya. Thoda aur batao?",
    learnIntro: (t) => `Chalo ${t} saath mein seekhte hain. Kabhi bhi bol ke rok sakte ho.`, checkIntro: "Quick check.",
    right: "Haan, bilkul sahi!", wrong: "Not quite. Main ise doosre tareeke se samjhata hoon.",
    moveOn: "Okay, aage chalte hain.", done: (t) => `${t} poora ho gaya. Bahut badhiya!`,
    why: "Par aisa kyun hota hai? Why samajh nahi aaya.", example: "Ek real-life example do na, jaise ghar mein?",
    flaw: (s) => `Achha, toh ${s}? Sahi samjha maine?`, pop: (q) => `Pop question! ${q}`, flag: (i) => `Ruko, ek step miss ho gaya lagta hai: ${i}`,
    ack: "Oh, samajh gaya. Aage kya hota hai?", goodQ: "Achha sawaal.", inShort: "Short mein:",
  },
};
