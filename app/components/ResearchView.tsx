"use client"
import ResearchDashboard from "./ResearchDashboard"

export default function ResearchView() {
  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100vh", boxSizing: "border-box" }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 10, color: "#00ff88", letterSpacing: "0.3em" }}>
          ◈ WAR ROOM DATA — 79,621 NUFORC RECORDS
        </span>
        <p style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
          Real statistical analysis from the National UFO Reporting Center
        </p>
      </div>
      <ResearchDashboard />
    </div>
  )
}
