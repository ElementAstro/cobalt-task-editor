"use client";

import { useCallback } from "react";
import { COMPARATORS } from "@/lib/nina/constants";
import type { EditorCondition } from "@/lib/nina/types";
import { useSequenceEditorStore } from "@/lib/nina/store";
import { useI18n } from "@/lib/i18n";
import { NumberInput, SelectInput } from "./PropertyInputs";

export interface ConditionPropertiesProps {
  condition: EditorCondition;
  containerId: string;
}

export function ConditionProperties({
  condition,
  containerId,
}: ConditionPropertiesProps) {
  const { t } = useI18n();
  const { updateCondition } = useSequenceEditorStore();

  const updateData = useCallback(
    (key: string, value: unknown) => {
      updateCondition(containerId, condition.id, {
        data: { ...condition.data, [key]: value },
      });
    },
    [containerId, condition.id, condition.data, updateCondition],
  );

  if (condition.type.includes("LoopCondition")) {
    return (
      <div className="space-y-3">
        <NumberInput
          label={t.properties.iterations}
          value={(condition.data.Iterations as number) || 1}
          onChange={(v) => updateData("Iterations", v)}
          min={1}
        />
        <div className="text-xs text-muted-foreground">
          {t.properties.completed}:{" "}
          {String(condition.data.CompletedIterations || 0)}
        </div>
      </div>
    );
  }

  if (condition.type.includes("TimeCondition")) {
    return (
      <div className="grid grid-cols-3 gap-2">
        <NumberInput
          label={t.properties.hours}
          value={(condition.data.Hours as number) || 0}
          onChange={(v) => updateData("Hours", v)}
          min={0}
          max={23}
        />
        <NumberInput
          label={t.properties.minutes}
          value={(condition.data.Minutes as number) || 0}
          onChange={(v) => updateData("Minutes", v)}
          min={0}
          max={59}
        />
        <NumberInput
          label={t.properties.seconds}
          value={(condition.data.Seconds as number) || 0}
          onChange={(v) => updateData("Seconds", v)}
          min={0}
          max={59}
        />
      </div>
    );
  }

  if (condition.type.includes("Altitude")) {
    return (
      <div className="space-y-3">
        <NumberInput
          label={t.properties.targetAltitude}
          value={(condition.data.TargetAltitude as number) || 0}
          onChange={(v) => updateData("TargetAltitude", v)}
          min={-90}
          max={90}
          unit={t.common.degrees}
        />
        <SelectInput
          label={t.properties.comparator}
          value={(condition.data.Comparator as string) || ">="}
          onChange={(v) => updateData("Comparator", v)}
          options={COMPARATORS}
        />
      </div>
    );
  }

  return (
    <div className="text-xs text-muted-foreground">
      {t.properties.noSelection}
    </div>
  );
}
