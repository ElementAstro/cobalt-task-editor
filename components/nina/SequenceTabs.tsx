"use client";

import { useState, useCallback, memo } from "react";
import { X, Plus, Copy, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  useMultiSequenceStore,
  type SequenceTab,
  selectCanAddTab,
} from "@/lib/nina/multi-sequence-store";
import { useShallow } from "zustand/react/shallow";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface SequenceTabItemProps {
  tab: SequenceTab;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
  onDuplicate: () => void;
  onCloseOthers: () => void;
}

const SequenceTabItem = memo(function SequenceTabItem({
  tab,
  isActive,
  onSelect,
  onClose,
  onDuplicate,
  onCloseOthers,
}: SequenceTabItemProps) {
  const { t } = useI18n();
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (tab.isDirty) {
        setShowCloseConfirm(true);
      } else {
        onClose();
      }
    },
    [tab.isDirty, onClose],
  );

  const handleConfirmClose = useCallback(() => {
    setShowCloseConfirm(false);
    onClose();
  }, [onClose]);

  return (
    <>
      <div
        onClick={onSelect}
        role="tab"
        aria-selected={isActive}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
        className={cn(
          "group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 cursor-pointer border-b-2 transition-all min-w-[90px] sm:min-w-[120px] max-w-[160px] sm:max-w-[200px] touch-manipulation",
          isActive
            ? "border-primary bg-accent/50 text-foreground"
            : "border-transparent hover:bg-accent/30 active:bg-accent/50 text-muted-foreground hover:text-foreground",
        )}
      >
        <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
        <span className="truncate text-xs sm:text-sm flex-1">
          {tab.sequence.title}
        </span>
        {tab.isDirty && (
          <Badge
            variant="secondary"
            className="h-3.5 w-3.5 sm:h-4 sm:w-4 p-0 flex items-center justify-center text-[8px] sm:text-[10px] shrink-0"
          >
            •
          </Badge>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
              aria-label="Tab options"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              {t.sequences.duplicateSequence}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onCloseOthers}>
              {t.sequences.closeOthers}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleClose}
              className="text-destructive"
            >
              <X className="w-4 h-4 mr-2" />
              {t.sequences.closeSequence}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-destructive/20 shrink-0"
          aria-label="Close tab"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.sequences.unsavedChanges}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.sequences.confirmClose}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0">
              {t.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              {t.sequences.closeSequence}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

export function SequenceTabs() {
  const { t } = useI18n();
  const {
    tabs,
    activeTabId,
    addTab,
    closeTab,
    setActiveTab,
    duplicateTab,
    closeOtherTabs,
    editorMode,
  } = useMultiSequenceStore(
    useShallow((state) => ({
      tabs: state.tabs,
      activeTabId: state.activeTabId,
      addTab: state.addTab,
      closeTab: state.closeTab,
      setActiveTab: state.setActiveTab,
      duplicateTab: state.duplicateTab,
      closeOtherTabs: state.closeOtherTabs,
      editorMode: state.editorMode,
    })),
  );

  const canAddTab = useMultiSequenceStore(selectCanAddTab);

  const handleNewTab = useCallback(() => {
    addTab();
  }, [addTab]);

  const handleSelectTab = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
    },
    [setActiveTab],
  );

  const handleCloseTab = useCallback(
    (tabId: string) => {
      closeTab(tabId);
    },
    [closeTab],
  );

  const handleDuplicateTab = useCallback(
    (tabId: string) => {
      duplicateTab(tabId);
    },
    [duplicateTab],
  );

  const handleCloseOthers = useCallback(
    (tabId: string) => {
      closeOtherTabs(tabId);
    },
    [closeOtherTabs],
  );

  if (tabs.length === 0) {
    return (
      <div className="flex items-center h-8 sm:h-9 px-2 bg-muted/30 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewTab}
          className="h-6 sm:h-7 gap-1 sm:gap-1.5 text-xs"
        >
          <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden xs:inline">{t.sequences.newSequence}</span>
          <span className="xs:hidden">New</span>
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center h-8 sm:h-9 bg-muted/30 border-b border-border"
      role="tablist"
    >
      <ScrollArea className="flex-1">
        <div className="flex items-center">
          {tabs.map((tab) => (
            <SequenceTabItem
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onSelect={() => handleSelectTab(tab.id)}
              onClose={() => handleCloseTab(tab.id)}
              onDuplicate={() => handleDuplicateTab(tab.id)}
              onCloseOthers={() => handleCloseOthers(tab.id)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-1 sm:h-1.5" />
      </ScrollArea>

      {/* Only show add tab button in advanced mode or when no tabs exist */}
      {canAddTab && (
        <div className="flex items-center px-0.5 sm:px-1 border-l border-border shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewTab}
                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                aria-label={t.sequences.newSequence}
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t.sequences.newSequence}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
      {/* Show mode indicator in normal mode */}
      {editorMode === "normal" && (
        <div className="flex items-center px-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="h-5 text-[10px]">
            {t.editor?.normalMode || "Normal"}
          </Badge>
        </div>
      )}
    </div>
  );
}
