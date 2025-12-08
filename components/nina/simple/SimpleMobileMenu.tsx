"use client";

import {
  Plus,
  Upload,
  Download,
  Undo2,
  Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Translations } from "@/lib/i18n";

interface SimpleMobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  onNew: () => void;
  onImportJSON: () => void;
  onImportCSV: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onExportXML: () => void;
  onUndo: () => void;
  onRedo: () => void;
  t: Translations;
}

export function SimpleMobileMenu({
  open,
  onOpenChange,
  canUndo,
  canRedo,
  onNew,
  onImportJSON,
  onImportCSV,
  onExportJSON,
  onExportCSV,
  onExportXML,
  onUndo,
  onRedo,
  t,
}: SimpleMobileMenuProps) {
  const handleAction = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="bg-card border-border">
        <SheetHeader className="pb-2">
          <SheetTitle>{t.common.actions}</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-2 py-3">
          <Button
            variant="outline"
            onClick={() => handleAction(onNew)}
            className="justify-start h-11 text-sm"
          >
            <Plus className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">{t.editor.newSequence}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAction(onImportJSON)}
            className="justify-start h-11 text-sm"
          >
            <Upload className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">
              {t.simple?.importJSON || "Import JSON"}
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAction(onImportCSV)}
            className="justify-start h-11 text-sm"
          >
            <Upload className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">
              {t.simple?.importCSV || "Import CSV"}
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAction(onExportJSON)}
            className="justify-start h-11 text-sm"
          >
            <Download className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">
              {t.simple?.exportJSON || "Export JSON"}
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAction(onExportCSV)}
            className="justify-start h-11 text-sm"
          >
            <Download className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">
              {t.simple?.exportCSV || "Export CSV"}
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAction(onExportXML)}
            className="justify-start h-11 text-sm"
          >
            <Download className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">
              {t.simple?.exportXML || "Export NINA"}
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAction(onUndo)}
            disabled={!canUndo}
            className="justify-start h-11 text-sm"
          >
            <Undo2 className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">{t.editor.undo}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAction(onRedo)}
            disabled={!canRedo}
            className="justify-start h-11 text-sm"
          >
            <Redo2 className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">{t.editor.redo}</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
