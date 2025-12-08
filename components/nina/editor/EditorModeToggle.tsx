"use client";

import { ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EditorMode } from "@/lib/nina/multi-sequence-store";

export interface EditorModeToggleProps {
  editorMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  translations: {
    normalMode: string;
    advancedMode: string;
    modeDescription: string;
    normalModeDesc: string;
    advancedModeDesc: string;
  };
}

export function EditorModeToggle({
  editorMode,
  onModeChange,
  translations: t,
}: EditorModeToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5">
          {editorMode === "normal" ? (
            <ToggleLeft className="w-4 h-4" />
          ) : (
            <ToggleRight className="w-4 h-4" />
          )}
          <span className="hidden lg:inline text-xs">
            {editorMode === "normal" ? t.normalMode : t.advancedMode}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t.modeDescription}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onModeChange("normal")}
          className={editorMode === "normal" ? "bg-accent" : ""}
        >
          <ToggleLeft className="w-4 h-4 mr-2" />
          <div className="flex flex-col">
            <span>{t.normalMode}</span>
            <span className="text-xs text-muted-foreground">
              {t.normalModeDesc}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onModeChange("advanced")}
          className={editorMode === "advanced" ? "bg-accent" : ""}
        >
          <ToggleRight className="w-4 h-4 mr-2" />
          <div className="flex flex-col">
            <span>{t.advancedMode}</span>
            <span className="text-xs text-muted-foreground">
              {t.advancedModeDesc}
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
