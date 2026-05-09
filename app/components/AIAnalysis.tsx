"use client"
import { useState, useRef, useEffect } from "react"
import { Send, Bot, User } from "lucide-react"

type Msg = { role: "user" | "assistant"; content: string }

const SYSTEM = `You are SENTINEL — an AI anomaly intelligence analyst specializing in declassified US government UAP (Unidentified Aerial Phenomena) data.

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

const SUGGESTIONS = [
  "Analyze the USS Nimitz 2004 encounter in detail",
  "What patterns exist across high-credibility UAP cases?",
  "Compare the 5 observable UAP characteristics",
  "What did David Grusch testify to Congress?",
  "Which locations have the highest incident density?",
  "How does AARO classify UAP cases?",
]

export default function AIAnalysis({ apiKey }: { apiKey: string }) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send(text?: string) {
    const q = (text || input).trim()
    if (!q) return

    if (!apiKey) {
      setMessages(m => [...m, { role: "assistant", content: "⚠ API key not set. Click 'SET API KEY' in the top bar to activate the AI engine." }])
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
      setMessages([...next, { role: "assistant", content: `Error: ${msg}` }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-cyan-500/15 shrink-0">
        <Bot className="w-4 h-4 text-cyan-400" />
        <span className="text-xs text-slate-400 tracking-wider">AI ANALYSIS ENGINE</span>
        <span className="ml-auto tag border border-cyan-500/30 text-cyan-400 bg-cyan-500/10">GPT-4o</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <div className="text-cyan-400/60 text-3xl mb-3">⬡</div>
            <div className="text-slate-400 text-xs mb-5">SENTINEL AI ready. Ask about any UAP incident or pattern.</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-[10px] px-2.5 py-1.5 rounded border border-cyan-500/25 text-cyan-400/70 bg-cyan-500/5 hover:bg-cyan-500/15 hover:border-cyan-500/50 transition-all text-left">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-cyan-500 text-navy font-medium ml-auto"
                : "bg-surface2 border border-cyan-500/20 text-slate-200"
            }`}>
              {m.content}
            </div>
            {m.role === "user" && (
              <div className="w-7 h-7 rounded border border-slate-600 bg-slate-700/50 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="bg-surface2 border border-cyan-500/20 rounded-lg px-4 py-3 flex gap-1.5 items-center">
              {[0, 150, 300].map(d => (
                <div key={d} className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-cyan-500/15 shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Query the intelligence database..."
            className="flex-1 bg-surface2 border border-cyan-500/25 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/60 transition-colors"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-navy rounded-lg px-3.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
