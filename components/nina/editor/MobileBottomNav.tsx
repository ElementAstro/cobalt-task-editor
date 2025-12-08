"use client";

import { Package, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface MobileBottomNavProps {
  onToolboxOpen: () => void;
  onPropertiesOpen: () => void;
  itemCount: number;
  hasSelection: boolean;
  translations: {
    toolbox: string;
    properties: string;
    items: string;
  };
}

export function MobileBottomNav({
  onToolboxOpen,
  onPropertiesOpen,
  itemCount,
  hasSelection,
  translations: t,
}: MobileBottomNavProps) {
  return (
    <nav
      className="sm:hidden flex items-center bg-card border-t border-border py-1 px-1 safe-area-inset-bottom"
      aria-label="Mobile navigation"
    >
      {/* Toolbox Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToolboxOpen}
        className="flex-1 flex-col h-auto py-2 gap-0.5 min-w-0 rounded-lg active:bg-accent/70 touch-manipulation"
        aria-label={t.toolbox}
      >
        <Package className="w-5 h-5" />
        <span className="text-[10px] font-medium truncate">{t.toolbox}</span>
      </Button>

      <Separator orientation="vertical" className="h-10 mx-0.5" />

      {/* Quick Info - Item Count */}
      <div className="flex-1 flex flex-col items-center justify-center py-2 min-w-0">
        <span className="text-sm font-semibold tabular-nums">{itemCount}</span>
        <span className="text-[10px] text-muted-foreground truncate">
          {t.items}
        </span>
      </div>

      <Separator orientation="vertical" className="h-10 mx-0.5" />

      {/* Properties Button - with selection indicator */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onPropertiesOpen}
        className={`flex-1 flex-col h-auto py-2 gap-0.5 min-w-0 relative rounded-lg active:bg-accent/70 touch-manipulation ${hasSelection ? "text-primary" : ""}`}
        aria-label={t.properties}
      >
        <Settings2 className="w-5 h-5" />
        <span className="text-[10px] font-medium truncate">{t.properties}</span>
        {hasSelection && (
          <span className="absolute top-1.5 right-1/4 w-2 h-2 bg-primary rounded-full animate-pulse" />
        )}
      </Button>
    </nav>
  );
}
