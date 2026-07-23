import type { LifelineMarker } from "./types"

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function hasMarkerContent(marker: LifelineMarker) {
  return (
    marker.events.length > 0 ||
    (marker.photos?.length ?? 0) > 0 ||
    (marker.companies?.length ?? 0) > 0 ||
    (marker.mentors?.length ?? 0) > 0 ||
    (marker.met?.length ?? 0) > 0
  )
}

export function hasMarkerPeople(marker: LifelineMarker) {
  return (marker.mentors?.length ?? 0) > 0 || (marker.met?.length ?? 0) > 0
}

export function isFirstMarkerInAxisGroup(
  markers: LifelineMarker[],
  index: number,
) {
  if (index === 0) return true

  const marker = markers[index]
  const previousMarker = markers[index - 1]
  if (!marker || !previousMarker) return true

  const group = String(marker.label ?? Math.floor(marker.year))
  const previousGroup = String(
    previousMarker.label ?? Math.floor(previousMarker.year),
  )

  return group !== previousGroup
}

export function isFirstMarkerInAgeGroup(
  markers: LifelineMarker[],
  index: number,
  birthYear: number,
) {
  if (index === 0) return true

  const marker = markers[index]
  const previousMarker = markers[index - 1]
  if (!marker || !previousMarker) return true

  const age = marker.age ?? marker.year - birthYear
  const previousAge =
    previousMarker.age ?? previousMarker.year - birthYear

  return String(age) !== String(previousAge)
}

export function getMarkerHeight(marker: LifelineMarker, nextYear?: number) {
  const hasContent = hasMarkerContent(marker)
  const hasPeople = hasMarkerPeople(marker)

  if (!hasContent) return 48

  const peopleOnly =
    hasPeople &&
    marker.events.length === 0 &&
    (marker.companies?.length ?? 0) === 0

  let height = 96

  if (marker.companies?.length) height += 28
  height += marker.events.length * 44

  if (peopleOnly) height += 88
  else if (hasPeople) height += 108

  if (!nextYear) return Math.min(520, Math.max(peopleOnly ? 148 : 188, height))

  const gap = Math.max(1, nextYear - marker.year)
  height += Math.min(32, gap * 3)

  return Math.min(520, Math.max(peopleOnly ? 148 : 188, height))
}

export function getMarkerWidth(marker: LifelineMarker, nextYear?: number) {
  const hasContent = hasMarkerContent(marker)
  const hasPeople = hasMarkerPeople(marker)

  if (!nextYear) return hasContent ? 360 : 80
  if (!hasContent) return 80

  const peopleOnly =
    hasPeople &&
    marker.events.length === 0 &&
    (marker.companies?.length ?? 0) === 0

  if (peopleOnly) return 220

  const gap = Math.max(1, nextYear - marker.year)
  return Math.min(420, Math.max(290, gap * 36))
}
