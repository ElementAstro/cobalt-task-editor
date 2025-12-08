"use client";

import { useCallback } from "react";
import type { EditorSequenceItem } from "@/lib/nina/types";
import { useI18n } from "@/lib/i18n";
import { NumberInput } from "./PropertyInputs";

export interface CameraPropertiesProps {
  item: EditorSequenceItem;
  onUpdate: (updates: Partial<EditorSequenceItem>) => void;
}

export function CameraProperties({ item, onUpdate }: CameraPropertiesProps) {
  const { t } = useI18n();
  const updateData = useCallback(
    (key: string, value: unknown) => {
      onUpdate({ data: { ...item.data, [key]: value } });
    },
    [item.data, onUpdate],
  );

  if (item.type.includes("CoolCamera") || item.type.includes("WarmCamera")) {
    return (
      <div className="space-y-3">
        {item.type.includes("CoolCamera") && (
          <NumberInput
            label={t.properties.targetTemperature}
            value={(item.data.Temperature as number) || -10}
            onChange={(v) => updateData("Temperature", v)}
            min={-40}
            max={30}
            unit="°C"
          />
        )}
        <NumberInput
          label={t.properties.duration}
          value={(item.data.Duration as number) || 0}
          onChange={(v) => updateData("Duration", v)}
          min={0}
          unit={t.common.minutes}
        />
      </div>
    );
  }

  return null;
}
