"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

export interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, description: string) => void;
  mode?: "create" | "edit";
  initialName?: string;
  initialDescription?: string;
}

export function SaveTemplateDialog({
  open,
  onOpenChange,
  onSave,
  mode = "create",
  initialName = "",
  initialDescription = "",
}: SaveTemplateDialogProps) {
  const { t } = useI18n();
  // Use initialName/initialDescription as initial state - parent should use key prop to reset
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  const handleSave = useCallback(() => {
    if (name.trim()) {
      onSave(name.trim(), description.trim());
      onOpenChange(false);
    }
  }, [name, description, onSave, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {mode === "create"
              ? t.templates.saveAsTemplate
              : t.templates.editTemplate}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {t.templates.templateDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
          <div className="grid gap-1.5 sm:gap-2">
            <Label htmlFor="template-name" className="text-xs sm:text-sm">
              {t.templates.templateName}
            </Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.templates.templateName}
              className="h-9 sm:h-10 text-sm"
            />
          </div>
          <div className="grid gap-1.5 sm:gap-2">
            <Label htmlFor="template-desc" className="text-xs sm:text-sm">
              {t.templates.templateDescription}
            </Label>
            <Input
              id="template-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.templates.templateDescription}
              className="h-9 sm:h-10 text-sm"
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full sm:w-auto"
          >
            {mode === "create"
              ? t.templates.createTemplate
              : t.templates.editTemplate}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
