"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import {
  Upload,
  Download,
  Undo2,
  Redo2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Menu,
  Package,
  Settings2,
  Sparkles,
  Target,
  List,
  GitBranch,
  ChevronsUpDown,
  ChevronsDownUp,
  ClipboardPaste,
  BarChart3,
  Copy,
  Scissors,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useSequenceEditorStore,
  selectCanUndo,
  selectCanRedo,
  selectIsDirty,
} from "@/lib/nina/store";
import { exportToNINA, importFromNINA } from "@/lib/nina/serializer";
import { useI18n } from "@/lib/i18n";
import { SequenceTree } from "./SequenceTree";
import { SequenceToolbox } from "./SequenceToolbox";
import { PropertyPanel } from "./PropertyPanel";
import { WorkflowView } from "./WorkflowView";
import { LanguageSelector } from "./LanguageSelector";
import { OnboardingTour, TourHelpButton } from "./OnboardingTour";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SequenceTabs } from "./SequenceTabs";
import { TemplateSelector } from "./TemplateSelector";
import {
  useMultiSequenceStore,
  selectEditorMode,
} from "@/lib/nina/multi-sequence-store";
import { useShallow } from "zustand/react/shallow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleLeft, ToggleRight } from "lucide-react";

export function SequenceEditor() {
  const { t } = useI18n();
  const [mobileToolboxOpen, setMobileToolboxOpen] = useState(false);
  const [mobilePropertiesOpen, setMobilePropertiesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);
  const prevSelectedItemId = useRef<string | null>(null);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  // Multi-sequence store
  const {
    tabs,
    activeTabId,
    addTab,
    updateTabSequence,
    setTabDirty,
    getTabById,
    setEditorMode,
  } = useMultiSequenceStore(
    useShallow((state) => ({
      tabs: state.tabs,
      activeTabId: state.activeTabId,
      addTab: state.addTab,
      updateTabSequence: state.updateTabSequence,
      setTabDirty: state.setTabDirty,
      getTabById: state.getTabById,
      setEditorMode: state.setEditorMode,
    })),
  );

  const editorMode = useMultiSequenceStore(selectEditorMode);

  const {
    sequence,
    activeArea,
    viewMode,
    toolboxExpanded,
    propertyPanelExpanded,
    toolboxWidth,
    propertyPanelWidth,
    setActiveArea,
    setViewMode,
    setToolboxExpanded,
    setPropertyPanelExpanded,
    setToolboxWidth,
    setPropertyPanelWidth,
    loadSequence,
    selectedItemId,
    newSequence,
    clearDirty,
    setSequenceTitle,
    undo,
    redo,
    copySelectedItems,
    cutSelectedItems,
    pasteItems,
    selectAllItems,
    hasClipboard,
    expandAllItems,
    collapseAllItems,
    getSequenceStats,
  } = useSequenceEditorStore(
    useShallow((state) => ({
      sequence: state.sequence,
      activeArea: state.activeArea,
      viewMode: state.viewMode,
      toolboxExpanded: state.toolboxExpanded,
      propertyPanelExpanded: state.propertyPanelExpanded,
      toolboxWidth: state.toolboxWidth,
      propertyPanelWidth: state.propertyPanelWidth,
      setActiveArea: state.setActiveArea,
      setViewMode: state.setViewMode,
      setToolboxExpanded: state.setToolboxExpanded,
      setPropertyPanelExpanded: state.setPropertyPanelExpanded,
      setToolboxWidth: state.setToolboxWidth,
      setPropertyPanelWidth: state.setPropertyPanelWidth,
      loadSequence: state.loadSequence,
      selectedItemId: state.selectedItemId,
      newSequence: state.newSequence,
      clearDirty: state.clearDirty,
      setSequenceTitle: state.setSequenceTitle,
      undo: state.undo,
      redo: state.redo,
      copySelectedItems: state.copySelectedItems,
      cutSelectedItems: state.cutSelectedItems,
      pasteItems: state.pasteItems,
      selectAllItems: state.selectAllItems,
      hasClipboard: state.hasClipboard,
      expandAllItems: state.expandAllItems,
      collapseAllItems: state.collapseAllItems,
      getSequenceStats: state.getSequenceStats,
    })),
  );

  const canUndo = useSequenceEditorStore(selectCanUndo);
  const canRedo = useSequenceEditorStore(selectCanRedo);
  const isDirty = useSequenceEditorStore(selectIsDirty);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isResizingLeft) {
        const newWidth = Math.min(420, Math.max(200, event.clientX));
        setToolboxWidth(newWidth);
      }
      if (isResizingRight) {
        const viewportWidth = window.innerWidth;
        const newWidth = Math.min(
          520,
          Math.max(240, viewportWidth - event.clientX),
        );
        setPropertyPanelWidth(newWidth);
      }
    };

    const stopResizing = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
    };

    if (isResizingLeft || isResizingRight) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", stopResizing);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizingLeft, isResizingRight, setToolboxWidth, setPropertyPanelWidth]);

  // Create initial tab if none exists (only once on mount)
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current && tabs.length === 0) {
      hasInitialized.current = true;
      addTab(sequence);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Track if we're in the middle of switching tabs to prevent sync issues
  const isSwitchingTab = useRef(false);
  const prevActiveTabId = useRef<string | null>(null);

  // Sync active tab's sequence to editor store when tab changes
  useEffect(() => {
    if (activeTabId && activeTabId !== prevActiveTabId.current) {
      // Mark that we're switching tabs
      isSwitchingTab.current = true;

      const activeTab = getTabById(activeTabId);
      if (activeTab) {
        loadSequence(activeTab.sequence);
      }
      prevActiveTabId.current = activeTabId;

      // Allow sync after a short delay to ensure the new sequence is loaded
      requestAnimationFrame(() => {
        isSwitchingTab.current = false;
      });
    }
  }, [activeTabId, getTabById, loadSequence]);

  // Sync editor store changes back to multi-sequence store
  // Only sync when not switching tabs to prevent overwriting the new tab's data
  useEffect(() => {
    if (activeTabId && hasInitialized.current && !isSwitchingTab.current) {
      updateTabSequence(activeTabId, sequence);
      setTabDirty(activeTabId, isDirty);
    }
  }, [activeTabId, sequence, isDirty, updateTabSequence, setTabDirty]);

  // Auto-open properties panel on mobile when item is selected
  useEffect(() => {
    // Only trigger on mobile (check if we're in mobile view)
    const isMobile = window.innerWidth < 640; // sm breakpoint
    if (
      isMobile &&
      selectedItemId &&
      selectedItemId !== prevSelectedItemId.current
    ) {
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        setMobilePropertiesOpen(true);
      });
    }
    prevSelectedItemId.current = selectedItemId;
  }, [selectedItemId]);

  // Callback to close mobile toolbox
  const handleCloseMobileToolbox = useCallback(() => {
    setMobileToolboxOpen(false);
  }, []);

  // File operations
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

  const handleExport = useCallback(() => {
    try {
      const json = exportToNINA(sequence);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sequence.title || "sequence"}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      clearDirty();
    } catch (error) {
      alert("Export failed: " + (error as Error).message);
    }
  }, [sequence, clearDirty]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedSequence = importFromNINA(text);
        loadSequence(importedSequence);
      } catch (error) {
        alert("Import failed: " + (error as Error).message);
      }
    };
    input.click();
  }, [loadSequence]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSequenceTitle(e.target.value);
    },
    [setSequenceTitle],
  );

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Ctrl+S even in input fields
        if (!((e.ctrlKey || e.metaKey) && e.key === "s")) {
          return;
        }
      }

      // Ctrl+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      // Ctrl+Y or Ctrl+Shift+Z for redo
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        if (canRedo) redo();
      }
      // Ctrl+S to export/save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleExport();
      }
      // Ctrl+O to import
      if ((e.ctrlKey || e.metaKey) && e.key === "o") {
        e.preventDefault();
        handleImport();
      }
      // Ctrl+C to copy
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        copySelectedItems();
      }
      // Ctrl+X to cut
      if ((e.ctrlKey || e.metaKey) && e.key === "x") {
        e.preventDefault();
        cutSelectedItems();
      }
      // Ctrl+V to paste
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        if (hasClipboard()) {
          pasteItems();
        }
      }
      // Ctrl+A to select all
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        selectAllItems();
      }
      // Ctrl+E to expand all
      if ((e.ctrlKey || e.metaKey) && e.key === "e" && !e.shiftKey) {
        e.preventDefault();
        expandAllItems();
      }
      // Ctrl+Shift+E to collapse all
      if ((e.ctrlKey || e.metaKey) && e.key === "e" && e.shiftKey) {
        e.preventDefault();
        collapseAllItems();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    canUndo,
    canRedo,
    undo,
    redo,
    handleExport,
    handleImport,
    copySelectedItems,
    cutSelectedItems,
    pasteItems,
    selectAllItems,
    hasClipboard,
    expandAllItems,
    collapseAllItems,
  ]);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-dvh bg-background text-foreground">
        {/* Sequence Tabs - Desktop only */}
        <div className="hidden sm:block">
          <SequenceTabs />
        </div>

        {/* Header Toolbar - Responsive */}
        <header className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 bg-card border-b border-border">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 sm:flex-initial">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 shrink-0" />
            <Input
              type="text"
              value={sequence.title}
              onChange={handleTitleChange}
              className="bg-transparent border-none shadow-none text-sm sm:text-base lg:text-lg font-semibold focus-visible:ring-1 focus-visible:ring-blue-500 rounded px-1 sm:px-2 py-0.5 sm:py-1 min-w-0 w-full sm:w-auto max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] lg:max-w-none h-auto"
              placeholder={t.editor.sequenceTitle}
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
            <TemplateSelector activeTabId={activeTabId} />

            <Separator orientation="vertical" className="h-6 mx-1" />

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

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleImport}
                  className="h-8 px-2 lg:px-2.5"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden xl:inline ml-1.5 text-xs">
                    {t.editor.import}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.editor.import} (Ctrl+O)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExport}
                  className="h-8 px-2 lg:px-2.5"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden xl:inline ml-1.5 text-xs">
                    {t.editor.export}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.editor.export} (Ctrl+S)</TooltipContent>
            </Tooltip>

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

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/50 rounded-md p-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-7 w-7 p-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t.workflow?.listView || "List View"}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "workflow" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("workflow")}
                    className="h-7 w-7 p-0"
                  >
                    <GitBranch className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t.workflow?.workflowView || "Workflow View"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Right: Settings and Language */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Editor Mode Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5">
                  {editorMode === "normal" ? (
                    <ToggleLeft className="w-4 h-4" />
                  ) : (
                    <ToggleRight className="w-4 h-4" />
                  )}
                  <span className="hidden lg:inline text-xs">
                    {editorMode === "normal"
                      ? t.editor.normalMode
                      : t.editor.advancedMode}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {t.editor.modeDescription}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setEditorMode("normal")}
                  className={editorMode === "normal" ? "bg-accent" : ""}
                >
                  <ToggleLeft className="w-4 h-4 mr-2" />
                  <div className="flex flex-col">
                    <span>{t.editor.normalMode}</span>
                    <span className="text-xs text-muted-foreground">
                      {t.editor.normalModeDesc}
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setEditorMode("advanced")}
                  className={editorMode === "advanced" ? "bg-accent" : ""}
                >
                  <ToggleRight className="w-4 h-4 mr-2" />
                  <div className="flex flex-col">
                    <span>{t.editor.advancedMode}</span>
                    <span className="text-xs text-muted-foreground">
                      {t.editor.advancedModeDesc}
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator
              orientation="vertical"
              className="h-6 mx-0.5 hidden sm:block"
            />

            {/* Link to Simple Editor */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/simple">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Target className="w-4 h-4" />
                    <span className="hidden lg:inline ml-1.5 text-xs">
                      {t.simple?.title || "Simple"}
                    </span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                {t.simple?.title || "Simple Sequence Editor"}
              </TooltipContent>
            </Tooltip>

            <Separator
              orientation="vertical"
              className="h-6 mx-0.5 hidden sm:block"
            />

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
                      handleImport();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start h-11 text-sm"
                  >
                    <Upload className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">{t.editor.import}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleExport();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start h-11 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">{t.editor.export}</span>
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
                    className="justify-start h-11 text-sm col-span-2 sm:col-span-1"
                  >
                    <Redo2 className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">{t.editor.redo}</span>
                  </Button>
                </div>
                {/* Mobile Template Selector */}
                <div className="pt-2 border-t border-border">
                  <TemplateSelector activeTabId={activeTabId} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop: Keyboard Shortcuts */}
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
                  <DialogTitle>{t.shortcuts.title}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t.shortcuts.undo}
                    </span>
                    <div className="flex items-center gap-1">
                      <Kbd>Ctrl</Kbd>
                      <span className="text-muted-foreground">+</span>
                      <Kbd>Z</Kbd>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t.shortcuts.redo}
                    </span>
                    <div className="flex items-center gap-1">
                      <Kbd>Ctrl</Kbd>
                      <span className="text-muted-foreground">+</span>
                      <Kbd>Y</Kbd>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t.shortcuts.save}
                    </span>
                    <div className="flex items-center gap-1">
                      <Kbd>Ctrl</Kbd>
                      <span className="text-muted-foreground">+</span>
                      <Kbd>S</Kbd>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t.shortcuts.open}
                    </span>
                    <div className="flex items-center gap-1">
                      <Kbd>Ctrl</Kbd>
                      <span className="text-muted-foreground">+</span>
                      <Kbd>O</Kbd>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t.shortcuts.delete}
                    </span>
                    <Kbd>Delete</Kbd>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t.shortcuts.duplicate}
                    </span>
                    <div className="flex items-center gap-1">
                      <Kbd>Ctrl</Kbd>
                      <span className="text-muted-foreground">+</span>
                      <Kbd>D</Kbd>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <ThemeToggle />
            <TourHelpButton />
            <LanguageSelector />
          </div>
        </header>

        {/* Confirm New Sequence Dialog */}
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

        {/* Main Content - Responsive */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Sidebar - Toolbox (Desktop) */}
          <aside
            data-tour="toolbox"
            style={{ width: toolboxExpanded ? `${toolboxWidth}px` : "40px" }}
            className={`hidden sm:flex flex-col bg-card border-r border-border transition-all duration-300 ease-out ${
              toolboxExpanded ? "" : "w-10"
            }`}
          >
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-border shrink-0 min-h-[40px]">
              <span
                className={`text-sm font-medium truncate pl-1 transition-all duration-200 ${toolboxExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 absolute"}`}
              >
                {t.toolbox.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setToolboxExpanded(!toolboxExpanded)}
                className="ml-auto h-7 w-7 shrink-0 transition-transform duration-200 hover:scale-105"
                aria-label={
                  toolboxExpanded ? "Collapse toolbox" : "Expand toolbox"
                }
              >
                <ChevronLeft
                  className={`w-4 h-4 transition-transform duration-200 ${toolboxExpanded ? "" : "rotate-180"}`}
                />
              </Button>
            </div>
            <div
              className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin transition-opacity duration-200 ${toolboxExpanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <SequenceToolbox />
            </div>
          </aside>

          {toolboxExpanded && (
            <div
              onMouseDown={() => setIsResizingLeft(true)}
              className="hidden sm:block w-1.5 cursor-col-resize bg-border/20 hover:bg-border transition-colors"
              role="separator"
              aria-orientation="vertical"
            />
          )}

          {/* Mobile Toolbox Sheet */}
          <Sheet open={mobileToolboxOpen} onOpenChange={setMobileToolboxOpen}>
            <SheetContent
              side="left"
              className="w-[88vw] max-w-[340px] sm:hidden bg-card border-border p-0 flex flex-col"
            >
              <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
                <SheetTitle className="text-base">{t.toolbox.title}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-hidden relative">
                <SequenceToolbox
                  onClose={handleCloseMobileToolbox}
                  isMobile={true}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Center - Sequence Tree or Workflow View */}
          <main className="flex-1 flex flex-col overflow-hidden min-w-0">
            {viewMode === "list" ? (
              /* List View with Area Tabs */
              <Tabs
                value={activeArea}
                onValueChange={(v) =>
                  setActiveArea(v as "start" | "target" | "end")
                }
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div
                  data-tour="tabs"
                  className="px-2 sm:px-4 py-1.5 sm:py-2 bg-muted/30 border-b border-border flex items-center justify-between gap-2"
                >
                  <TabsList className="h-auto p-0.5 sm:p-1 bg-muted/50 w-full sm:w-auto grid grid-cols-3 sm:inline-flex gap-0.5 sm:gap-1">
                    <TabsTrigger
                      value="start"
                      className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm gap-1 sm:gap-1.5 transition-all duration-200"
                    >
                      <span className="hidden sm:inline">
                        {t.editor.startInstructions}
                      </span>
                      <span className="sm:hidden">Start</span>
                      <Badge
                        variant="secondary"
                        className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px]"
                      >
                        {sequence.startItems.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="target"
                      className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm gap-1 sm:gap-1.5 transition-all duration-200"
                    >
                      <span className="hidden sm:inline">
                        {t.editor.targetInstructions}
                      </span>
                      <span className="sm:hidden">Target</span>
                      <Badge
                        variant="secondary"
                        className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px]"
                      >
                        {sequence.targetItems.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="end"
                      className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm gap-1 sm:gap-1.5 transition-all duration-200"
                    >
                      <span className="hidden sm:inline">
                        {t.editor.endInstructions}
                      </span>
                      <span className="sm:hidden">End</span>
                      <Badge
                        variant="secondary"
                        className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px]"
                      >
                        {sequence.endItems.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>

                  {/* List View Toolbar */}
                  <div className="hidden sm:flex items-center gap-0.5">
                    {/* Clipboard Actions */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copySelectedItems}
                          className="h-7 w-7 p-0"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t.shortcuts?.copy || "Copy"} (Ctrl+C)
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cutSelectedItems}
                          className="h-7 w-7 p-0"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t.shortcuts?.cut || "Cut"} (Ctrl+X)
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => pasteItems()}
                          disabled={!hasClipboard()}
                          className="h-7 w-7 p-0"
                        >
                          <ClipboardPaste className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t.shortcuts?.paste || "Paste"} (Ctrl+V)
                      </TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="h-5 mx-1" />

                    {/* Expand/Collapse All */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={expandAllItems}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronsUpDown className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t.editor?.expandAll || "Expand All"} (Ctrl+E)
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={collapseAllItems}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronsDownUp className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t.editor?.collapseAll || "Collapse All"} (Ctrl+Shift+E)
                      </TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="h-5 mx-1" />

                    {/* Statistics */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground">
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span className="tabular-nums">
                            {getSequenceStats().totalItems}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs space-y-1">
                          <div>
                            {t.editor?.startInstructions || "Start"}:{" "}
                            {getSequenceStats().startItems}
                          </div>
                          <div>
                            {t.editor?.targetInstructions || "Target"}:{" "}
                            {getSequenceStats().targetItems}
                          </div>
                          <div>
                            {t.editor?.endInstructions || "End"}:{" "}
                            {getSequenceStats().endItems}
                          </div>
                          <div>
                            {t.toolbox?.conditions || "Conditions"}:{" "}
                            {getSequenceStats().conditions}
                          </div>
                          <div>
                            {t.toolbox?.triggers || "Triggers"}:{" "}
                            {getSequenceStats().triggers}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Sequence Tree - All tabs share the same content since SequenceTree reads activeArea from store */}
                <TabsContent
                  value={activeArea}
                  className="flex-1 overflow-hidden m-0 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 duration-200"
                >
                  <div
                    data-tour="sequence"
                    className="h-full overflow-auto p-2 sm:p-4 lg:p-6 scrollbar-thin"
                  >
                    <SequenceTree />
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              /* Workflow View */
              <div className="flex-1 overflow-hidden" data-tour="sequence">
                <WorkflowView />
              </div>
            )}
          </main>

          {/* Right Sidebar - Property Panel (Desktop) */}
          <aside
            data-tour="properties"
            style={{
              width: propertyPanelExpanded ? `${propertyPanelWidth}px` : "40px",
            }}
            className={`hidden sm:flex flex-col bg-card border-l border-border transition-all duration-300 ease-out ${
              propertyPanelExpanded ? "" : "w-10"
            }`}
          >
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-border shrink-0 min-h-[40px]">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPropertyPanelExpanded(!propertyPanelExpanded)}
                className="h-7 w-7 shrink-0 transition-transform duration-200 hover:scale-105"
                aria-label={
                  propertyPanelExpanded
                    ? "Collapse properties"
                    : "Expand properties"
                }
              >
                <ChevronRight
                  className={`w-4 h-4 transition-transform duration-200 ${propertyPanelExpanded ? "" : "rotate-180"}`}
                />
              </Button>
              <span
                className={`text-sm font-medium truncate pr-1 transition-all duration-200 ${propertyPanelExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 absolute right-0"}`}
              >
                {t.properties.title}
              </span>
            </div>
            <div
              className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin transition-opacity duration-200 ${propertyPanelExpanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <PropertyPanel />
            </div>
          </aside>

          {propertyPanelExpanded && (
            <div
              onMouseDown={() => setIsResizingRight(true)}
              className="hidden sm:block w-1.5 cursor-col-resize bg-border/20 hover:bg-border transition-colors"
              role="separator"
              aria-orientation="vertical"
            />
          )}

          {/* Mobile Properties Sheet */}
          <Sheet
            open={mobilePropertiesOpen}
            onOpenChange={setMobilePropertiesOpen}
          >
            <SheetContent
              side="right"
              className="w-[88vw] max-w-[340px] sm:hidden bg-card border-border p-0 flex flex-col"
            >
              <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
                <SheetTitle className="text-base">
                  {t.properties.title}
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                <PropertyPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Bottom Navigation - Enhanced */}
        <nav
          className="sm:hidden flex items-center bg-card border-t border-border py-1 px-1 safe-area-inset-bottom"
          aria-label="Mobile navigation"
        >
          {/* Toolbox Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileToolboxOpen(true)}
            className="flex-1 flex-col h-auto py-2 gap-0.5 min-w-0 rounded-lg active:bg-accent/70 touch-manipulation"
            aria-label={t.toolbox.title}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-medium truncate">
              {t.toolbox.title}
            </span>
          </Button>

          <Separator orientation="vertical" className="h-10 mx-0.5" />

          {/* Quick Info - Item Count */}
          <div className="flex-1 flex flex-col items-center justify-center py-2 min-w-0">
            <span className="text-sm font-semibold tabular-nums">
              {sequence.startItems.length +
                sequence.targetItems.length +
                sequence.endItems.length}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              {t.toolbox.items}
            </span>
          </div>

          <Separator orientation="vertical" className="h-10 mx-0.5" />

          {/* Properties Button - with selection indicator */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobilePropertiesOpen(true)}
            className={`flex-1 flex-col h-auto py-2 gap-0.5 min-w-0 relative rounded-lg active:bg-accent/70 touch-manipulation ${selectedItemId ? "text-primary" : ""}`}
            aria-label={t.properties.title}
          >
            <Settings2 className="w-5 h-5" />
            <span className="text-[10px] font-medium truncate">
              {t.properties.title}
            </span>
            {selectedItemId && (
              <span className="absolute top-1.5 right-1/4 w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </Button>
        </nav>

        {/* Status Bar - Responsive */}
        <footer className="hidden sm:flex items-center justify-between px-3 lg:px-4 py-1 lg:py-1.5 bg-card border-t border-border text-[11px] lg:text-xs text-muted-foreground">
          <div className="flex items-center gap-3 lg:gap-4">
            <span className="flex items-center gap-1">
              <span className="hidden md:inline">{t.toolbox.items}:</span>
              <span className="font-medium tabular-nums">
                {sequence.startItems.length +
                  sequence.targetItems.length +
                  sequence.endItems.length}
              </span>
            </span>
            <Separator orientation="vertical" className="h-3" />
            <span className="flex items-center gap-1">
              <span className="hidden md:inline">{t.toolbox.triggers}:</span>
              <span className="font-medium tabular-nums">
                {sequence.globalTriggers.length}
              </span>
            </span>
          </div>
          <div className="truncate max-w-[200px] lg:max-w-none">
            {selectedItemId ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="hidden lg:inline">Selected:</span>
                <code className="text-[10px] lg:text-xs">
                  {selectedItemId.substring(0, 8)}...
                </code>
              </span>
            ) : (
              <span className="opacity-60">{t.properties.noSelection}</span>
            )}
          </div>
        </footer>

        {/* Onboarding Tour */}
        <OnboardingTour />
      </div>
    </TooltipProvider>
  );
}
