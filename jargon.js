// Jargon buzzer: pure function, runs on every interim transcript (local, no LLM call).
// A term counts as explained when one of these cues follows it closely in the same utterance.
const EXPLAIN_CUES = /^\W*(?:\w+\W+){0,3}?(means|is like|is basically|is when|is where|is a|is an|is the|are|refers to|which is|that is|i\.e\.|like a|kind of like|matlab|yaani|यानी|मतलब)/i;

// terms: the topic's jargon list; handled: Set of terms already buzzed or explained (mutated).
// Mid-sentence (final=false) a term is judged only once 4 words follow it, so "X means..." gets its chance.
export function findUnexplained(text, terms, handled, final = false) {
  const t = text.toLowerCase();
  for (const term of terms || []) {
    const k = term.toLowerCase();
    if (handled.has(k)) continue;
    const i = wordIndex(t, k);
    if (i === -1) continue;
    const after = t.slice(i + k.length, i + k.length + 60);
    if (EXPLAIN_CUES.test(after)) { handled.add(k); continue; }
    if (!final && after.trim().split(/\s+/).filter(Boolean).length < 4) continue;
    return k;
  }
  return null;
}

// indexOf on whole words only, so "action" doesn't match inside "reaction".
function wordIndex(t, k) {
  for (let i = t.indexOf(k); i !== -1; i = t.indexOf(k, i + 1)) {
    const j = i + k.length + (t[i + k.length] === "s" ? 1 : 0); // allow a plural "s"
    if (!/[\p{L}\p{M}]/u.test(t[i - 1] || "") && !/[\p{L}\p{M}]/u.test(t[j] || "")) return i;
  }
  return -1;
}
