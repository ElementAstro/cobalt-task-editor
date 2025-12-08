"use client";

import { Info } from "lucide-react";

export interface ToolboxInfoBannerProps {
  message: string;
  variant?: "yellow" | "purple";
}

export function ToolboxInfoBanner({
  message,
  variant = "yellow",
}: ToolboxInfoBannerProps) {
  const colorClasses =
    variant === "yellow"
      ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
      : "bg-purple-500/10 border-purple-500/20 text-purple-400";

  return (
    <div className={`mb-2 sm:mb-3 p-2 border rounded-md ${colorClasses}`}>
      <p className="text-[11px] sm:text-xs flex items-center gap-1.5">
        <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
        <span>{message}</span>
      </p>
    </div>
  );
}
