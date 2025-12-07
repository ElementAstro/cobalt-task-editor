"use client";

import { memo, useCallback } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Repeat } from "lucide-react";
import { useSequenceEditorStore } from "@/lib/nina/store";
import { useI18n, getConditionNameKey } from "@/lib/i18n";
import type { ConditionNodeData } from "@/lib/nina/workflow-utils";

function ConditionNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as ConditionNodeData;
  const { condition } = nodeData;
  const { t } = useI18n();
  const { selectCondition, selectedConditionId } = useSequenceEditorStore();

  const isSelected = selectedConditionId === condition.id || selected;

  // Get translated condition name
  const getTranslatedName = useCallback(() => {
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

  const iterations = condition.data.Iterations as number | undefined;
  const completed = condition.data.CompletedIterations as number | undefined;

  return (
    <div
      onClick={handleClick}
      className={`
        px-2.5 py-1.5 rounded-md border bg-card/80 shadow-sm cursor-pointer
        transition-all duration-150 min-w-[120px] border-yellow-500/50
        ${isSelected ? "ring-2 ring-yellow-500 ring-offset-1 ring-offset-background" : "hover:shadow-md hover:border-yellow-500"}
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2! h-2! bg-yellow-500! border-2! border-background!"
      />

      <div className="flex items-center gap-1.5">
        <Repeat className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
        <span className="text-xs font-medium text-yellow-200 truncate">
          {getTranslatedName()}
        </span>
        {iterations !== undefined && (
          <span className="text-[10px] text-yellow-400/70 tabular-nums shrink-0 ml-auto">
            {String(completed || 0)}/{String(iterations)}
          </span>
        )}
      </div>
    </div>
  );
}

export const ConditionNode = memo(ConditionNodeComponent);
