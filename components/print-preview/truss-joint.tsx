import { cn } from "@/lib/utils"

interface TrussJointProps {
  className?: string
}

export function TrussJoint({ className }: TrussJointProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
      shapeRendering="geometricPrecision"
    >
      <g
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      >
        <rect
          x="1"
          y="1"
          width="62"
          height="62"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="6"
          y="6"
          width="52"
          height="52"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M2 2L62 62M62 2L2 62"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  )
}
