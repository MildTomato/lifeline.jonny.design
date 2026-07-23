import type { Metadata } from "next"

import { TimelinePage } from "@/components/timeline-page"
import { supabaseTimeline } from "@/lib/database-timelines"

export const metadata: Metadata = {
  title: "The Supabase Timeline",
  description: supabaseTimeline.description,
}

export default function SupabaseTimelinePage() {
  return (
    <TimelinePage activeTimeline="supabase" timeline={supabaseTimeline} />
  )
}
