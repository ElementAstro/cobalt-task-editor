"use client";

import { useCallback, useState, useRef, useEffect, memo } from "react";
import {
  ChevronRight,
  MoreVertical,
  Trash2,
  Copy,
  GripVertical,
  Repeat,
  Zap,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  Terminal,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSequenceEditorStore } from "@/lib/nina/store";
import {
  createSequenceItem,
  createCondition,
  createTrigger,
} from "@/lib/nina/utils";
import { isContainerType } from "@/lib/nina/constants";
import { useI18n, getItemNameKey } from "@/lib/i18n";
import type {
  EditorSequenceItem,
  SequenceEntityStatus,
} from "@/lib/nina/types";

import { StatusIcon } from "./StatusIcon";
import { getItemIcon } from "./ItemIcon";
import { DropIndicator } from "./DropIndicator";
import { ConditionNode } from "./ConditionNode";
import { TriggerNode } from "./TriggerNode";

// Drop position type
type DropPosition = "before" | "after" | "inside" | null;

// Sequence Item Component
export interface SequenceItemNodeProps {
  item: EditorSequenceItem;
  depth: number;
  area: "start" | "target" | "end";
  index: number;
  parentId: string | null;
  onDragStart: (
    e: React.DragEvent,
    item: EditorSequenceItem,
    index: number,
    parentId: string | null,
  ) => void;
  onDragEnd: () => void;
  draggedItem: { id: string; parentId: string | null } | null;
}

