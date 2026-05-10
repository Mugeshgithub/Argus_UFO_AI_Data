"use client"
import { useEffect, useState, useCallback } from "react"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from "recharts"
import { Download, Filter, TrendingUp, Globe, Clock, Zap, BarChart2, Map, AlertTriangle, Cpu, Shield } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────
type YearRow    = { year: number; count: number }
type ShapeRow   = { shape_clean: string; count: number }
type StateRow   = { state: string; count: number }
type HourRow    = { hour: number; count: number }
type DurRow     = { label: string; count: number }
type CountryRow = { country: string; count: number }
type DecadeRow  = { decade: string; Light:number; Circle:number; Triangle:number; Fireball:number; Sphere:number; Disk:number; Unknown:number }
type CityRow    = { city: string; count: number }
type MonthRow   = { month_name: string; count: number }
type Stats      = {
  total: number; years_span: string; peak_year: number; peak_year_count: number;
  top_shape: string; top_state: string; us_pct: number; night_pct: number;
  median_duration_seconds: number; countries: number; triangle_count: number
}

// ── Advanced analytics types ───────────────────────────────────────────
type BiasRow      = { year: number; raw_count: number; internet_pct: number; bias_corrected: number }
type PerCapitaRow = { state: string; count: number; pop_millions: number; per_100k: number; rank_per_capita: number }
type KeyQuestion  = { q: string; a: string; stat: string; stat_label: string; source: string; color: string }

// ── Extracted intelligence types ───────────────────────────────────────
type SoundRow     = { sound: string; count: number }
type MovementRow  = { movement: string; count: number }
type CredRow      = { signal: string; count: number }
type AnomalyRow   = { behavior: string; count: number }
type MilYearRow   = { year: number; count: number }
type PhysicsYRow  = { year: number; count: number }
type TopAnomalyYR = { year: number; count: number }
type ExtStats     = {
  total_processed: number
  silent_reports: number; hovering_reports: number; instant_accel_reports: number
  military_context: number; physics_violations: number; high_credibility: number
  with_video_photo: number; trans_medium: number; electromagnetic: number
  top_anomaly_combo: number; silent_pct: number; military_pct: number; physics_violation_pct: number
}
type TopCase = {
  id: string; year: number; state: string; country: string; city: string
  extracted_shape: string; sound: string; movement_tags: string[]
  anomaly_behaviors: string[]; credibility_score: number; comment_preview: string
}

const CYAN   = "#06b6d4"
const GREEN  = "#00ff88"
const AMBER  = "#f59e0b"
const RED    = "#ef4444"
const PURPLE = "#a855f7"
const PINK   = "#ec4899"

const SHAPE_COLORS: Record<string, string> = {
  Light:"#06b6d4", Circle:"#00ff88", Triangle:"#ef4444", Fireball:"#f59e0b",
  Unknown:"#64748b", Other:"#475569", Sphere:"#a855f7", Disk:"#ec4899",
  Oval:"#3b82f6", Formation:"#14b8a6", Cigar:"#f97316", Flash:"#eab308",
  Rectangle:"#8b5cf6", Chevron:"#06b6d4", Cylinder:"#22d3ee",
}

const CHART_TOOLTIP = {
  contentStyle: {
    background:"rgba(10,22,40,0.97)", border:"1px solid rgba(6,182,212,0.3)",
    borderRadius:8, fontSize:11, color:"#e2e8f0", fontFamily:"inherit",
  },
  cursor: { fill:"rgba(6,182,212,0.06)" },
}

// ── Custom tooltip ─────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:"rgba(10,22,40,0.97)", border:"1px solid rgba(6,182,212,0.3)", borderRadius:8, padding:"10px 14px", fontSize:11, fontFamily:"inherit" }}>
      <div style={{ color:"#64748b", marginBottom:4, letterSpacing:"0.1em" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || CYAN, fontWeight:600 }}>
          {p.name}: {p.value.toLocaleString()}
        </div>
      ))}
    </div>
  )
}

// ── Section header ─────────────────────────────────────────────────────
function SectionTitle({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
        <span style={{ color:CYAN }}>{icon}</span>
        <span style={{ fontSize:11, color:CYAN, letterSpacing:"0.2em" }}>{title}</span>
        <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(6,182,212,0.3),transparent)", marginLeft:8 }} />
      </div>
      <div style={{ fontSize:12, color:"#64748b", paddingLeft:24 }}>{sub}</div>
    </div>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────
function StatCard({ value, label, sub, color = CYAN }: { value: string; label: string; sub?: string; color?: string }) {
  return (
    <div style={{
      background:"rgba(10,22,40,0.7)", border:`1px solid ${color}25`,
      borderRadius:12, padding:"20px 24px", flex:"1 1 180px", minWidth:0,
      boxShadow:`0 0 20px ${color}10`,
    }}>
      <div style={{ fontSize:32, fontWeight:900, color, letterSpacing:"-0.02em", textShadow:`0 0 20px ${color}60`, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, color:"#e2e8f0", fontWeight:600, marginTop:8, letterSpacing:"0.05em" }}>{label}</div>
      {sub && <div style={{ fontSize:10, color:"#64748b", marginTop:3 }}>{sub}</div>}
    </div>
  )
}

// ── Export helper ──────────────────────────────────────────────────────
function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" })
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob)
  a.download = filename; a.click()
}

