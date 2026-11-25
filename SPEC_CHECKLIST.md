# Spec checklist

Every promise in the submitted prompt (`scaler-wispr-flow/phase-1/PROMPT_FORM.txt`), where it lives, and how it was checked for v1.0.

How each item was verified:
- **check.js**: covered by an assertion in `node check.js`.
- **browser**: run end to end in Chrome via agent-browser in mock mode (25 Nov 2026). Speech was simulated by an init script that replaces `SpeechRecognition` with a fake one, so interim results, confidence and timing were real inputs to the app.
- **untested-needs-mic** / **untested-needs-key** / **untested-needs-phone**: needs a real microphone, a real API key or a real Android phone. Not done yet.

## Platform

- [x] Free tools only, no card. Mock mode needs no key; Groq and Gemini free keys go in Settings. Where: `provider.js`, README "Free keys". Verified: browser (test connection against the real endpoints with a dummy key returned plain 401/400 errors; no signup).
- [x] Static site, plain HTML and JS, no build step, GitHub Pages ready. Where: `index.html` + ES modules. Verified: browser via `python3 -m http.server`.
- [ ] Works on a cheap Android phone in Chrome. Layout checked at 360 px (`shots/*-360.png`). Verified: browser at 360 px; **untested-needs-phone**.

## Home screen

- [x] Language picker: English, Hindi, Hinglish. Where: `index.html` `.lang-picker`, `topics.js` `LANGS`, default from `config.js` `defaultLang`. Verified: browser.
- [x] Type a topic. Where: `#customTopic`, `app.js` `resolveTopic`. Unknown topics use an LLM outline (cached per language) or a generic mock outline. Verified: check.js (mock topic) + browser ("black holes").
- [x] Say a topic. Where: `#sayTopic`, `app.js` `sayTopic` (one Web Speech phrase in the picked language). Verified: browser (fake speech); **untested-needs-mic**.
- [x] One big button per mode: Learn, Teach. Where: `#startLearn` / `#startTeach`, hideable with `config.features`. Verified: browser.

## Learn mode

- [x] Pip explains in chunks of 2-3 sentences, text on screen. Where: `modes/learn.js` `explain` (sentence by sentence into one bubble). Verified: check.js + browser.
- [x] Pauses about 2 s after each chunk; silence means go on. Where: `LEARN.pauseMs = 2000`, `io.listen`. Verified: check.js + browser.
- [x] Cut in any time by talking: Pip stops at once, listens, answers, asks "Shall I carry on?", resumes from the same point. Where: `app.js` `onAsr` → `bargeIn`, `learn.js` `cutIn`/`answer`; resume is per sentence. Verified: check.js (resumes from the same sentence) + browser (fake speech, headphones on). Real voice: **untested-needs-mic**. With speakers the mic is off while Pip talks (no echo cancel for our own TTS), so cut in with Space, the Cut in button or Hold to talk; turn on "Headphones" in Settings to cut in by voice.
- [x] A check question every few chunks (every 3rd chunk and the last). A wrong answer gets a different explanation (`alt`). Where: `learn.js` `check`, `LEARN.checkEvery`. Verified: check.js + browser (one-word answer "stomata" accepted).

## Teach mode

- [x] Pip says "Okay, teach me" and listens. Where: `PHRASES.*.teachMe`, `teach.js` `opening`. Verified: check.js + browser.
- [x] Jargon check on the live interim transcript; an unexplained term buzzes mid-sentence. Where: `jargon.js` `findUnexplained` (local, no LLM call), `app.js` `onInterim` → `tryBuzz`. Verified: check.js (under 1 ms per check) + browser ("buzz in 8 ms" from the interim result to the buzz).
- [x] About 1 s of silence ends the turn (1.1 s). Where: `turn.js` `TURN.silenceMs`, `decideTurn`. Verified: check.js.
- [x] One move only per turn: flag a wrong/missing step, "but why?", ask for an example, repeat back with a planted mistake, or a pop question. Where: `provider.js` `PROMPTS.pip`, `CLEAN.pip` (move whitelist), `MOCK.pip`. Verified: check.js (4 different moves in 4 turns).
- [x] Pip's replies are two sentences at most. Where: `teach.js` `firstSentences(pip.say, 2)` trims whatever the model says. Verified: check.js.

