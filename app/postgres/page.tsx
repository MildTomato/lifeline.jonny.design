import type { Metadata } from "next"

import { TimelinePage } from "@/components/timeline-page"
import { postgresTimeline } from "@/lib/database-timelines"

export const metadata: Metadata = {
  title: "The PostgreSQL Timeline",
  description: postgresTimeline.description,
}

export default function PostgresTimelinePage() {
  return (
    <TimelinePage activeTimeline="postgres" timeline={postgresTimeline} />
  )
}
