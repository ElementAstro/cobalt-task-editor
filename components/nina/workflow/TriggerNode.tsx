'use client';

import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { useSequenceEditorStore } from '@/lib/nina/store';
import { useI18n, getTriggerNameKey } from '@/lib/i18n';
import type { TriggerNodeData } from '@/lib/nina/workflow-utils';

function TriggerNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as TriggerNodeData;
  const { trigger } = nodeData;
  const { t } = useI18n();
  const { selectTrigger, selectedTriggerId } = useSequenceEditorStore();
  
  const isSelected = selectedTriggerId === trigger.id || selected;

  // Get translated trigger name
  const getTranslatedName = useCallback(() => {
    const key = getTriggerNameKey(trigger.type);
    if (key && t.ninaTriggers[key]) {
      return t.ninaTriggers[key];
    }
    return trigger.name;
  }, [trigger.type, trigger.name, t.ninaTriggers]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    selectTrigger(trigger.id);
  }, [trigger.id, selectTrigger]);

  return (
    <div
      onClick={handleClick}
      className={`
        px-2.5 py-1.5 rounded-md border bg-card/80 shadow-sm cursor-pointer
        transition-all duration-150 min-w-[120px] border-purple-500/50
        ${isSelected ? 'ring-2 ring-purple-500 ring-offset-1 ring-offset-background' : 'hover:shadow-md hover:border-purple-500'}
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2! h-2! bg-purple-500! border-2! border-background!"
      />
      
      <div className="flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span className="text-xs font-medium text-purple-200 truncate">
          {getTranslatedName()}
        </span>
      </div>
    </div>
  );
}

export const TriggerNode = memo(TriggerNodeComponent);
