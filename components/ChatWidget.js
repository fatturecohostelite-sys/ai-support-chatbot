"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "mandy-chat-history";

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Ciao! Sono Mandy, l’esperta AI sul mandato di Homy Host. Posso aiutarti a capire il nuovo mandato e confrontarlo con il modello attuale. Da dove vuoi iniziare?",
  ts: null,
};

const SUGGESTIONS = [
  "Perché conviene il mandato?",
  "Cosa cambia rispetto a oggi?",
  "Come funziona la ritenuta del 21%?",
  "Quali responsabilità restano a me?",
  "Cosa succede al mio account Airbnb?",
];

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ChatWidget({ apiUrl = "/api/chat" }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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
  }, [messages, loading]);

  async function sendMessage(text) {
    const content = text.trim();
    if (!content || loading) return;

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
        {
          role: "assistant",
          content: data.reply || "Mi dispiace, qualcosa è andato storto. Riprova tra poco.",
          ts: timeNow(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "In questo momento faccio fatica a collegarmi. Riprova tra poco.",
          ts: timeNow(),
        },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  return (
    <section className="mandy-chat-card" aria-label="Chat con Mandy">
      <div className="mandy-chat-head">
        <div className="mandy-chat-avatar">M</div>
        <div>
          <div className="mandy-chat-name">Mandy</div>
          <div className="mandy-chat-status">
            <span className="mandy-online-dot" />
            Esperta AI sul mandato
          </div>
        </div>
      </div>

      {messages.length <= 1 && (
        <div className="mandy-suggestions-wrap">
          <div className="mandy-suggestions-title">Domande suggerite</div>
          <div className="mandy-suggestions">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                className="mandy-suggestion"
                onClick={() => sendMessage(suggestion)}
                disabled={loading}
              >
                <span>{suggestion}</span>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="mandy-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mandy-message-row ${message.role === "user" ? "is-user" : "is-assistant"}`}
          >
            {message.role === "assistant" && <div className="mandy-message-avatar">M</div>}
            <div className="mandy-message-col">
              <div className="mandy-bubble">{message.content}</div>
              {message.ts && <div className="mandy-time">{message.ts}</div>}
            </div>
          </div>
        ))}

        {loading && (
          <div className="mandy-message-row is-assistant">
            <div className="mandy-message-avatar">M</div>
            <div className="mandy-bubble mandy-typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      <form
        className="mandy-input-row"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage(input);
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Scrivi qui la tua domanda..."
          aria-label="Scrivi una domanda a Mandy"
        />
        <button type="submit" disabled={loading || !input.trim()} aria-label="Invia">
          ↑
        </button>
      </form>

      <p className="mandy-privacy">
        La conversazione può essere visibile allo staff Homy Host. Non inserire dati sensibili.
      </p>
    </section>
  );
}
