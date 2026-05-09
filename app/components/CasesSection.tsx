"use client"
import { useState } from "react"
import Link from "next/link"
import { Search, Shield, Radio, Video, ChevronDown, ChevronUp } from "lucide-react"
import { INCIDENTS, type Incident } from "@/lib/data"

const SHAPES = ["All", "Elongated Oval", "Rotating Disc", "Glowing Disc", "V-Shaped Formation", "Massive Walnut-Shaped", "Dark Disc", "Triangular Craft", "Spherical", "Cylindrical", "Metallic Fragments", "Various"]
const CLASSES = ["All", "Unexplained", "Radar Anomaly", "Atmospheric / Unknown Material", "Official Government Report"]

const SHAPE_ICONS: Record<string, string> = {
  "Elongated Oval":      "⬮",
  "Rotating Disc":       "◎",
  "Glowing Disc":        "◉",
  "V-Shaped Formation":  "⋀",
  "Massive Walnut-Shaped":"⬟",
  "Dark Disc":           "●",
  "Triangular Craft":    "△",
  "Spherical":           "○",
  "Cylindrical":         "⬜",
  "Metallic Fragments":  "✦",
  "Various":             "∾",
  "Large Solid Object":  "■",
}

// Star credibility ratings and classification badges per incident ID
const STAR_DATA: Record<string, { stars: number; badge: string; badgeColor: string }> = {
  "INC-001":  { stars: 5, badge: "UNEXPLAINED",    badgeColor: "#ef4444" },
  "INC-002":  { stars: 5, badge: "UNEXPLAINED",    badgeColor: "#ef4444" },
  "INC-002B": { stars: 4, badge: "UNEXPLAINED",    badgeColor: "#ef4444" },
  "INC-003":  { stars: 4, badge: "UNEXPLAINED",    badgeColor: "#ef4444" },
  "INC-004":  { stars: 4, badge: "UNEXPLAINED",    badgeColor: "#ef4444" },
  "INC-005":  { stars: 4, badge: "UNEXPLAINED",    badgeColor: "#ef4444" },
  "INC-006":  { stars: 4, badge: "UNEXPLAINED",    badgeColor: "#ef4444" },
  "INC-007":  { stars: 3, badge: "UNDER REVIEW",   badgeColor: "#f59e0b" },
  "INC-008":  { stars: 4, badge: "UNEXPLAINED",    badgeColor: "#ef4444" },
  "INC-009":  { stars: 3, badge: "UNDER REVIEW",   badgeColor: "#f59e0b" },
  "INC-010":  { stars: 3, badge: "POSSIBLE DRONE", badgeColor: "#64748b" },
  "INC-011":  { stars: 2, badge: "POSSIBLE DRONE", badgeColor: "#64748b" },
  "INC-012":  { stars: 5, badge: "UNEXPLAINED",    badgeColor: "#ef4444" },
}

function Stars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <span style={{ letterSpacing: "0.05em", fontSize: 13 }}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          style={{ color: i < count ? "#f59e0b" : "rgba(100,116,139,0.35)" }}
        >
          {i < count ? "★" : "☆"}
        </span>
      ))}
    </span>
  )
}

function ClassBadge({ badge, color }: { badge: string; color: string }) {
  return (
    <span
      style={{
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: "0.14em",
        color,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        padding: "2px 7px",
        borderRadius: 3,
      }}
    >
      {badge}
    </span>
  )
}

