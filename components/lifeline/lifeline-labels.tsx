import { cn } from "@/lib/utils"

export const LIFELINE_LABEL_COLUMN_WIDTH = 56
export const LIFELINE_LABEL_GAP = 16
export const LIFELINE_STICKY_SHIELD_WIDTH =
  LIFELINE_LABEL_COLUMN_WIDTH + LIFELINE_LABEL_GAP
export const LIFELINE_STICKY_LEFT = 20

export function LifelineStickyLabels({
  ageLabel = "Age",
  axisLabel = "Years",
  variant = "timeline",
}: {
  ageLabel?: string
  axisLabel?: string
  variant?: "timeline" | "print"
}) {
  const isPrint = variant === "print"

  return (
    <div
      className="relative [width:var(--lifeline-label-column-width)]"
      aria-hidden="true"
    >
      <div className="flex flex-col items-start text-left">
        <p
          className={cn(
            "[height:var(--lifeline-axis-age-leading)] [font-size:var(--lifeline-axis-age-size)] [line-height:var(--lifeline-axis-age-leading)] [margin-bottom:var(--lifeline-axis-age-gap)] font-medium uppercase tracking-[0.08em] transition-colors duration-300",
            isPrint
              ? "text-[var(--print-muted)]"
              : "text-zinc-500 dark:text-zinc-600",
          )}
        >
          {ageLabel}
        </p>
        <p
          className={cn(
            "[height:var(--lifeline-axis-year-leading)] [font-size:var(--lifeline-axis-age-size)] [line-height:var(--lifeline-axis-year-leading)] [margin-bottom:var(--lifeline-axis-year-gap)] font-medium uppercase tracking-[0.08em] transition-colors duration-300",
            isPrint
              ? "text-[var(--print-muted)]"
              : "text-zinc-500 dark:text-zinc-600",
          )}
        >
          {axisLabel}
        </p>
      </div>
    </div>
  )
}
