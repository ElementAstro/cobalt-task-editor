"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyPanel } from "../PropertyPanel";

export interface PropertySidebarProps {
  expanded: boolean;
  width: number;
  onExpandedChange: (expanded: boolean) => void;
  onResizeStart: () => void;
  title: string;
}

export function PropertySidebar({
  expanded,
  width,
  onExpandedChange,
  onResizeStart,
  title,
}: PropertySidebarProps) {
  return (
    <>
      {expanded && (
        <div
          onMouseDown={onResizeStart}
          className="hidden sm:block w-1.5 cursor-col-resize bg-border/20 hover:bg-border transition-colors"
          role="separator"
          aria-orientation="vertical"
        />
      )}

      <aside
        data-tour="properties"
        style={{
          width: expanded ? `${width}px` : "40px",
        }}
        className={`hidden sm:flex flex-col bg-card border-l border-border transition-all duration-300 ease-out ${
          expanded ? "" : "w-10"
        }`}
      >
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-border shrink-0 min-h-[40px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onExpandedChange(!expanded)}
            className="h-7 w-7 shrink-0 transition-transform duration-200 hover:scale-105"
            aria-label={expanded ? "Collapse properties" : "Expand properties"}
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${expanded ? "" : "rotate-180"}`}
            />
          </Button>
          <span
            className={`text-sm font-medium truncate pr-1 transition-all duration-200 ${expanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 absolute right-0"}`}
          >
            {title}
          </span>
        </div>
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <PropertyPanel />
        </div>
      </aside>
    </>
  );
}
