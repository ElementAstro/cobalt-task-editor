"use client";

import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import { Button } from "@/components/ui/button";
import {
  useSimpleSequenceStore,
  selectCanUndo,
  selectCanRedo,
  selectIsDirty,
} from "@/lib/nina/simple-sequence-store";
import { useI18n } from "@/lib/i18n";
import { SimpleHeader } from "./SimpleHeader";
import { SimpleMobileMenu } from "./SimpleMobileMenu";
import { SimpleSidebar } from "./SimpleSidebar";
import { SimpleTargetNavigator } from "./SimpleTargetNavigator";
import { SimpleTargetDetails } from "./SimpleTargetDetails";
import { SimpleStatusBar } from "./SimpleStatusBar";

export function SimpleSequenceEditor() {
  const { t } = useI18n();
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"targets" | "exposures">("targets");
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

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

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
      showSuccess(`${t.simple?.exportJSON || "Exported"}: ${filename}`);
    } catch (error) {
      setError("Export failed: " + (error as Error).message);
    }
  }, [sequence.title, exportToJSON, clearDirty, setError, showSuccess, t.simple]);

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
      showSuccess(`${t.simple?.exportCSV || "Exported"}: ${filename}`);
    } catch (error) {
      setError("Export failed: " + (error as Error).message);
    }
  }, [sequence.title, exportToCSV, setError, showSuccess, t.simple]);

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
      showSuccess(`${t.simple?.exportXML || "Exported"}: ${filename}`);
    } catch (error) {
      setError("Export failed: " + (error as Error).message);
    }
  }, [sequence.title, exportToXML, clearDirty, setError, showSuccess, t.simple]);

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
        <SimpleHeader
          title={sequence.title}
          isDirty={isDirty}
          canUndo={canUndo}
          canRedo={canRedo}
          onTitleChange={handleTitleChange}
          onNew={handleNew}
          onImportJSON={handleImportJSON}
          onImportCSV={handleImportCSV}
          onExportJSON={handleExportJSON}
          onExportCSV={handleExportCSV}
          onExportXML={handleExportXML}
          onUndo={undo}
          onRedo={redo}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          t={t}
        />

        {/* Mobile Menu */}
        <SimpleMobileMenu
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
          canUndo={canUndo}
          canRedo={canRedo}
          onNew={handleNew}
          onImportJSON={handleImportJSON}
          onImportCSV={handleImportCSV}
          onExportJSON={handleExportJSON}
          onExportCSV={handleExportCSV}
          onExportXML={handleExportXML}
          onUndo={undo}
          onRedo={redo}
          t={t}
        />

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
          {/* Mobile Target Navigator */}
          <SimpleTargetNavigator
            targets={sequence.targets}
            selectedTargetId={sequence.selectedTargetId}
            mobileDrawerOpen={mobileDrawerOpen}
            onMobileDrawerOpenChange={setMobileDrawerOpen}
            onSelectTarget={selectTarget}
            onAddTarget={addTarget}
            t={t}
          />

          {/* Left Panel: Sidebar (Desktop) */}
          <SimpleSidebar
            targets={sequence.targets}
            selectedTargetId={sequence.selectedTargetId}
            activeTargetId={sequence.activeTargetId}
            overallDuration={sequence.overallDuration ?? null}
            overallEndTime={sequence.overallEndTime?.toISOString() ?? null}
            totalExposures={totalExposures}
            remainingExposures={remainingExposures}
            onSelectTarget={selectTarget}
            onAddTarget={addTarget}
            onMoveTargetUp={moveTargetUp}
            onMoveTargetDown={moveTargetDown}
            onDuplicateTarget={duplicateTarget}
            onDeleteTarget={removeTarget}
            onResetTargetProgress={resetTargetProgress}
            onCopyExposuresToAll={copyExposuresToAllTargets}
            t={t}
          />

          {/* Right Panel: Target Details + Exposure Table */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <SimpleTargetDetails
              target={selectedTarget || null}
              activeTab={activeTab}
              onActiveTabChange={setActiveTab}
              onResetProgress={resetTargetProgress}
              t={t}
            />
          </main>
        </div>

        {/* Status Bar */}
        <SimpleStatusBar
          targetCount={sequence.targets.length}
          overallDuration={sequence.overallDuration ?? null}
          savePath={sequence.savePath ?? null}
          t={t}
        />

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
