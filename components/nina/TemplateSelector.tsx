"use client";

import { useState, useCallback, useMemo } from "react";
import { LayoutTemplate, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useMultiSequenceStore,
  type SequenceTemplate,
  selectEditorMode,
} from "@/lib/nina/multi-sequence-store";
import { useI18n } from "@/lib/i18n";

// Import sub-components
import { TemplateCard } from "./template/TemplateCard";
import { SaveTemplateDialog } from "./template/SaveTemplateDialog";
import { TemplateEmptyState } from "./template/TemplateEmptyState";
import { TemplateSection } from "./template/TemplateSection";

// Re-export sub-components for convenience
export { TemplateCard } from "./template/TemplateCard";
export { SaveTemplateDialog } from "./template/SaveTemplateDialog";
export { TemplateEmptyState } from "./template/TemplateEmptyState";
export { TemplateSection } from "./template/TemplateSection";

interface TemplateSelectorProps {
  activeTabId?: string | null;
}

export function TemplateSelector({ activeTabId }: TemplateSelectorProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<SequenceTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const applyTemplate = useMultiSequenceStore((state) => state.applyTemplate);
  const deleteTemplate = useMultiSequenceStore((state) => state.deleteTemplate);
  const saveAsTemplate = useMultiSequenceStore((state) => state.saveAsTemplate);
  const updateTemplate = useMultiSequenceStore((state) => state.updateTemplate);
  const templates = useMultiSequenceStore((state) => state.templates);
  const editorMode = useMultiSequenceStore(selectEditorMode);

  // Memoize filtered templates - filter by current editor mode and search query
  // In normal mode, show only normal mode templates
  // In advanced mode, show all templates (both normal and advanced)
  const filterBySearch = useCallback(
    (template: SequenceTemplate) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query)
      );
    },
    [searchQuery],
  );

  const defaultTemplates = useMemo(
    () =>
      templates.filter(
        (t) =>
          t.category === "default" &&
          (editorMode === "advanced" || t.mode === "normal") &&
          filterBySearch(t),
      ),
    [templates, editorMode, filterBySearch],
  );
  const customTemplates = useMemo(
    () =>
      templates.filter(
        (t) =>
          t.category === "custom" &&
          (editorMode === "advanced" || t.mode === "normal") &&
          filterBySearch(t),
      ),
    [templates, editorMode, filterBySearch],
  );

  const handleApplyTemplate = useCallback(
    (templateId: string) => {
      applyTemplate(templateId);
      setOpen(false);
    },
    [applyTemplate],
  );

  const handleDeleteTemplate = useCallback(
    (templateId: string) => {
      deleteTemplate(templateId);
    },
    [deleteTemplate],
  );

  const handleSaveAsTemplate = useCallback(
    (name: string, description: string) => {
      if (activeTabId) {
        saveAsTemplate(activeTabId, name, description);
      }
    },
    [activeTabId, saveAsTemplate],
  );

  const handleEditTemplate = useCallback((template: SequenceTemplate) => {
    setEditingTemplate(template);
    setEditDialogOpen(true);
  }, []);

  const handleSaveEditTemplate = useCallback(
    (name: string, description: string) => {
      if (editingTemplate) {
        updateTemplate(editingTemplate.id, { name, description });
        setEditingTemplate(null);
      }
    },
    [editingTemplate, updateTemplate],
  );

  const localizedDefaults = {
    "template-basic-imaging": {
      name: t.templates.basicImaging,
      description: t.templates.basicImagingDesc,
    },
    "template-dual-target": {
      name: t.templates.multiTarget,
      description: t.templates.multiTargetDesc,
    },
    "template-meridian-monitor": {
      name: t.templates.meridianMonitor,
      description: t.templates.meridianMonitorDesc,
    },
    "template-autofocus-dither": {
      name: t.templates.autofocusDither,
      description: t.templates.autofocusDitherDesc,
    },
    "template-calibration-suite": {
      name: t.templates.calibrationSuite,
      description: t.templates.calibrationSuiteDesc,
    },
    "template-planetary": {
      name: t.templates.planetarySession,
      description: t.templates.planetarySessionDesc,
    },
    "template-mosaic": {
      name: t.templates.mosaicSession,
      description: t.templates.mosaicSessionDesc,
    },
    "template-startup": {
      name: t.templates.startupRoutine,
      description: t.templates.startupRoutineDesc,
    },
    "template-flat-capture": {
      name: t.templates.flatCapture,
      description: t.templates.flatCaptureDesc,
    },
    "template-shutdown": {
      name: t.templates.shutdownRoutine,
      description: t.templates.shutdownRoutineDesc,
    },
  } as const;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 sm:gap-1.5 h-8 px-2 sm:px-3"
          >
            <LayoutTemplate className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">
              {t.templates.title}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <LayoutTemplate className="w-4 h-4 sm:w-5 sm:h-5" />
              {t.templates.title}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {t.templates.useTemplate}
            </DialogDescription>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9 text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <ScrollArea className="max-h-[45vh] sm:max-h-[50vh] pr-2 sm:pr-4">
            {/* No results message */}
            {searchQuery && defaultTemplates.length === 0 && customTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No templates found for &quot;{searchQuery}&quot;
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs"
                >
                  Clear search
                </Button>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Default Templates */}
                {defaultTemplates.length > 0 && (
                  <TemplateSection
                    title={t.templates.defaultTemplates}
                    count={defaultTemplates.length}
                    variant="default"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {defaultTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onApply={() => handleApplyTemplate(template.id)}
                          displayName={
                            localizedDefaults[
                              template.id as keyof typeof localizedDefaults
                            ]?.name
                          }
                          displayDescription={
                            localizedDefaults[
                              template.id as keyof typeof localizedDefaults
                            ]?.description
                          }
                        />
                      ))}
                    </div>
                  </TemplateSection>
                )}

                {defaultTemplates.length > 0 && <Separator />}

                {/* Custom Templates */}
                <TemplateSection
                  title={t.templates.customTemplates}
                  count={customTemplates.length}
                  variant="custom"
                >
                  {customTemplates.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {customTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onApply={() => handleApplyTemplate(template.id)}
                          onDelete={() => handleDeleteTemplate(template.id)}
                          onEdit={() => handleEditTemplate(template)}
                        />
                      ))}
                    </div>
                  ) : (
                    <TemplateEmptyState message={searchQuery ? "No matching custom templates" : t.templates.noTemplates} />
                  )}
                </TemplateSection>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 sm:pt-0">
            <div className="flex gap-2 w-full sm:w-auto">
              {activeTabId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    setSaveDialogOpen(true);
                  }}
                  className="gap-1 sm:gap-1.5 flex-1 sm:flex-initial text-xs sm:text-sm h-9"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">
                    {t.templates.saveAsTemplate}
                  </span>
                  <span className="xs:hidden">Save</span>
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto h-9 text-xs sm:text-sm"
            >
              {t.common.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SaveTemplateDialog
        key={`create-${saveDialogOpen ? "open" : "closed"}`}
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSaveAsTemplate}
        mode="create"
      />

      <SaveTemplateDialog
        key={editingTemplate?.id || "edit-dialog"}
        open={editDialogOpen}
        onOpenChange={(val) => {
          setEditDialogOpen(val);
          if (!val) setEditingTemplate(null);
        }}
        onSave={handleSaveEditTemplate}
        mode="edit"
        initialName={editingTemplate?.name}
        initialDescription={editingTemplate?.description}
      />
    </>
  );
}
