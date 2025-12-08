"use client";

import { useCallback, useMemo } from "react";
import type { EditorSequenceItem, EditorTarget } from "@/lib/nina/types";
import { useI18n } from "@/lib/i18n";
import { TextInput, NumberInput } from "./PropertyInputs";
import { CoordinateInput } from "./CoordinateInput";

export interface DeepSkyObjectPropertiesProps {
  item: EditorSequenceItem;
  onUpdate: (updates: Partial<EditorSequenceItem>) => void;
}

export function DeepSkyObjectProperties({
  item,
  onUpdate,
}: DeepSkyObjectPropertiesProps) {
  const { t } = useI18n();
  const rawTarget = item.data.Target as EditorTarget | undefined;

  // Ensure target has all required fields - memoized to avoid recreating on every render
  const target: EditorTarget = useMemo(
    () => ({
      name: rawTarget?.name || "",
      ra: rawTarget?.ra || { hours: 0, minutes: 0, seconds: 0 },
      dec: rawTarget?.dec || {
        degrees: 0,
        minutes: 0,
        seconds: 0,
        negative: false,
      },
      rotation: rawTarget?.rotation || 0,
    }),
    [rawTarget],
  );

  const updateTarget = useCallback(
    (updates: Partial<EditorTarget>) => {
      onUpdate({
        data: {
          ...item.data,
          Target: { ...target, ...updates },
        },
      });
    },
    [item.data, target, onUpdate],
  );

  return (
    <div className="space-y-3">
      <TextInput
        label={t.properties.targetName}
        value={target.name}
        onChange={(v) => updateTarget({ name: v })}
        placeholder="e.g., M31, NGC 7000"
      />
      <CoordinateInput
        label={t.properties.coordinates}
        ra={target.ra}
        dec={target.dec}
        onChange={(ra, dec) => updateTarget({ ra, dec })}
        translations={{
          rightAscension: t.properties.rightAscension,
          declination: t.properties.declination,
          raHours: t.properties.raHours,
          raMinutes: t.properties.raMinutes,
          raSeconds: t.properties.raSeconds,
          decDegrees: t.properties.decDegrees,
          decMinutes: t.properties.decMinutes,
          decSeconds: t.properties.decSeconds,
        }}
      />
      <NumberInput
        label={t.properties.positionAngle}
        value={target.rotation}
        onChange={(v) => updateTarget({ rotation: v })}
        min={0}
        max={360}
        step={0.1}
        unit={t.common.degrees}
      />
    </div>
  );
}
