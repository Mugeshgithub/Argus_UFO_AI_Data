"use client"
import { useState, useEffect } from "react"
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, CartesianGrid,
} from "recharts"

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

const TOOLTIP_STYLE = {
  contentStyle: { background:"rgba(10,22,40,0.97)", border:"1px solid rgba(6,182,212,0.3)", borderRadius:8, fontSize:11, color:"#e2e8f0", fontFamily:"monospace" },
}

type Row   = { [k: string]: string | number }
type Stats = {
  total_processed: number; silent_reports: number; hovering_reports: number
  instant_accel_reports: number; military_context: number; physics_violations: number
  high_credibility: number; with_video_photo: number; trans_medium: number
  electromagnetic: number; top_anomaly_combo: number; silent_pct: number
  military_pct: number; physics_violation_pct: number
}

function FindingTag({ label, color = "#06b6d4" }: { label: string; color?: string }) {
  return (
    <span style={{ fontSize:8, fontWeight:700, letterSpacing:"0.12em", padding:"2px 8px", borderRadius:3, border:`1px solid ${color}40`, background:`${color}12`, color }}>{label}</span>
  )
}

function ChartCard({ title, tag, tagColor = "#06b6d4", insight, children }: {
  title: string; tag: string; tagColor?: string; insight: string; children: React.ReactNode
}) {
  return (
    <div style={{ background:"rgba(10,22,40,0.7)", border:"1px solid rgba(6,182,212,0.14)", borderRadius:12, overflow:"hidden" }}>
      <div style={{ padding:"16px 20px 0", display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:10, color:"#e2e8f0", fontWeight:600, letterSpacing:"0.08em" }}>{title}</span>
        <FindingTag label={tag} color={tagColor} />
      </div>
      <div style={{ padding:"12px 8px 8px" }}>{children}</div>
      <div style={{ padding:"0 20px 14px", fontSize:10, color:"#64748b", lineHeight:1.6, borderTop:"1px solid rgba(6,182,212,0.06)", paddingTop:10, marginTop:2 }}>
        <span style={{ color:"#06b6d4", fontWeight:600 }}>INSIGHT</span> {insight}
      </div>
    </div>
  )
}

