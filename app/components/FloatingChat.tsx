"use client"
import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User, Minimize2 } from "lucide-react"

type Msg = { role: "user" | "assistant"; content: string }

const SYSTEM = `You are ARGUS — an AI anomaly intelligence analyst specializing in declassified US government UAP (Unidentified Aerial Phenomena) data.

Your knowledge base includes:
- Pentagon 2021 UAP Preliminary Assessment (144 incidents, 2004–2021)
- AARO reports and 800+ case database (2022–2024)
- Key incidents: USS Nimitz Tic-Tac (2004), USS Roosevelt Gimbal/GoFast (2015), USS Omaha (2019), Malmstrom AFB ICBM shutdowns (1967), Rendlesham Forest (1980), JAL 1628 (1986), Phoenix Lights (1997)
- The 5 observable UAP characteristics identified by Pentagon: sudden acceleration, hypersonic velocity, low observability, trans-medium travel, positive lift without visible propulsion
- Congressional hearings 2022–2023 including David Grusch whistleblower testimony

Tone: analytical, precise, intelligence-grade. Be concise for chat. Reference specific reports and dates when relevant.`

const QUICK_QUESTIONS = [
  "What is the Tic-Tac?",
  "What are the 5 UAP signatures?",
  "Grusch testimony summary",
]

