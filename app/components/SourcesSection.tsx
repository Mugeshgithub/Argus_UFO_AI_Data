"use client"
import { ExternalLink, FileText, Shield } from "lucide-react"

type Source = {
  name: string
  shortName: string
  description: string
  badge: "DECLASSIFIED" | "OFFICIAL" | "FOIA" | "CONGRESSIONAL"
  badgeColor: string
  category: string
  highlights: string[]
  url: string
}

const SOURCES: Source[] = [
  {
    name: "All-domain Anomaly Resolution Office",
    shortName: "AARO",
    description: "The official U.S. Department of Defense office established to detect, identify, and attribute UAP. Publishes annual reports to Congress and maintains the primary case database.",
    badge: "OFFICIAL",
    badgeColor: "#00ff88",
    category: "DoD",
    highlights: ["800+ case database", "Annual Congressional reports", "Historical records"],
    url: "https://www.aaro.mil",
  },
  {
    name: "Office of the Director of National Intelligence",
    shortName: "ODNI",
    description: "Released the preliminary 2021 UAP Assessment covering 144 cases from 2004–2021. First official U.S. government acknowledgment of genuine unknowns in post-war era.",
    badge: "OFFICIAL",
    badgeColor: "#00ff88",
    category: "Intelligence",
    highlights: ["2021 UAP Preliminary Assessment", "144 documented cases", "Interagency coordination"],
    url: "https://www.dni.gov",
  },
  {
    name: "U.S. Department of Defense",
    shortName: "Pentagon",
    description: "Released the FLIR1, GIMBAL, and GOFAST videos in April 2020 confirming them as authentic UAP footage captured by U.S. Navy aircraft. Ongoing UAP monitoring continues.",
    badge: "DECLASSIFIED",
    badgeColor: "#06b6d4",
    category: "Military",
    highlights: ["FLIR1 (Tic-Tac) release", "GIMBAL video release", "GOFAST video release"],
    url: "https://www.defense.gov",
  },
  {
    name: "CIA FOIA Reading Room (CREST)",
    shortName: "CIA FOIA",
    description: "Declassified documents from the CIA's CREST database include intelligence reports on UAP from the 1940s through 1990s, including materials from Project SIGN, GRUDGE, and BLUE BOOK.",
    badge: "FOIA",
    badgeColor: "#f59e0b",
    category: "Intelligence",
    highlights: ["CREST database", "Cold War era reports", "Project Blue Book files"],
    url: "https://www.cia.gov/readingroom",
  },
  {
    name: "FBI Vault — UFO Files",
    shortName: "FBI Vault",
    description: "The FBI's online declassified document library contains memos and field reports on UAP incidents dating back to 1947, including the Roswell incident and congressional briefings.",
    badge: "FOIA",
    badgeColor: "#f59e0b",
    category: "Law Enforcement",
    highlights: ["1947 Roswell documents", "Field agent reports", "Congressional memos"],
    url: "https://vault.fbi.gov",
  },
  {
    name: "NASA UAP Independent Study",
    shortName: "NASA",
    description: "NASA's independent UAP study team published findings in 2023 recommending standardization of data collection and AI-assisted analysis. Emphasizes scientific approach to unexplained phenomena.",
    badge: "OFFICIAL",
    badgeColor: "#00ff88",
    category: "Scientific",
    highlights: ["2023 UAP study report", "Data standardization push", "AI analysis framework"],
    url: "https://www.nasa.gov/uap",
  },
  {
    name: "National UFO Reporting Center",
    shortName: "NUFORC",
    description: "Civilian database of over 100,000 UAP reports collected since 1974. Primary source for mass sighting events including the Phoenix Lights (1997). Provides geographic and temporal pattern data.",
    badge: "OFFICIAL",
    badgeColor: "#00ff88",
    category: "Civilian Research",
    highlights: ["100,000+ reports", "Phoenix Lights documentation", "Pattern analysis data"],
    url: "https://nuforc.org",
  },
  {
    name: "U.S. House Oversight Committee — UAP Hearings",
    shortName: "Congress",
    description: "Congressional hearings in 2022 and 2023 produced the first public testimonies in 50 years. David Grusch's 2023 testimony under oath claimed non-human craft recovery programs.",
    badge: "CONGRESSIONAL",
    badgeColor: "#a78bfa",
    category: "Legislative",
    highlights: ["David Grusch testimony", "First hearing in 50 years", "11 near-miss disclosures"],
    url: "https://oversight.house.gov",
  },
  {
    name: "Project Blue Book — USAF Archives",
    shortName: "Blue Book",
    description: "The U.S. Air Force's official UFO investigation from 1952–1969. 12,618 reports investigated. 701 cases remain classified 'unknown' to this day. Records archived at National Archives.",
    badge: "DECLASSIFIED",
    badgeColor: "#06b6d4",
    category: "Historical",
    highlights: ["12,618 cases analyzed", "701 unresolved cases", "National Archives collection"],
    url: "https://www.archives.gov",
  },
]

