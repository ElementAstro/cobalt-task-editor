"use client";

import {
  Copy,
  Scissors,
  ClipboardPaste,
  ChevronsUpDown,
  ChevronsDownUp,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

export interface SequenceStats {
  totalItems: number;
  startItems: number;
  targetItems: number;
  endItems: number;
  conditions: number;
  triggers: number;
}

export interface ListViewToolbarProps {
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  canPaste: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  stats: SequenceStats;
  translations: {
    copy: string;
    cut: string;
    paste: string;
    expandAll: string;
    collapseAll: string;
    start: string;
    target: string;
    end: string;
    conditions: string;
    triggers: string;
  };
}

export function ListViewToolbar({
  onCopy,
  onCut,
  onPaste,
  canPaste,
  onExpandAll,
  onCollapseAll,
  stats,
  translations: t,
}: ListViewToolbarProps) {
  return (
    <div className="hidden sm:flex items-center gap-0.5">
      {/* Clipboard Actions */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            className="h-7 w-7 p-0"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t.copy} (Ctrl+C)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCut}
            className="h-7 w-7 p-0"
          >
            <Scissors className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t.cut} (Ctrl+X)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onPaste}
            disabled={!canPaste}
            className="h-7 w-7 p-0"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t.paste} (Ctrl+V)</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Expand/Collapse All */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExpandAll}
            className="h-7 w-7 p-0"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t.expandAll} (Ctrl+E)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapseAll}
            className="h-7 w-7 p-0"
          >
            <ChevronsDownUp className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t.collapseAll} (Ctrl+Shift+E)</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Statistics */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground">
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="tabular-nums">{stats.totalItems}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <div>
              {t.start}: {stats.startItems}
            </div>
            <div>
              {t.target}: {stats.targetItems}
            </div>
            <div>
              {t.end}: {stats.endItems}
            </div>
            <div>
              {t.conditions}: {stats.conditions}
            </div>
            <div>
              {t.triggers}: {stats.triggers}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
