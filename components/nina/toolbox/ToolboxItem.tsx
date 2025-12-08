"use client";

import { memo, useCallback } from "react";
import { GripVertical, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ItemDefinition } from "@/lib/nina/constants";
import { iconMap } from "./ToolboxIconMap";
import { Box } from "lucide-react";

export interface ToolboxItemProps {
  item: ItemDefinition;
  onDragStart: (e: React.DragEvent) => void;
  onClick: () => void;
  getName: (item: ItemDefinition) => string;
  getDescription: (item: ItemDefinition) => string;
  isMobile?: boolean;
  colorClass?: string;
}

function ToolboxItemComponent({
  item,
  onDragStart,
  onClick,
  getName,
  getDescription,
  isMobile = false,
  colorClass = "text-muted-foreground",
}: ToolboxItemProps) {
  // Get icon component directly from map to avoid creating during render
  const IconComponent = item.icon ? iconMap[item.icon] || Box : Box;

  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          draggable={!isMobile}
          onDragStart={onDragStart}
          onClick={handleClick}
          onDoubleClick={handleClick}
          className={`flex items-center gap-1.5 sm:gap-2 px-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-accent active:bg-accent/80 rounded cursor-pointer sm:cursor-grab active:cursor-grabbing touch-manipulation select-none ${isMobile ? "py-2.5 min-h-[44px]" : "py-1.5 sm:py-2"}`}
          role="button"
          aria-label={`Add ${getName(item)}`}
        >
          <GripVertical
            className="w-3 h-3 text-muted-foreground/50 hidden sm:block shrink-0"
            aria-hidden
          />
          <IconComponent
            className={`w-4 h-4 ${colorClass} shrink-0`}
            aria-hidden
          />
          <span className="truncate flex-1 text-left">{getName(item)}</span>
          <Plus
            className="w-4 h-4 text-muted-foreground/70 sm:hidden shrink-0"
            aria-hidden
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs hidden sm:block">
        <p className="text-xs">{getDescription(item)}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export const ToolboxItem = memo(ToolboxItemComponent);
