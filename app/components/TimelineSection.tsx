"use client"
import { useState } from "react"

type TimelineEvent = {
  year: string
  date?: string
  title: string
  description: string
  type: "military" | "civilian" | "official" | "scientific"
  significance: "critical" | "high" | "medium"
  source?: string
}

const TIMELINE: TimelineEvent[] = [
  {
    year: "1947",
    date: "Jun 24",
    title: "Kenneth Arnold Sighting — Birth of 'Flying Saucers'",
    description: "Private pilot Kenneth Arnold reports nine crescent-shaped objects near Mt. Rainier, WA, moving at ~1,700 mph. Coins the term 'flying saucer'. Triggers the modern UFO era.",
    type: "civilian",
    significance: "critical",
    source: "FBI / Army Air Forces",
  },
  {
    year: "1947",
    date: "Jul 8",
    title: "Roswell Army Air Field Incident",
    description: "RAAF press release claims recovery of 'flying disc'. Hours later retracted — changed to 'weather balloon'. Witness testimonies and debris descriptions remain disputed for decades.",
    type: "military",
    significance: "critical",
    source: "USAF / Roswell Army Air Field",
  },
  {
    year: "1952",
    date: "Jul 19–20",
    title: "Washington D.C. UFO Flap",
    description: "Multiple unidentified objects tracked on radar at Andrews AFB and Washington National Airport. Jets scrambled. Objects vanish when interceptors approach, reappear when jets depart. Largest U.S. civilian radar event.",
    type: "military",
    significance: "critical",
    source: "CAA / USAF Project Blue Book",
  },
  {
    year: "1967",
    date: "Mar 16",
    title: "Malmstrom AFB — ICBMs Go Offline",
    description: "Ten Minuteman I ICBMs at Oscar Flight, Malmstrom AFB Montana, go offline simultaneously. Security personnel report glowing red disc near front gate. Launch officer Robert Salas later testifies to Congress (2021).",
    type: "military",
    significance: "critical",
    source: "Declassified USAF Documents",
  },
  {
    year: "1969",
    date: "Dec 17",
    title: "Project Blue Book Closes — 701 Cases 'Unexplained'",
    description: "The USAF's official UFO investigation program closes after 22 years. Of 12,618 reports analyzed, 701 remain classified 'unknown'. Condon Report leads to public closure, but UAP monitoring continues internally.",
    type: "official",
    significance: "high",
    source: "U.S. Air Force",
  },
  {
    year: "1980",
    date: "Dec 26–28",
    title: "Rendlesham Forest — Physical Contact",
    description: "U.S. airmen at RAF Woodbridge, UK, encounter a landed triangular craft in Rendlesham Forest over three nights. Lt. Col. Charles Halt records observations on audio. Landing marks and elevated radiation levels documented.",
    type: "military",
    significance: "critical",
    source: "UK MOD / USAF",
  },
  {
    year: "1986",
    date: "Nov 17",
    title: "JAL Flight 1628 — Object the Size of Two Aircraft Carriers",
    description: "Japan Airlines cargo flight en route Paris→Tokyo reports a massive object pacing the aircraft over Alaska for 50 minutes. FAA radar confirms secondary target. FAA and NTSB officially investigate.",
    type: "civilian",
    significance: "high",
    source: "FAA Official Records",
  },
  {
    year: "1989",
    date: "Nov",
    title: "Bob Lazar Discloses S-4 Program",
    description: "Physicist Bob Lazar claims to have worked at a classified facility near Area 51 reverse-engineering extraterrestrial craft. Key technical details he provides are later corroborated by researchers and government documents.",
    type: "official",
    significance: "medium",
    source: "KLAS-TV Las Vegas",
  },
  {
    year: "1997",
    date: "Mar 13",
    title: "Phoenix Lights — 10,000 Witnesses",
    description: "Massive V-shaped formation of lights, estimated over 1 mile wide, moves silently over Nevada and Arizona. Over 10,000 witnesses. Governor Fife Symington later admits he personally witnessed the object.",
    type: "civilian",
    significance: "critical",
    source: "NUFORC / State Records",
  },
  {
    year: "2004",
    date: "Nov 14",
    title: "USS Nimitz Tic-Tac Encounter",
    description: "Navy F/A-18F pilots intercept a 40-foot white Tic-Tac-shaped object that drops from 80,000ft to near sea level in seconds. FLIR video captured. No propulsion, wings, or exhaust. 6 Navy pilots witness.",
    type: "military",
    significance: "critical",
    source: "Pentagon / AARO",
  },
  {
    year: "2006",
    date: "Nov 7",
    title: "O'Hare Airport Disc — Punches Through Cloud",
    description: "United Airlines employees and pilots report a metallic disc hovering over Gate C-17. Object shoots upward leaving a circular hole in cloud cover. FAA initially denies, later confirmed via FOIA recordings.",
    type: "civilian",
    significance: "high",
    source: "FAA FOIA / Chicago Tribune",
  },
  {
    year: "2008",
    date: "Jan 8",
    title: "Stephenville, Texas — F-16s Scrambled",
    description: "Mile-long silent object tracked moving toward Crawford Ranch at 1,900 mph on FAA radar. 200+ witnesses including pilots, police, and business owners. MUFON radar analysis corroborates sighting.",
    type: "civilian",
    significance: "high",
    source: "MUFON / FAA Radar",
  },
  {
    year: "2015",
    date: "Mar 4",
    title: "USS Roosevelt — GIMBAL & GOFAST Videos",
    description: "F/A-18 pilots capture GIMBAL object rotating against wind at altitude. Second video shows GOFAST orb skimming ocean surface. Both captured via ATFLIR targeting pod. No thermal exhaust detected.",
    type: "military",
    significance: "critical",
    source: "Pentagon / AARO",
  },
  {
    year: "2017",
    date: "Dec 16",
    title: "New York Times Breaks AATIP Story",
    description: "NYT reveals existence of Advanced Aerospace Threat Identification Program (AATIP). Pentagon confirms program. FLIR1, GIMBAL, GOFAST videos publicly released. Luis Elizondo discloses program publicly.",
    type: "official",
    significance: "critical",
    source: "New York Times / Pentagon",
  },
  {
    year: "2019",
    date: "Jul 15",
    title: "USS Omaha — Trans-Medium Sphere Descent",
    description: "USS Omaha combat information center tracks pyramid-shaped UAPs using ship radar and visual. Objects hover, then descend into ocean and vanish. Confirmed authentic by Pentagon after 2021 leak.",
    type: "military",
    significance: "critical",
    source: "AARO / Jeremy Corbell",
  },
  {
    year: "2021",
    date: "Jun 25",
    title: "Pentagon UAP Preliminary Assessment",
    description: "Office of the DNI releases 144-case UAP report to Congress. 143 incidents unexplained. Report acknowledges 5 observable UAP characteristics. First official government admission of genuine unknowns.",
    type: "official",
    significance: "critical",
    source: "Office of the DNI",
  },
  {
    year: "2022",
    date: "May 17",
    title: "Congress Holds First UAP Hearing in 50 Years",
    description: "House Intelligence subcommittee holds first public UAP hearings since 1969. DoD officials acknowledge 400+ cases in database, 11 near-miss incidents with U.S. aircraft. Classified briefings follow.",
    type: "official",
    significance: "critical",
    source: "U.S. House of Representatives",
  },
  {
    year: "2023",
    date: "Jul 26",
    title: "David Grusch Congressional Testimony",
    description: "Decorated intelligence officer David Grusch testifies under oath to Congress that the U.S. government possesses non-human craft and biological material. Claims active reverse-engineering programs exist.",
    type: "official",
    significance: "critical",
    source: "U.S. House Oversight Committee",
  },
  {
    year: "2023",
    date: "Mar 20",
    title: "AARO Historical Report — 800+ Cases",
    description: "AARO releases first historical UAP report to Congress. 171 new cases added. 26 show advanced-technology characteristics. 163 remain unresolved. Submitted per NDAA 2023 mandate.",
    type: "official",
    significance: "critical",
    source: "AARO / Congress",
  },
  {
    year: "2024",
    date: "Feb",
    title: "UAP Disclosure Act — Legislative Push",
    description: "Congress debates UAP Disclosure Act modeled on JFK Assassination Records Act. Would mandate declassification of all government UAP records and establish independent review board. Ongoing as of 2024.",
    type: "official",
    significance: "high",
    source: "U.S. Senate / Senate Armed Services",
  },
]

