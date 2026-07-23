import { cn } from "@/lib/utils"

const BRACE_COUNT = 10
const VIEWBOX_WIDTH = 640
const BRACE_WIDTH = VIEWBOX_WIDTH / BRACE_COUNT

interface HorizontalTrussProps {
  className?: string
}

export function HorizontalTruss({
  className,
}: HorizontalTrussProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} 64`}
      fill="none"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
      preserveAspectRatio="none"
      shapeRendering="geometricPrecision"
    >
      <g
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d={`M0 1H${VIEWBOX_WIDTH}M0 63H${VIEWBOX_WIDTH}`}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={`M0 6H${VIEWBOX_WIDTH}M0 58H${VIEWBOX_WIDTH}`}
          vectorEffect="non-scaling-stroke"
        />

        {Array.from({ length: BRACE_COUNT }, (_, index) => {
          const left = index * BRACE_WIDTH
          const right = left + BRACE_WIDTH

          return (
            <g key={left}>
              <path
                d={`M${left} 2L${right} 62`}
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={`M${right} 2L${left} 62`}
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={`M${left} 1V63`}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )
        })}

        <path
          d={`M${VIEWBOX_WIDTH} 1V63`}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  )
}
