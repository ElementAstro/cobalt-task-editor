'use client';

import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Box,
  Camera,
  Star,
  Telescope,
  Focus,
  Disc,
  Crosshair,
  RotateCw,
  Sun,
  Moon,
  Shield,
  Plug,
  MessageSquare,
  Terminal,
  Timer,
  Mountain,
  Home,
  Scan,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
} from 'lucide-react';
import { useSequenceEditorStore } from '@/lib/nina/store';
import { useI18n, getItemNameKey, getItemDescriptionKey } from '@/lib/i18n';
import type { SequenceItemNodeData } from '@/lib/nina/workflow-utils';
import { getItemTypeColor } from '@/lib/nina/workflow-utils';
import type { SequenceEntityStatus } from '@/lib/nina/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Status icon component
function StatusIcon({ status }: { status: SequenceEntityStatus }) {
  switch (status) {
    case 'RUNNING':
      return <Play className="w-3 h-3 text-blue-400 animate-pulse" />;
    case 'FINISHED':
      return <CheckCircle className="w-3 h-3 text-green-400" />;
    case 'FAILED':
      return <XCircle className="w-3 h-3 text-red-400" />;
    case 'SKIPPED':
      return <Clock className="w-3 h-3 text-yellow-400" />;
    case 'DISABLED':
      return <Ban className="w-3 h-3 text-zinc-500" />;
    default:
      return null;
  }
}

// Get icon based on item type
function getItemIcon(type: string) {
  if (type.includes('DeepSkyObject')) return <Star className="w-4 h-4 text-yellow-400" />;
  if (type.includes('Sequential')) return <Box className="w-4 h-4 text-blue-400" />;
  if (type.includes('Parallel')) return <Box className="w-4 h-4 text-purple-400" />;
  if (type.includes('Cool') || type.includes('Warm')) return <Sun className="w-4 h-4 text-orange-400" />;
  if (type.includes('Exposure')) return <Camera className="w-4 h-4 text-green-400" />;
  if (type.includes('Slew') || type.includes('Park') || type.includes('Unpark')) return <Telescope className="w-4 h-4 text-cyan-400" />;
  if (type.includes('Focuser') || type.includes('Autofocus')) return <Focus className="w-4 h-4 text-indigo-400" />;
  if (type.includes('Filter')) return <Disc className="w-4 h-4 text-pink-400" />;
  if (type.includes('Guider') || type.includes('Dither') || type.includes('Center')) return <Crosshair className="w-4 h-4 text-red-400" />;
  if (type.includes('Rotator')) return <RotateCw className="w-4 h-4 text-teal-400" />;
  if (type.includes('Dome')) return <Home className="w-4 h-4 text-amber-400" />;
  if (type.includes('Flat') || type.includes('Brightness') || type.includes('Light')) return <Sun className="w-4 h-4 text-yellow-300" />;
  if (type.includes('Safety')) return <Shield className="w-4 h-4 text-emerald-400" />;
  if (type.includes('Switch')) return <Plug className="w-4 h-4 text-slate-400" />;
  if (type.includes('Annotation') || type.includes('Message')) return <MessageSquare className="w-4 h-4 text-blue-300" />;
  if (type.includes('Script')) return <Terminal className="w-4 h-4 text-lime-400" />;
  if (type.includes('Wait') && type.includes('Time')) return <Timer className="w-4 h-4 text-orange-300" />;
  if (type.includes('Wait') && type.includes('Altitude')) return <Mountain className="w-4 h-4 text-stone-400" />;
  if (type.includes('Moon')) return <Moon className="w-4 h-4 text-slate-300" />;
  if (type.includes('Sun')) return <Sun className="w-4 h-4 text-amber-300" />;
  if (type.includes('Connect') || type.includes('Disconnect')) return <Plug className="w-4 h-4 text-green-300" />;
  if (type.includes('Platesolving') || type.includes('Scan')) return <Scan className="w-4 h-4 text-violet-400" />;
  return <Box className="w-4 h-4 text-zinc-400" />;
}

function SequenceItemNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as SequenceItemNodeData;
  const { item, area } = nodeData;
  const { t } = useI18n();
  const selectItem = useSequenceEditorStore(state => state.selectItem);
  const selectedItemId = useSequenceEditorStore(state => state.selectedItemId);
  const selectedItemIds = useSequenceEditorStore(state => state.selectedItemIds);
  
  const isSelected = selectedItemId === item.id || selected;
  const isMultiSelected = selectedItemIds.includes(item.id);
  const borderColor = getItemTypeColor(item.type);

  // Get translated item name
  const getTranslatedName = useCallback(() => {
    const key = getItemNameKey(item.type);
    if (key && t.ninaItems[key]) {
      return t.ninaItems[key];
    }
    return item.name;
  }, [item.type, item.name, t.ninaItems]);
  
  // Get translated description
  const getTranslatedDescription = useCallback(() => {
    const key = getItemDescriptionKey(item.type);
    if (key && t.itemDescriptions[key]) {
      return t.itemDescriptions[key];
    }
    return '';
  }, [item.type, t.itemDescriptions]);

  const handleClick = useCallback(() => {
    selectItem(item.id);
  }, [item.id, selectItem]);
  
  // Area color indicator
  const areaColors: Record<string, string> = {
    start: 'bg-green-500',
    target: 'bg-blue-500',
    end: 'bg-orange-500',
  };

  return (
    <TooltipProvider delayDuration={500}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={handleClick}
            className={`
              px-3 py-2 rounded-lg border-2 bg-card shadow-md cursor-pointer
              transition-all duration-150 min-w-[200px] relative
              ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:shadow-lg'}
              ${isMultiSelected && !isSelected ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-background' : ''}
              ${item.status === 'DISABLED' ? 'opacity-50' : ''}
            `}
            style={{ borderColor }}
          >
            {/* Area indicator dot */}
            <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${areaColors[area] || 'bg-slate-500'}`} />
            
            <Handle
              type="target"
              position={Position.Top}
              className="w-3! h-3! bg-slate-500! border-2! border-background!"
            />
            
            <div className="flex items-center gap-2">
              <StatusIcon status={item.status} />
              {getItemIcon(item.type)}
              <span className={`flex-1 text-sm font-medium truncate ${item.status === 'DISABLED' ? 'line-through text-muted-foreground' : ''}`}>
                {getTranslatedName()}
              </span>
            </div>
            
            <Handle
              type="source"
              position={Position.Bottom}
              className="w-3! h-3! bg-slate-500! border-2! border-background!"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px]">
          <p className="font-medium">{getTranslatedName()}</p>
          {getTranslatedDescription() && (
            <p className="text-xs text-muted-foreground mt-1">{getTranslatedDescription()}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {t.status[item.status.toLowerCase() as keyof typeof t.status] || item.status}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const SequenceItemNode = memo(SequenceItemNodeComponent);
