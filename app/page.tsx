"use client"
import { useState, useEffect } from "react"

import Sidebar from "./components/Sidebar"
import LandingView from "./components/LandingView"
import DashboardView from "./components/DashboardView"
import CasesView from "./components/CasesView"
import ResearchView from "./components/ResearchView"
import AIView from "./components/AIView"
import MapView from "./components/MapView"
import VideosView from "./components/VideosView"
import TimelineView from "./components/TimelineView"
import SourcesView from "./components/SourcesView"
import LiveFeedView from "./components/LiveFeedView"
import InsightsView from "./components/InsightsView"
import FloatingChat from "./components/FloatingChat"
import CollectView from "./components/CollectView"
import ExtractView from "./components/ExtractView"
import ClusterView from "./components/ClusterView"
import ScoreView from "./components/ScoreView"

export type ViewId =
  | "landing"
  | "dashboard"
  | "livefeed"
  | "cases"
  | "insights"
  | "ai"
  | "map"
  | "videos"
  | "timeline"
  | "research"
  | "sources"
  | "collect"
  | "extract"
  | "cluster"
  | "score"

export default function Home() {
  const [view, setView] = useState<ViewId>("landing")
  const [apiKey, setApiKey] = useState("")

  useEffect(() => {
    const savedKey  = localStorage.getItem("argus_api_key")
    const savedView = localStorage.getItem("argus_last_view") as ViewId | null
    if (savedKey)  setApiKey(savedKey)
    if (savedView && savedView !== "landing") setView(savedView)
  }, [])

  function handleApiKey(k: string) {
    setApiKey(k)
    if (k) localStorage.setItem("argus_api_key", k)
    else localStorage.removeItem("argus_api_key")
  }

  function handleNav(v: string) {
    const next = v as ViewId
    setView(next)
    if (next === "landing") localStorage.removeItem("argus_last_view")
    else localStorage.setItem("argus_last_view", next)
  }

  // Landing shows full-screen with no sidebar
  if (view === "landing") {
    return (
      <div style={{ background: "#020817", minHeight: "100vh" }}>
        <LandingView onEnter={() => setView("dashboard")} />
      </div>
    )
  }

  const views: Record<Exclude<ViewId, "landing">, React.ReactNode> = {
    dashboard: <DashboardView onNav={handleNav} apiKey={apiKey} />,
    livefeed:  <LiveFeedView />,
    cases:     <CasesView />,
    insights:  <InsightsView />,
    ai:        <AIView apiKey={apiKey} />,
    map:       <MapView />,
    videos:    <VideosView />,
    timeline:  <TimelineView />,
    research:  <ResearchView />,
    sources:   <SourcesView />,
    collect:   <CollectView onNav={handleNav} />,
    extract:   <ExtractView onNav={handleNav} />,
    cluster:   <ClusterView onNav={handleNav} />,
    score:     <ScoreView onNav={handleNav} />,
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#020817" }}>
      <Sidebar activeView={view} onNav={handleNav} apiKey={apiKey} onApiKey={handleApiKey} />
      <main style={{ marginLeft: 220, flex: 1, minWidth: 0, height: "100vh", overflow: "auto" }}>
        {views[view as Exclude<ViewId, "landing">]}
      </main>
      <FloatingChat apiKey={apiKey} />
    </div>
  )
}
