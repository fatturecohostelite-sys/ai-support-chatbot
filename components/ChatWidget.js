"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "aquafix-chat-history";

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hi! I'm the AquaFix Plumbing assistant. Ask me about services, pricing, hours, or service area.",
  ts: null,
};

const MANDATE_RESPONSE = `Bene! È la scelta economicamente più conveniente.

Per procedere:

1. Firma il mandato e la scheda che hai ricevuto per e-mail e inviaceli per PEC a homyhostsrl@legalmail.it

2. Segui questo link e prenota una chiamata per aggiungere il numero di telefono di Homy Host al tuo account (se vuoi trasferire l’account e mantenere lo storico)

Finito! Al resto penseremo noi e a partire dal 1 gennaio pagherai la ritenuta solo sul netto.`;

const CHOICE_CARDS = [
  {
    title: "Resto con il modello attuale",
    text:
      "Non devi fare nulla per cambiare modello. Continui con la configurazione attuale; dal 13 ottobre, però, Airbnb applicherà la propria commissione interamente al proprietario.",
    action: "Voglio mantenere il modello attuale",
  },
  {
    title: "Voglio passare al mandato",
    text:
      "Homy Host gestirà la locazione per tuo conto, separando il canone dai servizi. È la nuova configurazione pensata per ridurre l’impatto economico delle modifiche di Airbnb.",
    action: "Voglio passare al mandato",
  },
];

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ChatWidget({ apiUrl = "/api/chat", brandName = "AquaFix Plumbing" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) {
      setHasUnread(false);

      // Desktop: keep the text field focused so typing can start immediately.
      // Mobile: do not force focus because it would open the on-screen keyboard.
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      if (isDesktop) inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open || loading) return;

    // Keep the desktop input focused after each reply without forcing
    // the mobile keyboard to open.
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (isDesktop) inputRef.current?.focus();
  }, [messages, loading, open]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function sendMessage(text) {
    const content = text.trim();
    if (!content || loading) return;

    if (content === "Voglio passare al mandato") {
      const now = timeNow();
      setMessages((prev) => [
        ...prev,
        { role: "user", content, ts: now },
        { role: "assistant", content: MANDATE_RESPONSE, ts: now },
      ]);
      setInput("");
      return;
    }

    const nextMessages = [...messages, { role: "user", content, ts: timeNow() }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Sorry, something went wrong.", ts: timeNow() },
      ]);
      if (!open) setHasUnread(true);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now — please try again shortly.",
          ts: timeNow(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      {open && (
        <div className="aiw-panel-enter" style={styles.panel}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.avatarBot}>🔧</div>
              <div>
                <div style={styles.headerTitle}>{brandName}</div>
                <div style={styles.headerSubtitle}>
                  <span style={styles.onlineDot} /> AI Support Assistant
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={styles.closeBtn} aria-label="Close chat">
              ×
            </button>
          </div>

          <div ref={scrollRef} style={styles.messages}>
            {messages.map((m, i) => (
              <div
                key={i}
                className="aiw-bubble-enter"
                style={{
                  ...styles.bubbleRow,
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {m.role === "assistant" && <div style={styles.avatarSmall}>🔧</div>}
                <div style={styles.bubbleCol}>
                  <div
                    style={{
                      ...styles.bubble,
                      ...(m.role === "user" ? styles.bubbleUser : styles.bubbleBot),
                    }}
                  >
                    {m.content}
                  </div>
                  {m.ts && (
                    <div
                      style={{
                        ...styles.timestamp,
                        textAlign: m.role === "user" ? "right" : "left",
                      }}
                    >
                      {m.ts}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="aiw-bubble-enter" style={{ ...styles.bubbleRow, justifyContent: "flex-start" }}>
                <div style={styles.avatarSmall}>🔧</div>
                <div style={{ ...styles.bubble, ...styles.bubbleBot, ...styles.typingBubble }}>
                  <span className="aiw-dot" />
                  <span className="aiw-dot" />
                  <span className="aiw-dot" />
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div style={styles.choices}>
              <div style={styles.choicesIntro}>
                <strong>Le due possibilità</strong>
                <span>Scegli quella che vuoi approfondire.</span>
              </div>

              {CHOICE_CARDS.map((choice) => (
                <div key={choice.action} style={styles.choiceCard}>
                  <div style={styles.choiceCopy}>
                    <div style={styles.choiceTitle}>{choice.title}</div>
                    <div style={styles.choiceText}>{choice.text}</div>
                  </div>
                  <button
                    className="aiw-suggestion-chip"
                    style={styles.choiceButton}
                    onClick={() => sendMessage(choice.action)}
                  >
                    {choice.title}
                  </button>
                </div>
              ))}
            </div>
          )}

          <form
            style={styles.inputRow}
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              ref={inputRef}
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
            />
            <button type="submit" className="aiw-send-btn" style={styles.sendBtn} disabled={loading}>
              Send
            </button>
          </form>

          <div style={styles.poweredBy}>Powered by AI · trained on our services &amp; pricing</div>
        </div>
      )}

      <button className="aiw-fab" style={styles.fab} onClick={() => setOpen((o) => !o)} aria-label="Toggle chat widget">
        {open ? "×" : "💬"}
        {!open && hasUnread && <span style={styles.unreadDot} />}
      </button>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 9999,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  fab: {
    position: "relative",
    width: 60,
    height: 60,
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg,#0b6e99,#0a5678)",
    color: "#fff",
    fontSize: 24,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(11,110,153,0.35)",
  },
  unreadDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "#ff5a5f",
    border: "2px solid #fff",
  },
  panel: {
    width: 350,
    maxWidth: "90vw",
    height: 490,
    maxHeight: "72vh",
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 20px 56px rgba(0,0,0,0.22)",
    display: "flex",
    flexDirection: "column",
    marginBottom: 14,
    overflow: "hidden",
    transformOrigin: "bottom right",
  },
  header: {
    background: "linear-gradient(135deg,#0b6e99,#0a5678)",
    color: "#fff",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  avatarBot: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
  },
  headerTitle: { fontWeight: 700, fontSize: 15 },
  headerSubtitle: { fontSize: 11.5, opacity: 0.9, display: "flex", alignItems: "center", gap: 5 },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#4ade80",
    display: "inline-block",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 22,
    cursor: "pointer",
    lineHeight: 1,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "14px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "#f5f8fa",
  },
  bubbleRow: { display: "flex", gap: 6, alignItems: "flex-end" },
  bubbleCol: { display: "flex", flexDirection: "column", maxWidth: "78%" },
  avatarSmall: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "#0b6e99",
    color: "#fff",
    fontSize: 11,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    padding: "9px 12px",
    borderRadius: 14,
    fontSize: 13.5,
    lineHeight: 1.45,
  },
  bubbleUser: {
    background: "#0b6e99",
    color: "#fff",
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    background: "#fff",
    color: "#1a1a1a",
    border: "1px solid #e2e8ec",
    borderBottomLeftRadius: 4,
  },
  typingBubble: { display: "flex", gap: 4, alignItems: "center", padding: "12px 14px" },
  timestamp: { fontSize: 10, color: "#9aa9b1", marginTop: 3, padding: "0 2px" },
  choices: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "0 12px 10px",
    background: "#f5f8fa",
  },
  choicesIntro: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "2px 2px 4px",
    fontSize: 12,
    color: "#52636d",
  },
  choiceCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 11px",
    border: "1px solid #dbe5ea",
    borderRadius: 12,
    background: "#fff",
  },
  choiceCopy: {
    flex: 1,
    minWidth: 0,
  },
  choiceTitle: {
    fontSize: 12.5,
    fontWeight: 700,
    color: "#1a2733",
    marginBottom: 3,
  },
  choiceText: {
    fontSize: 11.5,
    lineHeight: 1.4,
    color: "#5b6b75",
  },
  choiceButton: {
    flexShrink: 0,
    fontSize: 11.5,
    fontWeight: 600,
    padding: "7px 9px",
    borderRadius: 9,
    border: "1px solid #cfe0e8",
    background: "#fff",
    color: "#0b6e99",
    cursor: "pointer",
  },
  inputRow: {
    display: "flex",
    borderTop: "1px solid #e6e6e6",
    padding: 10,
    gap: 8,
    background: "#fff",
  },
  input: {
    flex: 1,
    border: "1px solid #dfe4e8",
    borderRadius: 10,
    padding: "9px 10px",
    fontSize: 13.5,
    outline: "none",
  },
  sendBtn: {
    background: "#0b6e99",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "0 16px",
    fontSize: 13.5,
    cursor: "pointer",
  },
  poweredBy: {
    fontSize: 10,
    color: "#a2b0b7",
    textAlign: "center",
    padding: "5px 0 8px",
    background: "#fff",
  },
};
