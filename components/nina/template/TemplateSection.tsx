"use client";

import { Star, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface TemplateSectionProps {
  title: string;
  count: number;
  variant: "default" | "custom";
  children: React.ReactNode;
}

export function TemplateSection({
  title,
  count,
  variant,
  children,
}: TemplateSectionProps) {
  const Icon = variant === "default" ? Star : User;
  const iconColor = variant === "default" ? "text-yellow-500" : "text-blue-500";

  return (
    <div>
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${iconColor}`} />
        <h3 className="font-medium text-xs sm:text-sm">{title}</h3>
        <Badge
          variant="secondary"
          className="h-4 sm:h-5 text-[9px] sm:text-[10px] px-1 sm:px-1.5"
        >
          {count}
        </Badge>
      </div>
      {children}
    </div>
  );
}
