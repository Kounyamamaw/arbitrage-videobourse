"use client";

import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Send, RefreshCw, TrendingUp, BarChart2, ShieldCheck, Zap, ArrowDown } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  id: string;
};

const SUGGESTIONS = [
  { icon: TrendingUp, text: "Quel ETF S&P500 est éligible PEA et le moins cher ?",       color: "var(--tint-green)" },
  { icon: BarChart2,  text: "Comparer Interactive Brokers et Trade Republic",              color: "var(--tint-blue)" },
  { icon: ShieldCheck, text: "Quel courtier pour commencer avec 100€/mois en DCA ?",      color: "var(--tint-purple)" },
  { icon: Zap,        text: "Quelle est la différence entre TER et tracking difference ?", color: "var(--tint-amber)" },
  { icon: TrendingUp, text: "Meilleur ETF MSCI World pour un CTO à long terme ?",          color: "var(--tint-rose)" },
  { icon: BarChart2,  text: "Quels sont les frais cachés à surveiller chez les courtiers ?", color: "var(--tint-green)" },
];

// Post-process AI response: detect broker names and make them clickable
// brokerLinks is fetched live from Supabase — never hardcoded
function makeBrokersClickable(text: string, brokerLinks: Record<string, string>): React.ReactNode[] {
  // Build a sorted list of broker names (longest first to avoid partial matches)
  const names = Object.keys(brokerLinks).sort((a, b) => b.length - a.length);
  
  // Escape special regex chars in broker names
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
  // Build combined regex — word boundary aware
  const pattern = new RegExp(
    `(${names.map(escapeRegex).join("|")})`,
    "g"
  );

  const parts = text.split(pattern);
  const result: React.ReactNode[] = [];

  parts.forEach((part, i) => {
    const url = brokerLinks[part];
    if (url) {
      result.push(
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--accent)",
            fontWeight: 600,
            textDecoration: "none",
            borderBottom: "1.5px solid var(--accent-mid)",
            paddingBottom: 1,
            transition: "opacity 150ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {part}
        </a>
      );
    } else {
      result.push(part);
    }
  });

  return result;
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          backgroundColor: "var(--accent)",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-6px);opacity:1} }`}</style>
    </div>
  );
}

function MessageBubble({ msg, brokerLinks }: { msg: Message; brokerLinks: Record<string, string> }) {
  const isUser = msg.role === "user";

  // Render content: **bold**, [text](url) markdown links, then broker name detection
  const renderContent = (text: string): React.ReactNode[] => {
    // First split on markdown bold and markdown links
    const parts = text.split(/(\*\*[^*]+\*\*|\[([^\]]+)\]\(([^)]+)\))/g);
    const result: React.ReactNode[] = [];
    let i = 0;
    while (i < parts.length) {
      const part = parts[i];
      if (!part) { i++; continue; }
      if (part.startsWith("**") && part.endsWith("**")) {
        result.push(<strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>);
      } else if (part.startsWith("[") && part.includes("](")) {
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          result.push(
            <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: "2px", fontWeight: 500 }}>
              {linkMatch[1]}
            </a>
          );
        } else {
          // Apply broker clickable detection to plain text
          result.push(...makeBrokersClickable(part, brokerLinks).map((n, j) =>
            React.isValidElement(n) ? React.cloneElement(n as React.ReactElement, { key: `${i}-${j}` }) : n
          ));
        }
      } else {
        // Apply broker clickable detection to plain text
        if (!isUser) {
          result.push(...makeBrokersClickable(part, brokerLinks).map((n, j) =>
            React.isValidElement(n) ? React.cloneElement(n as React.ReactElement, { key: `${i}-${j}` }) : n
          ));
        } else {
          result.push(part);
        }
      }
      i++;
    }
    return result;
  };

  const lines = msg.content.split("\n");
  const formatted = lines.map((line, li) => (
    <span key={li}>
      {renderContent(line)}
      {li < lines.length - 1 && <br />}
    </span>
  ));

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 16,
      gap: 10,
      alignItems: "flex-start",
    }}>
      {!isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
          backgroundColor: "var(--accent-light)",
          border: "1px solid var(--accent-mid)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: "var(--accent-text)",
          fontFamily: "var(--font-sora)",
        }}>
          AI
        </div>
      )}
      <div style={{
        maxWidth: "78%",
        padding: "12px 16px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        fontSize: 14,
        lineHeight: 1.65,
        color: isUser ? "#fff" : "var(--text)",
        backgroundColor: isUser ? "var(--accent)" : "var(--surface)",
        border: isUser ? "none" : "1px solid var(--border)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {formatted}
      </div>
    </div>
  );
}

export function ConseillerIAClient() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [brokerLinks, setBrokerLinks] = useState<Record<string, string>>({});
  const messagesEndRef             = useRef<HTMLDivElement>(null);
  const inputRef                   = useRef<HTMLTextAreaElement>(null);
  const hasMessages                = messages.length > 0;

  // Fetch affiliate URLs live from Supabase — never use hardcoded links
  useEffect(() => {
    supabase
      .from("brokers")
      .select("name, slug, affiliate_url")
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        for (const b of data) {
          if (!b.name) continue;
          const url = b.affiliate_url?.trim()
            ? b.affiliate_url
            : `/comparatif/dashboard/courtiers/${b.slug}`;
          map[b.name] = url;
          // Common alternate spellings / abbreviations
          if (b.name === "Interactive Brokers") map["IBKR"] = url;
          if (b.name === "Degiro") map["DEGIRO"] = url;
          if (b.name === "BoursoBank") map["Boursobank"] = url;
          if (b.name === "Saxo Banque") map["Saxo"] = url;
        }
        setBrokerLinks(map);
      });
  }, []);

  useEffect(() => {
    if (hasMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, hasMessages]);

  const sendMessage = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;

    setError("");
    const userMsg: Message = { role: "user", content: q, id: Date.now().toString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok) throw new Error("Erreur API");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMsg: Message = {
        role: "assistant",
        content: data.content,
        id: (Date.now() + 1).toString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setError("Le conseiller IA est momentanément indisponible, nous nous excusons pour la gêne occasionnée.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const reset = () => {
    setMessages([]);
    setInput("");
    setError("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div style={{
      backgroundColor: "var(--bg)",
      height: "calc(100dvh - 62px)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* ── EMPTY STATE ── */}
      {!hasMessages && (
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "32px 24px 0",
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
          overflowY: "auto",
        }}>
          {/* Logo / titre */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              backgroundColor: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "var(--font-sora)" }}>AI</span>
            </div>
            <h1 style={{
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.03em",
              marginBottom: 8,
            }}>
              Conseiller IA
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>
              Posez vos questions sur les ETF, courtiers et frais.
              Les réponses s'appuient sur nos données vérifiées.
            </p>
          </div>

          {/* Suggestion chips */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: 8,
            marginBottom: 20,
            width: "100%",
          }}>
            {SUGGESTIONS.map(({ icon: Icon, text, color }) => (
              <button
                key={text}
                onClick={() => sendMessage(text)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "11px 13px",
                  borderRadius: 12,
                  backgroundColor: color,
                  border: "1px solid var(--border)",
                  cursor: "pointer", textAlign: "left",
                  transition: "transform 150ms ease, box-shadow 150ms ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-sm)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                <Icon size={14} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.45 }}>{text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── CONVERSATION STATE ── */}
      {hasMessages && (
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 24px 0",
          maxWidth: 760,
          margin: "0 auto",
          width: "100%",
        }}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} brokerLinks={brokerLinks} />
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                backgroundColor: "var(--accent-light)",
                border: "1px solid var(--accent-mid)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "var(--accent-text)",
              }}>
                AI
              </div>
              <div style={{
                padding: "12px 16px",
                borderRadius: "18px 18px 18px 4px",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
              }}>
                <TypingIndicator />
              </div>
            </div>
          )}
          {error && (
            <div style={{
              padding: "12px 16px", borderRadius: 10, marginBottom: 16,
              backgroundColor: "var(--negative-bg)",
              border: "1px solid var(--negative)",
              fontSize: 13, color: "var(--negative)",
            }}>
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* ── BOTTOM INPUT BAR — always sticky at bottom ── */}
      <div style={{
        borderTop: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
        padding: "12px 16px",
        flexShrink: 0,
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {hasMessages && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <button
                onClick={reset}
                className="btn-ghost"
                style={{ gap: 6, fontSize: 12 }}
              >
                <RefreshCw size={12} />
                Nouvelle conversation
              </button>
            </div>
          )}

          <InputBar
            inputRef={inputRef}
            value={input}
            onChange={setInput}
            onKeyDown={handleKeyDown}
            onSend={() => sendMessage(input)}
            loading={loading}
          />

          <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 8, textAlign: "center" }}>
            Session temporaire · Non sauvegardée · Données indicatives, non contractuelles
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Input bar component ────────────────────────────────────────────────────────
function InputBar({
  inputRef, value, onChange, onKeyDown, onSend, loading,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  loading: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      gap: 10,
      backgroundColor: "var(--surface)",
      border: "1.5px solid var(--border)",
      borderRadius: 14,
      padding: "10px 10px 10px 16px",
      width: "100%",
      boxShadow: "var(--shadow-sm)",
      transition: "border-color 150ms ease, box-shadow 150ms ease",
    }}
    onFocusCapture={(e) => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.borderColor = "var(--accent)";
      el.style.boxShadow = "0 0 0 3px rgba(10,155,130,0.1)";
    }}
    onBlurCapture={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "var(--border)";
        el.style.boxShadow = "var(--shadow-sm)";
      }
    }}>
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
        }}
        onKeyDown={onKeyDown}
        placeholder="Posez votre question sur les ETF, courtiers, frais…"
        rows={1}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          resize: "none",
          backgroundColor: "transparent",
          fontSize: 14,
          lineHeight: 1.5,
          color: "var(--text)",
          fontFamily: "inherit",
          maxHeight: 120,
          overflowY: "auto",
        }}
      />
      <button
        onClick={onSend}
        disabled={loading || !value.trim()}
        style={{
          width: 36, height: 36,
          borderRadius: 10,
          backgroundColor: loading || !value.trim() ? "var(--border)" : "var(--accent)",
          border: "none",
          cursor: loading || !value.trim() ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          transition: "background-color 150ms ease",
        }}
      >
        <Send size={15} color="#fff" />
      </button>
    </div>
  );
}