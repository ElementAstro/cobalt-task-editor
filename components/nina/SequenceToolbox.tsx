"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  SEQUENCE_ITEMS,
  CONDITION_ITEMS,
  TRIGGER_ITEMS,
  type ItemDefinition,
} from "@/lib/nina/constants";
import { useSequenceEditorStore } from "@/lib/nina/store";
import {
  createSequenceItem,
  createCondition,
  createTrigger,
} from "@/lib/nina/utils";
import {
  useI18n,
  getItemNameKey,
  getConditionNameKey,
  getTriggerNameKey,
  getCategoryKey,
  getItemDescriptionKey,
  getConditionDescriptionKey,
  getTriggerDescriptionKey,
} from "@/lib/i18n";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";

// Import sub-components from toolbox folder
import { ToolboxCategory } from "./toolbox/ToolboxCategory";
import { ToolboxItem } from "./toolbox/ToolboxItem";
import { ToolboxSearch } from "./toolbox/ToolboxSearch";
import { ToolboxTabs } from "./toolbox/ToolboxTabs";
import { ToolboxFeedback } from "./toolbox/ToolboxFeedback";
import { ToolboxEmptyState } from "./toolbox/ToolboxEmptyState";
import { ToolboxInfoBanner } from "./toolbox/ToolboxInfoBanner";
import { groupByCategory } from "./toolbox/utils";

// Re-export sub-components for convenience
export { iconMap, getIcon } from "./toolbox/ToolboxIconMap";
export { ToolboxCategory } from "./toolbox/ToolboxCategory";
export { ToolboxItem } from "./toolbox/ToolboxItem";
export { ToolboxSearch } from "./toolbox/ToolboxSearch";
export { ToolboxTabs } from "./toolbox/ToolboxTabs";
export { ToolboxFeedback } from "./toolbox/ToolboxFeedback";
export { ToolboxEmptyState } from "./toolbox/ToolboxEmptyState";
export { ToolboxInfoBanner } from "./toolbox/ToolboxInfoBanner";
export { groupByCategory } from "./toolbox/utils";

interface SequenceToolboxProps {
  onClose?: () => void;
  isMobile?: boolean;
}

