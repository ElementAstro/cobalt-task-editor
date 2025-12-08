"use client";

import { useCallback, useMemo } from "react";
import { useSequenceEditorStore } from "@/lib/nina/store";
import { getItemDefinition, ERROR_BEHAVIORS } from "@/lib/nina/constants";
import type {
  EditorSequenceItem,
  EditorCondition,
  EditorTrigger,
} from "@/lib/nina/types";
import { Separator } from "@/components/ui/separator";
import { useI18n, getItemDescriptionKey, getCategoryKey } from "@/lib/i18n";

// Import sub-components
import {
  TextInput,
  NumberInput,
  SelectInput,
} from "./property/PropertyInputs";
import { ExposureProperties } from "./property/ExposureProperties";
import { CameraProperties } from "./property/CameraProperties";
import { WaitProperties } from "./property/WaitProperties";
import { AnnotationProperties } from "./property/AnnotationProperties";
import { DeepSkyObjectProperties } from "./property/DeepSkyObjectProperties";
import { ConditionProperties } from "./property/ConditionProperties";
import { TriggerProperties } from "./property/TriggerProperties";
import { PropertyEmptyState } from "./property/PropertyEmptyState";
import { PropertyCard } from "./property/PropertyCard";

// Re-export sub-components for convenience
export {
  TextInput,
  NumberInput,
  SelectInput,
  BooleanInput,
} from "./property/PropertyInputs";
export { CoordinateInput } from "./property/CoordinateInput";
export { ExposureProperties } from "./property/ExposureProperties";
export { CameraProperties } from "./property/CameraProperties";
export { WaitProperties } from "./property/WaitProperties";
export { AnnotationProperties } from "./property/AnnotationProperties";
export { DeepSkyObjectProperties } from "./property/DeepSkyObjectProperties";
export { ConditionProperties } from "./property/ConditionProperties";
export { TriggerProperties } from "./property/TriggerProperties";
export { PropertyEmptyState } from "./property/PropertyEmptyState";
export { PropertyCard } from "./property/PropertyCard";

