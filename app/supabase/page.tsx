import type { Metadata } from "next"

import { TimelinePage } from "@/components/timeline-page"
import { supabaseTimeline } from "@/lib/database-timelines"
import {
  getPrintBoardCountFromSearchParams,
  getPrintDimensionsFromSearchParams,
  getShowPrintGuidesFromSearchParams,
} from "@/lib/print-dimensions"
import { getSupabaseStargazers } from "@/lib/supabase-stargazers"

export const metadata: Metadata = {
  title: "The Supabase Timeline",
  description: supabaseTimeline.description,
}

interface SupabaseTimelinePageProps {
  searchParams: Promise<{
    view?: string | string[]
    panelWidth?: string | string[]
    trussHeight?: string | string[]
    guides?: string | string[]
    boards?: string | string[]
  }>
}

export default async function SupabaseTimelinePage({
  searchParams,
}: SupabaseTimelinePageProps) {
  const [resolvedSearchParams, stargazerSeries] = await Promise.all([
    searchParams,
    getSupabaseStargazers(),
  ])
  const requestedView = resolvedSearchParams.view
  const view = Array.isArray(requestedView)
    ? requestedView.at(-1)
    : requestedView

  return (
    <TimelinePage
      activeTimeline="supabase"
      timeline={supabaseTimeline}
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
      stargazerSeries={stargazerSeries}
    />
  )
}
