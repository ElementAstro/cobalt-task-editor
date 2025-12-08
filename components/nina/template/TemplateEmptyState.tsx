"use client";

import { LayoutTemplate } from "lucide-react";

export interface TemplateEmptyStateProps {
  message: string;
}

export function TemplateEmptyState({ message }: TemplateEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-muted-foreground">
      <LayoutTemplate className="w-6 h-6 sm:w-8 sm:h-8 mb-2 opacity-50" />
      <p className="text-xs sm:text-sm">{message}</p>
    </div>
  );
}