const BADGE_STYLES: Record<string, { bg: string; border: string }> = {
  DECLASSIFIED: { bg: "rgba(6,182,212,0.1)",    border: "rgba(6,182,212,0.4)" },
  OFFICIAL:     { bg: "rgba(0,255,136,0.1)",    border: "rgba(0,255,136,0.4)" },
  FOIA:         { bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.4)" },
  CONGRESSIONAL:{ bg: "rgba(167,139,250,0.1)",  border: "rgba(167,139,250,0.4)" },
}

function SourceCard({ s }: { s: Source }) {
  const badgeStyle = BADGE_STYLES[s.badge]

  return (
    <div
      style={{
        background: "rgba(10,22,40,0.7)",
        border: "1px solid rgba(6,182,212,0.12)",
        borderRadius: 12,
        padding: "22px 22px",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s",
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(6,182,212,0.3)"
        ;(e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(6,182,212,0.08)"
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(6,182,212,0.12)"
        ;(e.currentTarget as HTMLElement).style.boxShadow = "none"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 9, color: "rgba(6,182,212,0.6)", letterSpacing: "0.2em", marginBottom: 4 }}>
            {s.category.toUpperCase()}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>{s.shortName}</div>
        </div>
        <span style={{
          padding: "4px 10px", borderRadius: 4,
          background: badgeStyle.bg,
          border: `1px solid ${badgeStyle.border}`,
          fontSize: 8, color: s.badgeColor,
          letterSpacing: "0.15em", fontWeight: 700,
          whiteSpace: "nowrap", flexShrink: 0, marginLeft: 12,
        }}>
          {s.badge}
        </span>
      </div>

      {/* Full name */}
      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 12, letterSpacing: "0.04em" }}>
        {s.name}
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, flex: 1, marginBottom: 16 }}>
        {s.description}
      </p>

      {/* Highlights */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 16 }}>
        {s.highlights.map(h => (
          <div key={h} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: s.badgeColor, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "#64748b" }}>{h}</span>
          </div>
        ))}
      </div>

      {/* Link */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 10, color: "rgba(6,182,212,0.6)",
        letterSpacing: "0.1em",
        borderTop: "1px solid rgba(6,182,212,0.08)",
        paddingTop: 12,
      }}>
        <ExternalLink style={{ width: 11, height: 11 }} />
        {s.url}
      </div>
    </div>
  )
}

export default function SourcesSection() {
  return (
    <section id="sources" style={{
      background: "linear-gradient(180deg, #020817 0%, #060d1a 50%, #020817 100%)",
      padding: "96px 0 60px",
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
              ◫
            </div>
            <span style={{ fontSize: 10, color: "#06b6d4", letterSpacing: "0.3em" }}>07 · OFFICIAL RECORDS</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(6,182,212,0.3), transparent)" }} />
          </div>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.01em" }}>
            Sources & Documents
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 8, maxWidth: 600 }}>
            All data sourced from verified U.S. government declassified records, FOIA releases, and official
            Congressional proceedings. No speculation or unverified sources included.
          </p>
        </div>

        {/* Badge legend */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
          {Object.entries(BADGE_STYLES).map(([badge, s]) => {
            const source = SOURCES.find(src => src.badge === badge)
            return (
              <div key={badge} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  padding: "2px 8px", borderRadius: 3,
                  background: s.bg, border: `1px solid ${s.border}`,
                  fontSize: 8, color: source?.badgeColor, letterSpacing: "0.15em",
                }}>
                  {badge}
                </span>
              </div>
            )
          })}
        </div>

        {/* Source grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
          marginBottom: 60,
        }}>
          {SOURCES.map(s => (
            <SourceCard key={s.shortName} s={s} />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid rgba(6,182,212,0.1)",
          paddingTop: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          textAlign: "center",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              border: "1.5px solid rgba(6,182,212,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#06b6d4", boxShadow: "0 0 12px #06b6d4",
              }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#06b6d4", letterSpacing: "0.2em" }}>SENTINEL</div>
              <div style={{ fontSize: 8, color: "rgba(6,182,212,0.4)", letterSpacing: "0.15em" }}>UAP INTELLIGENCE PLATFORM</div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: "#64748b", maxWidth: 480, lineHeight: 1.6 }}>
            Data sourced exclusively from U.S. government declassified records, FOIA releases, and official
            Congressional proceedings. This platform is for research and educational purposes.
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {["AARO", "Pentagon", "CIA FOIA", "FBI Vault", "NASA", "NUFORC", "Congress"].map(s => (
              <span key={s} style={{
                padding: "3px 10px", borderRadius: 12,
                border: "1px solid rgba(6,182,212,0.15)",
                fontSize: 9, color: "#64748b", letterSpacing: "0.1em",
              }}>
                {s}
              </span>
            ))}
          </div>

          <div style={{ fontSize: 9, color: "rgba(100,116,139,0.4)", letterSpacing: "0.15em", marginTop: 8 }}>
            SENTINEL UAP Intelligence · All data from declassified U.S. government records · {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </section>
  )
}
