"use client"
import { useEffect, useState, useRef } from "react"
// Component not used in main SPA — kept for reference
const FEED_EVENTS: { id:string; time:string; type:string; severity:string; text:string; region:string }[] = []

const STATS = [
  { value: 800, suffix: "+", label: "Documented Cases", color: "#06b6d4" },
  { value: 5,   suffix: "",  label: "Pentagon Videos",   color: "#00ff88" },
  { value: 50,  suffix: "yr",label: "Declassified Docs", color: "#f59e0b" },
  { value: 15,  suffix: "",  label: "Active Hot Zones",  color: "#ef4444" },
]

function useCounter(target: number, duration = 2000, started: boolean) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!started) return
    let start = 0
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, started])
  return val
}

function StatCard({ value, suffix, label, color, started }: { value: number; suffix: string; label: string; color: string; started: boolean }) {
  const count = useCounter(value, 1800, started)
  return (
    <div style={{
      background: "rgba(10,22,40,0.7)",
      border: `1px solid ${color}30`,
      borderRadius: 12,
      padding: "20px 24px",
      textAlign: "center",
      backdropFilter: "blur(12px)",
      boxShadow: `0 0 24px ${color}15`,
      flex: "1 1 160px",
    }}>
      <div style={{ fontSize: 36, fontWeight: 900, color, letterSpacing: "-0.02em", textShadow: `0 0 20px ${color}80` }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: 10, color: "rgba(148,163,184,0.7)", letterSpacing: "0.15em", marginTop: 6, textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  )
}

export default function HeroSection() {
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 300)
    return () => clearTimeout(timer)
  }, [])

  function scrollToMap() {
    const el = document.getElementById("map")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  // Ticker
  const allEvents = [...FEED_EVENTS, ...FEED_EVENTS]

  return (
    <div
      ref={ref}
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#020817",
      }}
    >
      {/* Animated grid background */}
      <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.6 }} />

      {/* Radial gradient glow center */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Radar circle */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 420,
        height: 420,
        borderRadius: "50%",
        border: "1px solid rgba(6,182,212,0.12)",
        pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute",
          inset: 40,
          borderRadius: "50%",
          border: "1px solid rgba(6,182,212,0.1)",
        }} />
        <div style={{
          position: "absolute",
          inset: 80,
          borderRadius: "50%",
          border: "1px solid rgba(6,182,212,0.08)",
        }} />
        {/* Radar sweep */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "conic-gradient(from 0deg, transparent 60%, rgba(6,182,212,0.15) 75%, transparent 90%)",
          animation: "radar-sweep 4s linear infinite",
        }} />
        {/* Center dot */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 8, height: 8,
          borderRadius: "50%",
          background: "#06b6d4",
          boxShadow: "0 0 16px #06b6d4",
        }} />
      </div>

      {/* Corner accents */}
      {["top-0 left-0", "top-0 right-0", "bottom-20 left-0", "bottom-20 right-0"].map((pos, i) => (
        <div key={i} style={{
          position: "absolute",
          ...(pos.includes("top-0") ? { top: 80 } : { bottom: 80 }),
          ...(pos.includes("left-0") ? { left: 24 } : { right: 24 }),
          width: 40, height: 40,
          borderTop: pos.includes("top-0") ? "1px solid rgba(6,182,212,0.3)" : "none",
          borderBottom: pos.includes("bottom") ? "1px solid rgba(6,182,212,0.3)" : "none",
          borderLeft: pos.includes("left-0") ? "1px solid rgba(6,182,212,0.3)" : "none",
          borderRight: pos.includes("right-0") ? "1px solid rgba(6,182,212,0.3)" : "none",
        }} />
      ))}

      {/* Main Content */}
      <div style={{
        position: "relative",
        zIndex: 10,
        textAlign: "center",
        padding: "120px 24px 100px",
        maxWidth: 900,
        width: "100%",
      }}>
        {/* Status badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px", borderRadius: 20,
          border: "1px solid rgba(0,255,136,0.3)",
          background: "rgba(0,255,136,0.05)",
          marginBottom: 32,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#00ff88", boxShadow: "0 0 8px #00ff88",
          }} className="animate-blink" />
          <span style={{ fontSize: 10, color: "#00ff88", letterSpacing: "0.2em" }}>
            SYSTEM ONLINE · MONITORING ACTIVE
          </span>
        </div>

        {/* Main headline */}
        <h1 style={{
          fontSize: "clamp(28px, 5vw, 64px)",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          color: "#e2e8f0",
          marginBottom: 16,
        }}>
          <span className="glow-text" style={{ color: "#06b6d4" }}>AI-POWERED</span>
          <br />
          ANOMALY INTELLIGENCE
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: "clamp(13px, 2vw, 17px)",
          color: "rgba(148,163,184,0.8)",
          marginBottom: 56,
          lineHeight: 1.7,
          maxWidth: 560,
          margin: "0 auto 56px",
        }}>
          Analyzing declassified UAP records from government archives.
          <br />
          Detecting patterns humans miss. Updated in real time.
        </p>

        {/* Stat cards */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", marginBottom: 48 }}>
          {STATS.map(s => (
            <StatCard key={s.label} {...s} started={started} />
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={scrollToMap}
            style={{
              padding: "14px 32px", borderRadius: 8,
              background: "#06b6d4", color: "#020817",
              fontSize: 12, fontWeight: 800, letterSpacing: "0.15em",
              border: "none", cursor: "pointer",
              boxShadow: "0 0 24px rgba(6,182,212,0.4)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 36px rgba(6,182,212,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 24px rgba(6,182,212,0.4)")}
          >
            OPEN GLOBAL MAP
          </button>
          <button
            onClick={() => document.getElementById("videos")?.scrollIntoView({ behavior: "smooth" })}
            style={{
              padding: "14px 32px", borderRadius: 8,
              background: "transparent",
              border: "1px solid rgba(6,182,212,0.4)",
              color: "#06b6d4",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.15em",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              ;(e.currentTarget.style.background = "rgba(6,182,212,0.08)")
              ;(e.currentTarget.style.borderColor = "rgba(6,182,212,0.7)")
            }}
            onMouseLeave={e => {
              ;(e.currentTarget.style.background = "transparent")
              ;(e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)")
            }}
          >
            VIEW DECLASSIFIED FOOTAGE
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute",
        bottom: 72,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        animation: "float 2s ease-in-out infinite",
      }}>
        <div style={{ fontSize: 9, color: "rgba(100,116,139,0.7)", letterSpacing: "0.2em" }}>SCROLL TO EXPLORE</div>
        <div style={{
          width: 20, height: 32, borderRadius: 10,
          border: "1px solid rgba(6,182,212,0.3)",
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          padding: 4,
        }}>
          <div style={{
            width: 3, height: 6, borderRadius: 2,
            background: "#06b6d4",
            animation: "scrollDot 1.5s ease-in-out infinite",
          }} />
        </div>
      </div>

      {/* Live ticker at absolute bottom */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: "1px solid rgba(6,182,212,0.12)",
        background: "rgba(2,8,23,0.9)",
        overflow: "hidden",
        height: 36,
        display: "flex",
        alignItems: "center",
      }}>
        <div style={{
          padding: "0 16px",
          borderRight: "1px solid rgba(6,182,212,0.2)",
          fontSize: 9, color: "#06b6d4",
          letterSpacing: "0.2em",
          whiteSpace: "nowrap",
          height: "100%",
          display: "flex", alignItems: "center",
        }}>
          ▶ LIVE FEED
        </div>
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <div style={{
            display: "flex",
            gap: 0,
            animation: "ticker-scroll 60s linear infinite",
            whiteSpace: "nowrap",
          }}>
            {allEvents.map((ev, i) => (
              <span key={i} style={{
                padding: "0 32px",
                fontSize: 10,
                color: ev.severity === "HIGH" ? "#ef4444" : ev.severity === "MED" ? "#f59e0b" : "#64748b",
              }}>
                <span style={{ color: "#06b6d4" }}>[{ev.type}]</span>
                {" "}{ev.text}
                <span style={{ color: "rgba(100,116,139,0.5)", margin: "0 16px" }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-6px); }
        }
        @keyframes scrollDot {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(12px); opacity: 0.3; }
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
