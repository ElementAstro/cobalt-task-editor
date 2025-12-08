"use client";

import {
  Plus,
  ChevronLeft,
  Upload,
  Download,
  FileJson,
  FileSpreadsheet,
  Undo2,
  Redo2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "../LanguageSelector";
import type { Translations } from "@/lib/i18n";

interface SimpleHeaderProps {
  title: string;
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNew: () => void;
  onImportJSON: () => void;
  onImportCSV: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onExportXML: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenMobileMenu: () => void;
  t: Translations;
}

export function SimpleHeader({
  title,
  isDirty,
  canUndo,
  canRedo,
  onTitleChange,
  onNew,
  onImportJSON,
  onImportCSV,
  onExportJSON,
  onExportCSV,
  onExportXML,
  onUndo,
  onRedo,
  onOpenMobileMenu,
  t,
}: SimpleHeaderProps) {
  return (
    <header className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 bg-card border-b border-border">
      {/* Left: Logo and Title */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 sm:flex-initial">
        <Link href="/editor" className="shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t.common.back || "Back to Advanced Editor"}
            </TooltipContent>
          </Tooltip>
        </Link>
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
        <Input
          type="text"
          value={title}
          onChange={onTitleChange}
          className="bg-transparent border-none shadow-none text-sm sm:text-base lg:text-lg font-semibold focus-visible:ring-1 focus-visible:ring-emerald-500 rounded px-1 sm:px-2 py-0.5 sm:py-1 min-w-0 w-full sm:w-auto max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] lg:max-w-none h-auto"
          placeholder={t.simple?.title || "Target Set Title"}
        />
        {isDirty && (
          <Badge
            variant="outline"
            className="text-yellow-400 border-yellow-500/50 shrink-0 text-[10px] sm:text-xs px-1.5 py-0"
          >
            *
          </Badge>
        )}
      </div>

      {/* Center: Desktop Actions */}
      <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNew}
              className="h-8 px-2 lg:px-2.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xl:inline ml-1.5 text-xs">
                {t.editor.newSequence}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.editor.newSequence}</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-2.5">
              <Upload className="w-4 h-4" />
              <span className="hidden xl:inline ml-1.5 text-xs">
                {t.editor.import}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onImportJSON}>
              <FileJson className="w-4 h-4 mr-2" />
              {t.simple?.importJSON || "Import JSON"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onImportCSV}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              {t.simple?.importCSV || "Import CSV (Telescopius)"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-2.5">
              <Download className="w-4 h-4" />
              <span className="hidden xl:inline ml-1.5 text-xs">
                {t.editor.export}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onExportJSON}>
              <FileJson className="w-4 h-4 mr-2" />
              {t.simple?.exportJSON || "Export JSON"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportCSV}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              {t.simple?.exportCSV || "Export CSV"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportXML}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              {t.simple?.exportXML || "Export NINA (.ninaTargetSet)"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 w-8 p-0"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.editor.undo} (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 w-8 p-0"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.editor.redo} (Ctrl+Y)</TooltipContent>
        </Tooltip>
      </div>

      {/* Right: Settings */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden h-8 w-8 p-0"
          onClick={onOpenMobileMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </Button>

        <ThemeToggle />
        <LanguageSelector />
      </div>
    </header>
  );
}
