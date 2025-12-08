"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SequenceToolbox } from "../SequenceToolbox";

export interface MobileToolboxSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  title: string;
}

export function MobileToolboxSheet({
  open,
  onOpenChange,
  onClose,
  title,
}: MobileToolboxSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[88vw] max-w-[340px] sm:hidden bg-card border-border p-0 flex flex-col"
      >
        <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
          <SheetTitle className="text-base">{title}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden relative">
          <SequenceToolbox onClose={onClose} isMobile={true} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
