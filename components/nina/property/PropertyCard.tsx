"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface PropertyCardProps {
  title: string;
  subtitle: string;
  variant: "item" | "condition" | "trigger";
  children: React.ReactNode;
}

const variantStyles = {
  item: {
    border: "border-blue-500/30",
    dot: "bg-blue-400",
    text: "text-blue-400",
  },
  condition: {
    border: "border-yellow-500/30",
    dot: "bg-yellow-400",
    text: "text-yellow-400",
  },
  trigger: {
    border: "border-purple-500/30",
    dot: "bg-purple-400",
    text: "text-purple-400",
  },
};

export function PropertyCard({
  title,
  subtitle,
  variant,
  children,
}: PropertyCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={`bg-muted/30 ${styles.border}`}>
      <CardHeader className="py-2 sm:py-3 px-3 sm:px-4">
        <CardTitle
          className={`text-xs sm:text-sm font-medium ${styles.text} flex items-center gap-1.5 sm:gap-2`}
        >
          <span
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${styles.dot} shrink-0`}
          />
          <span className="truncate">{title}</span>
        </CardTitle>
        <CardDescription className="text-[11px] sm:text-xs truncate">
          {subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
        {children}
      </CardContent>
    </Card>
  );
}
