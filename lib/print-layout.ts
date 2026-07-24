import type {
  LifelineEvent,
  LifelineMarker,
} from "@/components/lifeline/types"
import { getMarkerWidth } from "@/components/lifeline/lifeline-utils"
import type { LifelineRecord } from "@/lib/lifeline-data"
import {
  PRINT_BOARD_COUNT_MAX,
  PRINT_BOARD_COUNT_MIN,
  type PrintDimensions,
} from "@/lib/print-dimensions"

export const PRINT_TRUSS_WIDTH_FEET = 0.6
export const PRINT_RAIL_POSITION = 0.45
export const PRINT_REFERENCE_FRAME_HEIGHT_FEET = 10
export const PRINT_REFERENCE_FRAME_PIXELS = 576
export const PRINT_REFERENCE_PIXELS_PER_FOOT =
  PRINT_REFERENCE_FRAME_PIXELS / PRINT_REFERENCE_FRAME_HEIGHT_FEET
export const PRINT_MILESTONE_FONT_PIXELS = 3.25
export const PRINT_MILESTONE_DATE_LEADING_PIXELS = 5
export const PRINT_CONTENT_WIDTH_FEET = 1.1
export const PRINT_PANEL_SAFE_INSET_FEET = 0.85
export const PRINT_TIMELINE_INSET_FEET = 1.6

const HORIZONTAL_CLEARANCE_FEET = 0.16
const VERTICAL_CLEARANCE_FEET = 0.25
const CONTENT_GAP_FEET = 0.3
const CONTENT_RAIL_GAP_FEET = 0.48
const LANE_HEIGHT_FEET = 1.5
const LANE_GAP_FEET = 0.16
const MIN_LANE_HEIGHT_FEET = 0.72
const GROUP_CONTENT_GAP_FEET = 0.16
const MAX_ABOVE_LANES = 0
const MAX_BELOW_LANES = 2
const COMFORTABLE_DISPLACEMENT_FEET = 1.8
const RECOMMENDED_PANEL_WIDTHS = [6, 8, 10, 12] as const
const RECOMMENDED_BOARD_COUNT_MIN = 4
const RECOMMENDED_BOARD_COUNT_MAX = 12
const PRINT_PIXELS_TO_FEET =
  PRINT_REFERENCE_FRAME_HEIGHT_FEET / PRINT_REFERENCE_FRAME_PIXELS
const MILESTONE_CHARACTERS_PER_LINE = Math.floor(
  (PRINT_CONTENT_WIDTH_FEET * PRINT_REFERENCE_PIXELS_PER_FOOT) /
    (PRINT_MILESTONE_FONT_PIXELS * 0.52),
)
const MILESTONE_DATE_HEIGHT_FEET =
  PRINT_MILESTONE_DATE_LEADING_PIXELS * PRINT_PIXELS_TO_FEET
const MILESTONE_TITLE_LINE_HEIGHT_FEET =
  PRINT_MILESTONE_FONT_PIXELS * 1.35 * PRINT_PIXELS_TO_FEET
const MILESTONE_BODY_LINE_HEIGHT_FEET =
  PRINT_MILESTONE_FONT_PIXELS * 1.5 * PRINT_PIXELS_TO_FEET
const MILESTONE_INNER_GAP_FEET = 2 * PRINT_PIXELS_TO_FEET
const MILESTONE_EVENT_GAP_FEET = 6 * PRINT_PIXELS_TO_FEET
const MILESTONE_TOP_PADDING_FEET = 2 * PRINT_PIXELS_TO_FEET
const MILESTONE_PHOTO_GAP_FEET = 4 * PRINT_PIXELS_TO_FEET
const MILESTONE_PHOTO_WIDTH_RATIO = 0.58
const MILESTONE_PHOTO_MAX_HEIGHT_FEET = 60 * PRINT_PIXELS_TO_FEET

export type PrintFitStatus = "comfortable" | "tight" | "impossible"
export type PrintLaneSide = "above" | "below"

export interface PrintForbiddenZone {
  startFeet: number
  endFeet: number
  boundaryIndex: number
}

export interface PrintLayoutLane {
  id: string
  side: PrintLaneSide
  index: number
  topFeet: number
  bottomFeet: number
}

