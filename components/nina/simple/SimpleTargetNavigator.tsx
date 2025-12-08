"use client";

import { ChevronLeft, ChevronRight, Plus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StartEndOptions } from "../StartEndOptions";
import type { SimpleTarget } from "@/lib/nina/simple-sequence-types";
import type { Translations } from "@/lib/i18n";

interface SimpleTargetNavigatorProps {
  targets: SimpleTarget[];
  selectedTargetId: string | null;
  mobileDrawerOpen: boolean;
  onMobileDrawerOpenChange: (open: boolean) => void;
  onSelectTarget: (id: string) => void;
  onAddTarget: () => void;
  t: Translations;
}

export function SimpleTargetNavigator({
  targets,
  selectedTargetId,
  mobileDrawerOpen,
  onMobileDrawerOpenChange,
  onSelectTarget,
  onAddTarget,
  t,
}: SimpleTargetNavigatorProps) {
  const currentIndex = targets.findIndex((t) => t.id === selectedTargetId);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectTarget(targets[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < targets.length - 1) {
      onSelectTarget(targets[currentIndex + 1].id);
    }
  };

  return (
    <div className="lg:hidden flex items-center justify-between px-3 py-2 border-b border-border bg-card/50">
      <Sheet open={mobileDrawerOpen} onOpenChange={onMobileDrawerOpenChange}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Settings2 className="w-4 h-4 mr-1.5" />
            {t.simple?.options || "Options"}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[70vh] bg-card border-border">
          <SheetHeader className="pb-2">
            <SheetTitle>
              {t.simple?.sequenceOptions || "Sequence Options"}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full pr-4">
            <StartEndOptions />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Target Quick Navigator */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handlePrev}
          disabled={!selectedTargetId || currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium min-w-[60px] text-center">
          {selectedTargetId
            ? `${currentIndex + 1}/${targets.length}`
            : `0/${targets.length}`}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleNext}
          disabled={!selectedTargetId || currentIndex === targets.length - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onAddTarget}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