// ── Main component ─────────────────────────────────────────────────────
export default function ResearchDashboard() {
  const [byYear,    setByYear]    = useState<YearRow[]>([])
  const [byShape,   setByShape]   = useState<ShapeRow[]>([])
  const [byState,   setByState]   = useState<StateRow[]>([])
  const [byHour,    setByHour]    = useState<HourRow[]>([])
  const [byDur,     setByDur]     = useState<DurRow[]>([])
  const [byCountry, setByCountry] = useState<CountryRow[]>([])
  const [byDecade,  setByDecade]  = useState<DecadeRow[]>([])
  const [byMonth,   setByMonth]   = useState<MonthRow[]>([])
  const [stats,     setStats]     = useState<Stats | null>(null)
  const [loading,   setLoading]   = useState(true)

  // Advanced analytics state
  const [biasData,    setBiasData]    = useState<BiasRow[]>([])
  const [perCapita,   setPerCapita]   = useState<PerCapitaRow[]>([])
  const [keyQs,       setKeyQs]       = useState<KeyQuestion[]>([])
  const [showBias,    setShowBias]    = useState(false)

  // Extracted intelligence state
  const [extSound,      setExtSound]      = useState<SoundRow[]>([])
  const [extMovement,   setExtMovement]   = useState<MovementRow[]>([])
  const [extCred,       setExtCred]       = useState<CredRow[]>([])
  const [extAnomalies,  setExtAnomalies]  = useState<AnomalyRow[]>([])
  const [milByYear,     setMilByYear]     = useState<MilYearRow[]>([])
  const [physByYear,    setPhysByYear]    = useState<PhysicsYRow[]>([])
  const [topAnomalyYR,  setTopAnomalyYR] = useState<TopAnomalyYR[]>([])
  const [extStats,      setExtStats]      = useState<ExtStats | null>(null)
  const [topCases,      setTopCases]      = useState<TopCase[]>([])
  const [extLoading,    setExtLoading]    = useState(true)

  // Filters
  const [yearRange, setYearRange] = useState<[number,number]>([1940, 2024])
  const [activeShape, setActiveShape] = useState<string>("All")

  useEffect(() => {
    const files = [
      "/data/nuforc_by_year.json","/data/nuforc_by_shape.json","/data/nuforc_by_state.json",
      "/data/nuforc_by_hour.json","/data/nuforc_by_duration.json","/data/nuforc_by_country.json",
      "/data/nuforc_by_decade.json","/data/nuforc_by_month.json","/data/nuforc_stats.json",
    ]
    Promise.all(files.map(f => fetch(f).then(r => r.json()))).then(
      ([yr, sh, st, hr, dur, co, dec, mo, stats]) => {
        setByYear(yr); setByShape(sh); setByState(st); setByHour(hr)
        setByDur(dur); setByCountry(co); setByDecade(dec); setByMonth(mo)
        setStats(stats); setLoading(false)
      }
    )
  }, [])

  useEffect(() => {
    const extFiles = [
      "/data/extracted_sound.json",
      "/data/extracted_movement.json",
      "/data/extracted_credibility.json",
      "/data/extracted_anomalies.json",
      "/data/extracted_military_by_year.json",
      "/data/extracted_physics_year.json",
      "/data/extracted_top_anomaly_year.json",
      "/data/extracted_stats.json",
      "/data/extracted_top_cases.json",
    ]
    Promise.all(extFiles.map(f => fetch(f).then(r => r.json()))).then(
      ([snd, mov, crd, ano, mil, phy, topYr, es, tc]) => {
        setExtSound(snd); setExtMovement(mov); setExtCred(crd); setExtAnomalies(ano)
        setMilByYear(mil); setPhysByYear(phy); setTopAnomalyYR(topYr)
        setExtStats(es); setTopCases(tc); setExtLoading(false)
      }
    ).catch(() => setExtLoading(false))
  }, [])

  useEffect(() => {
    Promise.all([
      fetch("/data/nuforc_bias_corrected.json").then(r => r.json()),
      fetch("/data/nuforc_per_capita.json").then(r => r.json()),
      fetch("/data/derived_key_questions.json").then(r => r.json()),
    ]).then(([bias, pc, kq]) => {
      setBiasData(bias); setPerCapita(pc); setKeyQs(kq)
    }).catch(() => {})
  }, [])

  // Year chart: raw or bias-corrected
  const filteredYear = activeShape === "All"
    ? (showBias
        ? biasData
            .filter(r => r.year >= yearRange[0] && r.year <= yearRange[1])
            .map(r => ({ year: r.year, count: r.bias_corrected, raw: r.raw_count }))
        : byYear.filter(r => r.year >= yearRange[0] && r.year <= yearRange[1]))
    : byDecade
        .filter(d => {
          const decade = parseInt(d.decade)
          return decade >= yearRange[0] - 10 && decade <= yearRange[1]
        })
        .map(d => ({
          year: parseInt(d.decade),
          count: (d[activeShape as keyof DecadeRow] as number) || 0,
        }))

  // Shape chart: filter to selected shape only, or show top 10
  const filteredShape = activeShape === "All"
    ? byShape.slice(0, 10)
    : byShape.filter(r => r.shape_clean === activeShape)

  const handleExport = useCallback(() => {
    downloadJSON({ byYear, byShape, byState, byHour, byDur, byCountry, byDecade, byMonth, stats },
      "argus_uap_research_data.json")
  }, [byYear, byShape, byState, byHour, byDur, byCountry, byDecade, byMonth, stats])

  const handleExportCSV = useCallback(() => {
    const rows = byYear.map(r => `${r.year},${r.count}`)
    const csv = "year,count\n" + rows.join("\n")
    const blob = new Blob([csv], { type:"text/csv" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob)
    a.download = "nuforc_sightings_by_year.csv"; a.click()
  }, [byYear])

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:400 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:11, color:CYAN, letterSpacing:"0.2em", animation:"blink 1s infinite" }}>
          LOADING 79,621 RECORDS...
        </div>
      </div>
    </div>
  )

  const medMinutes = stats ? Math.round(stats.median_duration_seconds / 60) : 0

  return (
    <div style={{ maxWidth:1400, margin:"0 auto", padding:"0 24px 80px" }}>

      {/* ── KEY STATS ROW ─────────────────────────────────────────── */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:16, marginBottom:48 }}>
        <StatCard value={stats ? stats.total.toLocaleString() : "—"} label="Total NUFORC Reports" sub={`${stats?.years_span} · Real database`} color={CYAN} />
        <StatCard value={stats?.peak_year?.toString() ?? "—"} label="Peak Sighting Year" sub={`${stats?.peak_year_count?.toLocaleString()} reports that year`} color={RED} />
        <StatCard value={`${stats?.night_pct ?? 0}%`} label="Occur at Night" sub="Between 8pm – 2am" color={PURPLE} />
        <StatCard value={`${medMinutes}min`} label="Median Duration" sub="Across all reported sightings" color={AMBER} />
        <StatCard value={stats?.triangle_count?.toLocaleString() ?? "—"} label="Triangle Reports" sub="Most reported geometric shape" color={GREEN} />
        <StatCard value={`${stats?.us_pct ?? 0}%`} label="From United States" sub={`${stats?.countries} countries total`} color={CYAN} />
      </div>

      {/* ── FILTER BAR ────────────────────────────────────────────── */}
      <div style={{
        display:"flex", alignItems:"center", gap:16, flexWrap:"wrap",
        marginBottom:40, padding:"14px 20px",
        background:"rgba(10,22,40,0.7)", border:"1px solid rgba(6,182,212,0.2)",
        borderRadius:10,
      }}>
        <Filter style={{ width:14, height:14, color:CYAN }} />
        <span style={{ fontSize:10, color:"#64748b", letterSpacing:"0.15em" }}>FILTERS</span>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:10, color:"#64748b" }}>YEAR RANGE</span>
          <input type="range" min={1940} max={2024} value={yearRange[0]}
            onChange={e => setYearRange([+e.target.value, yearRange[1]])}
            style={{ accentColor:CYAN, width:80 }} />
          <span style={{ fontSize:11, color:CYAN, minWidth:32 }}>{yearRange[0]}</span>
          <span style={{ fontSize:10, color:"#64748b" }}>–</span>
          <input type="range" min={1940} max={2024} value={yearRange[1]}
            onChange={e => setYearRange([yearRange[0], +e.target.value])}
            style={{ accentColor:CYAN, width:80 }} />
          <span style={{ fontSize:11, color:CYAN, minWidth:32 }}>{yearRange[1]}</span>
        </div>

        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {["All", "Light", "Circle", "Triangle", "Fireball", "Sphere", "Disk"].map(s => (
            <button key={s} onClick={() => setActiveShape(s)} style={{
              padding:"3px 10px", borderRadius:4, fontSize:10, cursor:"pointer",
              border:`1px solid ${activeShape === s ? CYAN : "rgba(100,116,139,0.3)"}`,
              background: activeShape === s ? "rgba(6,182,212,0.15)" : "transparent",
              color: activeShape === s ? CYAN : "#64748b",
              letterSpacing:"0.08em",
            }}>{s}</button>
          ))}
        </div>

        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button onClick={handleExportCSV} style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"6px 14px", borderRadius:6, fontSize:10, cursor:"pointer",
            border:"1px solid rgba(0,255,136,0.3)", background:"rgba(0,255,136,0.08)",
            color:GREEN, letterSpacing:"0.1em",
          }}>
            <Download style={{ width:12, height:12 }} /> CSV
          </button>
          <button onClick={handleExport} style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"6px 14px", borderRadius:6, fontSize:10, cursor:"pointer",
            border:"1px solid rgba(6,182,212,0.3)", background:"rgba(6,182,212,0.08)",
            color:CYAN, letterSpacing:"0.1em",
          }}>
            <Download style={{ width:12, height:12 }} /> JSON
          </button>
        </div>
      </div>

      {/* ── CHART 1: SIGHTINGS BY YEAR ───────────────────────────── */}
      <div style={{ marginBottom:56 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
          <SectionTitle
            icon={<TrendingUp style={{ width:14, height:14 }} />}
            title="SIGHTINGS OVER TIME"
            sub={
              activeShape === "All"
                ? `${filteredYear.reduce((a,r)=>a+r.count,0).toLocaleString()} ${showBias ? "bias-corrected" : "raw"} sightings · ${yearRange[0]}–${yearRange[1]}`
                : `Showing "${activeShape}" by decade · ${filteredYear.reduce((a,r)=>a+r.count,0).toLocaleString()} matched`
            }
          />
          {activeShape === "All" && (
            <button onClick={() => setShowBias(v => !v)} style={{
              padding:"5px 12px", borderRadius:5, fontSize:9, cursor:"pointer",
              border:`1px solid ${showBias ? AMBER+"60" : "rgba(6,182,212,0.3)"}`,
              background: showBias ? "rgba(245,158,11,0.12)" : "rgba(6,182,212,0.06)",
              color: showBias ? AMBER : CYAN,
              letterSpacing:"0.12em", flexShrink:0,
            }}>
              {showBias ? "▶ BIAS-CORRECTED" : "▶ RAW COUNT"} (toggle)
            </button>
          )}
        </div>
        <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(6,182,212,0.12)", borderRadius:12, padding:"24px 16px 12px" }}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={filteredYear} margin={{ left:0, right:0, top:4, bottom:0 }}>
              <defs>
                <linearGradient id="yearGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={showBias ? AMBER : CYAN} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={showBias ? AMBER : CYAN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.07)" />
              <XAxis dataKey="year" tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false}
                tickFormatter={v => v % 10 === 0 ? String(v) : ""} />
              <YAxis tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} width={36} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name={showBias ? "Bias-corrected" : (activeShape === "All" ? "Sightings" : activeShape)}
                stroke={showBias ? AMBER : (activeShape === "All" ? CYAN : SHAPE_COLORS[activeShape] || CYAN)}
                strokeWidth={2} fill="url(#yearGrad)" dot={activeShape !== "All"}
                activeDot={{ r:4, fill: showBias ? AMBER : (activeShape === "All" ? CYAN : SHAPE_COLORS[activeShape] || CYAN) }} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ fontSize:10, color:"#475569", textAlign:"center", marginTop:8 }}>
            {showBias
              ? "Bias-corrected: counts normalized by US internet penetration (World Bank data) — flattens the 2012 smartphone spike"
              : "Raw count — spike after 2007 correlates strongly with smartphone adoption (camera + GPS = easier reporting)"}
          </div>
        </div>
      </div>

      {/* ── CHART 2+3: SHAPE + HOUR SIDE BY SIDE ─────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:56 }}>

        {/* Shape distribution */}
        <div>
          <SectionTitle
            icon={<BarChart2 style={{ width:14, height:14 }} />}
            title="OBJECT SHAPE DISTRIBUTION"
            sub={activeShape === "All" ? "Top reported shapes across all 79,621 cases" : `Filtered: ${activeShape} — ${filteredShape[0]?.count.toLocaleString() ?? 0} reports`}
          />
          <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(6,182,212,0.12)", borderRadius:12, padding:"24px 16px 12px" }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredShape} layout="vertical" margin={{ left:4, right:24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.07)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                <YAxis type="category" dataKey="shape_clean" tick={{ fontSize:10, fill:"#94a3b8" }}
                  tickLine={false} axisLine={false} width={72} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Reports" radius={[0,4,4,0]}>
                  {filteredShape.map((entry, i) => (
                    <Cell key={i} fill={SHAPE_COLORS[entry.shape_clean] || CYAN} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hour of day */}
        <div>
          <SectionTitle
            icon={<Clock style={{ width:14, height:14 }} />}
            title="TIME OF DAY PATTERN"
            sub={`${stats?.night_pct}% of sightings occur between 8pm–2am`}
          />
          <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(6,182,212,0.12)", borderRadius:12, padding:"24px 16px 12px" }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byHour} margin={{ left:0, right:8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.07)" />
                <XAxis dataKey="hour" tick={{ fontSize:9, fill:"#64748b" }} tickLine={false} axisLine={false}
                  tickFormatter={v => v === 0 ? "12am" : v === 12 ? "12pm" : v < 12 ? `${v}am` : `${v-12}pm`} />
                <YAxis tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} width={36} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Sightings" radius={[3,3,0,0]}>
                  {byHour.map((entry, i) => (
                    <Cell key={i}
                      fill={entry.hour >= 20 || entry.hour <= 2 ? PURPLE : entry.hour >= 18 ? AMBER : "#1e3a5f"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:8 }}>
              <LegendDot item={{ color: PURPLE, label: "Night (8pm–2am)" }} />
              <LegendDot item={{ color: AMBER,  label: "Evening (6–8pm)" }} />
              <LegendDot item={{ color: "#1e3a5f", label: "Day" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── CHART 4: SHAPE TRENDS BY DECADE ─────────────────────── */}
      <div style={{ marginBottom:56 }}>
        <SectionTitle
          icon={<TrendingUp style={{ width:14, height:14 }} />}
          title="SHAPE TRENDS BY DECADE"
          sub="How reported object shapes have changed over 80 years — triangles rose sharply from the 1980s onward"
        />
        <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(6,182,212,0.12)", borderRadius:12, padding:"24px 16px 12px" }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={byDecade} margin={{ left:0, right:16, top:4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.07)" />
              <XAxis dataKey="decade" tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} width={36} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:10, color:"#64748b" }} />
              {(["Light","Triangle","Circle","Fireball","Sphere"] as const).map((shape, i) => (
                <Line key={shape} type="monotone" dataKey={shape} stroke={Object.values(SHAPE_COLORS)[i]}
                  strokeWidth={2} dot={{ r:3 }} activeDot={{ r:5 }}
                  opacity={activeShape === "All" || activeShape === shape ? 1 : 0.15} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── CHART 5+6: STATE + DURATION ──────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:56 }}>

        {/* Top states */}
        <div>
          <SectionTitle
            icon={<Map style={{ width:14, height:14 }} />}
            title="TOP US STATES"
            sub="Absolute count — California leads consistently"
          />
          <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(6,182,212,0.12)", borderRadius:12, padding:"24px 16px 12px" }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={byState.slice(0,15)} layout="vertical" margin={{ left:4, right:24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.07)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <YAxis type="category" dataKey="state" tick={{ fontSize:11, fill:"#94a3b8" }}
                  tickLine={false} axisLine={false} width={32} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Reports" fill={CYAN} radius={[0,4,4,0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Duration buckets */}
        <div>
          <SectionTitle
            icon={<Clock style={{ width:14, height:14 }} />}
            title="SIGHTING DURATION"
            sub={`Median: ${medMinutes} minutes · Most sightings are brief`}
          />
          <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(6,182,212,0.12)", borderRadius:12, padding:"24px 16px 12px" }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={byDur} margin={{ left:0, right:16, bottom:8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.07)" />
                <XAxis dataKey="label" tick={{ fontSize:9, fill:"#64748b" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} width={36} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Sightings" radius={[4,4,0,0]}>
                  {byDur.map((_, i) => <Cell key={i} fill={[GREEN,CYAN,AMBER,RED,PURPLE,PINK][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── CHART 7+8: COUNTRY + MONTH ───────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:56 }}>

        {/* Country breakdown */}
        <div>
          <SectionTitle
            icon={<Globe style={{ width:14, height:14 }} />}
            title="REPORTS BY COUNTRY"
            sub="US dominates due to NUFORC being US-based reporting centre"
          />
          <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(6,182,212,0.12)", borderRadius:12, padding:"24px 16px 12px" }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byCountry} cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                  dataKey="count" nameKey="country" paddingAngle={2}>
                  {byCountry.map((_, i) => (
                    <Cell key={i} fill={[CYAN,GREEN,AMBER,RED,PURPLE,PINK,"#3b82f6","#14b8a6","#f97316","#eab308","#8b5cf6","#22d3ee"][i % 12]}
                      opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize:10, color:"#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Month pattern */}
        <div>
          <SectionTitle
            icon={<TrendingUp style={{ width:14, height:14 }} />}
            title="SEASONAL PATTERN"
            sub="Summer months (Jun–Aug) consistently see more reports"
          />
          <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(6,182,212,0.12)", borderRadius:12, padding:"24px 16px 12px" }}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={byMonth} margin={{ left:0, right:8, top:4 }}>
                <defs>
                  <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={AMBER} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.07)" />
                <XAxis dataKey="month_name" tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} width={36} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Sightings" stroke={AMBER}
                  strokeWidth={2} fill="url(#monthGrad)" dot={{ r:3, fill:AMBER }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── KEY QUESTIONS ANSWERED ────────────────────────────────── */}
      <div style={{ marginBottom:56 }}>
        <SectionTitle
          icon={<Zap style={{ width:14, height:14 }} />}
          title="KEY QUESTIONS — ANSWERED WITH DATA"
          sub="8 common questions about UAP data, answered from real computed statistics"
        />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:14 }}>
          {keyQs.map((kq, i) => (
            <div key={i} style={{
              padding:"18px 20px", borderRadius:10,
              background:"rgba(10,22,40,0.7)",
              border:`1px solid ${kq.color}20`,
              borderLeft:`3px solid ${kq.color}`,
            }}>
              <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:8 }}>
                <span style={{ fontSize:26, fontWeight:900, color:kq.color, textShadow:`0 0 12px ${kq.color}60`, flexShrink:0 }}>{kq.stat}</span>
                <span style={{ fontSize:9, color:kq.color, letterSpacing:"0.1em", opacity:0.8 }}>{kq.stat_label}</span>
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:"#e2e8f0", marginBottom:6 }}>{kq.q}</div>
              <div style={{ fontSize:10, color:"#94a3b8", lineHeight:1.6 }}>{kq.a}</div>
              <div style={{ fontSize:8, color:"#475569", marginTop:8, letterSpacing:"0.05em" }}>Source: {kq.source}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PER-CAPITA STATE RANKING ──────────────────────────────── */}
      {perCapita.length > 0 && (
        <div style={{ marginBottom:56 }}>
          <SectionTitle
            icon={<Map style={{ width:14, height:14 }} />}
            title="SIGHTINGS PER CAPITA — STATE RANKING"
            sub="Normalized by 2010 Census population — removes the California population confound"
          />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
            <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(6,182,212,0.12)", borderRadius:12, padding:"20px 16px 12px" }}>
              <div style={{ fontSize:10, color:CYAN, letterSpacing:"0.2em", marginBottom:16 }}>SIGHTINGS PER 100K PEOPLE (TOP 15)</div>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={perCapita.slice(0,15)} layout="vertical" margin={{ left:4, right:32 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.07)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="state" tick={{ fontSize:11, fill:"#94a3b8" }} tickLine={false} axisLine={false} width={32} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="per_100k" name="Per 100k" radius={[0,4,4,0]}>
                    {perCapita.slice(0,15).map((_, i) => <Cell key={i} fill={i === 0 ? GREEN : i < 3 ? CYAN : "#1e3a5f"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(6,182,212,0.12)", borderRadius:12, padding:"20px 16px 12px", display:"flex", flexDirection:"column", gap:0 }}>
              <div style={{ fontSize:10, color:CYAN, letterSpacing:"0.2em", marginBottom:16 }}>ABSOLUTE COUNT vs PER CAPITA RANK</div>
              <div style={{ overflowY:"auto", flex:1 }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(6,182,212,0.1)" }}>
                      {["PC RANK","STATE","ABSOLUTE","PER 100K","POP (M)"].map(h => (
                        <th key={h} style={{ padding:"6px 10px", textAlign:"left", fontSize:9, color:"#475569", letterSpacing:"0.12em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {perCapita.slice(0,15).map((r, i) => (
                      <tr key={r.state} style={{ borderBottom:"1px solid rgba(6,182,212,0.05)" }}>
                        <td style={{ padding:"7px 10px", color:i===0?GREEN:CYAN, fontWeight:700 }}>#{r.rank_per_capita}</td>
                        <td style={{ padding:"7px 10px", color:"#e2e8f0", fontWeight:600 }}>{r.state}</td>
                        <td style={{ padding:"7px 10px", color:"#64748b" }}>{r.count.toLocaleString()}</td>
                        <td style={{ padding:"7px 10px", color:i===0?GREEN:AMBER, fontWeight:600 }}>{r.per_100k}</td>
                        <td style={{ padding:"7px 10px", color:"#475569" }}>{r.pop_millions}M</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize:9, color:"#475569", marginTop:12 }}>
                WA ranks #1 per capita despite CA dominating in absolute count — Pacific Northwest has proportionally the highest unexplained aerial activity in the NUFORC database
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EXTRACTED INTELLIGENCE ────────────────────────────────── */}
      <div style={{ marginTop:64 }}>
        {/* Section header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
          <div style={{ width:3, height:32, background:"linear-gradient(180deg,#06b6d4,#a855f7)", borderRadius:2 }} />
          <div>
            <div style={{ fontSize:11, color:CYAN, letterSpacing:"0.25em", fontWeight:700 }}>EXTRACTED INTELLIGENCE</div>
            <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>AI-extracted behavioral signals from 79,621 raw witness narratives — run locally, zero cost</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background: extLoading ? AMBER : GREEN, boxShadow:`0 0 8px ${extLoading ? AMBER : GREEN}` }} />
            <span style={{ fontSize:9, color: extLoading ? AMBER : GREEN, letterSpacing:"0.15em" }}>{extLoading ? "LOADING..." : "PIPELINE COMPLETE"}</span>
          </div>
        </div>

        <div style={{ height:1, background:"linear-gradient(90deg,rgba(6,182,212,0.4),rgba(168,85,247,0.4),transparent)", marginBottom:32 }} />

        {!extLoading && extStats && (
          <>
            {/* ── Extracted stats row ── */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginBottom:40 }}>
              {[
                { value: extStats.silent_reports.toLocaleString(), pct: `${extStats.silent_pct}%`, label: "Silent Objects", sub: "No acoustic signature detected", color: CYAN },
                { value: extStats.instant_accel_reports.toLocaleString(), pct: null, label: "Instant Acceleration", sub: "Hypersonic speed changes", color: RED },
                { value: extStats.military_context.toLocaleString(), pct: `${extStats.military_pct}%`, label: "Military Context", sub: "Near bases, radar, pilots", color: AMBER },
                { value: extStats.trans_medium.toLocaleString(), pct: null, label: "Trans-Medium", sub: "Air → water transitions", color: PURPLE },
                { value: extStats.top_anomaly_combo.toLocaleString(), pct: null, label: "Top Anomaly Combo", sub: "Silent + instant accel", color: GREEN },
                { value: extStats.physics_violations.toLocaleString(), pct: `${extStats.physics_violation_pct}%`, label: "Physics Violations", sub: "Explicitly defied physics", color: RED },
              ].map(s => (
                <div key={s.label} style={{
                  flex:"1 1 160px", background:"rgba(10,22,40,0.7)",
                  border:`1px solid ${s.color}25`, borderRadius:10,
                  padding:"16px 20px", position:"relative", overflow:"hidden",
                }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${s.color}60,transparent)` }} />
                  <div style={{ fontSize:28, fontWeight:900, color:s.color, lineHeight:1, textShadow:`0 0 20px ${s.color}60` }}>
                    {s.value}
                    {s.pct && <span style={{ fontSize:13, marginLeft:4, opacity:0.7 }}>{s.pct}</span>}
                  </div>
                  <div style={{ fontSize:11, color:"#e2e8f0", fontWeight:600, marginTop:8 }}>{s.label}</div>
                  <div style={{ fontSize:9, color:"#475569", marginTop:2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* ── Sound + Movement charts ── */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
              {/* Sound */}
              <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(6,182,212,0.12)", borderRadius:12, padding:"20px 16px 12px" }}>
                <div style={{ fontSize:10, color:CYAN, letterSpacing:"0.2em", marginBottom:16 }}>ACOUSTIC SIGNATURE</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={extSound} layout="vertical" margin={{ left:8, right:20, top:0, bottom:0 }}>
                    <XAxis type="number" tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)} />
                    <YAxis type="category" dataKey="sound" tick={{ fontSize:10, fill:"#94a3b8" }} tickLine={false} axisLine={false} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Reports" radius={[0,4,4,0]}>
                      {extSound.map((entry, i) => (
                        <Cell key={i} fill={["#06b6d4","#ef4444","#f59e0b","#a855f7"][i % 4]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Movement */}
              <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(6,182,212,0.12)", borderRadius:12, padding:"20px 16px 12px" }}>
                <div style={{ fontSize:10, color:CYAN, letterSpacing:"0.2em", marginBottom:16 }}>MOVEMENT PATTERNS</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={extMovement} layout="vertical" margin={{ left:8, right:20, top:0, bottom:0 }}>
                    <XAxis type="number" tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)} />
                    <YAxis type="category" dataKey="movement" tick={{ fontSize:9, fill:"#94a3b8" }} tickLine={false} axisLine={false} width={110} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Reports" radius={[0,4,4,0]}>
                      {extMovement.map((entry, i) => (
                        <Cell key={i} fill={[GREEN, CYAN, AMBER, RED, PURPLE, PINK][i % 6]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Anomaly behaviors + Credibility signals ── */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
              {/* Anomaly behaviors */}
              <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:12, padding:"20px 16px 12px" }}>
                <div style={{ fontSize:10, color:RED, letterSpacing:"0.2em", marginBottom:16 }}>ANOMALOUS BEHAVIORS</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={extAnomalies} layout="vertical" margin={{ left:8, right:20, top:0, bottom:0 }}>
                    <XAxis type="number" tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)} />
                    <YAxis type="category" dataKey="behavior" tick={{ fontSize:9, fill:"#94a3b8" }} tickLine={false} axisLine={false} width={110} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Reports" radius={[0,4,4,0]}>
                      {extAnomalies.map((_, i) => (
                        <Cell key={i} fill={[RED, AMBER, PURPLE, CYAN, GREEN][i % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Credibility signals */}
              <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(0,255,136,0.12)", borderRadius:12, padding:"20px 16px 12px" }}>
                <div style={{ fontSize:10, color:GREEN, letterSpacing:"0.2em", marginBottom:16 }}>CREDIBILITY SIGNALS</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={extCred} layout="vertical" margin={{ left:8, right:20, top:0, bottom:0 }}>
                    <XAxis type="number" tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)} />
                    <YAxis type="category" dataKey="signal" tick={{ fontSize:9, fill:"#94a3b8" }} tickLine={false} axisLine={false} width={110} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Reports" radius={[0,4,4,0]}>
                      {extCred.map((_, i) => (
                        <Cell key={i} fill={[GREEN, CYAN, AMBER, PURPLE, RED][i % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Military context + Physics violations over time ── */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
              {/* Military by year */}
              <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(245,158,11,0.15)", borderRadius:12, padding:"20px 16px 12px" }}>
                <div style={{ fontSize:10, color:AMBER, letterSpacing:"0.2em", marginBottom:16 }}>MILITARY CONTEXT BY YEAR</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={milByYear} margin={{ left:0, right:0, top:4, bottom:0 }}>
                    <defs>
                      <linearGradient id="milGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={AMBER} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.07)" />
                    <XAxis dataKey="year" tick={{ fontSize:9, fill:"#64748b" }} tickLine={false} axisLine={false} interval={9} />
                    <YAxis tick={{ fontSize:9, fill:"#64748b" }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" name="Reports" stroke={AMBER} strokeWidth={2} fill="url(#milGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Physics violations + top anomaly combo by year */}
              <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:12, padding:"20px 16px 12px" }}>
                <div style={{ fontSize:10, color:RED, letterSpacing:"0.2em", marginBottom:16 }}>PHYSICS VIOLATIONS OVER TIME</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart margin={{ left:0, right:0, top:4, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.07)" />
                    <XAxis dataKey="year" type="number" domain={["auto","auto"]} tick={{ fontSize:9, fill:"#64748b" }} tickLine={false} axisLine={false} interval={9} />
                    <YAxis tick={{ fontSize:9, fill:"#64748b" }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line data={physByYear} type="monotone" dataKey="count" name="Physics violations" stroke={RED} strokeWidth={2} dot={false} />
                    <Line data={topAnomalyYR} type="monotone" dataKey="count" name="Silent+instant accel" stroke={GREEN} strokeWidth={2} dot={false} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display:"flex", gap:16, marginTop:8, paddingLeft:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:9, color:"#64748b" }}>
                    <div style={{ width:16, height:2, background:RED }} /> Physics violations
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:9, color:"#64748b" }}>
                    <div style={{ width:16, height:2, background:GREEN, borderTop:"2px dashed "+GREEN }} /> Silent + instant accel
                  </div>
                </div>
              </div>
            </div>

            {/* ── Top anomaly cases table ── */}
            <div style={{ background:"rgba(10,22,40,0.6)", border:"1px solid rgba(6,182,212,0.15)", borderRadius:12, overflow:"hidden" }}>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(6,182,212,0.1)", display:"flex", alignItems:"center", gap:10 }}>
                <AlertTriangle style={{ width:14, height:14, color:RED }} />
                <span style={{ fontSize:10, color:CYAN, letterSpacing:"0.2em" }}>TOP ANOMALY CASES</span>
                <span style={{ fontSize:9, color:"#475569", marginLeft:4 }}>Silent + instant acceleration — most unexplained behavior combination</span>
                <span style={{ marginLeft:"auto", fontSize:9, color:RED, letterSpacing:"0.1em" }}>{topCases.length} CASES</span>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(6,182,212,0.1)" }}>
                      {["YEAR","LOCATION","SHAPE","ANOMALIES","SCORE","NARRATIVE"].map(h => (
                        <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:9, color:"#475569", letterSpacing:"0.15em", fontWeight:600, whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topCases.slice(0, 20).map((c, i) => (
                      <tr key={c.id} style={{ borderBottom:"1px solid rgba(6,182,212,0.06)", background: i % 2 === 0 ? "transparent" : "rgba(6,182,212,0.02)" }}>
                        <td style={{ padding:"10px 16px", color:CYAN, fontWeight:700, whiteSpace:"nowrap" }}>{c.year}</td>
                        <td style={{ padding:"10px 16px", color:"#94a3b8", whiteSpace:"nowrap" }}>
                          {c.city ? `${c.city}, ` : ""}{c.state?.toUpperCase() || c.country?.toUpperCase() || "—"}
                        </td>
                        <td style={{ padding:"10px 16px", whiteSpace:"nowrap" }}>
                          <span style={{ padding:"2px 8px", borderRadius:4, background:"rgba(6,182,212,0.1)", color:CYAN, fontSize:9 }}>
                            {c.extracted_shape || "—"}
                          </span>
                        </td>
                        <td style={{ padding:"10px 16px" }}>
                          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                            {(c.anomaly_behaviors || []).map(b => (
                              <span key={b} style={{ padding:"1px 6px", borderRadius:3, background:"rgba(239,68,68,0.12)", color:RED, fontSize:8, letterSpacing:"0.05em" }}>{b.replace(/_/g," ")}</span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding:"10px 16px", whiteSpace:"nowrap" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ width:48, height:4, background:"rgba(255,255,255,0.1)", borderRadius:2, overflow:"hidden" }}>
                              <div style={{ width:`${c.credibility_score}%`, height:"100%", background: c.credibility_score >= 70 ? GREEN : c.credibility_score >= 50 ? AMBER : CYAN, borderRadius:2 }} />
                            </div>
                            <span style={{ color:AMBER, fontSize:10 }}>{c.credibility_score}</span>
                          </div>
                        </td>
                        <td style={{ padding:"10px 16px", maxWidth:320, color:"#64748b", fontSize:10, lineHeight:1.4 }}>
                          {c.comment_preview?.slice(0, 120)}{c.comment_preview?.length > 120 ? "…" : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function LegendDot({ item }: { item: { color: string; label: string } }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:"#64748b" }}>
      <div style={{ width:10, height:10, borderRadius:2, background:item.color }} />
      {item.label}
    </div>
  )
}
