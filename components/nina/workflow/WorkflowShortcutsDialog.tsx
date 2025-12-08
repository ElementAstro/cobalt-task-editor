"use client";

import type { Translations } from "@/lib/i18n";

interface WorkflowShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
  t: Translations;
}

export function WorkflowShortcutsDialog({
  open,
  onClose,
  t,
}: WorkflowShortcutsDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-card border rounded-lg shadow-xl p-4 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-3">{t.shortcuts.title}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t.shortcuts.undo}</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Ctrl+Z</kbd>
          </div>
          <div className="flex justify-between">
            <span>{t.shortcuts.redo}</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Ctrl+Y</kbd>
          </div>
          <div className="flex justify-between">
            <span>{t.shortcuts.delete}</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Delete</kbd>
          </div>
          <div className="flex justify-between">
            <span>{t.shortcuts.duplicate}</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Ctrl+D</kbd>
          </div>
          <div className="flex justify-between">
            <span>{t.shortcuts?.copy || "Copy"}</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Ctrl+C</kbd>
          </div>
          <div className="flex justify-between">
            <span>{t.shortcuts?.cut || "Cut"}</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Ctrl+X</kbd>
          </div>
          <div className="flex justify-between">
            <span>{t.shortcuts?.paste || "Paste"}</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Ctrl+V</kbd>
          </div>
          <div className="flex justify-between">
            <span>{t.shortcuts?.selectAll || "Select All"}</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Ctrl+A</kbd>
          </div>
          <div className="flex justify-between">
            <span>Multi-select</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs">
              Ctrl+Click
            </kbd>
          </div>
          <div className="flex justify-between">
            <span>Box select</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Drag</kbd>
          </div>
        </div>
        <button
          className="mt-4 w-full py-2 bg-primary text-primary-foreground rounded-md text-sm"
          onClick={onClose}
        >
          {t.common.close}
        </button>
      </div>
    </div>
  );
}