export interface PrintMarkerPlacement {
  marker: LifelineMarker
  markers: LifelineMarker[]
  timelineAnchorXFeet: number
  anchorXFeet: number
  contentLeftFeet: number
  contentTopFeet: number
  contentWidthFeet: number
  estimatedHeightFeet: number
  connectorXFeet: number
  laneId: string
  laneIndex: number
  laneSide: PrintLaneSide
  boardIndex: number
  displacementFeet: number
  forced: boolean
}

export interface PrintLayoutFit {
  status: PrintFitStatus
  markerCount: number
  laneCount: number
  forcedPlacements: number
  maximumDisplacementFeet: number
  averageDisplacementFeet: number
  utilization: number
}

export interface PrintLayoutRecommendation {
  panelWidthFeet: number
  boardCount: number
  totalWidthFeet: number
  status: Exclude<PrintFitStatus, "impossible">
}

export interface PrintLayoutResult {
  totalWidthFeet: number
  railYFeet: number
  timelineStart: number
  timelineEnd: number
  forbiddenZones: PrintForbiddenZone[]
  lanes: PrintLayoutLane[]
  placements: PrintMarkerPlacement[]
  fit: PrintLayoutFit
  recommendations: PrintLayoutRecommendation[]
}

interface HorizontalInterval {
  start: number
  end: number
}

interface SolverLane extends PrintLayoutLane {
  occupied: HorizontalInterval[]
}

interface MarkerLayoutSeed {
  marker: LifelineMarker
  markers: LifelineMarker[]
  markerIndex: number
  anchorXFeet: number
  desiredLeftFeet: number
  estimatedHeightFeet: number
  boardIndex: number
  lane: SolverLane
  forced: boolean
}

interface MarkerColumn {
  marker: LifelineMarker
  markers: LifelineMarker[]
  anchorYear: number
  sourceIndex: number
}

interface PackedMarkerPosition {
  left: number
  connectorX: number
  displacement: number
  forced: boolean
}

type BaseLayoutResult = Omit<PrintLayoutResult, "recommendations">

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

function getEventSections(event: LifelineEvent) {
  const content =
    typeof event === "object" && !Array.isArray(event) && "text" in event
      ? event.text
      : event

  if (typeof content === "string") return [content.length]

  const sections: number[] = [0]

  for (const segment of content) {
    if (segment.type === "break") {
      sections.push(0)
    } else {
      sections[sections.length - 1] += segment.value.length
    }
  }

  return sections
}

function getEstimatedLineCount(characterCount: number) {
  return Math.max(
    1,
    Math.ceil(characterCount / MILESTONE_CHARACTERS_PER_LINE),
  )
}

function estimateEventTextHeight(event: LifelineEvent) {
  const sections = getEventSections(event)
  const [headlineCharacterCount = 0, ...descriptionSections] = sections
  const headlineHeight =
    getEstimatedLineCount(headlineCharacterCount) *
    MILESTONE_TITLE_LINE_HEIGHT_FEET

  if (descriptionSections.length === 0) return headlineHeight

  const descriptionHeight = descriptionSections.reduce(
    (total, characterCount) =>
      total +
      getEstimatedLineCount(characterCount) *
        MILESTONE_BODY_LINE_HEIGHT_FEET,
    0,
  )

  return (
    headlineHeight +
    MILESTONE_INNER_GAP_FEET +
    descriptionHeight
  )
}

function estimateMarkerHeight(marker: LifelineMarker) {
  const textHeight = marker.events.reduce(
    (total, event) => total + estimateEventTextHeight(event),
    0,
  )
  const firstPhoto = marker.photos?.[0]
  const photoHeight = firstPhoto
    ? Math.min(
        MILESTONE_PHOTO_MAX_HEIGHT_FEET,
        firstPhoto.aspectRatio
          ? (PRINT_CONTENT_WIDTH_FEET *
              MILESTONE_PHOTO_WIDTH_RATIO) /
              firstPhoto.aspectRatio
          : MILESTONE_PHOTO_MAX_HEIGHT_FEET,
      )
    : 0
  const estimated =
    MILESTONE_DATE_HEIGHT_FEET +
    MILESTONE_TOP_PADDING_FEET +
    textHeight +
    Math.max(0, marker.events.length - 1) *
      MILESTONE_EVENT_GAP_FEET +
    (firstPhoto
      ? MILESTONE_EVENT_GAP_FEET +
        MILESTONE_PHOTO_GAP_FEET +
        photoHeight
      : 0)

  return clamp(estimated, 0.36, LANE_HEIGHT_FEET)
}