// Custom hook for debounced value
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function SequenceToolbox({
  onClose,
  isMobile = false,
}: SequenceToolboxProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  // Debounce search query to reduce filtering calculations
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 150);
  const [activeTab, setActiveTab] = useState<
    "items" | "conditions" | "triggers"
  >("items");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const {
    addItem,
    addCondition,
    addTrigger,
    activeArea,
    selectedItemId,
    getItemById,
  } = useSequenceEditorStore();

  // Check if selected item is a container
  const selectedItem = selectedItemId ? getItemById(selectedItemId) : null;
  const isSelectedContainer = selectedItem
    ? selectedItem.type.includes("Container") ||
      selectedItem.type.includes("DeepSkyObject")
    : false;

  // Show feedback message briefly
  const showFeedback = useCallback((message: string) => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(null), 1500);
  }, []);

  const getTranslatedItemName = useCallback(
    (item: ItemDefinition): string => {
      const key = getItemNameKey(item.type);
      if (key && t.ninaItems[key]) {
        return t.ninaItems[key];
      }
      return item.name;
    },
    [t.ninaItems],
  );

  const getTranslatedConditionName = useCallback(
    (item: ItemDefinition): string => {
      const key = getConditionNameKey(item.type);
      if (key && t.ninaConditions[key]) {
        return t.ninaConditions[key];
      }
      return item.name;
    },
    [t.ninaConditions],
  );

  const getTranslatedTriggerName = useCallback(
    (item: ItemDefinition): string => {
      const key = getTriggerNameKey(item.type);
      if (key && t.ninaTriggers[key]) {
        return t.ninaTriggers[key];
      }
      return item.name;
    },
    [t.ninaTriggers],
  );

  const getTranslatedCategoryName = useCallback(
    (category: string): string => {
      const key = getCategoryKey(category);
      if (key && t.categories[key]) {
        return t.categories[key];
      }
      return category;
    },
    [t.categories],
  );

  const getTranslatedItemDescription = useCallback(
    (item: ItemDefinition): string => {
      const key = getItemDescriptionKey(item.type);
      if (key && t.itemDescriptions[key]) {
        return t.itemDescriptions[key];
      }
      return item.description;
    },
    [t.itemDescriptions],
  );

  const getTranslatedConditionDescription = useCallback(
    (item: ItemDefinition): string => {
      const key = getConditionDescriptionKey(item.type);
      if (key && t.conditionDescriptions[key]) {
        return t.conditionDescriptions[key];
      }
      return item.description;
    },
    [t.conditionDescriptions],
  );

  const getTranslatedTriggerDescription = useCallback(
    (item: ItemDefinition): string => {
      const key = getTriggerDescriptionKey(item.type);
      if (key && t.triggerDescriptions[key]) {
        return t.triggerDescriptions[key];
      }
      return item.description;
    },
    [t.triggerDescriptions],
  );

  // Filter items based on search, using translated text so users can query localized names
  // Uses debounced search query to reduce filtering calculations
  const filteredItems = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (!query) return SEQUENCE_ITEMS;
    return SEQUENCE_ITEMS.filter((item) => {
      const localizedName = getTranslatedItemName(item).toLowerCase();
      const localizedCategory = getTranslatedCategoryName(
        item.category,
      ).toLowerCase();
      const localizedDescription =
        getTranslatedItemDescription(item).toLowerCase();
      return (
        localizedName.includes(query) ||
        localizedCategory.includes(query) ||
        localizedDescription.includes(query)
      );
    });
  }, [
    debouncedSearchQuery,
    getTranslatedItemName,
    getTranslatedCategoryName,
    getTranslatedItemDescription,
  ]);

  const filteredConditions = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (!query) return CONDITION_ITEMS;
    return CONDITION_ITEMS.filter((item) => {
      const localizedName = getTranslatedConditionName(item).toLowerCase();
      const localizedDescription =
        getTranslatedConditionDescription(item).toLowerCase();
      return (
        localizedName.includes(query) || localizedDescription.includes(query)
      );
    });
  }, [
    debouncedSearchQuery,
    getTranslatedConditionName,
    getTranslatedConditionDescription,
  ]);

  const filteredTriggers = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (!query) return TRIGGER_ITEMS;
    return TRIGGER_ITEMS.filter((item) => {
      const localizedName = getTranslatedTriggerName(item).toLowerCase();
      const localizedDescription =
        getTranslatedTriggerDescription(item).toLowerCase();
      return (
        localizedName.includes(query) || localizedDescription.includes(query)
      );
    });
  }, [debouncedSearchQuery, getTranslatedTriggerName, getTranslatedTriggerDescription]);

  const groupedItems = useMemo(
    () => groupByCategory(filteredItems),
    [filteredItems],
  );

  const handleDragStart = () => {
    // Drag start handling - the actual data is set in the onDragStart handler
  };

  const handleAddItem = useCallback(
    (item: ItemDefinition, type: "item" | "condition" | "trigger") => {
      if (type === "item") {
        const newItem = createSequenceItem(item.type);
        addItem(activeArea, newItem, selectedItemId);
        showFeedback(t.toolbox.itemAdded);
      } else if (type === "condition") {
        if (selectedItemId && isSelectedContainer) {
          const newCondition = createCondition(item.type);
          addCondition(selectedItemId, newCondition);
          showFeedback(t.toolbox.conditionAdded);
        } else {
          showFeedback(t.toolbox.selectContainerFirst);
        }
      } else if (type === "trigger") {
        if (selectedItemId && isSelectedContainer) {
          const newTrigger = createTrigger(item.type);
          addTrigger(selectedItemId, newTrigger);
          showFeedback(t.toolbox.triggerAdded);
        } else {
          showFeedback(t.toolbox.selectContainerFirst);
        }
      }
    },
    [
      activeArea,
      selectedItemId,
      isSelectedContainer,
      addItem,
      addCondition,
      addTrigger,
      showFeedback,
      t.toolbox,
    ],
  );

  // Translation helpers (used for rendering and searching)

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Mobile Header with Done button */}
      {isMobile && onClose && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
          <span className="text-sm font-medium">
            {activeTab === "items"
              ? t.toolbox.items
              : activeTab === "conditions"
                ? t.toolbox.conditions
                : t.toolbox.triggers}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-primary hover:text-primary/80 h-8 px-3"
          >
            {t.toolbox.done}
          </Button>
        </div>
      )}

      {/* Feedback Toast */}
      <ToolboxFeedback message={feedbackMessage} />

      {/* Search */}
      <ToolboxSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t.toolbox.searchPlaceholder}
      />

      {/* Tabs */}
      <ToolboxTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        itemsCount={filteredItems.length}
        conditionsCount={filteredConditions.length}
        triggersCount={filteredTriggers.length}
        t={t}
      >
        <TabsContent
          value="items"
          className="absolute inset-0 m-0 p-0 data-[state=inactive]:hidden"
        >
          <ScrollArea className="h-full pr-0.5 sm:pr-1 scrollbar-thin">
            <div className="p-1.5 sm:p-2">
              {Object.entries(groupedItems).map(([category, items]) => (
                <ToolboxCategory
                  key={category}
                  category={category}
                  items={items}
                  onDragStart={handleDragStart}
                  onDoubleClick={handleAddItem}
                  type="item"
                  getItemName={getTranslatedItemName}
                  getItemDescription={getTranslatedItemDescription}
                  getCategoryName={getTranslatedCategoryName}
                  isMobile={isMobile}
                />
              ))}
              {filteredItems.length === 0 && (
                <ToolboxEmptyState message={t.toolbox.noResults} />
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="conditions"
          className="absolute inset-0 m-0 p-0 data-[state=inactive]:hidden"
        >
          <ScrollArea className="h-full pr-0.5 sm:pr-1 scrollbar-thin">
            <div className="p-1.5 sm:p-2">
              {/* Info banner for conditions */}
              {!selectedItemId && (
                <ToolboxInfoBanner
                  message={t.toolbox.selectContainerFirst}
                  variant="yellow"
                />
              )}
              <div className="space-y-0.5">
                {filteredConditions.map((item) => (
                  <ToolboxItem
                    key={item.type}
                    item={item}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({ item, type: "condition" }),
                      );
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => handleAddItem(item, "condition")}
                    getName={getTranslatedConditionName}
                    getDescription={getTranslatedConditionDescription}
                    isMobile={isMobile}
                    colorClass="text-yellow-400"
                  />
                ))}
                {filteredConditions.length === 0 && (
                  <ToolboxEmptyState message={t.toolbox.noResults} />
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="triggers"
          className="absolute inset-0 m-0 p-0 data-[state=inactive]:hidden"
        >
          <ScrollArea className="h-full pr-0.5 sm:pr-1 scrollbar-thin">
            <div className="p-1.5 sm:p-2">
              {/* Info banner for triggers */}
              {!selectedItemId && (
                <ToolboxInfoBanner
                  message={t.toolbox.selectContainerFirst}
                  variant="purple"
                />
              )}
              <div className="space-y-0.5">
                {filteredTriggers.map((item) => (
                  <ToolboxItem
                    key={item.type}
                    item={item}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({ item, type: "trigger" }),
                      );
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => handleAddItem(item, "trigger")}
                    getName={getTranslatedTriggerName}
                    getDescription={getTranslatedTriggerDescription}
                    isMobile={isMobile}
                    colorClass="text-purple-400"
                  />
                ))}
                {filteredTriggers.length === 0 && (
                  <ToolboxEmptyState message={t.toolbox.noResults} />
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </ToolboxTabs>

      {/* Help Text - Different for mobile vs desktop */}
      <div className="p-1.5 sm:p-2 border-t border-border text-[10px] sm:text-xs text-muted-foreground text-center shrink-0">
        {isMobile ? (
          <span>{t.toolbox.tapToAdd}</span>
        ) : (
          <>
            <span className="hidden sm:inline">{t.toolbox.dragToAdd}</span>
            <span className="sm:hidden">{t.toolbox.tapToAdd}</span>
          </>
        )}
      </div>
    </div>
  );
}
