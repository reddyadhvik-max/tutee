// Clarity Card: what went well, where vague/wrong, 3 pop questions to retry later. Pure.
import { coverage } from "../provider.js";

export function clarityCard({ mode, topic, turns = [], judge = null, checks = [], questions = [] }) {
  const out = topic.outline;
  let well = [], weak = [], weakIdx = [];
  if (mode === "teach") {
    const cov = coverage(turns.join(" "), out);
    if (judge?.evidence) well.push(`Clear line: "${judge.evidence}"`);
    out.forEach((o, i) => (cov[i] ? well.push(o.idea) : weakIdx.push(i)));
    weak = [...(judge?.vague || []).map((v) => `Used without explaining: ${v}`), ...(judge?.gaps || []).map((g) => `Missing or shaky: ${g}`)];
    if (!turns.length) weak.push("You didn't explain anything yet. Try a 30-second explanation.");
  } else {
    checks.forEach((c) => (c.correct ? well.push(`Got it right: ${c.q}`) : (weak.push(`Check missed: ${c.q}`), weakIdx.push(c.idx))));
    questions.forEach((q) => weak.push(`You asked: "${q}" (worth revising)`));
    if (!checks.length) weak.push("No check questions answered yet.");
  }
  // Pop questions: weak ideas first, then the rest, 3 total.
  const order = [...new Set([...weakIdx, ...out.map((_, i) => i)])];
  const pops = order.slice(0, 3).map((i) => out[i].check);
  const score = judge ? Math.round(((judge.correct + judge.simple + judge.complete) / 30) * 100)
    : checks.length ? Math.round((checks.filter((c) => c.correct).length / checks.length) * 100) : 0;
  return { mode, title: topic.title, well: well.length ? well : ["You showed up and tried, that's the first step."], weak: weak.length ? weak : ["Nothing flagged. Try a harder pop question below."], pops, score };
}
