// functions/api/chat.js
// Cloudflare Pages Function: POST /api/chat
// Deterministic KB retrieval (no LLM). Loads KB from static asset /kb.json via env.ASSETS.
//
// Win 4 hardening:
//  - In-memory rate limiting (per IP)
//  - Max message length cap
//  - Basic prompt-injection request refusal
//  - Always respond ONLY from kb.json (no external calls)
//  - Graceful fallback if KB fails

let kbCache = null;
let kbCacheAtMs = 0;

// Small TTL so edits to kb.json show up without redeploy during local dev.
// (In production you can raise this if you want.)
const KB_CACHE_TTL_MS = 15_000;

// Guardrails
const MAX_MESSAGE_CHARS = 1000;

// Rate limit (simple fixed window)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20;  // per IP per window

// In-memory store (best-effort). Note: may reset on redeploy / cold start.
const rateStore = new Map(); // ip -> { count: number, resetAtMs: number }
let lastRateStoreCleanupMs = 0;

function jsonResponse(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

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
  const stop = new Set([
    "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "with", "is", "are",
  ]);
  return t.split(" ").filter((w) => w && !stop.has(w));
}

function applyTemplateVars(text, contact) {
  return String(text || "")
    .replaceAll("{email}", contact?.email || "")
    .replaceAll("{linkedin}", contact?.linkedin || "")
    .replaceAll("{github}", contact?.github || "")
    .replaceAll("{resumePdf}", contact?.resumePdf || "");
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

  const scored = kb.chunks.map((ch) => ({
    chunk: ch,
    score: scoreChunk(qTokens, ch),
  }));

  // Deterministic sort: score desc, then id asc
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return String(a.chunk.id).localeCompare(String(b.chunk.id));
  });

  return scored.filter((x) => x.score > 0).slice(0, k);
}

function refusalMessage(kb) {
  const c = kb?.meta?.contact || {};
  const lines = [
    "This is the extent of my Chatbot's knowledge. Kindly reach out to me over ",
    "",
    `Email: ${c.email || ""}`,
    `LinkedIn: ${c.linkedin || ""}`,
    `GitHub: ${c.github || ""}`,
  ].filter(Boolean);

  return lines.join("\n");
}

function injectionRefusalMessage(kb) {
  // Keep this deterministic and non-revealing.
  // If KB is present, include the standard contact footer (consistent UX).
  const base = [
    "I can’t follow requests to ignore instructions, reveal hidden prompts, or dump internal data.",
    "I can only answer using my portfolio knowledge base.",
  ].join(" ");
  return kb ? `${base}\n\n${refusalMessage(kb)}` : base;
}

function replyFromKB(kb, userText) {
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

async function loadKBFromAssets({ request, env }) {
  const now = Date.now();
  if (kbCache && now - kbCacheAtMs < KB_CACHE_TTL_MS) return kbCache;

  // Fetch kb.json from the Pages static assets (no filesystem path assumptions).
  const url = new URL(request.url);
  url.pathname = "/kb.json";
  url.search = "";

  if (!env || !env.ASSETS || typeof env.ASSETS.fetch !== "function") {
    throw new Error("env.ASSETS is not available (are you running in Pages Functions?)");
  }

  const res = await env.ASSETS.fetch(new Request(url.toString(), { method: "GET" }));

  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(
      `KB fetch failed: ${res.status}. content-type=${ct}. body(0..120)=${txt.slice(0, 120)}`
    );
  }

  // If Pages rewrites missing assets to HTML, this catches it cleanly.
  if (!ct.includes("application/json")) {
    const txt = await res.text();
    throw new Error(`KB is not JSON. content-type=${ct}. body(0..120)=${txt.slice(0, 120)}`);
  }

  const kb = await res.json();
  if (!kb || !Array.isArray(kb.chunks)) throw new Error("KB schema invalid: missing chunks[]");

  kbCache = kb;
  kbCacheAtMs = now;
  return kb;
}

function getClientIp(request) {
  // Cloudflare provides CF-Connecting-IP. Fall back to X-Forwarded-For.
  const cfIp = request.headers.get("CF-Connecting-IP");
  if (cfIp) return cfIp.trim();

  const xff = request.headers.get("X-Forwarded-For");
  if (xff) return xff.split(",")[0].trim();

  // Unknown from current context: some environments might not expose IP headers.
  return "unknown";
}

