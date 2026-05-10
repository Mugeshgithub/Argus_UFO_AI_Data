"use client"
import { Play, ExternalLink, CheckCircle, Shield } from "lucide-react"
import { INCIDENTS } from "@/lib/data"

const VIDEO_INCIDENTS = INCIDENTS.filter(i => i.videoId)

function CredBar({ value }: { value: number }) {
  const color = value >= 90 ? "#00ff88" : value >= 75 ? "#06b6d4" : "#f59e0b"
  return (
    <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{
        height: "100%",
        width: `${value}%`,
        background: color,
        boxShadow: `0 0 6px ${color}`,
        borderRadius: 2,
      }} />
    </div>
  )
}

function VideoCard({ inc }: { inc: (typeof VIDEO_INCIDENTS)[0] }) {
  const thumbUrl = `https://img.youtube.com/vi/${inc.videoId}/hqdefault.jpg`
  const ytUrl    = `https://www.youtube.com/watch?v=${inc.videoId}`

  return (
    <div style={{
      background: "rgba(10,22,40,0.8)",
      border: "1px solid rgba(6,182,212,0.15)",
      borderRadius: 12,
      overflow: "hidden",
      transition: "border-color 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(6,182,212,0.4)"
        ;(e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(6,182,212,0.12)"
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(6,182,212,0.15)"
        ;(e.currentTarget as HTMLElement).style.boxShadow = "none"
      }}
    >
      {/* Thumbnail — clicks open YouTube directly, no embed errors */}
      <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
        <a
          href={ytUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${thumbUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "block",
          }}
        >
          {/* Dark overlay */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(2,8,23,0.45)" }} />

          {/* Play button */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 64, height: 64,
            borderRadius: "50%",
            background: "rgba(6,182,212,0.2)",
            border: "2px solid rgba(6,182,212,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 32px rgba(6,182,212,0.4)",
          }}>
            <Play style={{ width: 24, height: 24, color: "#06b6d4", marginLeft: 4 }} />
          </div>

          {/* Badges */}
          <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
            <span style={{
              padding: "3px 8px", borderRadius: 4,
              background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.4)",
              fontSize: 8, color: "#00ff88", letterSpacing: "0.15em", fontWeight: 700,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <CheckCircle style={{ width: 8, height: 8 }} />
              OFFICIAL RELEASE
            </span>
            {inc.military && (
              <span style={{
                padding: "3px 8px", borderRadius: 4,
                background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.4)",
                fontSize: 8, color: "#06b6d4", letterSpacing: "0.15em", fontWeight: 700,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <Shield style={{ width: 8, height: 8 }} />
                MILITARY
              </span>
            )}
          </div>

          {/* Watch on YouTube label */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "6px 12px",
            background: "rgba(2,8,23,0.85)",
            borderTop: "1px solid rgba(6,182,212,0.15)",
            fontSize: 9, color: "#ef4444", letterSpacing: "0.1em",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Play style={{ width: 9, height: 9 }} /> WATCH ON YOUTUBE →
          </div>

          {/* Date */}
          <div style={{
            position: "absolute", top: 10, right: 10,
            fontSize: 9, color: "rgba(148,163,184,0.8)",
            background: "rgba(2,8,23,0.7)", padding: "3px 8px", borderRadius: 4,
          }}>
            {inc.date}
          </div>
        </a>
      </div>

      {/* Info */}
      <div style={{ padding: "16px 18px" }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: "rgba(6,182,212,0.6)", letterSpacing: "0.2em", marginBottom: 4 }}>
            {inc.id} · {inc.source}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3 }}>
            {inc.title}
          </div>
        </div>

        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 12, lineHeight: 1.5 }}>
          {inc.videoTitle}
        </div>

        <CredBar value={inc.credibility} />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 9, color: "#64748b" }}>
          <span>{inc.location}</span>
          <span style={{ color: inc.credibility >= 90 ? "#00ff88" : "#06b6d4" }}>
            {inc.credibility}% CREDIBILITY
          </span>
        </div>

        <div style={{ marginTop: 10, fontSize: 9, color: "rgba(100,116,139,0.7)", lineHeight: 1.5 }}>
          {inc.videoSource}
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          {inc.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{
              padding: "2px 7px", borderRadius: 3,
              border: "1px solid rgba(100,116,139,0.3)",
              fontSize: 8, color: "#64748b", letterSpacing: "0.1em",
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function VideoGallery() {
  return (
    <section id="videos" style={{
      background: "#020817",
      padding: "96px 0",
      borderTop: "1px solid rgba(6,182,212,0.08)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        {/* Section header */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: "50%",
              background: "rgba(6,182,212,0.1)",
              border: "1px solid rgba(6,182,212,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12,
            }}>
              ▶
            </div>
            <span style={{ fontSize: 10, color: "#06b6d4", letterSpacing: "0.3em" }}>02 · DECLASSIFIED FOOTAGE</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(6,182,212,0.3), transparent)" }} />
          </div>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.01em" }}>
            Official Video Evidence
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 8, maxWidth: 560 }}>
            Verified footage released by the US Department of Defense and official sources.
            Each video has been confirmed authentic by Pentagon officials.
          </p>
        </div>

        {/* Video grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 24,
        }}>
          {VIDEO_INCIDENTS.map(inc => (
            <VideoCard key={inc.id} inc={inc} />
          ))}
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: 32, padding: "16px 20px",
          border: "1px solid rgba(6,182,212,0.1)",
          borderRadius: 8,
          background: "rgba(6,182,212,0.03)",
          fontSize: 10, color: "#64748b",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <CheckCircle style={{ width: 12, height: 12, color: "#00ff88", flexShrink: 0 }} />
          All videos officially released or confirmed authentic by the U.S. Department of Defense.
          Sources: DoD, AARO, declassified USAF records, and official whistleblower testimony.
        </div>
      </div>
    </section>
  )
}
