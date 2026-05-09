"use client"
import dynamic from "next/dynamic"

const GlobalMap = dynamic(() => import("./GlobalMap"), {
  ssr: false,
  loading: () => (
    <div style={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#06b6d4",
      fontSize: 11,
      letterSpacing: "0.2em",
    }}>
      INITIALIZING MAP...
    </div>
  ),
})

export default function MapView() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{
        padding: "12px 20px",
        borderBottom: "1px solid rgba(6,182,212,0.12)",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, color: "#06b6d4", letterSpacing: "0.3em" }}>
          ◎ GLOBAL ANOMALY MAP · FULL VIEW
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <GlobalMap />
      </div>
    </div>
  )
}
