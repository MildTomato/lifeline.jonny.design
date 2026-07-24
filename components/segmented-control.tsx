"use client"

import { useId } from "react"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"

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
  const layoutGroupId = useId()
  const shouldReduceMotion = useReducedMotion()

  function handleValueChange(values: string[]) {
    const nextValue = values.at(-1)
    const nextItem = items.find((item) => item.value === nextValue)

    if (nextItem) {
      onValueChange(nextItem.value)
    }
  }

  return (
    <LayoutGroup id={layoutGroupId}>
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
                "relative h-8 min-w-24 rounded-full px-3.5 font-normal aria-pressed:bg-transparent data-[state=on]:bg-transparent",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:bg-transparent hover:text-foreground",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="active-pill"
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-secondary shadow-sm ring-1 ring-border"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }
                  }
                />
              ) : null}
              <span className="relative">{item.label}</span>
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
    </LayoutGroup>
  )
}
