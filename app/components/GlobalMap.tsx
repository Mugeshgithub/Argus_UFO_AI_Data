"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import "leaflet/dist/leaflet.css"
import { HOTSPOTS, INCIDENTS, type Incident } from "@/lib/data"
import { X, Video, AlertCircle } from "lucide-react"

type MapPoint = {
  lat: number; lng: number; year: number; shape_clean: string
  city: string; state: string | null; country: string | null; duration_seconds: number
}

type HoverData =
  | { kind: "point";   x: number; y: number; shape: string; color: string; loc: string; year: number; dur: string }
  | { kind: "hotspot"; x: number; y: number; name: string; intensity: number; dotColor: string; incidentTitle?: string; hasVideo?: boolean }

const SHAPES = [
  { key: "Light",     color: "#06b6d4" },
  { key: "Circle",    color: "#00ff88" },
  { key: "Triangle",  color: "#ef4444" },
  { key: "Fireball",  color: "#f59e0b" },
  { key: "Disk",      color: "#ec4899" },
  { key: "Sphere",    color: "#a855f7" },
  { key: "Cigar",     color: "#f97316" },
  { key: "Unknown",   color: "#8899cc" },
  { key: "Oval",      color: "#3b82f6" },
  { key: "Formation", color: "#14b8a6" },
]
const SHAPE_COLOR: Record<string, string> = Object.fromEntries(SHAPES.map(s => [s.key, s.color]))

function fmtDur(sec: number | null): string {
  if (!sec || sec <= 0) return "?"
  if (sec < 60)   return `${Math.round(sec)}s`
  if (sec < 3600) return `${Math.round(sec / 60)}m`
  return `${(sec / 3600).toFixed(1)}h`
}

function ptRadius(sec: number | null): number {
  if (!sec || sec <= 0) return 3
  return Math.max(2.5, Math.min(2 + Math.log10(sec + 1) * 0.9, 8))
}

const INTENSITY_LABEL = ["", "LOW", "LOW", "MEDIUM", "HIGH", "CRITICAL"]

