"use client"
import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Zap } from "lucide-react"

type Msg = { role: "user" | "assistant"; content: string }

const SYSTEM = `You are ARGUS — an AI anomaly intelligence analyst specializing in declassified US government UAP (Unidentified Aerial Phenomena) data.

Your knowledge base includes:
- Pentagon 2021 UAP Preliminary Assessment (144 incidents, 2004–2021)
- AARO reports and 800+ case database (2022–2024)
- Key incidents: USS Nimitz Tic-Tac (2004), USS Roosevelt Gimbal/GoFast (2015), USS Omaha (2019), Malmstrom AFB ICBM shutdowns (1967), Rendlesham Forest (1980), JAL 1628 (1986), Phoenix Lights (1997)
- The 5 observable UAP characteristics identified by Pentagon: sudden acceleration, hypersonic velocity, low observability, trans-medium travel, positive lift without visible propulsion
- Congressional hearings 2022–2023 including David Grusch whistleblower testimony
- NDAA 2022/2023 UAP transparency provisions
- CIA CREST declassified document archive
- NUFORC database patterns

Tone: analytical, precise, intelligence-grade. Reference specific reports and dates. No speculation beyond documented evidence. Format responses clearly with key points. Acknowledge uncertainty honestly.`

const SUGGESTED_QUESTIONS = [
  "Analyze the USS Nimitz 2004 encounter in detail",
  "What patterns exist across high-credibility UAP cases?",
  "Explain the 5 observable UAP characteristics",
  "What did David Grusch testify to Congress?",
  "Which locations have the highest incident density?",
  "How does AARO classify UAP cases?",
  "Compare the Gimbal and Tic-Tac encounters",
  "What is the significance of the Malmstrom incident?",
]

