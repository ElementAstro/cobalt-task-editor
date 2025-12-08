"use client";

import { useCallback, useState } from "react";
import { Box } from "lucide-react";
import { useSequenceEditorStore } from "@/lib/nina/store";
import { createSequenceItem } from "@/lib/nina/utils";
import { useI18n } from "@/lib/i18n";
import type { EditorSequenceItem } from "@/lib/nina/types";

// Import sub-components from tree folder
import { SequenceItemNode } from "./tree/SequenceItemNode";

// Re-export sub-components for convenience
export { StatusIcon } from "./tree/StatusIcon";
export { ItemIcon, getItemIcon } from "./tree/ItemIcon";
export { DropIndicator } from "./tree/DropIndicator";
export { ConditionNode } from "./tree/ConditionNode";
export { TriggerNode } from "./tree/TriggerNode";
export { SequenceItemNode } from "./tree/SequenceItemNode";

// Main Sequence Tree Component
export function SequenceTree() {
  const { t } = useI18n();
  const { sequence, activeArea, addItem, moveItem } = useSequenceEditorStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{
    id: string;
    parentId: string | null;
    index: number;
  } | null>(null);

  const items =
    activeArea === "start"
      ? sequence.startItems
      : activeArea === "target"
        ? sequence.targetItems
        : sequence.endItems;

  const handleItemDragStart = useCallback(
    (
      e: React.DragEvent,
      item: EditorSequenceItem,
      index: number,
      parentId: string | null,
    ) => {
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          itemId: item.id,
          type: "move",
          area: activeArea,
          index,
          parentId,
        }),
      );
      e.dataTransfer.effectAllowed = "move";
      setDraggedItem({ id: item.id, parentId, index });
    },
    [activeArea],
  );

  const handleItemDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      setDraggedItem(null);

      try {
        const data = JSON.parse(e.dataTransfer.getData("application/json"));

        if (data.type === "move" && data.itemId) {
          // Moving existing item to the end of root level
          moveItem(data.itemId, activeArea, null, items.length);
        } else if (data.item && data.type === "item") {
          const newItem = createSequenceItem(data.item.type);
          addItem(activeArea, newItem);
        }
      } catch (err) {
        console.error("Drop error:", err);
      }
    },
    [activeArea, addItem, moveItem, items.length],
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        min-h-full rounded-lg border-2 border-dashed transition-all duration-200
        ${isDragOver ? "border-primary bg-primary/5" : "border-transparent"}
        ${items.length === 0 ? "border-border" : ""}
      `}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-muted-foreground px-4">
          <Box className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 opacity-50" />
          <p className="text-xs sm:text-sm text-center">
            {t.editor.noInstructions}
          </p>
          <p className="text-[10px] sm:text-xs mt-1 text-center opacity-70">
            {t.editor.dragHint}
          </p>
        </div>
      ) : (
        <div className="space-y-0.5 sm:space-y-1">
          {items.map((item, index) => (
            <SequenceItemNode
              key={item.id}
              item={item}
              depth={0}
              area={activeArea}
              index={index}
              parentId={null}
              onDragStart={handleItemDragStart}
              onDragEnd={handleItemDragEnd}
              draggedItem={draggedItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
