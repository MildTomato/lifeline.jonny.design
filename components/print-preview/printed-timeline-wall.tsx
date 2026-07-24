"use client"

import { useMemo, type CSSProperties } from "react"
import { ZapIcon } from "lucide-react"

import {
  getLifelineEventImage,
  getLifelineEventKey,
  LifelineEventText,
} from "@/components/lifeline/lifeline-event"
import {
  getLifelineAxisTypographyStyle,
  LifelineAxisLabel,
} from "@/components/lifeline/lifeline-axis-label"
import { LifelineStickyLabels } from "@/components/lifeline/lifeline-labels"
import type {
  LifelineEvent,
  LifelineEventSegment,
  LifelineMarker,
} from "@/components/lifeline/types"
import type { LifelineRecord } from "@/lib/lifeline-data"
import type { PrintDimensions } from "@/lib/print-dimensions"
import {
  PRINT_CONTENT_WIDTH_FEET,
  PRINT_MILESTONE_DATE_LEADING_PIXELS,
  PRINT_MILESTONE_FONT_PIXELS,
  PRINT_PANEL_SAFE_INSET_FEET,
  PRINT_RAIL_POSITION,
  PRINT_REFERENCE_FRAME_HEIGHT_FEET,
  PRINT_REFERENCE_PIXELS_PER_FOOT,
  PRINT_TIMELINE_INSET_FEET,
  PRINT_TRUSS_WIDTH_FEET,
  solvePrintLayout,
  type PrintLayoutResult,
  type PrintMarkerPlacement,
} from "@/lib/print-layout"
import { cn } from "@/lib/utils"

import { HorizontalTruss } from "./horizontal-truss"
import { PeopleScale } from "./people-scale"
import { PrintDimensionControls } from "./print-dimension-controls"
import {
  HorizontalDimensionGuide,
  VerticalDimensionGuide,
} from "./print-dimension-guides"
import { TrussJoint } from "./truss-joint"
import { TrussStand } from "./truss-stand"

const DISPLAY_BOARD_HEIGHT = "clamp(36rem, 72dvh, 42rem)"
const PRINT_CONNECTOR_DATE_GAP_FEET = 0.16

const PRINT_AXIS_TYPOGRAPHY_STYLE = {
  "--lifeline-axis-age-size": "var(--print-copy-xs)",
  "--lifeline-axis-age-leading": "var(--print-label-height)",
  "--lifeline-axis-age-gap": "var(--print-group-gap)",
  "--lifeline-axis-year-size": "var(--print-copy-sm)",
  "--lifeline-axis-year-leading": "var(--print-year-leading)",
  "--lifeline-axis-year-gap": "var(--print-year-leading)",
  "--lifeline-axis-year-period-gap": "var(--print-space-xxs)",
  "--lifeline-axis-period-size": "var(--print-copy-xs)",
  "--lifeline-axis-period-leading": "var(--print-label-height)",
  "--lifeline-axis-period-gap": "var(--print-group-gap)",
} as CSSProperties

interface PrintedTimelineWallProps {
  timeline: LifelineRecord
  dimensions: PrintDimensions
  plannedBoardCount: number
  showDimensionGuides: boolean
  onPanelWidthChange: (value: number) => void
  onTrussHeightChange: (value: number) => void
  onShowDimensionGuidesChange: (showGuides: boolean) => void
  onPlannedBoardCountChange: (boardCount: number) => void
}

function formatScaledClamp(scale: number) {
  const format = (value: number) =>
    Number(value.toFixed(3)).toString()

  return `clamp(${format(36 * scale)}rem, ${format(
    72 * scale,
  )}dvh, ${format(42 * scale)}rem)`
}

function formatScaledPixels(pixels: number, scale: number) {
  return `${Number((pixels * scale).toFixed(3))}px`
}

function getMarkerAge(marker: LifelineMarker, birthYear: number) {
  return marker.age ?? Math.floor(marker.year) - birthYear
}

