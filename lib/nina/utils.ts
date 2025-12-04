// NINA Sequence Editor - Utility Functions

import type { 
  EditorSequenceItem, 
  EditorCondition, 
  EditorTrigger,
  EditorTarget,
  SequenceEntityStatus,
} from './types';
import { getItemDefinition, isContainerType } from './constants';

// ============================================================================
// ID Generation
// ============================================================================

let idCounter = 0;

export function generateId(): string {
  return `${Date.now()}-${++idCounter}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateNinaId(): string {
  return String(++idCounter);
}

export function resetIdCounter(): void {
  idCounter = 0;
}

// ============================================================================
// Item Creation
// ============================================================================

export function createSequenceItem(
  type: string,
  overrides: Partial<EditorSequenceItem> = {}
): EditorSequenceItem {
  const definition = getItemDefinition(type);
  const isContainer = isContainerType(type);
  
  return {
    id: generateId(),
    type,
    name: definition?.name || 'Unknown Item',
    category: definition?.category || 'Unknown',
    icon: definition?.icon,
    description: definition?.description,
    status: 'CREATED' as SequenceEntityStatus,
    isExpanded: isContainer ? true : undefined,
    data: definition?.defaultValues ? { ...definition.defaultValues } : {},
    items: isContainer ? [] : undefined,
    conditions: isContainer ? [] : undefined,
    triggers: isContainer ? [] : undefined,
    ...overrides,
  };
}

export function createCondition(
  type: string,
  overrides: Partial<EditorCondition> = {}
): EditorCondition {
  const definition = getItemDefinition(type);
  
  return {
    id: generateId(),
    type,
    name: definition?.name || 'Unknown Condition',
    category: definition?.category || 'Condition',
    icon: definition?.icon,
    data: definition?.defaultValues ? { ...definition.defaultValues } : {},
    ...overrides,
  };
}

export function createTrigger(
  type: string,
  overrides: Partial<EditorTrigger> = {}
): EditorTrigger {
  const definition = getItemDefinition(type);
  
  return {
    id: generateId(),
    type,
    name: definition?.name || 'Unknown Trigger',
    category: definition?.category || 'Trigger',
    icon: definition?.icon,
    data: definition?.defaultValues ? { ...definition.defaultValues } : {},
    triggerItems: [],
    ...overrides,
  };
}

// ============================================================================
// Target Creation
// ============================================================================

export function createEmptyTarget(): EditorTarget {
  return {
    name: '',
    ra: { hours: 0, minutes: 0, seconds: 0 },
    dec: { degrees: 0, minutes: 0, seconds: 0, negative: false },
    rotation: 0,
  };
}

export function createTarget(
  name: string,
  ra: { hours: number; minutes: number; seconds: number },
  dec: { degrees: number; minutes: number; seconds: number; negative?: boolean },
  rotation: number = 0
): EditorTarget {
  return {
    name,
    ra,
    dec: { ...dec, negative: dec.negative || false },
    rotation,
  };
}

// ============================================================================
// Coordinate Utilities
// ============================================================================

export function raToDecimal(hours: number, minutes: number, seconds: number): number {
  return hours + minutes / 60 + seconds / 3600;
}

export function decToDecimal(degrees: number, minutes: number, seconds: number, negative: boolean): number {
  const value = Math.abs(degrees) + minutes / 60 + seconds / 3600;
  return negative ? -value : value;
}

export function decimalToRA(decimal: number): { hours: number; minutes: number; seconds: number } {
  const hours = Math.floor(decimal);
  const minutesDecimal = (decimal - hours) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = (minutesDecimal - minutes) * 60;
  
  return { hours, minutes, seconds: Math.round(seconds * 100) / 100 };
}

export function decimalToDec(decimal: number): { degrees: number; minutes: number; seconds: number; negative: boolean } {
  const negative = decimal < 0;
  const absDecimal = Math.abs(decimal);
  const degrees = Math.floor(absDecimal);
  const minutesDecimal = (absDecimal - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = (minutesDecimal - minutes) * 60;
  
  return { degrees, minutes, seconds: Math.round(seconds * 100) / 100, negative };
}

export function formatRA(ra: { hours: number; minutes: number; seconds: number }): string {
  return `${ra.hours.toString().padStart(2, '0')}h ${ra.minutes.toString().padStart(2, '0')}m ${ra.seconds.toFixed(1)}s`;
}

export function formatDec(dec: { degrees: number; minutes: number; seconds: number; negative: boolean }): string {
  const sign = dec.negative ? '-' : '+';
  return `${sign}${dec.degrees.toString().padStart(2, '0')}° ${dec.minutes.toString().padStart(2, '0')}' ${dec.seconds.toFixed(1)}"`;
}