function estimateMarkerColumnHeight(markers: LifelineMarker[]) {
  return (
    markers.reduce(
      (total, marker) => total + estimateMarkerHeight(marker),
      0,
    ) +
    Math.max(0, markers.length - 1) * GROUP_CONTENT_GAP_FEET
  )
}

function getMarkerMonthKey(marker: LifelineMarker) {
  if (marker.events.length === 0) return null

  const explicitMonth = marker.periodLabel?.match(
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:uary|ruary|ch|il|e|y|ust|tember|ober|ember)?\b/i,
  )?.[1]

  if (!explicitMonth) return null

  return `${Math.floor(marker.year)}-${explicitMonth.toLowerCase()}`
}

function createMarkerColumns(
  markers: LifelineMarker[],
  groupSameMonth: boolean,
) {
  if (!groupSameMonth) {
    return markers.map((marker, sourceIndex) => ({
      marker,
      markers: [marker],
      anchorYear: marker.year,
      sourceIndex,
    }))
  }

  const columns: MarkerColumn[] = []
  const monthlyColumns = new Map<string, MarkerColumn>()

  markers.forEach((marker, sourceIndex) => {
    const monthKey = getMarkerMonthKey(marker)

    if (!monthKey) {
      columns.push({
        marker,
        markers: [marker],
        anchorYear: marker.year,
        sourceIndex,
      })
      return
    }

    const existingColumn = monthlyColumns.get(monthKey)

    if (existingColumn) {
      existingColumn.markers.push(marker)
      existingColumn.anchorYear =
        existingColumn.markers.reduce(
          (total, groupedMarker) => total + groupedMarker.year,
          0,
        ) / existingColumn.markers.length
      return
    }

    const column = {
      marker,
      markers: [marker],
      anchorYear: marker.year,
      sourceIndex,
    }

    monthlyColumns.set(monthKey, column)
    columns.push(column)
  })

  return columns.toSorted(
    (a, b) =>
      a.anchorYear - b.anchorYear ||
      a.sourceIndex - b.sourceIndex,
  )
}

function createOriginalTimelineScale(markers: LifelineMarker[]) {
  const markerOffsets = new Map<string, number>()
  let totalWidth = 0

  markers.forEach((marker, index) => {
    markerOffsets.set(marker.id, totalWidth)
    totalWidth += getMarkerWidth(
      marker,
      markers[index + 1]?.year,
    )
  })

  return {
    markerOffsets,
    totalWidth: Math.max(totalWidth, 1),
  }
}

function getColumnTimelineProgress(
  column: MarkerColumn,
  markerOffsets: Map<string, number>,
  totalWidth: number,
) {
  const offset =
    column.markers.reduce(
      (sum, marker) => sum + (markerOffsets.get(marker.id) ?? 0),
      0,
    ) / column.markers.length

  return clamp(offset / totalWidth, 0, 1)
}

function createForbiddenZones(
  panelWidthFeet: number,
  boardCount: number,
) {
  const zoneHalfWidth =
    PRINT_TRUSS_WIDTH_FEET / 2 + HORIZONTAL_CLEARANCE_FEET

  return Array.from({ length: boardCount + 1 }, (_, boundaryIndex) => {
    const boundary = boundaryIndex * panelWidthFeet

    return {
      startFeet: clamp(
        boundary - zoneHalfWidth,
        0,
        panelWidthFeet * boardCount,
      ),
      endFeet: clamp(
        boundary + zoneHalfWidth,
        0,
        panelWidthFeet * boardCount,
      ),
      boundaryIndex,
    }
  })
}

function createFreePanelSegments(
  dimensions: PrintDimensions,
  boardCount: number,
) {
  return Array.from({ length: boardCount }, (_, boardIndex) => ({
    start:
      boardIndex * dimensions.panelWidthFeet +
      PRINT_PANEL_SAFE_INSET_FEET,
    end:
      (boardIndex + 1) * dimensions.panelWidthFeet -
      PRINT_PANEL_SAFE_INSET_FEET,
  }))
}

