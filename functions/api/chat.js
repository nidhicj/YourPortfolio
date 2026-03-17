// functions/api/chat.js
// Cloudflare Pages Function: POST /api/chat
// Uses OpenRouter LLM (free tier) with kb.json as grounding context.
// Falls back to deterministic KB reply if LLM is unavailable.

let kbCache = null;
let kbCacheAtMs = 0;
const KB_CACHE_TTL_MS = 15_000;
const MAX_MESSAGE_CHARS = 1000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const rateStore = new Map();
let lastRateStoreCleanupMs = 0;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function jsonResponse(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function normalizeText(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function tokenize(s) {
  const t = normalizeText(s);
  if (!t) return [];
  const stop = new Set(["the","a","an","and","or","to","of","in","on","for","with","is","are"]);
  return t.split(" ").filter(w => w && !stop.has(w));
}

function applyTemplateVars(text, contact) {
  return String(text || "")
    .replaceAll("{email}",     contact?.email     || "")
    .replaceAll("{linkedin}",  contact?.linkedin  || "")
    .replaceAll("{github}",    contact?.github    || "")
    .replaceAll("{resumePdf}", contact?.resumePdf || "");
}

function scoreChunk(qTokens, chunk) {
  const qSet = new Set(qTokens);
  let score = 0;
  for (const t of (Array.isArray(chunk.keywords) ? chunk.keywords : []).flatMap(tokenize)) if (qSet.has(t)) score += 5;
  for (const t of (Array.isArray(chunk.tags)     ? chunk.tags     : []).flatMap(tokenize)) if (qSet.has(t)) score += 3;
  for (const t of tokenize(chunk.title))  if (qSet.has(t)) score += 2;
  for (const t of tokenize(chunk.text))   if (qSet.has(t)) score += 1;
  return score;
}

function retrieveTopChunks(kb, userText, k = 4) {
  const qTokens = tokenize(userText);
  if (!qTokens.length) return [];
  return (kb.chunks || [])
    .map(ch => ({ chunk: ch, score: scoreChunk(qTokens, ch) }))
    .sort((a, b) => b.score - a.score || String(a.chunk.id).localeCompare(String(b.chunk.id)))
    .filter(x => x.score > 0)
    .slice(0, k);
}

function kbFallbackReply(kb, userText) {
  const c = kb?.meta?.contact || {};
  const top = retrieveTopChunks(kb, userText);
  if (!top.length || top[0].score < 2) {
    return [
      "I'm not sure about that one — here's how to reach Nidhi directly:",
      `Email: ${c.email || ""}`,
      `LinkedIn: ${c.linkedin || ""}`,
      `GitHub: ${c.github || ""}`,
    ].join("\n");
  }
  return top.map(({ chunk }) => `• ${chunk.title}\n${applyTemplateVars(chunk.text, c).trim()}`).join("\n\n");
}

// ─── OpenRouter LLM call ──────────────────────────────────────────────────────

async function llmReply(apiKey, kb, userText) {
  const c = kb?.meta?.contact || {};
  const top = retrieveTopChunks(kb, userText, 4);

  // Build context block from top KB chunks
  const context = top.length
    ? top.map(({ chunk }) => `[${chunk.title}]\n${applyTemplateVars(chunk.text, c).trim()}`).join("\n\n")
    : "No specific information found in the knowledge base.";

  const system = `You are a helpful assistant on Nidhi Joshi's portfolio website. \
Nidhi is an AI/ML engineer specialising in robotics, computer vision, and automation systems.

Answer the visitor's question using ONLY the context below. \
Be conversational, warm, and concise — 2-4 sentences max unless a list genuinely helps. \
Never make up information not in the context. \
If the question is outside the context, say you don't have that detail and suggest contacting Nidhi directly at ${c.email || "her email"}.

CONTEXT:
${context}`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://nidhijoshi.dev",
      "X-Title": "Nidhi Joshi Portfolio",
    },
    body: JSON.stringify({
      // Free tier model — fast, capable, no cost
      model: "stepfun/step-3.5-flash:free",
      messages: [
        { role: "system",    content: system   },
        { role: "user",      content: userText },
      ],
      max_tokens: 300,
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${txt.slice(0, 120)}`);
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("Empty response from LLM");
  return reply;
}

// ─── KB loader ───────────────────────────────────────────────────────────────

async function loadKBFromAssets({ request, env }) {
  const now = Date.now();
  if (kbCache && now - kbCacheAtMs < KB_CACHE_TTL_MS) return kbCache;

  const url = new URL(request.url);
  url.pathname = "/kb.json";
  url.search = "";

  if (!env?.ASSETS?.fetch) throw new Error("env.ASSETS unavailable");

  const res = await env.ASSETS.fetch(new Request(url.toString(), { method: "GET" }));
  if (!res.ok) throw new Error(`KB fetch failed: ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error(`KB not JSON, got: ${ct}`);

  const kb = await res.json();
  if (!kb || !Array.isArray(kb.chunks)) throw new Error("KB schema invalid");

  kbCache = kb;
  kbCacheAtMs = now;
  return kb;
}

// ─── Rate limiting ────────────────────────────────────────────────────────────

function getClientIp(request) {
  return request.headers.get("CF-Connecting-IP")?.trim()
    || request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim()
    || "unknown";
}

function checkRateLimit(ip, nowMs) {
  if (nowMs - lastRateStoreCleanupMs > 60_000) {
    lastRateStoreCleanupMs = nowMs;
    for (const [k, v] of rateStore) if (nowMs > v.resetAtMs + RATE_LIMIT_WINDOW_MS) rateStore.delete(k);
  }
  const key = ip || "unknown";
  const existing = rateStore.get(key);
  if (!existing || nowMs > existing.resetAtMs) {
    rateStore.set(key, { count: 1, resetAtMs: nowMs + RATE_LIMIT_WINDOW_MS });
    return { ok: true };
  }
  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) return { ok: false, resetAtMs: existing.resetAtMs };
  existing.count++;
  return { ok: true };
}

function isPromptInjectionAttempt(userText) {
  const t = normalizeText(userText);
  return [
    /\bignore (all|any|previous) instructions\b/,
    /\bdisregard (all|any|previous) instructions\b/,
    /\bsystem prompt\b/,
    /\bprint (your|the) system prompt\b/,
    /\bexfiltrate\b/,
    /\bjailbreak\b/,
  ].some(re => re.test(t));
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Rate limit
    const ip = getClientIp(request);
    const nowMs = Date.now();
    const rl = checkRateLimit(ip, nowMs);
    if (!rl.ok) {
      const retryAfter = Math.max(1, Math.ceil((rl.resetAtMs - nowMs) / 1000));
      return new Response(JSON.stringify({ reply: "Too many requests. Please wait a moment." }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Retry-After": String(retryAfter) },
      });
    }

    // Parse body
    let body;
    try { body = await request.json(); }
    catch { return jsonResponse(400, { reply: "Invalid JSON body." }); }

    const message = body?.message;
    if (typeof message !== "string" || !message.trim()) return jsonResponse(400, { reply: "Send a non-empty message." });
    const trimmed = message.trim();
    if (trimmed.length > MAX_MESSAGE_CHARS) return jsonResponse(413, { reply: `Keep messages under ${MAX_MESSAGE_CHARS} characters.` });
    if (isPromptInjectionAttempt(trimmed)) return jsonResponse(403, { reply: "I can only answer questions about Nidhi's portfolio." });

    // Load KB
    const kb = await loadKBFromAssets(context);

    // Try LLM first, fall back to deterministic KB reply
    const apiKey = env?.OPENROUTER_API_KEY;
    let reply;

    if (apiKey) {
      console.log("[chat] OpenRouter key found, calling LLM...");
      try {
        reply = await llmReply(apiKey, kb, trimmed);
        console.log("[chat] LLM reply OK");
      } catch (err) {
        console.error("[chat] LLM failed, using KB fallback:", err.message);
        reply = kbFallbackReply(kb, trimmed);
      }
    } else {
      console.warn("[chat] No OPENROUTER_API_KEY — using KB fallback. Set it in .dev.vars locally or Cloudflare env vars in production.");
      reply = kbFallbackReply(kb, trimmed);
    }

    return jsonResponse(200, { reply });

  } catch (err) {
    console.error("POST /api/chat failed:", err);
    return jsonResponse(500, { reply: "Something went wrong. Please try again." });
  }
}

export async function onRequestGet() {
  return jsonResponse(405, { reply: "Use POST { message } to chat." });
}