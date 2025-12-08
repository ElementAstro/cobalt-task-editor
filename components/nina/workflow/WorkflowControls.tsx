"use client";

import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Copy,
  Trash2,
  LayoutGrid,
  ArrowDownUp,
  ArrowLeftRight,
  Minimize2,
  Maximize,
  Sparkles,
  RefreshCw,
  Undo2,
  Redo2,
  Grid3X3,
  Map,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  GalleryHorizontal,
  GalleryVertical,
  Settings2,
  Eye,
  EyeOff,
  Keyboard,
  Scissors,
  ClipboardPaste,
} from "lucide-react";
import { Panel } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { AlignmentType, DistributeType } from "@/lib/nina/workflow-utils";
import type { Translations } from "@/lib/i18n";

interface WorkflowControlsProps {
  t: Translations;
  zoomLevel: number;
  canUndo: boolean;
  canRedo: boolean;
  autoLayoutEnabled: boolean;
  gridSnapEnabled: boolean;
  showMinimap: boolean;
  showAreaBackgrounds: boolean;
  selectedItemIds: string[];
  selectedItemId: string | null;
  hasClipboard: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onResetView: () => void;
  onSmartLayout: () => void;
  onAutoLayout: () => void;
  onCompactLayout: () => void;
  onSpreadLayout: () => void;
  onHorizontalLayout: () => void;
  onSetAutoLayoutEnabled: (enabled: boolean) => void;
  onSetGridSnapEnabled: (enabled: boolean) => void;
  onSetShowMinimap: (show: boolean) => void;
  onSetShowAreaBackgrounds: (show: boolean) => void;
  onAlign: (alignment: AlignmentType) => void;
  onDistribute: (direction: DistributeType) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onShowShortcuts: () => void;
}