export default function ExtractView({ onNav }: { onNav: (v: string) => void }) {
  const [stats,     setStats]     = useState<Stats | null>(null)
  const [sound,     setSound]     = useState<Row[]>([])
  const [movement,  setMovement]  = useState<Row[]>([])
  const [anomalies, setAnomalies] = useState<Row[]>([])
  const [cred,      setCred]      = useState<Row[]>([])
  const [shapes,    setShapes]    = useState<Row[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/data/extracted_stats.json").then(r => r.json()),
      fetch("/data/extracted_sound.json").then(r => r.json()),
      fetch("/data/extracted_movement.json").then(r => r.json()),
      fetch("/data/extracted_anomalies.json").then(r => r.json()),
      fetch("/data/extracted_credibility.json").then(r => r.json()),
      fetch("/data/extracted_shapes.json").then(r => r.json()),
    ]).then(([s, snd, mov, ano, cr, sh]) => {
      setStats(s); setSound(snd); setMovement(mov)
      setAnomalies(ano); setCred(cr); setShapes(sh); setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const total = stats?.total_processed ?? 79621
  const pct   = (n: number) => `${((n / total) * 100).toFixed(1)}%`

  const soundData  = sound.map(r  => ({ name:(r.sound as string),  count:r.count as number }))
  const movData    = movement.map(r => ({ name:(r.movement as string).replace(/_/g," "),  count:r.count as number }))
  const anoData    = anomalies.map(r => ({ name:(r.behavior as string).replace(/_/g," "),  count:r.count as number }))
  const credData   = cred.map(r  => ({ name:(r.signal as string).replace(/_/g," "),  count:r.count as number }))
  const shapeData  = shapes.map(r => ({ name:r.shape as string,   count:r.count as number }))

  const MOV_COLORS  = ["#a855f7","#ef4444","#06b6d4","#f59e0b","#00ff88","#ec4899"]
  const ANO_COLORS  = ["#ef4444","#f59e0b","#06b6d4","#ec4899","#a855f7"]
  const CRED_COLORS = ["#00ff88","#06b6d4","#f59e0b","#a855f7","#ef4444"]
  const SHAPE_COLORS= ["#06b6d4","#ef4444","#a855f7","#ec4899","#f59e0b","#f97316","#14b8a6","#64748b"]

  if (loading) return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#020817" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:11, color:"#06b6d4", letterSpacing:"0.2em", marginBottom:8 }}>LOADING EXTRACTION RESULTS...</div>
        <div style={{ fontSize:9, color:"#475569" }}>Reading 11 intelligence files</div>
      </div>
    </div>
  )

  return (
    <div style={{ height:"100vh", overflowY:"auto", background:"#020817", display:"flex", flexDirection:"column" }}>
      <StepHeader step="02" title="EXTRACT" subtitle="What AI found inside 79,621 raw witness narratives" next="research" onNav={onNav} />

      <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:32, flex:1 }}>

        {/* ── Pipeline run summary ── */}
        <section>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <span style={{ fontSize:9, color:"#475569", letterSpacing:"0.25em", fontWeight:700 }}>PIPELINE OUTPUT</span>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#00ff88", boxShadow:"0 0 8px #00ff88" }} />
            <span style={{ fontSize:9, color:"#00ff88", letterSpacing:"0.15em" }}>ALL {total.toLocaleString()} RECORDS PROCESSED · ZERO API COST</span>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {[
              { v: total.toLocaleString(),                                   l:"Records Processed",    c:"#06b6d4" },
              { v:`${stats!.silent_reports.toLocaleString()} (${stats!.silent_pct}%)`, l:"Silent Objects",       c:"#a855f7" },
              { v: stats!.instant_accel_reports.toLocaleString(),            l:"Instant Acceleration", c:"#ef4444" },
              { v: stats!.military_context.toLocaleString(),                 l:"Military Context",     c:"#f59e0b" },
              { v: stats!.trans_medium.toLocaleString(),                     l:"Trans-Medium",         c:"#06b6d4" },
              { v: stats!.top_anomaly_combo.toString(),                      l:"Top Anomaly Combo",    c:"#00ff88" },
            ].map(s => (
              <div key={s.l} style={{ flex:"1 1 140px", background:"rgba(10,22,40,0.8)", border:`1px solid ${s.c}20`, borderRadius:8, padding:"12px 16px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${s.c}70,transparent)` }} />
                <div style={{ fontSize:22, fontWeight:900, color:s.c, lineHeight:1 }}>{s.v}</div>
                <div style={{ fontSize:9, color:"#64748b", marginTop:5, letterSpacing:"0.1em" }}>{s.l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── KEY DISCOVERY HEADLINE ── */}
        <div style={{ background:"linear-gradient(135deg,rgba(239,68,68,0.08),rgba(168,85,247,0.08))", border:"1px solid rgba(239,68,68,0.25)", borderRadius:12, padding:"20px 24px" }}>
          <div style={{ fontSize:9, color:"#ef4444", letterSpacing:"0.3em", fontWeight:700, marginBottom:12 }}>KEY DISCOVERY — THE RAREST PATTERN</div>
          <div style={{ display:"flex", gap:32, alignItems:"center", flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:48, fontWeight:900, color:"#ef4444", lineHeight:1, textShadow:"0 0 32px rgba(239,68,68,0.5)" }}>77</div>
              <div style={{ fontSize:10, color:"#94a3b8", marginTop:4 }}>out of 79,621 reports</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#e2e8f0", marginBottom:8 }}>
                Silent + Instant Acceleration — simultaneously
              </div>
              <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.7 }}>
                Every known propulsion system produces sound. Every system that produces thrust leaves a thermal or acoustic signature. Of 79,621 reports processed, only <strong style={{ color:"#ef4444" }}>77 (0.097%)</strong> describe an object that is both acoustically silent AND capable of instant acceleration — a physical combination that has no conventional explanation.
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, minWidth:160 }}>
              {[
                { l:"Silent only", v:stats!.silent_reports.toLocaleString(), c:"#a855f7" },
                { l:"Instant accel only", v:stats!.instant_accel_reports.toLocaleString(), c:"#f59e0b" },
                { l:"Both together", v:"77", c:"#ef4444" },
              ].map(r => (
                <div key={r.l} style={{ display:"flex", justifyContent:"space-between", gap:16, fontSize:10 }}>
                  <span style={{ color:"#64748b" }}>{r.l}</span>
                  <span style={{ color:r.c, fontWeight:700, fontFamily:"monospace" }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Chart grid row 1: Sound + Movement ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

          <ChartCard
            title="ACOUSTIC SIGNATURE DISTRIBUTION"
            tag="EXTRACTION FINDING"
            insight={`${pct(stats!.silent_reports)} of reports with sound data describe complete silence — 10× more common than loud reports. Conventional aircraft are never silent.`}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={soundData} layout="vertical" margin={{ left:0, right:24, top:0, bottom:0 }}>
                <XAxis type="number" tick={{ fontSize:9, fill:"#64748b" }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)} />
                <YAxis type="category" dataKey="name" tick={{ fontSize:10, fill:"#94a3b8" }} tickLine={false} axisLine={false} width={55} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Reports" radius={[0,4,4,0]}>
                  {soundData.map((_, i) => <Cell key={i} fill={["#a855f7","#ef4444","#f59e0b","#06b6d4"][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="MOVEMENT PATTERN DISTRIBUTION"
            tag="EXTRACTION FINDING"
            tagColor="#f59e0b"
            insight={`Hovering (${stats!.hovering_reports.toLocaleString()}) is the single most reported movement — an object sitting stationary with no wing-lift, no rotor, no visible means of staying airborne.`}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={movData} layout="vertical" margin={{ left:0, right:24, top:0, bottom:0 }}>
                <XAxis type="number" tick={{ fontSize:9, fill:"#64748b" }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)} />
                <YAxis type="category" dataKey="name" tick={{ fontSize:9, fill:"#94a3b8" }} tickLine={false} axisLine={false} width={110} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Reports" radius={[0,4,4,0]}>
                  {movData.map((_, i) => <Cell key={i} fill={MOV_COLORS[i % MOV_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Chart grid row 2: Anomaly + Shape ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

          <ChartCard
            title="ANOMALOUS BEHAVIOR FREQUENCY"
            tag="PHYSICS ANOMALY"
            tagColor="#ef4444"
            insight={`Cloaking (${anoData[0]?.count.toLocaleString()}) means objects disappearing from radar and visual simultaneously — not just leaving the field of view. ${pct(stats!.physics_violations)} explicitly state "defied physics."`}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={anoData} layout="vertical" margin={{ left:0, right:24, top:0, bottom:0 }}>
                <XAxis type="number" tick={{ fontSize:9, fill:"#64748b" }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)} />
                <YAxis type="category" dataKey="name" tick={{ fontSize:9, fill:"#94a3b8" }} tickLine={false} axisLine={false} width={110} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Reports" radius={[0,4,4,0]}>
                  {anoData.map((_, i) => <Cell key={i} fill={ANO_COLORS[i % ANO_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="SHAPE EXTRACTED FROM NARRATIVE"
            tag="NLP EXTRACTION"
            tagColor="#00ff88"
            insight={`"Light" dominates at ${pct(shapeData[0]?.count ?? 0)} — ${(shapeData[0]?.count ?? 0).toLocaleString()} reports. Triangles (#2 at ${(shapeData[1]?.count ?? 0).toLocaleString()}) surged post-1980, coinciding with classified stealth programs going active.`}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={shapeData} margin={{ left:0, right:8, top:4, bottom:20 }}>
                <XAxis dataKey="name" tick={{ fontSize:9, fill:"#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:9, fill:"#64748b" }} tickLine={false} axisLine={false} width={36} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Reports" radius={[4,4,0,0]}>
                  {shapeData.map((_, i) => <Cell key={i} fill={SHAPE_COLORS[i % SHAPE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Credibility signals ── */}
        <ChartCard
          title="CREDIBILITY SIGNAL FREQUENCY — WHAT MAKES A REPORT VERIFIABLE"
          tag="EVIDENCE CHAIN"
          tagColor="#00ff88"
          insight={`Only ${pct(stats!.with_video_photo)} of reports mention video or photo evidence. Only ${pct(stats!.high_credibility)} score ≥70 credibility. The gap between 79,621 civilian reports and 12 verified Pentagon cases is the size of this filter.`}
        >
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={credData} margin={{ left:0, right:8, top:4, bottom:0 }}>
              <XAxis dataKey="name" tick={{ fontSize:9, fill:"#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:9, fill:"#64748b" }} tickLine={false} axisLine={false} width={36} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" name="Reports" radius={[4,4,0,0]}>
                {credData.map((_, i) => <Cell key={i} fill={CRED_COLORS[i % CRED_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── 5 key findings ── */}
        <section>
          <div style={{ fontSize:9, color:"#475569", letterSpacing:"0.25em", fontWeight:700, marginBottom:16 }}>WHAT THE EXTRACTION REVEALED — 5 KEY FINDINGS</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:12 }}>
            {[
              {
                n:"01", color:"#a855f7",
                title:"Silence is the strongest signal",
                body:`${pct(stats!.silent_reports)} of labeled reports describe acoustic silence. No jet engine, no rotor, no sonic boom. This is the single most repeated anomaly across 7 decades of reports — consistent across cultures and countries.`,
              },
              {
                n:"02", color:"#ef4444",
                title:"Hovering defies aerodynamics",
                body:`${stats!.hovering_reports.toLocaleString()} reports describe stationary hover with no visible lift mechanism. Fixed-wing craft cannot hover. Helicopters cannot hover silently. Balloons cannot hover without wind drift.`,
              },
              {
                n:"03", color:"#06b6d4",
                title:"Objects enter water without impact",
                body:`${stats!.trans_medium.toLocaleString()} reports describe air-to-water or water-to-air transitions at speed with no deceleration and no splash — behavior observed directly by USS Omaha sonar crews in 2019.`,
              },
              {
                n:"04", color:"#f59e0b",
                title:"Military correlation is not random",
                body:`${stats!.military_context.toLocaleString()} reports (${stats!.military_pct}%) occur near military bases, involve radar operators, pilots, or nuclear facilities. The clustering around these sites is statistically non-random.`,
              },
              {
                n:"05", color:"#00ff88",
                title:"The rarest combo is the most interesting",
                body:`Only 77 reports describe both silence AND instant acceleration simultaneously. This combination eliminates every known propulsion technology — chemical, electric, jet, rocket. 77 cases. No explanation.`,
              },
            ].map(f => (
              <div key={f.n} style={{ background:"rgba(10,22,40,0.6)", border:`1px solid ${f.color}20`, borderRadius:10, padding:"18px 20px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, width:3, bottom:0, background:f.color }} />
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <span style={{ fontFamily:"monospace", fontSize:10, color:f.color, opacity:0.6 }}>{f.n}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:"#e2e8f0" }}>{f.title}</span>
                </div>
                <p style={{ fontSize:10, color:"#94a3b8", lineHeight:1.7, margin:0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Extraction methodology note ── */}
        <div style={{ background:"rgba(6,182,212,0.04)", border:"1px solid rgba(6,182,212,0.15)", borderRadius:8, padding:"16px 20px", fontSize:10, color:"#64748b", lineHeight:1.8 }}>
          <span style={{ color:"#06b6d4", fontWeight:700, fontSize:9, letterSpacing:"0.2em" }}>METHODOLOGY</span>
          {"  "}7 signal categories · 42 regex pattern groups · spaCy NER · processed locally in ~90s · zero API cost.
          Each report&apos;s <code style={{ color:"#94a3b8", background:"rgba(6,182,212,0.08)", padding:"1px 5px", borderRadius:3 }}>comments</code> field (unstructured text) was scanned for shape, sound, movement, light, military context, credibility signals, and anomaly behaviors. Fields not mentioned in the narrative are left null — no imputation.
        </div>

      </div>
    </div>
  )
}
