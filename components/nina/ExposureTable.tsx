"use client";

import { memo, useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSimpleSequenceStore } from "@/lib/nina/simple-sequence-store";
import {
  SimpleExposure,
  ImageType,
  SequenceEntityStatus,
  DEFAULT_FILTERS,
  DEFAULT_BINNING_OPTIONS,
} from "@/lib/nina/simple-sequence-types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ExposureTableProps {
  targetId: string;
  exposures: SimpleExposure[];
}

export const ExposureTable = memo(function ExposureTable({
  targetId,
  exposures,
}: ExposureTableProps) {
  const { t } = useI18n();
  const [selectedExposureId, setSelectedExposureId] = useState<string | null>(
    null,
  );

  const {
    addExposure,
    removeExposure,
    duplicateExposure,
    moveExposureUp,
    moveExposureDown,
    updateExposure,
    resetExposureProgress,
    resetAllExposureProgress,
  } = useSimpleSequenceStore(
    useShallow((state) => ({
      addExposure: state.addExposure,
      removeExposure: state.removeExposure,
      duplicateExposure: state.duplicateExposure,
      moveExposureUp: state.moveExposureUp,
      moveExposureDown: state.moveExposureDown,
      updateExposure: state.updateExposure,
      resetExposureProgress: state.resetExposureProgress,
      resetAllExposureProgress: state.resetAllExposureProgress,
    })),
  );

  const handleAddExposure = useCallback(() => {
    addExposure(targetId);
  }, [addExposure, targetId]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedExposureId) {
      removeExposure(targetId, selectedExposureId);
      setSelectedExposureId(null);
    }
  }, [removeExposure, targetId, selectedExposureId]);

  const handleDuplicateSelected = useCallback(() => {
    if (selectedExposureId) {
      const newId = duplicateExposure(targetId, selectedExposureId);
      if (newId) setSelectedExposureId(newId);
    }
  }, [duplicateExposure, targetId, selectedExposureId]);

  const handleMoveUp = useCallback(() => {
    if (selectedExposureId) {
      moveExposureUp(targetId, selectedExposureId);
    }
  }, [moveExposureUp, targetId, selectedExposureId]);

  const handleMoveDown = useCallback(() => {
    if (selectedExposureId) {
      moveExposureDown(targetId, selectedExposureId);
    }
  }, [moveExposureDown, targetId, selectedExposureId]);

  const handleResetProgress = useCallback(() => {
    if (selectedExposureId) {
      resetExposureProgress(targetId, selectedExposureId);
    }
  }, [resetExposureProgress, targetId, selectedExposureId]);

  const handleResetAll = useCallback(() => {
    resetAllExposureProgress(targetId);
  }, [resetAllExposureProgress, targetId]);

  // Get selected index for move buttons
  const selectedIndex = exposures.findIndex((e) => e.id === selectedExposureId);

  // Image type options
  const imageTypeOptions = Object.values(ImageType);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleAddExposure}>
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{t.common.add}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {t.simple?.addExposure || "Add Exposure"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={!selectedExposureId}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{t.common.delete}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.common.delete}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicateSelected}
              disabled={!selectedExposureId}
            >
              <Copy className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{t.common.duplicate}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.common.duplicate}</TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-1 ml-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleMoveUp}
                disabled={!selectedExposureId || selectedIndex === 0}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.editor.moveUp}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleMoveDown}
                disabled={
                  !selectedExposureId || selectedIndex === exposures.length - 1
                }
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.editor.moveDown}</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetProgress}
              disabled={!selectedExposureId}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">
                {t.simple?.reset || "Reset"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {t.simple?.resetProgress || "Reset Progress"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleResetAll}>
              <RotateCcw className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">
                {t.simple?.resetAll || "Reset All"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {t.simple?.resetAllProgress || "Reset All Progress"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead className="w-16 text-center">
                  {t.properties.enabled}
                </TableHead>
                <TableHead className="w-24 text-center">
                  {t.simple?.progress || "Progress"}
                </TableHead>
                <TableHead className="w-20 text-center">
                  {t.properties.totalCount}
                </TableHead>
                <TableHead className="w-24 text-center">
                  {t.properties.exposureTime}
                </TableHead>
                <TableHead className="w-24 text-center">
                  {t.properties.imageType}
                </TableHead>
                <TableHead className="w-24 text-center">
                  {t.properties.filter}
                </TableHead>
                <TableHead className="w-24 text-center">
                  {t.properties.binning}
                </TableHead>
                <TableHead className="w-16 text-center">
                  {t.simple?.dither || "Dither"}
                </TableHead>
                <TableHead className="w-20 text-center">
                  {t.simple?.ditherEvery || "Every #"}
                </TableHead>
                <TableHead className="w-20 text-center">
                  {t.properties.gain}
                </TableHead>
                <TableHead className="w-20 text-center">
                  {t.properties.offset}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exposures.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {t.simple?.noExposures ||
                      'No exposures. Click "Add" to create one.'}
                  </TableCell>
                </TableRow>
              ) : (
                exposures.map((exposure, index) => (
                  <ExposureRow
                    key={exposure.id}
                    exposure={exposure}
                    index={index}
                    targetId={targetId}
                    isSelected={exposure.id === selectedExposureId}
                    onSelect={() => setSelectedExposureId(exposure.id)}
                    imageTypeOptions={imageTypeOptions}
                    updateExposure={updateExposure}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
});

// ============================================================================
// Exposure Row Component
// ============================================================================

interface ExposureRowProps {
  exposure: SimpleExposure;
  index: number;
  targetId: string;
  isSelected: boolean;
  onSelect: () => void;
  imageTypeOptions: string[];
  updateExposure: (
    targetId: string,
    exposureId: string,
    updates: Partial<SimpleExposure>,
  ) => void;
}

const ExposureRow = memo(function ExposureRow({
  exposure,
  index,
  targetId,
  isSelected,
  onSelect,
  imageTypeOptions,
  updateExposure,
}: ExposureRowProps) {
  const { t } = useI18n();

  const getStatusColor = (status: SequenceEntityStatus) => {
    switch (status) {
      case SequenceEntityStatus.RUNNING:
        return "text-blue-400";
      case SequenceEntityStatus.FINISHED:
        return "text-green-400";
      case SequenceEntityStatus.FAILED:
        return "text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <TableRow
      onClick={onSelect}
      className={cn(
        "cursor-pointer transition-colors",
        isSelected && "bg-emerald-500/10 hover:bg-emerald-500/15",
        !exposure.enabled && "opacity-50",
      )}
    >
      {/* Index */}
      <TableCell className="text-center text-xs text-muted-foreground">
        {index + 1}
      </TableCell>

      {/* Enabled */}
      <TableCell className="text-center">
        <Checkbox
          checked={exposure.enabled}
          onCheckedChange={(checked) =>
            updateExposure(targetId, exposure.id, { enabled: !!checked })
          }
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>

      {/* Progress */}
      <TableCell className="text-center">
        <Badge
          variant="outline"
          className={cn("tabular-nums", getStatusColor(exposure.status))}
        >
          {exposure.progressCount} / {exposure.totalCount}
        </Badge>
      </TableCell>

      {/* Total Count */}
      <TableCell className="text-center p-1">
        <Input
          type="number"
          value={exposure.totalCount}
          onChange={(e) =>
            updateExposure(targetId, exposure.id, {
              totalCount: parseInt(e.target.value) || 1,
            })
          }
          onClick={(e) => e.stopPropagation()}
          className="h-7 w-16 text-center text-xs mx-auto"
          min={1}
        />
      </TableCell>

      {/* Exposure Time */}
      <TableCell className="text-center p-1">
        <Input
          type="number"
          value={exposure.exposureTime}
          onChange={(e) =>
            updateExposure(targetId, exposure.id, {
              exposureTime: parseFloat(e.target.value) || 1,
            })
          }
          onClick={(e) => e.stopPropagation()}
          className="h-7 w-20 text-center text-xs mx-auto"
          min={0.001}
          step={0.1}
        />
      </TableCell>

      {/* Image Type */}
      <TableCell className="text-center p-1">
        <Select
          value={exposure.imageType}
          onValueChange={(value) =>
            updateExposure(targetId, exposure.id, {
              imageType: value as ImageType,
            })
          }
        >
          <SelectTrigger
            className="h-7 w-20 text-xs mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {imageTypeOptions.map((type) => (
              <SelectItem key={type} value={type} className="text-xs">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Filter */}
      <TableCell className="text-center p-1">
        <Select
          value={exposure.filter?.name || "none"}
          onValueChange={(value) => {
            if (value === "none") {
              updateExposure(targetId, exposure.id, { filter: null });
            } else {
              const filter = DEFAULT_FILTERS.find((f) => f.name === value);
              if (filter) {
                updateExposure(targetId, exposure.id, { filter });
              }
            }
          }}
        >
          <SelectTrigger
            className="h-7 w-20 text-xs mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" className="text-xs">
              {t.simple?.noFilter || "None"}
            </SelectItem>
            {DEFAULT_FILTERS.map((filter) => (
              <SelectItem
                key={filter.name}
                value={filter.name}
                className="text-xs"
              >
                {filter.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Binning */}
      <TableCell className="text-center p-1">
        <Select
          value={`${exposure.binning.x}x${exposure.binning.y}`}
          onValueChange={(value) => {
            const [x, y] = value.split("x").map(Number);
            updateExposure(targetId, exposure.id, { binning: { x, y } });
          }}
        >
          <SelectTrigger
            className="h-7 w-16 text-xs mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_BINNING_OPTIONS.map((bin) => (
              <SelectItem
                key={`${bin.x}x${bin.y}`}
                value={`${bin.x}x${bin.y}`}
                className="text-xs"
              >
                {bin.x}x{bin.y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Dither */}
      <TableCell className="text-center">
        <Checkbox
          checked={exposure.dither}
          onCheckedChange={(checked) =>
            updateExposure(targetId, exposure.id, { dither: !!checked })
          }
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>

      {/* Dither Every */}
      <TableCell className="text-center p-1">
        <Input
          type="number"
          value={exposure.ditherEvery}
          onChange={(e) =>
            updateExposure(targetId, exposure.id, {
              ditherEvery: parseInt(e.target.value) || 1,
            })
          }
          onClick={(e) => e.stopPropagation()}
          className="h-7 w-14 text-center text-xs mx-auto"
          min={1}
          disabled={!exposure.dither}
        />
      </TableCell>

      {/* Gain */}
      <TableCell className="text-center p-1">
        <Input
          type="number"
          value={exposure.gain}
          onChange={(e) =>
            updateExposure(targetId, exposure.id, {
              gain: parseInt(e.target.value),
            })
          }
          onClick={(e) => e.stopPropagation()}
          className="h-7 w-16 text-center text-xs mx-auto"
          min={-1}
          placeholder="-1"
        />
      </TableCell>

      {/* Offset */}
      <TableCell className="text-center p-1">
        <Input
          type="number"
          value={exposure.offset}
          onChange={(e) =>
            updateExposure(targetId, exposure.id, {
              offset: parseInt(e.target.value),
            })
          }
          onClick={(e) => e.stopPropagation()}
          className="h-7 w-16 text-center text-xs mx-auto"
          min={-1}
          placeholder="-1"
        />
      </TableCell>
    </TableRow>
  );
});
