"use client";

import { memo, useCallback } from "react";
import { Zap, Trash2 } from "lucide-react";
import { useSequenceEditorStore } from "@/lib/nina/store";
import { useI18n, getTriggerNameKey } from "@/lib/i18n";
import type { EditorTrigger } from "@/lib/nina/types";

interface TriggerNodeProps {
  trigger: EditorTrigger;
  containerId: string;
}

function TriggerNodeComponent({ trigger, containerId }: TriggerNodeProps) {
  const { t } = useI18n();
  const { selectTrigger, selectedTriggerId, deleteTrigger } =
    useSequenceEditorStore();
  const isSelected = selectedTriggerId === trigger.id;

  // Get translated trigger name
  const getTranslatedTriggerName = useCallback(() => {
    const key = getTriggerNameKey(trigger.type);
    if (key && t.ninaTriggers[key]) {
      return t.ninaTriggers[key];
    }
    return trigger.name;
  }, [trigger.type, trigger.name, t.ninaTriggers]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectTrigger(trigger.id);
    },
    [trigger.id, selectTrigger],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteTrigger(containerId, trigger.id);
    },
    [containerId, trigger.id, deleteTrigger],
  );

  return (
    <div
      onClick={handleClick}
      className={`
        group flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md cursor-pointer touch-manipulation
        ${isSelected ? "bg-purple-600/20 ring-1 ring-purple-500" : "hover:bg-accent/50 active:bg-accent/70"}
      `}
    >
      <Zap className="w-3 h-3 text-purple-400 shrink-0" />
      <span className="flex-1 truncate text-purple-200">
        {getTranslatedTriggerName()}
      </span>
      <button
        onClick={handleDelete}
        className="p-1 hover:bg-destructive/20 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
        aria-label="Delete trigger"
      >
        <Trash2 className="w-3 h-3 text-muted-foreground" />
      </button>
    </div>
  );
}

export const TriggerNode = memo(TriggerNodeComponent);
