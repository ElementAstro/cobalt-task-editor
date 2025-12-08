"use client";

import { Box, Settings2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Translations } from "@/lib/i18n";

interface EditorMobileNavProps {
  itemCount: number;
  onOpenToolbox: () => void;
  onOpenProperties: () => void;
  t: Translations;
}

export function EditorMobileNav({
  itemCount,
  onOpenToolbox,
  onOpenProperties,
  t,
}: EditorMobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 py-2 border-t border-border bg-background/95 backdrop-blur-sm sm:hidden z-40">
      <Button
        variant="ghost"
        size="sm"
        className="flex flex-col items-center gap-0.5 h-auto py-1"
        onClick={onOpenToolbox}
      >
        <Box className="w-5 h-5" />
        <span className="text-[10px]">{t.toolbox.title}</span>
      </Button>

      <div className="flex flex-col items-center gap-0.5">
        <Badge variant="secondary" className="h-5 px-2 text-[10px]">
          <List className="w-3 h-3 mr-1" />
          {itemCount}
        </Badge>
        <span className="text-[10px] text-muted-foreground">
          {t.toolbox.items}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="flex flex-col items-center gap-0.5 h-auto py-1"
        onClick={onOpenProperties}
      >
        <Settings2 className="w-5 h-5" />
        <span className="text-[10px]">{t.properties.title}</span>
      </Button>
    </nav>
  );
}
