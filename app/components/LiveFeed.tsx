"use client"
import Link from "next/link"

// Map feed IDs to relevant archived case IDs for HIGH priority items
const FEED_CASE_LINKS: Record<string, string> = {
  F001: "INC-001", // Nimitz zone — Pacific off California
  F002: "INC-004", // Phoenix area — triangular object
  F006: "INC-008", // USS Omaha — trans-medium / Pacific Fleet
}

const FEED = [
  {
    id: "F001",
    priority: "HIGH",
    title: "Fast Moving Orb",
    loc: "Off coast of California, USA",
    time: "May 12, 2025 · 02:14 AM",
    source: "Navy Pilot Report",
    shape: "Sphere",
  },
  {
    id: "F002",
    priority: "HIGH",
    title: "Triangular Object",
    loc: "Phoenix, Arizona, USA",
    time: "Apr 28, 2025 · 09:33 PM",
    source: "FAA Radar Log",
    shape: "Triangle",
  },
  {
    id: "F003",
    priority: "MEDIUM",
    title: "Radar Contact",
    loc: "North Sea",
    time: "Apr 15, 2025 · 11:50 PM",
    source: "NATO Surveillance",
    shape: "Unknown",
  },
  {
    id: "F004",
    priority: "MEDIUM",
    title: "Cigar Shaped Object",
    loc: "Atlantic Ocean, USA",
    time: "Mar 30, 2025 · 08:22 PM",
    source: "Commercial Pilot",
    shape: "Cigar",
  },
  {
    id: "F005",
    priority: "LOW",
    title: "Silent Disc Object",
    loc: "Brazil Airspace",
    time: "Mar 18, 2025 · 10:45 PM",
    source: "Ground Observer",
    shape: "Disk",
  },
  {
    id: "F006",
    priority: "HIGH",
    title: "Trans-Medium Vehicle",
    loc: "Gulf of Mexico",
    time: "Feb 27, 2025 · 03:17 AM",
    source: "USG Classified Excerpt",
    shape: "Unknown",
  },
  {
    id: "F007",
    priority: "MEDIUM",
    title: "Luminous Sphere Swarm",
    loc: "Mediterranean Sea",
    time: "Feb 10, 2025 · 01:05 AM",
    source: "Naval Intelligence",
    shape: "Sphere",
  },
]

const PRIORITY_CONFIG: Record<string, { border: string; badge: string; badgeBg: string; dot: string }> = {
  HIGH: {
    border: "#ef4444",
    badge: "#ef4444",
    badgeBg: "rgba(239,68,68,0.12)",
    dot: "#ef4444",
  },
  MEDIUM: {
    border: "#f59e0b",
    badge: "#f59e0b",
    badgeBg: "rgba(245,158,11,0.12)",
    dot: "#f59e0b",
  },
  LOW: {
    border: "#64748b",
    badge: "#64748b",
    badgeBg: "rgba(100,116,139,0.12)",
    dot: "#64748b",
  },
}

