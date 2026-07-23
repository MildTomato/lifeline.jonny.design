import { cn } from "@/lib/utils"

const BRACE_COUNT = 16
const BRACE_HEIGHT = 46

interface TrussStandProps {
  className?: string
}

/**
 * A flat, front-on truss upright for the print-wall mockup.
 * It deliberately has no perspective or corner geometry: the installation is
 * represented as one continuous straight wall.
 */
export function TrussStand({ className }: TrussStandProps) {
  return (
    <svg
      viewBox="0 0 64 736"
      fill="none"
      aria-hidden="true"
      className={cn("h-full w-full overflow-visible", className)}
      preserveAspectRatio="none"
      shapeRendering="geometricPrecision"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M1 0V736M63 0V736"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M6 0V736M58 0V736"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        {Array.from({ length: BRACE_COUNT }, (_, index) => {
          const top = index * BRACE_HEIGHT
          const bottom = top + BRACE_HEIGHT

          return (
            <g key={top} strokeWidth="1">
              <path
                d={`M2 ${top}L62 ${bottom}`}
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={`M62 ${top}L2 ${bottom}`}
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={`M1 ${top}H63`}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )
        })}

        <path
          d="M1 736H63"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  )
}
