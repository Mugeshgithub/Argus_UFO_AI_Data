"use client"
import { useState, useEffect } from "react"

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

type MovRow  = { movement: string; count: number }
type AnoRow  = { behavior: string; count: number }
type ExtStat = { total_processed: number; military_context: number; trans_medium: number; electromagnetic: number; physics_violations: number }

const CLUSTER_META = [
  {
    id:"C1", key:"instant_acceleration", type:"movement",
    label:"INSTANT ACCELERATION", color:"#ef4444",
    description:"Objects that accelerate from stationary to hypersonic speed with no transition period. Violates known physics of inertia — no organism can survive the implied G-forces.",
    cases:["USS Nimitz Tic-Tac (2004)","JAL Flight 1628 (1986)","Stephenville TX (2008)"],
    signals:["Speed: >Mach 10","G-force: >1000g (impossible for biological)","No sonic boom","Radar track confirmed"],
  },
  {
    id:"C2", key:"hovering", type:"movement",
    label:"SILENT HOVERING", color:"#a78bfa",
    description:"Objects maintaining stable hover with no rotor wash, engine noise, or visible propulsion. Defies aerodynamic requirements for objects of the described mass and scale.",
    cases:["Phoenix Lights (1997)","O'Hare Airport (2006)","Rendlesham Forest (1980)"],
    signals:["Sound: Zero decibels","Duration: Extended hover","Wind resistance: None","Altitude: Stable"],
  },
  {
    id:"C3", key:"trans_medium", type:"anomaly",
    label:"TRANS-MEDIUM TRANSITION", color:"#06b6d4",
    description:"Objects transitioning seamlessly between air and water with no deceleration, no visible impact splash, and no loss of speed. Observed directly by USS Omaha crew.",
    cases:["USS Omaha USO (2019)","USS Nimitz zone (2004)"],
    signals:["Medium: Air → Water","Speed change: None","Splash: None detected","Radar: Lost on entry"],
  },
  {
    id:"C4", key:"formation_flight", type:"movement",
    label:"FORMATION FLIGHT", color:"#f59e0b",
    description:"Multiple objects maintaining precise geometric spacing and synchronized movement with zero communication lag between units. No command signal detected.",
    cases:["Phoenix Lights (1997)","Belgian Wave (1989)","Malmstrom AFB (1967)"],
    signals:["Objects: 3–12 units","Spacing: Geometrically precise","Sync: Perfect","Duration: Extended"],
  },
  {
    id:"C5", key:"cloaking", type:"anomaly",
    label:"CLOAKING / DEMATERIALIZATION", color:"#00ff88",
    description:"Objects that vanish from view and from radar simultaneously — not merely leaving the field of view, but ceasing to exist in observable form. No detectable transition.",
    cases:["Malmstrom AFB (1967)","USS Nimitz (2004)","RAF Bentwaters (1980)"],
    signals:["Visual: Instantaneous disappear","Radar: Simultaneous loss","IR: No heat signature at departure","Duration: <100ms transition"],
  },
  {
    id:"C6", key:"physics_violation", type:"anomaly",
    label:"PHYSICS VIOLATIONS", color:"#ec4899",
    description:"Witnesses explicitly report behavior that contradicts known physics: no propulsion, no wings, no exhaust, performing right-angle turns at extreme speed.",
    cases:["Gimbal Video (2015)","GoFast Video (2015)","Tic-Tac (2004)"],
    signals:["No propulsion visible","Right-angle turns at speed","No aerodynamic surfaces","Defied observer expectations"],
  },
]

function rgbFromHex(h: string): string {
  const r = parseInt(h.slice(1,3),16)
  const g = parseInt(h.slice(3,5),16)
  const b = parseInt(h.slice(5,7),16)
  return `${r},${g},${b}`
}

