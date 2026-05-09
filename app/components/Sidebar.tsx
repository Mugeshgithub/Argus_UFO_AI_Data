"use client"
import { useState } from "react"
import { Key } from "lucide-react"

const NAV = [
  {
    section: null,
    items: [{ icon: "◎", label: "Mission Overview", view: "dashboard", desc: "" }],
  },
  {
    section: "INTELLIGENCE PIPELINE",
    items: [
      { icon: "01", label: "COLLECT",   view: "collect",  desc: "Data sources & ingestion" },
      { icon: "02", label: "EXTRACT",   view: "extract",  desc: "Raw → structured fields" },
      { icon: "03", label: "ANALYZE",   view: "research", desc: "Pattern detection" },
      { icon: "04", label: "CLUSTER",   view: "cluster",  desc: "Group by behavior" },
      { icon: "05", label: "SCORE",     view: "score",    desc: "Credibility ranking" },
      { icon: "06", label: "VISUALIZE", view: "map",      desc: "Global intelligence map" },
    ],
  },
  {
    section: "AI TOOLS",
    items: [
      { icon: "⊛", label: "AI Analyst",  view: "ai",       desc: "GPT-4o query engine" },
      { icon: "◈", label: "Insights",    view: "insights",  desc: "Key statistical findings" },
    ],
  },
  {
    section: "ARCHIVE",
    items: [
      { icon: "⚡", label: "Live Feed",  view: "livefeed" },
      { icon: "⊡", label: "Cases",      view: "cases" },
      { icon: "▶", label: "Videos",     view: "videos" },
      { icon: "◷", label: "Timeline",   view: "timeline" },
      { icon: "≡", label: "Sources",    view: "sources" },
    ],
  },
]

const PIPELINE_VIEWS = new Set(["collect","extract","research","cluster","score","map"])

interface SidebarProps {
  activeView: string
  onNav: (view: string) => void
  apiKey: string
  onApiKey: (k: string) => void
}

