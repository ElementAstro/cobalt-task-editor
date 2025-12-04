'use client';

import { useState, useCallback, useMemo } from 'react';
import { 
  LayoutTemplate, 
  Plus, 
  Trash2, 
  Star,
  User,
  ChevronRight,
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
}

function TemplateCard({ template, onApply, onDelete }: TemplateCardProps) {
  const { t } = useI18n();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const itemCount = 
    template.sequence.startItems.length + 
    template.sequence.targetItems.length + 
    template.sequence.endItems.length;

  return (
    <>
      <Card 
        className="group cursor-pointer hover:border-primary/50 transition-colors"
        onClick={onApply}
      >
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {template.category === 'default' ? (
                <Star className="w-4 h-4 text-yellow-500 shrink-0" />
              ) : (
                <User className="w-4 h-4 text-blue-500 shrink-0" />
              )}
              <CardTitle className="text-sm truncate">{template.name}</CardTitle>
            </div>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/20"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            )}
          </div>
          <CardDescription className="text-xs line-clamp-2">
            {template.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="h-5 text-[10px]">
              {itemCount} {t.toolbox.items}
            </Badge>
            <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.templates.deleteTemplate}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.sequences.confirmDelete}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
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
}

function SaveTemplateDialog({ open, onOpenChange, onSave }: SaveTemplateDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = useCallback(() => {
    if (name.trim()) {
      onSave(name.trim(), description.trim());
      setName('');
      setDescription('');
      onOpenChange(false);
    }
  }, [name, description, onSave, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.templates.saveAsTemplate}</DialogTitle>
          <DialogDescription>
            {t.templates.templateDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="template-name">{t.templates.templateName}</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.templates.templateName}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="template-desc">{t.templates.templateDescription}</Label>
            <Input
              id="template-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.templates.templateDescription}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {t.templates.createTemplate}
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
  
  const applyTemplate = useMultiSequenceStore(state => state.applyTemplate);
  const deleteTemplate = useMultiSequenceStore(state => state.deleteTemplate);
  const saveAsTemplate = useMultiSequenceStore(state => state.saveAsTemplate);
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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <LayoutTemplate className="w-4 h-4" />
            <span className="hidden sm:inline">{t.templates.title}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5" />
              {t.templates.title}
            </DialogTitle>
            <DialogDescription>
              {t.templates.useTemplate}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[50vh] pr-4">
            <div className="space-y-6">
              {/* Default Templates */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <h3 className="font-medium text-sm">{t.templates.defaultTemplates}</h3>
                  <Badge variant="secondary" className="h-5 text-[10px]">
                    {defaultTemplates.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {defaultTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onApply={() => handleApplyTemplate(template.id)}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Custom Templates */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-blue-500" />
                  <h3 className="font-medium text-sm">{t.templates.customTemplates}</h3>
                  <Badge variant="secondary" className="h-5 text-[10px]">
                    {customTemplates.length}
                  </Badge>
                </div>
                {customTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onApply={() => handleApplyTemplate(template.id)}
                        onDelete={() => handleDeleteTemplate(template.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <LayoutTemplate className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">{t.templates.noTemplates}</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <div className="flex gap-2">
              {activeTabId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    setSaveDialogOpen(true);
                  }}
                  className="gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {t.templates.saveAsTemplate}
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t.common.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SaveTemplateDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSaveAsTemplate}
      />
    </>
  );
}