function SequenceItemNodeComponent({
  item,
  depth,
  area,
  index,
  parentId,
  onDragStart,
  onDragEnd,
  draggedItem,
}: SequenceItemNodeProps) {
  const { t } = useI18n();
  const {
    selectedItemId,
    selectItem,
    updateItem,
    deleteItem,
    duplicateItem,
    addCondition,
    addTrigger,
    addItem,
    moveItem,
  } = useSequenceEditorStore();

  // Get translated item name
  const getTranslatedName = useCallback(() => {
    const key = getItemNameKey(item.type);
    if (key && t.ninaItems[key]) {
      return t.ninaItems[key];
    }
    return item.name;
  }, [item.type, item.name, t.ninaItems]);

  const [dropPosition, setDropPosition] = useState<DropPosition>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedItemId === item.id;
  const isContainer = isContainerType(item.type);
  const isDragging = draggedItem?.id === item.id;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectItem(item.id);
    },
    [item.id, selectItem],
  );

  const handleToggleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isContainer) {
        updateItem(item.id, { isExpanded: !item.isExpanded });
      }
    },
    [isContainer, item.id, item.isExpanded, updateItem],
  );

  const handleDelete = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    deleteItem(item.id);
    setDeleteDialogOpen(false);
  }, [item.id, deleteItem]);

  const handleDuplicate = useCallback(() => {
    duplicateItem(item.id);
  }, [item.id, duplicateItem]);

  const handleToggleDisable = useCallback(() => {
    const newStatus = item.status === "DISABLED" ? "CREATED" : "DISABLED";
    updateItem(item.id, { status: newStatus as SequenceEntityStatus });
  }, [item.id, item.status, updateItem]);

  const handleInsertBefore = useCallback(() => {
    const newItem = createSequenceItem(item.type);
    addItem(area, newItem, parentId, index);
  }, [item.type, addItem, area, parentId, index]);

  const handleInsertAfter = useCallback(() => {
    const newItem = createSequenceItem(item.type);
    addItem(area, newItem, parentId, index + 1);
  }, [item.type, addItem, area, parentId, index]);

  const handleInsertChild = useCallback(() => {
    if (!isContainer) return;
    const newItem = createSequenceItem(item.type);
    addItem(area, newItem, item.id, item.items?.length ?? 0);
  }, [isContainer, item.type, item.id, item.items, addItem, area]);

  const handleAddCondition = useCallback(() => {
    if (!isContainer) return;
    const newCondition = createCondition(
      "NINA.Sequencer.SequenceCondition.Condition, NINA.Sequencer",
    );
    addCondition(item.id, newCondition);
  }, [isContainer, item.id, addCondition]);

  const handleAddTrigger = useCallback(() => {
    if (!isContainer) return;
    const newTrigger = createTrigger(
      "NINA.Sequencer.SequenceTrigger.Trigger, NINA.Sequencer",
    );
    addTrigger(item.id, newTrigger);
  }, [isContainer, item.id, addTrigger]);

  const handleMoveUp = useCallback(() => {
    if (index > 0) {
      moveItem(item.id, area, parentId, index - 1);
    }
  }, [item.id, index, area, parentId, moveItem]);

  const handleMoveDown = useCallback(() => {
    // We'll move to index + 2 because after removal, the target index shifts
    moveItem(item.id, area, parentId, index + 2);
  }, [item.id, index, area, parentId, moveItem]);

  const handleSelectParent = useCallback(() => {
    if (!parentId) return;
    selectItem(parentId);
  }, [parentId, selectItem]);

  const handleCopyType = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(item.type);
    } catch (error) {
      console.error("Clipboard copy failed", error);
    }
  }, [item.type]);

  const handleExpandAll = useCallback(() => {
    const expandRecursively = (items: EditorSequenceItem[]) => {
      items.forEach((i) => {
        if (isContainerType(i.type)) {
          updateItem(i.id, { isExpanded: true });
          if (i.items) expandRecursively(i.items);
        }
      });
    };
    if (item.items) expandRecursively([item]);
  }, [item, updateItem]);

  const handleCollapseAll = useCallback(() => {
    const collapseRecursively = (items: EditorSequenceItem[]) => {
      items.forEach((i) => {
        if (isContainerType(i.type)) {
          updateItem(i.id, { isExpanded: false });
          if (i.items) collapseRecursively(i.items);
        }
      });
    };
    if (item.items) collapseRecursively([item]);
  }, [item, updateItem]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key
      if (e.key === "Delete" && !e.ctrlKey && !e.metaKey) {
        handleDelete();
      }
      // Ctrl+D for duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        handleDuplicate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelected, handleDelete, handleDuplicate]);

  const handleItemDragStart = useCallback(
    (e: React.DragEvent) => {
      onDragStart(e, item, index, parentId);
    },
    [item, index, parentId, onDragStart],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!itemRef.current || isDragging) return;

      const rect = itemRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;

      // Determine drop position based on mouse position
      if (isContainer && item.isExpanded) {
        // For expanded containers, only allow before/inside
        if (y < height * 0.3) {
          setDropPosition("before");
        } else {
          setDropPosition("inside");
        }
      } else if (isContainer) {
        // For collapsed containers, allow before/inside/after
        if (y < height * 0.25) {
          setDropPosition("before");
        } else if (y > height * 0.75) {
          setDropPosition("after");
        } else {
          setDropPosition("inside");
        }
      } else {
        // For non-containers, only allow before/after
        if (y < height * 0.5) {
          setDropPosition("before");
        } else {
          setDropPosition("after");
        }
      }
    },
    [isDragging, isContainer, item.isExpanded],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDropPosition(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const currentDropPosition = dropPosition;
      setDropPosition(null);

      try {
        const data = JSON.parse(e.dataTransfer.getData("application/json"));

        if (data.type === "move" && data.itemId !== item.id) {
          // Moving an existing item
          let targetParentId: string | null;
          let targetIndex: number;

          if (currentDropPosition === "inside" && isContainer) {
            // Drop inside container
            targetParentId = item.id;
            targetIndex = item.items?.length || 0;
          } else if (currentDropPosition === "before") {
            // Drop before this item
            targetParentId = parentId;
            targetIndex = index;
          } else {
            // Drop after this item
            targetParentId = parentId;
            targetIndex = index + 1;
          }

          // Adjust index if moving within the same parent
          if (data.parentId === targetParentId && data.index < targetIndex) {
            targetIndex--;
          }

          moveItem(data.itemId, area, targetParentId, targetIndex);
        } else if (data.item) {
          // New item from toolbox
          if (data.type === "item") {
            const newItem = createSequenceItem(data.item.type);
            if (currentDropPosition === "inside" && isContainer) {
              addItem(area, newItem, item.id);
            } else if (currentDropPosition === "before") {
              addItem(area, newItem, parentId, index);
            } else {
              addItem(area, newItem, parentId, index + 1);
            }
          } else if (data.type === "condition" && isContainer) {
            const newCondition = createCondition(data.item.type);
            addCondition(item.id, newCondition);
          } else if (data.type === "trigger" && isContainer) {
            const newTrigger = createTrigger(data.item.type);
            addTrigger(item.id, newTrigger);
          }
        }
      } catch (err) {
        console.error("Drop error:", err);
      }
    },
    [
      item,
      index,
      parentId,
      isContainer,
      dropPosition,
      area,
      moveItem,
      addItem,
      addCondition,
      addTrigger,
    ],
  );

  // Menu items for both dropdown and context menu
  const menuItems = (
    <>
      <DropdownMenuItem onClick={handleDuplicate}>
        <Copy className="w-4 h-4 mr-2" />
        {t.common.duplicate}
        <DropdownMenuShortcut>Ctrl+D</DropdownMenuShortcut>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={handleToggleDisable}>
        {item.status === "DISABLED" ? (
          <>
            <Eye className="w-4 h-4 mr-2" />
            {t.common.enable}
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4 mr-2" />
            {t.common.disable}
          </>
        )}
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleInsertBefore}>
        <ArrowUp className="w-4 h-4 mr-2" />
        {t.editor.insertBefore}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleInsertAfter}>
        <ArrowDown className="w-4 h-4 mr-2" />
        {t.editor.insertAfter}
      </DropdownMenuItem>
      {isContainer && (
        <DropdownMenuItem onClick={handleInsertChild}>
          <ChevronRight className="w-4 h-4 mr-2" />
          {t.editor.insertInside}
        </DropdownMenuItem>
      )}
      {isContainer && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleAddCondition}>
            <Repeat className="w-4 h-4 mr-2" />
            {t.toolbox.addCondition}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddTrigger}>
            <Zap className="w-4 h-4 mr-2" />
            {t.toolbox.addTrigger}
          </DropdownMenuItem>
        </>
      )}

      <DropdownMenuItem onClick={handleMoveUp} disabled={index === 0}>
        <ArrowUp className="w-4 h-4 mr-2" />
        {t.editor.moveUp}
      </DropdownMenuItem>

      <DropdownMenuItem onClick={handleMoveDown}>
        <ArrowDown className="w-4 h-4 mr-2" />
        {t.editor.moveDown}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleSelectParent} disabled={!parentId}>
        <ChevronUp className="w-4 h-4 mr-2" />
        {t.editor.selectParent}
      </DropdownMenuItem>

      {isContainer && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExpandAll}>
            <ChevronsUpDown className="w-4 h-4 mr-2" />
            {t.editor.expandAll}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCollapseAll}>
            <ChevronUp className="w-4 h-4 mr-2" />
            {t.editor.collapseAll}
          </DropdownMenuItem>
        </>
      )}

      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleCopyType}>
        <Terminal className="w-4 h-4 mr-2" />
        {t.editor.copyType}
      </DropdownMenuItem>

      <DropdownMenuItem onClick={handleDelete} className="text-red-400">
        <Trash2 className="w-4 h-4 mr-2" />
        {t.common.delete}
        <DropdownMenuShortcut>Del</DropdownMenuShortcut>
      </DropdownMenuItem>
    </>
  );

  // Context menu items
  const contextMenuItems = (
    <>
      <ContextMenuLabel>{t.editor.itemActions}</ContextMenuLabel>
      <ContextMenuItem onClick={handleDuplicate}>
        <Copy className="w-4 h-4 mr-2" />
        {t.common.duplicate}
        <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
      </ContextMenuItem>

      <ContextMenuItem onClick={handleToggleDisable}>
        {item.status === "DISABLED" ? (
          <>
            <Eye className="w-4 h-4 mr-2" />
            {t.common.enable}
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4 mr-2" />
            {t.common.disable}
          </>
        )}
      </ContextMenuItem>

      <ContextMenuSeparator />
      <ContextMenuItem onClick={handleInsertBefore}>
        <ArrowUp className="w-4 h-4 mr-2" />
        {t.editor.insertBefore}
      </ContextMenuItem>
      <ContextMenuItem onClick={handleInsertAfter}>
        <ArrowDown className="w-4 h-4 mr-2" />
        {t.editor.insertAfter}
      </ContextMenuItem>
      {isContainer && (
        <ContextMenuItem onClick={handleInsertChild}>
          <ChevronRight className="w-4 h-4 mr-2" />
          {t.editor.insertInside}
        </ContextMenuItem>
      )}
      {isContainer && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleAddCondition}>
            <Repeat className="w-4 h-4 mr-2" />
            {t.toolbox.addCondition}
          </ContextMenuItem>
          <ContextMenuItem onClick={handleAddTrigger}>
            <Zap className="w-4 h-4 mr-2" />
            {t.toolbox.addTrigger}
          </ContextMenuItem>
        </>
      )}

      <ContextMenuItem onClick={handleMoveUp} disabled={index === 0}>
        <ArrowUp className="w-4 h-4 mr-2" />
        {t.editor.moveUp}
      </ContextMenuItem>

      <ContextMenuItem onClick={handleMoveDown}>
        <ArrowDown className="w-4 h-4 mr-2" />
        {t.editor.moveDown}
      </ContextMenuItem>

      {isContainer && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleExpandAll}>
            <ChevronsUpDown className="w-4 h-4 mr-2" />
            {t.editor.expandAll}
          </ContextMenuItem>
          <ContextMenuItem onClick={handleCollapseAll}>
            <ChevronUp className="w-4 h-4 mr-2" />
            {t.editor.collapseAll}
          </ContextMenuItem>
        </>
      )}

      <ContextMenuSeparator />
      <ContextMenuItem onClick={handleCopyType}>
        <Terminal className="w-4 h-4 mr-2" />
        {t.editor.copyType}
      </ContextMenuItem>

      <ContextMenuItem onClick={handleDelete} className="text-red-400">
        <Trash2 className="w-4 h-4 mr-2" />
        {t.common.delete}
        <ContextMenuShortcut>Del</ContextMenuShortcut>
      </ContextMenuItem>
    </>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="select-none">
          {/* Drop indicator - before */}
          {dropPosition === "before" && <DropIndicator depth={depth} />}

          {/* Item Header */}
          <div
            ref={itemRef}
            draggable
            onDragStart={handleItemDragStart}
            onDragEnd={onDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`
              flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-2 sm:py-1.5 rounded-lg border border-border/40 bg-card/10 cursor-pointer group relative
              ${isSelected ? "border-primary/60 bg-primary/10 shadow-sm" : "hover:border-border/70 hover:bg-card/20 active:bg-card/30"}
              ${dropPosition === "inside" && isContainer ? "border-primary/40 bg-primary/5" : ""}
              ${item.status === "DISABLED" ? "opacity-50" : ""}
              ${isDragging ? "opacity-40 scale-[0.98]" : ""}
              transition-all duration-150 touch-manipulation select-none
            `}
            style={{ paddingLeft: `${Math.max(depth * 10, 4) + 4}px` }}
          >
            {/* Drag Handle - Hidden on mobile, shown on desktop hover */}
            <GripVertical
              className="w-3 h-3 text-muted-foreground/50 hidden sm:block opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing shrink-0"
              aria-hidden
            />

            {/* Expand/Collapse - Larger tap target on mobile */}
            {isContainer ? (
              <button
                onClick={handleToggleExpand}
                className="p-1 sm:p-0.5 hover:bg-accent active:bg-accent/80 rounded-md touch-manipulation -ml-0.5 sm:ml-0 shrink-0 transition-colors"
                aria-expanded={item.isExpanded}
                aria-label={item.isExpanded ? "Collapse" : "Expand"}
              >
                <ChevronRight
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${item.isExpanded ? "rotate-90" : ""}`}
                />
              </button>
            ) : (
              <span className="w-4 sm:w-5 shrink-0" />
            )}

            {/* Status */}
            <StatusIcon status={item.status} />

            {/* Icon */}
            {getItemIcon(item.type)}

            {/* Name */}
            <span
              className={`flex-1 text-xs sm:text-sm truncate ${item.status === "DISABLED" ? "line-through text-muted-foreground" : ""}`}
            >
              {getTranslatedName()}
            </span>

            {/* Item counts for containers */}
            {isContainer && item.items && (
              <Badge
                variant="secondary"
                className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px] shrink-0 hidden xs:flex"
              >
                {item.items.length}
              </Badge>
            )}

            {/* Conditions indicator */}
            {item.conditions && item.conditions.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px] border-yellow-500/50 text-yellow-400 gap-0.5 shrink-0"
                  >
                    <Repeat className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="hidden xs:inline">
                      {item.conditions.length}
                    </span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="hidden sm:block">
                  <p className="text-xs">
                    {item.conditions.length} {t.toolbox.conditions}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Triggers indicator */}
            {item.triggers && item.triggers.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px] border-purple-500/50 text-purple-400 gap-0.5 shrink-0"
                  >
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="hidden xs:inline">
                      {item.triggers.length}
                    </span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="hidden sm:block">
                  <p className="text-xs">
                    {item.triggers.length} {t.toolbox.triggers}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Three-dot Menu Button (Dropdown) - Always visible on mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  className="h-6 w-6 sm:h-7 sm:w-7 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shrink-0"
                  aria-label={t.a11y.openMenu}
                >
                  <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[160px] max-w-[90vw]">
                {menuItems}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Drop indicator - after (only for non-containers or collapsed containers) */}
          {dropPosition === "after" && (!isContainer || !item.isExpanded) && (
            <DropIndicator depth={depth} />
          )}

          {/* Conditions */}
          {isContainer &&
            item.isExpanded &&
            item.conditions &&
            item.conditions.length > 0 && (
              <div
                className="ml-2 sm:ml-4 mt-0.5 sm:mt-1 mb-0.5 sm:mb-1"
                style={{ paddingLeft: `${Math.max(depth * 10, 4) + 12}px` }}
              >
                <div className="text-[10px] sm:text-xs text-yellow-400/70 mb-0.5 sm:mb-1 font-medium">
                  {t.toolbox.conditions}:
                </div>
                <div className="space-y-0.5">
                  {item.conditions.map((condition) => (
                    <ConditionNode
                      key={condition.id}
                      condition={condition}
                      containerId={item.id}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* Triggers */}
          {isContainer &&
            item.isExpanded &&
            item.triggers &&
            item.triggers.length > 0 && (
              <div
                className="ml-2 sm:ml-4 mt-0.5 sm:mt-1 mb-0.5 sm:mb-1"
                style={{ paddingLeft: `${Math.max(depth * 10, 4) + 12}px` }}
              >
                <div className="text-[10px] sm:text-xs text-purple-400/70 mb-0.5 sm:mb-1 font-medium">
                  {t.toolbox.triggers}:
                </div>
                <div className="space-y-0.5">
                  {item.triggers.map((trigger) => (
                    <TriggerNode
                      key={trigger.id}
                      trigger={trigger}
                      containerId={item.id}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* Children */}
          {isContainer && item.isExpanded && item.items && (
            <div>
              {item.items.map((child, childIndex) => (
                <SequenceItemNode
                  key={child.id}
                  item={child}
                  depth={depth + 1}
                  area={area}
                  index={childIndex}
                  parentId={item.id}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  draggedItem={draggedItem}
                />
              ))}
              {/* Drop indicator at end of container */}
              {dropPosition === "after" && item.items.length === 0 && (
                <DropIndicator depth={depth + 1} />
              )}
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      {/* Right-click Context Menu Content */}
      <ContextMenuContent className="min-w-[200px] max-w-[90vw]">
        {contextMenuItems}
      </ContextMenuContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.delete}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.editor.confirmDelete.replace("{name}", item.name)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ContextMenu>
  );
}

// Memoize the component to prevent unnecessary re-renders
// Only re-render when item data, selection state, or drag state changes
export const SequenceItemNode = memo(SequenceItemNodeComponent, (prev, next) => {
  // Custom comparison for better performance
  return (
    prev.item.id === next.item.id &&
    prev.item.name === next.item.name &&
    prev.item.type === next.item.type &&
    prev.item.status === next.item.status &&
    prev.item.isExpanded === next.item.isExpanded &&
    prev.item.items?.length === next.item.items?.length &&
    prev.item.conditions?.length === next.item.conditions?.length &&
    prev.item.triggers?.length === next.item.triggers?.length &&
    prev.depth === next.depth &&
    prev.area === next.area &&
    prev.index === next.index &&
    prev.parentId === next.parentId &&
    prev.draggedItem?.id === next.draggedItem?.id
  );
});
