/**
 * Vanilla-JS embeddable version of the AI support widget — no React, no
 * build step. Drop this on ANY existing website with a single script tag:
 *
 *   <script
 *     src="https://your-deploy.vercel.app/widget.js"
 *     data-api="https://your-deploy.vercel.app/api/chat"
 *     data-brand="AquaFix Plumbing"
 *   ></script>
 *
 * This is the piece that proves the widget is portable: same /api/chat
 * backend and knowledge base, but zero framework dependency on the host
 * page. See public/embed-demo.html for a working plain-HTML example.
 */
(function () {
  var scriptTag = document.currentScript;
  var apiUrl = scriptTag.getAttribute("data-api") || "/api/chat";
  var brand = scriptTag.getAttribute("data-brand") || "AI Assistant";

  var messages = [
    {
      role: "assistant",
      content:
        "Hi! I'm the " + brand + " assistant. Ask me about services, pricing, hours, or service area.",
      ts: null,
    },
  ];

  var css =
    "@keyframes aiw-pop-in{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}" +
    "@keyframes aiw-fade-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}" +
    "@keyframes aiw-pulse{0%,100%{box-shadow:0 0 0 0 rgba(11,110,153,.35)}50%{box-shadow:0 0 0 8px rgba(11,110,153,0)}}" +
    "@keyframes aiw-bounce{0%,80%,100%{transform:scale(.6);opacity:.5}40%{transform:scale(1);opacity:1}}" +
    "#aiw-fab{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;" +
    "border:none;background:linear-gradient(135deg,#0b6e99,#0a5678);color:#fff;font-size:24px;cursor:pointer;" +
    "box-shadow:0 8px 24px rgba(11,110,153,0.35);z-index:99999;font-family:sans-serif;" +
    "animation:aiw-pulse 2.6s infinite;transition:transform .15s ease}" +
    "#aiw-fab:hover{transform:scale(1.06)}" +
    "#aiw-panel{position:fixed;bottom:96px;right:24px;width:350px;max-width:90vw;height:490px;" +
    "max-height:72vh;background:#fff;border-radius:18px;box-shadow:0 20px 56px rgba(0,0,0,0.22);" +
    "display:none;flex-direction:column;overflow:hidden;z-index:99999;" +
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}" +
    "#aiw-panel.open{display:flex;animation:aiw-pop-in .22s cubic-bezier(.2,.8,.2,1) both}" +
    "#aiw-header{background:linear-gradient(135deg,#0b6e99,#0a5678);color:#fff;padding:14px 16px;" +
    "display:flex;justify-content:space-between;align-items:center}" +
    ".aiw-header-left{display:flex;align-items:center;gap:10px}" +
    ".aiw-avatar-bot{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.18);" +
    "display:flex;align-items:center;justify-content:center;font-size:16px}" +
    ".aiw-online{width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block;margin-right:5px}" +
    "#aiw-messages{flex:1;overflow-y:auto;padding:14px 12px;background:#f5f8fa;" +
    "display:flex;flex-direction:column;gap:10px}" +
    ".aiw-row{display:flex;gap:6px;align-items:flex-end;animation:aiw-fade-in .18s ease both}" +
    ".aiw-row-user{justify-content:flex-end}" +
    ".aiw-avatar-sm{width:22px;height:22px;border-radius:50%;background:#0b6e99;color:#fff;font-size:11px;" +
    "flex-shrink:0;display:flex;align-items:center;justify-content:center}" +
    ".aiw-col{display:flex;flex-direction:column;max-width:78%}" +
    ".aiw-bubble{padding:9px 12px;border-radius:14px;font-size:13.5px;line-height:1.45}" +
    ".aiw-bot{background:#fff;border:1px solid #e2e8ec;border-bottom-left-radius:4px;color:#1a1a1a}" +
    ".aiw-user{background:#0b6e99;color:#fff;border-bottom-right-radius:4px}" +
    ".aiw-ts{font-size:10px;color:#9aa9b1;margin-top:3px;padding:0 2px}" +
    ".aiw-dots{display:flex;gap:4px;align-items:center;padding:12px 14px}" +
    ".aiw-dot{width:6px;height:6px;border-radius:50%;background:#90a4ad;display:inline-block;" +
    "animation:aiw-bounce 1.2s infinite ease-in-out}" +
    ".aiw-dot:nth-child(2){animation-delay:.15s}.aiw-dot:nth-child(3){animation-delay:.3s}" +
    "#aiw-inputrow{display:flex;gap:8px;border-top:1px solid #e6e6e6;padding:10px;background:#fff}" +
    "#aiw-input{flex:1;border:1px solid #dfe4e8;border-radius:10px;padding:9px 10px;font-size:13.5px;outline:none}" +
    "#aiw-send{background:#0b6e99;color:#fff;border:none;border-radius:10px;padding:0 16px;cursor:pointer;" +
    "transition:transform .1s ease}" +
    "#aiw-send:hover{transform:translateY(-1px)}" +
    "#aiw-powered{font-size:10px;color:#a2b0b7;text-align:center;padding:5px 0 8px;background:#fff}";

  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  function timeNow() {
    return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  var fab = document.createElement("button");
  fab.id = "aiw-fab";
  fab.textContent = "💬";
  fab.setAttribute("aria-label", "Open chat");

  var panel = document.createElement("div");
  panel.id = "aiw-panel";
  panel.innerHTML =
    '<div id="aiw-header"><div class="aiw-header-left">' +
    '<div class="aiw-avatar-bot">🔧</div>' +
    '<div><div style="font-weight:700;font-size:15px">' +
    brand +
    '</div><div style="font-size:11.5px;opacity:.9"><span class="aiw-online"></span>AI Support Assistant</div></div></div>' +
    '<button id="aiw-close" style="background:transparent;border:none;color:#fff;font-size:22px;cursor:pointer">×</button></div>' +
    '<div id="aiw-messages"></div>' +
    '<form id="aiw-inputrow"><input id="aiw-input" placeholder="Type your question…" autocomplete="off"/>' +
    '<button id="aiw-send" type="submit">Send</button></form>' +
    '<div id="aiw-powered">Powered by AI · trained on our services &amp; pricing</div>';

  document.body.appendChild(panel);
  document.body.appendChild(fab);

  var messagesEl = panel.querySelector("#aiw-messages");
  var inputEl = panel.querySelector("#aiw-input");
  var formEl = panel.querySelector("#aiw-inputrow");

  function render() {
    messagesEl.innerHTML = "";
    messages.forEach(function (m) {
      var row = document.createElement("div");
      row.className = "aiw-row" + (m.role === "user" ? " aiw-row-user" : "");

      if (m.role === "assistant") {
        var av = document.createElement("div");
        av.className = "aiw-avatar-sm";
        av.textContent = "🔧";
        row.appendChild(av);
      }

      var col = document.createElement("div");
      col.className = "aiw-col";

      var bubble = document.createElement("div");
      bubble.className = "aiw-bubble " + (m.role === "user" ? "aiw-user" : "aiw-bot");
      bubble.textContent = m.content;
      col.appendChild(bubble);

      if (m.ts) {
        var ts = document.createElement("div");
        ts.className = "aiw-ts";
        ts.style.textAlign = m.role === "user" ? "right" : "left";
        ts.textContent = m.ts;
        col.appendChild(ts);
      }

      row.appendChild(col);
      messagesEl.appendChild(row);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderTyping() {
    var row = document.createElement("div");
    row.className = "aiw-row";
    row.id = "aiw-typing-row";

    var av = document.createElement("div");
    av.className = "aiw-avatar-sm";
    av.textContent = "🔧";
    row.appendChild(av);

    var bubble = document.createElement("div");
    bubble.className = "aiw-bubble aiw-bot aiw-dots";
    bubble.innerHTML = '<span class="aiw-dot"></span><span class="aiw-dot"></span><span class="aiw-dot"></span>';
    row.appendChild(bubble);

    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function toggle() {
    panel.classList.toggle("open");
  }

  fab.addEventListener("click", toggle);
  panel.querySelector("#aiw-close").addEventListener("click", toggle);

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = inputEl.value.trim();
    if (!text) return;
    messages.push({ role: "user", content: text, ts: timeNow() });
    inputEl.value = "";
    render();
    renderTyping();

    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        messages.push({ role: "assistant", content: data.reply || "Sorry, something went wrong.", ts: timeNow() });
        render();
      })
      .catch(function () {
        messages.push({
          role: "assistant",
          content: "I'm having trouble connecting right now — please try again shortly.",
          ts: timeNow(),
        });
        render();
      });
  });

  render();
})();
