'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useSequenceEditorStore, selectCanUndo, selectCanRedo, selectIsDirty } from '@/lib/nina/store';
import { exportToNINA, importFromNINA } from '@/lib/nina/serializer';
import { useI18n } from '@/lib/i18n';
import { SequenceTree } from './SequenceTree';
import { SequenceToolbox } from './SequenceToolbox';
import { PropertyPanel } from './PropertyPanel';
import { LanguageSelector } from './LanguageSelector';
import { OnboardingTour, TourHelpButton } from './OnboardingTour';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { SequenceTabs } from './SequenceTabs';
import { TemplateSelector } from './TemplateSelector';
import { useMultiSequenceStore } from '@/lib/nina/multi-sequence-store';
import { useShallow } from 'zustand/react/shallow';

export function SequenceEditor() {
  const { t } = useI18n();
  const [mobileToolboxOpen, setMobileToolboxOpen] = useState(false);
  const [mobilePropertiesOpen, setMobilePropertiesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);
  const prevSelectedItemId = useRef<string | null>(null);
  
  // Multi-sequence store
  const { tabs, activeTabId, addTab, updateTabSequence, setTabDirty, getTabById } = useMultiSequenceStore(useShallow(state => ({
    tabs: state.tabs,
    activeTabId: state.activeTabId,
    addTab: state.addTab,
    updateTabSequence: state.updateTabSequence,
    setTabDirty: state.setTabDirty,
    getTabById: state.getTabById,
  })));
  
  const {
    sequence,
    selectedItemId,
    activeArea,
    toolboxExpanded,
    propertyPanelExpanded,
    setActiveArea,
    setToolboxExpanded,
    setPropertyPanelExpanded,
    newSequence,
    loadSequence,
    setSequenceTitle,
    undo,
    redo,
    clearDirty,
  } = useSequenceEditorStore();
  
  const canUndo = useSequenceEditorStore(selectCanUndo);
  const canRedo = useSequenceEditorStore(selectCanRedo);
  const isDirty = useSequenceEditorStore(selectIsDirty);
  
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
    if (isMobile && selectedItemId && selectedItemId !== prevSelectedItemId.current) {
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
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sequence.title || 'sequence'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      clearDirty();
    } catch (error) {
      alert('Export failed: ' + (error as Error).message);
    }
  }, [sequence, clearDirty]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const importedSequence = importFromNINA(text);
        loadSequence(importedSequence);
      } catch (error) {
        alert('Import failed: ' + (error as Error).message);
      }
    };
    input.click();
  }, [loadSequence]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSequenceTitle(e.target.value);
  }, [setSequenceTitle]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      // Ctrl+Y or Ctrl+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
      }
      // Ctrl+S to export/save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleExport();
      }
      // Ctrl+O to import
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        handleImport();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, handleExport, handleImport]);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-dvh bg-background text-foreground">
        {/* Sequence Tabs - Desktop only */}
        <div className="hidden sm:block">
          <SequenceTabs />
        </div>
        
        {/* Header Toolbar - Responsive */}
        <header className="flex items-center justify-between px-2 sm:px-4 py-2 bg-card border-b border-border gap-2">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 shrink-0" />
            <Input
              type="text"
              value={sequence.title}
              onChange={handleTitleChange}
              className="bg-transparent border-none shadow-none text-sm sm:text-lg font-semibold focus-visible:ring-1 focus-visible:ring-blue-500 rounded px-1 sm:px-2 py-1 min-w-0 w-full sm:w-auto max-w-[120px] sm:max-w-none h-auto"
              placeholder={t.editor.sequenceTitle}
            />
            {isDirty && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-500/50 shrink-0">
                *
              </Badge>
            )}
          </div>
          
          {/* Center: Desktop Actions */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <TemplateSelector activeTabId={activeTabId} />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleNew} className="px-2 lg:px-3">
                  <Plus className="w-4 h-4 lg:mr-1" />
                  <span className="hidden lg:inline">{t.editor.newSequence}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.editor.newSequence}</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleImport} className="px-2 lg:px-3">
                  <Upload className="w-4 h-4 lg:mr-1" />
                  <span className="hidden lg:inline">{t.editor.import}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.editor.import} (Ctrl+O)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleExport} className="px-2 lg:px-3">
                  <Download className="w-4 h-4 lg:mr-1" />
                  <span className="hidden lg:inline">{t.editor.export}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.editor.export} (Ctrl+S)</TooltipContent>
            </Tooltip>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo}>
                  <Undo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.editor.undo} (Ctrl+Z)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo}>
                  <Redo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.editor.redo} (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </div>

          {/* Right: Settings and Language */}
          <div className="flex items-center gap-1">
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="bg-zinc-800 border-zinc-700">
                <SheetHeader>
                  <SheetTitle className="text-zinc-100">{t.common.actions}</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-2 gap-2 py-4">
                  <Button variant="outline" onClick={() => { handleNew(); setMobileMenuOpen(false); }} className="justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    {t.editor.newSequence}
                  </Button>
                  <Button variant="outline" onClick={() => { handleImport(); setMobileMenuOpen(false); }} className="justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    {t.editor.import}
                  </Button>
                  <Button variant="outline" onClick={() => { handleExport(); setMobileMenuOpen(false); }} className="justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    {t.editor.export}
                  </Button>
                  <Button variant="outline" onClick={() => { undo(); setMobileMenuOpen(false); }} disabled={!canUndo} className="justify-start">
                    <Undo2 className="w-4 h-4 mr-2" />
                    {t.editor.undo}
                  </Button>
                  <Button variant="outline" onClick={() => { redo(); setMobileMenuOpen(false); }} disabled={!canRedo} className="justify-start">
                    <Redo2 className="w-4 h-4 mr-2" />
                    {t.editor.redo}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Desktop: Keyboard Shortcuts */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Keyboard className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t.shortcuts.title}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.shortcuts.undo}</span>
                    <div className="flex items-center gap-1">
                      <Kbd>Ctrl</Kbd>
                      <span className="text-muted-foreground">+</span>
                      <Kbd>Z</Kbd>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.shortcuts.redo}</span>
                    <div className="flex items-center gap-1">
                      <Kbd>Ctrl</Kbd>
                      <span className="text-muted-foreground">+</span>
                      <Kbd>Y</Kbd>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.shortcuts.save}</span>
                    <div className="flex items-center gap-1">
                      <Kbd>Ctrl</Kbd>
                      <span className="text-muted-foreground">+</span>
                      <Kbd>S</Kbd>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.shortcuts.open}</span>
                    <div className="flex items-center gap-1">
                      <Kbd>Ctrl</Kbd>
                      <span className="text-muted-foreground">+</span>
                      <Kbd>O</Kbd>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.shortcuts.delete}</span>
                    <Kbd>Delete</Kbd>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.shortcuts.duplicate}</span>
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
            className={`hidden sm:flex flex-col bg-card border-r border-border transition-all duration-300 ${
              toolboxExpanded ? 'w-56 lg:w-64' : 'w-10 lg:w-12'
            }`}
          >
            <div className="flex items-center justify-between p-1.5 lg:p-2 border-b border-border">
              {toolboxExpanded && <span className="text-xs lg:text-sm font-medium truncate">{t.toolbox.title}</span>}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setToolboxExpanded(!toolboxExpanded)}
                className="ml-auto p-1 lg:p-2"
              >
                {toolboxExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
            {toolboxExpanded && <SequenceToolbox />}
          </aside>

          {/* Mobile Toolbox Sheet */}
          <Sheet open={mobileToolboxOpen} onOpenChange={setMobileToolboxOpen}>
            <SheetContent side="left" className="w-[85vw] max-w-sm sm:hidden bg-card border-border p-0 flex flex-col">
              <SheetHeader className="p-4 border-b border-border shrink-0">
                <SheetTitle>{t.toolbox.title}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-hidden relative">
                <SequenceToolbox onClose={handleCloseMobileToolbox} isMobile={true} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Center - Sequence Tree */}
          <main className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Area Tabs - Responsive */}
            <div data-tour="tabs" className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-1.5 sm:py-2 bg-muted/50 border-b border-border overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveArea('start')}
                className={`shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-t text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeArea === 'start' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <span className="hidden sm:inline">{t.editor.startInstructions}</span>
                <span className="sm:hidden">Start</span>
                <span className="ml-1 sm:ml-2 text-xs text-muted-foreground">
                  ({sequence.startItems.length})
                </span>
              </button>
              <button
                onClick={() => setActiveArea('target')}
                className={`shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-t text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeArea === 'target' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <span className="hidden sm:inline">{t.editor.targetInstructions}</span>
                <span className="sm:hidden">Target</span>
                <span className="ml-1 sm:ml-2 text-xs text-muted-foreground">
                  ({sequence.targetItems.length})
                </span>
              </button>
              <button
                onClick={() => setActiveArea('end')}
                className={`shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-t text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeArea === 'end' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <span className="hidden sm:inline">{t.editor.endInstructions}</span>
                <span className="sm:hidden">End</span>
                <span className="ml-1 sm:ml-2 text-xs text-muted-foreground">
                  ({sequence.endItems.length})
                </span>
              </button>
            </div>

            {/* Sequence Tree */}
            <div data-tour="sequence" className="flex-1 overflow-auto p-2 sm:p-4">
              <SequenceTree />
            </div>
          </main>

          {/* Right Sidebar - Property Panel (Desktop) */}
          <aside 
            data-tour="properties"
            className={`hidden sm:flex flex-col bg-card border-l border-border transition-all duration-300 ${
              propertyPanelExpanded ? 'w-72 lg:w-80 xl:w-96' : 'w-10 lg:w-12'
            }`}
          >
            <div className="flex items-center justify-between p-1.5 lg:p-2 border-b border-border">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPropertyPanelExpanded(!propertyPanelExpanded)}
                className="p-1 lg:p-2"
              >
                {propertyPanelExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
              {propertyPanelExpanded && <span className="text-xs lg:text-sm font-medium truncate">{t.properties.title}</span>}
            </div>
            {propertyPanelExpanded && <PropertyPanel />}
          </aside>

          {/* Mobile Properties Sheet */}
          <Sheet open={mobilePropertiesOpen} onOpenChange={setMobilePropertiesOpen}>
            <SheetContent side="right" className="w-[85vw] max-w-sm sm:hidden bg-card border-border p-0 flex flex-col">
              <SheetHeader className="p-4 border-b border-border shrink-0">
                <SheetTitle>{t.properties.title}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <PropertyPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Bottom Navigation - Enhanced */}
        <div className="sm:hidden flex items-center bg-card border-t border-border py-1.5 px-2 safe-area-inset-bottom">
          {/* Toolbox Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileToolboxOpen(true)}
            className="flex-1 flex-col h-auto py-1.5 gap-0.5 min-w-0"
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] truncate">{t.toolbox.title}</span>
          </Button>
          
          <div className="w-px h-10 bg-border" />
          
          {/* Quick Info - Item Count */}
          <div className="flex-1 flex flex-col items-center justify-center py-1.5 min-w-0">
            <span className="text-xs font-medium">
              {sequence.startItems.length + sequence.targetItems.length + sequence.endItems.length}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">{t.toolbox.items}</span>
          </div>
          
          <div className="w-px h-10 bg-border" />
          
          {/* Properties Button - with selection indicator */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobilePropertiesOpen(true)}
            className={`flex-1 flex-col h-auto py-1.5 gap-0.5 min-w-0 relative ${selectedItemId ? 'text-blue-400' : ''}`}
          >
            <Settings2 className="w-5 h-5" />
            <span className="text-[10px] truncate">{t.properties.title}</span>
            {selectedItemId && (
              <span className="absolute top-1 right-1/4 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </Button>
        </div>

        {/* Status Bar - Responsive */}
        <footer className="hidden sm:flex items-center justify-between px-4 py-1 bg-card border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              {t.toolbox.items}: {sequence.startItems.length + sequence.targetItems.length + sequence.endItems.length}
            </span>
            <span>
              {t.toolbox.triggers}: {sequence.globalTriggers.length}
            </span>
          </div>
          <div className="truncate">
            {selectedItemId ? `Selected: ${selectedItemId.substring(0, 8)}...` : t.properties.noSelection}
          </div>
        </footer>
        
        {/* Onboarding Tour */}
        <OnboardingTour />
      </div>
    </TooltipProvider>
  );
}