function createLanes(dimensions: PrintDimensions) {
  const railYFeet =
    dimensions.trussHeightFeet * PRINT_RAIL_POSITION
  const minimumY =
    PRINT_TRUSS_WIDTH_FEET + VERTICAL_CLEARANCE_FEET
  const maximumY =
    dimensions.trussHeightFeet -
    PRINT_TRUSS_WIDTH_FEET -
    VERTICAL_CLEARANCE_FEET
  const above: SolverLane[] = []
  const below: SolverLane[] = []

  let aboveBottom = railYFeet - CONTENT_RAIL_GAP_FEET

  while (
    above.length < MAX_ABOVE_LANES &&
    aboveBottom - LANE_HEIGHT_FEET >= minimumY
  ) {
    const index = above.length

    above.push({
      id: `above-${index}`,
      side: "above",
      index,
      topFeet: aboveBottom - LANE_HEIGHT_FEET,
      bottomFeet: aboveBottom,
      occupied: [],
    })
    aboveBottom -= LANE_HEIGHT_FEET + LANE_GAP_FEET
  }

  let belowTop = railYFeet + CONTENT_RAIL_GAP_FEET
  const availableBelowHeight = maximumY - belowTop
  const availableBelowLaneCount = Math.floor(
    (availableBelowHeight + LANE_GAP_FEET) /
      (MIN_LANE_HEIGHT_FEET + LANE_GAP_FEET),
  )
  const belowLaneCount = Math.min(
    MAX_BELOW_LANES,
    availableBelowLaneCount,
  )
  const belowLaneHeight =
    belowLaneCount > 0
      ? (availableBelowHeight -
          (belowLaneCount - 1) * LANE_GAP_FEET) /
        belowLaneCount
      : 0

  for (let index = 0; index < belowLaneCount; index++) {
    const bottomFeet =
      index === belowLaneCount - 1
        ? maximumY
        : belowTop + belowLaneHeight

    below.push({
      id: `below-${index}`,
      side: "below",
      index,
      topFeet: belowTop,
      bottomFeet,
      occupied: [],
    })
    belowTop = bottomFeet + LANE_GAP_FEET
  }

  const lanes: SolverLane[] = []
  const laneCount = Math.max(above.length, below.length)

  for (let index = 0; index < laneCount; index++) {
    if (below[index]) lanes.push(below[index])
    if (above[index]) lanes.push(above[index])
  }

  return lanes
}

function subtractOccupiedIntervals(
  segment: HorizontalInterval,
  occupied: HorizontalInterval[],
) {
  let freeSegments = [segment]

  for (const interval of occupied) {
    const expanded = {
      start: interval.start - CONTENT_GAP_FEET / 2,
      end: interval.end + CONTENT_GAP_FEET / 2,
    }
    const nextSegments: HorizontalInterval[] = []

    for (const free of freeSegments) {
      if (expanded.end <= free.start || expanded.start >= free.end) {
        nextSegments.push(free)
        continue
      }

      if (expanded.start > free.start) {
        nextSegments.push({
          start: free.start,
          end: Math.min(expanded.start, free.end),
        })
      }

      if (expanded.end < free.end) {
        nextSegments.push({
          start: Math.max(expanded.end, free.start),
          end: free.end,
        })
      }
    }

    freeSegments = nextSegments
  }

  return freeSegments
}

function getSegmentCapacity(
  segment: HorizontalInterval,
  widthFeet: number,
) {
  return Math.max(
    0,
    Math.floor(
      (segment.end - segment.start + CONTENT_GAP_FEET) /
        (widthFeet + CONTENT_GAP_FEET),
    ),
  )
}

function getLaneBoardSegments(
  lane: SolverLane,
  boardSegment: HorizontalInterval,
) {
  return subtractOccupiedIntervals(boardSegment, lane.occupied)
}

function getLaneBoardCapacity(
  lane: SolverLane,
  boardSegment: HorizontalInterval,
) {
  return getLaneBoardSegments(lane, boardSegment).reduce(
    (total, segment) =>
      total +
      getSegmentCapacity(segment, PRINT_CONTENT_WIDTH_FEET),
    0,
  )
}