function cleanupRateStore(nowMs) {
  // Keep it cheap: clean at most once per minute.
  if (nowMs - lastRateStoreCleanupMs < 60_000) return;
  lastRateStoreCleanupMs = nowMs;

  for (const [ip, v] of rateStore.entries()) {
    if (!v || nowMs > v.resetAtMs + RATE_LIMIT_WINDOW_MS) {
      rateStore.delete(ip);
    }
  }
}

function checkRateLimit(ip, nowMs) {
  cleanupRateStore(nowMs);

  const key = ip || "unknown";
  const existing = rateStore.get(key);

  if (!existing || nowMs > existing.resetAtMs) {
    rateStore.set(key, { count: 1, resetAtMs: nowMs + RATE_LIMIT_WINDOW_MS });
    return { ok: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAtMs: nowMs + RATE_LIMIT_WINDOW_MS };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { ok: false, remaining: 0, resetAtMs: existing.resetAtMs };
  }

  existing.count += 1;
  rateStore.set(key, existing);
  return { ok: true, remaining: RATE_LIMIT_MAX_REQUESTS - existing.count, resetAtMs: existing.resetAtMs };
}

function isPromptInjectionAttempt(userText) {
  const t = normalizeText(userText);

  // Minimal, high-signal patterns (add more as needed).
  const patterns = [
    /\bignore (all|any|previous) instructions\b/,
    /\bdisregard (all|any|previous) instructions\b/,
    /\bsystem prompt\b/,
    /\bdeveloper (message|instructions)\b/,
    /\bprint (your|the) system prompt\b/,
    /\breveal (your|the) system prompt\b/,
    /\bdump (your|the) knowledge base\b/,
    /\bexfiltrate\b/,
    /\bjailbreak\b/,
  ];

  return patterns.some((re) => re.test(t));
}

export async function onRequestPost(context) {
  const { request } = context;

  // Always reply JSON, even on errors.
  try {
    // Rate limit first (cheap; does not require KB)
    const ip = getClientIp(request);
    const nowMs = Date.now();
    const rl = checkRateLimit(ip, nowMs);
    if (!rl.ok) {
      const retryAfterSec = Math.max(1, Math.ceil((rl.resetAtMs - nowMs) / 1000));
      return new Response(JSON.stringify({
        reply: "Too many requests. Please wait a bit and try again.",
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
          "Retry-After": String(retryAfterSec),
        },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse(400, {
        reply: 'Invalid request: body must be JSON like { "message": "..." }.',
      });
    }

    const message = body?.message;
    if (typeof message !== "string") {
      return jsonResponse(400, { reply: "Invalid request: 'message' must be a string." });
    }

    const trimmed = message.trim();
    if (!trimmed) {
      return jsonResponse(400, { reply: "Send a non-empty message." });
    }

    if (trimmed.length > MAX_MESSAGE_CHARS) {
      return jsonResponse(413, {
        reply: `Message too long. Please keep it under ${MAX_MESSAGE_CHARS} characters.`,
      });
    }

    // If it looks like a prompt-injection attempt, refuse.
    // We still try to load KB for consistent contact info, but refusal does not depend on it.
    if (isPromptInjectionAttempt(trimmed)) {
      try {
        const kb = await loadKBFromAssets(context);
        return jsonResponse(403, { reply: injectionRefusalMessage(kb) });
      } catch {
        return jsonResponse(403, { reply: injectionRefusalMessage(null) });
      }
    }

    const kb = await loadKBFromAssets(context);
    const reply = replyFromKB(kb, trimmed);

    return jsonResponse(200, { reply });
  } catch (err) {
    // Fail closed: do not throw HTML error pages at the client.
    console.error("POST /api/chat failed:", err);

    return jsonResponse(500, {
      reply: "Chatbot error: I couldn’t load my knowledge base. Please try again in a moment.",
    });
  }
}

// Optional: if someone GETs /api/chat
export async function onRequestGet() {
  return jsonResponse(405, { reply: "Use POST { message } to talk to this endpoint." });
}
