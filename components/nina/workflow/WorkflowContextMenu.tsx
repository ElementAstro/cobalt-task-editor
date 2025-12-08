"use client";

import { Copy, Trash2, Power, MoveRight } from "lucide-react";
import type { Translations } from "@/lib/i18n";

interface ContextMenuState {
  x: number;
  y: number;
  nodeId: string;
  nodeType: "item" | "condition" | "trigger" | null;
}

interface WorkflowContextMenuProps {
  contextMenu: ContextMenuState | null;
  t: Translations;
  onDuplicate: () => void;
  onToggleEnabled: () => void;
  onMoveToArea: (area: "start" | "target" | "end") => void;
  onDelete: () => void;
}

export function WorkflowContextMenu({
  contextMenu,
  t,
  onDuplicate,
  onToggleEnabled,
  onMoveToArea,
  onDelete,
}: WorkflowContextMenuProps) {
  if (!contextMenu) return null;

  return (
    <div
      className="fixed z-50 min-w-[180px] bg-popover text-popover-foreground border rounded-md shadow-lg p-1"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {contextMenu.nodeType === "item" && (
        <>
          <button
            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
            onClick={onDuplicate}
          >
            <Copy className="w-4 h-4" />
            {t.common.duplicate}
            <span className="ml-auto text-xs text-muted-foreground">
              Ctrl+D
            </span>
          </button>
          <button
            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
            onClick={onToggleEnabled}
          >
            <Power className="w-4 h-4" />
            {t.workflow.toggleEnabled}
          </button>
          <div className="h-px bg-border my-1" />
          <div className="px-2 py-1 text-xs text-muted-foreground">
            {t.workflow.moveToStart}
          </div>
          <button
            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => onMoveToArea("start")}
          >
            <MoveRight className="w-4 h-4" />
            {t.editor.startInstructions}
          </button>
          <button
            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => onMoveToArea("target")}
          >
            <MoveRight className="w-4 h-4" />
            {t.editor.targetInstructions}
          </button>
          <button
            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => onMoveToArea("end")}
          >
            <MoveRight className="w-4 h-4" />
            {t.editor.endInstructions}
          </button>
          <div className="h-px bg-border my-1" />
        </>
      )}
      <button
        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-destructive/10 text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4" />
        {t.common.delete}
        <span className="ml-auto text-xs text-muted-foreground">Del</span>
      </button>
    </div>
  );
}

export type { ContextMenuState };
