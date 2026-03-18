// src/chat.js
// Win #1: Chat UI (demo mode). Next win: swap demoReply() for POST /api/chat.
// import { loadKB, replyFromKB } from "./kbEngine.js";

function $(id) { return document.getElementById(id); }

function addMsg(logEl, role, text) {
  const wrap = document.createElement("div");
  wrap.className = "chat-msg";

  const roleEl = document.createElement("div");
  roleEl.className = "chat-role";
  roleEl.textContent = role;

  const textEl = document.createElement("div");
  textEl.className = "chat-text";
  textEl.textContent = text;

  wrap.appendChild(roleEl);
  wrap.appendChild(textEl);
  logEl.appendChild(wrap);
  logEl.scrollTop = logEl.scrollHeight;
}

function demoReply(userText) {
  const t = userText.toLowerCase();

  if (t.includes("resume")) return "You can use the “Resume PDF” button on the landing page.";
  if (t.includes("email") || t.includes("contact")) return "Use the email icon on the right rail, or the Contact section.";
  if (t.includes("github")) return "Use the GitHub icon on the right rail.";
  if (t.includes("linkedin")) return "Use the LinkedIn icon on the right rail.";
  if (t.includes("project") || t.includes("work")) return "Scroll into the corridor to explore projects. Click doors to open details.";

  return "Demo mode: I’m not connected to the API yet. Next win: I’ll answer from your KB + /api/chat.";
}

async function apiReply(userText) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });

    // Try to parse JSON even on non-200 so we can show a useful message.
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      // If the server returned a JSON reply, show it. Otherwise show a generic one.
      return (data && typeof data.reply === "string" && data.reply.trim())
        ? data.reply
        : `Chatbot error (${res.status}). Please try again.`;
    }

    const reply = data?.reply;
    if (typeof reply !== "string" || !reply.trim()) return "No reply.";
    return reply;
  } catch (err) {
    console.error("Network/API error calling /api/chat:", err);
    return "Network error: couldn’t reach the chatbot API. Check your connection and try again.";
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const fab = $("chatFab");
  const panel = $("chatPanel");
  const closeBtn = $("chatClose");
  const form = $("chatForm");
  const input = $("chatInput");
  const log = $("chatLog");

  if (!fab || !panel || !closeBtn || !form || !input || !log) return;

  // ── Top-left drag-to-resize ──────────────────────────────────────────────
  // Dragging the grip pulls the top-left corner outward.
  // Panel is fixed bottom-right, so increasing width/height grows it up and left.
  const grip = panel.querySelector('.chat-grip');
  if (grip) {
    let dragging = false, startX, startY, startW, startH;

    const MIN_W = 280, MAX_W = Math.min(600, window.innerWidth - 32);
    const MIN_H = 280, MAX_H = window.innerHeight - 128;

    grip.addEventListener('mousedown', (e) => {
      e.preventDefault();
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startW = panel.offsetWidth;
      startH = panel.offsetHeight;
      grip.classList.add('dragging');
      // Disable transitions during drag so it tracks mouse instantly
      panel.style.transition = 'none';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      // Moving left  = deltaX negative = panel gets wider
      // Moving up    = deltaY negative = panel gets taller
      const newW = Math.min(MAX_W, Math.max(MIN_W, startW - (e.clientX - startX)));
      const newH = Math.min(MAX_H, Math.max(MIN_H, startH - (e.clientY - startY)));
      panel.style.width  = `${newW}px`;
      panel.style.height = `${newH}px`;
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      grip.classList.remove('dragging');
      panel.style.transition = '';
      document.body.style.userSelect = '';
    });
  }

  // Load KB once at startup (KB-only Port Bot)
  // window.__kb = null;
  // loadKB()
  //   .then((kb) => {
  //     window.__kb = kb;
  //   })
  //   .catch((err) => {
  //     // If KB fails to load, Port Bot must still refuse deterministically
  //     window.__kb = { meta: { contact: {} }, chunks: [] };
  //     console.error(err);
  //   });

  // Start locked: button + panel hidden until first scroll (or timeout).
  // (fab is already hidden in HTML; we keep it consistent here.)
  panel.hidden = true;

  // Requirement: widget appears only after the first scroll action (per page load).
  // So we do NOT persist "unlocked" state across refreshes.

  function unlockChat({ openPanel = true } = {}) {
    // Make available
    fab.hidden = false;

    // Trigger smooth fade-in for the button
    document.documentElement.classList.add("chat-unlocked");

    // Optionally pop it open once
    if (openPanel) {
      panel.hidden = false;

      // Let the browser apply the "hidden=false" layout first, then animate in
      requestAnimationFrame(() => {
        document.documentElement.classList.add("chat-open");
        input.focus();
      });

      if (!log.dataset.greeted) {
        addMsg(log, "Port Bot", "Hey there! Ask me anything about Nidhi.");
        log.dataset.greeted = "1";
      }
    }
  }


  // Unlock on the first real scroll ONLY ONCE
  const onFirstScroll = () => unlockChat({ openPanel: false });
  window.addEventListener("scroll", onFirstScroll, { passive: true, once: true });

  fab.addEventListener("click", (e) => {
  e.preventDefault();
  panel.hidden = false;

  requestAnimationFrame(() => {
    document.documentElement.classList.add("chat-open");
    input.focus();
  });

  if (!log.dataset.greeted) {
    addMsg(log, "Port Bot", "Hey there! Ask me anything about Nidhi.");
    log.dataset.greeted = "1";
  }
 });


  // Close should work even if other listeners exist above/below in the tree.
  const closePanel = (e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
  }

  // Animate out
  document.documentElement.classList.remove("chat-open");

  // After the fade-out finishes, truly hide it
  window.setTimeout(() => {
    panel.hidden = true;
  }, 280); // should be slightly >= CSS transition (260ms)
 };


  // Use pointerdown for reliability (fires before click) + click for keyboard activation.
  closeBtn.addEventListener("pointerdown", closePanel);
  closeBtn.addEventListener("click", closePanel);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userText = input.value.trim();
    if (!userText) return;
    input.value = "";

    addMsg(log, "you", userText);

    // Win #1 behavior: local demo reply
    // const reply = demoReply(userText);

    // Win #2 behavior: KB-only deterministic reply
    // const reply = replyFromKB(window.__kb, userText);
    // addMsg(log, "Port Bot", reply);

    // Win #3 behavior: backend deterministic reply
    addMsg(log, "Port Bot", "…"); // lightweight “typing” placeholder
    const placeholder = log.lastElementChild;

    const reply = await apiReply(userText);

    // Replace the placeholder text with the real reply
    if (placeholder && placeholder.querySelector) {
      const textEl = placeholder.querySelector(".chat-text");
      if (textEl) textEl.textContent = reply;
    } else {
      addMsg(log, "Port Bot", reply);
    }
  });
});