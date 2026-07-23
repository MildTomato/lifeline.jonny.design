export const PRINT_DIMENSION_MIN_FEET = 1
export const PRINT_DIMENSION_MAX_FEET = 12
export const DEFAULT_PRINT_DIMENSIONS = {
  panelWidthFeet: 8,
  trussHeightFeet: 10,
} as const
export const PRINT_BOARD_COUNT_MIN = 1
export const PRINT_BOARD_COUNT_MAX = 16
export const DEFAULT_PRINT_BOARD_COUNT = 8
export const DEFAULT_SHOW_PRINT_GUIDES = true

export interface PrintDimensions {
  panelWidthFeet: number
  trussHeightFeet: number
}

type SearchParamValue = string | string[] | undefined

function getLastSearchParamValue(value: SearchParamValue) {
  return Array.isArray(value) ? value.at(-1) : value
}

export function normalizePrintDimension(
  value: number,
  fallback: number,
) {
  if (!Number.isFinite(value)) return fallback

  return Math.min(
    PRINT_DIMENSION_MAX_FEET,
    Math.max(PRINT_DIMENSION_MIN_FEET, Math.round(value)),
  )
}

export function getPrintDimensionsFromSearchParams(searchParams: {
  panelWidth?: SearchParamValue
  trussHeight?: SearchParamValue
}): PrintDimensions {
  const panelWidth = Number(
    getLastSearchParamValue(searchParams.panelWidth),
  )
  const trussHeight = Number(
    getLastSearchParamValue(searchParams.trussHeight),
  )

  return {
    panelWidthFeet: normalizePrintDimension(
      panelWidth,
      DEFAULT_PRINT_DIMENSIONS.panelWidthFeet,
    ),
    trussHeightFeet: normalizePrintDimension(
      trussHeight,
      DEFAULT_PRINT_DIMENSIONS.trussHeightFeet,
    ),
  }
}

export function getShowPrintGuidesFromSearchParams(searchParams: {
  guides?: SearchParamValue
}) {
  const guides = getLastSearchParamValue(searchParams.guides)

  return guides === undefined
    ? DEFAULT_SHOW_PRINT_GUIDES
    : guides !== "off"
}

export function normalizePrintBoardCount(
  value: number,
  fallback = DEFAULT_PRINT_BOARD_COUNT,
) {
  if (!Number.isFinite(value)) return fallback

  return Math.min(
    PRINT_BOARD_COUNT_MAX,
    Math.max(PRINT_BOARD_COUNT_MIN, Math.round(value)),
  )
}

export function getPrintBoardCountFromSearchParams(searchParams: {
  boards?: SearchParamValue
}) {
  return normalizePrintBoardCount(
    Number(getLastSearchParamValue(searchParams.boards)),
  )
}
