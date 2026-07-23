"use client"

import { useState } from "react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react"

import { Lifeline } from "@/components/lifeline"
import { PrintedTimelineWall } from "@/components/print-preview/printed-timeline-wall"
import { SegmentedControl } from "@/components/segmented-control"
import { ThemeToggle } from "@/components/theme-toggle"
import { TimelineSwitcher } from "@/components/timeline-switcher"
import type { DatabaseTimelineId } from "@/lib/database-timelines"
import type { LifelineRecord } from "@/lib/lifeline-data"
import {
  normalizePrintBoardCount,
  normalizePrintDimension,
  type PrintDimensions,
} from "@/lib/print-dimensions"
import { cn } from "@/lib/utils"

export type TimelineViewMode = "digital" | "print"

interface TimelineViewProps {
  activeTimeline: DatabaseTimelineId
  timeline: LifelineRecord
  initialViewMode?: TimelineViewMode
  initialPrintDimensions: PrintDimensions
  initialShowPrintGuides: boolean
  initialPrintBoardCount: number
}

const viewModes = [
  {
    value: "digital",
    label: "Digital",
    ariaLabel: "Show the digital timeline",
  },
  {
    value: "print",
    label: "Print",
    ariaLabel: "Show the timeline split across a straight printed wall",
  },
] satisfies {
  value: TimelineViewMode
  label: string
  ariaLabel: string
}[]

export function TimelineView({
  activeTimeline,
  timeline,
  initialViewMode = "digital",
  initialPrintDimensions,
  initialShowPrintGuides,
  initialPrintBoardCount,
}: TimelineViewProps) {
  const [viewMode, setViewMode] =
    useState<TimelineViewMode>(initialViewMode)
  const [printDimensions, setPrintDimensions] = useState(
    initialPrintDimensions,
  )
  const [showPrintGuides, setShowPrintGuides] = useState(
    initialShowPrintGuides,
  )
  const [printBoardCount, setPrintBoardCount] = useState(
    initialPrintBoardCount,
  )
  const shouldReduceMotion = useReducedMotion()
  const endYear =
    timeline.endYear ??
    Math.floor(timeline.markers.at(-1)?.year ?? timeline.birthYear)
  const endLabel = activeTimeline === "supabase" ? "Present" : endYear

  const changeViewMode = (nextViewMode: TimelineViewMode) => {
    setViewMode(nextViewMode)

    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set("view", nextViewMode)
    const query = searchParams.toString()
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`

    window.history.replaceState(window.history.state, "", nextUrl)
  }

  const changePrintDimension = (
    dimension: keyof PrintDimensions,
    value: number,
  ) => {
    const nextDimensions = {
      ...printDimensions,
      [dimension]: normalizePrintDimension(
        value,
        printDimensions[dimension],
      ),
    }
    const searchParams = new URLSearchParams(window.location.search)

    setPrintDimensions(nextDimensions)
    searchParams.set(
      "panelWidth",
      String(nextDimensions.panelWidthFeet),
    )
    searchParams.set(
      "trussHeight",
      String(nextDimensions.trussHeightFeet),
    )

    const query = searchParams.toString()
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`

    window.history.replaceState(window.history.state, "", nextUrl)
  }

  const changeShowPrintGuides = (showGuides: boolean) => {
    const searchParams = new URLSearchParams(window.location.search)

    setShowPrintGuides(showGuides)
    searchParams.set("guides", showGuides ? "on" : "off")

    const query = searchParams.toString()
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`

    window.history.replaceState(window.history.state, "", nextUrl)
  }

  const changePrintBoardCount = (boardCount: number) => {
    const nextBoardCount = normalizePrintBoardCount(
      boardCount,
      printBoardCount,
    )
    const searchParams = new URLSearchParams(window.location.search)

    setPrintBoardCount(nextBoardCount)
    searchParams.set("boards", String(nextBoardCount))

    const query = searchParams.toString()
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`

    window.history.replaceState(window.history.state, "", nextUrl)
  }

  return (
    <>
      <AnimatePresence initial={false}>
        {viewMode === "print" ? (
          <motion.div
            key="print-background"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-[var(--print-stage)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ) : null}
      </AnimatePresence>

      {viewMode === "digital" ? (
        <h1 className="pointer-events-none absolute left-6 top-6 z-30 text-sm font-normal leading-5 tracking-[-0.01em] md:left-16 md:top-1/2 md:-translate-y-[20rem] lg:left-20 xl:left-24">
          <span className="text-foreground">{timeline.name}</span>
          <span className="text-muted-foreground">
            {` · ${timeline.birthYear}—${endLabel}`}
          </span>
        </h1>
      ) : null}

      <div
        className={cn(
          "relative z-10 h-full min-h-0",
          viewMode === "digital"
            ? "px-6 pt-14 md:px-16 md:pt-0 lg:px-20 xl:px-24"
            : "px-0 pt-14 md:pt-0",
        )}
      >
        {viewMode === "digital" ? (
          <Lifeline
            key={timeline.slug}
            markers={timeline.markers}
            birthYear={timeline.birthYear}
            title={`${timeline.name} timeline`}
            axisLabel={activeTimeline === "supabase" ? "Year" : "Years"}
            periodAxisLabel={
              activeTimeline === "supabase" ? "Period" : undefined
            }
            className="h-full"
          />
        ) : (
          <PrintedTimelineWall
            timeline={timeline}
            dimensions={printDimensions}
            plannedBoardCount={printBoardCount}
            showDimensionGuides={showPrintGuides}
            onPanelWidthChange={(value) =>
              changePrintDimension("panelWidthFeet", value)
            }
            onTrussHeightChange={(value) =>
              changePrintDimension("trussHeightFeet", value)
            }
            onShowDimensionGuidesChange={changeShowPrintGuides}
            onPlannedBoardCountChange={changePrintBoardCount}
          />
        )}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="rounded-full border border-border/80 bg-background/90 p-1 shadow-xl backdrop-blur-xl">
            <TimelineSwitcher activeTimeline={activeTimeline} />
          </div>

          <div className="rounded-full border border-border/80 bg-background/90 p-1 shadow-xl backdrop-blur-xl">
            <SegmentedControl
              value={viewMode}
              items={viewModes}
              onValueChange={changeViewMode}
              ariaLabel="Choose timeline presentation"
            />
          </div>

          <div className="rounded-full border border-border/80 bg-background/90 p-1 shadow-xl backdrop-blur-xl">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  )
}