function getMarkerYear(marker: LifelineMarker) {
  return marker.label ?? Math.floor(marker.year)
}

function getBoardYearRange(markers: LifelineMarker[]) {
  if (markers.length === 0) return null

  const first = getMarkerYear(markers[0])
  const last = getMarkerYear(markers.at(-1) ?? markers[0])

  return first === last ? first : `${first}—${last}`
}

function getTimelineEndLabel(timeline: LifelineRecord) {
  if (timeline.slug === "supabase") return "Present"

  return (
    timeline.endYear ??
    Math.floor(timeline.markers.at(-1)?.year ?? timeline.birthYear)
  )
}

function getPrintEventContent(event: LifelineEvent) {
  if (
    typeof event === "object" &&
    !Array.isArray(event) &&
    "text" in event
  ) {
    return event.text
  }

  return event
}

function splitPrintEvent(event: LifelineEvent): {
  headline: LifelineEventSegment[] | null
  description: string | LifelineEventSegment[]
} {
  const content = getPrintEventContent(event)

  if (typeof content === "string") {
    return {
      headline: null,
      description: content,
    }
  }

  const breakIndex = content.findIndex(
    (segment) => segment.type === "break",
  )

  if (breakIndex === -1) {
    return {
      headline: content,
      description: [],
    }
  }

  return {
    headline: content.slice(0, breakIndex),
    description: content.slice(breakIndex + 1),
  }
}

function PrintMarkerImage({
  src,
  alt,
}: {
  src: string
  alt: string
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      draggable={false}
      loading="lazy"
      className="pointer-events-none block w-[58%] select-none rounded-[1px] object-cover object-center grayscale [margin-top:var(--print-space-xs)] [max-height:var(--print-photo-max-height)]"
    />
  )
}

function PrintMarkerBody({
  marker,
  compactTop = false,
}: {
  marker: LifelineMarker
  compactTop?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col [gap:var(--print-space-sm)]",
        compactTop
          ? "[padding-top:var(--print-space-xxs)]"
          : "[padding-top:var(--print-space-sm)]",
      )}
    >
      {marker.events.map((event, index) => {
        const { headline, description } = splitPrintEvent(event)
        const eventImage = getLifelineEventImage(event)
        const hasDescription =
          typeof description === "string"
            ? description.length > 0
            : description.length > 0

        return (
          <div
            key={getLifelineEventKey(event, index)}
            data-slot="print-milestone"
            className="flex flex-col [gap:var(--print-space-xxs)]"
          >
            {headline && headline.length > 0 ? (
              <p className="text-left [font-size:var(--print-milestone-copy)] font-normal leading-[1.35] tracking-[-0.01em] text-[var(--print-highlight)]">
                <LifelineEventText
                  event={headline}
                  disableLinks
                />
              </p>
            ) : null}

            {hasDescription ? (
              <p className="text-left [font-size:var(--print-milestone-copy)] font-normal leading-[1.5] tracking-[-0.01em] text-[var(--print-muted)]">
                <LifelineEventText
                  event={description}
                  disableLinks
                />
              </p>
            ) : null}

            {eventImage ? (
              <PrintMarkerImage
                src={eventImage.src}
                alt={eventImage.alt}
              />
            ) : null}
          </div>
        )
      })}

      {marker.photos?.map((photo) => (
        <PrintMarkerImage
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
        />
      ))}
    </div>
  )
}

