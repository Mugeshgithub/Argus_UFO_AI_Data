"use client"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { INCIDENTS } from "../../../lib/data"
import Sidebar from "../../components/Sidebar"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts"
import Link from "next/link"

// ─── helpers ────────────────────────────────────────────────────────────────

function classificationColor(cls: string) {
  if (cls.includes("Unexplained"))        return "#ef4444"
  if (cls.includes("Radar"))              return "#06b6d4"
  if (cls.includes("Atmospheric"))        return "#f59e0b"
  if (cls.includes("Official"))           return "#00ff88"
  return "#94a3b8"
}

function getAnomalyScores(inc: typeof INCIDENTS[0]) {
  const c = inc.credibility / 100
  const hasVideo   = !!inc.videoId
  const hasMil     = inc.military
  const hasRadar   = inc.radarConfirmed
  const tagStr     = inc.tags.join(" ").toLowerCase()
  const hypersonic = tagStr.includes("hyper") || tagStr.includes("speed")

  return [
    { subject: "Speed",            A: Math.round(c * (hypersonic ? 100 : 88)) },
    { subject: "Maneuverability",  A: Math.round(c * (hasMil ? 98 : 80)) },
    { subject: "Stealth",          A: Math.round(c * (hasRadar ? 82 : 70)) },
    { subject: "Multi-Domain",     A: Math.round(c * (tagStr.includes("uso") || tagStr.includes("trans") ? 85 : 38)) },
    { subject: "Physics-Violation",A: Math.round(c * (inc.credibility > 90 ? 92 : 72)) },
    { subject: "Sig-Evasion",      A: Math.round(c * (hasVideo ? 88 : 65)) },
  ]
}

function getPatternAnalysis(inc: typeof INCIDENTS[0]) {
  const s = inc.shape.toLowerCase()
  const tags = inc.tags.join(" ").toLowerCase()
  return {
    flight: inc.radarConfirmed
      ? "Non-ballistic trajectory with instantaneous acceleration. Radar track shows course changes physically impossible for conventional craft."
      : "Silent, controlled flight path without conventional aerodynamic surfaces. No wake turbulence detected.",
    propulsion: inc.videoId
      ? "No visible exhaust plumes, heat signature anomalies, or propulsion mechanisms captured on FLIR or optical imagery."
      : "No propulsion mechanism identified. Zero acoustic signature across all observation frequencies.",
    signature: inc.radarConfirmed
      ? `Radar cross-section inconsistent with any known aircraft. ${s.includes("disc") ? "Disc geometry" : "Object geometry"} does not match any catalogued RCS profile.`
      : "Minimal or absent radar return despite significant visual size. Possible active signature management.",
    behavior: tags.includes("nuclear")
      ? "Demonstrated interest in nuclear infrastructure. Maintained station-keeping without propulsion for extended period."
      : inc.military
      ? "Responded to military intercept by accelerating to escape velocity. Demonstrated awareness of pursuit aircraft."
      : "Maintained controlled flight envelope in conditions that would disable conventional aircraft. No pilot or cockpit structure visible.",
  }
}

function getTimelineSteps(inc: typeof INCIDENTS[0]) {
  const year = inc.date.split("-")[0]
  const steps = [
    {
      label: "T+0:00",
      title: "Initial Detection",
      desc: inc.radarConfirmed
        ? `Object first detected on ${inc.military ? "military" : "civilian"} radar at unexpected altitude. Alert dispatched to operations center.`
        : `${inc.witnesses > 10 ? `${inc.witnesses} civilian witnesses` : "Crew members"} visually acquired object. No prior radar warning received.`,
    },
    {
      label: `T+${inc.duration.includes("min") ? inc.duration.replace(/[^0-9]/g, "").padStart(2,"0") + ":00" : "05:00"}`,
      title: "Active Observation Period",
      desc: `${inc.witnesses > 1 ? `${inc.witnesses} witness${inc.witnesses > 1 ? "es" : ""}` : "Observer"} tracked object during ${inc.duration}. ${inc.videoId ? "FLIR/optical systems recorded continuous footage." : "Attempted documentation with available equipment."}`,
    },
    {
      label: "T+DEPART",
      title: "Object Departure / Loss of Track",
      desc: inc.radarConfirmed
        ? "Object accelerated beyond sensor tracking capability. Final radar return confirmed departure heading. No landing detected."
        : "Object departed at high speed or vanished instantaneously. No aircraft debris or physical trace recovered at site.",
    },
    {
      label: inc.date,
      title: "Incident Report Filed",
      desc: `Official incident report filed with ${inc.source.split(" / ")[0]}. ${inc.military ? "Classified at appropriate level per DoD protocols." : "NUFORC and relevant civil aviation authorities notified."}`,
    },
    {
      label: `${Math.min(parseInt(year) + 5, 2024)}-XX-XX`,
      title: tags_public_release(inc),
      desc: tags_public_desc(inc),
    },
  ]
  return steps
}