export default function FloatingChat({ apiKey }: { apiKey: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setUnread(0)
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [open, messages])

  async function send(text?: string) {
    const q = (text ?? input).trim()
    if (!q) return

    setInput("")

    if (!apiKey) {
      setMessages(m => [...m,
        { role: "user", content: q },
        { role: "assistant", content: "⚠ API key not configured. Click 'SET API KEY' in the navigation bar to activate ARGUS." },
      ])
      if (!open) setUnread(u => u + 1)
      return
    }

    setLoading(true)
    const next: Msg[] = [...messages, { role: "user", content: q }]
    setMessages(next)

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "system", content: SYSTEM }, ...next.map(m => ({ role: m.role, content: m.content }))],
          temperature: 0.3,
          max_tokens: 600,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const reply = data.choices[0].message.content
      setMessages([...next, { role: "assistant", content: reply }])
      if (!open) setUnread(u => u + 1)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${msg}` }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: 90,
          right: 24,
          width: 380,
          height: 520,
          zIndex: 9999,
          background: "rgba(10,22,40,0.98)",
          border: "1px solid rgba(6,182,212,0.3)",
          borderRadius: 16,
          backdropFilter: "blur(24px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(6,182,212,0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "chatSlideIn 0.25s ease-out",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(6,182,212,0.15)",
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(6,182,212,0.04)",
            flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(6,182,212,0.12)",
              border: "1.5px solid rgba(6,182,212,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot style={{ width: 16, height: 16, color: "#06b6d4" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>ARGUS AI</div>
              <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.1em" }}>
                {apiKey ? "ONLINE" : "API KEY REQUIRED"}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none", border: "none",
                color: "#64748b", cursor: "pointer", padding: 4,
                borderRadius: 6,
                display: "flex", alignItems: "center",
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto",
            padding: "16px",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            {messages.length === 0 && (
              <div style={{ paddingTop: 20, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.2 }}>⬡</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
                  Ask ARGUS about any UAP incident
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {QUICK_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      style={{
                        padding: "8px 12px",
                        background: "none",
                        border: "1px solid rgba(6,182,212,0.2)",
                        borderRadius: 8,
                        color: "rgba(148,163,184,0.8)",
                        fontSize: 11,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "inherit",
                        textAlign: "left",
                      }}
                      onMouseEnter={e => {
                        ;(e.currentTarget.style.borderColor = "rgba(6,182,212,0.5)")
                        ;(e.currentTarget.style.background = "rgba(6,182,212,0.06)")
                        ;(e.currentTarget.style.color = "#06b6d4")
                      }}
                      onMouseLeave={e => {
                        ;(e.currentTarget.style.borderColor = "rgba(6,182,212,0.2)")
                        ;(e.currentTarget.style.background = "none")
                        ;(e.currentTarget.style.color = "rgba(148,163,184,0.8)")
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{
                display: "flex",
                flexDirection: m.role === "user" ? "row-reverse" : "row",
                gap: 8,
                alignItems: "flex-end",
              }}>
                <div style={{
                  width: 24, height: 24,
                  borderRadius: 6,
                  background: m.role === "user"
                    ? "rgba(100,116,139,0.2)"
                    : "rgba(6,182,212,0.1)",
                  border: m.role === "user"
                    ? "1px solid rgba(100,116,139,0.3)"
                    : "1px solid rgba(6,182,212,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {m.role === "user"
                    ? <User style={{ width: 11, height: 11, color: "#64748b" }} />
                    : <Bot style={{ width: 11, height: 11, color: "#06b6d4" }} />
                  }
                </div>
                <div style={{
                  maxWidth: "78%",
                  padding: "9px 12px",
                  borderRadius: 10,
                  fontSize: 11,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  ...(m.role === "user"
                    ? { background: "#06b6d4", color: "#020817", fontWeight: 600 }
                    : { background: "rgba(15,32,64,0.8)", border: "1px solid rgba(6,182,212,0.12)", color: "#cbd5e1" }
                  ),
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: "rgba(6,182,212,0.1)",
                  border: "1px solid rgba(6,182,212,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Bot style={{ width: 11, height: 11, color: "#06b6d4" }} />
                </div>
                <div style={{
                  padding: "9px 14px",
                  background: "rgba(15,32,64,0.8)",
                  border: "1px solid rgba(6,182,212,0.12)",
                  borderRadius: 10,
                  display: "flex", gap: 4, alignItems: "center",
                }}>
                  {[0, 150, 300].map(d => (
                    <div key={d} style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: "#06b6d4",
                      animation: "bounceDot 1s infinite",
                      animationDelay: `${d}ms`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(6,182,212,0.1)",
            flexShrink: 0,
            display: "flex", gap: 8,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask about any UAP incident..."
              style={{
                flex: 1,
                background: "rgba(15,32,64,0.8)",
                border: "1px solid rgba(6,182,212,0.2)",
                borderRadius: 8,
                padding: "9px 12px",
                color: "#e2e8f0",
                fontSize: 11,
                outline: "none",
                fontFamily: "inherit",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(6,182,212,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(6,182,212,0.2)")}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                padding: "9px 13px",
                borderRadius: 8,
                background: loading || !input.trim() ? "rgba(100,116,139,0.15)" : "#06b6d4",
                color: loading || !input.trim() ? "#64748b" : "#020817",
                border: "none", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center",
                transition: "all 0.15s",
              }}
            >
              <Send style={{ width: 13, height: 13 }} />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: open ? "#0f2040" : "#06b6d4",
          border: `2px solid ${open ? "rgba(6,182,212,0.4)" : "transparent"}`,
          boxShadow: open
            ? "0 0 20px rgba(6,182,212,0.3)"
            : "0 0 32px rgba(6,182,212,0.5), 0 8px 24px rgba(0,0,0,0.4)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.25s",
        }}
        onMouseEnter={e => {
          if (!open) (e.currentTarget.style.boxShadow = "0 0 48px rgba(6,182,212,0.7), 0 8px 32px rgba(0,0,0,0.5)")
        }}
        onMouseLeave={e => {
          if (!open) (e.currentTarget.style.boxShadow = "0 0 32px rgba(6,182,212,0.5), 0 8px 24px rgba(0,0,0,0.4)")
        }}
      >
        {open
          ? <X style={{ width: 22, height: 22, color: "#06b6d4" }} />
          : <MessageCircle style={{ width: 22, height: 22, color: "#020817" }} />
        }

        {/* Unread badge */}
        {!open && unread > 0 && (
          <div style={{
            position: "absolute",
            top: -4, right: -4,
            width: 18, height: 18,
            borderRadius: "50%",
            background: "#ef4444",
            border: "2px solid #020817",
            fontSize: 9, fontWeight: 700,
            color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {unread}
          </div>
        )}

        {/* Pulse ring when closed */}
        {!open && (
          <div style={{
            position: "absolute",
            inset: -8,
            borderRadius: "50%",
            border: "2px solid rgba(6,182,212,0.3)",
            animation: "floatPulse 2s ease-out infinite",
            pointerEvents: "none",
          }} />
        )}
      </button>

      <style>{`
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounceDot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes floatPulse {
          0%   { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </>
  )
}
