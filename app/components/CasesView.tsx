"use client"
import CaseExplorer from "./CaseExplorer"

export default function CasesView() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(6,182,212,0.12)",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, color: "#06b6d4", letterSpacing: "0.3em" }}>⊡ CASE EXPLORER</span>
        <p style={{ fontSize: 11, color: "#64748b", marginTop: 4, margin: 0 }}>
          Search and explore all UAP cases · Click any row to expand details
        </p>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        <CaseExplorer />
      </div>
    </div>
  )
}
