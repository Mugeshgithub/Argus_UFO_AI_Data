"use client"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { FileText, Database, Globe, Zap, Radio, Play } from "lucide-react"
import { INCIDENTS } from "@/lib/data"
import {
  AreaChart, Area,
  BarChart, Bar, XAxis, YAxis,
  PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip,
} from "recharts"

const GlobalMap = dynamic(() => import("./GlobalMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"#06b6d4", fontSize:11, letterSpacing:"0.2em" }}>
      INITIALIZING MAP...
    </div>
  ),
})

type YearRow   = { year: number; count: number }
type ShapeRow  = { shape_clean: string; count: number }
type MovRow    = { movement: string; count: number }
type ExtStats  = {
  total_processed: number; silent_reports: number; hovering_reports: number
  instant_accel_reports: number; military_context: number; physics_violations: number
  high_credibility: number; trans_medium: number; electromagnetic: number; top_anomaly_combo: number
}
type TopCase   = {
  id: string; year: number; state: string; country: string; city: string
  extracted_shape: string | null; sound: string; movement_tags: string[]
  anomaly_behaviors: string[]; credibility_score: number; comment_preview: string
}

const SHAPE_HEX: Record<string, string> = {
  Light:"#06b6d4", Triangle:"#ef4444", Sphere:"#a855f7",
  Circle:"#00ff88", Fireball:"#f59e0b", Disk:"#ec4899",
  Oval:"#3b82f6", Cigar:"#f97316", Unknown:"#8899cc", Formation:"#14b8a6",
}

const SEV_COLOR: Record<string, string> = { HIGH:"#ef4444", MED:"#f59e0b", LOW:"#06b6d4" }
const TYPE_COLOR: Record<string, { bg:string; color:string }> = {
  RADAR:  { bg:"rgba(6,182,212,0.12)",  color:"#06b6d4" },
  VISUAL: { bg:"rgba(168,85,247,0.12)", color:"#a855f7" },
  MULTI:  { bg:"rgba(239,68,68,0.12)",  color:"#ef4444" },
  PILOT:  { bg:"rgba(245,158,11,0.12)", color:"#f59e0b" },
  SENSOR: { bg:"rgba(34,197,94,0.12)",  color:"#22c55e" },
}

