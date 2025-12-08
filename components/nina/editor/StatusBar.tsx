"use client";

import { Separator } from "@/components/ui/separator";

export interface StatusBarProps {
  itemCount: number;
  triggerCount: number;
  selectedItemId: string | null;
  translations: {
    items: string;
    triggers: string;
    noSelection: string;
  };
}

export function StatusBar({
  itemCount,
  triggerCount,
  selectedItemId,
  translations: t,
}: StatusBarProps) {
  return (
    <footer className="hidden sm:flex items-center justify-between px-3 lg:px-4 py-1 lg:py-1.5 bg-card border-t border-border text-[11px] lg:text-xs text-muted-foreground">
      <div className="flex items-center gap-3 lg:gap-4">
        <span className="flex items-center gap-1">
          <span className="hidden md:inline">{t.items}:</span>
          <span className="font-medium tabular-nums">{itemCount}</span>
        </span>
        <Separator orientation="vertical" className="h-3" />
        <span className="flex items-center gap-1">
          <span className="hidden md:inline">{t.triggers}:</span>
          <span className="font-medium tabular-nums">{triggerCount}</span>
        </span>
      </div>
      <div className="truncate max-w-[200px] lg:max-w-none">
        {selectedItemId ? (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="hidden lg:inline">Selected:</span>
            <code className="text-[10px] lg:text-xs">
              {selectedItemId.substring(0, 8)}...
            </code>
          </span>
        ) : (
          <span className="opacity-60">{t.noSelection}</span>
        )}
      </div>
    </footer>
  );
}
