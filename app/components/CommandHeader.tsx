"use client"
import { useState, useEffect } from "react"
import { Shield, Radio, Zap, Globe, AlertTriangle } from "lucide-react"

export default function CommandHeader({ apiKey, onApiKey }: { apiKey: string, onApiKey: (k: string) => void }) {
  const [time, setTime] = useState("")
  const [inputVisible, setInputVisible] = useState(false)
  const [draft, setDraft] = useState(apiKey)

  useEffect(() => {
    const tick = () => setTime(new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC")
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="glass border-b border-cyan-500/20 sticky top-0 z-50">
      <div className="flex items-center justify-between px-5 py-3 gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border border-cyan-500/40 animate-radar" style={{ borderTopColor: "rgba(6,182,212,0.9)" }} />
            <Shield className="absolute inset-0 m-auto w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-cyan-400 font-bold text-sm tracking-widest glow-text">ARGUS</div>
            <div className="text-slate-500 text-[10px] tracking-widest">UAP INTELLIGENCE COMMAND</div>
          </div>
        </div>

        {/* System Status */}
        <div className="hidden md:flex items-center gap-5">
          <StatusPill icon={<Radio className="w-3 h-3" />} label="LIVE FEED" color="green" active />
          <StatusPill icon={<Zap className="w-3 h-3" />} label="AI ENGINE" color="cyan" active={!!apiKey} />
          <StatusPill icon={<Globe className="w-3 h-3" />} label="GLOBAL MAP" color="cyan" active />
          <StatusPill icon={<AlertTriangle className="w-3 h-3" />} label="ANOMALY SCAN" color="amber" active />
        </div>

        {/* Clock + API Key */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block text-right">
            <div className="text-[10px] text-slate-500 tracking-wider">SYSTEM TIME</div>
            <div className="text-cyan-400 text-xs font-mono animate-flicker">{time}</div>
          </div>

          {inputVisible ? (
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="sk-..."
                className="bg-surface2 border border-cyan-500/30 rounded px-3 py-1.5 text-xs text-slate-200 outline-none w-52 focus:border-cyan-500/70"
              />
              <button
                onClick={() => { onApiKey(draft); setInputVisible(false) }}
                className="bg-cyan-500 text-navy text-xs font-bold px-3 py-1.5 rounded hover:bg-cyan-400 transition-colors"
              >SAVE</button>
              <button onClick={() => setInputVisible(false)} className="text-slate-500 hover:text-slate-300 text-xs px-2">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setInputVisible(true)}
              className={`text-xs px-3 py-1.5 rounded border transition-all ${apiKey ? "border-green-500/40 text-green-400 bg-green-500/10" : "border-amber-500/40 text-amber-400 bg-amber-500/10 animate-pulse"}`}
            >
              {apiKey ? "✓ API KEY SET" : "⚠ SET API KEY"}
            </button>
          )}
        </div>
      </div>

      {/* Scan line */}
      <div className="relative h-0.5 bg-navy overflow-hidden">
        <div className="scan-line" />
      </div>
    </header>
  )
}

function StatusPill({ icon, label, color, active }: { icon: React.ReactNode, label: string, color: string, active: boolean }) {
  const colors: Record<string, string> = {
    green: "text-green-400 border-green-500/30 bg-green-500/10",
    cyan:  "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    amber: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  }
  return (
    <div className={`flex items-center gap-1.5 tag border ${active ? colors[color] : "text-slate-600 border-slate-700 bg-slate-800/50"}`}>
      <span className={active ? "animate-blink" : ""}>{icon}</span>
      {label}
    </div>
  )
}
