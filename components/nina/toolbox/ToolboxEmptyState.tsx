"use client";

import { Info } from "lucide-react";

export interface ToolboxEmptyStateProps {
  message: string;
}

export function ToolboxEmptyState({ message }: ToolboxEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-muted-foreground">
      <Info className="w-8 h-8 sm:w-10 sm:h-10 mb-2 opacity-50" />
      <p className="text-xs sm:text-sm">{message}</p>
    </div>
  );
}