function packMarkerBatch(
  markers: MarkerLayoutSeed[],
  segment: HorizontalInterval,
) {
  const spacing = PRINT_CONTENT_WIDTH_FEET + CONTENT_GAP_FEET
  const maximumLeft = segment.end - PRINT_CONTENT_WIDTH_FEET
  const leftPositions = markers.map((seed) =>
    clamp(seed.desiredLeftFeet, segment.start, maximumLeft),
  )

  for (let index = 1; index < leftPositions.length; index++) {
    leftPositions[index] = Math.max(
      leftPositions[index],
      leftPositions[index - 1] + spacing,
    )
  }

  if (
    leftPositions.length > 0 &&
    leftPositions[leftPositions.length - 1] > maximumLeft
  ) {
    leftPositions[leftPositions.length - 1] = maximumLeft

    for (
      let index = leftPositions.length - 2;
      index >= 0;
      index--
    ) {
      leftPositions[index] = Math.min(
        leftPositions[index],
        leftPositions[index + 1] - spacing,
      )
    }
  }

  return markers.map((seed, index) => {
    const left = leftPositions[index]
    const connectorX = left

    return {
      seed,
      position: {
        left,
        connectorX,
        displacement: Math.abs(connectorX - seed.anchorXFeet),
        forced: left < segment.start - 0.000001,
      },
    }
  })
}

function packLaneBoardGroup(
  markers: MarkerLayoutSeed[],
  freeSegments: HorizontalInterval[],
) {
  const positions = new Map<number, PackedMarkerPosition>()
  let markerOffset = 0

  for (const segment of freeSegments) {
    const capacity = getSegmentCapacity(
      segment,
      PRINT_CONTENT_WIDTH_FEET,
    )
    const markerBatch = markers.slice(
      markerOffset,
      markerOffset + capacity,
    )

    for (const { seed, position } of packMarkerBatch(
      markerBatch,
      segment,
    )) {
      positions.set(seed.markerIndex, position)
    }

    markerOffset += markerBatch.length
  }

  for (const seed of markers.slice(markerOffset)) {
    const segment = freeSegments.at(-1)
    const left = segment
      ? clamp(
          seed.desiredLeftFeet,
          segment.start,
          Math.max(
            segment.start,
            segment.end - PRINT_CONTENT_WIDTH_FEET,
          ),
        )
      : seed.desiredLeftFeet
    const connectorX = left

    positions.set(seed.markerIndex, {
      left,
      connectorX,
      displacement: Math.abs(connectorX - seed.anchorXFeet),
      forced: true,
    })
  }

  return positions
}

function getTimelineBounds(
  timeline: LifelineRecord,
  markers: LifelineMarker[],
) {
  const firstMarker = markers[0]
  const lastMarker = markers.at(-1)
  const timelineStart = firstMarker?.year ?? timeline.birthYear
  const timelineEnd = lastMarker?.year ?? timeline.endYear ?? timelineStart + 1

  return {
    timelineStart,
    timelineEnd:
      timelineEnd > timelineStart ? timelineEnd : timelineStart + 1,
  }
}

