"use client";

import { useState, memo, useCallback, useMemo } from "react";
import { Star, User, ChevronRight, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SequenceTemplate } from "@/lib/nina/multi-sequence-store";
import { useI18n } from "@/lib/i18n";
import { TemplatePreview } from "./TemplatePreview";

interface TemplateCardProps {
  template: SequenceTemplate;
  onApply: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  displayName?: string;
  displayDescription?: string;
}

function TemplateCardComponent({
  template,
  onApply,
  onDelete,
  onEdit,
  displayName,
  displayDescription,
}: TemplateCardProps) {
  const { t } = useI18n();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const itemCount = useMemo(
    () =>
      template.sequence.startItems.length +
      template.sequence.targetItems.length +
      template.sequence.endItems.length,
    [template.sequence.startItems.length, template.sequence.targetItems.length, template.sequence.endItems.length],
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit?.();
    },
    [onEdit],
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowDeleteConfirm(true);
    },
    [],
  );

  const handleConfirmDelete = useCallback(() => {
    onDelete?.();
    setShowDeleteConfirm(false);
  }, [onDelete]);

  const handlePreviewClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowPreview(true);
    },
    [],
  );

  return (
    <>
      <Card
        className="group cursor-pointer hover:border-primary/50 active:bg-accent/50 transition-all touch-manipulation"
        onClick={onApply}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onApply()}
      >
        <CardHeader className="p-2.5 sm:p-3 pb-1.5 sm:pb-2">
          <div className="flex items-start justify-between gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              {template.category === "default" ? (
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 shrink-0" />
              ) : (
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
              )}
              <CardTitle className="text-xs sm:text-sm truncate">
                {displayName || template.name}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreviewClick}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-accent/30 shrink-0"
                    aria-label="Preview template"
                  >
                    <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Preview</p>
                </TooltipContent>
              </Tooltip>
              {onEdit && template.category === "custom" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditClick}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-accent/30 shrink-0"
                      aria-label={t.templates.editTemplate}
                    >
                      <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteClick}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-destructive/20 shrink-0"
                      aria-label={t.templates.deleteTemplate}
                    >
                      <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Delete</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          <CardDescription className="text-[11px] sm:text-xs line-clamp-2 mt-1">
            {displayDescription || template.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2.5 sm:p-3 pt-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <Badge
              variant="secondary"
              className="h-4 sm:h-5 text-[9px] sm:text-[10px] px-1 sm:px-1.5"
            >
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
              {"Are you sure you want to delete this template? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Template Preview</DialogTitle>
            <DialogDescription className="text-xs">
              Review the template contents before applying
            </DialogDescription>
          </DialogHeader>
          <TemplatePreview
            template={template}
            displayName={displayName}
            displayDescription={displayDescription}
          />
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="w-full sm:w-auto"
            >
              {t.common.close}
            </Button>
            <Button
              onClick={() => {
                setShowPreview(false);
                onApply();
              }}
              className="w-full sm:w-auto"
            >
              Apply Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const TemplateCard = memo(TemplateCardComponent);
