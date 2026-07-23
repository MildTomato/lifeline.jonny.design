"use client"

import type { CSSProperties } from "react"
import { ZapIcon } from "lucide-react"

import {
  getLifelineEventKey,
  LifelineEventText,
} from "@/components/lifeline/lifeline-event"
import type { LifelineMarker } from "@/components/lifeline/types"
import type { LifelineRecord } from "@/lib/lifeline-data"
import type { PrintDimensions } from "@/lib/print-dimensions"
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

const MARKERS_PER_BOARD = 3
const DISPLAY_BOARD_HEIGHT = "clamp(36rem, 72dvh, 42rem)"
const TRUSS_CROSS_SECTION_FEET = 0.6
const REFERENCE_FRAME_HEIGHT_FEET = 10

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

function chunkMarkers(markers: LifelineMarker[]) {
  const chunks: LifelineMarker[][] = []

  for (let index = 0; index < markers.length; index += MARKERS_PER_BOARD) {
    chunks.push(markers.slice(index, index + MARKERS_PER_BOARD))
  }

  return chunks
}

function getMarkerAge(marker: LifelineMarker, birthYear: number) {
  return marker.age ?? Math.floor(marker.year) - birthYear
}

function getMarkerYear(marker: LifelineMarker) {
  return marker.label ?? Math.floor(marker.year)
}

