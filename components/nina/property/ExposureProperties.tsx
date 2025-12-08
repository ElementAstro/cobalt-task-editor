"use client";

import { useCallback } from "react";
import { IMAGE_TYPES } from "@/lib/nina/constants";
import type { EditorSequenceItem } from "@/lib/nina/types";
import { useI18n } from "@/lib/i18n";
import { NumberInput, SelectInput } from "./PropertyInputs";

export interface ItemPropertiesProps {
  item: EditorSequenceItem;
  onUpdate: (updates: Partial<EditorSequenceItem>) => void;
}

export function ExposureProperties({ item, onUpdate }: ItemPropertiesProps) {
  const { t } = useI18n();
  const updateData = useCallback(
    (key: string, value: unknown) => {
      onUpdate({ data: { ...item.data, [key]: value } });
    },
    [item.data, onUpdate],
  );

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <NumberInput
        label={t.properties.exposureTime}
        value={(item.data.ExposureTime as number) || 0}
        onChange={(v) => updateData("ExposureTime", v)}
        min={0}
        step={0.1}
        unit={t.common.seconds}
      />
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <NumberInput
          label={t.properties.gain}
          value={(item.data.Gain as number) || -1}
          onChange={(v) => updateData("Gain", v)}
          min={-1}
        />
        <NumberInput
          label={t.properties.offset}
          value={(item.data.Offset as number) || -1}
          onChange={(v) => updateData("Offset", v)}
          min={-1}
        />
      </div>
      <SelectInput
        label={t.properties.imageType}
        value={(item.data.ImageType as string) || "LIGHT"}
        onChange={(v) => updateData("ImageType", v)}
        options={IMAGE_TYPES}
      />
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <NumberInput
          label={t.properties.binningX}
          value={(item.data.Binning as { X: number; Y: number })?.X || 1}
          onChange={(v) =>
            updateData("Binning", {
              ...((item.data.Binning as object) || {}),
              X: v,
            })
          }
          min={1}
          max={4}
        />
        <NumberInput
          label={t.properties.binningY}
          value={(item.data.Binning as { X: number; Y: number })?.Y || 1}
          onChange={(v) =>
            updateData("Binning", {
              ...((item.data.Binning as object) || {}),
              Y: v,
            })
          }
          min={1}
          max={4}
        />
      </div>
    </div>
  );
}
