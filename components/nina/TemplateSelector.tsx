'use client';

import { useState, useCallback, useMemo } from 'react';
import { 
  LayoutTemplate, 
  Plus, 
  Trash2, 
  Star,
  User,
  ChevronRight,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  useMultiSequenceStore, 
  type SequenceTemplate,
} from '@/lib/nina/multi-sequence-store';
import { useI18n } from '@/lib/i18n';

interface TemplateCardProps {
  template: SequenceTemplate;
  onApply: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  displayName?: string;
  displayDescription?: string;
}

function TemplateCard({ template, onApply, onDelete, onEdit, displayName, displayDescription }: TemplateCardProps) {
  const { t } = useI18n();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const itemCount = 
    template.sequence.startItems.length + 
    template.sequence.targetItems.length + 
    template.sequence.endItems.length;

  return (
    <>
      <Card 
        className="group cursor-pointer hover:border-primary/50 active:bg-accent/50 transition-all touch-manipulation"
        onClick={onApply}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onApply()}
      >
        <CardHeader className="p-2.5 sm:p-3 pb-1.5 sm:pb-2">
          <div className="flex items-start justify-between gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              {template.category === 'default' ? (
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 shrink-0" />
              ) : (
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
              )}
              <CardTitle className="text-xs sm:text-sm truncate">{displayName || template.name}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {onEdit && template.category === 'custom' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-accent/30 shrink-0"
                  aria-label={t.templates.editTemplate}
                >
                  <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-destructive/20 shrink-0"
                  aria-label={t.templates.deleteTemplate}
                >
                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-destructive" />
                </Button>
              )}
            </div>
          </div>
          <CardDescription className="text-[11px] sm:text-xs line-clamp-2 mt-1">
            {displayDescription || template.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2.5 sm:p-3 pt-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <Badge variant="secondary" className="h-4 sm:h-5 text-[9px] sm:text-[10px] px-1 sm:px-1.5">
              {itemCount} {t.toolbox.items}
            </Badge>
            <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.templates.deleteTemplate}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.sequences.confirmDelete}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0">{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete?.();
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, description: string) => void;
  mode?: 'create' | 'edit';
  initialName?: string;
  initialDescription?: string;
}

