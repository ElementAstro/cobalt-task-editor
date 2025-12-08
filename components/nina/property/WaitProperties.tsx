"use client";

import { useCallback } from "react";
import { COMPARATORS } from "@/lib/nina/constants";
import type { EditorSequenceItem } from "@/lib/nina/types";
import { useI18n } from "@/lib/i18n";
import { NumberInput, SelectInput } from "./PropertyInputs";

export interface WaitPropertiesProps {
  item: EditorSequenceItem;
  onUpdate: (updates: Partial<EditorSequenceItem>) => void;
}

export function WaitProperties({ item, onUpdate }: WaitPropertiesProps) {
  const { t } = useI18n();
  const updateData = useCallback(
    (key: string, value: unknown) => {
      onUpdate({ data: { ...item.data, [key]: value } });
    },
    [item.data, onUpdate],
  );

  if (item.type.includes("WaitForTimeSpan")) {
    return (
      <NumberInput
        label={t.properties.waitDuration}
        value={(item.data.Time as number) || 0}
        onChange={(v) => updateData("Time", v)}
        min={0}
        unit={t.common.seconds}
      />
    );
  }

  if (item.type.includes("WaitForTime")) {
    return (
      <div className="grid grid-cols-3 gap-2">
        <NumberInput
          label={t.properties.hours}
          value={(item.data.Hours as number) || 0}
          onChange={(v) => updateData("Hours", v)}
          min={0}
          max={23}
        />
        <NumberInput
          label={t.properties.minutes}
          value={(item.data.Minutes as number) || 0}
          onChange={(v) => updateData("Minutes", v)}
          min={0}
          max={59}
        />
        <NumberInput
          label={t.properties.seconds}
          value={(item.data.Seconds as number) || 0}
          onChange={(v) => updateData("Seconds", v)}
          min={0}
          max={59}
        />
      </div>
    );
  }

  if (item.type.includes("Altitude")) {
    return (
      <div className="space-y-3">
        <NumberInput
          label={t.properties.targetAltitude}
          value={(item.data.TargetAltitude as number) || 0}
          onChange={(v) => updateData("TargetAltitude", v)}
          min={-90}
          max={90}
          unit={t.common.degrees}
        />
        <SelectInput
          label={t.properties.comparator}
          value={(item.data.Comparator as string) || ">="}
          onChange={(v) => updateData("Comparator", v)}
          options={COMPARATORS}
        />
      </div>
    );
  }

  return null;
}