function tags_public_release(inc: typeof INCIDENTS[0]) {
  if (inc.tags.includes("Declassified")) return "Declassification & Public Release"
  if (inc.source.includes("AARO"))       return "AARO Database Entry"
  if (inc.source.includes("FOIA"))       return "FOIA Document Release"
  return "Public Record Acknowledgment"
}

function tags_public_desc(inc: typeof INCIDENTS[0]) {
  if (inc.tags.includes("Declassified"))
    return `Records formally declassified and released to the public. Incident now part of official government UAP archive reviewed by Congress.`
  if (inc.source.includes("AARO"))
    return `Case entered into AARO's all-domain anomaly tracking system. Included in congressional reporting per NDAA requirements.`
  return `Incident records obtained through FOIA request or official acknowledgment. Case remains open in government UAP investigation files.`
}

// ─── sub-components ─────────────────────────────────────────────────────────

const SECTION_HEADER: React.CSSProperties = {
  fontSize: 10,
  color: "#06b6d4",
  letterSpacing: "0.3em",
  fontWeight: 700,
  marginBottom: 16,
  textTransform: "uppercase" as const,
}

const CARD: React.CSSProperties = {
  background: "rgba(15,25,50,0.6)",
  border: "1px solid rgba(6,182,212,0.15)",
  borderRadius: 10,
  padding: "16px 18px",
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ ...CARD, padding: "14px 16px" }}>
      <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.2em", marginBottom: 6, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>
        {value}
      </div>
    </div>
  )
}

function CredBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(Math.round((value / max) * 100), 100)
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 10 }}>
        <span style={{ color: "#94a3b8" }}>{label}</span>
        <span style={{ color: "#06b6d4", fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: "linear-gradient(90deg, #06b6d4, #0891b2)",
          boxShadow: "0 0 8px #06b6d4",
          borderRadius: 2,
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  )
}

// ─── tab content ─────────────────────────────────────────────────────────────

function OverviewTab({ inc }: { inc: typeof INCIDENTS[0] }) {
  const c = inc.credibility
  const credMetrics = [
    { label: "Witness Reliability", value: Math.round(c * 0.95) },
    { label: "Physical Evidence",   value: inc.radarConfirmed ? Math.round(c * 0.7) : 0 },
    { label: "Radar Confirmation",  value: inc.radarConfirmed ? c : 20 },
    { label: "Video Evidence",      value: inc.videoId ? 90 : 0 },
    { label: "Official Source",
      value: (inc.source.includes("Pentagon") || inc.source.includes("AARO") || inc.source.includes("FAA")) ? 85 : 60 },
  ]
  const altClass = c < 90 ? `Atmospheric Phenomenon (${100 - c}% confidence)` : null

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
      {/* Left */}
      <div>
        <div style={SECTION_HEADER}>Case Overview</div>
        <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.8, marginBottom: 28, ...CARD }}>
          {inc.description}
        </p>

        <div style={SECTION_HEADER}>Key Intelligence Facts</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
          <StatCard label="Date"           value={inc.date} />
          <StatCard label="Location"       value={inc.location.split(",")[0]} />
          <StatCard label="Duration"       value={inc.duration} />
          <StatCard label="Witnesses"
            value={inc.witnesses > 999 ? `${Math.round(inc.witnesses/1000)}k+` : inc.witnesses === 0 ? "N/A" : String(inc.witnesses)} />
          <StatCard label="Shape"          value={inc.shape} />
          <StatCard label="Military"       value={inc.military ? "Yes" : "No"} />
          <StatCard label="Radar Confirmed" value={inc.radarConfirmed ? "Yes" : "No"} />
          <StatCard label="Source"         value={inc.source.split(" / ")[0]} />
        </div>
      </div>

      {/* Right */}
      <div>
        <div style={SECTION_HEADER}>Credibility Breakdown</div>
        <div style={{ ...CARD, marginBottom: 20 }}>
          {credMetrics.map(m => (
            <CredBar key={m.label} label={m.label} value={m.value} />
          ))}
        </div>

        <div style={SECTION_HEADER}>Classification Analysis</div>
        <div style={CARD}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.15em", marginBottom: 4 }}>PRIMARY</div>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: classificationColor(inc.classification),
              background: `${classificationColor(inc.classification)}18`,
              border: `1px solid ${classificationColor(inc.classification)}40`,
              padding: "3px 10px", borderRadius: 4,
            }}>
              {inc.classification.toUpperCase()}
            </span>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6 }}>
              Confidence: {inc.credibility}%
            </div>
          </div>
          {altClass && (
            <div>
              <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.15em", marginBottom: 4 }}>ALTERNATIVE</div>
              <div style={{ fontSize: 11, color: "#f59e0b" }}>{altClass}</div>
            </div>
          )}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(6,182,212,0.1)", fontSize: 10, color: "#64748b" }}>
            Based on {inc.source}
          </div>
        </div>
      </div>
    </div>
  )
}

