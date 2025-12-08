"use client";

import { HelpCircle } from "lucide-react";

export interface PropertyEmptyStateProps {
  message: string;
}

export function PropertyEmptyState({ message }: PropertyEmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="text-center space-y-2 sm:space-y-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
          <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-[200px]">
          {message}
        </p>
      </div>
    </div>
  );
}
