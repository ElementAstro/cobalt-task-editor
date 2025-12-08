import type { ItemDefinition } from "@/lib/nina/constants";

// Group items by category
export function groupByCategory(
  items: ItemDefinition[],
): Record<string, ItemDefinition[]> {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ItemDefinition[]>,
  );
}
