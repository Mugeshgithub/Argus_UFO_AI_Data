"use client"
import AISection from "./AISection"

export default function AIView({ apiKey }: { apiKey: string }) {
  return (
    <div style={{ height: "100vh", overflow: "auto" }}>
      <AISection apiKey={apiKey} />
    </div>
  )
}