function getBoardYearRange(markers: LifelineMarker[]) {
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

function PrintedMarker({
  marker,
  birthYear,
  showAge,
}: {
  marker: LifelineMarker
  birthYear: number
  showAge: boolean
}) {
  const age = getMarkerAge(marker, birthYear)

  return (
    <article className="group relative min-w-0 flex-1">
      <div className="absolute left-0 [right:var(--print-space-xl)] [top:var(--print-marker-label-offset)]">
        <p className="[height:var(--print-label-height)] [font-size:var(--print-copy-xs)] [line-height:var(--print-label-height)] font-normal tabular-nums text-[var(--print-faint)]">
          {showAge ? age : null}
        </p>
        <p className="[font-size:var(--print-copy-sm)] [line-height:var(--print-year-leading)] [margin-top:var(--print-space-xs)] font-normal tabular-nums text-[var(--print-muted)]">
          {getMarkerYear(marker)}
        </p>
        <p className="truncate [font-size:var(--print-copy-xs)] [height:var(--print-label-height)] [line-height:var(--print-label-height)] [margin-top:var(--print-space-xxs)] font-normal tabular-nums text-[var(--print-faint)]">
          {marker.periodLabel}
        </p>
      </div>

      <span
        aria-hidden="true"
        className="absolute left-0 top-0 z-10 w-px -translate-y-1/2 bg-[var(--print-line)] [height:var(--print-space-md)]"
      />

      <div className="flex w-fit flex-col [gap:var(--print-space-sm)] [max-width:var(--print-event-max-width)] [min-width:var(--print-event-min-width)] [padding-top:var(--print-space-xl)] text-[var(--print-muted)]">
        {marker.events.map((event, index) => (
          <p
            key={getLifelineEventKey(event, index)}
            className="text-left [font-size:var(--print-copy-xs)] font-normal leading-[1.5] tracking-[-0.01em]"
          >
            <LifelineEventText event={event} disableLinks />
          </p>
        ))}

        {marker.photos?.map((photo) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            draggable={false}
            loading="lazy"
            className="pointer-events-none block w-[52%] select-none rounded-[1px] object-cover object-center grayscale [margin-top:var(--print-space-sm)] [max-height:var(--print-photo-max-height)]"
          />
        ))}
      </div>
    </article>
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
  const featuredMarkers = timeline.markers.filter(
    (marker) =>
      marker.events.length > 0 || Boolean(marker.photos?.length),
  )
  const boards = chunkMarkers(featuredMarkers)
  const panelAspectRatio =
    dimensions.panelWidthFeet / dimensions.trussHeightFeet
  const trussScale =
    TRUSS_CROSS_SECTION_FEET / dimensions.trussHeightFeet
  const peopleScale = 6 / dimensions.trussHeightFeet
  const contentScale =
    REFERENCE_FRAME_HEIGHT_FEET / dimensions.trussHeightFeet

  return (
    <section
      aria-label={`${timeline.name} straight print-wall mockup`}
      className="relative h-full min-h-0 overflow-auto bg-transparent overscroll-contain"
      style={
        {
          "--print-board-height": DISPLAY_BOARD_HEIGHT,
          "--print-board-width": formatScaledClamp(panelAspectRatio),
          "--print-rail-position": "45%",
          "--print-truss-size": formatScaledClamp(trussScale),
          "--print-people-height": `${peopleScale * 100}%`,
          "--print-copy-xs": formatScaledPixels(5.5, contentScale),
          "--print-copy-sm": formatScaledPixels(7, contentScale),
          "--print-label-height": formatScaledPixels(10, contentScale),
          "--print-year-leading": formatScaledPixels(12, contentScale),
          "--print-marker-label-offset": formatScaledPixels(
            -65.6,
            contentScale,
          ),
          "--print-space-xxs": formatScaledPixels(2, contentScale),
          "--print-space-xs": formatScaledPixels(4, contentScale),
          "--print-space-sm": formatScaledPixels(6, contentScale),
          "--print-space-md": formatScaledPixels(8, contentScale),
          "--print-space-xl": formatScaledPixels(16, contentScale),
          "--print-title-icon-size": formatScaledPixels(20, contentScale),
          "--print-header-right": formatScaledPixels(28, contentScale),
          "--print-event-min-width": formatScaledPixels(96, contentScale),
          "--print-event-max-width": formatScaledPixels(112, contentScale),
          "--print-photo-max-height": formatScaledPixels(96, contentScale),
        } as CSSProperties
      }
    >
      <div className="sticky left-0 top-0 z-40 flex h-0 w-fit items-start">
        <div className="ml-[max(0.5rem,calc(2rem-(var(--print-truss-size)/2)))] mt-14 md:ml-[max(0.5rem,calc(3.5rem-(var(--print-truss-size)/2)))]">
          <PrintDimensionControls
            dimensions={dimensions}
            plannedBoardCount={plannedBoardCount}
            showGuides={showDimensionGuides}
            onPanelWidthChange={onPanelWidthChange}
            onTrussHeightChange={onTrussHeightChange}
            onShowGuidesChange={onShowDimensionGuidesChange}
            onPlannedBoardCountChange={onPlannedBoardCountChange}
          />
        </div>
      </div>

      <div className="flex min-h-full w-max items-center px-8 py-12 md:px-14 md:py-10">
        {boards.map((markers, boardIndex) => {
          const boardOffset = boardIndex * MARKERS_PER_BOARD

          return (
            <div
              key={markers[0].id}
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
                  "absolute inset-x-0 flex items-center [font-size:var(--print-copy-xs)] [padding-right:var(--print-header-right)] font-normal uppercase tracking-[0.16em] text-[var(--print-faint)]",
                  boardIndex === 0 ? "top-[25%]" : "top-[10%]",
                  boardIndex === 0
                    ? "pl-[20%]"
                    : "pl-[10%]",
                )}
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
                  <span>{getBoardYearRange(markers)}</span>
                )}
              </div>

              <div
                aria-hidden="true"
                className="absolute inset-x-0 border-t border-dashed border-[var(--print-line)] [top:var(--print-rail-position)]"
              />

              <div
                className={cn(
                  "absolute inset-x-0 flex [top:var(--print-rail-position)]",
                  boardIndex === 0
                    ? "pl-[20%] pr-[10%]"
                    : "px-[10%]",
                )}
              >
                {markers.map((marker, markerIndex) => {
                  const absoluteIndex = boardOffset + markerIndex
                  const previousMarker = featuredMarkers[absoluteIndex - 1]
                  const showAge =
                    !previousMarker ||
                    getMarkerAge(previousMarker, timeline.birthYear) !==
                      getMarkerAge(marker, timeline.birthYear)

                  return (
                    <PrintedMarker
                      key={marker.id}
                      marker={marker}
                      birthYear={timeline.birthYear}
                      showAge={showAge}
                    />
                  )
                })}
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
                  className="pointer-events-none absolute bottom-0 right-7 z-40 h-[var(--print-people-height)]"
                />
              ) : null}

              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-y-0 right-0 w-px bg-[var(--print-line)]",
                  boardIndex === boards.length - 1 && "hidden",
                )}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
