"use client"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

interface SegmentedControlItem<Value extends string> {
  value: Value
  label: string
  ariaLabel: string
}

interface SegmentedControlProps<Value extends string> {
  value: Value
  items: readonly SegmentedControlItem<Value>[]
  onValueChange: (value: Value) => void
  ariaLabel: string
  disabled?: boolean
}

export function SegmentedControl<Value extends string>({
  value,
  items,
  onValueChange,
  ariaLabel,
  disabled,
}: SegmentedControlProps<Value>) {
  function handleValueChange(values: string[]) {
    const nextValue = values.at(-1)
    const nextItem = items.find((item) => item.value === nextValue)

    if (nextItem) {
      onValueChange(nextItem.value)
    }
  }

  return (
    <ToggleGroup
      value={[value]}
      onValueChange={handleValueChange}
      disabled={disabled}
      size="sm"
      spacing={1}
      aria-label={ariaLabel}
      className="relative rounded-full"
    >
      {items.map((item) => {
        const isActive = value === item.value

        return (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            aria-label={item.ariaLabel}
            className={cn(
              "h-8 min-w-24 rounded-full px-3.5 font-normal",
              isActive
                ? "bg-secondary text-foreground ring-1 ring-border"
                : "text-muted-foreground hover:bg-secondary/60",
            )}
          >
            {item.label}
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
