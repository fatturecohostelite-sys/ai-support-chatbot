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
  "Perché la ritenuta scende con il mandato?",
  "Confronto secco modello attuale/Mandato",
  "Cosa succede al mio account Airbnb?",
];

const MANDATE_RESPONSE = `**Ottima scelta!**

Per procedere:

**1. Firma il mandato e la scheda** che hai ricevuto per e-mail e inviaceli tramite PEC a **homyhostsrl@legalmail.it**

**2. Se vuoi trasferire il tuo account Airbnb** e mantenere storico e recensioni, segui il link e prenota una chiamata per aggiungere il numero di telefono di Homy Host al tuo account.

**Finito!** Al resto pensiamo noi.

La ritenuta verrà applicata sul **canone lordo di tua spettanza**; i **servizi Homy Host sono separati dal tuo canone**.`;

const STYLE_ACTIONS = [
  {
    label: "Spiegalo super semplice",
    prompt: "Spiegalo super semplice.",
  },
  {
    label: "Spiegazione analitica",
    prompt:
      "Dammi una spiegazione analitica della tua ultima risposta: tecnica, precisa e strutturata, ma non più lunga del necessario.",
  },
  {
    label: "Voglio passare al mandato",
    prompt: "Voglio passare al mandato",
    direct: true,
  },
];

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function renderInlineMarkdown(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderMessageContent(text) {
  const lines = text.split("\n");
  const blocks = [];
  let bulletItems = [];
  let tableRows = [];

  function flushBullets() {
    if (!bulletItems.length) return;
    blocks.push(
      <ul className="mandy-message-list" key={`list-${blocks.length}`}>
        {bulletItems.map((item, index) => (
          <li key={index}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    );
    bulletItems = [];
  }

  function splitTableRow(line) {
    return line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());
  }

  function flushTable() {
    if (!tableRows.length) return;

    const rows = tableRows.map(splitTableRow);
    const hasSeparator =
      rows.length > 1 &&
      rows[1].every((cell) => /^:?-{3,}:?$/.test(cell));

    const header = hasSeparator ? rows[0] : null;
    const body = hasSeparator ? rows.slice(2) : rows;

    blocks.push(
      <div className="mandy-table-wrap" key={`table-${blocks.length}`}>
        <table className="mandy-table">
          {header && (
            <thead>
              <tr>
                {header.map((cell, index) => (
                  <th key={index}>{renderInlineMarkdown(cell)}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {body.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{renderInlineMarkdown(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    tableRows = [];
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const isTableLine = trimmed.startsWith("|") && trimmed.endsWith("|");

    if (isTableLine) {
      flushBullets();
      tableRows.push(trimmed);
      return;
    }

    flushTable();

    if (trimmed.startsWith("- ")) {
      bulletItems.push(trimmed.slice(2));
      return;
    }

    flushBullets();

    if (!trimmed) {
      blocks.push(<div className="mandy-message-spacer" key={`space-${index}`} />);
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push(
        <div className="mandy-message-heading" key={`heading-${index}`}>
          {renderInlineMarkdown(headingMatch[2])}
        </div>
      );
      return;
    }

    blocks.push(
      <div className="mandy-message-line" key={`line-${index}`}>
        {renderInlineMarkdown(line)}
      </div>
    );
  });

  flushBullets();
  flushTable();
  return blocks;
}

export default function ChatWidget({ apiUrl = "/api/chat" }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const composerRef = useRef(null);

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const focusDesktopInput = () => {
      if (window.matchMedia("(min-width: 801px)").matches) {
        inputRef.current?.focus();
      }
    };

    // Keep the desktop composer active as soon as the widget is ready.
    focusDesktopInput();

    // Re-focus after each rendered response. Mobile is deliberately excluded
    // so the on-screen keyboard is never opened automatically.
    const frame = window.requestAnimationFrame(focusDesktopInput);
    return () => window.cancelAnimationFrame(frame);
  }, [messages, loading]);

  useEffect(() => {
    if (typeof window === "undefined" || loading) return;
    if (!window.matchMedia("(max-width: 800px)").matches) return;
    if (messages.length <= 1) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role !== "assistant") return;

    const timer = window.setTimeout(() => {
      composerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });

      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 140);

    return () => window.clearTimeout(timer);
  }, [messages, loading]);

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

    // On desktop the composer stays focused. On mobile, blur and scroll
    // to the composer so the keyboard behavior remains unchanged.
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 800px)").matches) {
      inputRef.current?.blur();
      window.setTimeout(() => {
        composerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 320);
    }

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
    }
  }

  return (
    <section
      className={`mandy-chat-card ${messages.length > 1 ? "has-conversation" : ""}`}
      aria-label="Chat con Mandy"
    >
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
              <div className="mandy-bubble">{renderMessageContent(message.content)}</div>
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

      {messages.length > 1 && (
        <div className="mandy-style-actions" aria-label="Modalità di spiegazione">
          {STYLE_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`mandy-style-action ${action.direct ? "mandy-style-action-direct" : ""}`}
              onClick={() => sendMessage(action.prompt)}
              disabled={loading}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      <form
        ref={composerRef}
        className="mandy-input-row"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage(input);
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          rows={1}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder="Scrivi qui la tua domanda..."
          aria-label="Scrivi una domanda a Mandy"
          enterKeyHint="send"
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
