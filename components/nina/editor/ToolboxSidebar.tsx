"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SequenceToolbox } from "../SequenceToolbox";

export interface ToolboxSidebarProps {
  expanded: boolean;
  width: number;
  onExpandedChange: (expanded: boolean) => void;
  onResizeStart: () => void;
  title: string;
}

export function ToolboxSidebar({
  expanded,
  width,
  onExpandedChange,
  onResizeStart,
  title,
}: ToolboxSidebarProps) {
  return (
    <>
      <aside
        data-tour="toolbox"
        style={{ width: expanded ? `${width}px` : "40px" }}
        className={`hidden sm:flex flex-col bg-card border-r border-border transition-all duration-300 ease-out ${
          expanded ? "" : "w-10"
        }`}
      >
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-border shrink-0 min-h-[40px]">
          <span
            className={`text-sm font-medium truncate pl-1 transition-all duration-200 ${expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 absolute"}`}
          >
            {title}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onExpandedChange(!expanded)}
            className="ml-auto h-7 w-7 shrink-0 transition-transform duration-200 hover:scale-105"
            aria-label={expanded ? "Collapse toolbox" : "Expand toolbox"}
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-200 ${expanded ? "" : "rotate-180"}`}
            />
          </Button>
        </div>
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <SequenceToolbox />
        </div>
      </aside>

      {expanded && (
        <div
          onMouseDown={onResizeStart}
          className="hidden sm:block w-1.5 cursor-col-resize bg-border/20 hover:bg-border transition-colors"
          role="separator"
          aria-orientation="vertical"
        />
      )}
    </>
  );
}
