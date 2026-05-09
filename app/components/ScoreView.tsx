"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { INCIDENTS } from "@/lib/data"

type ExtStats = {
  total_processed: number; high_credibility: number; military_context: number
  physics_violations: number; silent_pct: number; military_pct: number; physics_violation_pct: number
}
type TopCase = { id: string; year: number; state: string; country: string; city: string; comment_preview: string; extracted_shape: string | null; sound: string; movement_tags: string[]; anomaly_behaviors: string[]; credibility_score: number }

function StepHeader({ step, title, subtitle, next, onNav }: {
  step: string; title: string; subtitle: string; next: string; onNav: (v: string) => void
}) {
  return (
    <div style={{ padding:"20px 24px", borderBottom:"1px solid rgba(6,182,212,0.12)", display:"flex", alignItems:"center", gap:20, flexShrink:0, background:"rgba(2,8,23,0.8)" }}>
      <div style={{ fontFamily:"monospace", fontSize:36, fontWeight:900, color:"rgba(6,182,212,0.2)", lineHeight:1 }}>{step}</div>
      <div>
        <div style={{ fontSize:16, fontWeight:800, color:"#e2e8f0", letterSpacing:"0.1em" }}>{title}</div>
        <div style={{ fontSize:10, color:"#64748b", letterSpacing:"0.2em", marginTop:2 }}>{subtitle}</div>
      </div>
      <button onClick={() => onNav(next)} style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8, padding:"8px 18px", borderRadius:6, border:"1px solid rgba(6,182,212,0.3)", background:"rgba(6,182,212,0.06)", color:"#06b6d4", fontSize:10, letterSpacing:"0.15em", cursor:"pointer", flexShrink:0 }}>
        NEXT: {next.toUpperCase()} →
      </button>
    </div>
  )
}

const FACTORS = [
  { label: "Radar Confirmation", weight: 25, color: "#06b6d4" },
  { label: "Video Evidence",     weight: 25, color: "#00ff88" },
  { label: "Military Source",    weight: 20, color: "#f59e0b" },
  { label: "Witness Count",      weight: 15, color: "#a78bfa" },
  { label: "Official Source",    weight: 15, color: "#ef4444" },
]

function scoreColor(credibility: number): string {
  if (credibility >= 90) return "#00ff88"
  if (credibility >= 75) return "#06b6d4"
  return "#f59e0b"
}

