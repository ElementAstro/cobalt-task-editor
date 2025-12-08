"use client";

import { memo, useCallback } from "react";
import { Repeat, Trash2 } from "lucide-react";
import { useSequenceEditorStore } from "@/lib/nina/store";
import { useI18n, getConditionNameKey } from "@/lib/i18n";
import type { EditorCondition } from "@/lib/nina/types";

interface ConditionNodeProps {
  condition: EditorCondition;
  containerId: string;
}

function ConditionNodeComponent({ condition, containerId }: ConditionNodeProps) {
  const { t } = useI18n();
  const { selectCondition, selectedConditionId, deleteCondition } =
    useSequenceEditorStore();
  const isSelected = selectedConditionId === condition.id;

  // Get translated condition name
  const getTranslatedConditionName = useCallback(() => {
    const key = getConditionNameKey(condition.type);
    if (key && t.ninaConditions[key]) {
      return t.ninaConditions[key];
    }
    return condition.name;
  }, [condition.type, condition.name, t.ninaConditions]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectCondition(condition.id);
    },
    [condition.id, selectCondition],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteCondition(containerId, condition.id);
    },
    [containerId, condition.id, deleteCondition],
  );

  return (
    <div
      onClick={handleClick}
      className={`
        group flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md cursor-pointer touch-manipulation
        ${isSelected ? "bg-yellow-600/20 ring-1 ring-yellow-500" : "hover:bg-accent/50 active:bg-accent/70"}
      `}
    >
      <Repeat className="w-3 h-3 text-yellow-400 shrink-0" />
      <span className="flex-1 truncate text-yellow-200">
        {getTranslatedConditionName()}
      </span>
      {condition.data.Iterations !== undefined && (
        <span className="text-[10px] sm:text-xs text-yellow-400/70 tabular-nums shrink-0">
          {String(condition.data.CompletedIterations || 0)}/
          {String(condition.data.Iterations)}
        </span>
      )}
      <button
        onClick={handleDelete}
        className="p-1 hover:bg-destructive/20 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
        aria-label="Delete condition"
      >
        <Trash2 className="w-3 h-3 text-muted-foreground" />
      </button>
    </div>
  );
}

export const ConditionNode = memo(ConditionNodeComponent);
