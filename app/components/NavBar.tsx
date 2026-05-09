"use client"
import { useState, useEffect } from "react"
import { Key, Menu, X } from "lucide-react"

const NAV_LINKS = [
  { label: "MAP",        href: "#map" },
  { label: "VIDEOS",     href: "#videos" },
  { label: "TIMELINE",   href: "#timeline" },
  { label: "CASES",      href: "#cases" },
  { label: "INSIGHTS",   href: "#insights" },
  { label: "RESEARCH",   href: "#research", highlight: true },
  { label: "AI ANALYST", href: "#ai" },
  { label: "SOURCES",    href: "#sources" },
]

export default function NavBar({ apiKey, onApiKey }: { apiKey: string; onApiKey: (k: string) => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [keyDraft, setKeyDraft] = useState("")

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  function scrollTo(href: string) {
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  function saveKey() {
    if (keyDraft.trim()) {
      onApiKey(keyDraft.trim())
      setKeyDraft("")
      setShowKeyInput(false)
    }
  }

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9000,
          background: scrolled ? "rgba(2,8,23,0.97)" : "rgba(2,8,23,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(6,182,212,0.18)",
          boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.5)" : "none",
          transition: "background 0.3s, box-shadow 0.3s",
        }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 56 }}>
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              border: "1.5px solid rgba(6,182,212,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "conic-gradient(from 0deg, transparent 60%, rgba(6,182,212,0.4) 70%, transparent 80%)",
                animation: "radar-sweep 4s linear infinite",
              }} />
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#06b6d4", boxShadow: "0 0 8px #06b6d4" }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#06b6d4", letterSpacing: "0.2em", lineHeight: 1 }}>SENTINEL</div>
              <div style={{ fontSize: 8, color: "rgba(6,182,212,0.5)", letterSpacing: "0.15em" }}>UAP INTELLIGENCE</div>
            </div>
          </button>

          {/* Desktop Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: "auto", marginRight: 16 }} className="hidden-mobile">
            {NAV_LINKS.map(link => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                style={{
                  background: link.highlight ? "rgba(0,255,136,0.07)" : "none",
                  border: link.highlight ? "1px solid rgba(0,255,136,0.25)" : "none",
                  cursor: "pointer",
                  padding: "5px 12px", borderRadius: 4,
                  fontSize: 10, letterSpacing: "0.15em",
                  color: link.highlight ? "#00ff88" : "rgba(148,163,184,0.8)",
                  transition: "color 0.2s, background 0.2s, border-color 0.2s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.color = link.highlight ? "#00ff88" : "#06b6d4"
                  el.style.background = link.highlight ? "rgba(0,255,136,0.15)" : "rgba(6,182,212,0.08)"
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.color = link.highlight ? "#00ff88" : "rgba(148,163,184,0.8)"
                  el.style.background = link.highlight ? "rgba(0,255,136,0.07)" : "none"
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* API Key Button */}
          <button
            onClick={() => setShowKeyInput(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 6,
              border: apiKey ? "1px solid rgba(0,255,136,0.4)" : "1px solid rgba(6,182,212,0.3)",
              background: apiKey ? "rgba(0,255,136,0.08)" : "rgba(6,182,212,0.06)",
              color: apiKey ? "#00ff88" : "#06b6d4",
              fontSize: 10, letterSpacing: "0.12em", cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Key style={{ width: 12, height: 12 }} />
            {apiKey ? "KEY ACTIVE" : "SET API KEY"}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            style={{
              display: "none", background: "none", border: "none",
              color: "#64748b", cursor: "pointer", padding: 6, marginLeft: 8,
            }}
            className="show-mobile"
          >
            {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
          </button>
        </div>

        {/* API Key input dropdown */}
        {showKeyInput && (
          <div style={{
            borderTop: "1px solid rgba(6,182,212,0.15)",
            padding: "12px 24px",
            background: "rgba(10,22,40,0.98)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <input
              autoFocus
              value={keyDraft}
              onChange={e => setKeyDraft(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveKey()}
              placeholder="Paste OpenAI API key (sk-...)"
              style={{
                flex: 1, maxWidth: 460,
                background: "rgba(15,32,64,0.8)",
                border: "1px solid rgba(6,182,212,0.3)",
                borderRadius: 6, padding: "8px 14px",
                color: "#e2e8f0", fontSize: 12, outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={saveKey}
              style={{
                padding: "8px 18px", borderRadius: 6,
                background: "#06b6d4", color: "#020817",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                border: "none", cursor: "pointer",
              }}
            >
              SAVE
            </button>
            {apiKey && (
              <button
                onClick={() => { onApiKey(""); setShowKeyInput(false) }}
                style={{
                  padding: "8px 14px", borderRadius: 6,
                  background: "transparent", color: "#64748b",
                  fontSize: 11, letterSpacing: "0.1em",
                  border: "1px solid rgba(100,116,139,0.3)", cursor: "pointer",
                }}
              >
                CLEAR
              </button>
            )}
          </div>
        )}

        {/* Mobile Nav */}
        {mobileOpen && (
          <div style={{
            borderTop: "1px solid rgba(6,182,212,0.15)",
            padding: "8px 0",
            background: "rgba(10,22,40,0.98)",
          }}>
            {NAV_LINKS.map(link => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "12px 24px", background: "none", border: "none",
                  color: "#94a3b8", fontSize: 11, letterSpacing: "0.15em",
                  cursor: "pointer",
                }}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </>
  )
}
