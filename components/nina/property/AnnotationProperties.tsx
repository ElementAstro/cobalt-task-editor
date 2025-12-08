"use client";

import { useCallback } from "react";
import type { EditorSequenceItem } from "@/lib/nina/types";
import { useI18n } from "@/lib/i18n";
import { TextInput } from "./PropertyInputs";

export interface AnnotationPropertiesProps {
  item: EditorSequenceItem;
  onUpdate: (updates: Partial<EditorSequenceItem>) => void;
}

export function AnnotationProperties({
  item,
  onUpdate,
}: AnnotationPropertiesProps) {
  const { t } = useI18n();
  const updateData = useCallback(
    (key: string, value: unknown) => {
      onUpdate({ data: { ...item.data, [key]: value } });
    },
    [item.data, onUpdate],
  );

  return (
    <TextInput
      label={t.properties.text}
      value={(item.data.Text as string) || ""}
      onChange={(v) => updateData("Text", v)}
      placeholder={t.properties.annotation}
      multiline
    />
  );
}