export default function Sidebar({ activeView, onNav, apiKey, onApiKey }: SidebarProps) {
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [keyDraft, setKeyDraft] = useState("")

  function saveKey() {
    if (keyDraft.trim()) {
      onApiKey(keyDraft.trim())
      setKeyDraft("")
      setShowKeyInput(false)
    }
  }

  const isPipelineItem = (view: string) => PIPELINE_VIEWS.has(view)

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: 220,
        zIndex: 8000,
        background: "rgba(2,8,23,0.98)",
        borderRight: "1px solid rgba(6,182,212,0.12)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <button
        onClick={() => onNav("landing")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "18px 16px 16px",
          background: "none",
          border: "none",
          borderBottom: "1px solid rgba(6,182,212,0.1)",
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
          flexShrink: 0,
        }}
      >
        {/* Radar icon */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "1.5px solid rgba(6,182,212,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "conic-gradient(from 0deg, transparent 60%, rgba(6,182,212,0.4) 70%, transparent 80%)",
              animation: "radar-sweep 4s linear infinite",
            }}
          />
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#06b6d4",
              boxShadow: "0 0 8px #06b6d4",
            }}
          />
        </div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#06b6d4",
              letterSpacing: "0.2em",
              lineHeight: 1,
            }}
          >
            ARGUS
          </div>
          <div
            style={{
              fontSize: 8,
              color: "rgba(6,182,212,0.5)",
              letterSpacing: "0.15em",
              marginTop: 3,
            }}
          >
            UAP INTELLIGENCE
          </div>
        </div>
      </button>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 0",
          scrollbarWidth: "none",
        }}
      >
        {NAV.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 4 }}>
            {/* Section label */}
            {group.section && (
              <div
                style={{
                  fontSize: 9,
                  color: "#475569",
                  letterSpacing: "0.25em",
                  padding: "10px 16px 4px",
                  fontWeight: 700,
                }}
              >
                {group.section}
              </div>
            )}

            {/* Items */}
            {group.items.map((item) => {
              const isActive = activeView === item.view
              const isPipeline = isPipelineItem(item.view) && group.section === "INTELLIGENCE PIPELINE"
              const hasDec = isPipeline && "desc" in item && !!(item as { desc?: string }).desc

              return (
                <button
                  key={item.view}
                  onClick={() => onNav(item.view)}
                  style={{
                    display: "flex",
                    alignItems: hasDec ? "flex-start" : "center",
                    gap: 10,
                    width: "100%",
                    padding: isPipeline ? "8px 14px 8px 12px" : "7px 16px",
                    background: isActive
                      ? (isPipeline ? "rgba(6,182,212,0.15)" : "rgba(6,182,212,0.12)")
                      : "none",
                    border: "none",
                    borderLeft: isActive
                      ? "3px solid #06b6d4"
                      : "3px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    color: isActive ? "#06b6d4" : "#64748b",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      const el = e.currentTarget
                      el.style.background = "rgba(6,182,212,0.06)"
                      el.style.color = "#94a3b8"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      const el = e.currentTarget
                      el.style.background = "none"
                      el.style.color = "#64748b"
                    }
                  }}
                >
                  {/* Icon / step badge */}
                  {isPipeline ? (
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 10,
                        fontWeight: 700,
                        width: 20,
                        textAlign: "center",
                        flexShrink: 0,
                        color: isActive ? "#06b6d4" : "#475569",
                        marginTop: hasDec ? 2 : 0,
                      }}
                    >
                      {item.icon}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 12,
                        width: 18,
                        textAlign: "center",
                        flexShrink: 0,
                        color: isActive ? "#06b6d4" : "#475569",
                      }}
                    >
                      {item.icon}
                    </span>
                  )}

                  {/* Label + desc */}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.08em",
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? "#06b6d4" : "inherit",
                      }}
                    >
                      {item.label}
                    </div>
                    {hasDec && (
                      <div
                        style={{
                          fontSize: 8,
                          color: isActive ? "rgba(6,182,212,0.6)" : "#334155",
                          letterSpacing: "0.05em",
                          marginTop: 2,
                          lineHeight: 1.3,
                        }}
                      >
                        {(item as { desc?: string }).desc}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom status + API key */}
      <div
        style={{
          borderTop: "1px solid rgba(6,182,212,0.1)",
          padding: "12px 16px",
          flexShrink: 0,
        }}
      >
        {/* System status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00ff88",
              boxShadow: "0 0 8px #00ff88",
              animation: "blink 2s ease-in-out infinite",
            }}
          />
          <span
            style={{ fontSize: 9, color: "#00ff88", letterSpacing: "0.2em" }}
          >
            OPERATIONAL
          </span>
          <span
            style={{ fontSize: 9, color: "#475569", marginLeft: "auto" }}
          >
            SYS OK
          </span>
        </div>

        {/* API Key button */}
        <button
          onClick={() => setShowKeyInput((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            width: "100%",
            padding: "7px 12px",
            borderRadius: 6,
            border: apiKey
              ? "1px solid rgba(0,255,136,0.35)"
              : "1px solid rgba(6,182,212,0.25)",
            background: apiKey
              ? "rgba(0,255,136,0.07)"
              : "rgba(6,182,212,0.05)",
            color: apiKey ? "#00ff88" : "#06b6d4",
            fontSize: 9,
            letterSpacing: "0.12em",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <Key style={{ width: 10, height: 10, flexShrink: 0 }} />
          {apiKey ? "API KEY ACTIVE" : "SET API KEY"}
          {apiKey && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 8,
                color: "rgba(0,255,136,0.6)",
              }}
            >
              ●
            </span>
          )}
        </button>

        {/* Inline key input */}
        {showKeyInput && (
          <div style={{ marginTop: 8 }}>
            <input
              autoFocus
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveKey()}
              placeholder="sk-..."
              style={{
                width: "100%",
                background: "rgba(15,32,64,0.9)",
                border: "1px solid rgba(6,182,212,0.3)",
                borderRadius: 6,
                padding: "7px 10px",
                color: "#e2e8f0",
                fontSize: 10,
                outline: "none",
                fontFamily: "inherit",
                marginBottom: 6,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={saveKey}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  borderRadius: 6,
                  background: "#06b6d4",
                  color: "#020817",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                SAVE
              </button>
              {apiKey && (
                <button
                  onClick={() => {
                    onApiKey("")
                    setShowKeyInput(false)
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: "transparent",
                    color: "#64748b",
                    fontSize: 9,
                    border: "1px solid rgba(100,116,139,0.25)",
                    cursor: "pointer",
                  }}
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