function PrintedMarker({
  placement,
  layout,
}: {
  placement: PrintMarkerPlacement
  layout: PrintLayoutResult
}) {
  const wallHeightFeet =
    layout.railYFeet / PRINT_RAIL_POSITION
  const contentBottomFeet =
    placement.contentTopFeet + placement.estimatedHeightFeet
  const verticalPosition =
    placement.laneSide === "above"
      ? {
          bottom: `${
            ((wallHeightFeet - contentBottomFeet) /
              wallHeightFeet) *
            100
          }%`,
        }
      : {
          top: `${
            (placement.contentTopFeet / wallHeightFeet) * 100
          }%`,
        }

  return (
    <article
      data-slot="print-marker-content"
      data-lane={placement.laneId}
      data-anchor-board={placement.boardIndex}
      data-group-size={placement.markers.length}
      data-marker-id={placement.marker.id}
      data-content-width-feet={placement.contentWidthFeet}
      data-estimated-height-feet={placement.estimatedHeightFeet}
      data-forced={placement.forced ? "true" : undefined}
      className="absolute z-50 flex min-w-0 flex-col bg-[var(--print-face)] text-[var(--print-muted)] [gap:var(--print-group-gap)]"
      style={{
        left: `${(placement.contentLeftFeet / layout.totalWidthFeet) * 100}%`,
        width: `${
          (placement.contentWidthFeet / layout.totalWidthFeet) * 100
        }%`,
        ...verticalPosition,
      }}
    >
      {placement.markers.map((marker) => {
        const dateLabel = marker.periodLabel ?? null

        return (
          <section
            key={marker.id}
            data-slot="print-marker-group-item"
            className="flex min-w-0 flex-col"
          >
            <header className="flex items-baseline [gap:var(--print-space-xs)] [font-size:var(--print-milestone-copy)] [line-height:var(--print-milestone-date-leading)] font-normal tabular-nums text-[var(--print-faint)]">
              {dateLabel !== null ? (
                <span className="truncate">{dateLabel}</span>
              ) : null}
            </header>

            <PrintMarkerBody marker={marker} compactTop />
          </section>
        )
      })}
    </article>
  )
}

function PrintYearLabels({
  layout,
  birthYear,
  axisLabel,
}: {
  layout: PrintLayoutResult
  birthYear: number
  axisLabel: string
}) {
  const yearPlacements = layout.placements.filter(
    (placement, placementIndex) => {
      const previousPlacement =
        layout.placements[placementIndex - 1]

      return (
        !previousPlacement ||
        Math.floor(previousPlacement.marker.year) !==
          Math.floor(placement.marker.year)
      )
    },
  )

  return (
    <>
      {yearPlacements[0] ? (
        <div
          data-slot="print-axis-labels"
          data-rail-side="above"
          className="absolute z-[70] [top:var(--print-rail-position)]"
          style={{
            left: `calc(${
              (yearPlacements[0].connectorXFeet /
                layout.totalWidthFeet) *
              100
            }% - var(--lifeline-sticky-shield-width) + var(--print-space-sm))`,
            transform:
              "translateY(calc(-100% - var(--print-axis-rail-gap)))",
          }}
        >
          <LifelineStickyLabels
            axisLabel={axisLabel}
            variant="print"
          />
        </div>
      ) : null}

      {yearPlacements.map((placement) => (
        <div
          key={`year-${placement.marker.id}`}
          data-slot="print-year-label"
          data-marker-id={placement.marker.id}
          data-rail-side="above"
          className="absolute z-[70] [top:var(--print-rail-position)]"
          style={{
            left: `${
              (placement.connectorXFeet /
                layout.totalWidthFeet) *
              100
            }%`,
            transform:
              "translateY(calc(-100% - var(--print-axis-rail-gap)))",
          }}
        >
          <LifelineAxisLabel
            age={getMarkerAge(placement.marker, birthYear)}
            axis={getMarkerYear(placement.marker)}
            variant="print"
          />
        </div>
      ))}
    </>
  )
}

