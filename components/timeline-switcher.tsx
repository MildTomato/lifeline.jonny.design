"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { DatabaseIcon, ZapIcon } from "lucide-react"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import type { DatabaseTimelineId } from "@/lib/database-timelines"

interface TimelineSwitcherProps {
  activeTimeline: DatabaseTimelineId
}

function isDatabaseTimelineId(value: string): value is DatabaseTimelineId {
  return value === "postgres" || value === "supabase"
}

export function TimelineSwitcher({
  activeTimeline,
}: TimelineSwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const changeTimeline = (values: string[]) => {
    const nextTimeline = values.at(-1)

    if (
      !nextTimeline ||
      !isDatabaseTimelineId(nextTimeline) ||
      nextTimeline === activeTimeline
    ) {
      return
    }

    startTransition(() => {
      router.push(`/${nextTimeline}`)
    })
  }

  return (
    <ToggleGroup
      value={[activeTimeline]}
      onValueChange={changeTimeline}
      disabled={isPending}
      variant="outline"
      size="sm"
      spacing={0}
      aria-label="Choose a database timeline"
    >
      <ToggleGroupItem value="postgres" aria-label="Show PostgreSQL timeline">
        <DatabaseIcon data-icon="inline-start" />
        Postgres
      </ToggleGroupItem>
      <ToggleGroupItem value="supabase" aria-label="Show Supabase timeline">
        <ZapIcon data-icon="inline-start" />
        Supabase
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