export default function LiveFeed() {
  return (
    <section
      id="livefeed"
      style={{
        background: "#020817",
        padding: "80px 0",
        borderTop: "1px solid rgba(6,182,212,0.08)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        {/* Section header */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            {/* Blinking dot */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#00ff88",
                boxShadow: "0 0 10px #00ff88",
                animation: "blink 1s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: "#00ff88",
                letterSpacing: "0.3em",
                fontWeight: 700,
              }}
            >
              LIVE ANOMALY FEED
            </span>
            <div
              style={{
                flex: 1,
                height: 1,
                background:
                  "linear-gradient(90deg, rgba(0,255,136,0.3), transparent)",
              }}
            />
            <span
              style={{
                fontSize: 9,
                color: "#64748b",
                padding: "3px 10px",
                borderRadius: 12,
                border: "1px solid rgba(100,116,139,0.2)",
                letterSpacing: "0.1em",
              }}
            >
              {FEED.length} ACTIVE SIGNALS · UPDATING
            </span>
          </div>
          <h2
            style={{
              fontSize: "clamp(20px, 2.5vw, 30px)",
              fontWeight: 800,
              color: "#e2e8f0",
              letterSpacing: "-0.01em",
            }}
          >
            Priority Anomaly Alerts
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>
            Real-time UAP signal intelligence from Navy, FAA, NATO, and classified government sources.
          </p>
        </div>

        {/* Feed grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: 16,
          }}
        >
          {FEED.map((item) => {
            const cfg = PRIORITY_CONFIG[item.priority]
            return (
              <div
                key={item.id}
                style={{
                  background: "rgba(10,22,40,0.7)",
                  border: "1px solid rgba(6,182,212,0.1)",
                  borderLeft: `3px solid ${cfg.border}`,
                  borderRadius: 10,
                  padding: "16px 18px",
                  transition: "border-color 0.2s, background 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = "rgba(10,22,40,0.95)"
                  el.style.borderColor = "rgba(6,182,212,0.25)"
                  el.style.borderLeftColor = cfg.border
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = "rgba(10,22,40,0.7)"
                  el.style.borderColor = "rgba(6,182,212,0.1)"
                  el.style.borderLeftColor = cfg.border
                }}
              >
                {/* Top row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  {/* Priority badge */}
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      color: cfg.badge,
                      background: cfg.badgeBg,
                      border: `1px solid ${cfg.badge}40`,
                      padding: "2px 8px",
                      borderRadius: 3,
                    }}
                  >
                    {item.priority}
                  </span>

                  {/* Shape tag */}
                  <span
                    style={{
                      fontSize: 8,
                      color: "#94a3b8",
                      background: "rgba(148,163,184,0.07)",
                      border: "1px solid rgba(148,163,184,0.15)",
                      padding: "2px 8px",
                      borderRadius: 3,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {item.shape.toUpperCase()}
                  </span>

                  {/* ID */}
                  <span
                    style={{
                      fontSize: 8,
                      color: "#475569",
                      marginLeft: "auto",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {item.id}
                  </span>
                </div>

                {/* Title */}
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#e2e8f0",
                    marginBottom: 6,
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </div>

                {/* Location */}
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span style={{ fontSize: 9 }}>◎</span>
                  {item.loc}
                </div>

                {/* Bottom row: time + source */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 10,
                    borderTop: "1px solid rgba(6,182,212,0.08)",
                  }}
                >
                  <span style={{ fontSize: 9, color: "#475569", letterSpacing: "0.05em" }}>
                    {item.time}
                  </span>
                  <span
                    style={{
                      fontSize: 8,
                      color: "#06b6d4",
                      background: "rgba(6,182,212,0.08)",
                      border: "1px solid rgba(6,182,212,0.2)",
                      padding: "2px 8px",
                      borderRadius: 3,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {item.source}
                  </span>
                </div>

                {/* Details link — for HIGH priority items with a linked case */}
                {FEED_CASE_LINKS[item.id] ? (
                  <Link
                    href={`/cases/${FEED_CASE_LINKS[item.id]}`}
                    style={{
                      display: "block",
                      marginTop: 10,
                      paddingTop: 8,
                      borderTop: "1px solid rgba(6,182,212,0.08)",
                      fontSize: 9,
                      color: "#06b6d4",
                      letterSpacing: "0.18em",
                      textDecoration: "none",
                      fontWeight: 700,
                    }}
                  >
                    RELATED CASE → {FEED_CASE_LINKS[item.id]}
                  </Link>
                ) : item.priority === "HIGH" ? (
                  <div style={{
                    marginTop: 10,
                    paddingTop: 8,
                    borderTop: "1px solid rgba(6,182,212,0.08)",
                    fontSize: 9,
                    color: "#475569",
                    letterSpacing: "0.14em",
                  }}>
                    DETAILS PENDING — UNDER REVIEW
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
