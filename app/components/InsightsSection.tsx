"use client"
import { INSIGHTS, CLASSIFICATIONS } from "@/lib/data"
import { TrendingUp, Zap, Activity } from "lucide-react"

const UAP_CHARACTERISTICS = [
  { n: "01", label: "Sudden Acceleration", desc: "Instantaneous velocity changes exceeding known aerodynamic limits", color: "#06b6d4" },
  { n: "02", label: "Hypersonic Velocity", desc: "Speeds exceeding Mach 10–14 with no sonic boom detected", color: "#00ff88" },
  { n: "03", label: "Low Observability", desc: "No radar return or selectively visible across sensor bands", color: "#f59e0b" },
  { n: "04", label: "Trans-Medium Travel", desc: "Seamless transition between air, space, and underwater environments", color: "#a78bfa" },
  { n: "05", label: "Positive Lift", desc: "Sustained flight with zero visible propulsion, wings, or exhaust", color: "#ef4444" },
]

const GLOBAL_STATS = [
  { value: "800+", label: "Documented Cases", sub: "Pentagon / AARO database", color: "#06b6d4" },
  { value: "2.4×", label: "Pacific Incident Surge", sub: "2019–2023 vs 2010–2018", color: "#f59e0b" },
  { value: "26",   label: "Advanced-Tech Flags", sub: "From 2023 AARO report", color: "#ef4444" },
  { value: "91%",  label: "Silent Triangle Cases", sub: "No audible propulsion", color: "#00ff88" },
  { value: "47%",  label: "Near Nuclear Sites", sub: "High-value case proximity", color: "#a78bfa" },
  { value: "34s",  label: "Median Window",       sub: "Before disappearance", color: "#06b6d4" },
]

