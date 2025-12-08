"use client";

import { Badge } from "@/components/ui/badge";
import type { Translations } from "@/lib/i18n";

interface EditorStatusBarProps {
  itemCount: number;
  selectedItemName?: string;
  t: Translations;
}

export function EditorStatusBar({
  itemCount,
  selectedItemName,
  t,
}: EditorStatusBarProps) {
  return (
    <footer className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="h-5 text-[10px]">
          {itemCount} {t.toolbox.items}
        </Badge>
      </div>

      {selectedItemName && (
        <div className="truncate max-w-[200px]">
          {"Selected"}: {selectedItemName}
        </div>
      )}
    </footer>
  );
}
