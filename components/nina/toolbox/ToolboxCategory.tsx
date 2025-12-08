"use client";

import { useState, memo, useCallback } from "react";
import { ChevronRight, GripVertical, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ItemDefinition } from "@/lib/nina/constants";
import { iconMap } from "./ToolboxIconMap";
import { Box } from "lucide-react";

export interface ToolboxCategoryProps {
  category: string;
  items: ItemDefinition[];
  onDragStart: (
    item: ItemDefinition,
    type: "item" | "condition" | "trigger",
  ) => void;
  onDoubleClick: (
    item: ItemDefinition,
    type: "item" | "condition" | "trigger",
  ) => void;
  type: "item" | "condition" | "trigger";
  getItemName: (item: ItemDefinition) => string;
  getItemDescription: (item: ItemDefinition) => string;
  getCategoryName: (category: string) => string;
  isMobile?: boolean;
}

// Memoized item component to prevent re-renders
const ToolboxCategoryItem = memo(function ToolboxCategoryItem({
  item,
  type,
  onDragStart,
  onDoubleClick,
  getItemName,
  getItemDescription,
  isMobile,
}: {
  item: ItemDefinition;
  type: "item" | "condition" | "trigger";
  onDragStart: (item: ItemDefinition, type: "item" | "condition" | "trigger") => void;
  onDoubleClick: (item: ItemDefinition, type: "item" | "condition" | "trigger") => void;
  getItemName: (item: ItemDefinition) => string;
  getItemDescription: (item: ItemDefinition) => string;
  isMobile: boolean;
}) {
  // Get icon component from map directly - this is a reference, not a new component
  const Icon = item.icon ? iconMap[item.icon] || Box : Box;

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({ item, type }),
      );
      e.dataTransfer.effectAllowed = "copy";
      onDragStart(item, type);
    },
    [item, type, onDragStart],
  );

  const handleClick = useCallback(() => {
    onDoubleClick(item, type);
  }, [item, type, onDoubleClick]);

  return (
    <div
      key={item.type}
      draggable={!isMobile}
      onDragStart={handleDragStart}
      onClick={handleClick}
      onDoubleClick={handleClick}
      className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-accent active:bg-accent/80 active:scale-[0.98] rounded-md cursor-pointer sm:cursor-grab active:cursor-grabbing group touch-manipulation select-none transition-all duration-150 ${isMobile ? "py-2.5 min-h-[44px]" : "py-1.5 sm:py-2"}`}
      title={getItemDescription(item)}
      role="button"
      aria-label={`Add ${getItemName(item)}`}
    >
      <GripVertical
        className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground hidden sm:block shrink-0 transition-colors"
        aria-hidden
      />
      <Icon className="w-4 h-4 sm:w-4 sm:h-4 shrink-0" aria-hidden />
      <span className="truncate flex-1 text-left">
        {getItemName(item)}
      </span>
      <Plus
        className="w-4 h-4 text-muted-foreground/70 group-hover:text-foreground sm:hidden shrink-0 transition-colors"
        aria-hidden
      />
    </div>
  );
});

function ToolboxCategoryComponent({
  category,
  items,
  onDragStart,
  onDoubleClick,
  type,
  getItemName,
  getItemDescription,
  getCategoryName,
  isMobile = false,
}: ToolboxCategoryProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Collapsible
      open={expanded}
      onOpenChange={setExpanded}
      className="mb-1.5 sm:mb-2"
    >
      <CollapsibleTrigger asChild>
        <button
          className={`flex items-center gap-1.5 sm:gap-2 w-full px-2 text-left text-xs sm:text-sm font-medium hover:bg-accent active:bg-accent/80 rounded-md transition-all duration-200 touch-manipulation ${isMobile ? "py-2.5 min-h-[44px]" : "py-1.5 sm:py-2"}`}
        >
          <ChevronRight
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          />
          <span className="truncate">{getCategoryName(category)}</span>
          <Badge
            variant="secondary"
            className="ml-auto h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs shrink-0"
          >
            {items.length}
          </Badge>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1 overflow-hidden">
        <div className="ml-3 sm:ml-4 mt-0.5 sm:mt-1 space-y-0.5">
          {items.map((item) => (
            <ToolboxCategoryItem
              key={item.type}
              item={item}
              type={type}
              onDragStart={onDragStart}
              onDoubleClick={onDoubleClick}
              getItemName={getItemName}
              getItemDescription={getItemDescription}
              isMobile={isMobile}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Memoize the category component
export const ToolboxCategory = memo(ToolboxCategoryComponent);
