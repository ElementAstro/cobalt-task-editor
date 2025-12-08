"use client";

import { Panel } from "@xyflow/react";
import type { Translations } from "@/lib/i18n";

interface WorkflowInfoPanelProps {
  t: Translations;
}

export function WorkflowInfoPanel({ t }: WorkflowInfoPanelProps) {
  return (
    <Panel
      position="top-right"
      className="bg-card/90 backdrop-blur-sm p-2 rounded-lg border border-border shadow-lg"
    >
      <div className="text-xs text-muted-foreground">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span>{t.editor.startInstructions}</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>{t.editor.targetInstructions}</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span>{t.editor.endInstructions}</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span>{t.toolbox.conditions}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500"></span>
          <span>{t.toolbox.triggers}</span>
        </div>
      </div>
    </Panel>
  );
}
