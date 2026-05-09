"use client"
import { useEffect, useState } from "react"
import ResearchDashboard from "./ResearchDashboard"

type Methodology = {
  pipeline: string
  limitations: string[]
  strengths: string[]
  what_this_is_not: string[]
  data_source: string
  record_count: number
  years_covered: string
}

export default function ResearchView() {
  const [methodology, setMethodology] = useState<Methodology | null>(null)
  const [showMethodology, setShowMethodology] = useState(false)

  useEffect(() => {
    fetch("/data/derived_methodology.json")
      .then(r => r.json())
      .then(setMethodology)
      .catch(() => {})
  }, [])

  return (
    <div style={{ overflowY: "auto", height: "100vh", boxSizing: "border-box" }}>
      <div style={{
        padding: "20px 24px",
        borderBottom: "1px solid rgba(6,182,212,0.1)",
        background: "rgba(2,8,23,0.95)",
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      }}>
        <div>
          <span style={{ fontSize: 10, color: "#00ff88", letterSpacing: "0.3em" }}>
            ◈ WAR ROOM DATA — 79,621 NUFORC RECORDS
          </span>
          <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            Statistical analysis from the National UFO Reporting Center — all charts computed from real data
          </p>
        </div>
        <button
          onClick={() => setShowMethodology(v => !v)}
          style={{
            marginLeft: "auto", padding: "6px 14px", borderRadius: 6, fontSize: 9,
            border: "1px solid rgba(245,158,11,0.4)", background: showMethodology ? "rgba(245,158,11,0.12)" : "transparent",
            color: "#f59e0b", letterSpacing: "0.15em", cursor: "pointer", flexShrink: 0,
          }}
        >
          {showMethodology ? "▼ HIDE" : "▶ SHOW"} METHODOLOGY
        </button>
      </div>

      {/* Methodology card */}
      {showMethodology && methodology && (
        <div style={{
          margin: "20px 24px 0",
          background: "rgba(10,22,40,0.8)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 12,
          padding: "24px",
        }}>
          <div style={{ fontSize: 10, color: "#f59e0b", letterSpacing: "0.25em", fontWeight: 700, marginBottom: 4 }}>
            DATA SCIENCE METHODOLOGY & LIMITATIONS
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 20 }}>
            Source: {methodology.data_source} · {methodology.record_count.toLocaleString()} records · {methodology.years_covered}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="method-grid">
            <div>
              <div style={{ fontSize: 9, color: "#00ff88", letterSpacing: "0.2em", marginBottom: 12 }}>PIPELINE</div>
              <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>
                {methodology.pipeline}
              </div>
              <div style={{ fontSize: 9, color: "#00ff88", letterSpacing: "0.2em", marginBottom: 12 }}>STRENGTHS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {methodology.strengths.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#00ff88", flexShrink: 0, marginTop: 2 }}>✓</span>
                    <span style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.5 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 9, color: "#ef4444", letterSpacing: "0.2em", marginBottom: 12 }}>KNOWN LIMITATIONS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                {methodology.limitations.map((l, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#ef4444", flexShrink: 0, marginTop: 2 }}>⚠</span>
                    <span style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.5 }}>{l}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 9, color: "#f59e0b", letterSpacing: "0.2em", marginBottom: 12 }}>WHAT THIS IS NOT</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {methodology.what_this_is_not.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#f59e0b", flexShrink: 0, marginTop: 2 }}>✗</span>
                    <span style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.5 }}>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "24px" }}>
        <ResearchDashboard />
      </div>

      <style>{`
        @media (max-width: 700px) {
          .method-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
