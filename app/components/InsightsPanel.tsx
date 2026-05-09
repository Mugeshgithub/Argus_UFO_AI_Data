"use client"
import { INSIGHTS, CLASSIFICATIONS } from "@/lib/data"
import { TrendingUp, PieChart, Zap } from "lucide-react"

export default function InsightsPanel() {
  const total = CLASSIFICATIONS.reduce((s, c) => s + c.count, 0)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-cyan-500/15 shrink-0">
        <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-xs text-slate-400 tracking-wider">INTELLIGENCE INSIGHTS</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">

        {/* Key Stats */}
        <div>
          <SectionLabel icon={<Zap className="w-3 h-3" />} label="KEY FINDINGS" />
          <div className="space-y-2 mt-2">
            {INSIGHTS.map((ins, i) => (
              <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-surface2/60 border border-cyan-500/10 hover:border-cyan-500/25 transition-all">
                <div className="text-xl font-bold text-cyan-400 shrink-0 glow-text">{ins.stat}</div>
                <div className="text-xs text-slate-400 leading-relaxed self-center">{ins.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Classification Breakdown */}
        <div>
          <SectionLabel icon={<PieChart className="w-3 h-3" />} label="CASE CLASSIFICATION" />
          <div className="space-y-2.5 mt-2">
            {CLASSIFICATIONS.map(c => (
              <div key={c.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-slate-300">{c.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{c.count}</span>
                    <span className="text-[10px] font-bold" style={{ color: c.color }}>{c.pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${c.pct}%`, background: c.color, boxShadow: `0 0 8px ${c.color}60` }}
                  />
                </div>
              </div>
            ))}
            <div className="text-[10px] text-slate-600 text-right">{total} total classified cases</div>
          </div>
        </div>

        {/* Observable Characteristics */}
        <div>
          <SectionLabel icon={<Zap className="w-3 h-3" />} label="5 OBSERVABLE UAP CHARACTERISTICS" />
          <div className="mt-2 space-y-1.5">
            {[
              { n: "01", label: "Sudden Acceleration", desc: "Instantaneous velocity changes exceeding known aerodynamics" },
              { n: "02", label: "Hypersonic Velocity", desc: "Speeds exceeding Mach 10–14 without sonic boom" },
              { n: "03", label: "Low Observability", desc: "No radar return or selectively visible on sensors" },
              { n: "04", label: "Trans-Medium Travel", desc: "Seamless transition between air, space, and water" },
              { n: "05", label: "Positive Lift", desc: "Sustained flight with no visible propulsion or exhaust" },
            ].map(item => (
              <div key={item.n} className="flex gap-2.5 p-2 rounded bg-surface2/50">
                <span className="text-cyan-500/60 text-[10px] font-mono shrink-0 mt-0.5">{item.n}</span>
                <div>
                  <div className="text-[11px] text-slate-200 font-medium">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
            <div className="text-[10px] text-slate-600 pt-1">Source: Pentagon 2021 UAP Preliminary Assessment</div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <SectionLabel icon={<TrendingUp className="w-3 h-3" />} label="INCIDENT TIMELINE" />
          <div className="mt-2 space-y-1">
            {[
              { year: "1967", event: "Malmstrom AFB ICBM shutdowns — 10 missiles offline simultaneously" },
              { year: "1980", event: "Rendlesham Forest — US USAF physical encounter, radiation measured" },
              { year: "1986", event: "JAL 1628 — FAA radar confirms 2-carrier-size object over Alaska" },
              { year: "1997", event: "Phoenix Lights — 10,000+ witnesses, Governor acknowledges" },
              { year: "2004", event: "USS Nimitz Tic-Tac — FLIR video, 6 Navy pilots, 80,000ft drop" },
              { year: "2015", event: "USS Roosevelt — Gimbal & GoFast FLIR videos, East Coast fleet" },
              { year: "2019", event: "USS Omaha — pyramid UAPs tracked, trans-medium descent confirmed" },
              { year: "2021", event: "Pentagon UAP Report — 144 incidents, officially unresolved" },
              { year: "2022", event: "Congress UAP hearings — first in 50 years, classified briefings" },
              { year: "2023", event: "AARO releases historical report — 800+ cases, 26 advanced-tech flags" },
            ].map(t => (
              <div key={t.year} className="flex gap-2.5 text-[10px]">
                <span className="text-cyan-500 font-bold shrink-0 w-10">{t.year}</span>
                <span className="text-slate-400">{t.event}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 tracking-widest">
      <span className="text-cyan-500">{icon}</span>
      {label}
    </div>
  )
}
