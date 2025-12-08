"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PropertyPanel } from "../PropertyPanel";

export interface MobilePropertiesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
}

export function MobilePropertiesSheet({
  open,
  onOpenChange,
  title,
}: MobilePropertiesSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[88vw] max-w-[340px] sm:hidden bg-card border-border p-0 flex flex-col"
      >
        <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
          <SheetTitle className="text-base">{title}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <PropertyPanel />
        </div>
      </SheetContent>
    </Sheet>
  );
}
