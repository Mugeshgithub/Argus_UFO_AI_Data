"use client"
import { useState, useEffect } from "react"
import { Brain, Database, Search, GitBranch, BarChart2, Globe, ArrowRight, Shield, Radar, AlertTriangle } from "lucide-react"

const STEPS = [
  {
    n: "01",
    icon: Database,
    title: "COLLECT",
    subtitle: "Raw Intelligence Ingestion",
    desc: "Pentagon files, pilot reports, radar logs, NASA records, and 79,621 public sightings — all funneled into a single structured database.",
    color: "#06b6d4",
  },
  {
    n: "02",
    icon: Brain,
    title: "EXTRACT",
    subtitle: "AI Converts Chaos → Structure",
    desc: "Natural language AI reads unstructured reports and extracts shape, speed, movement, location, military involvement, and credibility signals.",
    color: "#a78bfa",
  },
  {
    n: "03",
    icon: Search,
    title: "ANALYZE",
    subtitle: "Pattern Detection at Scale",
    desc: "AI identifies recurring behaviors, geographic clusters, time-based spikes, and anomalies no human analyst could find across millions of data points.",
    color: "#00ff88",
  },
  {
    n: "04",
    icon: GitBranch,
    title: "CLUSTER",
    subtitle: "Hidden Connections Surface",
    desc: "Reports from different countries, decades apart, describing identical behaviors are linked. Embeddings find what keyword search misses.",
    color: "#f59e0b",
  },
  {
    n: "05",
    icon: Shield,
    title: "SCORE",
    subtitle: "Credibility Quantification",
    desc: "Every case is scored against radar confirmation, pilot involvement, witness count, military verification, and physical evidence consistency.",
    color: "#ef4444",
  },
  {
    n: "06",
    icon: BarChart2,
    title: "VISUALIZE",
    subtitle: "Intelligence Made Actionable",
    desc: "Global heatmaps, live anomaly feeds, similarity analysis, and AI case summaries — the war-room experience of a defense intelligence platform.",
    color: "#06b6d4",
  },
]

const PILLARS = [
  { icon: Globe,         label: "Global Coverage",    value: "40 Countries",    color: "#06b6d4" },
  { icon: Database,      label: "Reports Analyzed",   value: "79,621",          color: "#00ff88" },
  { icon: AlertTriangle, label: "Cases Unexplained",  value: "74.3%",           color: "#ef4444" },
  { icon: Radar,         label: "Active Monitoring",  value: "24 / 7",          color: "#f59e0b" },
]

interface Props { onEnter: () => void }