// Main Property Panel
export function PropertyPanel() {
  const { t } = useI18n();
  const {
    selectedItemId,
    selectedConditionId,
    selectedTriggerId,
    getItemById,
    updateItem,
    sequence,
  } = useSequenceEditorStore();

  const selectedItem = selectedItemId ? getItemById(selectedItemId) : null;

  // Find condition and its container
  const findCondition = useMemo(() => {
    if (!selectedConditionId) return null;

    const searchInItems = (
      items: EditorSequenceItem[],
    ): { condition: EditorCondition; containerId: string } | null => {
      for (const item of items) {
        if (item.conditions) {
          const condition = item.conditions.find(
            (c) => c.id === selectedConditionId,
          );
          if (condition) return { condition, containerId: item.id };
        }
        if (item.items) {
          const found = searchInItems(item.items);
          if (found) return found;
        }
      }
      return null;
    };

    return searchInItems([
      ...sequence.startItems,
      ...sequence.targetItems,
      ...sequence.endItems,
    ]);
  }, [selectedConditionId, sequence]);

  // Find trigger and its container
  const findTrigger = useMemo(() => {
    if (!selectedTriggerId) return null;

    // Check global triggers first
    const globalTrigger = sequence.globalTriggers.find(
      (t) => t.id === selectedTriggerId,
    );
    if (globalTrigger) return { trigger: globalTrigger, containerId: "global" };

    const searchInItems = (
      items: EditorSequenceItem[],
    ): { trigger: EditorTrigger; containerId: string } | null => {
      for (const item of items) {
        if (item.triggers) {
          const trigger = item.triggers.find((t) => t.id === selectedTriggerId);
          if (trigger) return { trigger, containerId: item.id };
        }
        if (item.items) {
          const found = searchInItems(item.items);
          if (found) return found;
        }
      }
      return null;
    };

    return searchInItems([
      ...sequence.startItems,
      ...sequence.targetItems,
      ...sequence.endItems,
    ]);
  }, [selectedTriggerId, sequence]);

  const handleUpdateItem = useCallback(
    (updates: Partial<EditorSequenceItem>) => {
      if (selectedItemId) {
        updateItem(selectedItemId, updates);
      }
    },
    [selectedItemId, updateItem],
  );

  // Get translated description for item
  const getTranslatedDescription = (
    type: string,
    fallback?: string,
  ): string | undefined => {
    const key = getItemDescriptionKey(type);
    if (key && t.itemDescriptions[key]) {
      return t.itemDescriptions[key];
    }
    return fallback;
  };

  // Get translated category name
  const getTranslatedCategory = (category: string): string => {
    const key = getCategoryKey(category);
    if (key && t.categories[key]) {
      return t.categories[key];
    }
    return category;
  };

  // Render item properties
  const renderItemProperties = () => {
    if (!selectedItem) return null;

    const definition = getItemDefinition(selectedItem.type);
    const translatedDescription = getTranslatedDescription(
      selectedItem.type,
      definition?.description,
    );

    return (
      <div className="space-y-3 sm:space-y-4">
        {/* Common Properties */}
        <div className="space-y-2 sm:space-y-3">
          <TextInput
            label={t.properties.itemName}
            value={selectedItem.name}
            onChange={(v) => handleUpdateItem({ name: v })}
          />

          {translatedDescription && (
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              {translatedDescription}
            </p>
          )}
        </div>

        <Separator />

        {/* Type-specific Properties */}
        {selectedItem.type.includes("Exposure") && (
          <ExposureProperties item={selectedItem} onUpdate={handleUpdateItem} />
        )}

        {selectedItem.type.includes("Camera") && (
          <CameraProperties item={selectedItem} onUpdate={handleUpdateItem} />
        )}

        {selectedItem.type.includes("Wait") && (
          <WaitProperties item={selectedItem} onUpdate={handleUpdateItem} />
        )}

        {selectedItem.type.includes("Annotation") && (
          <AnnotationProperties
            item={selectedItem}
            onUpdate={handleUpdateItem}
          />
        )}

        {selectedItem.type.includes("DeepSkyObject") && (
          <DeepSkyObjectProperties
            item={selectedItem}
            onUpdate={handleUpdateItem}
          />
        )}

        <Separator />

        {/* Error Behavior */}
        <div className="space-y-2.5 sm:space-y-3">
          <SelectInput
            label={t.properties.onError}
            value={
              (selectedItem.data.ErrorBehavior as string) || "ContinueOnError"
            }
            onChange={(v) =>
              handleUpdateItem({
                data: { ...selectedItem.data, ErrorBehavior: v },
              })
            }
            options={ERROR_BEHAVIORS}
          />

          <NumberInput
            label={t.properties.retryAttempts}
            value={(selectedItem.data.Attempts as number) || 1}
            onChange={(v) =>
              handleUpdateItem({ data: { ...selectedItem.data, Attempts: v } })
            }
            min={1}
            max={10}
          />
        </div>
      </div>
    );
  };

  // No selection
  if (!selectedItem && !findCondition && !findTrigger) {
    return <PropertyEmptyState message={t.properties.selectItem} />;
  }

  return (
    <div className="flex-1 overflow-auto p-2 sm:p-3 space-y-2 sm:space-y-3 scrollbar-thin">
      {/* Condition Properties */}
      {findCondition && (
        <PropertyCard
          title={t.properties.condition}
          subtitle={findCondition.condition.name}
          variant="condition"
        >
          <ConditionProperties
            condition={findCondition.condition}
            containerId={findCondition.containerId}
          />
        </PropertyCard>
      )}

      {/* Trigger Properties */}
      {findTrigger && !findCondition && (
        <PropertyCard
          title={t.properties.trigger}
          subtitle={findTrigger.trigger.name}
          variant="trigger"
        >
          <TriggerProperties
            trigger={findTrigger.trigger}
            containerId={findTrigger.containerId}
          />
        </PropertyCard>
      )}

      {/* Item Properties */}
      {selectedItem && !findCondition && !findTrigger && (
        <PropertyCard
          title={
            getTranslatedCategory(
              getItemDefinition(selectedItem.type)?.category || "",
            ) || t.properties.item
          }
          subtitle={selectedItem.type.split(".").slice(-1)[0].split(",")[0]}
          variant="item"
        >
          {renderItemProperties()}
        </PropertyCard>
      )}
    </div>
  );
}