function EvidenceTab({ inc }: { inc: typeof INCIDENTS[0] }) {
  const physicalEvidence: { icon: string; title: string; status: string; statusColor: string }[] = []
  if (inc.radarConfirmed)  physicalEvidence.push({ icon: "◎", title: "Radar Track Data",          status: "CONFIRMED",    statusColor: "#00ff88" })
  if (inc.military)        physicalEvidence.push({ icon: "⊡", title: "Official Military Report",   status: "DECLASSIFIED", statusColor: "#06b6d4" })
  if (inc.videoId)         physicalEvidence.push({ icon: "▶", title: "Video Footage",              status: "AUTHENTICATED",statusColor: "#a78bfa" })
  if (inc.witnesses > 10)  physicalEvidence.push({ icon: "◈", title: `Witness Testimonies (${inc.witnesses})`, status: "ON RECORD", statusColor: "#f59e0b" })
  physicalEvidence.push({ icon: "◉", title: "Incident Report",              status: "FILED",        statusColor: "#94a3b8" })

  return (
    <div>
      {/* Video */}
      {inc.videoId && (
        <div style={{ marginBottom: 32 }}>
          <div style={SECTION_HEADER}>Official Footage</div>
          <div style={{
            position: "relative",
            paddingTop: "56.25%",
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid rgba(6,182,212,0.2)",
            marginBottom: 12,
          }}>
            <iframe
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              src={`https://www.youtube-nocookie.com/embed/${inc.videoId}?rel=0&modestbranding=1&enablejsapi=1`}
              title={inc.videoTitle || inc.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
          {inc.videoTitle && (
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{inc.videoTitle}</span>
              {inc.videoSource && <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>{inc.videoSource}</div>}
            </div>
          )}
        </div>
      )}

      {/* Physical Evidence Grid */}
      <div style={SECTION_HEADER}>Physical Evidence Catalog</div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 14,
        marginBottom: 32,
      }}>
        {physicalEvidence.map((e, i) => (
          <div key={i} style={{ ...CARD, display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 20, color: "#06b6d4", flexShrink: 0, marginTop: 2 }}>{e.icon}</span>
            <div>
              <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600, marginBottom: 6 }}>{e.title}</div>
              <span style={{
                fontSize: 8, fontWeight: 700, letterSpacing: "0.15em",
                color: e.statusColor,
                background: `${e.statusColor}18`,
                border: `1px solid ${e.statusColor}40`,
                padding: "2px 8px", borderRadius: 3,
              }}>
                {e.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Official Sources */}
      <div style={SECTION_HEADER}>Official Source Record</div>
      <div style={CARD}>
        {inc.source.split(" / ").map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 0",
            borderBottom: i < inc.source.split(" / ").length - 1 ? "1px solid rgba(6,182,212,0.08)" : "none",
          }}>
            <span style={{ color: "#06b6d4", fontSize: 12 }}>⊛</span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{s}</span>
            <span style={{
              marginLeft: "auto",
              fontSize: 8, color: "#00ff88",
              background: "rgba(0,255,136,0.08)",
              border: "1px solid rgba(0,255,136,0.25)",
              padding: "2px 8px", borderRadius: 3,
              letterSpacing: "0.12em",
            }}>
              VERIFIED
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AIAnalysisTab({ inc }: { inc: typeof INCIDENTS[0] }) {
  const anomalyScores = getAnomalyScores(inc as any)
  const c = inc.credibility

  const classConfidence = [
    { name: "Unexplained UAP",      pct: c },
    { name: "Advanced Drone",       pct: Math.round(100 - c * 0.6) },
    { name: "Atmospheric",          pct: !inc.radarConfirmed ? 30 : 10 },
    { name: "Classified Military",  pct: inc.military ? 25 : 5 },
    { name: "Sensor Artifact",      pct: 5 },
  ]

  const nuforcCount = Math.round(79621 * (c / 100) * 0.08)
  const patterns    = getPatternAnalysis(inc)

  return (
    <div>
      {/* Radar chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
        <div style={CARD}>
          <div style={SECTION_HEADER}>Behavioral Anomaly Profile</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={anomalyScores}>
              <PolarGrid stroke="rgba(6,182,212,0.15)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#64748b", fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "#475569", fontSize: 8 }}
              />
              <Radar
                name="Score"
                dataKey="A"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{ background: "#0f1932", border: "1px solid rgba(6,182,212,0.25)", borderRadius: 6, fontSize: 11 }}
                labelStyle={{ color: "#06b6d4" }}
                itemStyle={{ color: "#e2e8f0" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div style={CARD}>
          <div style={SECTION_HEADER}>Classification Confidence</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={classConfidence} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#475569", fontSize: 9 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} width={120} />
              <Tooltip
                contentStyle={{ background: "#0f1932", border: "1px solid rgba(6,182,212,0.25)", borderRadius: 6, fontSize: 11 }}
                labelStyle={{ color: "#06b6d4" }}
                itemStyle={{ color: "#e2e8f0" }}
                formatter={(v) => [`${v}%`, "Confidence"]}
              />
              <Bar dataKey="pct" fill="#06b6d4" fillOpacity={0.7} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pattern Analysis */}
      <div style={SECTION_HEADER}>Pattern Analysis</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
        {[
          { key: "FLIGHT PATTERN",  text: patterns.flight },
          { key: "PROPULSION",      text: patterns.propulsion },
          { key: "RADAR SIGNATURE", text: patterns.signature },
          { key: "BEHAVIOR",        text: patterns.behavior },
        ].map(p => (
          <div key={p.key} style={{ ...CARD }}>
            <div style={{ fontSize: 9, color: "#06b6d4", letterSpacing: "0.25em", marginBottom: 8, fontWeight: 700 }}>
              {p.key}
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
              {p.text}
            </p>
          </div>
        ))}
      </div>

      {/* NUFORC */}
      <div style={SECTION_HEADER}>NUFORC Database Correlation</div>
      <div style={CARD}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#06b6d4" }}>{nuforcCount.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            similar cases found in NUFORC database<br/>
            <span style={{ color: "#64748b", fontSize: 10 }}>Total corpus: 79,621 records · 1940–2024</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div style={{ background: "rgba(2,8,23,0.5)", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.18em", marginBottom: 4 }}>SHAPE MATCH</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>
              {Math.round(c * 0.72)}%
            </div>
          </div>
          <div style={{ background: "rgba(2,8,23,0.5)", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.18em", marginBottom: 4 }}>YEAR RANGE</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>
              {parseInt(inc.date.split("-")[0]) - 3}–{Math.min(parseInt(inc.date.split("-")[0]) + 8, 2024)}
            </div>
          </div>
          <div style={{ background: "rgba(2,8,23,0.5)", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.18em", marginBottom: 4 }}>GEO CLUSTERING</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>
              {inc.country === "USA" ? "HIGH" : "MED"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SimilarCasesTab({ inc }: { inc: typeof INCIDENTS[0] }) {
  const similar = INCIDENTS.filter(i => {
    if (i.id === inc.id) return false
    const sameShape   = i.shape.split(" ")[0] === inc.shape.split(" ")[0]
    const sameCountry = i.country === inc.country
    const sameMil     = i.military === inc.military
    return sameShape || sameCountry || sameMil
  }).slice(0, 5)

  return (
    <div>
      <div style={SECTION_HEADER}>Related Incidents</div>
      <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
        Incidents sharing shape class, geographic region, or operational context.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {similar.map(s => (
          <div key={s.id} style={{ ...CARD, position: "relative" }}>
            <div style={{ fontSize: 8, color: "rgba(6,182,212,0.6)", letterSpacing: "0.2em", marginBottom: 4 }}>
              {s.id} · {s.date}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 8, lineHeight: 1.3 }}>
              {s.title}
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 10 }}>{s.location}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{
                fontSize: 8, fontWeight: 700, letterSpacing: "0.12em",
                color: classificationColor(s.classification),
                background: `${classificationColor(s.classification)}18`,
                border: `1px solid ${classificationColor(s.classification)}40`,
                padding: "2px 8px", borderRadius: 3,
              }}>
                {s.classification.toUpperCase()}
              </span>
              <span style={{ fontSize: 10, color: "#06b6d4", fontWeight: 700, marginLeft: "auto" }}>
                {s.credibility}%
              </span>
            </div>
            <Link href={`/cases/${s.id}`} style={{
              display: "block",
              padding: "7px 0",
              color: "#06b6d4",
              fontSize: 10,
              letterSpacing: "0.15em",
              borderTop: "1px solid rgba(6,182,212,0.15)",
              textDecoration: "none",
              fontWeight: 700,
            }}>
              VIEW CASE →
            </Link>
          </div>
        ))}
      </div>
      {similar.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b", fontSize: 13 }}>
          No closely related cases found in database.
        </div>
      )}
    </div>
  )
}

function TimelineTab({ inc }: { inc: typeof INCIDENTS[0] }) {
  const steps = getTimelineSteps(inc)
  return (
    <div>
      <div style={SECTION_HEADER}>Incident Timeline</div>
      <div style={{ position: "relative", paddingLeft: 32 }}>
        {/* vertical line */}
        <div style={{
          position: "absolute",
          left: 7,
          top: 0,
          bottom: 0,
          width: 2,
          background: "linear-gradient(180deg, #06b6d4, rgba(6,182,212,0.1))",
        }} />

        {steps.map((step, i) => (
          <div key={i} style={{ position: "relative", marginBottom: i < steps.length - 1 ? 36 : 0 }}>
            {/* dot */}
            <div style={{
              position: "absolute",
              left: -29,
              top: 4,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: i === 0 ? "#06b6d4" : "rgba(6,182,212,0.3)",
              border: "2px solid #06b6d4",
              boxShadow: i === 0 ? "0 0 10px #06b6d4" : "none",
            }} />

            <div style={{ ...CARD }}>
              <div style={{ fontSize: 9, color: "#06b6d4", letterSpacing: "0.2em", marginBottom: 4, fontWeight: 700 }}>
                {step.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>
                {step.title}
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

const TABS = ["OVERVIEW", "EVIDENCE", "AI ANALYSIS", "SIMILAR CASES", "TIMELINE"] as const
type Tab = typeof TABS[number]

export default function CaseDetailPage() {
  const params  = useParams()
  const router  = useRouter()
  const [tab, setTab] = useState<Tab>("OVERVIEW")

  function navToApp(view: string) {
    localStorage.setItem("argus_last_view", view)
    router.push("/")
  }

  function goBack() {
    const last = localStorage.getItem("argus_last_view") || "score"
    navToApp(last)
  }

  const id  = typeof params.id === "string" ? params.id : ""
  const inc = INCIDENTS.find(i => i.id === id)

  if (!inc) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#020817" }}>
        <Sidebar apiKey="" onApiKey={() => {}} activeView="cases" onNav={navToApp} />
        <main style={{
          marginLeft: 220, flex: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 16,
        }}>
          <div style={{ fontSize: 48, color: "rgba(6,182,212,0.3)" }}>◎</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#e2e8f0", letterSpacing: "0.05em" }}>
            CASE NOT FOUND
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            Incident ID <code style={{ color: "#06b6d4" }}>{id}</code> does not exist in the database.
          </div>
          <button
            onClick={goBack}
            style={{
              marginTop: 12,
              padding: "10px 24px",
              border: "1px solid rgba(6,182,212,0.4)",
              background: "rgba(6,182,212,0.08)",
              color: "#06b6d4",
              fontSize: 11,
              letterSpacing: "0.15em",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ← BACK TO PLATFORM
          </button>
        </main>
      </div>
    )
  }

  const clsColor = classificationColor(inc.classification)
  const credColor = inc.credibility >= 90 ? "#00ff88" : inc.credibility >= 75 ? "#06b6d4" : "#f59e0b"

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#020817" }}>
      <Sidebar apiKey="" onApiKey={() => {}} activeView="cases" onNav={navToApp} />

      <main style={{ marginLeft: 220, flex: 1, minWidth: 0 }}>
        {/* ── Header bar ── */}
        <div style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(2,8,23,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(6,182,212,0.2)",
          padding: "14px 28px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {/* Back */}
            <button
              onClick={goBack}
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                fontSize: 11,
                letterSpacing: "0.12em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 0",
                fontFamily: "inherit",
                flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#06b6d4"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#64748b"}
            >
              ← BACK TO PLATFORM
            </button>

            <div style={{ width: 1, height: 18, background: "rgba(6,182,212,0.2)" }} />

            {/* ID badge */}
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: "#06b6d4",
              background: "rgba(6,182,212,0.1)",
              border: "1px solid rgba(6,182,212,0.35)",
              padding: "3px 10px", borderRadius: 4,
              letterSpacing: "0.12em",
              flexShrink: 0,
            }}>
              {inc.id}
            </span>

            {/* Title */}
            <h1 style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#e2e8f0",
              letterSpacing: "-0.01em",
              margin: 0,
              flex: 1,
              minWidth: 200,
            }}>
              {inc.title}
            </h1>

            {/* Classification badge */}
            <span style={{
              fontSize: 9, fontWeight: 700,
              color: clsColor,
              background: `${clsColor}18`,
              border: `1px solid ${clsColor}40`,
              padding: "3px 10px", borderRadius: 4,
              letterSpacing: "0.12em",
              flexShrink: 0,
            }}>
              {inc.classification.toUpperCase()}
            </span>

            {/* Credibility */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: credColor, lineHeight: 1 }}>
                {inc.credibility}%
              </div>
              <div style={{ fontSize: 8, color: "#64748b", letterSpacing: "0.2em", marginTop: 2 }}>
                CREDIBILITY INDEX
              </div>
            </div>
          </div>

          {/* Tags */}
          {inc.tags.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {inc.tags.map(t => (
                <span key={t} style={{
                  fontSize: 8,
                  color: "#64748b",
                  background: "rgba(100,116,139,0.08)",
                  border: "1px solid rgba(100,116,139,0.2)",
                  padding: "2px 8px",
                  borderRadius: 3,
                  letterSpacing: "0.1em",
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Tab bar ── */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid rgba(6,182,212,0.1)",
          background: "rgba(2,8,23,0.8)",
          padding: "0 28px",
          gap: 4,
        }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: "none",
                border: "none",
                borderBottom: t === tab ? "2px solid #06b6d4" : "2px solid transparent",
                color: t === tab ? "#e2e8f0" : "#64748b",
                fontSize: 10,
                letterSpacing: "0.15em",
                fontWeight: t === tab ? 700 : 400,
                padding: "14px 16px",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => { if (t !== tab) (e.currentTarget as HTMLElement).style.color = "#94a3b8" }}
              onMouseLeave={e => { if (t !== tab) (e.currentTarget as HTMLElement).style.color = "#64748b" }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div style={{ padding: "28px 28px 60px", maxWidth: 1300 }}>
          {tab === "OVERVIEW"      && <OverviewTab      inc={inc} />}
          {tab === "EVIDENCE"      && <EvidenceTab      inc={inc} />}
          {tab === "AI ANALYSIS"   && <AIAnalysisTab    inc={inc} />}
          {tab === "SIMILAR CASES" && <SimilarCasesTab  inc={inc} />}
          {tab === "TIMELINE"      && <TimelineTab      inc={inc} />}
        </div>
      </main>
    </div>
  )
}
