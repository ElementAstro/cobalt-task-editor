"use client";

interface DropIndicatorProps {
  depth: number;
}

export function DropIndicator({ depth }: DropIndicatorProps) {
  return (
    <div
      className="h-0.5 sm:h-1 bg-primary rounded-full transition-all duration-150 animate-pulse"
      style={{
        marginLeft: `${Math.max(depth * 12, 8)}px`,
        marginRight: "8px",
        opacity: 1,
      }}
    />
  );
}
