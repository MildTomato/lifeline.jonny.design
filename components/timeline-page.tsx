import {
  TimelineView,
  type TimelineViewMode,
} from "@/components/timeline-view"
import { cn } from "@/lib/utils"
import type { LifelineRecord } from "@/lib/lifeline-data"
import type { DatabaseTimelineId } from "@/lib/database-timelines"
import type { PrintDimensions } from "@/lib/print-dimensions"
import type { StargazerPoint } from "@/lib/stargazer-data"

interface TimelinePageProps {
  activeTimeline: DatabaseTimelineId
  timeline: LifelineRecord
  initialViewMode?: TimelineViewMode
  initialPrintDimensions: PrintDimensions
  initialShowPrintGuides: boolean
  initialPrintBoardCount: number
  stargazerSeries?: StargazerPoint[]
}

export function TimelinePage({
  activeTimeline,
  timeline,
  initialViewMode,
  initialPrintDimensions,
  initialShowPrintGuides,
  initialPrintBoardCount,
  stargazerSeries,
}: TimelinePageProps) {
  return (
    <div
      className={cn(
        "timeline-canvas flex h-dvh flex-col overflow-hidden bg-background text-foreground antialiased transition-colors duration-500",
        activeTimeline === "postgres"
          ? "timeline-theme-postgres"
          : "timeline-theme-supabase",
      )}
    >
      <main className="relative min-h-0 flex-1 overflow-y-auto md:overflow-hidden">
        <TimelineView
          activeTimeline={activeTimeline}
          timeline={timeline}
          initialViewMode={initialViewMode}
          initialPrintDimensions={initialPrintDimensions}
          initialShowPrintGuides={initialShowPrintGuides}
          initialPrintBoardCount={initialPrintBoardCount}
          stargazerSeries={stargazerSeries}
        />
      </main>
    </div>
  )
}
