"use client"
import { useState, useEffect } from "react"

type TopCase = {
  id: string; year: number; state: string; country: string; city: string
  extracted_shape: string | null; sound: string; movement_tags: string[]
  anomaly_behaviors: string[]; credibility_score: number; comment_preview: string
}

type FeedEvent = {
  id: string; time: string; type: string; severity: string; text: string; region: string
  shape: string | null; behaviors: string[]
}

type Severity = "ALL" | "HIGH" | "MED" | "LOW"
type EventType = "ALL" | "RADAR" | "VISUAL" | "MULTI" | "SENSOR"

const SEV_COLOR: Record<string, string> = { HIGH:"#ef4444", MED:"#f59e0b", LOW:"#06b6d4" }
const TYPE_BG: Record<string, { bg:string; color:string }> = {
  RADAR:  { bg:"rgba(6,182,212,0.12)",  color:"#06b6d4" },
  VISUAL: { bg:"rgba(168,85,247,0.12)", color:"#a855f7" },
  MULTI:  { bg:"rgba(239,68,68,0.12)",  color:"#ef4444" },
  SENSOR: { bg:"rgba(34,197,94,0.12)",  color:"#22c55e" },
}
const SHAPE_COLOR: Record<string, string> = {
  Light:"#06b6d4", Circle:"#00ff88", Triangle:"#ef4444", Fireball:"#f59e0b",
  Disk:"#ec4899", Sphere:"#a855f7", Cigar:"#f97316", Unknown:"#8899cc",
  Oval:"#3b82f6", Formation:"#14b8a6",
}