function solveBaseLayout(
  timeline: LifelineRecord,
  dimensions: PrintDimensions,
  boardCount: number,
): BaseLayoutResult {
  const markers = timeline.markers
    .filter(
      (marker) =>
        marker.events.length > 0 || Boolean(marker.photos?.length),
    )
    .toSorted((a, b) => a.year - b.year || a.id.localeCompare(b.id))
  const totalWidthFeet = dimensions.panelWidthFeet * boardCount
  const railYFeet =
    dimensions.trussHeightFeet * PRINT_RAIL_POSITION
  const forbiddenZones = createForbiddenZones(
    dimensions.panelWidthFeet,
    boardCount,
  )
  const freePanelSegments = createFreePanelSegments(
    dimensions,
    boardCount,
  )
  const lanes = createLanes(dimensions)
  const { timelineStart, timelineEnd } = getTimelineBounds(
    timeline,
    markers,
  )
  const horizontalInset = Math.min(
    PRINT_TIMELINE_INSET_FEET,
    totalWidthFeet / 3,
  )
  const usableWidth = Math.max(
    0,
    totalWidthFeet - horizontalInset * 2,
  )
  const { markerOffsets, totalWidth: originalTimelineWidth } =
    createOriginalTimelineScale(timeline.markers)

  const ungroupedMarkerColumns = createMarkerColumns(markers, false)
  const primaryLane = lanes.find(
    (lane) => lane.side === "below" && lane.index === 0,
  )
  const ungroupedBoardCounts = Array.from(
    { length: boardCount },
    () => 0,
  )

  for (const column of ungroupedMarkerColumns) {
    const progress = getColumnTimelineProgress(
      column,
      markerOffsets,
      originalTimelineWidth,
    )
    const anchorXFeet = horizontalInset + usableWidth * progress
    const boardIndex = clamp(
      Math.floor(anchorXFeet / dimensions.panelWidthFeet),
      0,
      boardCount - 1,
    )

    ungroupedBoardCounts[boardIndex] += 1
  }

  const needsMonthlyStacking = freePanelSegments.some(
    (segment, boardIndex) =>
      ungroupedBoardCounts[boardIndex] >
      (primaryLane
        ? getLaneBoardCapacity(primaryLane, segment)
        : 0),
  )
  const markerColumns = createMarkerColumns(
    markers,
    needsMonthlyStacking,
  )

  const laneGroups = new Map<string, MarkerLayoutSeed[]>()
  const unavailableLane: SolverLane = {
    id: "unavailable",
    side: "below",
    index: 0,
    topFeet: railYFeet + CONTENT_RAIL_GAP_FEET,
    bottomFeet:
      railYFeet + CONTENT_RAIL_GAP_FEET + LANE_HEIGHT_FEET,
    occupied: [],
  }
  const markerSeeds = markerColumns.map((column, markerIndex) => {
    const marker = column.marker
    const progress = getColumnTimelineProgress(
      column,
      markerOffsets,
      originalTimelineWidth,
    )
    const anchorXFeet = horizontalInset + usableWidth * progress
    const anchorBoardIndex = clamp(
      Math.floor(anchorXFeet / dimensions.panelWidthFeet),
      0,
      boardCount - 1,
    )
    const desiredLeftFeet = anchorXFeet
    const estimatedHeightFeet = estimateMarkerColumnHeight(
      column.markers,
    )
    let selected:
      | {
          lane: SolverLane
          boardIndex: number
          score: number
        }
      | undefined

    const boardCandidates = freePanelSegments
      .map((segment, boardIndex) => ({
        segment,
        boardIndex,
        distance: Math.abs(boardIndex - anchorBoardIndex),
      }))
      .toSorted(
        (a, b) =>
          a.distance - b.distance ||
          a.boardIndex - b.boardIndex,
      )

    for (const boardCandidate of boardCandidates) {
      for (const lane of lanes) {
        if (lane.side !== "below") continue

        const verticalCapacity =
          lane.index === 0
            ? dimensions.trussHeightFeet -
              PRINT_TRUSS_WIDTH_FEET -
              VERTICAL_CLEARANCE_FEET -
              lane.topFeet
            : lane.bottomFeet - lane.topFeet

        if (estimatedHeightFeet > verticalCapacity) continue

        const groupKey = `${boardCandidate.boardIndex}:${lane.id}`
        const group = laneGroups.get(groupKey) ?? []
        const capacity = getLaneBoardCapacity(
          lane,
          boardCandidate.segment,
        )

        if (group.length >= capacity) continue

        const score =
          boardCandidate.distance * 100 +
          lane.index * 10 +
          group.length * 0.01

        if (
          !selected ||
          score < selected.score ||
          (score === selected.score &&
            `${boardCandidate.boardIndex}:${lane.id}` <
              `${selected.boardIndex}:${selected.lane.id}`)
        ) {
          selected = {
            lane,
            boardIndex: boardCandidate.boardIndex,
            score,
          }
        }
      }
    }

    const forced = !selected
    const fallbackLanes = lanes.filter(
      (candidateLane) => candidateLane.side === "below",
    )
    const fallback = freePanelSegments
      .flatMap((_, boardIndex) =>
        fallbackLanes.map((lane) => ({
          lane,
          boardIndex,
          boardDistance: Math.abs(
            boardIndex - anchorBoardIndex,
          ),
          groupLength:
            laneGroups.get(`${boardIndex}:${lane.id}`)
              ?.length ?? 0,
        })),
      )
      .toSorted(
        (a, b) =>
          a.boardDistance - b.boardDistance ||
          a.lane.index - b.lane.index ||
          a.groupLength - b.groupLength,
      )[0]
    const lane = selected?.lane ?? fallback?.lane ?? unavailableLane
    const boardIndex =
      selected?.boardIndex ??
      fallback?.boardIndex ??
      anchorBoardIndex
    const groupKey = `${boardIndex}:${lane.id}`
    const group = laneGroups.get(groupKey) ?? []
    const seed: MarkerLayoutSeed = {
      marker,
      markers: column.markers,
      markerIndex,
      anchorXFeet,
      desiredLeftFeet,
      estimatedHeightFeet,
      boardIndex,
      lane,
      forced,
    }

    group.push(seed)
    laneGroups.set(groupKey, group)

    return seed
  })
  const packedPositions = new Map<number, PackedMarkerPosition>()

  const orderedLaneGroups = [...laneGroups.values()].toSorted(
    (a, b) => {
      const aSeed = a[0]
      const bSeed = b[0]

      if (!aSeed || !bSeed) return 0

      return (
        aSeed.lane.index - bSeed.lane.index ||
        aSeed.boardIndex - bSeed.boardIndex
      )
    },
  )

  for (const group of orderedLaneGroups) {
    const firstSeed = group[0]

    if (!firstSeed) continue

    const boardSegment = freePanelSegments[firstSeed.boardIndex]
    const freeSegments = boardSegment
      ? getLaneBoardSegments(firstSeed.lane, boardSegment)
      : []
    const groupPositions = packLaneBoardGroup(group, freeSegments)

    for (const [markerIndex, position] of groupPositions) {
      packedPositions.set(markerIndex, position)
    }
  }

  const placements = markerSeeds.map((seed) => {
    const boardSegment = freePanelSegments[seed.boardIndex]
    const fallbackStart =
      boardSegment?.start ??
      seed.boardIndex * dimensions.panelWidthFeet
    const fallbackEnd =
      boardSegment?.end ??
      (seed.boardIndex + 1) * dimensions.panelWidthFeet
    const fallbackLeft = clamp(
      seed.desiredLeftFeet,
      fallbackStart,
      Math.max(
        fallbackStart,
        fallbackEnd - PRINT_CONTENT_WIDTH_FEET,
      ),
    )
    const packedPosition = packedPositions.get(seed.markerIndex)
    const contentLeftFeet =
      packedPosition?.left ?? fallbackLeft
    const connectorXFeet =
      packedPosition?.connectorX ??
      contentLeftFeet
    const displacementFeet =
      packedPosition?.displacement ??
      Math.abs(connectorXFeet - seed.anchorXFeet)
    const contentTopFeet =
      seed.lane.side === "above"
        ? seed.lane.bottomFeet - seed.estimatedHeightFeet
        : seed.lane.index === 0
          ? seed.lane.topFeet
          : seed.lane.bottomFeet - seed.estimatedHeightFeet

    return {
      marker: seed.marker,
      markers: seed.markers,
      timelineAnchorXFeet: seed.anchorXFeet,
      anchorXFeet: contentLeftFeet,
      contentLeftFeet,
      contentTopFeet,
      contentWidthFeet: PRINT_CONTENT_WIDTH_FEET,
      estimatedHeightFeet: seed.estimatedHeightFeet,
      connectorXFeet: contentLeftFeet,
      laneId: seed.lane.id,
      laneIndex: seed.lane.index,
      laneSide: seed.lane.side,
      boardIndex: seed.boardIndex,
      displacementFeet,
      forced: seed.forced || packedPosition?.forced === true,
    }
  })

  const forcedPlacements = placements.filter(
    (placement) => placement.forced,
  ).length
  const totalDisplacement = placements.reduce(
    (total, placement) => total + placement.displacementFeet,
    0,
  )
  const maximumDisplacementFeet = placements.reduce(
    (maximum, placement) =>
      Math.max(maximum, placement.displacementFeet),
    0,
  )
  const capacityWidth = freePanelSegments.reduce(
    (total, segment) => total + segment.end - segment.start,
    0,
  )
  const estimatedCapacity =
    (capacityWidth * lanes.length) /
    (PRINT_CONTENT_WIDTH_FEET + CONTENT_GAP_FEET)
  const utilization =
    estimatedCapacity > 0
      ? markerColumns.length / estimatedCapacity
      : 1
  let status: PrintFitStatus = "comfortable"

  if (forcedPlacements > 0 || lanes.length === 0) {
    status = "impossible"
  } else if (
    maximumDisplacementFeet > COMFORTABLE_DISPLACEMENT_FEET ||
    utilization > 0.72
  ) {
    status = "tight"
  }

  return {
    totalWidthFeet,
    railYFeet,
    timelineStart,
    timelineEnd,
    forbiddenZones,
    lanes: lanes.map((lane) => ({
      id: lane.id,
      side: lane.side,
      index: lane.index,
      topFeet: lane.topFeet,
      bottomFeet: lane.bottomFeet,
    })),
    placements,
    fit: {
      status,
      markerCount: markerColumns.length,
      laneCount: lanes.length,
      forcedPlacements,
      maximumDisplacementFeet,
      averageDisplacementFeet:
        placements.length > 0
          ? totalDisplacement / placements.length
          : 0,
      utilization,
    },
  }
}

