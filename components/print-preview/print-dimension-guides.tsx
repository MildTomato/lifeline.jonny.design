interface HorizontalDimensionGuideProps {
  widthFeet: number
}

export function HorizontalDimensionGuide({
  widthFeet,
}: HorizontalDimensionGuideProps) {
  return (
    <div
      aria-hidden="true"
      data-slot="print-dimension-guide"
      data-orientation="horizontal"
      className="pointer-events-none absolute inset-x-0 -top-5 z-10 h-5 text-[var(--print-guide)]"
    >
      <span className="absolute inset-x-0 top-0 border-t border-current" />
      <span className="absolute bottom-0 left-0 top-0 border-l border-dashed border-current" />
      <span className="absolute bottom-0 right-0 top-0 border-r border-dashed border-current" />
      <span className="absolute left-0 top-0 h-1 border-l border-current" />
      <span className="absolute bottom-0 left-0 h-1 border-l border-current" />
      <span className="absolute right-0 top-0 h-1 border-r border-current" />
      <span className="absolute bottom-0 right-0 h-1 border-r border-current" />

      {Array.from({ length: widthFeet + 1 }, (_, index) => (
        <span
          key={index}
          className="absolute top-0 h-1.5 border-l border-current"
          style={{ left: `${(index / widthFeet) * 100}%` }}
        />
      ))}

      <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-[var(--print-stage)] px-1.5 text-[8px] font-normal leading-none tabular-nums">
        {widthFeet} ft
      </span>
    </div>
  )
}

interface VerticalDimensionGuideProps {
  heightFeet: number
}

export function VerticalDimensionGuide({
  heightFeet,
}: VerticalDimensionGuideProps) {
  return (
    <div
      aria-hidden="true"
      data-slot="print-dimension-guide"
      data-orientation="vertical"
      className="pointer-events-none absolute inset-y-0 z-10 w-5 text-[var(--print-guide)]"
      style={{
        left: "calc((var(--print-truss-size) / -2) - 1.25rem)",
      }}
    >
      <span className="absolute inset-y-0 left-0 border-l border-current" />
      <span className="absolute left-0 right-0 top-0 border-t border-dashed border-current" />
      <span className="absolute bottom-0 left-0 right-0 border-b border-dashed border-current" />
      <span className="absolute left-0 top-0 w-1 border-t border-current" />
      <span className="absolute right-0 top-0 w-1 border-t border-current" />
      <span className="absolute bottom-0 left-0 w-1 border-b border-current" />
      <span className="absolute bottom-0 right-0 w-1 border-b border-current" />

      {Array.from({ length: heightFeet + 1 }, (_, index) => (
        <span
          key={index}
          className="absolute left-0 w-1.5 border-t border-current"
          style={{ top: `${(index / heightFeet) * 100}%` }}
        />
      ))}

      <span className="absolute left-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[var(--print-stage)] px-1.5 text-[8px] font-normal leading-none tabular-nums">
        {heightFeet} ft
      </span>
    </div>
  )
}
