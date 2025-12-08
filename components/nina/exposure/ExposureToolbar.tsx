"use client";

import {
  ChevronDown,
  ChevronUp,
  Copy,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Translations } from "@/lib/i18n";

interface ExposureToolbarProps {
  selectedExposureId: string | null;
  selectedIndex: number;
  exposureCount: number;
  onAddExposure: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onResetProgress: () => void;
  onResetAll: () => void;
  t: Translations;
}

export function ExposureToolbar({
  selectedExposureId,
  selectedIndex,
  exposureCount,
  onAddExposure,
  onDeleteSelected,
  onDuplicateSelected,
  onMoveUp,
  onMoveDown,
  onResetProgress,
  onResetAll,
  t,
}: ExposureToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddExposure}
            aria-label={t.common.add}
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t.common.add}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {t.simple?.addExposure || "Add Exposure"}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteSelected}
            disabled={!selectedExposureId}
            aria-label={t.common.delete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t.common.delete}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onDuplicateSelected}
            disabled={!selectedExposureId}
            aria-label={t.common.duplicate}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t.common.duplicate}</TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-border mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onMoveUp}
            disabled={!selectedExposureId || selectedIndex <= 0}
            aria-label={t.editor.moveUp}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t.editor.moveUp}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onMoveDown}
            disabled={
              !selectedExposureId || selectedIndex >= exposureCount - 1
            }
            aria-label={t.editor.moveDown}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t.editor.moveDown}</TooltipContent>
      </Tooltip>

      <div className="flex-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetProgress}
            disabled={!selectedExposureId}
            aria-label={t.simple?.resetProgress || "Reset Progress"}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {t.simple?.resetProgress || "Reset Progress"}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onResetAll}>
            <RotateCcw className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline text-xs">
              {t.simple?.resetAll || "Reset All"}
            </span>
            <span className="sr-only">
              {t.simple?.resetAllProgress || "Reset All Progress"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {t.simple?.resetAllProgress || "Reset All Progress"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