function CredBar({ value }: { value: number }) {
  const color = value >= 90 ? "#00ff88" : value >= 75 ? "#06b6d4" : "#f59e0b"
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 9 }}>
        <span style={{ color: "#64748b" }}>CREDIBILITY</span>
        <span style={{ color, fontWeight: 700 }}>{value}%</span>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${value}%`,
          background: color, boxShadow: `0 0 6px ${color}`,
          borderRadius: 2, transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  )
}

function CaseCard({ inc }: { inc: Incident }) {
  const [expanded, setExpanded] = useState(false)
  const shapeIcon = SHAPE_ICONS[inc.shape] || "?"
  const starInfo = STAR_DATA[inc.id] || { stars: 3, badge: "UNDER REVIEW", badgeColor: "#f59e0b" }

  return (
    <div
      style={{
        background: expanded ? "rgba(10,22,40,0.9)" : "rgba(10,22,40,0.6)",
        border: `1px solid ${expanded ? "rgba(6,182,212,0.35)" : "rgba(6,182,212,0.12)"}`,
        borderRadius: 12,
        overflow: "hidden",
        transition: "all 0.25s",
      }}
      onMouseEnter={e => {
        if (!expanded) (e.currentTarget as HTMLElement).style.borderColor = "rgba(6,182,212,0.28)"
      }}
      onMouseLeave={e => {
        if (!expanded) (e.currentTarget as HTMLElement).style.borderColor = "rgba(6,182,212,0.12)"
      }}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          display: "block", width: "100%",
          padding: "18px 20px",
          background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          {/* Shape icon */}
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "rgba(6,182,212,0.08)",
            border: "1px solid rgba(6,182,212,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "#06b6d4", flexShrink: 0,
          }}>
            {shapeIcon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, color: "rgba(6,182,212,0.6)", letterSpacing: "0.2em", marginBottom: 3 }}>
              {inc.id} · {inc.date}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3 }}>
              {inc.title}
            </div>
          </div>
          <div style={{ color: "#64748b", flexShrink: 0, paddingTop: 2 }}>
            {expanded ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
          </div>
        </div>

        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 10 }}>{inc.location}</div>

        {/* Stars + Classification badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Stars count={starInfo.stars} />
          <ClassBadge badge={starInfo.badge} color={starInfo.badgeColor} />
        </div>

        {/* Tags row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {inc.military && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 8px", borderRadius: 3,
              border: "1px solid rgba(6,182,212,0.3)",
              background: "rgba(6,182,212,0.08)",
              fontSize: 8, color: "#06b6d4", letterSpacing: "0.12em",
            }}>
              <Shield style={{ width: 8, height: 8 }} /> MILITARY
            </span>
          )}
          {inc.radarConfirmed && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 8px", borderRadius: 3,
              border: "1px solid rgba(0,255,136,0.3)",
              background: "rgba(0,255,136,0.06)",
              fontSize: 8, color: "#00ff88", letterSpacing: "0.12em",
            }}>
              <Radio style={{ width: 8, height: 8 }} /> RADAR
            </span>
          )}
          {inc.videoId && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 8px", borderRadius: 3,
              border: "1px solid rgba(167,139,250,0.3)",
              background: "rgba(167,139,250,0.06)",
              fontSize: 8, color: "#a78bfa", letterSpacing: "0.12em",
            }}>
              <Video style={{ width: 8, height: 8 }} /> VIDEO
            </span>
          )}
          {inc.tags.slice(0, 2).map(t => (
            <span key={t} style={{
              padding: "2px 7px", borderRadius: 3,
              border: "1px solid rgba(100,116,139,0.2)",
              fontSize: 8, color: "#64748b",
            }}>
              {t}
            </span>
          ))}
        </div>

        <CredBar value={inc.credibility} />
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{
          borderTop: "1px solid rgba(6,182,212,0.12)",
          padding: "16px 20px",
          background: "rgba(6,182,212,0.02)",
        }}>
          <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, marginBottom: 16 }}>
            {inc.description}
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginBottom: 14,
          }}>
            {[
              { label: "SHAPE",     value: inc.shape },
              { label: "DURATION",  value: inc.duration },
              { label: "WITNESSES", value: inc.witnesses > 999 ? `${(inc.witnesses / 1000).toFixed(0)}k+` : String(inc.witnesses) },
              { label: "COUNTRY",   value: inc.country },
              { label: "CLASS",     value: inc.classification },
              { label: "SOURCE",    value: inc.source.split(" / ")[0] },
            ].map(cell => (
              <div key={cell.label} style={{
                background: "rgba(2,8,23,0.6)",
                borderRadius: 6, padding: "8px 10px",
              }}>
                <div style={{ fontSize: 8, color: "#64748b", letterSpacing: "0.15em", marginBottom: 3 }}>{cell.label}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{cell.value}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 9, color: "#64748b", marginBottom: 12 }}>Source: {inc.source}</div>

          <Link href={`/cases/${inc.id}`} style={{
            display: "block",
            marginTop: 4,
            padding: "7px 0",
            color: "#06b6d4",
            fontSize: 10,
            letterSpacing: "0.15em",
            borderTop: "1px solid rgba(6,182,212,0.15)",
            textDecoration: "none",
            fontWeight: 700,
          }}>
            VIEW FULL CASE →
          </Link>
        </div>
      )}
    </div>
  )
}

// ------ Table view ------
type SortKey = "title" | "date" | "credibility" | "stars"
type SortDir = "asc" | "desc"

function TableView({ incidents }: { incidents: Incident[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("credibility")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(k); setSortDir("desc") }
  }

  const sorted = [...incidents].sort((a, b) => {
    let va: string | number = 0
    let vb: string | number = 0
    if (sortKey === "title")       { va = a.title; vb = b.title }
    else if (sortKey === "date")   { va = a.date;  vb = b.date  }
    else if (sortKey === "credibility") { va = a.credibility; vb = b.credibility }
    else if (sortKey === "stars")  {
      va = (STAR_DATA[a.id]?.stars ?? 3)
      vb = (STAR_DATA[b.id]?.stars ?? 3)
    }
    if (va < vb) return sortDir === "asc" ? -1 : 1
    if (va > vb) return sortDir === "asc" ? 1 : -1
    return 0
  })

  function SortBtn({ k, label }: { k: SortKey; label: string }) {
    const active = sortKey === k
    return (
      <button
        onClick={() => toggleSort(k)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: active ? "#06b6d4" : "#64748b",
          fontSize: 9,
          letterSpacing: "0.18em",
          fontWeight: active ? 700 : 400,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: 0,
          fontFamily: "inherit",
        }}
      >
        {label}
        {active && (
          <span style={{ fontSize: 8 }}>
            {sortDir === "asc" ? "▲" : "▼"}
          </span>
        )}
      </button>
    )
  }

  const thStyle: React.CSSProperties = {
    padding: "10px 14px",
    fontSize: 9,
    color: "#475569",
    letterSpacing: "0.18em",
    borderBottom: "1px solid rgba(6,182,212,0.12)",
    textAlign: "left",
    fontWeight: 600,
    background: "rgba(2,8,23,0.8)",
    whiteSpace: "nowrap",
  }

  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(6,182,212,0.12)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}><SortBtn k="title" label="CASE NAME" /></th>
            <th style={thStyle}><SortBtn k="date"  label="DATE" /></th>
            <th style={{ ...thStyle, maxWidth: 180 }}>LOCATION</th>
            <th style={thStyle}>SHAPE</th>
            <th style={thStyle}><SortBtn k="stars" label="CREDIBILITY" /></th>
            <th style={thStyle}>CLASSIFICATION</th>
            <th style={{ ...thStyle, maxWidth: 160 }}>SOURCE</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((inc, idx) => {
            const starInfo = STAR_DATA[inc.id] || { stars: 3, badge: "UNDER REVIEW", badgeColor: "#f59e0b" }
            return (
              <tr
                key={inc.id}
                style={{
                  borderBottom: "1px solid rgba(6,182,212,0.06)",
                  background: idx % 2 === 0 ? "rgba(10,22,40,0.5)" : "rgba(2,8,23,0.4)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(6,182,212,0.05)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? "rgba(10,22,40,0.5)" : "rgba(2,8,23,0.4)"}
              >
                <td style={{ padding: "10px 14px", fontSize: 11, color: "#e2e8f0", fontWeight: 600, whiteSpace: "nowrap" }}>
                  <div style={{ fontSize: 8, color: "rgba(6,182,212,0.5)", letterSpacing: "0.15em", marginBottom: 2 }}>{inc.id}</div>
                  {inc.title}
                </td>
                <td style={{ padding: "10px 14px", fontSize: 10, color: "#64748b", whiteSpace: "nowrap" }}>{inc.date}</td>
                <td style={{ padding: "10px 14px", fontSize: 10, color: "#94a3b8", maxWidth: 180 }}>{inc.location}</td>
                <td style={{ padding: "10px 14px", fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap" }}>
                  <span style={{ marginRight: 5 }}>{SHAPE_ICONS[inc.shape] || "?"}</span>
                  {inc.shape}
                </td>
                <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                  <Stars count={starInfo.stars} />
                  <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>{inc.credibility}%</div>
                </td>
                <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                  <ClassBadge badge={starInfo.badge} color={starInfo.badgeColor} />
                </td>
                <td style={{ padding: "10px 14px", fontSize: 9, color: "#64748b", maxWidth: 160 }}>
                  {inc.source.split(" / ")[0]}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ------ Toggle button ------
function Toggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px", borderRadius: 20,
        border: active ? "1px solid rgba(6,182,212,0.5)" : "1px solid rgba(100,116,139,0.2)",
        background: active ? "rgba(6,182,212,0.1)" : "transparent",
        color: active ? "#06b6d4" : "#64748b",
        fontSize: 10, letterSpacing: "0.12em",
        cursor: "pointer", transition: "all 0.2s",
      }}
    >
      {active ? "✓" : "○"} {label}
    </button>
  )
}

// ------ View toggle ------
function ViewToggle({ view, onChange }: { view: "grid" | "table"; onChange: (v: "grid" | "table") => void }) {
  const btnStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 14px",
    fontSize: 10,
    letterSpacing: "0.12em",
    cursor: "pointer",
    border: active ? "1px solid rgba(6,182,212,0.5)" : "1px solid rgba(100,116,139,0.2)",
    background: active ? "rgba(6,182,212,0.1)" : "transparent",
    color: active ? "#06b6d4" : "#64748b",
    transition: "all 0.2s",
  })

  return (
    <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(6,182,212,0.12)" }}>
      <button
        onClick={() => onChange("grid")}
        style={{ ...btnStyle(view === "grid"), borderRadius: 0, border: "none", borderRight: "1px solid rgba(6,182,212,0.12)" }}
      >
        ⊞ GRID
      </button>
      <button
        onClick={() => onChange("table")}
        style={{ ...btnStyle(view === "table"), borderRadius: 0, border: "none" }}
      >
        ≡ TABLE
      </button>
    </div>
  )
}

// ------ Main section ------
export default function CasesSection() {
  const [query, setQuery] = useState("")
  const [shape, setShape] = useState("All")
  const [cls, setCls] = useState("All")
  const [militaryOnly, setMilitaryOnly] = useState(false)
  const [radarOnly, setRadarOnly] = useState(false)
  const [view, setView] = useState<"grid" | "table">("grid")

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
    <section id="cases" style={{
      background: "#020817",
      padding: "96px 0",
      borderTop: "1px solid rgba(6,182,212,0.08)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        {/* Section header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "rgba(6,182,212,0.1)",
              border: "1px solid rgba(6,182,212,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12,
            }}>
              ⊟
            </div>
            <span style={{ fontSize: 10, color: "#06b6d4", letterSpacing: "0.3em" }}>04 · CASE DATABASE</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(6,182,212,0.3), transparent)" }} />
          </div>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.01em" }}>
            Incident Case Files
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>
            {INCIDENTS.length} documented incidents from Pentagon, AARO, FAA, and international aviation records.
          </p>
        </div>

        {/* Filter bar */}
        <div style={{
          background: "rgba(10,22,40,0.7)",
          border: "1px solid rgba(6,182,212,0.12)",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 32,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}>
          {/* Search */}
          <div style={{ flex: "1 1 220px", position: "relative" }}>
            <Search style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              width: 14, height: 14, color: "#64748b",
            }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title, location, description..."
              style={{
                width: "100%",
                background: "rgba(15,32,64,0.8)",
                border: "1px solid rgba(6,182,212,0.2)",
                borderRadius: 8, paddingLeft: 36, paddingRight: 14,
                paddingTop: 9, paddingBottom: 9,
                color: "#e2e8f0", fontSize: 12, outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Shape select */}
          <select
            value={shape}
            onChange={e => setShape(e.target.value)}
            style={{
              background: "rgba(15,32,64,0.8)",
              border: "1px solid rgba(6,182,212,0.2)",
              borderRadius: 8, padding: "9px 14px",
              color: "#94a3b8", fontSize: 11, outline: "none",
              fontFamily: "inherit", cursor: "pointer",
            }}
          >
            {SHAPES.map(s => <option key={s} value={s}>{s === "All" ? "Shape: All" : s}</option>)}
          </select>

          {/* Class select */}
          <select
            value={cls}
            onChange={e => setCls(e.target.value)}
            style={{
              background: "rgba(15,32,64,0.8)",
              border: "1px solid rgba(6,182,212,0.2)",
              borderRadius: 8, padding: "9px 14px",
              color: "#94a3b8", fontSize: 11, outline: "none",
              fontFamily: "inherit", cursor: "pointer",
            }}
          >
            {CLASSES.map(c => <option key={c} value={c}>{c === "All" ? "Class: All" : c}</option>)}
          </select>

          <Toggle active={militaryOnly} onClick={() => setMilitaryOnly(v => !v)} label="MILITARY" />
          <Toggle active={radarOnly}   onClick={() => setRadarOnly(v => !v)}   label="RADAR" />

          {/* View toggle */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 10, color: "#64748b", whiteSpace: "nowrap" }}>
              {filtered.length} / {INCIDENTS.length} cases
            </span>
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b", fontSize: 13 }}>
            No cases match current filters.
          </div>
        ) : view === "grid" ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 20,
          }}>
            {filtered.map(inc => (
              <CaseCard key={inc.id} inc={inc} />
            ))}
          </div>
        ) : (
          <TableView incidents={filtered} />
        )}
      </div>
    </section>
  )
}