## Scoring

- [x] Separate judge prompt with a fixed rubric (correct, simple, complete), temperature 0. Where: `PROMPTS.judge`, `TEMP.judge = 0`, `normalizeJudge`. Runs in parallel with Pip. `config.features.judge = false` swaps it for local scoring. Verified: check.js (JSON parsing, clamping, flag off).
- [x] Understanding meter moves after every turn; Pip never grades itself. Where: `app.js` `drain` → `setMeter`. Verified: browser.
- [x] Clarity Card: what went well, where vague or wrong, three pop questions to retry. Where: `modes/card.js`. Verified: check.js + browser (360/768/1440 shots).

## Speech

- [x] Web Speech API with interim results, language from the picker (en-IN or hi-IN). Where: `asr/webspeech.js`, `LANGS.*.asr`. Verified: browser (recognizer started with `hi-IN` after picking Hindi).
- [ ] Browser speech synthesis for Pip's voice. Where: `tts.js` (en-IN / hi-IN voice, `?mute` for text only). Verified: **untested-needs-mic** (tests ran muted; audio not listened to).
- [x] All model calls go through one provider function: Groq, Gemini, mock. Where: `provider.js` `ask`. Verified: check.js (request shapes for both, stubbed fetch) + browser (real endpoints, dummy keys). Real replies: **untested-needs-key**.
- [x] Groq Whisper fallback when the browser has no Web Speech (hold to talk). Where: `asr/groq-whisper.js`, `config.features.whisper`. Verified: **untested-needs-key**.

## When things go wrong

- [x] Low confidence or garbled transcript: "Sorry, I didn't catch that, can you say it again?" and the heard text is put in the box to correct. Where: `turn.js` `isGarbled` (confidence < 0.4 or no letters), `app.js` `onGarbled`. Verified: check.js + browser (confidence 0.2).
- [x] Background noise: speech under 1 s is ignored. Where: `decideTurn` (under 1 s and one word), `isCutIn` in `app.js` (a lone "um" doesn't stop Pip), Whisper drops clips under ~1 s. One-word answers are kept when Pip has just asked a question (`allowShort`). Verified: check.js + browser.
- [x] Hold-to-talk button as a fallback, on Web Speech too; "Noisy room" setting listens only while held. Where: `#hold`, `TurnManager.hold`. Verified: browser (mic opens on press, turn held past the silence window, ends on release, mic closes).
- [x] Hinglish and mixed scripts: transcript sent as is, model told to reply in the same mix. Where: `provider.js` `langLine`. Verified: check.js (line present in the prompt). Model behaviour: **untested-needs-key**.
- [x] Mic blocked or no speech support: clear message, fall back to typing. Where: `app.js` `asrError`, `start` (micNote). Verified: browser (both: `not-allowed` error and a browser with no SpeechRecognition).
- [x] No network or no key: mock mode, said on screen. Also a bad key (401, or Gemini's 400 "API key not valid"), rate limit (429), timeout, 5xx and unreadable replies fall back to mock with a plain message. Where: `provider.js` `ApiError`/`plainError`/`ask`, `app.js` `updateMockNotice`. Verified: check.js (every error kind) + browser (no key, offline, and a real 401 from Groq).

## Done means

- [x] Jargon buzz fires in under half a second. check.js: under 1 ms per check. Browser: 8 ms from interim result to buzz. Real mic latency also depends on how fast Chrome sends interim results: **untested-needs-mic**.
- [x] Talking over Pip stops it at once in both modes. Browser: yes, with fake speech and headphones on. **untested-needs-mic** with a real voice.
- [x] The whole flow runs end to end without a key. Browser: Learn, Teach, Clarity Card, Hindi and Hinglish in mock mode, online and offline.

## Added in v1.0 (not in the prompt)

- [x] `config.js` + `topics/*.js` packs for reuse. Verified: check.js (every pack validates) + browser (swapped to the civic pack with another name, persona, accent and Teach hidden; no logic changed).
- [x] Settings "Test connection". Verified: check.js + browser.
- [x] Offline: manifest + service worker caching the static files, never API calls. Verified: check.js (file list, no cross-origin) + browser (loaded offline, cache holds 21 same-origin files only).