export default function GlobalMap() {
  const mapRef         = useRef<HTMLDivElement>(null)
  const mapInstance    = useRef<unknown>(null)
  const shapeLayersRef = useRef<Map<string, unknown>>(new Map())

  const [selected,     setSelected]     = useState<Incident | null>(null)
  const [videoReady,   setVideoReady]   = useState(false)
  const [totalPoints,  setTotalPoints]  = useState(0)
  const [shapeCounts,  setShapeCounts]  = useState<Record<string, number>>({})
  const [activeShapes, setActiveShapes] = useState<Set<string>>(new Set(SHAPES.map(s => s.key)))
  const [hover,        setHover]        = useState<HoverData | null>(null)

  const selectedRef     = useRef<((inc: Incident | null) => void) | null>(null)
  const activeShapesRef = useRef<Set<string>>(new Set(SHAPES.map(s => s.key)))
  // Stable ref so Leaflet callbacks always see latest setter
  const setHoverRef     = useRef(setHover)
  useEffect(() => { setHoverRef.current = setHover }, [])

  const handleSelect = useCallback((inc: Incident | null) => {
    setSelected(inc); setVideoReady(false)
  }, [])
  useEffect(() => { selectedRef.current = handleSelect }, [handleSelect])

  useEffect(() => {
    if (typeof window === "undefined" || mapInstance.current) return

    import("leaflet").then(L => {
      if (!mapRef.current || mapInstance.current) return

      const map = L.map(mapRef.current, {
        center: [25, 0], zoom: 2,
        zoomControl: true, attributionControl: false, scrollWheelZoom: false,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map)

      // helper — mouse position relative to map container
      function relPos(e: MouseEvent) {
        const rect = mapRef.current?.getBoundingClientRect()
        if (!rect) return { x: 0, y: 0 }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top }
      }

      // ── 8,000 NUFORC sighting points ─────────────────────────────────
      fetch("/data/nuforc_map_points.json")
        .then(r => r.json())
        .then((pts: MapPoint[]) => {
          setTotalPoints(pts.length)

          const counts: Record<string, number> = {}
          pts.forEach(pt => { counts[pt.shape_clean] = (counts[pt.shape_clean] || 0) + 1 })
          setShapeCounts(counts)

          const layers = new Map<string, ReturnType<typeof L.layerGroup>>()
          SHAPES.forEach(s => layers.set(s.key, L.layerGroup()))

          pts.forEach(pt => {
            const rawShape = pt.shape_clean || "Unknown"
            const shape    = layers.has(rawShape) ? rawShape : "Unknown"
            const color    = SHAPE_COLOR[shape] || "#8899cc"
            const r        = ptRadius(pt.duration_seconds)
            const loc      = [pt.city, pt.state || pt.country].filter(Boolean).join(", ")
            const dur      = fmtDur(pt.duration_seconds)

            const marker = L.circleMarker([pt.lat, pt.lng], {
              radius: r,
              fillColor: color,
              fillOpacity: 0.75,
              color: "rgba(255,255,255,0.1)",
              weight: 0.5,
              interactive: true,
            })

            marker.on("mouseover", (e) => {
              const { x, y } = relPos(e.originalEvent)
              setHoverRef.current({ kind:"point", x, y, shape: rawShape, color, loc: loc || "Unknown location", year: pt.year, dur })
            })
            marker.on("mousemove", (e) => {
              const { x, y } = relPos(e.originalEvent)
              setHoverRef.current(prev => prev?.kind === "point" ? { ...prev, x, y } : prev)
            })
            marker.on("mouseout", () => setHoverRef.current(null))

            layers.get(shape)!.addLayer(marker)
          })

          shapeLayersRef.current = layers as Map<string, unknown>
          layers.forEach((lg, shape) => {
            if (activeShapesRef.current.has(shape)) map.addLayer(lg)
          })
        })
        .catch(() => {})

      // ── Verified incident hotspot markers ───────────────────────────
      HOTSPOTS.forEach(spot => {
        const size = 8 + spot.intensity * 3
        const pulseSize = size * 3
        const incident  = INCIDENTS.find(i =>
          Math.abs(i.lat - spot.lat) < 0.5 && Math.abs(i.lng - spot.lng) < 0.5
        )
        const hasVideo = !!(incident?.videoId)
        const dotColor = spot.intensity >= 5 ? "#ef4444" : spot.intensity >= 4 ? "#06b6d4" : "#f59e0b"

        const icon = L.divIcon({
          className: "",
          html: `
            <div style="position:relative;width:${pulseSize}px;height:${pulseSize}px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
              <div style="position:absolute;width:${pulseSize}px;height:${pulseSize}px;border-radius:50%;background:${dotColor}22;border:1px solid ${dotColor}66;animation:pulse-ring ${1.5 + spot.intensity * 0.3}s ease-out infinite;"></div>
              <div style="width:${size}px;height:${size}px;border-radius:50%;background:${dotColor};box-shadow:0 0 ${size * 2}px ${dotColor};position:relative;z-index:1;"></div>
              ${hasVideo ? `<div style="position:absolute;bottom:-2px;right:-2px;width:10px;height:10px;border-radius:50%;background:#00ff88;border:1.5px solid #020817;box-shadow:0 0 6px #00ff88;z-index:2;"></div>` : ""}
            </div>`,
          iconSize: [pulseSize, pulseSize],
          iconAnchor: [pulseSize / 2, pulseSize / 2],
        })

        const marker = L.marker([spot.lat, spot.lng], { icon })
        marker.on("click",     () => selectedRef.current?.(incident ?? null))
        marker.on("mouseover", (e) => {
          const { x, y } = relPos(e.originalEvent)
          setHoverRef.current({ kind:"hotspot", x, y, name: spot.name, intensity: spot.intensity, dotColor, incidentTitle: incident?.title, hasVideo })
        })
        marker.on("mousemove", (e) => {
          const { x, y } = relPos(e.originalEvent)
          setHoverRef.current(prev => prev?.kind === "hotspot" ? { ...prev, x, y } : prev)
        })
        marker.on("mouseout", () => setHoverRef.current(null))
        marker.addTo(map)
      })

      map.on("click", (e) => {
        const target = e.originalEvent?.target as HTMLElement
        if (target?.closest(".leaflet-marker-icon")) return
        selectedRef.current?.(null)
      })

      mapInstance.current = map
    })

    return () => {
      if (mapInstance.current) {
        ;(mapInstance.current as { remove: () => void }).remove()
        mapInstance.current = null
      }
    }
  }, [])

  function toggleShape(key: string) {
    setActiveShapes(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      activeShapesRef.current = next

      const map = mapInstance.current as { addLayer: (l: unknown) => void; removeLayer: (l: unknown) => void } | null
      if (map) {
        const lg = shapeLayersRef.current.get(key)
        if (lg) {
          if (next.has(key)) map.addLayer(lg)
          else map.removeLayer(lg)
        }
      }
      return next
    })
  }

  function selectAll()  { SHAPES.forEach(s => { if (!activeShapes.has(s.key)) toggleShape(s.key) }) }
  function selectNone() { SHAPES.forEach(s => { if (activeShapes.has(s.key))  toggleShape(s.key) }) }

  const visibleCount = Object.entries(shapeCounts)
    .filter(([s]) => activeShapes.has(s))
    .reduce((acc, [, c]) => acc + c, 0)

  const topShape = Object.entries(shapeCounts)
    .filter(([s]) => activeShapes.has(s))
    .sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—"

  const videoCount = INCIDENTS.filter(i => i.videoId).length

  // Clamp tooltip so it doesn't overflow the right/bottom edge
  function tooltipStyle(x: number, y: number): React.CSSProperties {
    const W = mapRef.current?.clientWidth  ?? 1200
    const H = mapRef.current?.clientHeight ?? 700
    const TW = 210, TH = 110
    return {
      position:   "absolute",
      left:       Math.min(x + 14, W - TW - 8),
      top:        y - TH < 60 ? y + 14 : y - TH - 8,
      zIndex:     3000,
      pointerEvents: "none",
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>

      {/* ── Top toolbar ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 16px 6px", borderBottom:"1px solid rgba(6,182,212,0.12)", flexShrink:0, flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ fontSize:10, color:"#64748b", letterSpacing:"0.15em" }}>GLOBAL ANOMALY MAP · FULL VIEW</span>
          <span className="tag border border-cyan-500/30 text-cyan-400 bg-cyan-500/10">{HOTSPOTS.length} VERIFIED INCIDENTS</span>
          {totalPoints > 0 && (
            <span style={{ fontSize:9, letterSpacing:"0.1em", padding:"2px 10px", borderRadius:4, border:"1px solid rgba(6,182,212,0.3)", background:"rgba(6,182,212,0.08)", color:"#06b6d4" }}>
              {visibleCount.toLocaleString()} NUFORC REPORTS ●
            </span>
          )}
          <span className="tag border border-green-500/30 text-green-400 bg-green-500/10">▶ {videoCount} VIDEOS</span>
        </div>
        <span style={{ fontSize:8, color:"#334155", border:"1px solid rgba(71,85,105,0.2)", borderRadius:4, padding:"3px 8px", letterSpacing:"0.1em" }}>
          hover any dot · click pulsing marker
        </span>
      </div>

      {/* ── Shape filter bar ── */}
      <div style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 16px", borderBottom:"1px solid rgba(6,182,212,0.07)", flexShrink:0, flexWrap:"wrap", background:"rgba(2,8,23,0.6)" }}>
        <span style={{ fontSize:8, color:"#334155", letterSpacing:"0.2em", marginRight:2, flexShrink:0 }}>SHAPE:</span>
        {SHAPES.map(({ key, color }) => {
          const on    = activeShapes.has(key)
          const count = shapeCounts[key] || 0
          return (
            <button key={key} onClick={() => toggleShape(key)} title={`${count.toLocaleString()} reports`}
              style={{ display:"flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:4, cursor:"pointer",
                border:`1px solid ${on ? color + "55" : "rgba(71,85,105,0.25)"}`,
                background: on ? `${color}10` : "transparent",
                opacity: on ? 1 : 0.38, transition:"all 0.12s", flexShrink:0 }}
            >
              <div style={{ width:6, height:6, borderRadius:"50%", background: on ? color : "#475569", flexShrink:0 }} />
              <span style={{ fontSize:9, color: on ? color : "#475569", letterSpacing:"0.04em" }}>{key}</span>
              <span style={{ fontSize:8, color:"#334155" }}>{count > 0 ? count.toLocaleString() : ""}</span>
            </button>
          )
        })}
        <button onClick={selectAll}  style={{ fontSize:8, color:"#06b6d4", background:"none", border:"none", cursor:"pointer", padding:"2px 6px", letterSpacing:"0.1em", marginLeft:4 }}>ALL</button>
        <button onClick={selectNone} style={{ fontSize:8, color:"#475569", background:"none", border:"none", cursor:"pointer", padding:"2px 6px", letterSpacing:"0.1em" }}>NONE</button>
      </div>

      {/* ── Map ── */}
      <div ref={mapRef} style={{ flex: 1, minHeight: 0 }} />

      {/* ── Hover tooltip ── */}
      {hover && (
        <div style={tooltipStyle(hover.x, hover.y)}>
          {hover.kind === "point" ? (
            <div style={{ background:"rgba(6,12,28,0.97)", border:`1px solid ${hover.color}55`, borderRadius:8, padding:"10px 14px", minWidth:200, boxShadow:`0 4px 24px rgba(0,0,0,0.6), 0 0 12px ${hover.color}22` }}>
              {/* shape badge */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:hover.color, boxShadow:`0 0 8px ${hover.color}`, flexShrink:0 }} />
                <span style={{ fontSize:11, fontWeight:700, color:hover.color, letterSpacing:"0.12em", fontFamily:"monospace" }}>{hover.shape.toUpperCase()}</span>
              </div>
              {/* location */}
              <div style={{ fontSize:11, color:"#cbd5e1", marginBottom:6, lineHeight:1.4 }}>{hover.loc}</div>
              {/* meta row */}
              <div style={{ display:"flex", gap:16, borderTop:`1px solid ${hover.color}20`, paddingTop:7 }}>
                <div>
                  <div style={{ fontSize:8, color:"#475569", letterSpacing:"0.15em" }}>YEAR</div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0", fontFamily:"monospace" }}>{hover.year || "?"}</div>
                </div>
                <div>
                  <div style={{ fontSize:8, color:"#475569", letterSpacing:"0.15em" }}>DURATION</div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0", fontFamily:"monospace" }}>{hover.dur}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background:"rgba(6,12,28,0.97)", border:`1px solid ${hover.dotColor}66`, borderRadius:8, padding:"10px 14px", minWidth:220, boxShadow:`0 4px 24px rgba(0,0,0,0.6), 0 0 16px ${hover.dotColor}33` }}>
              {/* intensity badge */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:hover.dotColor, boxShadow:`0 0 10px ${hover.dotColor}`, flexShrink:0 }} />
                <span style={{ fontSize:9, fontWeight:700, color:hover.dotColor, letterSpacing:"0.2em" }}>
                  {INTENSITY_LABEL[hover.intensity] ?? "HIGH"} PRIORITY
                </span>
                {hover.hasVideo && (
                  <span style={{ fontSize:8, color:"#00ff88", background:"rgba(0,255,136,0.1)", border:"1px solid rgba(0,255,136,0.3)", borderRadius:3, padding:"1px 6px", marginLeft:"auto" }}>▶ VIDEO</span>
                )}
              </div>
              {/* name */}
              <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0", marginBottom:4, lineHeight:1.3 }}>{hover.name}</div>
              {/* incident title */}
              {hover.incidentTitle && (
                <div style={{ fontSize:10, color:"#64748b", lineHeight:1.4, marginBottom:6 }}>{hover.incidentTitle}</div>
              )}
              <div style={{ fontSize:8, color:hover.dotColor, letterSpacing:"0.15em", marginTop:4, opacity:0.8 }}>
                CLICK FOR FULL INCIDENT REPORT
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Stats bar ── */}
      {totalPoints > 0 && (
        <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(2,8,23,0.88)", borderTop:"1px solid rgba(6,182,212,0.1)", padding:"5px 16px", display:"flex", alignItems:"center", gap:20, zIndex:500, backdropFilter:"blur(10px)", flexWrap:"wrap" }}>
          <StatChip label="SHOWING"   value={visibleCount.toLocaleString()} color="#06b6d4" />
          <StatChip label="TOP SHAPE" value={topShape}                       color="#00ff88" />
          <StatChip label="VERIFIED"  value={String(HOTSPOTS.length)}        color="#ef4444" />
          <StatChip label="DATA SPAN" value="1941–2014"                      color="#f59e0b" />
          <StatChip label="COVERAGE"  value="40 Countries"                   color="#a78bfa" />
          <span style={{ fontSize:8, color:"#1e293b", marginLeft:"auto", letterSpacing:"0.1em" }}>
            DOT SIZE = SIGHTING DURATION · COLOR = SHAPE TYPE
          </span>
        </div>
      )}

      {/* ── Incident detail panel ── */}
      {selected && (
        <div style={{ position:"absolute", top:88, right:0, bottom:0, width:400, zIndex:1000,
          display:"flex", flexDirection:"column", background:"rgba(10,22,40,0.97)",
          borderLeft:"1px solid rgba(6,182,212,0.3)", backdropFilter:"blur(16px)",
          boxShadow:"-8px 0 32px rgba(6,182,212,0.15)" }}>

          <div className="flex items-start justify-between p-4 border-b border-cyan-500/20">
            <div className="flex-1 pr-3">
              <div className="text-[10px] text-cyan-500/70 tracking-widest mb-1">{selected.id} · {selected.date}</div>
              <div className="text-sm font-bold text-slate-100 leading-snug">{selected.title}</div>
              <div className="text-[10px] text-slate-500 mt-1">{selected.location}</div>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {selected.videoId ? (
              <div className="border-b border-cyan-500/15">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500/5">
                  <Video className="w-3.5 h-3.5 text-green-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-green-400 font-bold tracking-wider">DECLASSIFIED FOOTAGE</div>
                    <div className="text-[10px] text-slate-500 truncate">{selected.videoTitle}</div>
                  </div>
                </div>
                <div style={{ position:"relative", paddingBottom:"56.25%", background:"#000" }}>
                  {!videoReady && (
                    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"#020817", cursor:"pointer", zIndex:1 }}
                      onClick={() => setVideoReady(true)}>
                      <div className="text-center">
                        <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(6,182,212,0.15)", border:"2px solid rgba(6,182,212,0.5)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                          <div style={{ width:0, height:0, borderTop:"10px solid transparent", borderBottom:"10px solid transparent", borderLeft:"16px solid #06b6d4", marginLeft:4 }} />
                        </div>
                        <div className="text-[10px] text-cyan-400 tracking-wider">PLAY FOOTAGE</div>
                        <div className="text-[9px] text-slate-600 mt-1">{selected.videoSource}</div>
                      </div>
                    </div>
                  )}
                  {videoReady && (
                    <iframe style={{ position:"absolute", inset:0, width:"100%", height:"100%", border:"none" }}
                      src={`https://www.youtube.com/embed/${selected.videoId}?autoplay=1&rel=0&modestbranding=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen />
                  )}
                </div>
                <div className="px-4 py-2 text-[9px] text-slate-600">{selected.videoSource}</div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 m-4 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="text-[10px] text-slate-500">No declassified video for this incident. Documentation on file.</div>
              </div>
            )}

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <StatCell label="CREDIBILITY" value={`${selected.credibility}%`} highlight />
                <StatCell label="WITNESSES"   value={selected.witnesses > 999 ? `${(selected.witnesses/1000).toFixed(0)}k+` : String(selected.witnesses)} />
                <StatCell label="DURATION"    value={selected.duration} />
                <StatCell label="SHAPE"       value={selected.shape} />
                <StatCell label="COUNTRY"     value={selected.country} />
                <StatCell label="SOURCE"      value={selected.source.split(" / ")[0]} />
              </div>

              <div>
                <div className="flex justify-between text-[9px] text-slate-600 mb-1">
                  <span>CREDIBILITY SCORE</span><span>{selected.credibility}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width:`${selected.credibility}%`,
                    background: selected.credibility >= 90 ? "#00ff88" : selected.credibility >= 75 ? "#06b6d4" : "#f59e0b",
                    boxShadow:`0 0 8px ${selected.credibility >= 90 ? "#00ff88" : "#06b6d4"}`,
                  }} />
                </div>
              </div>

              <div>
                <div className="text-[9px] text-slate-600 tracking-wider mb-2">INCIDENT SUMMARY</div>
                <p className="text-xs text-slate-300 leading-relaxed">{selected.description}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {selected.military        && <span className="tag border border-cyan-500/30 text-cyan-400 bg-cyan-500/10">MILITARY</span>}
                {selected.radarConfirmed  && <span className="tag border border-green-500/30 text-green-400 bg-green-500/10">RADAR CONFIRMED</span>}
                {selected.tags.map(t => <span key={t} className="tag border border-slate-700 text-slate-500">{t}</span>)}
              </div>

              <div className="text-[9px] text-slate-600 pb-2">Source: {selected.source}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
      <span style={{ fontSize:8, color:"#334155", letterSpacing:"0.15em" }}>{label}</span>
      <span style={{ fontSize:10, fontWeight:700, color, fontFamily:"monospace" }}>{value}</span>
    </div>
  )
}

function StatCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-navy/60 rounded-lg p-2">
      <div className="text-[9px] text-slate-600 tracking-wider mb-0.5">{label}</div>
      <div className={`text-[11px] font-bold ${highlight ? "text-cyan-400" : "text-slate-300"}`}>{value}</div>
    </div>
  )
}
