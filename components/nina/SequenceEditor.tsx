"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import {
  Upload,
  Download,
  Undo2,
  Redo2,
  Plus,
  Sparkles,
  Target,
  List,
  GitBranch,
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
  useSequenceEditorStore,
  selectCanUndo,
  selectCanRedo,
  selectIsDirty,
} from "@/lib/nina/store";
import { exportToNINA, importFromNINA } from "@/lib/nina/serializer";
import { useI18n } from "@/lib/i18n";
import { SequenceTree } from "./SequenceTree";
import { WorkflowView } from "./WorkflowView";
import { LanguageSelector } from "./LanguageSelector";
import { OnboardingTour, TourHelpButton } from "./OnboardingTour";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

// Editor sub-components
import {
  EditorModeToggle,
  KeyboardShortcutsDialog,
  MobileMenu,
  ConfirmNewDialog,
  ToolboxSidebar,
  PropertySidebar,
  MobileToolboxSheet,
  MobilePropertiesSheet,
  ListViewToolbar,
  MobileBottomNav,
  StatusBar,
} from "./editor";

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
            <EditorModeToggle
              editorMode={editorMode}
              onModeChange={setEditorMode}
              translations={{
                normalMode: t.editor.normalMode,
                advancedMode: t.editor.advancedMode,
                modeDescription: t.editor.modeDescription,
                normalModeDesc: t.editor.normalModeDesc,
                advancedModeDesc: t.editor.advancedModeDesc,
              }}
            />

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
            <MobileMenu
              open={mobileMenuOpen}
              onOpenChange={setMobileMenuOpen}
              onNew={handleNew}
              onImport={handleImport}
              onExport={handleExport}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              activeTabId={activeTabId}
              translations={{
                actions: t.common.actions,
                newSequence: t.editor.newSequence,
                import: t.editor.import,
                export: t.editor.export,
                undo: t.editor.undo,
                redo: t.editor.redo,
              }}
            />

            {/* Desktop: Keyboard Shortcuts */}
            <KeyboardShortcutsDialog
              translations={{
                title: t.shortcuts.title,
                undo: t.shortcuts.undo,
                redo: t.shortcuts.redo,
                save: t.shortcuts.save,
                open: t.shortcuts.open,
                delete: t.shortcuts.delete,
                duplicate: t.shortcuts.duplicate,
              }}
            />

            <ThemeToggle />
            <TourHelpButton />
            <LanguageSelector />
          </div>
        </header>

        {/* Confirm New Sequence Dialog */}
        <ConfirmNewDialog
          open={confirmNewOpen}
          onOpenChange={setConfirmNewOpen}
          onConfirm={handleConfirmNew}
          translations={{
            unsavedChanges: t.editor.unsavedChanges,
            confirmNew: t.editor.confirmNew,
            cancel: t.common.cancel,
            confirm: t.common.confirm,
          }}
        />

        {/* Main Content - Responsive */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Sidebar - Toolbox (Desktop) */}
          <ToolboxSidebar
            expanded={toolboxExpanded}
            width={toolboxWidth}
            onExpandedChange={setToolboxExpanded}
            onResizeStart={() => setIsResizingLeft(true)}
            title={t.toolbox.title}
          />

          {/* Mobile Toolbox Sheet */}
          <MobileToolboxSheet
            open={mobileToolboxOpen}
            onOpenChange={setMobileToolboxOpen}
            onClose={handleCloseMobileToolbox}
            title={t.toolbox.title}
          />

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
                  <ListViewToolbar
                    onCopy={copySelectedItems}
                    onCut={cutSelectedItems}
                    onPaste={() => pasteItems()}
                    canPaste={hasClipboard()}
                    onExpandAll={expandAllItems}
                    onCollapseAll={collapseAllItems}
                    stats={getSequenceStats()}
                    translations={{
                      copy: t.shortcuts?.copy || "Copy",
                      cut: t.shortcuts?.cut || "Cut",
                      paste: t.shortcuts?.paste || "Paste",
                      expandAll: t.editor?.expandAll || "Expand All",
                      collapseAll: t.editor?.collapseAll || "Collapse All",
                      start: t.editor?.startInstructions || "Start",
                      target: t.editor?.targetInstructions || "Target",
                      end: t.editor?.endInstructions || "End",
                      conditions: t.toolbox?.conditions || "Conditions",
                      triggers: t.toolbox?.triggers || "Triggers",
                    }}
                  />
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
          <PropertySidebar
            expanded={propertyPanelExpanded}
            width={propertyPanelWidth}
            onExpandedChange={setPropertyPanelExpanded}
            onResizeStart={() => setIsResizingRight(true)}
            title={t.properties.title}
          />

          {/* Mobile Properties Sheet */}
          <MobilePropertiesSheet
            open={mobilePropertiesOpen}
            onOpenChange={setMobilePropertiesOpen}
            title={t.properties.title}
          />
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          onToolboxOpen={() => setMobileToolboxOpen(true)}
          onPropertiesOpen={() => setMobilePropertiesOpen(true)}
          itemCount={
            sequence.startItems.length +
            sequence.targetItems.length +
            sequence.endItems.length
          }
          hasSelection={!!selectedItemId}
          translations={{
            toolbox: t.toolbox.title,
            properties: t.properties.title,
            items: t.toolbox.items,
          }}
        />

        {/* Status Bar */}
        <StatusBar
          itemCount={
            sequence.startItems.length +
            sequence.targetItems.length +
            sequence.endItems.length
          }
          triggerCount={sequence.globalTriggers.length}
          selectedItemId={selectedItemId}
          translations={{
            items: t.toolbox.items,
            triggers: t.toolbox.triggers,
            noSelection: t.properties.noSelection,
          }}
        />

        {/* Onboarding Tour */}
        <OnboardingTour />
      </div>
    </TooltipProvider>
  );
}
