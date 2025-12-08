"use client";

import { memo, useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSimpleSequenceStore } from "@/lib/nina/simple-sequence-store";
import {
  SimpleExposure,
  ImageType,
} from "@/lib/nina/simple-sequence-types";
import { useI18n } from "@/lib/i18n";
import { ExposureRow, ExposureToolbar } from "./exposure";

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
      <ExposureToolbar
        onAddExposure={handleAddExposure}
        onDeleteSelected={handleDeleteSelected}
        onDuplicateSelected={handleDuplicateSelected}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onResetProgress={handleResetProgress}
        onResetAll={handleResetAll}
        selectedExposureId={selectedExposureId}
        selectedIndex={selectedIndex}
        exposureCount={exposures.length}
        t={t}
      />

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

// Exposure row moved to components/nina/exposure/ExposureRow.tsx
