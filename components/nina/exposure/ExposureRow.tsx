"use client";

import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  DEFAULT_BINNING_OPTIONS,
  DEFAULT_FILTERS,
  ImageType,
  SequenceEntityStatus,
  SimpleExposure,
} from "@/lib/nina/simple-sequence-types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface ExposureRowProps {
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

export const ExposureRow = memo(function ExposureRow({
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
      <TableCell className="text-center text-xs text-muted-foreground">
        {index + 1}
      </TableCell>

      <TableCell className="text-center">
        <Checkbox
          checked={exposure.enabled}
          onCheckedChange={(checked) =>
            updateExposure(targetId, exposure.id, { enabled: !!checked })
          }
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>

      <TableCell className="text-center">
        <Badge
          variant="outline"
          className={cn("tabular-nums", getStatusColor(exposure.status))}
        >
          {exposure.progressCount} / {exposure.totalCount}
        </Badge>
      </TableCell>

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

      <TableCell className="text-center">
        <Checkbox
          checked={exposure.dither}
          onCheckedChange={(checked) =>
            updateExposure(targetId, exposure.id, { dither: !!checked })
          }
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>

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