function SaveTemplateDialog({ open, onOpenChange, onSave, mode = 'create', initialName = '', initialDescription = '' }: SaveTemplateDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  const handleSave = useCallback(() => {
    if (name.trim()) {
      onSave(name.trim(), description.trim());
      onOpenChange(false);
    }
  }, [name, description, onSave, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {mode === 'create' ? t.templates.saveAsTemplate : t.templates.editTemplate}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {t.templates.templateDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
          <div className="grid gap-1.5 sm:gap-2">
            <Label htmlFor="template-name" className="text-xs sm:text-sm">{t.templates.templateName}</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.templates.templateName}
              className="h-9 sm:h-10 text-sm"
            />
          </div>
          <div className="grid gap-1.5 sm:gap-2">
            <Label htmlFor="template-desc" className="text-xs sm:text-sm">{t.templates.templateDescription}</Label>
            <Input
              id="template-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.templates.templateDescription}
              className="h-9 sm:h-10 text-sm"
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            {t.common.cancel}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="w-full sm:w-auto">
            {mode === 'create' ? t.templates.createTemplate : t.templates.editTemplate}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TemplateSelectorProps {
  activeTabId?: string | null;
}

export function TemplateSelector({ activeTabId }: TemplateSelectorProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SequenceTemplate | null>(null);
  
  const applyTemplate = useMultiSequenceStore(state => state.applyTemplate);
  const deleteTemplate = useMultiSequenceStore(state => state.deleteTemplate);
  const saveAsTemplate = useMultiSequenceStore(state => state.saveAsTemplate);
  const updateTemplate = useMultiSequenceStore(state => state.updateTemplate);
  const templates = useMultiSequenceStore(state => state.templates);
  
  // Memoize filtered templates
  const defaultTemplates = useMemo(() => templates.filter(t => t.category === 'default'), [templates]);
  const customTemplates = useMemo(() => templates.filter(t => t.category === 'custom'), [templates]);

  const handleApplyTemplate = useCallback((templateId: string) => {
    applyTemplate(templateId);
    setOpen(false);
  }, [applyTemplate]);

  const handleDeleteTemplate = useCallback((templateId: string) => {
    deleteTemplate(templateId);
  }, [deleteTemplate]);

  const handleSaveAsTemplate = useCallback((name: string, description: string) => {
    if (activeTabId) {
      saveAsTemplate(activeTabId, name, description);
    }
  }, [activeTabId, saveAsTemplate]);

  const handleEditTemplate = useCallback((template: SequenceTemplate) => {
    setEditingTemplate(template);
    setEditDialogOpen(true);
  }, []);

  const handleSaveEditTemplate = useCallback((name: string, description: string) => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, { name, description });
      setEditingTemplate(null);
    }
  }, [editingTemplate, updateTemplate]);

  const localizedDefaults = {
    'template-basic-imaging': {
      name: t.templates.basicImaging,
      description: t.templates.basicImagingDesc,
    },
    'template-dual-target': {
      name: t.templates.multiTarget,
      description: t.templates.multiTargetDesc,
    },
    'template-meridian-monitor': {
      name: t.templates.meridianMonitor,
      description: t.templates.meridianMonitorDesc,
    },
    'template-autofocus-dither': {
      name: t.templates.autofocusDither,
      description: t.templates.autofocusDitherDesc,
    },
    'template-calibration-suite': {
      name: t.templates.calibrationSuite,
      description: t.templates.calibrationSuiteDesc,
    },
    'template-planetary': {
      name: t.templates.planetarySession,
      description: t.templates.planetarySessionDesc,
    },
    'template-mosaic': {
      name: t.templates.mosaicSession,
      description: t.templates.mosaicSessionDesc,
    },
    'template-startup': {
      name: t.templates.startupRoutine,
      description: t.templates.startupRoutineDesc,
    },
    'template-flat-capture': {
      name: t.templates.flatCapture,
      description: t.templates.flatCaptureDesc,
    },
    'template-shutdown': {
      name: t.templates.shutdownRoutine,
      description: t.templates.shutdownRoutineDesc,
    },
  } as const;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 sm:gap-1.5 h-8 px-2 sm:px-3">
            <LayoutTemplate className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">{t.templates.title}</span>
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
          
          <ScrollArea className="max-h-[50vh] sm:max-h-[55vh] pr-2 sm:pr-4">
            <div className="space-y-4 sm:space-y-6">
              {/* Default Templates */}
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
                  <h3 className="font-medium text-xs sm:text-sm">{t.templates.defaultTemplates}</h3>
                  <Badge variant="secondary" className="h-4 sm:h-5 text-[9px] sm:text-[10px] px-1 sm:px-1.5">
                    {defaultTemplates.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {defaultTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onApply={() => handleApplyTemplate(template.id)}
                      displayName={localizedDefaults[template.id as keyof typeof localizedDefaults]?.name}
                      displayDescription={localizedDefaults[template.id as keyof typeof localizedDefaults]?.description}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Custom Templates */}
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                  <h3 className="font-medium text-xs sm:text-sm">{t.templates.customTemplates}</h3>
                  <Badge variant="secondary" className="h-4 sm:h-5 text-[9px] sm:text-[10px] px-1 sm:px-1.5">
                    {customTemplates.length}
                  </Badge>
                </div>
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
                  <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-muted-foreground">
                    <LayoutTemplate className="w-6 h-6 sm:w-8 sm:h-8 mb-2 opacity-50" />
                    <p className="text-xs sm:text-sm">{t.templates.noTemplates}</p>
                  </div>
                )}
              </div>
            </div>
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
                  <span className="hidden xs:inline">{t.templates.saveAsTemplate}</span>
                  <span className="xs:hidden">Save</span>
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto h-9 text-xs sm:text-sm">
              {t.common.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SaveTemplateDialog
        key={`create-${saveDialogOpen ? 'open' : 'closed'}`}
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSaveAsTemplate}
        mode="create"
      />

      <SaveTemplateDialog
        key={editingTemplate?.id || 'edit-dialog'}
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
