# Tutee

Tutee is a study app you use by talking. Pip, the study partner, has two modes:

- **Learn.** Pip teaches you a topic out loud in short chunks. Cut in any time by talking ("wait, why?", "give me an example") and Pip stops, answers, then carries on from where it was. Every few chunks it asks a quick check question.
- **Teach.** You explain the topic to Pip. If you use a big word without explaining it, Pip buzzes and asks what it means. When you stop, Pip asks "but why?", wants an example, or repeats your idea back with a mistake for you to catch.

A separate judge scores each turn and moves the Understanding meter. At the end you get a Clarity Card: what went well, where you were vague, and three questions to try again later. It works in English, Hindi and Hinglish.

## Run it locally

```
cd tutee
python3 -m http.server 8767
```

Open http://localhost:8767 in Chrome or Edge. With no key, Pip runs in mock mode using scripted replies, so you can try the whole flow straight away. Add `?mute` to the URL if you want Pip's text without its voice.

Self-checks: `node check.js` (no dependencies). `SPEC_CHECKLIST.md` lists every promised behaviour, where it lives and how it was checked.

Once loaded, the app also works offline in mock mode: a small service worker (`sw.js`) caches the static files. It never caches API calls. On Android Chrome you can "Add to Home screen" (`manifest.webmanifest`).

## Free keys (no card needed)

- **Groq:** go to console.groq.com, sign in with Google or GitHub, open API Keys and create one. It starts with `gsk_`. If a page ever asks for a card, skip it and use Gemini.
- **Gemini:** go to aistudio.google.com and click Get API key. The free tier needs no billing. Google may use free-tier prompts to improve its products, so don't type in anything private.

Paste the key into Settings (the gear, top right), pick the provider and press **Test connection**. It makes one tiny call and says "Connected" or what went wrong (bad key, free limit reached, no network). If a key stops working mid-session, Tutee switches to mock mode, says why on screen and carries on; save a new key to try again.

## The free stack and its limits

These numbers were checked on 22 Nov 2026. Groq's console page is the final word for your own account.

| Part | What we use | Free limit |
|---|---|---|
| Hosting | GitHub Pages | free for public repos |
| Speech to text | Web Speech API in the browser | free, no key, Chrome/Edge only |
| Speech to text backup | Groq whisper-large-v3-turbo | 20 requests/min, 2,000/day, 7,200 audio seconds/hour |
| Pip and the judge | Groq openai/gpt-oss-20b | 30 requests/min, 1,000/day, 8K tokens/min, 200K tokens/day |
| Backup model | Gemini 2.5 Flash-Lite | free tier, no billing; limits shown per project in AI Studio |
| Pip's voice | the browser's speechSynthesis | free, voice depends on the device |
| No key or no network | built-in mock | unlimited, runs offline |

Each student turn makes two model calls (Pip plus the judge), about 600 tokens, so Groq's free tier covers roughly 500 turns a day.

## Browser support

- **Chrome and Edge** (desktop and Android): full voice, with live transcripts, cut-in and the jargon buzz.
- **Firefox and Safari** have no Web Speech recognition. With a Groq key, Tutee switches to Whisper and you hold the talk button while speaking. Without a key, you type.
- If the mic is blocked, Tutee says so and you can type instead.

## Privacy

Your keys, settings and saved topics stay in your browser (localStorage). There is no Tutee server. Your words go only to the provider you pick (Groq or Gemini), and in Chrome the speech recognition audio goes to the browser's own speech service. Nothing goes anywhere in mock mode.

## How to reuse for another event

Everything event-specific is in two places, so you don't touch any logic file:

1. **`config.js`**: app name, tagline, persona name (`Pip`), who the persona plays (`learnerRole`, `tutorRole`), default language, feature flags (`learn`, `teach`, `judge`, `whisper`) and colour overrides for the CSS tokens in `style.css` (`--accent`, `--bg`, `--ink`, ...; keep STYLE.md's no orange/amber/yellow rule).
2. **A topic pack in `topics/`**: copy `topics/science.js` (or the small `topics/civic.js`) to e.g. `topics/health.js`, set `id`, `name`, `audience` (goes into the prompt that builds outlines for typed topics) and your topics. Each topic needs a title, a jargon list (what the buzzer listens for) and 3 to 5 outline ideas with `idea`, `explain`, `alt`, `check` and `answer` keywords. Hindi/Hinglish versions under `i18n` are optional; missing ones fall back to English. Then change the one import line at the top of `config.js`.

Then:
- `node check.js` validates every pack in `topics/` and tells you which field is missing.
- If you add a new `.js` file, add it to `FILES` in `sw.js` (check.js fails if you forget) and bump `VERSION`.
- Rename by hand: `<title>`/`name` in `index.html` and `manifest.webmanifest` (the app sets the visible name from config at load, but the manifest and first paint use these), `icon.svg` if you want a new icon, and this README.
- Pip's fixed spoken lines (per language) are `PHRASES` in `topics.js`. They avoid the persona's name, so they work for any persona; edit them if your event needs a different tone.
- The hero line "What are we studying?" and the mode descriptions are in `index.html`. Any "Pip" in the HTML is swapped for your persona name at load.

| File | What it does |
|---|---|
| `config.js` | event settings + which topic pack |
| `topics/*.js` | topic packs |
| `topics.js` | languages, Pip's fixed lines, pack validation |
| `provider.js` | prompts, Groq/Gemini/mock calls, error handling, test connection |
| `turn.js` | end of turn, noise filter, garbled detection |
| `jargon.js` | the local jargon buzzer |
| `modes/learn.js`, `modes/teach.js`, `modes/card.js` | the two modes and the Clarity Card |
| `asr/` | Web Speech and Groq Whisper adapters |
| `tts.js` | Pip's voice |
| `app.js` | UI glue |
| `sw.js`, `manifest.webmanifest` | offline cache and install |

## Built by voice

Tutee was built by voice for the Wispr Flow "India Runs on Voice" hackathon: the prompts and the writing were dictated with Wispr Flow rather than typed.
