"use client";

import { memo, useMemo } from "react";
import {
  Play,
  Target,
  Square,
  Box,
  Camera,
  Telescope,
  Focus,
  Sun,
  Moon,
  Timer,
  Zap,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { SequenceTemplate } from "@/lib/nina/multi-sequence-store";
import type { EditorSequenceItem } from "@/lib/nina/types";
import { useI18n } from "@/lib/i18n";

interface TemplatePreviewProps {
  template: SequenceTemplate;
  displayName?: string;
  displayDescription?: string;
}

// Get icon for item type
function getItemIcon(type: string) {
  if (type.includes("Exposure") || type.includes("Camera")) {
    return <Camera className="w-3 h-3 text-green-400" />;
  }
  if (type.includes("Slew") || type.includes("Telescope")) {
    return <Telescope className="w-3 h-3 text-cyan-400" />;
  }
  if (type.includes("Focus") || type.includes("Autofocus")) {
    return <Focus className="w-3 h-3 text-indigo-400" />;
  }
  if (type.includes("Cool") || type.includes("Warm")) {
    return <Sun className="w-3 h-3 text-orange-400" />;
  }
  if (type.includes("Wait") || type.includes("Delay")) {
    return <Timer className="w-3 h-3 text-yellow-400" />;
  }
  if (type.includes("Trigger") || type.includes("Meridian")) {
    return <Zap className="w-3 h-3 text-purple-400" />;
  }
  if (type.includes("Park") || type.includes("Unpark")) {
    return <Moon className="w-3 h-3 text-blue-400" />;
  }
  if (type.includes("Safety") || type.includes("Dome")) {
    return <Shield className="w-3 h-3 text-red-400" />;
  }
  return <Box className="w-3 h-3 text-muted-foreground" />;
}

// Get item name from type
function getItemName(type: string): string {
  const parts = type.split(".");
  return parts[parts.length - 1] || type;
}

interface ItemListProps {
  items: EditorSequenceItem[];
  title: string;
  icon: React.ReactNode;
  emptyText: string;
}

function ItemList({ items, title, icon, emptyText }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {icon}
          <span>{title}</span>
          <Badge variant="outline" className="h-4 text-[9px] px-1 ml-auto">
            0
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground/60 italic pl-5">
          {emptyText}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        <span>{title}</span>
        <Badge variant="outline" className="h-4 text-[9px] px-1 ml-auto">
          {items.length}
        </Badge>
      </div>
      <div className="space-y-1 pl-5">
        {items.slice(0, 5).map((item, index) => (
          <div
            key={item.id || index}
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
          >
            {getItemIcon(item.type)}
            <span className="truncate">{item.name || getItemName(item.type)}</span>
          </div>
        ))}
        {items.length > 5 && (
          <div className="text-[10px] text-muted-foreground/60 italic">
            +{items.length - 5} more items
          </div>
        )}
      </div>
    </div>
  );
}

function TemplatePreviewComponent({
  template,
  displayName,
  displayDescription,
}: TemplatePreviewProps) {
  const { t } = useI18n();

  const stats = useMemo(() => {
    const { startItems, targetItems, endItems, globalTriggers } =
      template.sequence;
    return {
      startCount: startItems.length,
      targetCount: targetItems.length,
      endCount: endItems.length,
      triggerCount: globalTriggers?.length || 0,
      totalCount:
        startItems.length +
        targetItems.length +
        endItems.length +
        (globalTriggers?.length || 0),
    };
  }, [template.sequence]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h4 className="text-sm font-medium">
          {displayName || template.name}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {displayDescription || template.description}
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary" className="h-5 text-[10px] px-1.5">
          {stats.totalCount} {t.toolbox.items}
        </Badge>
        {stats.triggerCount > 0 && (
          <Badge variant="outline" className="h-5 text-[10px] px-1.5">
            <Zap className="w-2.5 h-2.5 mr-0.5" />
            {stats.triggerCount} triggers
          </Badge>
        )}
        <Badge
          variant={template.mode === "advanced" ? "default" : "secondary"}
          className="h-5 text-[10px] px-1.5"
        >
          {template.mode === "advanced" ? "Advanced" : "Normal"}
        </Badge>
      </div>

      <Separator />

      {/* Item Lists */}
      <ScrollArea className="h-[180px] pr-2">
        <div className="space-y-3">
          <ItemList
            items={template.sequence.startItems}
            title="Start Area"
            icon={<Play className="w-3 h-3 text-green-500" />}
            emptyText="No startup items"
          />

          <ItemList
            items={template.sequence.targetItems}
            title="Target Area"
            icon={<Target className="w-3 h-3 text-yellow-500" />}
            emptyText="No target items"
          />

          <ItemList
            items={template.sequence.endItems}
            title="End Area"
            icon={<Square className="w-3 h-3 text-red-500" />}
            emptyText="No shutdown items"
          />
        </div>
      </ScrollArea>

      {/* Metadata */}
      {template.category === "custom" && (
        <>
          <Separator />
          <div className="text-[10px] text-muted-foreground/60">
            Created: {new Date(template.createdAt).toLocaleDateString()}
            {template.updatedAt !== template.createdAt && (
              <span className="ml-2">
                • Updated: {new Date(template.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export const TemplatePreview = memo(TemplatePreviewComponent);