export default function ScoreView({ onNav }: { onNav: (v: string) => void }) {
  const sorted = [...INCIDENTS].sort((a, b) => b.credibility - a.credibility)
  const [extStats, setExtStats] = useState<ExtStats | null>(null)
  const [topCases, setTopCases] = useState<TopCase[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/data/extracted_stats.json").then(r => r.json()),
      fetch("/data/extracted_top_cases.json").then(r => r.json()),
    ]).then(([es, tc]: [ExtStats, TopCase[]]) => {
      setExtStats(es)
      setTopCases(tc.slice(0, 10))
    }).catch(() => {})
  }, [])

  return (
    <div style={{ height:"100vh", overflowY:"auto", background:"#020817", display:"flex", flexDirection:"column" }}>
      <StepHeader step="05" title="SCORE" subtitle="Credibility Quantification & Evidence Ranking" next="map" onNav={onNav} />

      <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:28, flex:1 }}>

        {/* Section A: Scoring Methodology */}
        <section>
          <div style={{ fontSize:9, color:"#475569", letterSpacing:"0.25em", fontWeight:700, marginBottom:14 }}>
            A — SCORING METHODOLOGY (5 FACTORS, TOTAL 100 PTS)
          </div>
          <div style={{
            background:"rgba(15,25,50,0.7)",
            border:"1px solid rgba(6,182,212,0.14)",
            borderRadius:8,
            padding:"20px",
          }}>
            {/* Stacked bar */}
            <div style={{ height:28, borderRadius:6, overflow:"hidden", display:"flex", marginBottom:14 }}>
              {FACTORS.map((f) => (
                <div
                  key={f.label}
                  style={{
                    width:`${f.weight}%`,
                    background:f.color,
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    fontSize:9,
                    fontWeight:700,
                    color:"#020817",
                    letterSpacing:"0.05em",
                    overflow:"hidden",
                    whiteSpace:"nowrap",
                  }}
                >
                  {f.weight}%
                </div>
              ))}
            </div>
            {/* Legend */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:14 }}>
              {FACTORS.map((f) => (
                <div key={f.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:f.color, flexShrink:0 }} />
                  <span style={{ fontSize:10, color:"#94a3b8" }}>{f.label}</span>
                  <span style={{ fontSize:9, color:"#475569" }}>({f.weight} pts)</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section B: All Cases Ranked */}
        <section>
          <div style={{ fontSize:9, color:"#475569", letterSpacing:"0.25em", fontWeight:700, marginBottom:14 }}>
            B — ALL CASES RANKED BY CREDIBILITY
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {sorted.map((inc, idx) => {
              const rank = idx + 1
              const sc = scoreColor(inc.credibility)
              return (
                <Link
                  key={inc.id}
                  href={`/cases/${inc.id}`}
                  style={{ textDecoration:"none" }}
                >
                  <div
                    style={{
                      background:"rgba(15,25,50,0.7)",
                      border:"1px solid rgba(6,182,212,0.14)",
                      borderRadius:8,
                      padding:"14px 20px",
                      display:"flex",
                      alignItems:"center",
                      gap:16,
                      cursor:"pointer",
                      transition:"border-color 0.15s, background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = "rgba(6,182,212,0.35)"
                      el.style.background = "rgba(15,25,50,0.95)"
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = "rgba(6,182,212,0.14)"
                      el.style.background = "rgba(15,25,50,0.7)"
                    }}
                  >
                    {/* Rank */}
                    <div style={{ fontFamily:"monospace", fontSize:20, fontWeight:900, color:"rgba(6,182,212,0.15)", width:36, flexShrink:0 }}>
                      #{rank}
                    </div>

                    {/* Title + meta */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:"#e2e8f0", marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {inc.title}
                      </div>
                      <div style={{ fontSize:9, color:"#64748b" }}>
                        {inc.date} · {inc.location}
                      </div>

                      {/* Mini credibility bar */}
                      <div style={{ marginTop:8, height:3, borderRadius:2, background:"rgba(6,182,212,0.1)", width:"100%", maxWidth:300 }}>
                        <div style={{ height:"100%", borderRadius:2, background:sc, width:`${inc.credibility}%`, transition:"width 0.5s" }} />
                      </div>
                    </div>

                    {/* Factor indicators */}
                    <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                      {inc.radarConfirmed && (
                        <span title="Radar Confirmed" style={{ fontSize:12, color:"#06b6d4" }}>◉</span>
                      )}
                      {inc.videoId && (
                        <span title="Video Evidence" style={{ fontSize:12, color:"#00ff88" }}>▶</span>
                      )}
                      {inc.military && (
                        <span title="Military Source" style={{ fontSize:12, color:"#f59e0b" }}>△</span>
                      )}
                      {inc.witnesses >= 10 && (
                        <span title="High Witness Count" style={{ fontSize:12, color:"#a78bfa" }}>★</span>
                      )}
                    </div>

                    {/* Score badge */}
                    <div style={{
                      fontFamily:"monospace",
                      fontSize:16,
                      fontWeight:900,
                      color:sc,
                      background:`rgba(${sc === "#00ff88" ? "0,255,136" : sc === "#06b6d4" ? "6,182,212" : "245,158,11"},0.1)`,
                      border:`1px solid ${sc}30`,
                      borderRadius:6,
                      padding:"6px 12px",
                      flexShrink:0,
                      minWidth:52,
                      textAlign:"center",
                    }}>
                      {inc.credibility}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Section C: Mass scoring overview from real pipeline */}
        {extStats && (
          <section>
            <div style={{ fontSize:9, color:"#475569", letterSpacing:"0.25em", fontWeight:700, marginBottom:14 }}>
              C — PIPELINE SCORING: {extStats.total_processed.toLocaleString()} RECORDS
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
              {[
                { label:"Total Scored",       value:extStats.total_processed.toLocaleString(), color:"#06b6d4" },
                { label:"High Credibility ≥70",value:extStats.high_credibility.toString(),     color:"#00ff88" },
                { label:"Military Context",   value:`${extStats.military_context.toLocaleString()} (${extStats.military_pct}%)`, color:"#f59e0b" },
                { label:"Physics Violations", value:`${extStats.physics_violations} (${extStats.physics_violation_pct}%)`,       color:"#ef4444" },
              ].map(s => (
                <div key={s.label} style={{ background:"rgba(10,22,40,0.7)", border:`1px solid ${s.color}22`, borderRadius:8, padding:"14px 18px", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${s.color}60,transparent)` }} />
                  <div style={{ fontSize:22, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:9, color:"#64748b", marginTop:6, letterSpacing:"0.1em" }}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section D: Top anomaly cases from real pipeline */}
        {topCases.length > 0 && (
          <section>
            <div style={{ fontSize:9, color:"#475569", letterSpacing:"0.25em", fontWeight:700, marginBottom:14 }}>
              D — TOP SCORED RECORDS FROM PIPELINE (SILENT + INSTANT ACCELERATION)
            </div>
            <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(6,182,212,0.15)", borderRadius:12, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(6,182,212,0.1)" }}>
                    {["YEAR","LOCATION","SHAPE","TAGS","SCORE","NARRATIVE PREVIEW"].map(h => (
                      <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:9, color:"#475569", letterSpacing:"0.15em", fontWeight:600, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topCases.map((c, i) => {
                    const sc = scoreColor(c.credibility_score)
                    return (
                      <tr key={c.id} style={{ borderBottom:"1px solid rgba(6,182,212,0.06)", background: i % 2 === 0 ? "transparent" : "rgba(6,182,212,0.02)" }}>
                        <td style={{ padding:"10px 16px", color:"#06b6d4", fontWeight:700 }}>{c.year}</td>
                        <td style={{ padding:"10px 16px", color:"#94a3b8", whiteSpace:"nowrap" }}>{[c.city, c.state?.toUpperCase(), c.country?.toUpperCase()].filter(Boolean).slice(0,2).join(", ") || "—"}</td>
                        <td style={{ padding:"10px 16px" }}>
                          <span style={{ padding:"2px 8px", borderRadius:4, background:"rgba(6,182,212,0.1)", color:"#06b6d4", fontSize:9 }}>{c.extracted_shape || "—"}</span>
                        </td>
                        <td style={{ padding:"10px 16px" }}>
                          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                            {[c.sound, ...(c.anomaly_behaviors||[])].filter(Boolean).slice(0,2).map(b => (
                              <span key={b} style={{ padding:"1px 6px", borderRadius:3, background:"rgba(239,68,68,0.12)", color:"#ef4444", fontSize:8 }}>{b?.replace(/_/g," ")}</span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding:"10px 16px", whiteSpace:"nowrap" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ width:40, height:4, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden" }}>
                              <div style={{ width:`${c.credibility_score}%`, height:"100%", background:sc, borderRadius:2 }} />
                            </div>
                            <span style={{ color:sc, fontSize:10 }}>{c.credibility_score}</span>
                          </div>
                        </td>
                        <td style={{ padding:"10px 16px", maxWidth:260, color:"#64748b", fontSize:10, lineHeight:1.4 }}>
                          {(c.comment_preview || "").slice(0,100)}{(c.comment_preview || "").length > 100 ? "…" : ""}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