export default function LandingView({ onEnter }: Props) {
  const [activeStep, setActiveStep] = useState(0)
  const [tick, setTick] = useState(0)

  // Auto-advance the step highlight
  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % STEPS.length), 2200)
    return () => clearInterval(t)
  }, [])

  // Blinking cursor tick
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 600)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      height: "100vh",
      overflowY: "auto",
      background: "#020817",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 32px 60px",
    }}>

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: 1100, display: "flex", alignItems: "center", padding: "20px 0", borderBottom: "1px solid rgba(6,182,212,0.1)", marginBottom: 60, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(6,182,212,0.6)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg, transparent 60%, rgba(6,182,212,0.5) 70%, transparent 80%)", animation: "radar-sweep 3s linear infinite" }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#06b6d4", boxShadow: "0 0 8px #06b6d4" }} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#06b6d4", letterSpacing: "0.25em" }}>ARGUS</div>
            <div style={{ fontSize: 8, color: "rgba(6,182,212,0.45)", letterSpacing: "0.15em" }}>AI ANOMALY INTELLIGENCE</div>
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 8px #00ff88", animation: "blink 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 9, color: "#00ff88", letterSpacing: "0.2em" }}>SYSTEM ONLINE</span>
          </div>
          <button
            onClick={onEnter}
            style={{ fontSize: 9, color: "#06b6d4", letterSpacing: "0.15em", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 5, padding: "5px 14px", cursor: "pointer" }}
          >
            ENTER PLATFORM →
          </button>
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: 1100, marginBottom: 64 }}>
        {/* Terminal-style label */}
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.3em", marginBottom: 20, fontFamily: "monospace" }}>
          {`> INITIALIZING INTELLIGENCE SYSTEM`}
          <span style={{ opacity: tick % 2 === 0 ? 1 : 0 }}>█</span>
        </div>

        <h1 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 800, color: "#e2e8f0", lineHeight: 1.1, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
          Not a UFO blog.<br />
          <span style={{ color: "#06b6d4" }}>An AI investigation system.</span>
        </h1>

        <p style={{ fontSize: "clamp(13px, 1.5vw, 17px)", color: "#64748b", lineHeight: 1.7, maxWidth: 640, margin: "0 0 32px" }}>
          ARGUS collects thousands of unstructured anomaly reports — Pentagon files, pilot testimonies, radar logs, NASA records — and uses AI to find the patterns humans miss at scale.
        </p>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={onEnter}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 8,
              background: "#06b6d4", color: "#020817",
              fontSize: 12, fontWeight: 800, letterSpacing: "0.15em",
              border: "none", cursor: "pointer",
              boxShadow: "0 0 32px rgba(6,182,212,0.35)",
              transition: "all 0.2s",
            }}
          >
            ENTER PLATFORM <ArrowRight style={{ width: 14, height: 14 }} />
          </button>
          <span style={{ fontSize: 10, color: "#334155", letterSpacing: "0.1em" }}>
            79,621 real reports · 12 verified cases · Live AI analysis
          </span>
        </div>
      </div>

      {/* ── Pillars ─────────────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: 1100, display: "flex", gap: 12, marginBottom: 64, flexWrap: "wrap" }}>
        {PILLARS.map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ flex: "1 1 180px", background: "rgba(15,25,50,0.6)", border: `1px solid ${color}20`, borderRadius: 8, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#e2e8f0", lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 9, color: "#475569", letterSpacing: "0.15em", marginTop: 4 }}>{label.toUpperCase()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── How it works ────────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: 1100, marginBottom: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <span style={{ fontSize: 10, color: "#06b6d4", letterSpacing: "0.3em" }}>HOW THE SYSTEM WORKS</span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(6,182,212,0.3), transparent)" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const active = activeStep === i
            return (
              <div
                key={step.n}
                onClick={() => setActiveStep(i)}
                style={{
                  background: active ? `${step.color}08` : "rgba(15,25,50,0.5)",
                  border: `1px solid ${active ? step.color + "40" : "rgba(6,182,212,0.1)"}`,
                  borderRadius: 10,
                  padding: "20px 22px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Active glow line */}
                {active && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${step.color}, transparent)` }} />
                )}

                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: `${step.color}18`, border: `1px solid ${step.color}35`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 18, height: 18, color: step.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 8, color: step.color, letterSpacing: "0.2em", fontFamily: "monospace", opacity: 0.7 }}>{step.n}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: active ? "#e2e8f0" : "#94a3b8", letterSpacing: "0.1em" }}>{step.title}</span>
                    </div>
                    <div style={{ fontSize: 10, color: step.color, letterSpacing: "0.1em", marginBottom: 8, opacity: 0.8 }}>{step.subtitle}</div>
                    <p style={{ fontSize: 11, color: active ? "#94a3b8" : "#475569", lineHeight: 1.6, margin: 0, transition: "color 0.3s" }}>{step.desc}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Philosophy ──────────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: 1100, marginBottom: 64 }}>
        <div style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 12, padding: "32px 36px", display: "flex", gap: 48, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 280px" }}>
            <div style={{ fontSize: 10, color: "#06b6d4", letterSpacing: "0.3em", marginBottom: 14 }}>THE CORE QUESTION</div>
            <p style={{ fontSize: "clamp(16px, 2vw, 22px)", fontWeight: 700, color: "#e2e8f0", lineHeight: 1.4, margin: "0 0 12px" }}>
              "What patterns emerge when AI analyzes unexplained aerial data at scale?"
            </p>
            <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7, margin: 0 }}>
              ARGUS is not trying to prove aliens exist. It is asking what happens when you apply rigorous AI analysis to data that humans have never been able to process fully.
            </p>
          </div>
          <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 10, color: "#06b6d4", letterSpacing: "0.3em", marginBottom: 2 }}>THINK OF IT AS</div>
            {[
              { label: "Palantir", desc: "Data intelligence & pattern analysis" },
              { label: "OpenAI",   desc: "Natural language processing of raw reports" },
              { label: "NASA",     desc: "Scientific rigor applied to anomaly data" },
            ].map(({ label, desc }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#00ff88", letterSpacing: "0.1em", width: 60, flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, height: 1, background: "rgba(6,182,212,0.15)" }} />
                <span style={{ fontSize: 10, color: "#475569" }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: 1100, textAlign: "center" }}>
        <div style={{ fontSize: 10, color: "#334155", letterSpacing: "0.3em", marginBottom: 16 }}>READY TO INVESTIGATE</div>
        <button
          onClick={onEnter}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 40px", borderRadius: 8,
            background: "transparent",
            border: "1px solid rgba(6,182,212,0.4)",
            color: "#06b6d4",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.2em",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(6,182,212,0.08)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(6,182,212,0.7)" }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(6,182,212,0.4)" }}
        >
          OPEN WAR ROOM <ArrowRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  )
}