export default function AISection({ apiKey }: { apiKey: string }) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send(text?: string) {
    const q = (text ?? input).trim()
    if (!q) return

    if (!apiKey) {
      setMessages(m => [...m, {
        role: "user", content: q,
      }, {
        role: "assistant",
        content: "⚠ ARGUS requires an API key to process queries. Click 'SET API KEY' in the navigation bar and enter your OpenAI API key to activate the intelligence engine.",
      }])
      setInput("")
      return
    }

    setInput("")
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
          max_tokens: 1200,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const reply = data.choices[0].message.content
      setMessages([...next, { role: "assistant", content: reply }])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${msg}` }])
    }
    setLoading(false)
  }

  return (
    <section id="ai" style={{
      background: "#020817",
      padding: "96px 0",
      borderTop: "1px solid rgba(6,182,212,0.08)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        {/* Section header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "rgba(6,182,212,0.1)",
              border: "1px solid rgba(6,182,212,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12,
            }}>
              ⬡
            </div>
            <span style={{ fontSize: 10, color: "#06b6d4", letterSpacing: "0.3em" }}>06 · AI INTELLIGENCE ENGINE</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(6,182,212,0.3), transparent)" }} />
          </div>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.01em" }}>
            ARGUS AI Analyst
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>
            Query the intelligence engine about any UAP incident, pattern, or government disclosure.
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: 24,
          alignItems: "start",
        }}
          className="ai-grid"
        >
          {/* Left — description + suggested questions */}
          <div style={{
            background: "rgba(10,22,40,0.7)",
            border: "1px solid rgba(6,182,212,0.12)",
            borderRadius: 12,
            padding: "24px",
          }}>
            {/* Argus icon */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56,
                borderRadius: "50%",
                background: "rgba(6,182,212,0.1)",
                border: "2px solid rgba(6,182,212,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 14,
                boxShadow: "0 0 32px rgba(6,182,212,0.2)",
              }}>
                <Bot style={{ width: 24, height: 24, color: "#06b6d4" }} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0", marginBottom: 6 }}>
                ARGUS AI
              </div>
              <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em", marginBottom: 12 }}>
                INTELLIGENCE ANALYSIS ENGINE v2.4
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
                Trained on declassified Pentagon UAP reports, AARO case database, Congressional testimony,
                CIA FOIA documents, and open-source intelligence from verified government sources.
              </p>
            </div>

            {/* Capability badges */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {[
                { icon: "◉", text: "800+ case pattern recognition" },
                { icon: "△", text: "Pentagon report cross-reference" },
                { icon: "⬡", text: "Congressional testimony analysis" },
                { icon: "∿", text: "Behavioral pattern detection" },
              ].map(cap => (
                <div key={cap.text} style={{
                  display: "flex", gap: 10, alignItems: "center",
                  padding: "8px 10px",
                  background: "rgba(6,182,212,0.04)",
                  borderRadius: 6,
                }}>
                  <span style={{ color: "#06b6d4", fontSize: 12 }}>{cap.icon}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{cap.text}</span>
                </div>
              ))}
            </div>

            {/* Suggested questions */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Zap style={{ width: 11, height: 11, color: "#06b6d4" }} />
                <span style={{ fontSize: 9, color: "#06b6d4", letterSpacing: "0.2em" }}>SUGGESTED QUERIES</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      background: "none",
                      border: "1px solid rgba(6,182,212,0.15)",
                      borderRadius: 6,
                      color: "rgba(148,163,184,0.8)",
                      fontSize: 11,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      lineHeight: 1.4,
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={e => {
                      ;(e.currentTarget.style.borderColor = "rgba(6,182,212,0.5)")
                      ;(e.currentTarget.style.background = "rgba(6,182,212,0.06)")
                      ;(e.currentTarget.style.color = "#06b6d4")
                    }}
                    onMouseLeave={e => {
                      ;(e.currentTarget.style.borderColor = "rgba(6,182,212,0.15)")
                      ;(e.currentTarget.style.background = "none")
                      ;(e.currentTarget.style.color = "rgba(148,163,184,0.8)")
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {!apiKey && (
              <div style={{
                marginTop: 16,
                padding: "10px 12px",
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 8,
                fontSize: 10, color: "#f59e0b",
                lineHeight: 1.5,
              }}>
                ⚠ Set your OpenAI API key in the nav bar to enable live queries.
              </div>
            )}
          </div>

          {/* Right — chat interface */}
          <div style={{
            background: "rgba(10,22,40,0.7)",
            border: "1px solid rgba(6,182,212,0.12)",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            height: 620,
          }}>
            {/* Chat header */}
            <div style={{
              padding: "14px 20px",
              borderBottom: "1px solid rgba(6,182,212,0.1)",
              display: "flex", alignItems: "center", gap: 10,
              flexShrink: 0,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: apiKey ? "#00ff88" : "#64748b",
                boxShadow: apiKey ? "0 0 8px #00ff88" : "none",
              }} className={apiKey ? "animate-blink" : ""} />
              <span style={{ fontSize: 11, color: "#94a3b8", letterSpacing: "0.15em" }}>
                {apiKey ? "ARGUS ONLINE · READY" : "ARGUS OFFLINE · API KEY REQUIRED"}
              </span>
              <span style={{
                marginLeft: "auto",
                padding: "3px 10px", borderRadius: 12,
                border: "1px solid rgba(6,182,212,0.3)",
                background: "rgba(6,182,212,0.06)",
                fontSize: 9, color: "#06b6d4", letterSpacing: "0.1em",
              }}>
                GPT-4o
              </span>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", paddingTop: 60 }}>
                  <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>⬡</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
                    ARGUS AI ready for queries.
                  </div>
                  <div style={{ fontSize: 11, color: "#475569" }}>
                    Select a suggested question or type your own.
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}>
                  {m.role === "assistant" && (
                    <div style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: "rgba(6,182,212,0.1)",
                      border: "1px solid rgba(6,182,212,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 2,
                    }}>
                      <Bot style={{ width: 14, height: 14, color: "#06b6d4" }} />
                    </div>
                  )}
                  <div style={{
                    maxWidth: "82%",
                    padding: "12px 16px",
                    borderRadius: 10,
                    fontSize: 12,
                    lineHeight: 1.65,
                    whiteSpace: "pre-wrap",
                    ...(m.role === "user"
                      ? {
                        background: "#06b6d4",
                        color: "#020817",
                        fontWeight: 600,
                      }
                      : {
                        background: "rgba(15,32,64,0.8)",
                        border: "1px solid rgba(6,182,212,0.15)",
                        color: "#cbd5e1",
                      }
                    ),
                  }}>
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <div style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: "rgba(100,116,139,0.2)",
                      border: "1px solid rgba(100,116,139,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 2,
                    }}>
                      <User style={{ width: 14, height: 14, color: "#64748b" }} />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: "rgba(6,182,212,0.1)",
                    border: "1px solid rgba(6,182,212,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Bot style={{ width: 14, height: 14, color: "#06b6d4" }} />
                  </div>
                  <div style={{
                    padding: "12px 16px",
                    background: "rgba(15,32,64,0.8)",
                    border: "1px solid rgba(6,182,212,0.15)",
                    borderRadius: 10,
                    display: "flex", gap: 6, alignItems: "center",
                  }}>
                    {[0, 150, 300].map(d => (
                      <div key={d} style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#06b6d4",
                        animation: "bounce 1s infinite",
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
              padding: "14px 20px",
              borderTop: "1px solid rgba(6,182,212,0.1)",
              flexShrink: 0,
              display: "flex", gap: 10,
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder={apiKey ? "Query the intelligence database..." : "Set API key to activate queries..."}
                style={{
                  flex: 1,
                  background: "rgba(15,32,64,0.8)",
                  border: "1px solid rgba(6,182,212,0.2)",
                  borderRadius: 8,
                  padding: "11px 16px",
                  color: "#e2e8f0",
                  fontSize: 12,
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(6,182,212,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(6,182,212,0.2)")}
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                style={{
                  padding: "11px 18px",
                  borderRadius: 8,
                  background: loading || !input.trim() ? "rgba(100,116,139,0.2)" : "#06b6d4",
                  color: loading || !input.trim() ? "#64748b" : "#020817",
                  border: "none",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center",
                }}
              >
                <Send style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @media (max-width: 900px) {
          .ai-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
