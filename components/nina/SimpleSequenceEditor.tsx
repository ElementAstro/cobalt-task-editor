"use client";

import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
  FileJson,
  FileSpreadsheet,
  Undo2,
  Redo2,
  RotateCcw,
  Sparkles,
  Clock,
  Target,
  Menu,
  ChevronUp,
  ChevronDown,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useSimpleSequenceStore,
  selectCanUndo,
  selectCanRedo,
  selectIsDirty,
} from "@/lib/nina/simple-sequence-store";
import { formatDuration, formatTime } from "@/lib/nina/simple-sequence-types";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "./LanguageSelector";
import { TargetCard } from "./TargetCard";
import { ExposureTable } from "./ExposureTable";
import { StartEndOptions } from "./StartEndOptions";
import Link from "next/link";

export function SimpleSequenceEditor() {
  const { t } = useI18n();
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"targets" | "exposures">(
    "targets",
  );
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    sequence,
    newSequence,
    setSequenceTitle,
    addTarget,
    removeTarget,
    duplicateTarget,
    moveTargetUp,
    moveTargetDown,
    selectTarget,
    resetTargetProgress,
    importFromCSV,
    importFromJSON,
    exportToJSON,
    exportToCSV,
    exportToXML,
    copyExposuresToAllTargets,
    calculateETAs,
    undo,
    redo,
    clearDirty,
    setError,
    lastError,
    clearError,
  } = useSimpleSequenceStore(
    useShallow((state) => ({
      sequence: state.sequence,
      newSequence: state.newSequence,
      setSequenceTitle: state.setSequenceTitle,
      addTarget: state.addTarget,
      removeTarget: state.removeTarget,
      duplicateTarget: state.duplicateTarget,
      moveTargetUp: state.moveTargetUp,
      moveTargetDown: state.moveTargetDown,
      selectTarget: state.selectTarget,
      resetTargetProgress: state.resetTargetProgress,
      importFromCSV: state.importFromCSV,
      importFromJSON: state.importFromJSON,
      exportToJSON: state.exportToJSON,
      exportToCSV: state.exportToCSV,
      exportToXML: state.exportToXML,
      copyExposuresToAllTargets: state.copyExposuresToAllTargets,
      calculateETAs: state.calculateETAs,
      undo: state.undo,
      redo: state.redo,
      clearDirty: state.clearDirty,
      setError: state.setError,
      lastError: state.lastError,
      clearError: state.clearError,
    })),
  );

  const canUndo = useSimpleSequenceStore(selectCanUndo);
  const canRedo = useSimpleSequenceStore(selectCanRedo);
  const isDirty = useSimpleSequenceStore(selectIsDirty);

  // Calculate ETAs on mount and when relevant data changes
  // Use a stable dependency to avoid infinite loops
  const targetsLength = sequence.targets.length;
  const exposuresHash = sequence.targets
    .map((t) =>
      t.exposures.reduce((sum, e) => sum + e.totalCount + e.exposureTime, 0),
    )
    .join(",");

  useEffect(() => {
    calculateETAs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetsLength, exposuresHash, sequence.estimatedDownloadTime]);

  // Selected target
  const selectedTarget = sequence.targets.find(
    (t) => t.id === sequence.selectedTargetId,
  );

  // Handlers
  const handleNew = useCallback(() => {
    if (isDirty) {
      setConfirmNewOpen(true);
      return;
    }
    newSequence();
  }, [isDirty, newSequence]);

  const handleConfirmNew = useCallback(() => {
    setConfirmNewOpen(false);
    newSequence();
  }, [newSequence]);

  const handleExportJSON = useCallback(() => {
    try {
      const json = exportToJSON();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const filename = `${sequence.title || "target-set"}.json`;
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      clearDirty();
      setSuccessMessage(`${t.simple?.exportJSON || "Exported"}: ${filename}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError("Export failed: " + (error as Error).message);
    }
  }, [sequence.title, exportToJSON, clearDirty, setError, t.simple]);

  const handleExportCSV = useCallback(() => {
    try {
      const csv = exportToCSV();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const filename = `${sequence.title || "target-set"}.csv`;
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessMessage(`${t.simple?.exportCSV || "Exported"}: ${filename}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError("Export failed: " + (error as Error).message);
    }
  }, [sequence.title, exportToCSV, setError, t.simple]);

  const handleExportXML = useCallback(() => {
    try {
      const xml = exportToXML();
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const filename = `${sequence.title || "target-set"}.ninaTargetSet`;
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      clearDirty();
      setSuccessMessage(`${t.simple?.exportXML || "Exported"}: ${filename}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError("Export failed: " + (error as Error).message);
    }
  }, [sequence.title, exportToXML, clearDirty, setError, t.simple]);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  const handleImportJSON = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const success = importFromJSON(text);
        if (success) {
          showSuccess(`${t.simple?.importJSON || "Import"}: ${file.name}`);
        }
      } catch (error) {
        setError("Import failed: " + (error as Error).message);
      }
    };
    input.click();
  }, [importFromJSON, setError, showSuccess, t.simple]);

  const handleImportCSV = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const success = await importFromCSV(text);
        if (success) {
          showSuccess(
            `${t.simple?.importCSV || "CSV Import"}: ${sequence.targets.length} ${t.simple?.targets || "targets"}`,
          );
        }
      } catch (error) {
        setError("Import failed: " + (error as Error).message);
      }
    };
    input.click();
  }, [importFromCSV, setError, showSuccess, sequence.targets.length, t.simple]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSequenceTitle(e.target.value);
    },
    [setSequenceTitle],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        if (canRedo) redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleExportJSON();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, undo, redo, handleExportJSON]);

  // Total stats
  const totalExposures = sequence.targets.reduce(
    (sum, t) => sum + t.exposures.reduce((s, e) => s + e.totalCount, 0),
    0,
  );
  const remainingExposures = sequence.targets.reduce(
    (sum, t) =>
      sum +
      t.exposures.reduce(
        (s, e) => s + Math.max(0, e.totalCount - e.progressCount),
        0,
      ),
    0,
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col h-dvh bg-background text-foreground">
        {/* Header */}
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
              value={sequence.title}
              onChange={handleTitleChange}
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
                  onClick={handleNew}
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 lg:px-2.5"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden xl:inline ml-1.5 text-xs">
                    {t.editor.import}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleImportJSON}>
                  <FileJson className="w-4 h-4 mr-2" />
                  {t.simple?.importJSON || "Import JSON"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImportCSV}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  {t.simple?.importCSV || "Import CSV (Telescopius)"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 lg:px-2.5"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden xl:inline ml-1.5 text-xs">
                    {t.editor.export}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportJSON}>
                  <FileJson className="w-4 h-4 mr-2" />
                  {t.simple?.exportJSON || "Export JSON"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  {t.simple?.exportCSV || "Export CSV"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportXML}>
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
                  onClick={undo}
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
                  onClick={redo}
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
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden h-8 w-8 p-0"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="bg-card border-border">
                <SheetHeader className="pb-2">
                  <SheetTitle>{t.common.actions}</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-2 gap-2 py-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleNew();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start h-11 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">{t.editor.newSequence}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleImportJSON();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start h-11 text-sm"
                  >
                    <Upload className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">
                      {t.simple?.importJSON || "Import JSON"}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleImportCSV();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start h-11 text-sm"
                  >
                    <Upload className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">
                      {t.simple?.importCSV || "Import CSV"}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleExportJSON();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start h-11 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">
                      {t.simple?.exportJSON || "Export JSON"}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleExportCSV();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start h-11 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">
                      {t.simple?.exportCSV || "Export CSV"}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleExportXML();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start h-11 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">
                      {t.simple?.exportXML || "Export NINA"}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      undo();
                      setMobileMenuOpen(false);
                    }}
                    disabled={!canUndo}
                    className="justify-start h-11 text-sm"
                  >
                    <Undo2 className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">{t.editor.undo}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      redo();
                      setMobileMenuOpen(false);
                    }}
                    disabled={!canRedo}
                    className="justify-start h-11 text-sm"
                  >
                    <Redo2 className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">{t.editor.redo}</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <ThemeToggle />
            <LanguageSelector />
          </div>
        </header>

        {/* Error Banner */}
        {lastError && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center justify-between">
            <span className="text-sm text-destructive">{lastError}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="h-6 px-2"
            >
              {t.common.close}
            </Button>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
            <span className="text-sm text-emerald-400">✓ {successMessage}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuccessMessage(null)}
              className="h-6 px-2 text-emerald-400 hover:text-emerald-300"
            >
              {t.common.close}
            </Button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Mobile Sidebar Toggle + Target Navigator */}
          <div className="lg:hidden flex items-center justify-between px-3 py-2 border-b border-border bg-card/50">
            <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Settings2 className="w-4 h-4 mr-1.5" />
                  {t.simple?.options || "Options"}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[70vh] bg-card border-border"
              >
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
                onClick={() => {
                  const currentIndex = sequence.targets.findIndex(
                    (t) => t.id === sequence.selectedTargetId,
                  );
                  if (currentIndex > 0)
                    selectTarget(sequence.targets[currentIndex - 1].id);
                }}
                disabled={
                  !sequence.selectedTargetId ||
                  sequence.targets.findIndex(
                    (t) => t.id === sequence.selectedTargetId,
                  ) === 0
                }
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {sequence.selectedTargetId
                  ? `${sequence.targets.findIndex((t) => t.id === sequence.selectedTargetId) + 1}/${sequence.targets.length}`
                  : `0/${sequence.targets.length}`}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  const currentIndex = sequence.targets.findIndex(
                    (t) => t.id === sequence.selectedTargetId,
                  );
                  if (currentIndex < sequence.targets.length - 1)
                    selectTarget(sequence.targets[currentIndex + 1].id);
                }}
                disabled={
                  !sequence.selectedTargetId ||
                  sequence.targets.findIndex(
                    (t) => t.id === sequence.selectedTargetId,
                  ) ===
                    sequence.targets.length - 1
                }
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => addTarget()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Left Panel: Start/End Options + Target List (Desktop) */}
          <aside className="hidden lg:flex lg:w-80 xl:w-96 border-r border-border bg-card/50 flex-col">
            {/* Start/End Options */}
            <StartEndOptions />

            {/* Target List Header */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {t.simple?.targets || "Targets"}
                </span>
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {sequence.targets.length}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => addTarget()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t.simple?.addTarget || "Add Target"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Target List */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {sequence.targets.map((target, index) => (
                  <TargetCard
                    key={target.id}
                    target={target}
                    isSelected={target.id === sequence.selectedTargetId}
                    isActive={target.id === sequence.activeTargetId}
                    index={index}
                    totalTargets={sequence.targets.length}
                    onSelect={() => selectTarget(target.id)}
                    onMoveUp={() => moveTargetUp(target.id)}
                    onMoveDown={() => moveTargetDown(target.id)}
                    onDuplicate={() => duplicateTarget(target.id)}
                    onDelete={() => removeTarget(target.id)}
                    onReset={() => resetTargetProgress(target.id)}
                    onCopyExposuresToAll={
                      sequence.targets.length > 1
                        ? () => copyExposuresToAllTargets(target.id)
                        : undefined
                    }
                  />
                ))}
                {sequence.targets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {t.simple?.noTargets || "No targets yet"}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => addTarget()}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {t.simple?.addTarget || "Add Target"}
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* ETA Summary */}
            <div className="border-t border-border p-3 bg-muted/30">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">
                    {t.simple?.totalDuration || "Total Duration"}:
                  </span>
                  <p className="font-medium">
                    {sequence.overallDuration
                      ? formatDuration(sequence.overallDuration)
                      : "--"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t.simple?.estimatedEnd || "Est. End"}:
                  </span>
                  <p className="font-medium">
                    {sequence.overallEndTime
                      ? formatTime(new Date(sequence.overallEndTime))
                      : "--"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t.simple?.totalExposures || "Total Exposures"}:
                  </span>
                  <p className="font-medium">{totalExposures}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t.simple?.remaining || "Remaining"}:
                  </span>
                  <p className="font-medium">{remainingExposures}</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Panel: Target Details + Exposure Table */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {selectedTarget ? (
              <>
                {/* Target Details Header */}
                <div className="px-4 py-3 border-b border-border bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">
                          {selectedTarget.targetName}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {t.simple?.exposureCount || "Exposures"}:{" "}
                          {selectedTarget.exposures.length}
                          {selectedTarget.estimatedDuration &&
                            ` • ${formatDuration(selectedTarget.estimatedDuration)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              resetTargetProgress(selectedTarget.id)
                            }
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">
                              {t.simple?.resetProgress || "Reset"}
                            </span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t.simple?.resetProgress || "Reset Progress"}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {/* Mobile Tabs */}
                <div className="lg:hidden">
                  <Tabs
                    value={activeTab}
                    onValueChange={(v) =>
                      setActiveTab(v as "targets" | "exposures")
                    }
                  >
                    <TabsList className="w-full rounded-none border-b">
                      <TabsTrigger value="targets" className="flex-1">
                        {t.simple?.targetOptions || "Target Options"}
                      </TabsTrigger>
                      <TabsTrigger value="exposures" className="flex-1">
                        {t.simple?.exposures || "Exposures"}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="targets" className="m-0">
                      <TargetOptionsPanel target={selectedTarget} />
                    </TabsContent>
                    <TabsContent value="exposures" className="m-0">
                      <ExposureTable
                        targetId={selectedTarget.id}
                        exposures={selectedTarget.exposures}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:flex flex-1 overflow-hidden">
                  {/* Target Options */}
                  <div className="w-80 border-r border-border overflow-y-auto">
                    <TargetOptionsPanel target={selectedTarget} />
                  </div>
                  {/* Exposure Table */}
                  <div className="flex-1 overflow-hidden">
                    <ExposureTable
                      targetId={selectedTarget.id}
                      exposures={selectedTarget.exposures}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>
                    {t.simple?.selectTarget ||
                      "Select a target to view details"}
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Status Bar */}
        <footer className="hidden sm:flex items-center justify-between px-3 lg:px-4 py-1 lg:py-1.5 bg-card border-t border-border text-[11px] lg:text-xs text-muted-foreground">
          <div className="flex items-center gap-3 lg:gap-4">
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span className="hidden md:inline">
                {t.simple?.targets || "Targets"}:
              </span>
              <span className="font-medium tabular-nums">
                {sequence.targets.length}
              </span>
            </span>
            <Separator orientation="vertical" className="h-3" />
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="hidden md:inline">
                {t.simple?.totalDuration || "Duration"}:
              </span>
              <span className="font-medium tabular-nums">
                {sequence.overallDuration
                  ? formatDuration(sequence.overallDuration)
                  : "--"}
              </span>
            </span>
          </div>
          <div className="truncate max-w-[200px] lg:max-w-none">
            {sequence.savePath ? (
              <span className="opacity-60">{sequence.savePath}</span>
            ) : (
              <span className="opacity-60">
                {t.simple?.unsaved || "Unsaved"}
              </span>
            )}
          </div>
        </footer>

        {/* Confirm New Dialog */}
        <AlertDialog open={confirmNewOpen} onOpenChange={setConfirmNewOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.editor.unsavedChanges}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.editor.confirmNew}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmNew}>
                {t.common.confirm}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

// ============================================================================
// Target Options Panel Component
// ============================================================================

interface TargetOptionsPanelProps {
  target: ReturnType<
    typeof useSimpleSequenceStore.getState
  >["sequence"]["targets"][0];
}

function TargetOptionsPanel({ target }: TargetOptionsPanelProps) {
  const { t } = useI18n();
  const { updateTarget, updateTargetCoordinates } = useSimpleSequenceStore(
    useShallow((state) => ({
      updateTarget: state.updateTarget,
      updateTargetCoordinates: state.updateTargetCoordinates,
    })),
  );

  const [targetOpen, setTargetOpen] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [autofocusOpen, setAutofocusOpen] = useState(false);

  return (
    <div className="p-3 space-y-3">
      {/* Target Info */}
      <Collapsible open={targetOpen} onOpenChange={setTargetOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50">
          <span className="text-sm font-medium">{t.properties.target}</span>
          {targetOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          {/* Target Name */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t.properties.targetName}</Label>
            <Input
              value={target.targetName}
              onChange={(e) =>
                updateTarget(target.id, { targetName: e.target.value })
              }
              className="h-8 text-sm"
            />
          </div>

          {/* RA/Dec */}
          <div className="space-y-2">
            <Label className="text-xs">{t.properties.ra}</Label>
            <div className="grid grid-cols-3 gap-1">
              <Input
                type="number"
                value={target.coordinates.raHours}
                onChange={(e) =>
                  updateTargetCoordinates(target.id, {
                    raHours: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8 text-sm"
                placeholder="H"
                min={0}
                max={23}
              />
              <Input
                type="number"
                value={target.coordinates.raMinutes}
                onChange={(e) =>
                  updateTargetCoordinates(target.id, {
                    raMinutes: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8 text-sm"
                placeholder="M"
                min={0}
                max={59}
              />
              <Input
                type="number"
                value={target.coordinates.raSeconds}
                onChange={(e) =>
                  updateTargetCoordinates(target.id, {
                    raSeconds: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8 text-sm"
                placeholder="S"
                min={0}
                max={59.99}
                step={0.1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">{t.properties.dec}</Label>
            <div className="grid grid-cols-4 gap-1">
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={target.coordinates.negativeDec}
                  onCheckedChange={(checked) =>
                    updateTargetCoordinates(target.id, {
                      negativeDec: !!checked,
                    })
                  }
                />
                <span className="ml-1 text-xs">-</span>
              </div>
              <Input
                type="number"
                value={target.coordinates.decDegrees}
                onChange={(e) =>
                  updateTargetCoordinates(target.id, {
                    decDegrees: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8 text-sm"
                placeholder="°"
                min={0}
                max={90}
              />
              <Input
                type="number"
                value={target.coordinates.decMinutes}
                onChange={(e) =>
                  updateTargetCoordinates(target.id, {
                    decMinutes: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8 text-sm"
                placeholder="'"
                min={0}
                max={59}
              />
              <Input
                type="number"
                value={target.coordinates.decSeconds}
                onChange={(e) =>
                  updateTargetCoordinates(target.id, {
                    decSeconds: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8 text-sm"
                placeholder='"'
                min={0}
                max={59.99}
                step={0.1}
              />
            </div>
          </div>

          {/* Position Angle */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t.properties.positionAngle} (°)</Label>
            <Input
              type="number"
              value={target.positionAngle}
              onChange={(e) =>
                updateTarget(target.id, {
                  positionAngle: parseFloat(e.target.value) || 0,
                })
              }
              className="h-8 text-sm"
              min={0}
              max={360}
              step={0.1}
            />
          </div>

          {/* Delay */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              {t.properties.delay} ({t.common.seconds})
            </Label>
            <Input
              type="number"
              value={target.delay}
              onChange={(e) =>
                updateTarget(target.id, {
                  delay: parseFloat(e.target.value) || 0,
                })
              }
              className="h-8 text-sm"
              min={0}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Target Options */}
      <Collapsible open={optionsOpen} onOpenChange={setOptionsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50">
          <span className="text-sm font-medium">
            {t.simple?.targetOptions || "Target Options"}
          </span>
          {optionsOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs">
              {t.simple?.slewToTarget || "Slew to Target"}
            </Label>
            <Checkbox
              checked={target.slewToTarget}
              onCheckedChange={(checked) =>
                updateTarget(target.id, { slewToTarget: !!checked })
              }
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs">
              {t.simple?.centerTarget || "Center Target"}
            </Label>
            <Checkbox
              checked={target.centerTarget}
              onCheckedChange={(checked) =>
                updateTarget(target.id, { centerTarget: !!checked })
              }
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs">
              {t.simple?.rotateTarget || "Rotate Target"}
            </Label>
            <Checkbox
              checked={target.rotateTarget}
              onCheckedChange={(checked) =>
                updateTarget(target.id, { rotateTarget: !!checked })
              }
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs">
              {t.simple?.startGuiding || "Start Guiding"}
            </Label>
            <Checkbox
              checked={target.startGuiding}
              onCheckedChange={(checked) =>
                updateTarget(target.id, { startGuiding: !!checked })
              }
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Autofocus Options */}
      <Collapsible open={autofocusOpen} onOpenChange={setAutofocusOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50">
          <span className="text-sm font-medium">
            {t.simple?.autofocusOptions || "Autofocus Options"}
          </span>
          {autofocusOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs">
              {t.simple?.autoFocusOnStart || "Autofocus on Start"}
            </Label>
            <Checkbox
              checked={target.autoFocusOnStart}
              onCheckedChange={(checked) =>
                updateTarget(target.id, { autoFocusOnStart: !!checked })
              }
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs">
              {t.simple?.autoFocusOnFilterChange || "On Filter Change"}
            </Label>
            <Checkbox
              checked={target.autoFocusOnFilterChange}
              onCheckedChange={(checked) =>
                updateTarget(target.id, { autoFocusOnFilterChange: !!checked })
              }
            />
          </div>

          {/* After Time */}
          <div className="space-y-1">
            <div className="flex items-center justify-between py-1">
              <Label className="text-xs">
                {t.simple?.autoFocusAfterTime || "After Time"}
              </Label>
              <Checkbox
                checked={target.autoFocusAfterSetTime}
                onCheckedChange={(checked) =>
                  updateTarget(target.id, { autoFocusAfterSetTime: !!checked })
                }
              />
            </div>
            {target.autoFocusAfterSetTime && (
              <Input
                type="number"
                value={target.autoFocusSetTime}
                onChange={(e) =>
                  updateTarget(target.id, {
                    autoFocusSetTime: parseInt(e.target.value) || 30,
                  })
                }
                className="h-8 text-sm"
                min={1}
                placeholder={t.common.minutes}
              />
            )}
          </div>

          {/* After Exposures */}
          <div className="space-y-1">
            <div className="flex items-center justify-between py-1">
              <Label className="text-xs">
                {t.simple?.autoFocusAfterExposures || "After Exposures"}
              </Label>
              <Checkbox
                checked={target.autoFocusAfterSetExposures}
                onCheckedChange={(checked) =>
                  updateTarget(target.id, {
                    autoFocusAfterSetExposures: !!checked,
                  })
                }
              />
            </div>
            {target.autoFocusAfterSetExposures && (
              <Input
                type="number"
                value={target.autoFocusSetExposures}
                onChange={(e) =>
                  updateTarget(target.id, {
                    autoFocusSetExposures: parseInt(e.target.value) || 10,
                  })
                }
                className="h-8 text-sm"
                min={1}
              />
            )}
          </div>

          {/* After Temperature Change */}
          <div className="space-y-1">
            <div className="flex items-center justify-between py-1">
              <Label className="text-xs">
                {t.simple?.autoFocusAfterTempChange || "After Temp Change"}
              </Label>
              <Checkbox
                checked={target.autoFocusAfterTemperatureChange}
                onCheckedChange={(checked) =>
                  updateTarget(target.id, {
                    autoFocusAfterTemperatureChange: !!checked,
                  })
                }
              />
            </div>
            {target.autoFocusAfterTemperatureChange && (
              <Input
                type="number"
                value={target.autoFocusAfterTemperatureChangeAmount}
                onChange={(e) =>
                  updateTarget(target.id, {
                    autoFocusAfterTemperatureChangeAmount:
                      parseFloat(e.target.value) || 1,
                  })
                }
                className="h-8 text-sm"
                min={0.1}
                step={0.1}
                placeholder="°C"
              />
            )}
          </div>

          {/* After HFR Change */}
          <div className="space-y-1">
            <div className="flex items-center justify-between py-1">
              <Label className="text-xs">
                {t.simple?.autoFocusAfterHFRChange || "After HFR Change"}
              </Label>
              <Checkbox
                checked={target.autoFocusAfterHFRChange}
                onCheckedChange={(checked) =>
                  updateTarget(target.id, {
                    autoFocusAfterHFRChange: !!checked,
                  })
                }
              />
            </div>
            {target.autoFocusAfterHFRChange && (
              <Input
                type="number"
                value={target.autoFocusAfterHFRChangeAmount}
                onChange={(e) =>
                  updateTarget(target.id, {
                    autoFocusAfterHFRChangeAmount:
                      parseFloat(e.target.value) || 15,
                  })
                }
                className="h-8 text-sm"
                min={1}
                max={100}
                placeholder="%"
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
