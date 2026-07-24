"use client"

import { useMemo } from "react"

import type { StargazerPoint } from "@/lib/stargazer-data"
import type { LifelineMarker } from "./types"

interface LifelineStargazerPlotProps {
  markers: LifelineMarker[]
  offsets: number[]
  widths: number[]
  points: StargazerPoint[]
}

interface PlotPoint extends StargazerPoint {
  x: number
  y: number
}

const TOP = 8
const BASELINE = 94
const MILESTONES = [10_000, 50_000, 100_000]

function getTrackX(
  year: number,
  markers: LifelineMarker[],
  offsets: number[],
  widths: number[],
  seriesEndYear: number,
) {
  const firstMarker = markers[0]
  if (!firstMarker || year <= firstMarker.year) return offsets[0] ?? 0

  for (let index = 1; index < markers.length; index += 1) {
    const marker = markers[index]
    if (year > marker.year) continue

    const previousMarker = markers[index - 1]
    const duration = marker.year - previousMarker.year
    if (duration <= 0) return offsets[index]

    const progress = (year - previousMarker.year) / duration
    return (
      offsets[index - 1] +
      (offsets[index] - offsets[index - 1]) * progress
    )
  }

  const lastIndex = markers.length - 1
  const lastMarker = markers[lastIndex]
  const lastX = offsets[lastIndex] ?? 0
  const endX = lastX + Math.max(80, (widths[lastIndex] ?? 160) - 48)
  const duration = Math.max(0.01, seriesEndYear - lastMarker.year)
  const progress = Math.min(1, (year - lastMarker.year) / duration)

  return lastX + (endX - lastX) * progress
}

function getLinePath(points: PlotPoint[]) {
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ")
}

function formatStars(value: number) {
  if (value < 1_000) return String(value)
  const thousands = (value / 1_000).toFixed(1).replace(/\.0$/, "")

  return `${thousands}K`
}

export function LifelineStargazerPlot({
  markers,
  offsets,
  widths,
  points,
}: LifelineStargazerPlotProps) {
  const {
    chartWidth,
    finalPoint,
    linePath,
    milestonePoints,
    plottedPoints,
  } = useMemo(() => {
    const totalWidth = widths.reduce((sum, width) => sum + width, 0)
    const firstMarkerYear = markers[0]?.year
    const sourcePoints =
      firstMarkerYear !== undefined &&
      points[0] &&
      points[0].year > firstMarkerYear
        ? [
            {
              date: "timeline start",
              year: firstMarkerYear,
              stargazers: 0,
              measurement: "timeline start",
            },
            ...points,
          ]
        : points
    const maxStars = Math.max(
      ...sourcePoints.map((point) => point.stargazers),
      1,
    )
    const seriesEndYear =
      sourcePoints.at(-1)?.year ??
      markers.at(-1)?.year ??
      markers[0]?.year ??
      0
    const plotted = sourcePoints.map((point) => ({
      ...point,
      x: getTrackX(
        point.year,
        markers,
        offsets,
        widths,
        seriesEndYear,
      ),
      y:
        BASELINE -
        (point.stargazers / maxStars) * (BASELINE - TOP),
    }))
    const lastPoint = plotted.at(-1)
    const milestones = MILESTONES.flatMap((milestone) => {
      const point = plotted.find(
        (candidate) => candidate.stargazers >= milestone,
      )

      return point ? [{ label: formatStars(milestone), point }] : []
    })

    return {
      chartWidth: totalWidth,
      plottedPoints: plotted,
      linePath: getLinePath(plotted),
      finalPoint: lastPoint,
      milestonePoints: milestones,
    }
  }, [markers, offsets, points, widths])

  if (plottedPoints.length < 2 || !finalPoint) return null

  const firstPoint = plottedPoints[0]

  return (
    <div
      role="img"
      aria-label={`GitHub stargazers grew from ${firstPoint.stargazers.toLocaleString()} to ${finalPoint.stargazers.toLocaleString()} between ${firstPoint.date} and ${finalPoint.date}.`}
      className="pointer-events-none absolute inset-x-0 top-[calc(-1*clamp(12rem,28vh,16rem))] z-0 h-[clamp(36rem,72vh,42rem)] overflow-visible text-foreground"
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full overflow-visible"
        viewBox={`0 0 ${chartWidth} 100`}
        preserveAspectRatio="none"
      >
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.34"
          strokeWidth="0.8"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <span
        className="absolute -translate-y-full whitespace-nowrap px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground"
        style={{ left: firstPoint.x, top: `${firstPoint.y}%` }}
      >
        GitHub stargazers
      </span>

      {milestonePoints.map(({ label, point }) => (
        <span
          key={label}
          className="absolute -translate-x-1/2 -translate-y-full whitespace-nowrap px-1 py-0.5 text-[10px] font-normal tabular-nums text-muted-foreground"
          style={{ left: point.x, top: `${point.y}%` }}
        >
          {label}
        </span>
      ))}

      <span
        aria-hidden="true"
        className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
        style={{ left: finalPoint.x, top: `${finalPoint.y}%` }}
      />
      <span
        className="absolute -translate-y-1/2 whitespace-nowrap px-1.5 py-0.5 text-[10px] font-normal tabular-nums text-foreground"
        style={{ left: finalPoint.x + 7, top: `${finalPoint.y}%` }}
      >
        {formatStars(finalPoint.stargazers)}
      </span>
    </div>
  )
}
