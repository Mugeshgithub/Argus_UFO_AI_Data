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

type NuforStats = {
  total: number; years_span: string; peak_year: number; peak_year_count: number
  top_shape: string; top_state: string; us_pct: number; night_pct: number
  median_duration_seconds: number; countries: number; triangle_count: number
}
type TopCase = { id: string; year: number; state: string; country: string; city: string; comment_preview: string; extracted_shape: string; credibility_score: number }

const SOURCE_META = [
  { label:"NUFORC DATABASE",  color:"#06b6d4", status:"LIVE",          detail:"National UFO Reporting Center. Largest public civilian UAP database. Contains date, location, shape, duration, and witness description for each report." },
  { label:"PENTAGON / AARO",  color:"#00ff88", status:"VERIFIED",      detail:"All-domain Anomaly Resolution Office reports. 12 high-credibility verified incidents with radar confirmation, pilot testimony, and declassified footage." },
  { label:"OFFICIAL VIDEO",   color:"#f59e0b", status:"AUTHENTICATED", detail:"FLIR1, Gimbal, GoFast (USS Roosevelt), Phoenix Lights, USS Omaha. Each released by US DoD or confirmed authentic by Pentagon." },
  { label:"RADAR & PILOT LOGS",color:"#a78bfa",status:"CONFIRMED",     detail:"FAA radar logs, military tracking data, and pilot incident reports where radar and visual confirmation occurred simultaneously." },
]

