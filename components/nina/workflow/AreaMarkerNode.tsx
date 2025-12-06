'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Play, Flag } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import type { AreaMarkerData } from '@/lib/nina/workflow-utils';
import { getAreaColor } from '@/lib/nina/workflow-utils';

function AreaStartNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as AreaMarkerData;
  const { area, label } = nodeData;
  const { t } = useI18n();
  const color = getAreaColor(area);

  const areaLabels: Record<string, string> = {
    start: t.editor.startInstructions,
    target: t.editor.targetInstructions,
    end: t.editor.endInstructions,
  };

  return (
    <div
      className="px-4 py-2 rounded-full border-2 bg-card shadow-md flex items-center gap-2"
      style={{ borderColor: color }}
    >
      <Play className="w-4 h-4" style={{ color }} />
      <span className="text-sm font-semibold" style={{ color }}>
        {areaLabels[area] || label}
      </span>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3! h-3! border-2! border-background!"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function AreaEndNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as AreaMarkerData;
  const { area } = nodeData;
  const color = getAreaColor(area);

  return (
    <div
      className="px-3 py-1.5 rounded-full border-2 bg-card/50 shadow-sm flex items-center gap-1.5"
      style={{ borderColor: color, opacity: 0.7 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3! h-3! border-2! border-background!"
        style={{ backgroundColor: color }}
      />
      
      <Flag className="w-3 h-3" style={{ color }} />
      <span className="text-xs font-medium" style={{ color }}>
        End
      </span>
    </div>
  );
}

export const AreaStartNode = memo(AreaStartNodeComponent);
export const AreaEndNode = memo(AreaEndNodeComponent);
