"use client"

import { RulerIcon } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import {
  PRINT_DIMENSION_MAX_FEET,
  PRINT_DIMENSION_MIN_FEET,
  PRINT_BOARD_COUNT_MAX,
  PRINT_BOARD_COUNT_MIN,
  type PrintDimensions,
} from "@/lib/print-dimensions"
import type { PrintLayoutResult } from "@/lib/print-layout"

const dimensionOptions = Array.from(
  {
    length:
      PRINT_DIMENSION_MAX_FEET - PRINT_DIMENSION_MIN_FEET + 1,
  },
  (_, index) => {
    const value = String(index + PRINT_DIMENSION_MIN_FEET)

    return {
      label: `${value} ft`,
      value,
    }
  },
)

const boardCountOptions = Array.from(
  {
    length: PRINT_BOARD_COUNT_MAX - PRINT_BOARD_COUNT_MIN + 1,
  },
  (_, index) => {
    const value = String(index + PRINT_BOARD_COUNT_MIN)

    return {
      label: `${value} ${value === "1" ? "board" : "boards"}`,
      value,
    }
  },
)

interface SettingSelectProps {
  label: string
  value: number
  disabled?: boolean
  options: {
    label: string
    value: string
  }[]
  formatSelectedValue: (value: string) => string
  onChange: (value: number) => void
}

function SettingSelect({
  label,
  value,
  disabled,
  options,
  formatSelectedValue,
  onChange,
}: SettingSelectProps) {
  return (
    <Select
      items={options}
      value={String(value)}
      disabled={disabled}
      onValueChange={(nextValue) => {
        if (nextValue !== null) {
          onChange(Number(nextValue))
        }
      }}
    >
      <SelectTrigger
        aria-label={label}
        size="sm"
        className="rounded-full bg-background/90 px-3 text-[11px] font-normal shadow-xl backdrop-blur-xl data-[size=sm]:rounded-full"
      >
        <SelectValue>
          {(selectedValue: string) => (
            <>
              <span className="text-muted-foreground">{label}</span>
              <span className="tabular-nums text-foreground">
                {formatSelectedValue(selectedValue)}
              </span>
            </>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start">
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

interface PrintDimensionControlsProps {
  dimensions: PrintDimensions
  plannedBoardCount: number
  renderedBoardCount: number
  layout: PrintLayoutResult
  showGuides: boolean
  onPanelWidthChange: (value: number) => void
  onTrussHeightChange: (value: number) => void
  onShowGuidesChange: (showGuides: boolean) => void
  onPlannedBoardCountChange: (boardCount: number) => void
}

export function PrintDimensionControls({
  dimensions,
  plannedBoardCount,
  renderedBoardCount,
  layout,
  showGuides,
  onPanelWidthChange,
  onTrussHeightChange,
  onShowGuidesChange,
  onPlannedBoardCountChange,
}: PrintDimensionControlsProps) {
  const totalWallWidth =
    dimensions.panelWidthFeet * renderedBoardCount
  const fitLabel = {
    comfortable: "Comfortable fit",
    tight: "Tight fit",
    impossible: "Impossible fit",
  }[layout.fit.status]
  const recommendations = layout.recommendations.slice(0, 2)
  return (
    <aside
      aria-label="Print wall dimensions"
      data-fit={layout.fit.status}
      data-maximum-displacement={Number(
        layout.fit.maximumDisplacementFeet.toFixed(2),
      )}
      className="flex items-center gap-2 whitespace-nowrap"
    >
      <SettingSelect
        label="Panel width"
        value={dimensions.panelWidthFeet}
        options={dimensionOptions}
        formatSelectedValue={(value) => `${value} ft`}
        onChange={onPanelWidthChange}
      />
      <SettingSelect
        label="Truss height"
        value={dimensions.trussHeightFeet}
        options={dimensionOptions}
        formatSelectedValue={(value) => `${value} ft`}
        onChange={onTrussHeightChange}
      />
      <SettingSelect
        label="Boards"
        value={plannedBoardCount}
        options={boardCountOptions}
        formatSelectedValue={(value) => value}
        onChange={onPlannedBoardCountChange}
      />
      <Toggle
        aria-label={
          showGuides
            ? "Hide dimension guides"
            : "Show dimension guides"
        }
        variant="outline"
        size="sm"
        pressed={showGuides}
        onPressedChange={onShowGuidesChange}
        className="rounded-full bg-background/90 px-3 text-[11px] font-normal shadow-xl backdrop-blur-xl"
      >
        <RulerIcon data-icon="inline-start" />
        {showGuides ? "Hide dimensions" : "Show dimensions"}
      </Toggle>
      <div
        aria-live="polite"
        className="flex flex-col items-start px-1 text-[11px] font-normal leading-4 text-muted-foreground"
      >
        <p>
          {`Straight wall · ${renderedBoardCount} boards · ${totalWallWidth} ft`}
        </p>
        <p>
          <span className="text-foreground">{fitLabel}</span>
          {` · ${layout.fit.markerCount} anchors · ${layout.fit.laneCount} lanes`}
          {layout.fit.status !== "comfortable" &&
          recommendations.length > 0
            ? ` · Try ${recommendations
                .map(
                  (recommendation) =>
                    `${recommendation.boardCount}×${recommendation.panelWidthFeet} ft`,
                )
                .join(" or ")}`
            : null}
        </p>
      </div>
    </aside>
  )
}