export default function CollectView({ onNav }: { onNav: (v: string) => void }) {
  const [stats, setStats] = useState<NuforStats | null>(null)
  const [samples, setSamples] = useState<TopCase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/data/nuforc_stats.json").then(r => r.json()),
      fetch("/data/extracted_top_cases.json").then(r => r.json()),
    ]).then(([s, cases]: [NuforStats, TopCase[]]) => {
      setStats(s)
      setSamples(cases.slice(0, 3))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const avgPerYear = stats ? Math.round(stats.total / 84) : 0

  const sourceValues = [
    stats ? stats.total.toLocaleString() : "79,621",
    "171+", "5", "12",
  ]

  return (
    <div style={{ height:"100vh", overflowY:"auto", background:"#020817", display:"flex", flexDirection:"column" }}>
      <StepHeader step="01" title="COLLECT" subtitle="Data Ingestion & Source Verification" next="extract" onNav={onNav} />

      <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:28, flex:1 }}>

        {/* Section A: Data Sources */}
        <section>
          <div style={{ fontSize:9, color:"#475569", letterSpacing:"0.25em", fontWeight:700, marginBottom:14 }}>A — DATA SOURCES</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
            {SOURCE_META.map((src, i) => (
              <div key={src.label} style={{ background:"rgba(15,25,50,0.7)", border:"1px solid rgba(6,182,212,0.14)", borderLeft:`3px solid ${src.color}`, borderRadius:8, padding:"18px 20px", display:"flex", flexDirection:"column", gap:8 }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                  <div style={{ fontFamily:"monospace", fontSize:32, fontWeight:900, color:src.color, lineHeight:1 }}>{sourceValues[i]}</div>
                  <span style={{ fontSize:8, fontWeight:700, letterSpacing:"0.15em", color:src.color, background:`${src.color}18`, border:`1px solid ${src.color}40`, borderRadius:4, padding:"3px 8px", flexShrink:0, marginTop:4 }}>{src.status}</span>
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:"#e2e8f0", letterSpacing:"0.08em" }}>{src.label}</div>
                {i === 0 && stats && (
                  <div style={{ fontSize:10, color:"#64748b" }}>{stats.years_span} · {stats.countries} countries</div>
                )}
                {i !== 0 && <div style={{ fontSize:10, color:"#64748b" }}>{["Reports · 1941–2014 · 40 countries","Classified cases · Official releases","Declassified footage · DoD authenticated","Multi-sensor confirmed incidents"][i]}</div>}
                <div style={{ fontSize:10, color:"#94a3b8", lineHeight:1.6, borderTop:"1px solid rgba(6,182,212,0.08)", paddingTop:10, marginTop:4 }}>{src.detail}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Section B: Real witness narratives */}
        <section>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ fontSize:9, color:"#475569", letterSpacing:"0.25em", fontWeight:700 }}>B — REAL NUFORC WITNESS NARRATIVES</div>
            <div style={{ width:6, height:6, borderRadius:"50%", background: loading ? "#f59e0b" : "#00ff88", boxShadow:`0 0 6px ${loading ? "#f59e0b" : "#00ff88"}` }} />
            <span style={{ fontSize:9, color: loading ? "#f59e0b" : "#00ff88", letterSpacing:"0.1em" }}>{loading ? "LOADING..." : "LIVE FROM 79,621 RECORDS"}</span>
          </div>
          <div style={{ background:"rgba(0,0,0,0.4)", border:"1px solid rgba(6,182,212,0.2)", borderRadius:8, padding:"20px", fontFamily:"monospace", fontSize:11, color:"#94a3b8", display:"flex", flexDirection:"column", gap:0 }}>
            {(loading ? [{id:"—",year:0,state:"",country:"",city:"",comment_preview:"Loading real witness narratives...",extracted_shape:"",credibility_score:0}] : samples).map((s, i) => (
              <div key={i}>
                {i > 0 && <div style={{ borderTop:"1px solid rgba(6,182,212,0.08)", margin:"14px 0" }} />}
                <div style={{ marginBottom:4 }}>
                  <span style={{ color:"#06b6d4" }}>[{s.year || "—"}]</span>
                  {" "}
                  <span style={{ color:"#00ff88" }}>{[s.city, s.state?.toUpperCase(), s.country?.toUpperCase()].filter(Boolean).join(", ") || "LOCATION UNKNOWN"}</span>
                  {s.extracted_shape && <span style={{ color:"#a78bfa", marginLeft:8 }}>Shape: {s.extracted_shape}</span>}
                  <span style={{ color:"#475569", marginLeft:8 }}>ID: {s.id}</span>
                </div>
                <div style={{ color:"#94a3b8", lineHeight:1.6 }}>&quot;{s.comment_preview}&quot;</div>
              </div>
            ))}
          </div>
        </section>

        {/* Section C: Real collection stats */}
        <section>
          <div style={{ fontSize:9, color:"#475569", letterSpacing:"0.25em", fontWeight:700, marginBottom:14 }}>C — COLLECTION STATISTICS (LIVE)</div>
          <div style={{ background:"rgba(15,25,50,0.7)", border:"1px solid rgba(6,182,212,0.14)", borderRadius:8, padding:"16px 24px", display:"flex", alignItems:"center", gap:0 }}>
            {[
              { label:"Total Reports", value: loading ? "—" : stats!.total.toLocaleString() },
              { label:"Date Range",    value: loading ? "—" : stats!.years_span },
              { label:"Countries",     value: loading ? "—" : stats!.countries.toString() },
              { label:"Avg / Year",    value: loading ? "—" : avgPerYear.toLocaleString() },
              { label:"Peak Year",     value: loading ? "—" : stats!.peak_year.toString() },
              { label:"Night Reports", value: loading ? "—" : `${stats!.night_pct}%` },
            ].map((stat, i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", gap:4, alignItems:"center", borderLeft: i > 0 ? "1px solid rgba(6,182,212,0.1)" : "none", padding:"4px 0" }}>
                <div style={{ fontFamily:"monospace", fontSize:20, fontWeight:900, color:"#06b6d4" }}>{stat.value}</div>
                <div style={{ fontSize:9, color:"#64748b", letterSpacing:"0.15em", textTransform:"uppercase", textAlign:"center" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Section D: Top shape + state */}
        {!loading && stats && (
          <section>
            <div style={{ fontSize:9, color:"#475569", letterSpacing:"0.25em", fontWeight:700, marginBottom:14 }}>D — KEY COLLECTION INSIGHTS</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              {[
                { label:"Most Reported Shape", value:stats.top_shape, color:"#06b6d4" },
                { label:"Highest Volume State", value:stats.top_state?.toUpperCase() || "CA", color:"#00ff88" },
                { label:"US Reports", value:`${stats.us_pct}%`, color:"#f59e0b" },
                { label:"Triangle Reports", value:stats.triangle_count?.toLocaleString(), color:"#ef4444" },
                { label:"Median Duration", value:`${Math.round(stats.median_duration_seconds/60)}min`, color:"#a78bfa" },
                { label:"Peak Year Volume", value:stats.peak_year_count?.toLocaleString(), color:"#06b6d4" },
              ].map(ins => (
                <div key={ins.label} style={{ background:"rgba(10,22,40,0.7)", border:`1px solid ${ins.color}20`, borderRadius:8, padding:"14px 18px" }}>
                  <div style={{ fontSize:22, fontWeight:900, color:ins.color, lineHeight:1 }}>{ins.value}</div>
                  <div style={{ fontSize:9, color:"#64748b", marginTop:6, letterSpacing:"0.1em" }}>{ins.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