function decodeHtml(s: string): string {
  return s
    .replace(/&#44;?/g, ",").replace(/&amp;/g, "&").replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"').replace(/&#33;/g, "!").replace(/&#\d+;/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
}

function caseToFeed(c: TopCase) {
  const hasPhysics  = c.anomaly_behaviors.includes("physics_violation")
  const hasTrans    = c.anomaly_behaviors.includes("trans_medium")
  const hasEM       = c.anomaly_behaviors.includes("electromagnetic")
  const hasCloaking = c.anomaly_behaviors.includes("cloaking")
  const hasInstant  = c.movement_tags.includes("instant_acceleration")
  const hasFormation = c.movement_tags.includes("formation_flight")
  const severity = (hasPhysics || hasTrans || (hasInstant && c.sound === "silent")) ? "HIGH"
                 : (hasEM || hasCloaking || hasFormation) ? "MED" : "LOW"
  const type     = hasTrans ? "MULTI" : hasEM ? "SENSOR" : hasFormation ? "VISUAL" : hasInstant ? "RADAR" : "VISUAL"
  const loc      = [c.city, c.state?.toUpperCase(), c.country !== "us" && c.country ? c.country.toUpperCase() : null].filter(Boolean).join(", ")
  return { id:c.id, time:String(c.year), type, severity, text:decodeHtml(c.comment_preview || ""), region:loc || "Unknown" }
}

const CARD: React.CSSProperties = { background:"rgba(15,25,50,0.75)", border:"1px solid rgba(6,182,212,0.14)", borderRadius:8 }
const THEAD: React.CSSProperties = { fontSize:9, color:"#06b6d4", letterSpacing:"0.25em", fontWeight:700, textTransform:"uppercase" as const }
const TT = { contentStyle:{ background:"#0a1628", border:"1px solid rgba(6,182,212,0.3)", borderRadius:6, fontSize:10, color:"#94a3b8" }, labelStyle:{ color:"#06b6d4" }, itemStyle:{ color:"#94a3b8" } }

interface Props { onNav:(v:string)=>void; apiKey:string }
const FOOTAGE = INCIDENTS.filter(i => i.videoId)

export default function DashboardView({ onNav }: Props) {
  const [expanded, setExpanded] = useState<string|null>(null)

  const [yearData,  setYearData]  = useState<YearRow[]>([])
  const [shapeData, setShapeData] = useState<ShapeRow[]>([])
  const [movData,   setMovData]   = useState<MovRow[]>([])
  const [extStats,  setExtStats]  = useState<ExtStats | null>(null)
  const [feedItems, setFeedItems] = useState<ReturnType<typeof caseToFeed>[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/data/nuforc_by_year.json").then(r => r.json()),
      fetch("/data/nuforc_by_shape.json").then(r => r.json()),
      fetch("/data/extracted_stats.json").then(r => r.json()),
      fetch("/data/extracted_top_cases.json").then(r => r.json()),
      fetch("/data/extracted_movement.json").then(r => r.json()),
    ]).then(([yr, sh, es, tc, mv]: [YearRow[], ShapeRow[], ExtStats, TopCase[], MovRow[]]) => {
      // sample year data: every 3rd year for the mini chart
      setYearData(yr.filter((_,i) => i % 3 === 0))
      setShapeData(sh.filter(s => s.shape_clean !== "Unknown").slice(0, 6))
      setExtStats(es)
      setFeedItems(tc.map(caseToFeed).slice(0, 12))
      setMovData(mv.slice(0, 5))
    }).catch(() => {})
  }, [])

  const topCases = [...INCIDENTS].sort((a,b) => b.credibility - a.credibility).slice(0, 5)

  // Donut from real shape data
  const donutData = shapeData.slice(0, 5).map(s => ({
    name: s.shape_clean, value: s.count, color: SHAPE_HEX[s.shape_clean] || "#475569"
  }))
  const topShapeName = shapeData[0]?.shape_clean ?? "—"
  const topShapePct  = extStats && shapeData[0]
    ? ((shapeData[0].count / extStats.total_processed) * 100).toFixed(1)
    : "—"

  // Real derived stats
  const stats = extStats ? [
    { Icon:FileText,  value:`${extStats.total_processed.toLocaleString()}`, label:"NUFORC Reports",        color:"#00ff88" },
    { Icon:Database,  value:`${extStats.military_context.toLocaleString()}`, label:"Military Context",     color:"#06b6d4" },
    { Icon:Globe,     value:`${extStats.trans_medium.toLocaleString()}`,     label:"Trans-Medium Events",  color:"#a78bfa" },
    { Icon:Zap,       value:`${extStats.physics_violations}`,                label:"Physics Violations",   color:"#ef4444" },
    { Icon:Radio,     value:`${extStats.top_anomaly_combo}`,                 label:"Silent+Instant Accel", color:"#f59e0b" },
  ] : [
    { Icon:FileText,  value:"79,621", label:"NUFORC Reports",       color:"#00ff88" },
    { Icon:Database,  value:"1,845",  label:"Military Context",     color:"#06b6d4" },
    { Icon:Globe,     value:"1,660",  label:"Trans-Medium Events",  color:"#a78bfa" },
    { Icon:Zap,       value:"207",    label:"Physics Violations",   color:"#ef4444" },
    { Icon:Radio,     value:"77",     label:"Silent+Instant Accel", color:"#f59e0b" },
  ]

  return (
    <div style={{ padding:"14px 16px", overflowY:"auto", height:"100vh", boxSizing:"border-box", display:"flex", flexDirection:"column", gap:10 }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <span style={THEAD}>◉ WAR ROOM DASHBOARD</span>
        <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(6,182,212,0.3),transparent)" }} />
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#00ff88", boxShadow:"0 0 8px #00ff88", animation:"blink 2s ease-in-out infinite" }} />
          <span style={{ fontSize:9, color:"#00ff88", letterSpacing:"0.2em" }}>LIVE · {new Date().toUTCString().slice(0,16)}</span>
        </div>
      </div>

      {/* ROW 1 — Real stat tiles */}
      <div style={{ display:"flex", gap:10, flexShrink:0 }}>
        {stats.map(({ Icon, value, label, color }) => (
          <div key={label} style={{ ...CARD, flex:1, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:6, background:`${color}18`, border:`1px solid ${color}35`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon style={{ width:15, height:15, color }} />
            </div>
            <div>
              <div style={{ fontSize:18, fontWeight:800, color:"#e2e8f0", lineHeight:1, letterSpacing:"-0.02em" }}>{value}</div>
              <div style={{ fontSize:9, color:"#64748b", letterSpacing:"0.12em", marginTop:3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ROW 2 — Map + Feed */}
      <div style={{ display:"flex", gap:10, flex:"0 0 380px", minHeight:0 }}>
        {/* Map */}
        <div style={{ ...CARD, flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ padding:"8px 12px", borderBottom:"1px solid rgba(6,182,212,0.12)", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            <span style={THEAD}>◉ GLOBAL ANOMALY MAP</span>
            <button onClick={() => onNav("map")} style={{ marginLeft:"auto", padding:"2px 10px", borderRadius:3, border:"1px solid rgba(6,182,212,0.3)", background:"rgba(6,182,212,0.06)", color:"#06b6d4", fontSize:8, letterSpacing:"0.12em", cursor:"pointer" }}>FULL VIEW →</button>
          </div>
          <div style={{ flex:1, minHeight:0 }}><GlobalMap /></div>
        </div>

        {/* Feed — real top cases from extraction pipeline */}
        <div style={{ ...CARD, width:290, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ padding:"8px 12px", borderBottom:"1px solid rgba(6,182,212,0.12)", display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#00ff88", boxShadow:"0 0 8px #00ff88", animation:"blink 2s ease-in-out infinite" }} />
            <span style={THEAD}>ANOMALY SIGNALS</span>
            <span style={{ marginLeft:"auto", fontSize:8, padding:"1px 7px", borderRadius:9, background:"rgba(6,182,212,0.1)", border:"1px solid rgba(6,182,212,0.2)", color:"#06b6d4" }}>{feedItems.length}</span>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"6px 8px", display:"flex", flexDirection:"column", gap:5 }}>
            {feedItems.map(ev => {
              const tc = TYPE_COLOR[ev.type] || TYPE_COLOR.RADAR
              return (
                <div key={ev.id} style={{ borderLeft:`2px solid ${SEV_COLOR[ev.severity]||"#06b6d4"}`, padding:"6px 9px", background:"rgba(6,182,212,0.03)", borderRadius:"0 5px 5px 0" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:3 }}>
                    <span style={{ fontSize:7, padding:"1px 5px", borderRadius:2, background:`${SEV_COLOR[ev.severity]}20`, color:SEV_COLOR[ev.severity], fontWeight:700, letterSpacing:"0.1em" }}>{ev.severity}</span>
                    <span style={{ fontSize:7, padding:"1px 5px", borderRadius:2, background:tc.bg, color:tc.color, letterSpacing:"0.05em" }}>{ev.type}</span>
                    <span style={{ fontSize:7, color:"#334155", marginLeft:"auto", fontFamily:"monospace" }}>{ev.time}</span>
                  </div>
                  <p style={{ fontSize:9, color:"#94a3b8", lineHeight:1.4, margin:0, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as React.CSSProperties["WebkitBoxOrient"] }}>{ev.text}</p>
                  <div style={{ fontSize:7, color:"#475569", marginTop:2 }}>{ev.region}</div>
                </div>
              )
            })}
            {feedItems.length === 0 && <div style={{ fontSize:9, color:"#334155", padding:"20px 0", textAlign:"center" }}>LOADING SIGNALS...</div>}
          </div>
          <div style={{ padding:"6px 8px", borderTop:"1px solid rgba(6,182,212,0.1)", flexShrink:0 }}>
            <button onClick={() => onNav("livefeed")} style={{ width:"100%", padding:"5px 0", border:"1px solid rgba(6,182,212,0.2)", borderRadius:5, background:"none", color:"#06b6d4", fontSize:8, letterSpacing:"0.12em", cursor:"pointer" }}>
              VIEW ALL SIGNALS →
            </button>
          </div>
        </div>
      </div>

      {/* ROW 3 — Charts (4 tiles) */}
      <div style={{ display:"flex", gap:10, flex:"0 0 180px", minHeight:0 }}>

        {/* Chart 1: Real NUFORC reports by year */}
        <div style={{ ...CARD, flex:1, padding:"10px 12px", display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ ...THEAD, marginBottom:6 }}>REPORTS BY YEAR (NUFORC)</div>
          <div style={{ flex:1, minHeight:0 }}>
            {yearData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearData} margin={{ top:4, right:4, left:-28, bottom:0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tick={{ fill:"#475569", fontSize:7 }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fill:"#475569", fontSize:7 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TT} formatter={(v) => [v, "Reports"]} />
                  <Area type="monotone" dataKey="count" name="Reports" stroke="#06b6d4" strokeWidth={1.5} fill="url(#areaGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <LoadingBox />}
          </div>
        </div>

        {/* Chart 2: Movement patterns from NLP pipeline */}
        <div style={{ ...CARD, flex:1, padding:"10px 12px", display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ ...THEAD, marginBottom:6 }}>MOVEMENT PATTERNS (NLP)</div>
          <div style={{ flex:1, minHeight:0 }}>
            {movData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={movData.map(m => ({ ...m, movement: m.movement.replace(/_/g," ") }))} layout="vertical" margin={{ top:0, right:8, left:2, bottom:0 }}>
                  <XAxis type="number" tick={{ fill:"#475569", fontSize:7 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="movement" tick={{ fill:"#94a3b8", fontSize:7 }} axisLine={false} tickLine={false} width={72} />
                  <Tooltip {...TT} formatter={(v) => [v, "Reports"]} />
                  <Bar dataKey="count" name="Reports" fill="#a78bfa" radius={[0,3,3,0]} barSize={9} />
                </BarChart>
              </ResponsiveContainer>
            ) : <LoadingBox />}
          </div>
        </div>

        {/* Chart 3: Real shape distribution donut */}
        <div style={{ ...CARD, flex:1, padding:"10px 12px", display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ ...THEAD, marginBottom:4 }}>SHAPE DISTRIBUTION (REAL)</div>
          <div style={{ flex:1, minHeight:0, position:"relative" }}>
            {donutData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius="48%" outerRadius="72%" dataKey="value" paddingAngle={2} stroke="none">
                    {donutData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip {...TT} formatter={(v, n) => [Number(v).toLocaleString(), n]} />
                </PieChart>
              </ResponsiveContainer>
            ) : <LoadingBox />}
            {donutData.length > 0 && (
              <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", pointerEvents:"none" }}>
                <div style={{ fontSize:11, fontWeight:800, color:SHAPE_HEX[topShapeName]||"#06b6d4", lineHeight:1 }}>{topShapePct}%</div>
                <div style={{ fontSize:7, color:"#64748b", letterSpacing:"0.08em" }}>{topShapeName.toUpperCase()}</div>
              </div>
            )}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 10px", marginTop:4 }}>
            {donutData.map(e => (
              <div key={e.name} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ width:6, height:6, borderRadius:1, background:e.color, flexShrink:0 }} />
                <span style={{ fontSize:7, color:"#64748b" }}>{e.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tile 4: Real insights from extracted_stats */}
        <div style={{ ...CARD, flex:1, padding:"10px 12px", display:"flex", flexDirection:"column" }}>
          <div style={{ ...THEAD, marginBottom:8 }}>KEY FINDINGS (EXTRACTED)</div>
          <div style={{ flex:1, display:"flex", flexDirection:"column", gap:9 }}>
            {(extStats ? [
              { label:"RAREST PATTERN",   text:`${extStats.top_anomaly_combo} cases: silent + instant accel (${((extStats.top_anomaly_combo/extStats.total_processed)*100).toFixed(3)}%)`, color:"#ef4444" },
              { label:"MILITARY CONTEXT", text:`${extStats.military_context.toLocaleString()} reports near military bases or radar assets`, color:"#f59e0b" },
              { label:"TRANS-MEDIUM",     text:`${extStats.trans_medium.toLocaleString()} objects crossing air/water boundary`, color:"#06b6d4" },
            ] : [
              { label:"RAREST PATTERN",   text:"77 cases: silent + instant accel (0.097%)", color:"#ef4444" },
              { label:"MILITARY CONTEXT", text:"1,845 reports near military bases or radar assets", color:"#f59e0b" },
              { label:"TRANS-MEDIUM",     text:"1,660 objects crossing air/water boundary", color:"#06b6d4" },
            ]).map(({ label, text, color }) => (
              <div key={label} style={{ display:"flex", gap:7, alignItems:"flex-start" }}>
                <div style={{ width:4, height:4, borderRadius:"50%", background:color, boxShadow:`0 0 5px ${color}`, marginTop:4, flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:7, color, letterSpacing:"0.1em", fontWeight:700 }}>{label}</div>
                  <div style={{ fontSize:9, color:"#94a3b8", marginTop:1 }}>{text}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onNav("insights")} style={{ marginTop:6, padding:"5px 0", border:"1px solid rgba(6,182,212,0.25)", borderRadius:5, background:"rgba(6,182,212,0.05)", color:"#06b6d4", fontSize:8, letterSpacing:"0.12em", cursor:"pointer", flexShrink:0 }}>
            FULL ANALYSIS →
          </button>
        </div>
      </div>

      {/* ROW 3b — Declassified Footage Strip */}
      <div style={{ ...CARD, padding:"10px 12px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#ef4444", boxShadow:"0 0 8px #ef4444", animation:"blink 1.5s ease-in-out infinite" }} />
          <span style={THEAD}>DECLASSIFIED FOOTAGE — OFFICIAL RELEASES</span>
          <button onClick={() => onNav("videos")} style={{ marginLeft:"auto", padding:"3px 9px", border:"1px solid rgba(6,182,212,0.2)", borderRadius:3, background:"none", color:"#64748b", fontSize:8, letterSpacing:"0.12em", cursor:"pointer" }}>
            FULL ARCHIVE →
          </button>
        </div>
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
          {FOOTAGE.map(inc => (
            <div key={inc.id} style={{ flexShrink:0, width:220, borderRadius:7, overflow:"hidden", border:"1px solid rgba(6,182,212,0.15)", background:"#000" }}>
              <a href={`https://www.youtube.com/watch?v=${inc.videoId}`} target="_blank" rel="noopener noreferrer"
                style={{ position:"relative", width:"100%", height:124, display:"block", background:"#000" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://img.youtube.com/vi/${inc.videoId}/mqdefault.jpg`} alt={inc.title}
                  style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.82, display:"block" }} />
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(2,8,23,0.85) 0%, rgba(2,8,23,0.05) 55%)" }} />
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-60%)", width:38, height:38, borderRadius:"50%", background:"rgba(239,68,68,0.92)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 20px rgba(239,68,68,0.6)" }}>
                  <Play style={{ width:15, height:15, color:"#fff", marginLeft:2 }} />
                </div>
                <div style={{ position:"absolute", top:6, left:6, padding:"2px 6px", borderRadius:2, background:"rgba(239,68,68,0.85)", fontSize:7, color:"#fff", letterSpacing:"0.1em", fontWeight:700 }}>OFFICIAL</div>
              </a>
              <div style={{ padding:"7px 9px", background:"rgba(2,8,23,0.97)" }}>
                <div style={{ fontSize:10, fontWeight:600, color:"#e2e8f0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:3 }}>{inc.title}</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:7, color:"#64748b" }}>{inc.date}</span>
                  <span style={{ fontSize:7, padding:"1px 5px", borderRadius:2, background:"rgba(0,255,136,0.1)", border:"1px solid rgba(0,255,136,0.2)", color:"#00ff88", letterSpacing:"0.08em" }}>DECLASSIFIED</span>
                </div>
                {inc.videoSource && <div style={{ fontSize:7, color:"#475569", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{inc.videoSource.split("—")[0].trim()}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 4 — High Credibility Cases */}
      <div style={{ ...CARD, padding:"10px 12px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <span style={THEAD}>HIGH CREDIBILITY VERIFIED CASES</span>
          <button onClick={() => onNav("cases")} style={{ marginLeft:"auto", padding:"3px 9px", border:"1px solid rgba(6,182,212,0.2)", borderRadius:3, background:"none", color:"#64748b", fontSize:8, letterSpacing:"0.12em", cursor:"pointer" }}>VIEW ALL →</button>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {topCases.map(inc => {
            const cc = inc.credibility >= 90 ? "#00ff88" : inc.credibility >= 75 ? "#06b6d4" : "#f59e0b"
            const open = expanded === inc.id
            return (
              <div key={inc.id} style={{ flex:1, background: open ? "rgba(6,182,212,0.08)" : "rgba(6,182,212,0.03)", border:`1px solid ${open ? "rgba(6,182,212,0.4)" : "rgba(6,182,212,0.1)"}`, borderRadius:7, overflow:"hidden", transition:"all 0.2s", minWidth:0 }}>
                <button onClick={() => setExpanded(v => v === inc.id ? null : inc.id)} style={{ width:"100%", background:"none", border:"none", padding:"9px 10px", cursor:"pointer", textAlign:"left" }}>
                  {inc.videoId ? (
                    <div style={{ width:"100%", height:52, borderRadius:5, marginBottom:6, overflow:"hidden", position:"relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://img.youtube.com/vi/${inc.videoId}/mqdefault.jpg`} alt={inc.title} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.8 }} />
                      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(2,8,23,0.7),transparent)" }} />
                      <div style={{ position:"absolute", bottom:3, right:4, display:"flex", alignItems:"center", gap:3 }}>
                        <Play style={{ width:8, height:8, color:"#ef4444" }} />
                        <span style={{ fontSize:6, color:"#ef4444", letterSpacing:"0.08em" }}>VIDEO</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width:"100%", height:28, background:`${cc}10`, border:`1px solid ${cc}20`, borderRadius:5, marginBottom:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>
                      {inc.classification === "Unexplained" ? "◉" : inc.military ? "△" : "○"}
                    </div>
                  )}
                  <div style={{ fontSize:10, fontWeight:600, color:"#e2e8f0", marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{inc.title}</div>
                  <div style={{ fontSize:8, color:"#64748b", marginBottom:5 }}>{inc.date}</div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", gap:1 }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize:8, color: s <= Math.round(inc.credibility/20) ? "#f59e0b" : "#1e293b" }}>★</span>)}
                    </div>
                    <span style={{ fontSize:8, padding:"1px 5px", borderRadius:3, background:`${cc}18`, color:cc, fontWeight:700 }}>{inc.credibility}%</span>
                  </div>
                </button>
                {open && (
                  <div style={{ padding:"0 10px 8px", borderTop:"1px solid rgba(6,182,212,0.12)" }}>
                    <p style={{ fontSize:9, color:"#94a3b8", lineHeight:1.5, margin:"7px 0" }}>{inc.description.slice(0,180)}...</p>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:7 }}>
                      {inc.tags.slice(0,3).map(t => <span key={t} style={{ fontSize:7, padding:"2px 5px", borderRadius:2, border:"1px solid rgba(6,182,212,0.2)", color:"#64748b" }}>{t}</span>)}
                    </div>
                    <Link href={`/cases/${inc.id}`} style={{ display:"inline-block", fontSize:8, padding:"4px 10px", borderRadius:4, border:"1px solid rgba(6,182,212,0.3)", color:"#06b6d4", textDecoration:"none", letterSpacing:"0.1em" }}>
                      VIEW FULL CASE →
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ height:8, flexShrink:0 }} />
    </div>
  )
}

function LoadingBox() {
  return <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"#334155", letterSpacing:"0.2em" }}>LOADING...</div>
}