function getRecommendations(
  timeline: LifelineRecord,
  trussHeightFeet: number,
  currentDimensions: PrintDimensions,
  currentBoardCount: number,
  currentFit: PrintLayoutFit,
) {
  const candidates: PrintLayoutRecommendation[] = []

  for (const panelWidthFeet of RECOMMENDED_PANEL_WIDTHS) {
    for (
      let boardCount = Math.max(
        PRINT_BOARD_COUNT_MIN,
        RECOMMENDED_BOARD_COUNT_MIN,
      );
      boardCount <=
      Math.min(PRINT_BOARD_COUNT_MAX, RECOMMENDED_BOARD_COUNT_MAX);
      boardCount++
    ) {
      if (
        panelWidthFeet === currentDimensions.panelWidthFeet &&
        boardCount === currentBoardCount
      ) {
        continue
      }

      const candidate = solveBaseLayout(
        timeline,
        {
          panelWidthFeet,
          trussHeightFeet,
        },
        boardCount,
      )

      if (candidate.fit.status === "impossible") continue

      candidates.push({
        panelWidthFeet,
        boardCount,
        totalWidthFeet: candidate.totalWidthFeet,
        status: candidate.fit.status,
      })
    }
  }

  const statusRank: Record<PrintFitStatus, number> = {
    comfortable: 0,
    tight: 1,
    impossible: 2,
  }
  const improvingCandidates = candidates.filter(
    (candidate) =>
      statusRank[candidate.status] < statusRank[currentFit.status] &&
      candidate.totalWidthFeet >=
        currentDimensions.panelWidthFeet * currentBoardCount,
  )
  const recommendationPool =
    improvingCandidates.length > 0
      ? improvingCandidates
      : candidates.filter(
          (candidate) =>
            candidate.totalWidthFeet >=
            currentDimensions.panelWidthFeet * currentBoardCount,
        )

  return recommendationPool
    .toSorted((a, b) => {
      const boardCountDifference =
        Math.abs(a.boardCount - currentBoardCount) -
        Math.abs(b.boardCount - currentBoardCount)

      if (boardCountDifference !== 0) return boardCountDifference

      const widthDifference = a.totalWidthFeet - b.totalWidthFeet

      if (widthDifference !== 0) return widthDifference

      const statusDifference =
        Number(a.status !== "comfortable") -
        Number(b.status !== "comfortable")

      if (statusDifference !== 0) return statusDifference

      const currentWidthDifference =
        Math.abs(a.panelWidthFeet - currentDimensions.panelWidthFeet) -
        Math.abs(b.panelWidthFeet - currentDimensions.panelWidthFeet)

      if (currentWidthDifference !== 0) return currentWidthDifference

      return a.boardCount - b.boardCount
    })
    .filter(
      (candidate, index, allCandidates) =>
        allCandidates.findIndex(
          (other) =>
            other.totalWidthFeet === candidate.totalWidthFeet &&
            other.status === candidate.status,
        ) === index,
    )
    .slice(0, 3)
}

export function solvePrintLayout(
  timeline: LifelineRecord,
  dimensions: PrintDimensions,
  boardCount: number,
): PrintLayoutResult {
  const layout = solveBaseLayout(timeline, dimensions, boardCount)

  return {
    ...layout,
    recommendations: getRecommendations(
      timeline,
      dimensions.trussHeightFeet,
      dimensions,
      boardCount,
      layout.fit,
    ),
  }
}
