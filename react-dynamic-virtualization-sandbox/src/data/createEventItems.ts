import type { SandboxItem } from "./types"

export type EventItem = SandboxItem & {
  timestamp: string
  severity: "WARN" | "INFO"
}

const latestEventTimestamp = Date.UTC(2026, 0, 1, 12)
const eventIntervalMilliseconds = 1_000
const warningEventInterval = 7
const eventTemplates = [
  "gateway · Request accepted",
  "worker · Task completed",
  "storage · Checkpoint saved",
]

export function createEventItems(count: number): EventItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    index,
    content: eventTemplates[index % eventTemplates.length],
    timestamp: new Date(latestEventTimestamp - index * eventIntervalMilliseconds).toISOString(),
    severity: index % warningEventInterval === 0 ? "WARN" : "INFO",
  }))
}
