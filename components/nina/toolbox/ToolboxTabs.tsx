"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Translations } from "@/lib/i18n";

export type ToolboxTabType = "items" | "conditions" | "triggers";

export interface ToolboxTabsProps {
  activeTab: ToolboxTabType;
  onTabChange: (tab: ToolboxTabType) => void;
  itemsCount: number;
  conditionsCount: number;
  triggersCount: number;
  t: Translations;
  children: React.ReactNode;
}

export function ToolboxTabs({
  activeTab,
  onTabChange,
  itemsCount,
  conditionsCount,
  triggersCount,
  t,
  children,
}: ToolboxTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as ToolboxTabType)}
      className="flex-1 flex flex-col min-h-0"
    >
      <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0 shrink-0">
        <TabsTrigger
          value="items"
          className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-400 data-[state=active]:bg-transparent data-[state=active]:text-blue-400 py-2 sm:py-2.5 text-xs sm:text-sm gap-1 sm:gap-1.5 min-h-[40px] touch-manipulation"
        >
          <span className="hidden xs:inline">{t.toolbox.items}</span>
          <span className="xs:hidden">Items</span>
          <Badge
            variant="secondary"
            className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px]"
          >
            {itemsCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="conditions"
          className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent data-[state=active]:text-yellow-400 py-2 sm:py-2.5 text-xs sm:text-sm gap-1 sm:gap-1.5 min-h-[40px] touch-manipulation"
        >
          <span className="hidden xs:inline">{t.toolbox.conditions}</span>
          <span className="xs:hidden">Cond</span>
          <Badge
            variant="secondary"
            className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px]"
          >
            {conditionsCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="triggers"
          className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-400 data-[state=active]:bg-transparent data-[state=active]:text-purple-400 py-2 sm:py-2.5 text-xs sm:text-sm gap-1 sm:gap-1.5 min-h-[40px] touch-manipulation"
        >
          <span className="hidden xs:inline">{t.toolbox.triggers}</span>
          <span className="xs:hidden">Trig</span>
          <Badge
            variant="secondary"
            className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px]"
          >
            {triggersCount}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 min-h-0 relative">{children}</div>
    </Tabs>
  );
}

// Re-export TabsContent for use in parent
export { TabsContent };