export default function ClusterView({ onNav }: { onNav: (v: string) => void }) {
  const [expanded,   setExpanded]   = useState<string | null>(null)
  const [movements,  setMovements]  = useState<MovRow[]>([])
  const [anomalies,  setAnomalies]  = useState<AnoRow[]>([])
  const [extStats,   setExtStats]   = useState<ExtStat | null>(null)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/data/extracted_movement.json").then(r => r.json()),
      fetch("/data/extracted_anomalies.json").then(r => r.json()),
      fetch("/data/extracted_stats.json").then(r => r.json()),
    ]).then(([mov, ano, es]: [MovRow[], AnoRow[], ExtStat]) => {
      setMovements(mov); setAnomalies(ano); setExtStats(es); setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function getCount(meta: typeof CLUSTER_META[0]): number {
    if (meta.type === "movement") {
      return movements.find(m => m.movement === meta.key)?.count ?? 0
    }
    if (meta.type === "anomaly") {
      return anomalies.find(a => a.behavior === meta.key)?.count ?? 0
    }
    return 0
  }

  const totalLabeled = movements.reduce((s, m) => s + m.count, 0) + anomalies.reduce((s, a) => s + a.count, 0)

  function toggle(id: string) { setExpanded(p => p === id ? null : id) }

  return (
    <div style={{ height:"100vh", overflowY:"auto", background:"#020817", display:"flex", flexDirection:"column" }}>
      <StepHeader step="04" title="CLUSTER" subtitle="Behavioral Pattern Grouping Across 79,621 Reports" next="score" onNav={onNav} />

      <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:20, flex:1 }}>

        {/* Summary bar */}
        <div style={{ background:"rgba(6,182,212,0.04)", border:"1px solid rgba(6,182,212,0.2)", borderRadius:8, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.7 }}>
            <span style={{ color:"#06b6d4", fontWeight:700 }}>REAL DATA CLUSTERS</span>
            {"  "}AI identified behavior patterns across{" "}
            <span style={{ color:"#e2e8f0", fontWeight:600 }}>
              {loading ? "79,621" : (extStats?.total_processed ?? 79621).toLocaleString()} reports
            </span>
            {" "}— {loading ? "…" : totalLabeled.toLocaleString()} signals extracted across 6 cluster types.
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background: loading ? "#f59e0b" : "#00ff88", boxShadow:`0 0 6px ${loading ? "#f59e0b" : "#00ff88"}` }} />
            <span style={{ fontSize:9, color: loading ? "#f59e0b" : "#00ff88", letterSpacing:"0.15em" }}>
              {loading ? "LOADING..." : "LIVE DATA"}
            </span>
          </div>
        </div>

        <div style={{ fontSize:9, color:"#475569", letterSpacing:"0.25em", fontWeight:700 }}>BEHAVIOR CLUSTERS — CLICK TO EXPAND</div>

        {CLUSTER_META.map((c) => {
          const count = getCount(c)
          const total = extStats?.total_processed ?? 79621
          const pct   = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0"
          const isOpen = expanded === c.id
          const rgb = rgbFromHex(c.color)

          return (
            <div key={c.id} style={{ background:"rgba(15,25,50,0.7)", borderTop:`1px solid ${isOpen ? c.color+"40" : "rgba(6,182,212,0.14)"}`, borderRight:`1px solid ${isOpen ? c.color+"40" : "rgba(6,182,212,0.14)"}`, borderBottom:`1px solid ${isOpen ? c.color+"40" : "rgba(6,182,212,0.14)"}`, borderLeft:`3px solid ${c.color}`, borderRadius:8, overflow:"hidden", transition:"border-color 0.2s" }}>
              <button onClick={() => toggle(c.id)} style={{ width:"100%", padding:"16px 20px", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:16, textAlign:"left" }}>
                {/* Count circle */}
                <div style={{ width:56, height:56, borderRadius:"50%", border:`2px solid ${c.color}`, background:`rgba(${rgb},0.1)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontFamily:"monospace", fontSize: count >= 10000 ? 9 : count >= 1000 ? 10 : 12, fontWeight:900, color:c.color }}>{loading ? "…" : count.toLocaleString()}</span>
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:"#e2e8f0", letterSpacing:"0.08em" }}>{c.label}</span>
                    <span style={{ fontSize:8, fontWeight:700, letterSpacing:"0.1em", color:c.color, background:`rgba(${rgb},0.12)`, border:`1px solid ${c.color}30`, borderRadius:4, padding:"2px 7px" }}>
                      {loading ? "…" : `${pct}%`}
                    </span>
                  </div>
                  <div style={{ fontSize:10, color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:460 }}>{c.description}</div>
                  <div style={{ fontSize:9, color:"#475569", marginTop:4 }}>{c.cases.length} verified cases matched</div>
                </div>

                <div style={{ fontSize:14, color:"#475569", flexShrink:0, transform: isOpen ? "rotate(180deg)" : "none", transition:"transform 0.2s" }}>▾</div>
              </button>

              {isOpen && (
                <div style={{ padding:"0 20px 20px", borderTop:`1px solid ${c.color}20` }}>
                  <p style={{ fontSize:11, color:"#94a3b8", lineHeight:1.7, marginTop:16, marginBottom:16 }}>{c.description}</p>

                  {/* Real count bar */}
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"#475569", marginBottom:6 }}>
                      <span>REPORTS MATCHING THIS PATTERN</span>
                      <span style={{ color:c.color }}>{count.toLocaleString()} / {(extStats?.total_processed ?? 79621).toLocaleString()} ({pct}%)</span>
                    </div>
                    <div style={{ height:6, background:"rgba(255,255,255,0.05)", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${Math.min(parseFloat(pct)*3, 100)}%`, background:`linear-gradient(90deg,${c.color},${c.color}80)`, borderRadius:3, transition:"width 0.5s" }} />
                    </div>
                  </div>

                  <div style={{ fontSize:8, color:"#475569", letterSpacing:"0.2em", fontWeight:700, marginBottom:10 }}>BEHAVIORAL SIGNALS</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
                    {c.signals.map(sig => (
                      <div key={sig} style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(6,182,212,0.1)", borderRadius:6, padding:"8px 12px", fontSize:10, color:"#94a3b8", fontFamily:"monospace" }}>{sig}</div>
                    ))}
                  </div>

                  <div style={{ fontSize:8, color:"#475569", letterSpacing:"0.2em", fontWeight:700, marginBottom:10 }}>VERIFIED MATCHING CASES</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {c.cases.map(cas => (
                      <span key={cas} style={{ fontSize:10, color:c.color, background:`rgba(${rgb},0.1)`, border:`1px solid ${c.color}30`, borderRadius:4, padding:"4px 10px" }}>{cas}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Movement breakdown table */}
        {!loading && (
          <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(6,182,212,0.15)", borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(6,182,212,0.1)", fontSize:10, color:"#06b6d4", letterSpacing:"0.2em" }}>ALL EXTRACTED MOVEMENT + ANOMALY SIGNALS</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
              <div style={{ padding:"16px 20px", borderRight:"1px solid rgba(6,182,212,0.08)" }}>
                <div style={{ fontSize:9, color:"#475569", letterSpacing:"0.15em", marginBottom:12 }}>MOVEMENT PATTERNS</div>
                {movements.map(m => (
                  <div key={m.movement} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <span style={{ fontSize:10, color:"#94a3b8", minWidth:160, fontFamily:"monospace" }}>{m.movement.replace(/_/g," ")}</span>
                    <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${(m.count / (movements[0]?.count || 1)) * 100}%`, background:"#06b6d4", borderRadius:2 }} />
                    </div>
                    <span style={{ fontSize:10, color:"#06b6d4", minWidth:48, textAlign:"right", fontFamily:"monospace" }}>{m.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding:"16px 20px" }}>
                <div style={{ fontSize:9, color:"#475569", letterSpacing:"0.15em", marginBottom:12 }}>ANOMALOUS BEHAVIORS</div>
                {anomalies.map(a => (
                  <div key={a.behavior} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <span style={{ fontSize:10, color:"#94a3b8", minWidth:160, fontFamily:"monospace" }}>{a.behavior.replace(/_/g," ")}</span>
                    <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${(a.count / (anomalies[0]?.count || 1)) * 100}%`, background:"#ef4444", borderRadius:2 }} />
                    </div>
                    <span style={{ fontSize:10, color:"#ef4444", minWidth:48, textAlign:"right", fontFamily:"monospace" }}>{a.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
