// Everything event-specific lives here. To reuse Tutee for another event: edit this file and point `pack` at
// your own topics/*.js file. No logic file needs to change. See README "How to reuse for another event".
import pack from "./topics/science.js";

export const CONFIG = {
  appName: "Tutee",
  tagline: "learn out loud with Pip",
  persona: "Pip", // the study partner's name: used in the UI, prompts and spoken lines
  learnerRole: "a curious 10-year-old", // who Pip pretends to be in Teach mode
  tutorRole: "a friendly tutor", // who Pip is in Learn mode
  defaultLang: "en", // en | hi | hinglish
  features: {
    learn: true, // show the Learn mode button
    teach: true, // show the Teach mode button
    judge: true, // separate LLM judge call per Teach turn; false = local keyword scoring (half the tokens)
    whisper: true, // Groq Whisper fallback when the browser has no Web Speech (needs a Groq key)
  },
  // CSS colour tokens from style.css (--bg --card --ink --accent --on-accent --err --muted --line --soft).
  // Override any of them per scheme, e.g. light: { "--accent": "#1D4ED8" }. Keep STYLE.md: no orange/amber/yellow.
  theme: { light: {}, dark: {} },
  pack,
};
