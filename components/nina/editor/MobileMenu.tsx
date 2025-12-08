"use client";

import { Plus, Upload, Download, Undo2, Redo2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TemplateSelector } from "../TemplateSelector";

export interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNew: () => void;
  onImport: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  activeTabId: string | null;
  translations: {
    actions: string;
    newSequence: string;
    import: string;
    export: string;
    undo: string;
    redo: string;
  };
}

export function MobileMenu({
  open,
  onOpenChange,
  onNew,
  onImport,
  onExport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  activeTabId,
  translations: t,
}: MobileMenuProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 p-0">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="bg-card border-border">
        <SheetHeader className="pb-2">
          <SheetTitle>{t.actions}</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-2 py-3">
          <Button
            variant="outline"
            onClick={() => {
              onNew();
              onOpenChange(false);
            }}
            className="justify-start h-11 text-sm"
          >
            <Plus className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">{t.newSequence}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onImport();
              onOpenChange(false);
            }}
            className="justify-start h-11 text-sm"
          >
            <Upload className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">{t.import}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onExport();
              onOpenChange(false);
            }}
            className="justify-start h-11 text-sm"
          >
            <Download className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">{t.export}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onUndo();
              onOpenChange(false);
            }}
            disabled={!canUndo}
            className="justify-start h-11 text-sm"
          >
            <Undo2 className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">{t.undo}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onRedo();
              onOpenChange(false);
            }}
            disabled={!canRedo}
            className="justify-start h-11 text-sm col-span-2 sm:col-span-1"
          >
            <Redo2 className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">{t.redo}</span>
          </Button>
        </div>
        {/* Mobile Template Selector */}
        <div className="pt-2 border-t border-border">
          <TemplateSelector activeTabId={activeTabId} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