export default function InsightsSection() {
  const total = CLASSIFICATIONS.reduce((s, c) => s + c.count, 0)

  return (
    <section id="insights" style={{
      background: "linear-gradient(180deg, #020817 0%, #060d1a 40%, #020817 100%)",
      padding: "96px 0",
      borderTop: "1px solid rgba(6,182,212,0.08)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        {/* Section header */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "rgba(6,182,212,0.1)",
              border: "1px solid rgba(6,182,212,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12,
            }}>
              ∿
            </div>
            <span style={{ fontSize: 10, color: "#06b6d4", letterSpacing: "0.3em" }}>05 · PATTERN ANALYSIS</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(6,182,212,0.3), transparent)" }} />
          </div>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.01em" }}>
            Intelligence Insights
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 8, maxWidth: 560 }}>
            Statistical patterns identified across high-credibility UAP encounters from official records.
          </p>
        </div>

        {/* Global stat callouts — top row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 56,
        }}>
          {GLOBAL_STATS.map(s => (
            <div
              key={s.label}
              style={{
                background: "rgba(10,22,40,0.7)",
                border: `1px solid ${s.color}18`,
                borderRadius: 12,
                padding: "20px 22px",
                textAlign: "center",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = `${s.color}40`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = `${s.color}18`)}
            >
              <div style={{
                fontSize: 36, fontWeight: 900, color: s.color,
                letterSpacing: "-0.02em",
                textShadow: `0 0 24px ${s.color}60`,
                marginBottom: 6,
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: "#e2e8f0", fontWeight: 600, marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.05em" }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Three-column body */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 24,
        }}
          className="insights-grid"
        >
          {/* Column 1 — Key findings */}
          <div style={{
            background: "rgba(10,22,40,0.7)",
            border: "1px solid rgba(6,182,212,0.12)",
            borderRadius: 12,
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Zap style={{ width: 14, height: 14, color: "#06b6d4" }} />
              <span style={{ fontSize: 10, color: "#06b6d4", letterSpacing: "0.2em" }}>KEY FINDINGS</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {INSIGHTS.map((ins, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 14px",
                    background: "rgba(6,182,212,0.04)",
                    border: "1px solid rgba(6,182,212,0.08)",
                    borderRadius: 8,
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(6,182,212,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(6,182,212,0.04)")}
                >
                  <div style={{
                    fontSize: 20, fontWeight: 900, color: "#06b6d4",
                    textShadow: "0 0 12px rgba(6,182,212,0.6)",
                    flexShrink: 0, lineHeight: 1.2,
                  }}>
                    {ins.stat}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
                    {ins.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2 — Classification chart */}
          <div style={{
            background: "rgba(10,22,40,0.7)",
            border: "1px solid rgba(6,182,212,0.12)",
            borderRadius: 12,
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Activity style={{ width: 14, height: 14, color: "#06b6d4" }} />
              <span style={{ fontSize: 10, color: "#06b6d4", letterSpacing: "0.2em" }}>CASE CLASSIFICATION</span>
            </div>

            {/* Visual donut-ish ring */}
            <div style={{ position: "relative", marginBottom: 24 }}>
              {/* Segmented ring */}
              <div style={{
                width: 140, height: 140,
                borderRadius: "50%",
                margin: "0 auto",
                position: "relative",
                background: `conic-gradient(
                  #ef4444 0% ${CLASSIFICATIONS[0].pct}%,
                  #f59e0b ${CLASSIFICATIONS[0].pct}% ${CLASSIFICATIONS[0].pct + CLASSIFICATIONS[1].pct}%,
                  #06b6d4 ${CLASSIFICATIONS[0].pct + CLASSIFICATIONS[1].pct}% ${CLASSIFICATIONS[0].pct + CLASSIFICATIONS[1].pct + CLASSIFICATIONS[2].pct}%,
                  #64748b ${CLASSIFICATIONS[0].pct + CLASSIFICATIONS[1].pct + CLASSIFICATIONS[2].pct}% ${CLASSIFICATIONS[0].pct + CLASSIFICATIONS[1].pct + CLASSIFICATIONS[2].pct + CLASSIFICATIONS[3].pct}%,
                  #00ff88 ${CLASSIFICATIONS[0].pct + CLASSIFICATIONS[1].pct + CLASSIFICATIONS[2].pct + CLASSIFICATIONS[3].pct}% 100%
                )`,
              }}>
                <div style={{
                  position: "absolute",
                  inset: 16,
                  borderRadius: "50%",
                  background: "#0a1628",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column",
                }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#e2e8f0" }}>{total}</div>
                  <div style={{ fontSize: 8, color: "#64748b", letterSpacing: "0.1em" }}>TOTAL</div>
                </div>
              </div>
            </div>

            {/* Legend bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CLASSIFICATIONS.map(c => (
                <div key={c.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 10 }}>
                    <span style={{ color: "#94a3b8" }}>{c.label}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ color: "#64748b" }}>{c.count}</span>
                      <span style={{ color: c.color, fontWeight: 700 }}>{c.pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${c.pct}%`,
                      background: c.color,
                      boxShadow: `0 0 8px ${c.color}60`,
                      borderRadius: 2,
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, fontSize: 9, color: "#64748b", textAlign: "right" }}>
              Source: AARO / Pentagon 2021 Assessment
            </div>
          </div>

          {/* Column 3 — 5 Characteristics */}
          <div style={{
            background: "rgba(10,22,40,0.7)",
            border: "1px solid rgba(6,182,212,0.12)",
            borderRadius: 12,
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <TrendingUp style={{ width: 14, height: 14, color: "#06b6d4" }} />
              <span style={{ fontSize: 10, color: "#06b6d4", letterSpacing: "0.2em" }}>5 UAP SIGNATURES</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {UAP_CHARACTERISTICS.map(item => (
                <div
                  key={item.n}
                  style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    padding: "12px 14px",
                    background: `${item.color}06`,
                    border: `1px solid ${item.color}18`,
                    borderRadius: 8,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${item.color}10`)}
                  onMouseLeave={e => (e.currentTarget.style.background = `${item.color}06`)}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: `${item.color}18`,
                    border: `1px solid ${item.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, color: item.color, fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {item.n}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600, marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 9, color: "#64748b" }}>
              Source: Pentagon 2021 UAP Preliminary Assessment
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .insights-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
