"use client";

import {
  Save,
  Upload,
  Download,
  Undo2,
  Redo2,
  LayoutList,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Translations } from "@/lib/i18n";

interface EditorHeaderProps {
  title: string;
  viewMode: "list" | "workflow";
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onImport: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleViewMode: () => void;
  t: Translations;
}

export function EditorHeader({
  title,
  viewMode,
  canUndo,
  canRedo,
  onSave,
  onImport,
  onExport,
  onUndo,
  onRedo,
  onToggleViewMode,
  t,
}: EditorHeaderProps) {
  return (
    <header className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-border bg-card/50 backdrop-blur-sm">
      <h1 className="text-base sm:text-lg font-semibold truncate">{title}</h1>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Save */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onSave}>
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">{t.common.save}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.common.save}</TooltipContent>
        </Tooltip>

        {/* Import */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onImport}>
              <Upload className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.editor?.import || "Import"}</TooltipContent>
        </Tooltip>

        {/* Export */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onExport}>
              <Download className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.editor?.export || "Export"}</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        {/* Undo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{"Undo"}</TooltipContent>
        </Tooltip>

        {/* Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{"Redo"}</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        {/* View Mode Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onToggleViewMode}>
              {viewMode === "list" ? (
                <Workflow className="w-4 h-4" />
              ) : (
                <LayoutList className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {viewMode === "list" ? "Workflow View" : "List View"}
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