function decodeHtml(s: string): string {
  return (s || "")
    .replace(/&#44;?/g, ",").replace(/&amp;/g, "&").replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"').replace(/&#33;/g, "!").replace(/&#\d+;/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
}

function caseToFeed(c: TopCase): FeedEvent {
  const hasPhysics  = c.anomaly_behaviors.includes("physics_violation")
  const hasTrans    = c.anomaly_behaviors.includes("trans_medium")
  const hasEM       = c.anomaly_behaviors.includes("electromagnetic")
  const hasCloaking = c.anomaly_behaviors.includes("cloaking")
  const hasInstant  = c.movement_tags.includes("instant_acceleration")
  const hasFormation = c.movement_tags.includes("formation_flight")
  const hasHover    = c.movement_tags.includes("hovering")

  const severity = (hasPhysics || hasTrans || (hasInstant && c.sound === "silent")) ? "HIGH"
                 : (hasEM || hasCloaking || hasFormation || c.credibility_score >= 40)   ? "MED"
                 : "LOW"
  const type = hasTrans ? "MULTI" : hasEM ? "SENSOR" : hasFormation ? "VISUAL" : hasInstant ? "RADAR" : hasHover ? "VISUAL" : "RADAR"

  const region = [c.city, c.state?.toUpperCase(), c.country !== "us" && c.country ? c.country.toUpperCase() : "USA"]
    .filter(Boolean).join(", ")

  return {
    id: c.id,
    time: String(c.year),
    type,
    severity,
    text: decodeHtml(c.comment_preview),
    region,
    shape: c.extracted_shape,
    behaviors: [...c.movement_tags, ...c.anomaly_behaviors],
  }
}

const BTN: React.CSSProperties = { padding:"5px 12px", borderRadius:4, border:"1px solid rgba(6,182,212,0.2)", background:"none", color:"#64748b", fontSize:9, letterSpacing:"0.15em", cursor:"pointer", transition:"all 0.15s" }
const BTN_A: React.CSSProperties = { ...BTN, background:"rgba(6,182,212,0.12)", border:"1px solid rgba(6,182,212,0.4)", color:"#06b6d4" }

export default function LiveFeedView() {
  const [events,   setEvents]   = useState<FeedEvent[]>([])
  const [loading,  setLoading]  = useState(true)
  const [severity, setSeverity] = useState<Severity>("ALL")
  const [evType,   setEvType]   = useState<EventType>("ALL")

  useEffect(() => {
    fetch("/data/extracted_top_cases.json")
      .then(r => r.json())
      .then((cases: TopCase[]) => {
        setEvents(cases.map(caseToFeed))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = events.filter(ev => {
    const matchSev  = severity === "ALL" || ev.severity === severity
    const matchType = evType   === "ALL" || ev.type     === evType
    return matchSev && matchType
  })

  const counts = { HIGH: events.filter(e => e.severity === "HIGH").length, MED: events.filter(e => e.severity === "MED").length, LOW: events.filter(e => e.severity === "LOW").length }

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(6,182,212,0.12)", flexShrink:0, background:"rgba(2,8,23,0.95)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#00ff88", boxShadow:"0 0 8px #00ff88", animation:"blink 2s ease-in-out infinite" }} />
          <span style={{ fontSize:10, color:"#06b6d4", letterSpacing:"0.3em" }}>⚡ LIVE ANOMALY FEED</span>
          <span style={{ fontSize:8, color:"#475569", letterSpacing:"0.1em" }}>
            — real witness reports extracted from 79,621 NUFORC records
          </span>
          <span style={{ marginLeft:"auto", fontSize:9, padding:"3px 10px", borderRadius:10, background:"rgba(6,182,212,0.1)", border:"1px solid rgba(6,182,212,0.25)", color:"#06b6d4" }}>
            {loading ? "LOADING..." : `${filtered.length} / ${events.length} SIGNALS`}
          </span>
        </div>

        {/* Severity summary */}
        <div style={{ display:"flex", gap:12, marginBottom:10 }}>
          {(["HIGH","MED","LOW"] as const).map(s => (
            <div key={s} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:SEV_COLOR[s], boxShadow:`0 0 6px ${SEV_COLOR[s]}` }} />
              <span style={{ fontSize:9, color:SEV_COLOR[s], letterSpacing:"0.1em" }}>{s}</span>
              <span style={{ fontSize:9, color:"#64748b" }}>{counts[s]}</span>
            </div>
          ))}
        </div>

        {/* Severity filter */}
        <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
          <span style={{ fontSize:9, color:"#475569", letterSpacing:"0.15em", alignSelf:"center" }}>PRIORITY:</span>
          {(["ALL","HIGH","MED","LOW"] as Severity[]).map(s => (
            <button key={s} onClick={() => setSeverity(s)} style={severity===s ? {
              ...BTN_A,
              ...(s==="HIGH" ? { borderColor:"rgba(239,68,68,0.5)", color:"#ef4444", background:"rgba(239,68,68,0.12)" } :
                  s==="MED"  ? { borderColor:"rgba(245,158,11,0.5)", color:"#f59e0b", background:"rgba(245,158,11,0.12)" } :
                  s==="LOW"  ? { borderColor:"rgba(6,182,212,0.5)",  color:"#06b6d4", background:"rgba(6,182,212,0.12)" } : {})
            } : BTN}>{s}</button>
          ))}
        </div>

        {/* Type filter */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          <span style={{ fontSize:9, color:"#475569", letterSpacing:"0.15em", alignSelf:"center" }}>TYPE:</span>
          {(["ALL","RADAR","VISUAL","MULTI","SENSOR"] as EventType[]).map(t => (
            <button key={t} onClick={() => setEvType(t)} style={evType===t ? {
              ...BTN_A, ...(t !== "ALL" && TYPE_BG[t] ? { color:TYPE_BG[t].color, background:TYPE_BG[t].bg, borderColor:`${TYPE_BG[t].color}50` } : {})
            } : BTN}>{t}</button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 20px", display:"flex", flexDirection:"column", gap:8 }}>
        {loading && (
          <div style={{ textAlign:"center", color:"#475569", fontSize:11, padding:"40px 0", letterSpacing:"0.1em" }}>
            LOADING REAL ANOMALY SIGNALS...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:"center", color:"#475569", fontSize:11, padding:"40px 0", letterSpacing:"0.1em" }}>
            NO SIGNALS MATCH CURRENT FILTERS
          </div>
        )}
        {filtered.map((ev, i) => {
          const tc = TYPE_BG[ev.type] || TYPE_BG.RADAR
          const shapeColor = SHAPE_COLOR[ev.shape || ""] || "#475569"
          return (
            <div key={`${ev.id}-${i}`} style={{
              borderLeft:`3px solid ${SEV_COLOR[ev.severity] || "#06b6d4"}`,
              background:"rgba(15,25,50,0.6)",
              border:"1px solid rgba(6,182,212,0.1)",
              borderLeftColor:SEV_COLOR[ev.severity] || "#06b6d4",
              borderLeftWidth:3,
              borderRadius:"0 8px 8px 0",
              padding:"12px 16px",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.28)"; e.currentTarget.style.background = "rgba(15,25,50,0.9)" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.1)";  e.currentTarget.style.background = "rgba(15,25,50,0.6)" }}
            >
              {/* Top meta row */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7, flexWrap:"wrap" }}>
                <span style={{ fontSize:8, padding:"2px 8px", borderRadius:3, fontWeight:700, letterSpacing:"0.12em", background:ev.severity==="HIGH"?"rgba(239,68,68,0.15)":ev.severity==="MED"?"rgba(245,158,11,0.15)":"rgba(6,182,212,0.15)", color:SEV_COLOR[ev.severity] }}>
                  {ev.severity}
                </span>
                <span style={{ fontSize:8, padding:"2px 8px", borderRadius:3, letterSpacing:"0.1em", background:tc.bg, color:tc.color }}>
                  {ev.type}
                </span>
                {ev.shape && (
                  <span style={{ fontSize:8, padding:"2px 8px", borderRadius:3, background:`${shapeColor}15`, color:shapeColor, border:`1px solid ${shapeColor}30` }}>
                    {ev.shape}
                  </span>
                )}
                <span style={{ fontSize:9, color:"#64748b", fontFamily:"monospace" }}>{ev.time}</span>
                <span style={{ marginLeft:"auto", fontSize:9, color:"#64748b" }}>{ev.region}</span>
              </div>

              {/* Real witness testimony */}
              <p style={{ fontSize:12, color:"#cbd5e1", lineHeight:1.6, margin:"0 0 8px" }}>{ev.text}</p>

              {/* Behavior tags from NLP extraction */}
              {ev.behaviors.length > 0 && (
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {ev.behaviors.map(b => (
                    <span key={b} style={{ fontSize:7, padding:"1px 6px", borderRadius:2, background:"rgba(6,182,212,0.06)", border:"1px solid rgba(6,182,212,0.15)", color:"#475569", letterSpacing:"0.05em" }}>
                      {b.replace(/_/g," ")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        <div style={{ height:16 }} />
      </div>
    </div>
  )
}