function PrintMarkerConnectors({
  layout,
  wallHeightFeet,
}: {
  layout: PrintLayoutResult
  wallHeightFeet: number
}) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-40 size-full overflow-visible text-[var(--print-line)]"
      viewBox={`0 0 ${layout.totalWidthFeet} ${wallHeightFeet}`}
      preserveAspectRatio="none"
    >
      {layout.placements.map((placement) => {
        const connectorEndY =
          placement.laneSide === "below"
            ? placement.contentTopFeet -
              PRINT_CONNECTOR_DATE_GAP_FEET
            : placement.contentTopFeet +
              placement.estimatedHeightFeet +
              PRINT_CONNECTOR_DATE_GAP_FEET
        const connectorPath = `M ${placement.anchorXFeet} ${layout.railYFeet} V ${connectorEndY}`

        return (
          <g key={placement.marker.id}>
            <path
              d={connectorPath}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={`M ${placement.anchorXFeet} ${
                layout.railYFeet - 0.08
              } L ${placement.anchorXFeet} ${
                layout.railYFeet + 0.08
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )
      })}
    </svg>
  )
}

export function PrintedTimelineWall({
  timeline,
  dimensions,
  plannedBoardCount,
  showDimensionGuides,
  onPanelWidthChange,
  onTrussHeightChange,
  onShowDimensionGuidesChange,
  onPlannedBoardCountChange,
}: PrintedTimelineWallProps) {
  const layout = useMemo(
    () => solvePrintLayout(timeline, dimensions, plannedBoardCount),
    [dimensions, plannedBoardCount, timeline],
  )
  const panelAspectRatio =
    dimensions.panelWidthFeet / dimensions.trussHeightFeet
  const trussScale =
    PRINT_TRUSS_WIDTH_FEET / dimensions.trussHeightFeet
  const peopleScale = 6 / dimensions.trussHeightFeet
  const contentScale =
    PRINT_REFERENCE_FRAME_HEIGHT_FEET /
    dimensions.trussHeightFeet
  const titleInsetPercent = Math.min(
    45,
    (PRINT_TIMELINE_INSET_FEET / dimensions.panelWidthFeet) * 100,
  )
  const panelSafeInsetPercent = Math.min(
    45,
    (PRINT_PANEL_SAFE_INSET_FEET / dimensions.panelWidthFeet) * 100,
  )
  const boards = Array.from(
    { length: plannedBoardCount },
    (_, boardIndex) => {
      const boardStart = boardIndex * dimensions.panelWidthFeet
      const boardEnd = boardStart + dimensions.panelWidthFeet

      return layout.placements
        .filter(
          (placement) =>
            placement.anchorXFeet >= boardStart &&
            (boardIndex === plannedBoardCount - 1
              ? placement.anchorXFeet <= boardEnd
              : placement.anchorXFeet < boardEnd),
        )
        .flatMap((placement) => placement.markers)
    },
  )
  const renderedBoardCount = boards.length

  return (
    <section
      aria-label={`${timeline.name} straight print-wall mockup`}
      className="relative h-full min-h-0 overflow-auto bg-transparent overscroll-contain"
      style={
        {
          "--print-board-height": DISPLAY_BOARD_HEIGHT,
          ...getLifelineAxisTypographyStyle(contentScale),
          ...PRINT_AXIS_TYPOGRAPHY_STYLE,
          "--print-board-width": formatScaledClamp(panelAspectRatio),
          "--print-wall-width": formatScaledClamp(
            panelAspectRatio * renderedBoardCount,
          ),
          "--print-rail-position": `${PRINT_RAIL_POSITION * 100}%`,
          "--print-axis-rail-gap": formatScaledPixels(
            12,
            contentScale,
          ),
          "--print-truss-size": formatScaledClamp(trussScale),
          "--print-people-height": `${peopleScale * 100}%`,
          "--print-copy-xs": formatScaledPixels(5.5, contentScale),
          "--print-copy-sm": formatScaledPixels(7, contentScale),
          "--print-milestone-copy": formatScaledPixels(
            PRINT_MILESTONE_FONT_PIXELS,
            contentScale,
          ),
          "--print-milestone-date-leading": formatScaledPixels(
            PRINT_MILESTONE_DATE_LEADING_PIXELS,
            contentScale,
          ),
          "--print-label-height": formatScaledPixels(10, contentScale),
          "--print-year-leading": formatScaledPixels(12, contentScale),
          "--print-space-xxs": formatScaledPixels(2, contentScale),
          "--print-space-xs": formatScaledPixels(4, contentScale),
          "--print-space-sm": formatScaledPixels(6, contentScale),
          "--print-space-md": formatScaledPixels(8, contentScale),
          "--print-group-gap": formatScaledPixels(10, contentScale),
          "--print-space-xl": formatScaledPixels(16, contentScale),
          "--print-title-icon-size": formatScaledPixels(20, contentScale),
          "--print-header-right": formatScaledPixels(28, contentScale),
          "--print-event-min-width": formatScaledPixels(
            PRINT_CONTENT_WIDTH_FEET *
              PRINT_REFERENCE_PIXELS_PER_FOOT,
            contentScale,
          ),
          "--print-event-max-width": formatScaledPixels(
            PRINT_CONTENT_WIDTH_FEET *
              PRINT_REFERENCE_PIXELS_PER_FOOT,
            contentScale,
          ),
          "--print-photo-max-height": formatScaledPixels(60, contentScale),
        } as CSSProperties
      }
    >
      <div className="sticky left-0 top-0 z-40 flex h-0 w-fit items-start">
        <div className="ml-[max(0.5rem,calc(2rem-(var(--print-truss-size)/2)))] mt-14 md:ml-[max(0.5rem,calc(3.5rem-(var(--print-truss-size)/2)))]">
          <PrintDimensionControls
            dimensions={dimensions}
            plannedBoardCount={plannedBoardCount}
            renderedBoardCount={renderedBoardCount}
            layout={layout}
            showGuides={showDimensionGuides}
            onPanelWidthChange={onPanelWidthChange}
            onTrussHeightChange={onTrussHeightChange}
            onShowGuidesChange={onShowDimensionGuidesChange}
            onPlannedBoardCountChange={onPlannedBoardCountChange}
          />
        </div>
      </div>

      <div className="flex min-h-full w-max items-center px-8 py-12 md:px-14 md:py-10">
        <div className="relative h-[var(--print-board-height)] w-[var(--print-wall-width)] shrink-0">
          <div className="absolute inset-0 flex">
            {boards.map((markers, boardIndex) => (
              <div
                key={`board-${boardIndex}`}
                data-slot="print-board"
                className="relative h-[var(--print-board-height)] w-[var(--print-board-width)] shrink-0 border-r border-[var(--print-line)] first:border-l"
              >
                {showDimensionGuides ? (
                  <>
                    <HorizontalDimensionGuide
                      widthFeet={dimensions.panelWidthFeet}
                    />
                    {boardIndex === 0 ? (
                      <VerticalDimensionGuide
                        heightFeet={dimensions.trussHeightFeet}
                      />
                    ) : null}
                  </>
                ) : null}

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 border-y border-[var(--print-line)] bg-[var(--print-face)]"
                  style={{
                    top: "var(--print-truss-size)",
                    bottom: "var(--print-truss-size)",
                  }}
                />

                <div
                  className="pointer-events-none absolute inset-x-0 top-0 z-20 text-[var(--print-truss)]"
                  style={{ height: "var(--print-truss-size)" }}
                >
                  <HorizontalTruss />
                </div>

                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-20 text-[var(--print-truss)]"
                  style={{ height: "var(--print-truss-size)" }}
                >
                  <HorizontalTruss />
                </div>

                <div
                  className={cn(
                    "absolute inset-x-0 z-10 flex items-center [font-size:var(--print-copy-xs)] [padding-right:var(--print-header-right)] font-normal uppercase tracking-[0.16em] text-[var(--print-faint)]",
                    boardIndex === 0 ? "top-[25%]" : "top-[10%]",
                  )}
                  style={{
                    paddingLeft: `${
                      boardIndex === 0
                        ? titleInsetPercent
                        : panelSafeInsetPercent
                    }%`,
                  }}
                >
                  {boardIndex === 0 ? (
                    <div className="flex flex-col items-start [gap:var(--print-space-md)]">
                      {timeline.slug === "postgresql" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src="/icon.svg"
                          alt=""
                          draggable={false}
                          className="pointer-events-none select-none [image-rendering:pixelated]"
                          style={{
                            filter: "var(--print-icon-filter)",
                            height: "var(--print-title-icon-size)",
                            width: "var(--print-title-icon-size)",
                          }}
                        />
                      ) : timeline.slug === "supabase" ? (
                        <ZapIcon
                          aria-hidden="true"
                          className="fill-[var(--print-highlight)] text-[var(--print-highlight)]"
                          style={{
                            height: "var(--print-title-icon-size)",
                            width: "var(--print-title-icon-size)",
                          }}
                          strokeWidth={1}
                        />
                      ) : null}
                      <h1 className="[font-size:var(--print-copy-sm)] normal-case tracking-[-0.01em]">
                        <span className="text-[var(--print-highlight)]">
                          {timeline.name}
                        </span>
                        <span className="text-[var(--print-faint)]">
                          {` · ${timeline.birthYear}—${getTimelineEndLabel(timeline)}`}
                        </span>
                      </h1>
                    </div>
                  ) : (
                    <span>{getBoardYearRange(markers) ?? "—"}</span>
                  )}
                </div>

                <div
                  className="pointer-events-none absolute inset-y-0 z-30 bg-[var(--print-stage)] text-[var(--print-truss)]"
                  style={{
                    left: "calc(var(--print-truss-size) / -2)",
                    width: "var(--print-truss-size)",
                  }}
                >
                  <TrussStand />
                </div>

                <div
                  className="pointer-events-none absolute inset-y-0 z-40 flex aspect-auto flex-col justify-between text-[var(--print-truss)]"
                  style={{
                    left: "calc(var(--print-truss-size) / -2)",
                    width: "var(--print-truss-size)",
                  }}
                >
                  <TrussJoint className="aspect-square h-auto w-full" />
                  <TrussJoint className="aspect-square h-auto w-full" />
                </div>

                {boardIndex === boards.length - 1 ? (
                  <>
                    <div
                      className="pointer-events-none absolute inset-y-0 z-30 bg-[var(--print-stage)] text-[var(--print-truss)]"
                      style={{
                        right: "calc(var(--print-truss-size) / -2)",
                        width: "var(--print-truss-size)",
                      }}
                    >
                      <TrussStand />
                    </div>
                    <div
                      className="pointer-events-none absolute inset-y-0 z-40 flex flex-col justify-between text-[var(--print-truss)]"
                      style={{
                        right: "calc(var(--print-truss-size) / -2)",
                        width: "var(--print-truss-size)",
                      }}
                    >
                      <TrussJoint className="aspect-square h-auto w-full" />
                      <TrussJoint className="aspect-square h-auto w-full" />
                    </div>
                  </>
                ) : null}

                {boardIndex === 0 ? (
                  <PeopleScale
                    className="pointer-events-none absolute bottom-0 z-[60] h-[var(--print-people-height)]"
                    style={{ right: `${panelSafeInsetPercent}%` }}
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div
            aria-hidden="true"
            className="absolute inset-x-0 z-30 border-t border-dashed border-[var(--print-line)] [top:var(--print-rail-position)]"
            style={{ borderTopWidth: "0.75px" }}
          />

          <PrintYearLabels
            layout={layout}
            birthYear={timeline.birthYear}
            axisLabel={
              timeline.slug === "supabase" ? "Year" : "Years"
            }
          />

          <PrintMarkerConnectors
            layout={layout}
            wallHeightFeet={dimensions.trussHeightFeet}
          />

          {layout.placements.map((placement) => (
            <PrintedMarker
              key={placement.marker.id}
              placement={placement}
              layout={layout}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
