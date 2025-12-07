"use client";

import { memo, useCallback } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Box,
  Star,
  ChevronRight,
  ChevronDown,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Repeat,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSequenceEditorStore } from "@/lib/nina/store";
import { useI18n, getItemNameKey, getItemDescriptionKey } from "@/lib/i18n";
import type { ContainerNodeData } from "@/lib/nina/workflow-utils";
import { getItemTypeColor } from "@/lib/nina/workflow-utils";
import type { SequenceEntityStatus } from "@/lib/nina/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Status icon component
function StatusIcon({ status }: { status: SequenceEntityStatus }) {
  switch (status) {
    case "RUNNING":
      return <Play className="w-3 h-3 text-blue-400 animate-pulse" />;
    case "FINISHED":
      return <CheckCircle className="w-3 h-3 text-green-400" />;
    case "FAILED":
      return <XCircle className="w-3 h-3 text-red-400" />;
    case "SKIPPED":
      return <Clock className="w-3 h-3 text-yellow-400" />;
    case "DISABLED":
      return <Ban className="w-3 h-3 text-zinc-500" />;
    default:
      return null;
  }
}

// Get container icon
function getContainerIcon(type: string) {
  if (type.includes("DeepSkyObject"))
    return <Star className="w-4 h-4 text-yellow-400" />;
  if (type.includes("Parallel"))
    return <Box className="w-4 h-4 text-purple-400" />;
  return <Box className="w-4 h-4 text-blue-400" />;
}

function ContainerNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as ContainerNodeData;
  const { item, isExpanded, childCount } = nodeData;
  const { t } = useI18n();
  const { selectItem, updateItem } = useSequenceEditorStore();
  const selectedItemId = useSequenceEditorStore(
    (state) => state.selectedItemId,
  );
  const selectedItemIds = useSequenceEditorStore(
    (state) => state.selectedItemIds,
  );

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
    return "";
  }, [item.type, t.itemDescriptions]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectItem(item.id);
    },
    [item.id, selectItem],
  );

  const handleToggleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      updateItem(item.id, { isExpanded: !isExpanded });
    },
    [item.id, isExpanded, updateItem],
  );

  const conditionCount = item.conditions?.length ?? 0;
  const triggerCount = item.triggers?.length ?? 0;

  return (
    <TooltipProvider delayDuration={500}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={handleClick}
            className={`
              px-3 py-2.5 rounded-lg border-2 bg-card shadow-md cursor-pointer
              transition-all duration-150 min-w-[220px]
              ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:shadow-lg"}
              ${isMultiSelected && !isSelected ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-background" : ""}
              ${item.status === "DISABLED" ? "opacity-50" : ""}
            `}
            style={{ borderColor }}
          >
            <Handle
              type="target"
              position={Position.Top}
              className="w-3! h-3! bg-slate-500! border-2! border-background!"
            />

            {/* Header row */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleExpand}
                className="p-0.5 hover:bg-accent rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <StatusIcon status={item.status} />
              {getContainerIcon(item.type)}
              <span
                className={`flex-1 text-sm font-medium truncate ${item.status === "DISABLED" ? "line-through text-muted-foreground" : ""}`}
              >
                {getTranslatedName()}
              </span>
            </div>

            {/* Info row */}
            <div className="flex items-center gap-1.5 mt-1.5 ml-6">
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {childCount} items
              </Badge>

              {conditionCount > 0 && (
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] border-yellow-500/50 text-yellow-400 gap-0.5"
                >
                  <Repeat className="w-3 h-3" />
                  {conditionCount}
                </Badge>
              )}

              {triggerCount > 0 && (
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] border-purple-500/50 text-purple-400 gap-0.5"
                >
                  <Zap className="w-3 h-3" />
                  {triggerCount}
                </Badge>
              )}
            </div>

            <Handle
              type="source"
              position={Position.Bottom}
              className="w-3! h-3! bg-slate-500! border-2! border-background!"
            />

            {/* Side handles for conditions and triggers */}
            {conditionCount > 0 && (
              <Handle
                type="source"
                position={Position.Right}
                id="condition"
                className="w-2! h-2! bg-yellow-500! border-2! border-background! top-1/3!"
                style={{ top: "33%" }}
              />
            )}

            {triggerCount > 0 && (
              <Handle
                type="source"
                position={Position.Right}
                id="trigger"
                className="w-2! h-2! bg-purple-500! border-2! border-background! top-2/3!"
                style={{ top: "66%" }}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px]">
          <p className="font-medium">{getTranslatedName()}</p>
          {getTranslatedDescription() && (
            <p className="text-xs text-muted-foreground mt-1">
              {getTranslatedDescription()}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {childCount} {t.toolbox.items} • {conditionCount}{" "}
            {t.toolbox.conditions} • {triggerCount} {t.toolbox.triggers}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const ContainerNode = memo(ContainerNodeComponent);
