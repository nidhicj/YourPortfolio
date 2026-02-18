// src/kbEngine.js
// Deterministic KB-only retrieval (Win #2)

const KB_URL = "/kb.json";

function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s) {
  const t = normalizeText(s);
  if (!t) return [];
  const stop = new Set(["the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "with", "is", "are"]);
  return t.split(" ").filter(w => w && !stop.has(w));
}

function applyTemplateVars(text, contact) {
  return String(text || "")
    .replaceAll("{email}", contact?.email || "")
    .replaceAll("{linkedin}", contact?.linkedin || "")
    .replaceAll("{github}", contact?.github || "")
    .replaceAll("{resumePdf}", contact?.resumePdf || "");
}

export async function loadKB() {
  const res = await fetch(KB_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`KB fetch failed: ${res.status}`);
  const kb = await res.json();
  if (!kb || !Array.isArray(kb.chunks)) {
    throw new Error("KB schema invalid: missing chunks[]");
  }
  return kb;
}

function scoreChunk(qTokens, chunk) {
  const titleTokens = tokenize(chunk.title);
  const textTokens = tokenize(chunk.text);
  const tagTokens = (Array.isArray(chunk.tags) ? chunk.tags : []).flatMap(tokenize);
  const kwTokens = (Array.isArray(chunk.keywords) ? chunk.keywords : []).flatMap(tokenize);

  const qSet = new Set(qTokens);

  let score = 0;

  for (const t of kwTokens) if (qSet.has(t)) score += 5;
  for (const t of tagTokens) if (qSet.has(t)) score += 3;
  for (const t of titleTokens) if (qSet.has(t)) score += 2;
  for (const t of textTokens) if (qSet.has(t)) score += 1;

  return score;
}

function retrieveTopChunks(kb, userText, k = 3) {
  const qTokens = tokenize(userText);
  if (qTokens.length === 0) return [];

  const scored = kb.chunks.map(ch => ({
    chunk: ch,
    score: scoreChunk(qTokens, ch)
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return String(a.chunk.id).localeCompare(String(b.chunk.id));
  });

  return scored.filter(x => x.score > 0).slice(0, k);
}

function refusalMessage(kb) {
  const c = kb?.meta?.contact || {};
  const lines = [
    "This is the extent of my Chatbot's knowledge. Kindly reach out to me over ",
    "",
    // "over:",
    `Email: ${c.email || ""}`,
    `LinkedIn: ${c.linkedin || ""}`,
    `GitHub: ${c.github || ""}`
  ].filter(Boolean);

  return lines.join("\n");
}

export function replyFromKB(kb, userText) {
  const c = kb?.meta?.contact || {};
  const top = retrieveTopChunks(kb, userText, 3);

  if (top.length === 0 || top[0].score < 2) {
    return refusalMessage(kb);
  }

  const parts = top.map(({ chunk }) => {
    const body = applyTemplateVars(chunk.text, c).trim();
    return `• ${chunk.title}\n${body}`;
  });

  return parts.join("\n\n");
}
