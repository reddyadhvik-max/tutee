# Tutee

Tutee is a study app you use by talking. Pip, the study partner, has two modes:

- **Learn.** Pip teaches you a topic out loud in short chunks. Cut in any time by talking ("wait, why?", "give me an example") and Pip stops, answers, then carries on from where it was. Every few chunks it asks a quick check question.
- **Teach.** You explain the topic to Pip. If you use a big word without explaining it, Pip buzzes and asks what it means. When you stop, Pip asks "but why?", wants an example, or repeats your idea back with a mistake for you to catch.

A separate judge scores each turn and moves the Understanding meter. At the end you get a Clarity Card: what went well, where you were vague, and three questions to try again later. It works in English, Hindi and Hinglish.

## Run it locally

```
cd phase-2/app
python3 -m http.server 8767
```

Open http://localhost:8767 in Chrome or Edge. With no key, Pip runs in mock mode using scripted replies, so you can try the whole flow straight away. Add `?mute` to the URL if you want Pip's text without its voice.

Self-checks: `node check.js`

## Free keys (no card needed)

- **Groq:** go to console.groq.com, sign in with Google or GitHub, open API Keys and create one. It starts with `gsk_`. If a page ever asks for a card, skip it and use Gemini.
- **Gemini:** go to aistudio.google.com and click Get API key. The free tier needs no billing. Google may use free-tier prompts to improve its products, so don't type in anything private.

Paste the key into Settings (the gear, top right) and pick the provider.

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

## Built by voice

Tutee was built by voice for the Wispr Flow "India Runs on Voice" hackathon: the prompts and the writing were dictated with Wispr Flow rather than typed.
