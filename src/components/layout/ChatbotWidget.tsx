"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, RefreshCw, Minimize2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Message = {
  role: "user" | "assistant";
  content: string;
  id: string;
};

// ── Broker links fetched live from Supabase ───────────────────────────────────
function makeBrokersClickable(
  text: string,
  brokerLinks: Record<string, string>
): React.ReactNode[] {
  if (!Object.keys(brokerLinks).length) return [text];
  const names = Object.keys(brokerLinks).sort((a, b) => b.length - a.length);
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${names.map(escapeRegex).join("|")})`, "g");
  const parts = text.split(pattern);
  return parts.map((part, i) => {
    const url = brokerLinks[part];
    if (url) {
      return (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function renderContent(text: string, brokerLinks: Record<string, string>): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[([^\]]+)\]\(([^)]+)\))/g);
  const result: React.ReactNode[] = [];
  let i = 0;
  while (i < parts.length) {
    const part = parts[i];
    if (!part) { i++; continue; }
    if (part.startsWith("**") && part.endsWith("**")) {
      result.push(<strong key={i}>{part.slice(2, -2)}</strong>);
    } else if (part.startsWith("[") && part.includes("](")) {
      const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        result.push(<a key={i} href={m[2]} target="_blank" rel="noopener noreferrer"
          style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 2 }}>{m[1]}</a>);
      } else {
        result.push(...makeBrokersClickable(part, brokerLinks).map((n, j) =>
          React.isValidElement(n) ? React.cloneElement(n as React.ReactElement, { key: `${i}-${j}` }) : n
        ));
      }
    } else {
      result.push(...makeBrokersClickable(part, brokerLinks).map((n, j) =>
        React.isValidElement(n) ? React.cloneElement(n as React.ReactElement, { key: `${i}-${j}` }) : n
      ));
    }
    i++;
  }
  return result;
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: "50%",
          backgroundColor: "var(--accent)",
          animation: `widgetBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes widgetBounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}`}</style>
    </div>
  );
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [brokerLinks, setBrokerLinks] = useState<Record<string, string>>({});
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch live affiliate URLs from Supabase
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
            : `/dashboard/courtiers/${b.slug}`;
          map[b.name] = url;
          if (b.name === "Interactive Brokers") map["IBKR"] = url;
          if (b.name === "Degiro") map["DEGIRO"] = url;
          if (b.name === "BoursoBank") map["Boursobank"] = url;
          if (b.name === "Saxo Banque") map["Saxo"] = url;
        }
        setBrokerLinks(map);
      });
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
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
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.content,
        id: (Date.now() + 1).toString(),
      }]);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Le conseiller IA est momentanément indisponible.",
        id: (Date.now() + 1).toString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Floating panel ─────────────────────────────────────────────────── */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            width: "min(400px, calc(100vw - 32px))",
            height: "min(560px, calc(100dvh - 120px))",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
            animation: "widgetSlideUp 180ms cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          <style>{`
            @keyframes widgetSlideUp {
              from { opacity: 0; transform: translateY(16px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0)   scale(1);    }
            }
          `}</style>

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px",
            backgroundColor: "var(--accent)",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: "#fff",
              }}>AI</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Conseiller IA</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>VideoBourse · ArbitrAge</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  title="Nouvelle conversation"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.8)", padding: 6, borderRadius: 6,
                    display: "flex", alignItems: "center",
                  }}
                >
                  <RefreshCw size={13} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.8)", padding: 6, borderRadius: 6,
                  display: "flex", alignItems: "center",
                }}
              >
                <Minimize2 size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "12px 12px 0",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            {messages.length === 0 && (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "24px 16px", textAlign: "center", gap: 8,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: "var(--accent-light)",
                  border: "1px solid var(--accent-mid)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: "var(--accent-text)",
                }}>AI</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                  Comment puis-je vous aider ?
                </p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                  ETF, courtiers, frais, fiscalité…<br />posez vos questions.
                </p>
                {/* Quick suggestions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", marginTop: 8 }}>
                  {[
                    "Quel courtier pour débuter avec 100€/mois ?",
                    "ETF S&P 500 éligible PEA le moins cher ?",
                    "PEA ou CTO, quelle différence fiscale ?",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      style={{
                        padding: "8px 12px", borderRadius: 8, fontSize: 11,
                        color: "var(--text-muted)", backgroundColor: "var(--bg)",
                        border: "1px solid var(--border)", cursor: "pointer",
                        textAlign: "left", lineHeight: 1.4,
                        transition: "border-color 120ms, color 120ms",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--accent)";
                        e.currentTarget.style.color = "var(--text)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--text-muted)";
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const lines = msg.content.split("\n");
              return (
                <div key={msg.id} style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  gap: 6, alignItems: "flex-end",
                }}>
                  {!isUser && (
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      backgroundColor: "var(--accent-light)", border: "1px solid var(--accent-mid)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 800, color: "var(--accent-text)",
                    }}>AI</div>
                  )}
                  <div style={{
                    maxWidth: "82%", padding: "9px 12px",
                    borderRadius: isUser ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                    fontSize: 12.5, lineHeight: 1.6,
                    color: isUser ? "#fff" : "var(--text)",
                    backgroundColor: isUser ? "var(--accent)" : "var(--bg)",
                    border: isUser ? "none" : "1px solid var(--border)",
                    whiteSpace: "pre-wrap",
                  }}>
                    {lines.map((line, li) => (
                      <span key={li}>
                        {renderContent(line, brokerLinks)}
                        {li < lines.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  backgroundColor: "var(--accent-light)", border: "1px solid var(--accent-mid)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 800, color: "var(--accent-text)",
                }}>AI</div>
                <div style={{
                  padding: "9px 12px", borderRadius: "14px 14px 14px 3px",
                  backgroundColor: "var(--bg)", border: "1px solid var(--border)",
                }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} style={{ height: 8 }} />
          </div>

          {/* Input */}
          <div style={{
            padding: "10px 12px",
            borderTop: "1px solid var(--border)",
            backgroundColor: "var(--surface)",
            flexShrink: 0,
          }}>
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 8,
              backgroundColor: "var(--bg)",
              border: "1.5px solid var(--border)",
              borderRadius: 10, padding: "8px 8px 8px 12px",
              transition: "border-color 150ms",
            }}
              onFocusCapture={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
              onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Posez votre question…"
                rows={1}
                style={{
                  flex: 1, border: "none", outline: "none", resize: "none",
                  backgroundColor: "transparent", fontSize: 12.5,
                  lineHeight: 1.5, color: "var(--text)", fontFamily: "inherit",
                  maxHeight: 80, overflowY: "auto",
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: "none",
                  backgroundColor: loading || !input.trim() ? "var(--border)" : "var(--accent)",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "background-color 150ms",
                }}
              >
                <Send size={13} color="#fff" />
              </button>
            </div>
            <p style={{ fontSize: 9.5, color: "var(--text-faint)", marginTop: 5, textAlign: "center" }}>
              Données indicatives · Non contractuelles
            </p>
          </div>
        </div>
      )}

      {/* ── FAB button ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le conseiller IA" : "Ouvrir le conseiller IA"}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 52,
          height: 52,
          borderRadius: "50%",
          backgroundColor: "var(--accent)",
          border: "none",
          cursor: "pointer",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)",
          transition: "transform 150ms ease, box-shadow 150ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.22)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)";
        }}
      >
        {open
          ? <X size={20} color="#fff" />
          : <MessageCircle size={20} color="#fff" />
        }
        {/* Unread badge */}
        {!open && unread > 0 && (
          <div style={{
            position: "absolute", top: 2, right: 2,
            width: 16, height: 16, borderRadius: "50%",
            backgroundColor: "#ef4444",
            border: "2px solid var(--bg)",
            fontSize: 9, fontWeight: 700, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {unread}
          </div>
        )}
      </button>
    </>
  );
}
