'use client';

import { useState, useMemo, useCallback } from 'react';
import { 
  Search, 
  ChevronRight,
  GripVertical,
  Plus,
  Box,
  Camera,
  Focus,
  Disc,
  Crosshair,
  Scan,
  RotateCw,
  RotateCcw,
  Home as HomeIcon,
  Sun,
  Moon,
  Shield,
  ToggleRight,
  Plug,
  Repeat,
  Clock,
  Timer,
  Mountain,
  Sunrise,
  Thermometer,
  Snowflake,
  Flame,
  Usb,
  Sparkles,
  Compass,
  ParkingSquare,
  ParkingSquareOff,
  Target,
  MoveVertical,
  CircleStop,
  Shuffle,
  Rotate3d,
  Cog,
  DoorOpen,
  DoorClosed,
  RefreshCw,
  Link,
  Unlink,
  Lightbulb,
  Package,
  MessageSquare,
  MessageCircle,
  Terminal,
  Save,
  PlugZap,
  Circle,
  FlipHorizontal,
  Undo,
  TrendingUp,
  Zap,
  Star,
  GitBranch,
  ListOrdered,
  Settings,
  Images,
} from 'lucide-react';
import { 
  SEQUENCE_ITEMS, 
  CONDITION_ITEMS, 
  TRIGGER_ITEMS, 
  type ItemDefinition 
} from '@/lib/nina/constants';
import { useSequenceEditorStore } from '@/lib/nina/store';
import { createSequenceItem, createCondition, createTrigger } from '@/lib/nina/utils';
import { useI18n, getItemNameKey, getConditionNameKey, getTriggerNameKey, getCategoryKey, getItemDescriptionKey, getConditionDescriptionKey, getTriggerDescriptionKey } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Check, Info } from 'lucide-react';

// Icon mapping - comprehensive mapping for all NINA sequence item types
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Containers
  'list-ordered': ListOrdered,
  'git-branch': GitBranch,
  'star': Star,
  
  // Camera
  'thermometer-snowflake': Snowflake,
  'thermometer-sun': Thermometer,
  'settings': Settings,
  'flame': Flame,
  'usb': Usb,
  'camera': Camera,
  
  // Imaging
  'images': Images,
  'sparkles': Sparkles,
  
  // Telescope
  'compass': Compass,
  'square-parking': ParkingSquare,
  'square-parking-off': ParkingSquareOff,
  'home': HomeIcon,
  'target': Target,
  
  // Focuser
  'focus': Focus,
  'move-vertical': MoveVertical,
  'thermometer': Thermometer,
  
  // Filter Wheel
  'disc': Disc,
  
  // Guider
  'crosshair': Crosshair,
  'circle-stop': CircleStop,
  'shuffle': Shuffle,
  
  // Autofocus
  'scan': Scan,
  
  // Platesolving
  'rotate-3d': Rotate3d,
  
  // Rotator
  'rotate-cw': RotateCw,
  'rotate-ccw': RotateCcw,
  'cog': Cog,
  
  // Dome
  'door-open': DoorOpen,
  'door-closed': DoorClosed,
  'refresh-cw': RefreshCw,
  
  // Connection
  'link': Link,
  'unlink': Unlink,
  'plug': Plug,
  'plug-zap': PlugZap,
  
  // Flat Device
  'sun': Sun,
  'lightbulb': Lightbulb,
  'box': Box,
  'package': Package,
  
  // Safety
  'shield-check': Shield,
  
  // Switch
  'toggle-right': ToggleRight,
  
  // Utility
  'message-square': MessageSquare,
  'message-circle': MessageCircle,
  'terminal': Terminal,
  'clock': Clock,
  'timer': Timer,
  'mountain': Mountain,
  'moon': Moon,
  'sunrise': Sunrise,
  'save': Save,
  
  // Conditions
  'repeat': Repeat,
  'circle': Circle,
  
  // Triggers
  'flip-horizontal': FlipHorizontal,
  'undo': Undo,
  'trending-up': TrendingUp,
  'zap': Zap,
};

function getIcon(iconName?: string): React.ComponentType<{ className?: string }> {
  if (!iconName) return Box;
  return iconMap[iconName] || Box;
}

// Group items by category
function groupByCategory(items: ItemDefinition[]): Record<string, ItemDefinition[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ItemDefinition[]>);
}

interface ToolboxCategoryProps {
  category: string;
  items: ItemDefinition[];
  onDragStart: (item: ItemDefinition, type: 'item' | 'condition' | 'trigger') => void;
  onDoubleClick: (item: ItemDefinition, type: 'item' | 'condition' | 'trigger') => void;
  type: 'item' | 'condition' | 'trigger';
  getItemName: (item: ItemDefinition) => string;
  getItemDescription: (item: ItemDefinition) => string;
  getCategoryName: (category: string) => string;
  isMobile?: boolean;
}

