"use client"
import { useState } from "react"
import { Search, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { INCIDENTS, type Incident } from "@/lib/data"

const SHAPES = ["All", "Elongated Oval", "Rotating Disc", "Glowing Disc", "V-Shaped Formation", "Massive Walnut-Shaped", "Dark Disc", "Triangular Craft", "Spherical", "Cylindrical", "Metallic Fragments", "Various"]
const CLASSES = ["All", "Unexplained", "Radar Anomaly", "Atmospheric / Unknown Material", "Official Government Report"]

export default function CaseExplorer() {
  const [query, setQuery] = useState("")
  const [shape, setShape] = useState("All")
  const [cls, setCls] = useState("All")
  const [militaryOnly, setMilitaryOnly] = useState(false)
  const [radarOnly, setRadarOnly] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = INCIDENTS.filter(i => {
    const q = query.toLowerCase()
    const matchQ = !q || i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.location.toLowerCase().includes(q)
    const matchShape = shape === "All" || i.shape === shape
    const matchCls = cls === "All" || i.classification === cls
    const matchMil = !militaryOnly || i.military
    const matchRadar = !radarOnly || i.radarConfirmed
    return matchQ && matchShape && matchCls && matchMil && matchRadar
  })

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-cyan-500/15 shrink-0 space-y-3">
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-400 tracking-wider">CASE EXPLORER</span>
          <span className="ml-auto text-[10px] text-slate-600">{filtered.length} / {INCIDENTS.length} CASES</span>
        </div>

        {/* Search + Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-40 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search incidents..."
              className="w-full bg-surface2 border border-cyan-500/20 rounded-lg pl-7 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/50"
            />
          </div>

          <select value={shape} onChange={e => setShape(e.target.value)}
            className="bg-surface2 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-500/50">
            {SHAPES.map(s => <option key={s} value={s}>{s === "All" ? "Shape: All" : s}</option>)}
          </select>

          <select value={cls} onChange={e => setCls(e.target.value)}
            className="bg-surface2 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-500/50">
            {CLASSES.map(c => <option key={c} value={c}>{c === "All" ? "Class: All" : c}</option>)}
          </select>
        </div>

        <div className="flex gap-3">
          <Toggle active={militaryOnly} onClick={() => setMilitaryOnly(v => !v)} label="MILITARY ONLY" />
          <Toggle active={radarOnly}   onClick={() => setRadarOnly(v => !v)}   label="RADAR CONFIRMED" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="text-center text-slate-600 text-xs py-10">No cases match current filters</div>
        )}
        {filtered.map(inc => (
          <CaseCard key={inc.id} incident={inc} expanded={expanded === inc.id} onToggle={() => setExpanded(v => v === inc.id ? null : inc.id)} />
        ))}
      </div>
    </div>
  )
}

function Toggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`tag border transition-all ${active ? "border-cyan-500/50 text-cyan-400 bg-cyan-500/15" : "border-slate-700 text-slate-500 bg-transparent hover:border-slate-600"}`}>
      {active ? "✓" : "○"} {label}
    </button>
  )
}

function CaseCard({ incident: i, expanded, onToggle }: { incident: Incident; expanded: boolean; onToggle: () => void }) {
  const credColor = i.credibility >= 90 ? "#00ff88" : i.credibility >= 75 ? "#06b6d4" : "#f59e0b"

  return (
    <div className={`rounded-lg border transition-all ${expanded ? "border-cyan-500/40 bg-surface2" : "border-cyan-500/10 bg-surface2/50 hover:border-cyan-500/25"}`}>
      <button className="w-full text-left px-3.5 py-2.5" onClick={onToggle}>
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <div className="text-[10px] text-slate-600 font-mono">{i.id}</div>
            <div className="text-[10px] text-slate-500">{i.date}</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-200 truncate">{i.title}</span>
              {expanded ? <ChevronUp className="w-3 h-3 text-slate-500 shrink-0" /> : <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-slate-500">{i.location}</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-sm font-bold" style={{ color: credColor }}>{i.credibility}%</div>
            <div className="text-[9px] text-slate-600">CRED</div>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mt-2 h-0.5 bg-slate-800 rounded">
          <div className="h-full rounded conf-bar transition-all" style={{ width: `${i.credibility}%`, background: credColor, color: credColor }} />
        </div>
      </button>

      {expanded && (
        <div className="px-3.5 pb-3.5 border-t border-cyan-500/15 pt-2.5 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">{i.description}</p>

          <div className="grid grid-cols-3 gap-2">
            <DataCell label="SHAPE" value={i.shape} />
            <DataCell label="DURATION" value={i.duration} />
            <DataCell label="WITNESSES" value={String(i.witnesses)} />
            <DataCell label="SOURCE" value={i.source} />
            <DataCell label="CLASSIFICATION" value={i.classification} />
            <DataCell label="COUNTRY" value={i.country} />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {i.military && <span className="tag border border-cyan-500/30 text-cyan-400 bg-cyan-500/10">MILITARY</span>}
            {i.radarConfirmed && <span className="tag border border-green-500/30 text-green-400 bg-green-500/10">RADAR CONFIRMED</span>}
            {i.tags.map(t => <span key={t} className="tag border border-slate-700 text-slate-400 bg-slate-800/50">{t}</span>)}
          </div>
          <Link href={`/cases/${i.id}`} style={{ display:"inline-block", marginTop:8, fontSize:9, padding:"4px 12px", borderRadius:4, border:"1px solid rgba(6,182,212,0.3)", color:"#06b6d4", textDecoration:"none", letterSpacing:"0.1em" }}>
            VIEW FULL CASE DETAIL →
          </Link>
        </div>
      )}
    </div>
  )
}

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-navy/60 rounded p-2">
      <div className="text-[9px] text-slate-600 tracking-wider mb-0.5">{label}</div>
      <div className="text-[10px] text-slate-300">{value}</div>
    </div>
  )
}