const TYPE_COLORS = {
  military:   { line: "#06b6d4", bg: "rgba(6,182,212,0.08)",   label: "MILITARY" },
  civilian:   { line: "#f59e0b", bg: "rgba(245,158,11,0.08)",  label: "CIVILIAN" },
  official:   { line: "#00ff88", bg: "rgba(0,255,136,0.08)",   label: "OFFICIAL" },
  scientific: { line: "#a78bfa", bg: "rgba(167,139,250,0.08)", label: "SCIENTIFIC" },
}

const SIGNIFICANCE_DOTS = {
  critical: { color: "#ef4444", size: 14 },
  high:     { color: "#f59e0b", size: 10 },
  medium:   { color: "#64748b", size: 8 },
}

export default function TimelineSection() {
  const [activeType, setActiveType] = useState<string>("all")
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = activeType === "all" ? TIMELINE : TIMELINE.filter(e => e.type === activeType)

  return (
    <section id="timeline" style={{
      background: "linear-gradient(180deg, #020817 0%, #060d1a 50%, #020817 100%)",
      padding: "96px 0",
      borderTop: "1px solid rgba(6,182,212,0.08)",
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
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
              ◎
            </div>
            <span style={{ fontSize: 10, color: "#06b6d4", letterSpacing: "0.3em" }}>03 · HISTORICAL RECORD</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(6,182,212,0.3), transparent)" }} />
          </div>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.01em" }}>
            Intelligence Timeline: 1947 – 2024
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>
            Key events in the documented history of UAP encounters and government disclosure.
          </p>
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 48, flexWrap: "wrap" }}>
          {[
            { id: "all",        label: "ALL EVENTS", color: "#06b6d4" },
            { id: "military",   label: "MILITARY",   color: "#06b6d4" },
            { id: "civilian",   label: "CIVILIAN",   color: "#f59e0b" },
            { id: "official",   label: "OFFICIAL",   color: "#00ff88" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveType(f.id)}
              style={{
                padding: "6px 16px", borderRadius: 20,
                border: activeType === f.id ? `1px solid ${f.color}60` : "1px solid rgba(100,116,139,0.2)",
                background: activeType === f.id ? `${f.color}12` : "transparent",
                color: activeType === f.id ? f.color : "#64748b",
                fontSize: 10, letterSpacing: "0.15em",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {f.label}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 10, color: "#64748b", alignSelf: "center" }}>
            {filtered.length} events
          </span>
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" }}>
          {/* Center line */}
          <div style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 1,
            background: "linear-gradient(180deg, transparent, rgba(6,182,212,0.3) 10%, rgba(6,182,212,0.3) 90%, transparent)",
            transform: "translateX(-50%)",
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {filtered.map((event, idx) => {
              const isLeft = idx % 2 === 0
              const typeStyle = TYPE_COLORS[event.type]
              const sigDot = SIGNIFICANCE_DOTS[event.significance]
              const isExpanded = expanded === `${event.year}-${event.title}`

              return (
                <div
                  key={`${event.year}-${event.title}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 60px 1fr",
                    alignItems: "start",
                    marginBottom: 24,
                  }}
                >
                  {/* Left side */}
                  <div style={{ paddingRight: 24, paddingBottom: 8 }}>
                    {isLeft ? (
                      <EventCard
                        event={event}
                        typeStyle={typeStyle}
                        isExpanded={isExpanded}
                        onToggle={() => setExpanded(isExpanded ? null : `${event.year}-${event.title}`)}
                        align="right"
                      />
                    ) : (
                      <YearLabel year={event.year} date={event.date} align="right" />
                    )}
                  </div>

                  {/* Center dot */}
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center",
                    paddingTop: 16,
                  }}>
                    <div style={{
                      width: sigDot.size, height: sigDot.size,
                      borderRadius: "50%",
                      background: sigDot.color,
                      boxShadow: `0 0 ${sigDot.size * 2}px ${sigDot.color}80`,
                      flexShrink: 0,
                    }} />
                  </div>

                  {/* Right side */}
                  <div style={{ paddingLeft: 24, paddingBottom: 8 }}>
                    {!isLeft ? (
                      <EventCard
                        event={event}
                        typeStyle={typeStyle}
                        isExpanded={isExpanded}
                        onToggle={() => setExpanded(isExpanded ? null : `${event.year}-${event.title}`)}
                        align="left"
                      />
                    ) : (
                      <YearLabel year={event.year} date={event.date} align="left" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: "flex", gap: 16, marginTop: 40, paddingTop: 24,
          borderTop: "1px solid rgba(6,182,212,0.1)",
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.15em", alignSelf: "center" }}>SIGNIFICANCE:</span>
          {Object.entries(SIGNIFICANCE_DOTS).map(([key, s]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: s.size, height: s.size, borderRadius: "50%", background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
              <span style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{key}</span>
            </div>
          ))}
          <span style={{ marginLeft: 16, fontSize: 9, color: "#64748b", letterSpacing: "0.15em" }}>TYPE:</span>
          {Object.entries(TYPE_COLORS).filter(([k]) => k !== "scientific").map(([key, s]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: s.line }} />
              <span style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .timeline-grid { grid-template-columns: 0 40px 1fr !important; }
          .timeline-left { display: none !important; }
        }
      `}</style>
    </section>
  )
}

function YearLabel({ year, date, align }: { year: string; date?: string; align: "left" | "right" }) {
  return (
    <div style={{ textAlign: align, paddingTop: 12 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: "rgba(6,182,212,0.3)", letterSpacing: "0.05em" }}>{year}</div>
      {date && <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.1em" }}>{date}</div>}
    </div>
  )
}

function EventCard({
  event,
  typeStyle,
  isExpanded,
  onToggle,
  align,
}: {
  event: TimelineEvent
  typeStyle: { line: string; bg: string; label: string }
  isExpanded: boolean
  onToggle: () => void
  align: "left" | "right"
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        background: isExpanded ? typeStyle.bg : "rgba(10,22,40,0.6)",
        border: `1px solid ${isExpanded ? typeStyle.line + "40" : "rgba(6,182,212,0.1)"}`,
        borderRadius: 10,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "all 0.2s",
        textAlign: align,
      }}
      onMouseEnter={e => {
        if (!isExpanded) {
          ;(e.currentTarget as HTMLElement).style.borderColor = typeStyle.line + "30"
          ;(e.currentTarget as HTMLElement).style.background = "rgba(10,22,40,0.8)"
        }
      }}
      onMouseLeave={e => {
        if (!isExpanded) {
          ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(6,182,212,0.1)"
          ;(e.currentTarget as HTMLElement).style.background = "rgba(10,22,40,0.6)"
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: align === "right" ? "flex-end" : "flex-start", marginBottom: 6 }}>
        <span style={{
          padding: "2px 7px", borderRadius: 3,
          background: typeStyle.bg,
          border: `1px solid ${typeStyle.line}30`,
          fontSize: 8, color: typeStyle.line, letterSpacing: "0.15em",
        }}>
          {typeStyle.label}
        </span>
        <span style={{ fontSize: 8, color: "#64748b" }}>{event.year}{event.date ? ` · ${event.date}` : ""}</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.4, marginBottom: isExpanded ? 8 : 0 }}>
        {event.title}
      </div>
      {isExpanded && (
        <>
          <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6, marginTop: 8 }}>
            {event.description}
          </div>
          {event.source && (
            <div style={{ fontSize: 9, color: "#64748b", marginTop: 8, letterSpacing: "0.1em" }}>
              SOURCE: {event.source}
            </div>
          )}
        </>
      )}
      <div style={{ fontSize: 9, color: "rgba(6,182,212,0.4)", marginTop: 6, letterSpacing: "0.1em" }}>
        {isExpanded ? "▲ COLLAPSE" : "▼ EXPAND"}
      </div>
    </div>
  )
}
