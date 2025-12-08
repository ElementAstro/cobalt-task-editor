"use client";

import { Check } from "lucide-react";

export interface ToolboxFeedbackProps {
  message: string | null;
}

export function ToolboxFeedback({ message }: ToolboxFeedbackProps) {
  if (!message) return null;

  return (
    <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 sm:px-4 py-2 bg-accent text-accent-foreground text-xs sm:text-sm rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 max-w-[90%]">
      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 shrink-0" />
      <span className="truncate">{message}</span>
    </div>
  );
}
