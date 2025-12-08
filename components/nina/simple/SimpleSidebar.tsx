"use client";

import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StartEndOptions } from "../StartEndOptions";
import { TargetCard } from "../TargetCard";
import { formatDuration, formatTime } from "@/lib/nina/simple-sequence-types";
import type { SimpleTarget } from "@/lib/nina/simple-sequence-types";
import type { Translations } from "@/lib/i18n";

interface SimpleSidebarProps {
  targets: SimpleTarget[];
  selectedTargetId: string | null;
  activeTargetId: string | null;
  overallDuration: number | null;
  overallEndTime: string | null;
  totalExposures: number;
  remainingExposures: number;
  onSelectTarget: (id: string) => void;
  onAddTarget: () => void;
  onMoveTargetUp: (id: string) => void;
  onMoveTargetDown: (id: string) => void;
  onDuplicateTarget: (id: string) => void;
  onDeleteTarget: (id: string) => void;
  onResetTargetProgress: (id: string) => void;
  onCopyExposuresToAll: (id: string) => void;
  t: Translations;
}

export function SimpleSidebar({
  targets,
  selectedTargetId,
  activeTargetId,
  overallDuration,
  overallEndTime,
  totalExposures,
  remainingExposures,
  onSelectTarget,
  onAddTarget,
  onMoveTargetUp,
  onMoveTargetDown,
  onDuplicateTarget,
  onDeleteTarget,
  onResetTargetProgress,
  onCopyExposuresToAll,
  t,
}: SimpleSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:w-80 xl:w-96 border-r border-border bg-card/50 flex-col">
      {/* Start/End Options */}
      <StartEndOptions />

      {/* Target List Header */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {t.simple?.targets || "Targets"}
          </span>
          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
            {targets.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onAddTarget}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t.simple?.addTarget || "Add Target"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Target List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {targets.map((target, index) => (
            <TargetCard
              key={target.id}
              target={target}
              isSelected={target.id === selectedTargetId}
              isActive={target.id === activeTargetId}
              index={index}
              totalTargets={targets.length}
              onSelect={() => onSelectTarget(target.id)}
              onMoveUp={() => onMoveTargetUp(target.id)}
              onMoveDown={() => onMoveTargetDown(target.id)}
              onDuplicate={() => onDuplicateTarget(target.id)}
              onDelete={() => onDeleteTarget(target.id)}
              onReset={() => onResetTargetProgress(target.id)}
              onCopyExposuresToAll={
                targets.length > 1
                  ? () => onCopyExposuresToAll(target.id)
                  : undefined
              }
            />
          ))}
          {targets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {t.simple?.noTargets || "No targets yet"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onAddTarget}
              >
                <Plus className="w-4 h-4 mr-1" />
                {t.simple?.addTarget || "Add Target"}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ETA Summary */}
      <div className="border-t border-border p-3 bg-muted/30">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">
              {t.simple?.totalDuration || "Total Duration"}:
            </span>
            <p className="font-medium">
              {overallDuration ? formatDuration(overallDuration) : "--"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">
              {t.simple?.estimatedEnd || "Est. End"}:
            </span>
            <p className="font-medium">
              {overallEndTime ? formatTime(new Date(overallEndTime)) : "--"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">
              {t.simple?.totalExposures || "Total Exposures"}:
            </span>
            <p className="font-medium">{totalExposures}</p>
          </div>
          <div>
            <span className="text-muted-foreground">
              {t.simple?.remaining || "Remaining"}:
            </span>
            <p className="font-medium">{remainingExposures}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