// ============================================================================
// Time Utilities
// ============================================================================

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function parseDuration(duration: string): number {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)m/);
  const secondsMatch = duration.match(/(\d+)s/);
  
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0;
  
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatTime(hours: number, minutes: number, seconds: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================================================
// Tree Utilities
// ============================================================================

export function findItemById(
  items: EditorSequenceItem[],
  id: string
): EditorSequenceItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.items) {
      const found = findItemById(item.items, id);
      if (found) return found;
    }
  }
  return null;
}

export function findItemParent(
  items: EditorSequenceItem[],
  id: string,
  parent: EditorSequenceItem | null = null
): EditorSequenceItem | null {
  for (const item of items) {
    if (item.id === id) return parent;
    if (item.items) {
      const found = findItemParent(item.items, id, item);
      if (found !== null) return found;
    }
  }
  return null;
}

export function removeItemById(
  items: EditorSequenceItem[],
  id: string
): EditorSequenceItem[] {
  return items.reduce<EditorSequenceItem[]>((acc, item) => {
    if (item.id === id) return acc;
    
    const newItem = { ...item };
    if (newItem.items) {
      newItem.items = removeItemById(newItem.items, id);
    }
    acc.push(newItem);
    return acc;
  }, []);
}

export function updateItemById(
  items: EditorSequenceItem[],
  id: string,
  updates: Partial<EditorSequenceItem>
): EditorSequenceItem[] {
  return items.map(item => {
    if (item.id === id) {
      return { ...item, ...updates };
    }
    if (item.items) {
      return { ...item, items: updateItemById(item.items, id, updates) };
    }
    return item;
  });
}

export function insertItemAt(
  items: EditorSequenceItem[],
  parentId: string | null,
  index: number,
  newItem: EditorSequenceItem
): EditorSequenceItem[] {
  if (parentId === null) {
    const result = [...items];
    result.splice(index, 0, newItem);
    return result;
  }
  
  return items.map(item => {
    if (item.id === parentId && item.items) {
      const newItems = [...item.items];
      newItems.splice(index, 0, newItem);
      return { ...item, items: newItems };
    }
    if (item.items) {
      return { ...item, items: insertItemAt(item.items, parentId, index, newItem) };
    }
    return item;
  });
}

export function moveItem(
  items: EditorSequenceItem[],
  itemId: string,
  targetParentId: string | null,
  targetIndex: number
): EditorSequenceItem[] {
  const item = findItemById(items, itemId);
  if (!item) return items;
  
  // Remove from current position
  let result = removeItemById(items, itemId);
  
  // Insert at new position
  result = insertItemAt(result, targetParentId, targetIndex, item);
  
  return result;
}

// ============================================================================
// Deep Clone
// ============================================================================

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function cloneSequenceItem(item: EditorSequenceItem): EditorSequenceItem {
  const cloned = deepClone(item);
  
  // Regenerate IDs
  const regenerateIds = (item: EditorSequenceItem): void => {
    item.id = generateId();
    item.items?.forEach(regenerateIds);
    item.conditions?.forEach(c => { c.id = generateId(); });
    item.triggers?.forEach(t => { 
      t.id = generateId();
      t.triggerItems?.forEach(regenerateIds);
    });
  };
  
  regenerateIds(cloned);
  return cloned;
}

// ============================================================================
// Validation
// ============================================================================

export function validateTarget(target: EditorTarget): string[] {
  const errors: string[] = [];
  
  if (!target.name.trim()) {
    errors.push('Target name is required');
  }
  
  if (target.ra.hours < 0 || target.ra.hours >= 24) {
    errors.push('RA hours must be between 0 and 23');
  }
  
  if (target.ra.minutes < 0 || target.ra.minutes >= 60) {
    errors.push('RA minutes must be between 0 and 59');
  }
  
  if (target.dec.degrees < -90 || target.dec.degrees > 90) {
    errors.push('Dec degrees must be between -90 and 90');
  }
  
  return errors;
}

export function validateExposure(data: Record<string, unknown>): string[] {
  const errors: string[] = [];
  
  const exposureTime = data.ExposureTime as number;
  if (exposureTime !== undefined && exposureTime <= 0) {
    errors.push('Exposure time must be positive');
  }
  
  const gain = data.Gain as number;
  if (gain !== undefined && gain < -1) {
    errors.push('Gain must be -1 (default) or a positive value');
  }
  
  return errors;
}

// ============================================================================
// Type Name Utilities
// ============================================================================

export function getShortTypeName(fullType: string): string {
  // Extract the class name from the full type string
  // e.g., "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer" -> "CoolCamera"
  const match = fullType.match(/\.(\w+),/);
  return match ? match[1] : fullType;
}

export function getTypeCategory(fullType: string): string {
  // Extract category from type path
  // e.g., "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer" -> "Camera"
  const parts = fullType.split('.');
  if (parts.length >= 4) {
    return parts[parts.length - 2].replace(/, NINA.*$/, '');
  }
  return 'Unknown';
}
