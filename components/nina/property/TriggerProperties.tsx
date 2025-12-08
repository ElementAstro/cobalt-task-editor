"use client";

import { useCallback } from "react";
import type { EditorTrigger } from "@/lib/nina/types";
import { useSequenceEditorStore } from "@/lib/nina/store";
import { useI18n } from "@/lib/i18n";
import { NumberInput } from "./PropertyInputs";

export interface TriggerPropertiesProps {
  trigger: EditorTrigger;
  containerId: string;
}

export function TriggerProperties({
  trigger,
  containerId,
}: TriggerPropertiesProps) {
  const { t } = useI18n();
  const { updateTrigger } = useSequenceEditorStore();

  const updateData = useCallback(
    (key: string, value: unknown) => {
      updateTrigger(containerId, trigger.id, {
        data: { ...trigger.data, [key]: value },
      });
    },
    [containerId, trigger.id, trigger.data, updateTrigger],
  );

  if (
    trigger.type.includes("DitherAfterExposures") ||
    trigger.type.includes("AutofocusAfterExposures")
  ) {
    return (
      <NumberInput
        label={t.properties.afterExposures}
        value={(trigger.data.AfterExposures as number) || 1}
        onChange={(v) => updateData("AfterExposures", v)}
        min={1}
      />
    );
  }

  if (trigger.type.includes("HFRIncrease")) {
    return (
      <div className="space-y-3">
        <NumberInput
          label={`${t.properties.amount} %`}
          value={(trigger.data.Amount as number) || 10}
          onChange={(v) => updateData("Amount", v)}
          min={1}
          unit="%"
        />
        <NumberInput
          label={t.properties.sampleSize}
          value={(trigger.data.SampleSize as number) || 10}
          onChange={(v) => updateData("SampleSize", v)}
          min={1}
        />
      </div>
    );
  }

  if (trigger.type.includes("TemperatureChange")) {
    return (
      <NumberInput
        label={t.properties.temperature}
        value={(trigger.data.Amount as number) || 2}
        onChange={(v) => updateData("Amount", v)}
        min={0.1}
        step={0.1}
        unit="°C"
      />
    );
  }

  if (trigger.type.includes("AfterTime")) {
    return (
      <NumberInput
        label={t.properties.duration}
        value={(trigger.data.Amount as number) || 60}
        onChange={(v) => updateData("Amount", v)}
        min={1}
        unit={t.common.minutes}
      />
    );
  }

  if (trigger.type.includes("CenterAfterDrift")) {
    return (
      <NumberInput
        label={t.properties.distanceArcMinutes}
        value={(trigger.data.DistanceArcMinutes as number) || 5}
        onChange={(v) => updateData("DistanceArcMinutes", v)}
        min={0.1}
        step={0.1}
        unit={t.common.arcminutes}
      />
    );
  }

  return (
    <div className="text-xs text-zinc-500">{t.properties.noSelection}</div>
  );
}
