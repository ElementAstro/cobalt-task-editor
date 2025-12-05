'use client';

import { useCallback, useMemo } from 'react';
import { useSequenceEditorStore } from '@/lib/nina/store';
import { getItemDefinition, IMAGE_TYPES, ERROR_BEHAVIORS, COMPARATORS } from '@/lib/nina/constants';
import type { EditorSequenceItem, EditorCondition, EditorTrigger, EditorTarget } from '@/lib/nina/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useI18n, getItemDescriptionKey, getCategoryKey } from '@/lib/i18n';

// Input Components
interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

function TextInput({ label, value, onChange, placeholder, multiline }: TextInputProps) {
  const id = `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="space-y-1 sm:space-y-1.5">
      <Label htmlFor={id} className="text-[11px] sm:text-xs text-muted-foreground">{label}</Label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-2.5 sm:px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition-shadow min-h-[80px]"
          rows={3}
          aria-label={label}
        />
      ) : (
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-background border-input h-9 sm:h-10 text-sm"
          aria-label={label}
        />
      )}
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

function NumberInput({ label, value, onChange, min, max, step = 1, unit }: NumberInputProps) {
  const id = `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="space-y-1 sm:space-y-1.5">
      <Label htmlFor={id} className="text-[11px] sm:text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="flex-1 bg-background border-input h-9 sm:h-10 text-sm"
          aria-label={label}
        />
        {unit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[10px] sm:text-xs text-muted-foreground cursor-help flex items-center gap-0.5 sm:gap-1 shrink-0">
                {unit}
                <HelpCircle className="w-3 h-3 hidden sm:inline" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="hidden sm:block">
              <p className="text-xs">Unit: {unit}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

interface SelectInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
}

function SelectInput({ label, value, onChange, options }: SelectInputProps) {
  return (
    <div className="space-y-1 sm:space-y-1.5">
      <Label className="text-[11px] sm:text-xs text-muted-foreground">{label}</Label>
      <Select value={String(value)} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-background border-input h-9 sm:h-10 text-sm">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="max-h-[50vh]">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)} className="text-sm">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Switch Input for boolean values
interface SwitchInputProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

function SwitchInput({ label, checked, onChange, description }: SwitchInputProps) {
  const id = `switch-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-[11px] sm:text-xs text-foreground cursor-pointer">{label}</Label>
        {description && (
          <p className="text-[10px] sm:text-[11px] text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        aria-label={label}
      />
    </div>
  );
}

// Coordinate Input
interface CoordinateInputProps {
  label: string;
  ra: { hours: number; minutes: number; seconds: number };
  dec: { degrees: number; minutes: number; seconds: number; negative: boolean };
  onChange: (ra: { hours: number; minutes: number; seconds: number }, dec: { degrees: number; minutes: number; seconds: number; negative: boolean }) => void;
  translations: {
    rightAscension: string;
    declination: string;
    raHours: string;
    raMinutes: string;
    raSeconds: string;
    decDegrees: string;
    decMinutes: string;
    decSeconds: string;
  };
}

function CoordinateInput({ label, ra, dec, onChange, translations }: CoordinateInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] sm:text-xs text-muted-foreground">{label}</label>
      
      <div className="space-y-2 sm:space-y-3">
        <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">{translations.rightAscension}</div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <div className="space-y-0.5">
            <input
              type="number"
              value={ra.hours}
              onChange={(e) => onChange({ ...ra, hours: parseInt(e.target.value) || 0 }, dec)}
              min={0}
              max={23}
              className="w-full px-2 py-1.5 sm:py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="h"
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">{translations.raHours}</span>
          </div>
          <div className="space-y-0.5">
            <input
              type="number"
              value={ra.minutes}
              onChange={(e) => onChange({ ...ra, minutes: parseInt(e.target.value) || 0 }, dec)}
              min={0}
              max={59}
              className="w-full px-2 py-1.5 sm:py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="m"
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">{translations.raMinutes}</span>
          </div>
          <div className="space-y-0.5">
            <input
              type="number"
              value={ra.seconds}
              onChange={(e) => onChange({ ...ra, seconds: parseFloat(e.target.value) || 0 }, dec)}
              min={0}
              max={59.99}
              step={0.1}
              className="w-full px-2 py-1.5 sm:py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="s"
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">{translations.raSeconds}</span>
          </div>
        </div>
        
        <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">{translations.declination}</div>
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          <div>
            <select
              value={dec.negative ? '-' : '+'}
              onChange={(e) => onChange(ra, { ...dec, negative: e.target.value === '-' })}
              className="w-full px-1.5 sm:px-2 py-1.5 sm:py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="+">+</option>
              <option value="-">-</option>
            </select>
          </div>
          <div className="space-y-0.5">
            <input
              type="number"
              value={dec.degrees}
              onChange={(e) => onChange(ra, { ...dec, degrees: parseInt(e.target.value) || 0 })}
              min={0}
              max={90}
              className="w-full px-2 py-1.5 sm:py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="°"
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">{translations.decDegrees}</span>
          </div>
          <div className="space-y-0.5">
            <input
              type="number"
              value={dec.minutes}
              onChange={(e) => onChange(ra, { ...dec, minutes: parseInt(e.target.value) || 0 })}
              min={0}
              max={59}
              className="w-full px-2 py-1.5 sm:py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="'"
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">{translations.decMinutes}</span>
          </div>
          <div className="space-y-0.5">
            <input
              type="number"
              value={dec.seconds}
              onChange={(e) => onChange(ra, { ...dec, seconds: parseFloat(e.target.value) || 0 })}
              min={0}
              max={59.99}
              step={0.1}
              className="w-full px-2 py-1.5 sm:py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder='"'
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">{translations.decSeconds}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Property Editors for specific item types
interface ItemPropertiesProps {
  item: EditorSequenceItem;
  onUpdate: (updates: Partial<EditorSequenceItem>) => void;
}

function ExposureProperties({ item, onUpdate }: ItemPropertiesProps) {
  const { t } = useI18n();
  const updateData = useCallback((key: string, value: unknown) => {
    onUpdate({ data: { ...item.data, [key]: value } });
  }, [item.data, onUpdate]);
  
  return (
    <div className="space-y-2.5 sm:space-y-3">
      <NumberInput
        label={t.properties.exposureTime}
        value={item.data.ExposureTime as number || 0}
        onChange={(v) => updateData('ExposureTime', v)}
        min={0}
        step={0.1}
        unit={t.common.seconds}
      />
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <NumberInput
          label={t.properties.gain}
          value={item.data.Gain as number || -1}
          onChange={(v) => updateData('Gain', v)}
          min={-1}
        />
        <NumberInput
          label={t.properties.offset}
          value={item.data.Offset as number || -1}
          onChange={(v) => updateData('Offset', v)}
          min={-1}
        />
      </div>
      <SelectInput
        label={t.properties.imageType}
        value={item.data.ImageType as string || 'LIGHT'}
        onChange={(v) => updateData('ImageType', v)}
        options={IMAGE_TYPES}
      />
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <NumberInput
          label={t.properties.binningX}
          value={(item.data.Binning as { X: number; Y: number })?.X || 1}
          onChange={(v) => updateData('Binning', { ...(item.data.Binning as object || {}), X: v })}
          min={1}
          max={4}
        />
        <NumberInput
          label={t.properties.binningY}
          value={(item.data.Binning as { X: number; Y: number })?.Y || 1}
          onChange={(v) => updateData('Binning', { ...(item.data.Binning as object || {}), Y: v })}
          min={1}
          max={4}
        />
      </div>
    </div>
  );
}

function CameraProperties({ item, onUpdate }: ItemPropertiesProps) {
  const { t } = useI18n();
  const updateData = useCallback((key: string, value: unknown) => {
    onUpdate({ data: { ...item.data, [key]: value } });
  }, [item.data, onUpdate]);
  
  if (item.type.includes('CoolCamera') || item.type.includes('WarmCamera')) {
    return (
      <div className="space-y-3">
        {item.type.includes('CoolCamera') && (
          <NumberInput
            label={t.properties.targetTemperature}
            value={item.data.Temperature as number || -10}
            onChange={(v) => updateData('Temperature', v)}
            min={-40}
            max={30}
            unit="°C"
          />
        )}
        <NumberInput
          label={t.properties.duration}
          value={item.data.Duration as number || 0}
          onChange={(v) => updateData('Duration', v)}
          min={0}
          unit={t.common.minutes}
        />
      </div>
    );
  }
  
  return null;
}

function WaitProperties({ item, onUpdate }: ItemPropertiesProps) {
  const { t } = useI18n();
  const updateData = useCallback((key: string, value: unknown) => {
    onUpdate({ data: { ...item.data, [key]: value } });
  }, [item.data, onUpdate]);
  
  if (item.type.includes('WaitForTimeSpan')) {
    return (
      <NumberInput
        label={t.properties.waitDuration}
        value={item.data.Time as number || 0}
        onChange={(v) => updateData('Time', v)}
        min={0}
        unit={t.common.seconds}
      />
    );
  }
  
  if (item.type.includes('WaitForTime')) {
    return (
      <div className="grid grid-cols-3 gap-2">
        <NumberInput
          label={t.properties.hours}
          value={item.data.Hours as number || 0}
          onChange={(v) => updateData('Hours', v)}
          min={0}
          max={23}
        />
        <NumberInput
          label={t.properties.minutes}
          value={item.data.Minutes as number || 0}
          onChange={(v) => updateData('Minutes', v)}
          min={0}
          max={59}
        />
        <NumberInput
          label={t.properties.seconds}
          value={item.data.Seconds as number || 0}
          onChange={(v) => updateData('Seconds', v)}
          min={0}
          max={59}
        />
      </div>
    );
  }
  
  if (item.type.includes('Altitude')) {
    return (
      <div className="space-y-3">
        <NumberInput
          label={t.properties.targetAltitude}
          value={item.data.TargetAltitude as number || 0}
          onChange={(v) => updateData('TargetAltitude', v)}
          min={-90}
          max={90}
          unit={t.common.degrees}
        />
        <SelectInput
          label={t.properties.comparator}
          value={item.data.Comparator as string || '>='}
          onChange={(v) => updateData('Comparator', v)}
          options={COMPARATORS}
        />
      </div>
    );
  }
  
  return null;
}

function AnnotationProperties({ item, onUpdate }: ItemPropertiesProps) {
  const { t } = useI18n();
  const updateData = useCallback((key: string, value: unknown) => {
    onUpdate({ data: { ...item.data, [key]: value } });
  }, [item.data, onUpdate]);
  
  return (
    <TextInput
      label={t.properties.text}
      value={item.data.Text as string || ''}
      onChange={(v) => updateData('Text', v)}
      placeholder={t.properties.annotation}
      multiline
    />
  );
}

function DeepSkyObjectProperties({ item, onUpdate }: ItemPropertiesProps) {
  const { t } = useI18n();
  const rawTarget = item.data.Target as EditorTarget | undefined;
  
  // Ensure target has all required fields - memoized to avoid recreating on every render
  const target: EditorTarget = useMemo(() => ({
    name: rawTarget?.name || '',
    ra: rawTarget?.ra || { hours: 0, minutes: 0, seconds: 0 },
    dec: rawTarget?.dec || { degrees: 0, minutes: 0, seconds: 0, negative: false },
    rotation: rawTarget?.rotation || 0,
  }), [rawTarget]);
  
  const updateTarget = useCallback((updates: Partial<EditorTarget>) => {
    onUpdate({ 
      data: { 
        ...item.data, 
        Target: { ...target, ...updates }
      } 
    });
  }, [item.data, target, onUpdate]);
  
  return (
    <div className="space-y-3">
      <TextInput
        label={t.properties.targetName}
        value={target.name}
        onChange={(v) => updateTarget({ name: v })}
        placeholder="e.g., M31, NGC 7000"
      />
      <CoordinateInput
        label={t.properties.coordinates}
        ra={target.ra}
        dec={target.dec}
        onChange={(ra, dec) => updateTarget({ ra, dec })}
        translations={{
          rightAscension: t.properties.rightAscension,
          declination: t.properties.declination,
          raHours: t.properties.raHours,
          raMinutes: t.properties.raMinutes,
          raSeconds: t.properties.raSeconds,
          decDegrees: t.properties.decDegrees,
          decMinutes: t.properties.decMinutes,
          decSeconds: t.properties.decSeconds,
        }}
      />
      <NumberInput
        label={t.properties.positionAngle}
        value={target.rotation}
        onChange={(v) => updateTarget({ rotation: v })}
        min={0}
        max={360}
        step={0.1}
        unit={t.common.degrees}
      />
    </div>
  );
}

// Condition Properties
interface ConditionPropertiesProps {
  condition: EditorCondition;
  containerId: string;
}

function ConditionProperties({ condition, containerId }: ConditionPropertiesProps) {
  const { t } = useI18n();
  const { updateCondition } = useSequenceEditorStore();
  
  const updateData = useCallback((key: string, value: unknown) => {
    updateCondition(containerId, condition.id, { 
      data: { ...condition.data, [key]: value } 
    });
  }, [containerId, condition.id, condition.data, updateCondition]);
  
  if (condition.type.includes('LoopCondition')) {
    return (
      <div className="space-y-3">
        <NumberInput
          label={t.properties.iterations}
          value={condition.data.Iterations as number || 1}
          onChange={(v) => updateData('Iterations', v)}
          min={1}
        />
        <div className="text-xs text-muted-foreground">
          {t.properties.completed}: {String(condition.data.CompletedIterations || 0)}
        </div>
      </div>
    );
  }
  
  if (condition.type.includes('TimeCondition')) {
    return (
      <div className="grid grid-cols-3 gap-2">
        <NumberInput
          label={t.properties.hours}
          value={condition.data.Hours as number || 0}
          onChange={(v) => updateData('Hours', v)}
          min={0}
          max={23}
        />
        <NumberInput
          label={t.properties.minutes}
          value={condition.data.Minutes as number || 0}
          onChange={(v) => updateData('Minutes', v)}
          min={0}
          max={59}
        />
        <NumberInput
          label={t.properties.seconds}
          value={condition.data.Seconds as number || 0}
          onChange={(v) => updateData('Seconds', v)}
          min={0}
          max={59}
        />
      </div>
    );
  }
  
  if (condition.type.includes('Altitude')) {
    return (
      <div className="space-y-3">
        <NumberInput
          label={t.properties.targetAltitude}
          value={condition.data.TargetAltitude as number || 0}
          onChange={(v) => updateData('TargetAltitude', v)}
          min={-90}
          max={90}
          unit={t.common.degrees}
        />
        <SelectInput
          label={t.properties.comparator}
          value={condition.data.Comparator as string || '>='}
          onChange={(v) => updateData('Comparator', v)}
          options={COMPARATORS}
        />
      </div>
    );
  }
  
  return <div className="text-xs text-muted-foreground">{t.properties.noSelection}</div>;
}

// Trigger Properties
interface TriggerPropertiesProps {
  trigger: EditorTrigger;
  containerId: string;
}

function TriggerProperties({ trigger, containerId }: TriggerPropertiesProps) {
  const { t } = useI18n();
  const { updateTrigger } = useSequenceEditorStore();
  
  const updateData = useCallback((key: string, value: unknown) => {
    updateTrigger(containerId, trigger.id, { 
      data: { ...trigger.data, [key]: value } 
    });
  }, [containerId, trigger.id, trigger.data, updateTrigger]);
  
  if (trigger.type.includes('DitherAfterExposures') || trigger.type.includes('AutofocusAfterExposures')) {
    return (
      <NumberInput
        label={t.properties.afterExposures}
        value={trigger.data.AfterExposures as number || 1}
        onChange={(v) => updateData('AfterExposures', v)}
        min={1}
      />
    );
  }
  
  if (trigger.type.includes('HFRIncrease')) {
    return (
      <div className="space-y-3">
        <NumberInput
          label={`${t.properties.amount} %`}
          value={trigger.data.Amount as number || 10}
          onChange={(v) => updateData('Amount', v)}
          min={1}
          unit="%"
        />
        <NumberInput
          label={t.properties.sampleSize}
          value={trigger.data.SampleSize as number || 10}
          onChange={(v) => updateData('SampleSize', v)}
          min={1}
        />
      </div>
    );
  }
  
  if (trigger.type.includes('TemperatureChange')) {
    return (
      <NumberInput
        label={t.properties.temperature}
        value={trigger.data.Amount as number || 2}
        onChange={(v) => updateData('Amount', v)}
        min={0.1}
        step={0.1}
        unit="°C"
      />
    );
  }
  
  if (trigger.type.includes('AfterTime')) {
    return (
      <NumberInput
        label={t.properties.duration}
        value={trigger.data.Amount as number || 60}
        onChange={(v) => updateData('Amount', v)}
        min={1}
        unit={t.common.minutes}
      />
    );
  }
  
  if (trigger.type.includes('CenterAfterDrift')) {
    return (
      <NumberInput
        label={t.properties.distanceArcMinutes}
        value={trigger.data.DistanceArcMinutes as number || 5}
        onChange={(v) => updateData('DistanceArcMinutes', v)}
        min={0.1}
        step={0.1}
        unit={t.common.arcminutes}
      />
    );
  }
  
  return <div className="text-xs text-zinc-500">{t.properties.noSelection}</div>;
}

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
    
    const searchInItems = (items: EditorSequenceItem[]): { condition: EditorCondition; containerId: string } | null => {
      for (const item of items) {
        if (item.conditions) {
          const condition = item.conditions.find(c => c.id === selectedConditionId);
          if (condition) return { condition, containerId: item.id };
        }
        if (item.items) {
          const found = searchInItems(item.items);
          if (found) return found;
        }
      }
      return null;
    };
    
    return searchInItems([...sequence.startItems, ...sequence.targetItems, ...sequence.endItems]);
  }, [selectedConditionId, sequence]);
  
  // Find trigger and its container
  const findTrigger = useMemo(() => {
    if (!selectedTriggerId) return null;
    
    // Check global triggers first
    const globalTrigger = sequence.globalTriggers.find(t => t.id === selectedTriggerId);
    if (globalTrigger) return { trigger: globalTrigger, containerId: 'global' };
    
    const searchInItems = (items: EditorSequenceItem[]): { trigger: EditorTrigger; containerId: string } | null => {
      for (const item of items) {
        if (item.triggers) {
          const trigger = item.triggers.find(t => t.id === selectedTriggerId);
          if (trigger) return { trigger, containerId: item.id };
        }
        if (item.items) {
          const found = searchInItems(item.items);
          if (found) return found;
        }
      }
      return null;
    };
    
    return searchInItems([...sequence.startItems, ...sequence.targetItems, ...sequence.endItems]);
  }, [selectedTriggerId, sequence]);
  
  const handleUpdateItem = useCallback((updates: Partial<EditorSequenceItem>) => {
    if (selectedItemId) {
      updateItem(selectedItemId, updates);
    }
  }, [selectedItemId, updateItem]);
  
  // Get translated description for item
  const getTranslatedDescription = (type: string, fallback?: string): string | undefined => {
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
    const translatedDescription = getTranslatedDescription(selectedItem.type, definition?.description);
    
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
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{translatedDescription}</p>
          )}
        </div>
        
        <Separator />
        
        {/* Type-specific Properties */}
        {selectedItem.type.includes('Exposure') && (
          <ExposureProperties item={selectedItem} onUpdate={handleUpdateItem} />
        )}
        
        {selectedItem.type.includes('Camera') && (
          <CameraProperties item={selectedItem} onUpdate={handleUpdateItem} />
        )}
        
        {selectedItem.type.includes('Wait') && (
          <WaitProperties item={selectedItem} onUpdate={handleUpdateItem} />
        )}
        
        {selectedItem.type.includes('Annotation') && (
          <AnnotationProperties item={selectedItem} onUpdate={handleUpdateItem} />
        )}
        
        {selectedItem.type.includes('DeepSkyObject') && (
          <DeepSkyObjectProperties item={selectedItem} onUpdate={handleUpdateItem} />
        )}
        
        <Separator />
        
        {/* Error Behavior */}
        <div className="space-y-2.5 sm:space-y-3">
          <SelectInput
            label={t.properties.onError}
            value={selectedItem.data.ErrorBehavior as string || 'ContinueOnError'}
            onChange={(v) => handleUpdateItem({ data: { ...selectedItem.data, ErrorBehavior: v } })}
            options={ERROR_BEHAVIORS}
          />
          
          <NumberInput
            label={t.properties.retryAttempts}
            value={selectedItem.data.Attempts as number || 1}
            onChange={(v) => handleUpdateItem({ data: { ...selectedItem.data, Attempts: v } })}
            min={1}
            max={10}
          />
        </div>
      </div>
    );
  };

  // No selection
  if (!selectedItem && !findCondition && !findTrigger) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-[200px]">
            {t.properties.selectItem}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-2 sm:p-3 space-y-2 sm:space-y-3 scrollbar-thin">
      {/* Condition Properties */}
      {findCondition && (
        <Card className="bg-muted/30 border-yellow-500/30">
          <CardHeader className="py-2 sm:py-3 px-3 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-yellow-400 flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-400 shrink-0" />
              {t.properties.condition}
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs truncate">
              {findCondition.condition.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
            <ConditionProperties 
              condition={findCondition.condition} 
              containerId={findCondition.containerId} 
            />
          </CardContent>
        </Card>
      )}
      
      {/* Trigger Properties */}
      {findTrigger && !findCondition && (
        <Card className="bg-muted/30 border-purple-500/30">
          <CardHeader className="py-2 sm:py-3 px-3 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-purple-400 flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 shrink-0" />
              {t.properties.trigger}
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs truncate">
              {findTrigger.trigger.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
            <TriggerProperties 
              trigger={findTrigger.trigger} 
              containerId={findTrigger.containerId} 
            />
          </CardContent>
        </Card>
      )}
      
      {/* Item Properties */}
      {selectedItem && !findCondition && !findTrigger && (
        <Card className="bg-muted/30 border-blue-500/30">
          <CardHeader className="py-2 sm:py-3 px-3 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-blue-400 flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 shrink-0" />
              <span className="truncate">{getTranslatedCategory(getItemDefinition(selectedItem.type)?.category || '') || t.properties.item}</span>
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs truncate">
              {selectedItem.type.split('.').slice(-1)[0].split(',')[0]}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
            {renderItemProperties()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
