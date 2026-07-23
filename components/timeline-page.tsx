import { Lifeline } from "@/components/lifeline"
import { TimelineSwitcher } from "@/components/timeline-switcher"
import { cn } from "@/lib/utils"
import type { LifelineRecord } from "@/lib/lifeline-data"
import type { DatabaseTimelineId } from "@/lib/database-timelines"

interface TimelinePageProps {
  activeTimeline: DatabaseTimelineId
  timeline: LifelineRecord
}

export function TimelinePage({
  activeTimeline,
  timeline,
}: TimelinePageProps) {
  const endYear =
    timeline.endYear ??
    Math.floor(timeline.markers.at(-1)?.year ?? timeline.birthYear)
  const endLabel = activeTimeline === "supabase" ? "Present" : endYear

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
        <h1 className="pointer-events-none absolute left-6 top-6 z-30 text-sm font-normal leading-5 tracking-[-0.01em] md:left-16 md:top-1/2 md:-translate-y-[20rem] lg:left-20 xl:left-24">
          <span className="text-foreground">{timeline.name}</span>
          <span className="text-muted-foreground">
            {` · ${timeline.birthYear}—${endLabel}`}
          </span>
        </h1>

        <div className="h-full px-6 pt-14 md:px-16 md:pt-0 lg:px-20 xl:px-24">
          <Lifeline
            key={timeline.slug}
            markers={timeline.markers}
            birthYear={timeline.birthYear}
            title={`${timeline.name} timeline`}
            axisLabel={activeTimeline === "supabase" ? "Year" : "Years"}
            periodAxisLabel={activeTimeline === "supabase" ? "Period" : undefined}
            className="h-full"
          />
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 md:bottom-auto md:top-1/2 md:translate-y-[19rem]">
          <div className="pointer-events-auto rounded-xl border border-border/80 bg-background/90 p-1 shadow-2xl backdrop-blur-xl">
            <TimelineSwitcher activeTimeline={activeTimeline} />
          </div>
        </div>
      </main>
    </div>
  )
}
