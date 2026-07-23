import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

interface PersonSilhouetteProps {
  label: string
  src: string
  aspectRatio: string
  className?: string
}

const silhouetteStyle = {
  filter:
    "grayscale(100%) drop-shadow(1px 0 0 #52525b) drop-shadow(-1px 0 0 #52525b) drop-shadow(0 1px 0 #52525b) drop-shadow(0 -1px 0 #52525b)",
} satisfies CSSProperties

function PersonSilhouette({
  label,
  src,
  aspectRatio,
  className,
}: PersonSilhouetteProps) {
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ aspectRatio }}
    >
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[6px] font-normal tabular-nums text-zinc-600">
        {label}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="pointer-events-none h-full w-full select-none object-contain object-bottom"
        style={silhouetteStyle}
      />
    </div>
  )
}

export function PeopleScale({ className }: { className?: string }) {
  return (
    <div
      aria-label="Two realistic adult silhouettes shown at five feet six inches and six feet tall"
      className={cn("flex items-end gap-3 opacity-90", className)}
    >
      <PersonSilhouette
        label="5′6″"
        src="/images/people/standing-person-5ft6.png"
        aspectRatio="266 / 901"
        className="h-[91.67%]"
      />
      <PersonSilhouette
        label="6′0″"
        src="/images/people/standing-person-6ft.png"
        aspectRatio="301 / 1001"
        className="h-full"
      />
    </div>
  )
}
