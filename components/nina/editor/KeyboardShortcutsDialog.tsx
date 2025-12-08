"use client";

import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";

export interface KeyboardShortcutsDialogProps {
  translations: {
    title: string;
    undo: string;
    redo: string;
    save: string;
    open: string;
    delete: string;
    duplicate: string;
  };
}

export function KeyboardShortcutsDialog({
  translations: t,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex h-8 w-8 p-0"
        >
          <Keyboard className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t.undo}</span>
            <div className="flex items-center gap-1">
              <Kbd>Ctrl</Kbd>
              <span className="text-muted-foreground">+</span>
              <Kbd>Z</Kbd>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t.redo}</span>
            <div className="flex items-center gap-1">
              <Kbd>Ctrl</Kbd>
              <span className="text-muted-foreground">+</span>
              <Kbd>Y</Kbd>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t.save}</span>
            <div className="flex items-center gap-1">
              <Kbd>Ctrl</Kbd>
              <span className="text-muted-foreground">+</span>
              <Kbd>S</Kbd>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t.open}</span>
            <div className="flex items-center gap-1">
              <Kbd>Ctrl</Kbd>
              <span className="text-muted-foreground">+</span>
              <Kbd>O</Kbd>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t.delete}</span>
            <Kbd>Delete</Kbd>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t.duplicate}</span>
            <div className="flex items-center gap-1">
              <Kbd>Ctrl</Kbd>
              <span className="text-muted-foreground">+</span>
              <Kbd>D</Kbd>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
