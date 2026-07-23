import type { Metadata } from "next"

import { TimelinePage } from "@/components/timeline-page"
import { postgresTimeline } from "@/lib/database-timelines"
import {
  getPrintBoardCountFromSearchParams,
  getPrintDimensionsFromSearchParams,
  getShowPrintGuidesFromSearchParams,
} from "@/lib/print-dimensions"

export const metadata: Metadata = {
  title: "The PostgreSQL Timeline",
  description: postgresTimeline.description,
}

interface PostgresTimelinePageProps {
  searchParams: Promise<{
    view?: string | string[]
    panelWidth?: string | string[]
    trussHeight?: string | string[]
    guides?: string | string[]
    boards?: string | string[]
  }>
}

export default async function PostgresTimelinePage({
  searchParams,
}: PostgresTimelinePageProps) {
  const resolvedSearchParams = await searchParams
  const requestedView = resolvedSearchParams.view
  const view = Array.isArray(requestedView)
    ? requestedView.at(-1)
    : requestedView

  return (
    <TimelinePage
      activeTimeline="postgres"
      timeline={postgresTimeline}
      initialViewMode={view === "print" ? "print" : "digital"}
      initialPrintDimensions={getPrintDimensionsFromSearchParams(
        resolvedSearchParams,
      )}
      initialShowPrintGuides={getShowPrintGuidesFromSearchParams(
        resolvedSearchParams,
      )}
      initialPrintBoardCount={getPrintBoardCountFromSearchParams(
        resolvedSearchParams,
      )}
    />
  )
}