function ToolboxCategory({ category, items, onDragStart, onDoubleClick, type, getItemName, getItemDescription, getCategoryName, isMobile = false }: ToolboxCategoryProps) {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <Collapsible open={expanded} onOpenChange={setExpanded} className="mb-1.5 sm:mb-2">
      <CollapsibleTrigger asChild>
        <button
          className={`flex items-center gap-1.5 sm:gap-2 w-full px-2 text-left text-xs sm:text-sm font-medium hover:bg-accent active:bg-accent/80 rounded-md transition-all duration-200 touch-manipulation ${isMobile ? 'py-2.5 min-h-[44px]' : 'py-1.5 sm:py-2'}`}
        >
          <ChevronRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
          <span className="truncate">{getCategoryName(category)}</span>
          <Badge variant="secondary" className="ml-auto h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs shrink-0">
            {items.length}
          </Badge>
        </button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1 overflow-hidden">
        <div className="ml-3 sm:ml-4 mt-0.5 sm:mt-1 space-y-0.5">
          {items.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <div
                key={item.type}
                draggable={!isMobile}
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify({ item, type }));
                  e.dataTransfer.effectAllowed = 'copy';
                  onDragStart(item, type);
                }}
                onClick={() => onDoubleClick(item, type)}
                onDoubleClick={() => onDoubleClick(item, type)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-accent active:bg-accent/80 active:scale-[0.98] rounded-md cursor-pointer sm:cursor-grab active:cursor-grabbing group touch-manipulation select-none transition-all duration-150 ${isMobile ? 'py-2.5 min-h-[44px]' : 'py-1.5 sm:py-2'}`}
                title={getItemDescription(item)}
                role="button"
                aria-label={`Add ${getItemName(item)}`}
              >
                <GripVertical className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground hidden sm:block shrink-0 transition-colors" aria-hidden />
                <Icon className="w-4 h-4 sm:w-4 sm:h-4 shrink-0" aria-hidden />
                <span className="truncate flex-1 text-left">{getItemName(item)}</span>
                <Plus className="w-4 h-4 text-muted-foreground/70 group-hover:text-foreground sm:hidden shrink-0 transition-colors" aria-hidden />
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface SequenceToolboxProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export function SequenceToolbox({ onClose, isMobile = false }: SequenceToolboxProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'items' | 'conditions' | 'triggers'>('items');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const { addItem, addCondition, addTrigger, activeArea, selectedItemId, getItemById } = useSequenceEditorStore();
  
  // Check if selected item is a container
  const selectedItem = selectedItemId ? getItemById(selectedItemId) : null;
  const isSelectedContainer = selectedItem ? selectedItem.type.includes('Container') || selectedItem.type.includes('DeepSkyObject') : false;
  
  // Show feedback message briefly
  const showFeedback = useCallback((message: string) => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(null), 1500);
  }, []);
  
  const getTranslatedItemName = useCallback((item: ItemDefinition): string => {
    const key = getItemNameKey(item.type);
    if (key && t.ninaItems[key]) {
      return t.ninaItems[key];
    }
    return item.name;
  }, [t.ninaItems]);

  const getTranslatedConditionName = useCallback((item: ItemDefinition): string => {
    const key = getConditionNameKey(item.type);
    if (key && t.ninaConditions[key]) {
      return t.ninaConditions[key];
    }
    return item.name;
  }, [t.ninaConditions]);

  const getTranslatedTriggerName = useCallback((item: ItemDefinition): string => {
    const key = getTriggerNameKey(item.type);
    if (key && t.ninaTriggers[key]) {
      return t.ninaTriggers[key];
    }
    return item.name;
  }, [t.ninaTriggers]);

  const getTranslatedCategoryName = useCallback((category: string): string => {
    const key = getCategoryKey(category);
    if (key && t.categories[key]) {
      return t.categories[key];
    }
    return category;
  }, [t.categories]);

  const getTranslatedItemDescription = useCallback((item: ItemDefinition): string => {
    const key = getItemDescriptionKey(item.type);
    if (key && t.itemDescriptions[key]) {
      return t.itemDescriptions[key];
    }
    return item.description;
  }, [t.itemDescriptions]);

  const getTranslatedConditionDescription = useCallback((item: ItemDefinition): string => {
    const key = getConditionDescriptionKey(item.type);
    if (key && t.conditionDescriptions[key]) {
      return t.conditionDescriptions[key];
    }
    return item.description;
  }, [t.conditionDescriptions]);

  const getTranslatedTriggerDescription = useCallback((item: ItemDefinition): string => {
    const key = getTriggerDescriptionKey(item.type);
    if (key && t.triggerDescriptions[key]) {
      return t.triggerDescriptions[key];
    }
    return item.description;
  }, [t.triggerDescriptions]);

  // Filter items based on search, using translated text so users can query localized names
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return SEQUENCE_ITEMS;
    return SEQUENCE_ITEMS.filter((item) => {
      const localizedName = getTranslatedItemName(item).toLowerCase();
      const localizedCategory = getTranslatedCategoryName(item.category).toLowerCase();
      const localizedDescription = getTranslatedItemDescription(item).toLowerCase();
      return (
        localizedName.includes(query) ||
        localizedCategory.includes(query) ||
        localizedDescription.includes(query)
      );
    });
  }, [searchQuery, getTranslatedItemName, getTranslatedCategoryName, getTranslatedItemDescription]);
  
  const filteredConditions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return CONDITION_ITEMS;
    return CONDITION_ITEMS.filter((item) => {
      const localizedName = getTranslatedConditionName(item).toLowerCase();
      const localizedDescription = getTranslatedConditionDescription(item).toLowerCase();
      return localizedName.includes(query) || localizedDescription.includes(query);
    });
  }, [searchQuery, getTranslatedConditionName, getTranslatedConditionDescription]);
  
  const filteredTriggers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return TRIGGER_ITEMS;
    return TRIGGER_ITEMS.filter((item) => {
      const localizedName = getTranslatedTriggerName(item).toLowerCase();
      const localizedDescription = getTranslatedTriggerDescription(item).toLowerCase();
      return localizedName.includes(query) || localizedDescription.includes(query);
    });
  }, [searchQuery, getTranslatedTriggerName, getTranslatedTriggerDescription]);
  
  const groupedItems = useMemo(() => groupByCategory(filteredItems), [filteredItems]);
  
  const handleDragStart = () => {
    // Drag start handling - the actual data is set in the onDragStart handler
  };
  
  const handleAddItem = useCallback((item: ItemDefinition, type: 'item' | 'condition' | 'trigger') => {
    if (type === 'item') {
      const newItem = createSequenceItem(item.type);
      addItem(activeArea, newItem, selectedItemId);
      showFeedback(t.toolbox.itemAdded);
    } else if (type === 'condition') {
      if (selectedItemId && isSelectedContainer) {
        const newCondition = createCondition(item.type);
        addCondition(selectedItemId, newCondition);
        showFeedback(t.toolbox.conditionAdded);
      } else {
        showFeedback(t.toolbox.selectContainerFirst);
      }
    } else if (type === 'trigger') {
      if (selectedItemId && isSelectedContainer) {
        const newTrigger = createTrigger(item.type);
        addTrigger(selectedItemId, newTrigger);
        showFeedback(t.toolbox.triggerAdded);
      } else {
        showFeedback(t.toolbox.selectContainerFirst);
      }
    }
  }, [activeArea, selectedItemId, isSelectedContainer, addItem, addCondition, addTrigger, showFeedback, t.toolbox]);

  // Translation helpers (used for rendering and searching)

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Mobile Header with Done button */}
      {isMobile && onClose && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
          <span className="text-sm font-medium">
            {activeTab === 'items' ? t.toolbox.items : activeTab === 'conditions' ? t.toolbox.conditions : t.toolbox.triggers}
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
      {feedbackMessage && (
        <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 sm:px-4 py-2 bg-accent text-accent-foreground text-xs sm:text-sm rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 max-w-[90%]">
          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 shrink-0" />
          <span className="truncate">{feedbackMessage}</span>
        </div>
      )}
      
      {/* Search */}
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.toolbox.searchPlaceholder}
            className="pl-8 sm:pl-9 h-9 sm:h-10 bg-background border-input text-sm"
            aria-label={t.toolbox.searchPlaceholder}
          />
        </div>
      </div>
      
      {/* Tabs with shadcn/ui */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'items' | 'conditions' | 'triggers')}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0 shrink-0">
          <TabsTrigger 
            value="items" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-400 data-[state=active]:bg-transparent data-[state=active]:text-blue-400 py-2 sm:py-2.5 text-xs sm:text-sm gap-1 sm:gap-1.5 min-h-[40px] touch-manipulation"
          >
            <span className="hidden xs:inline">{t.toolbox.items}</span>
            <span className="xs:hidden">Items</span>
            <Badge variant="secondary" className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px]">
              {filteredItems.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="conditions" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent data-[state=active]:text-yellow-400 py-2 sm:py-2.5 text-xs sm:text-sm gap-1 sm:gap-1.5 min-h-[40px] touch-manipulation"
          >
            <span className="hidden xs:inline">{t.toolbox.conditions}</span>
            <span className="xs:hidden">Cond</span>
            <Badge variant="secondary" className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px]">
              {filteredConditions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="triggers" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-400 data-[state=active]:bg-transparent data-[state=active]:text-purple-400 py-2 sm:py-2.5 text-xs sm:text-sm gap-1 sm:gap-1.5 min-h-[40px] touch-manipulation"
          >
            <span className="hidden xs:inline">{t.toolbox.triggers}</span>
            <span className="xs:hidden">Trig</span>
            <Badge variant="secondary" className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px]">
              {filteredTriggers.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 min-h-0 relative">
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
                  <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-muted-foreground">
                    <Info className="w-8 h-8 sm:w-10 sm:h-10 mb-2 opacity-50" />
                    <p className="text-xs sm:text-sm">{t.toolbox.noResults}</p>
                  </div>
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
                  <div className="mb-2 sm:mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                    <p className="text-[11px] sm:text-xs text-yellow-400 flex items-center gap-1.5">
                      <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                      <span>{t.toolbox.selectContainerFirst}</span>
                    </p>
                  </div>
                )}
                <div className="space-y-0.5">
                  {filteredConditions.map((item) => {
                    const Icon = getIcon(item.icon);
                    return (
                      <Tooltip key={item.type}>
                        <TooltipTrigger asChild>
                          <div
                            draggable={!isMobile}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('application/json', JSON.stringify({ item, type: 'condition' }));
                              e.dataTransfer.effectAllowed = 'copy';
                            }}
                            onClick={() => handleAddItem(item, 'condition')}
                            onDoubleClick={() => handleAddItem(item, 'condition')}
                            className={`flex items-center gap-1.5 sm:gap-2 px-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-accent active:bg-accent/80 rounded cursor-pointer sm:cursor-grab active:cursor-grabbing touch-manipulation select-none ${isMobile ? 'py-2.5 min-h-[44px]' : 'py-1.5 sm:py-2'}`}
                            role="button"
                            aria-label={`Add ${getTranslatedConditionName(item)}`}
                          >
                            <GripVertical className="w-3 h-3 text-muted-foreground/50 hidden sm:block shrink-0" aria-hidden />
                            <Icon className="w-4 h-4 text-yellow-400 shrink-0" aria-hidden />
                            <span className="truncate flex-1 text-left">{getTranslatedConditionName(item)}</span>
                            <Plus className="w-4 h-4 text-muted-foreground/70 sm:hidden shrink-0" aria-hidden />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs hidden sm:block">
                          <p className="text-xs">{getTranslatedConditionDescription(item)}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {filteredConditions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-muted-foreground">
                      <Info className="w-8 h-8 sm:w-10 sm:h-10 mb-2 opacity-50" />
                      <p className="text-xs sm:text-sm">{t.toolbox.noResults}</p>
                    </div>
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
                  <div className="mb-2 sm:mb-3 p-2 bg-purple-500/10 border border-purple-500/20 rounded-md">
                    <p className="text-[11px] sm:text-xs text-purple-400 flex items-center gap-1.5">
                      <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                      <span>{t.toolbox.selectContainerFirst}</span>
                    </p>
                  </div>
                )}
                <div className="space-y-0.5">
                  {filteredTriggers.map((item) => {
                    const Icon = getIcon(item.icon);
                    return (
                      <Tooltip key={item.type}>
                        <TooltipTrigger asChild>
                          <div
                            draggable={!isMobile}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('application/json', JSON.stringify({ item, type: 'trigger' }));
                              e.dataTransfer.effectAllowed = 'copy';
                            }}
                            onClick={() => handleAddItem(item, 'trigger')}
                            onDoubleClick={() => handleAddItem(item, 'trigger')}
                            className={`flex items-center gap-1.5 sm:gap-2 px-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-accent active:bg-accent/80 rounded cursor-pointer sm:cursor-grab active:cursor-grabbing touch-manipulation select-none ${isMobile ? 'py-2.5 min-h-[44px]' : 'py-1.5 sm:py-2'}`}
                            role="button"
                            aria-label={`Add ${getTranslatedTriggerName(item)}`}
                          >
                            <GripVertical className="w-3 h-3 text-muted-foreground/50 hidden sm:block shrink-0" aria-hidden />
                            <Icon className="w-4 h-4 text-purple-400 shrink-0" aria-hidden />
                            <span className="truncate flex-1 text-left">{getTranslatedTriggerName(item)}</span>
                            <Plus className="w-4 h-4 text-muted-foreground/70 sm:hidden shrink-0" aria-hidden />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs hidden sm:block">
                          <p className="text-xs">{getTranslatedTriggerDescription(item)}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {filteredTriggers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-muted-foreground">
                      <Info className="w-8 h-8 sm:w-10 sm:h-10 mb-2 opacity-50" />
                      <p className="text-xs sm:text-sm">{t.toolbox.noResults}</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
      
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
