"use client"

import { useOptimistic, useTransition } from "react"
import { useRouter } from "next/navigation"

import { SegmentedControl } from "@/components/segmented-control"
import type { DatabaseTimelineId } from "@/lib/database-timelines"

interface TimelineSwitcherProps {
  activeTimeline: DatabaseTimelineId
}

const timelines = [
  {
    value: "postgres",
    label: "Postgres",
    ariaLabel: "Show PostgreSQL timeline",
  },
  {
    value: "supabase",
    label: "Supabase",
    ariaLabel: "Show Supabase timeline",
  },
] satisfies {
  value: DatabaseTimelineId
  label: string
  ariaLabel: string
}[]

export function TimelineSwitcher({
  activeTimeline,
}: TimelineSwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedTimeline, setSelectedTimeline] =
    useOptimistic(activeTimeline)

  const changeTimeline = (nextTimeline: DatabaseTimelineId) => {
    if (nextTimeline === selectedTimeline) {
      return
    }

    startTransition(() => {
      setSelectedTimeline(nextTimeline)
      const query = window.location.search
      router.push(`/${nextTimeline}${query}`)
    })
  }

  return (
    <SegmentedControl
      value={selectedTimeline}
      items={timelines}
      onValueChange={changeTimeline}
      ariaLabel="Choose a database timeline"
      disabled={isPending}
    />
  )
}
