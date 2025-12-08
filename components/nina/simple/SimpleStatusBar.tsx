"use client";

import { Target, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatDuration } from "@/lib/nina/simple-sequence-types";
import type { Translations } from "@/lib/i18n";

interface SimpleStatusBarProps {
  targetCount: number;
  overallDuration: number | null;
  savePath: string | null;
  t: Translations;
}

export function SimpleStatusBar({
  targetCount,
  overallDuration,
  savePath,
  t,
}: SimpleStatusBarProps) {
  return (
    <footer className="hidden sm:flex items-center justify-between px-3 lg:px-4 py-1 lg:py-1.5 bg-card border-t border-border text-[11px] lg:text-xs text-muted-foreground">
      <div className="flex items-center gap-3 lg:gap-4">
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          <span className="hidden md:inline">
            {t.simple?.targets || "Targets"}:
          </span>
          <span className="font-medium tabular-nums">{targetCount}</span>
        </span>
        <Separator orientation="vertical" className="h-3" />
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span className="hidden md:inline">
            {t.simple?.totalDuration || "Duration"}:
          </span>
          <span className="font-medium tabular-nums">
            {overallDuration ? formatDuration(overallDuration) : "--"}
          </span>
        </span>
      </div>
      <div className="truncate max-w-[200px] lg:max-w-none">
        {savePath ? (
          <span className="opacity-60">{savePath}</span>
        ) : (
          <span className="opacity-60">{t.simple?.unsaved || "Unsaved"}</span>
        )}
      </div>
    </footer>
  );
}
