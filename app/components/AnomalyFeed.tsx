"use client"
// Component not used in main SPA — kept for reference
const FEED_EVENTS: { id:string; time:string; type:string; severity:string; text:string; region:string }[] = []

const typeColors: Record<string, { bg: string; text: string }> = {
  RADAR:  { bg: "bg-cyan-500/10  border-cyan-500/30",  text: "text-cyan-400"  },
  VISUAL: { bg: "bg-purple-500/10 border-purple-500/30", text: "text-purple-400" },
  MULTI:  { bg: "bg-red-500/10    border-red-500/30",    text: "text-red-400"   },
  PILOT:  { bg: "bg-amber-500/10  border-amber-500/30",  text: "text-amber-400" },
  SENSOR: { bg: "bg-green-500/10  border-green-500/30",  text: "text-green-400" },
}

const severityDot: Record<string, string> = {
  HIGH: "bg-red-500 shadow-[0_0_8px_#ef4444]",
  MED:  "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
  LOW:  "bg-cyan-500 shadow-[0_0_8px_#06b6d4]",
}

export default function AnomalyFeed() {
  const doubled = [...FEED_EVENTS, ...FEED_EVENTS]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-cyan-500/15 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-blink shadow-[0_0_8px_#00ff88]" />
          <span className="text-xs text-slate-400 tracking-wider">LIVE ANOMALY FEED</span>
        </div>
        <span className="text-[10px] text-slate-600">{FEED_EVENTS.length} ACTIVE SIGNALS</span>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {/* Gradient fades */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0a1628] to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0a1628] to-transparent z-10 pointer-events-none" />

        <div className="animate-feed px-3 py-2 flex flex-col gap-2">
          {doubled.map((ev, i) => {
            const t = typeColors[ev.type] || typeColors.RADAR
            return (
              <div key={`${ev.id}-${i}`} className="group cursor-default">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface2/60 border border-cyan-500/10 hover:border-cyan-500/30 transition-all hover:bg-surface2">
                  {/* Severity dot */}
                  <div className="shrink-0 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${severityDot[ev.severity]}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`tag border ${t.bg} ${t.text}`}>{ev.type}</span>
                      <span className="text-[10px] text-slate-600 font-mono">{ev.time}</span>
                      <span className="text-[10px] text-slate-500 ml-auto truncate">{ev.region}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{ev.text}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