export function WorkflowControls({
  t,
  zoomLevel,
  canUndo,
  canRedo,
  autoLayoutEnabled,
  gridSnapEnabled,
  showMinimap,
  showAreaBackgrounds,
  selectedItemIds,
  selectedItemId,
  hasClipboard,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  onResetView,
  onSmartLayout,
  onAutoLayout,
  onCompactLayout,
  onSpreadLayout,
  onHorizontalLayout,
  onSetAutoLayoutEnabled,
  onSetGridSnapEnabled,
  onSetShowMinimap,
  onSetShowAreaBackgrounds,
  onAlign,
  onDistribute,
  onDeleteSelected,
  onDuplicateSelected,
  onCopy,
  onCut,
  onPaste,
  onShowShortcuts,
}: WorkflowControlsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Panel
        position="bottom-left"
        className="flex gap-1 bg-card/90 backdrop-blur-sm p-1 rounded-lg border border-border shadow-lg"
      >
        {/* Undo/Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 w-8 p-0"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t.editor.undo} (Ctrl+Z)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 w-8 p-0"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t.editor.redo} (Ctrl+Y)</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6 mx-0.5" />

        {/* Clipboard Actions */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              disabled={selectedItemIds.length === 0 && !selectedItemId}
              className="h-8 w-8 p-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t.shortcuts?.copy || "Copy"} (Ctrl+C)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCut}
              disabled={selectedItemIds.length === 0 && !selectedItemId}
              className="h-8 w-8 p-0"
            >
              <Scissors className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t.shortcuts?.cut || "Cut"} (Ctrl+X)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onPaste}
              disabled={!hasClipboard}
              className="h-8 w-8 p-0"
            >
              <ClipboardPaste className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t.shortcuts?.paste || "Paste"} (Ctrl+V)</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6 mx-0.5" />

        {/* Zoom Controls */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onZoomIn}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t.workflow?.zoomIn || "Zoom In"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Zoom Level Display */}
        <span className="text-xs text-muted-foreground tabular-nums min-w-[40px] text-center">
          {zoomLevel}%
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onZoomOut}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t.workflow?.zoomOut || "Zoom Out"}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFitView}
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t.workflow?.fitView || "Fit View"}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetView}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t.workflow?.resetView || "Reset View"}</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6 mx-0.5" />

        {/* Layout dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel className="text-xs">
              {t.workflow?.autoLayout || "Layout Options"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSmartLayout}>
              <Sparkles className="w-4 h-4 mr-2" />
              <span>{t.workflow?.layoutSmart || "Smart"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAutoLayout}>
              <ArrowDownUp className="w-4 h-4 mr-2" />
              <span>{t.workflow?.layoutStandard || "Standard"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCompactLayout}>
              <Minimize2 className="w-4 h-4 mr-2" />
              <span>{t.workflow?.layoutCompact || "Compact"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSpreadLayout}>
              <Maximize className="w-4 h-4 mr-2" />
              <span>{t.workflow?.layoutSpread || "Spread"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onHorizontalLayout}>
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              <span>{t.workflow?.layoutHorizontal || "Horizontal"}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between px-2 py-1.5">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <Label
                  htmlFor="auto-layout"
                  className="text-sm cursor-pointer"
                >
                  {t.workflow?.autoRefresh || "Auto Refresh"}
                </Label>
              </div>
              <Switch
                id="auto-layout"
                checked={autoLayoutEnabled}
                onCheckedChange={onSetAutoLayoutEnabled}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Alignment dropdown (only when multi-selected) */}
        {selectedItemIds.length >= 2 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <AlignCenterVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs">
                {t.workflow?.align || "Align"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAlign("left")}>
                <AlignStartVertical className="w-4 h-4 mr-2" />
                <span>{t.workflow?.alignLeft || "Left"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAlign("center")}>
                <AlignCenterVertical className="w-4 h-4 mr-2" />
                <span>{t.workflow?.alignCenter || "Center"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAlign("right")}>
                <AlignEndVertical className="w-4 h-4 mr-2" />
                <span>{t.workflow?.alignRight || "Right"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAlign("top")}>
                <AlignStartHorizontal className="w-4 h-4 mr-2" />
                <span>{t.workflow?.alignTop || "Top"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAlign("middle")}>
                <AlignCenterHorizontal className="w-4 h-4 mr-2" />
                <span>{t.workflow?.alignMiddle || "Middle"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAlign("bottom")}>
                <AlignEndHorizontal className="w-4 h-4 mr-2" />
                <span>{t.workflow?.alignBottom || "Bottom"}</span>
              </DropdownMenuItem>
              {selectedItemIds.length >= 3 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs">
                    {t.workflow?.distribute || "Distribute"}
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onDistribute("horizontal")}>
                    <GalleryHorizontal className="w-4 h-4 mr-2" />
                    <span>{t.workflow?.distributeH || "Horizontal"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDistribute("vertical")}>
                    <GalleryVertical className="w-4 h-4 mr-2" />
                    <span>{t.workflow?.distributeV || "Vertical"}</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Separator orientation="vertical" className="h-6 mx-0.5" />

        {/* Settings dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings2 className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel className="text-xs">
              {t.workflow?.viewSettings || "View Settings"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between px-2 py-1.5">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="grid-snap" className="text-sm cursor-pointer">
                  {t.workflow?.gridSnap || "Grid Snap"}
                </Label>
              </div>
              <Switch
                id="grid-snap"
                checked={gridSnapEnabled}
                onCheckedChange={onSetGridSnapEnabled}
              />
            </div>
            <div className="flex items-center justify-between px-2 py-1.5">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-muted-foreground" />
                <Label
                  htmlFor="show-minimap"
                  className="text-sm cursor-pointer"
                >
                  {t.workflow?.showMinimap || "Minimap"}
                </Label>
              </div>
              <Switch
                id="show-minimap"
                checked={showMinimap}
                onCheckedChange={onSetShowMinimap}
              />
            </div>
            <div className="flex items-center justify-between px-2 py-1.5">
              <div className="flex items-center gap-2">
                {showAreaBackgrounds ? (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
                <Label htmlFor="area-bg" className="text-sm cursor-pointer">
                  {t.workflow?.areaBackgrounds || "Area Colors"}
                </Label>
              </div>
              <Switch
                id="area-bg"
                checked={showAreaBackgrounds}
                onCheckedChange={onSetShowAreaBackgrounds}
              />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onShowShortcuts}>
              <Keyboard className="w-4 h-4 mr-2" />
              <span>{t.workflow?.shortcuts || "Shortcuts"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Selection info */}
        {selectedItemIds.length > 1 && (
          <div className="flex items-center gap-1 px-2 text-xs text-muted-foreground">
            <span>
              {selectedItemIds.length} {t.workflow?.selected || "selected"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteSelected}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicateSelected}
              className="h-6 w-6 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        )}
      </Panel>
    </TooltipProvider>
  );
}
