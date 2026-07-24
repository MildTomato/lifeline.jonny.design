import type { CSSProperties, ReactNode } from "react"

import { cn } from "@/lib/utils"

export function getLifelineAxisTypographyStyle(scale = 1) {
  const scaledPixels = (pixels: number) =>
    `${Number((pixels * scale).toFixed(3))}px`

  return {
    "--lifeline-axis-age-size": scaledPixels(11),
    "--lifeline-axis-age-leading": scaledPixels(16),
    "--lifeline-axis-age-gap": scaledPixels(20),
    "--lifeline-axis-year-size": scaledPixels(15),
    "--lifeline-axis-year-leading": scaledPixels(20),
    "--lifeline-axis-year-gap": scaledPixels(24),
    "--lifeline-axis-year-period-gap": scaledPixels(4),
    "--lifeline-axis-period-size": scaledPixels(11),
    "--lifeline-axis-period-leading": scaledPixels(16),
    "--lifeline-axis-period-gap": scaledPixels(24),
    "--lifeline-label-column-width": scaledPixels(56),
    "--lifeline-label-gap": scaledPixels(16),
    "--lifeline-sticky-shield-width": scaledPixels(72),
  } as CSSProperties
}

interface LifelineAxisLabelProps {
  age: ReactNode
  axis: ReactNode
  periodLabel?: ReactNode
  showAgeLabel?: boolean
  showAxisLabel?: boolean
  showPeriodLabel?: boolean
  variant?: "timeline" | "print"
}

function formatAgeLabel(age: ReactNode) {
  if (typeof age === "number") {
    return `${age} ${age === 1 ? "year" : "years"}`
  }

  if (typeof age === "string") {
    const compactAge = age.match(/^(\d+)y$/)

    if (compactAge) {
      const years = Number(compactAge[1])
      return `${years} ${years === 1 ? "year" : "years"}`
    }
  }

  return age
}

export function LifelineAxisLabel({
  age,
  axis,
  periodLabel,
  showAgeLabel = true,
  showAxisLabel = true,
  showPeriodLabel = false,
  variant = "timeline",
}: LifelineAxisLabelProps) {
  const isPrint = variant === "print"

  return (
    <div className="flex w-full flex-col items-start text-left">
      <p
        data-slot="lifeline-age-label"
        className={cn(
          "[height:var(--lifeline-axis-age-leading)] [font-size:var(--lifeline-axis-age-size)] [line-height:var(--lifeline-axis-age-leading)] [margin-bottom:var(--lifeline-axis-age-gap)] font-medium tabular-nums transition-colors duration-300",
          isPrint
            ? "text-[var(--print-muted)]"
            : "text-zinc-500 group-hover:text-black dark:text-zinc-600 dark:group-hover:text-zinc-400",
        )}
      >
        {showAgeLabel ? formatAgeLabel(age) : null}
      </p>

      <p
        data-slot="lifeline-axis-label"
        className={cn(
          "whitespace-nowrap [height:var(--lifeline-axis-year-leading)] [font-size:var(--lifeline-axis-year-size)] [line-height:var(--lifeline-axis-year-leading)] font-medium tabular-nums transition-colors duration-300",
          showPeriodLabel
            ? "[margin-bottom:var(--lifeline-axis-year-period-gap)]"
            : "[margin-bottom:var(--lifeline-axis-year-gap)]",
          isPrint
            ? "text-[var(--print-highlight)]"
            : "text-zinc-500 group-hover:text-black dark:group-hover:text-white",
        )}
      >
        {showAxisLabel ? axis : null}
      </p>

      {showPeriodLabel ? (
        <p
          data-slot="lifeline-period-label"
          className={cn(
            "whitespace-nowrap [height:var(--lifeline-axis-period-leading)] [font-size:var(--lifeline-axis-period-size)] [line-height:var(--lifeline-axis-period-leading)] [margin-bottom:var(--lifeline-axis-period-gap)] font-normal tabular-nums transition-colors duration-300",
            isPrint
              ? "text-[var(--print-muted)]"
              : "text-zinc-500 group-hover:text-black dark:text-zinc-600 dark:group-hover:text-zinc-300",
          )}
        >
          {periodLabel}
        </p>
      ) : null}
    </div>
  )
}
