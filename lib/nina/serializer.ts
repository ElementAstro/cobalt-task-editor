// NINA Sequence Editor - Serialization Service
// Converts between editor format and NINA JSON format

import type {
  ISequenceContainer,
  ISequenceRootContainer,
  ISequenceItem,
  ISequenceCondition,
  ISequenceTrigger,
  IDeepSkyObjectContainer,
  InputCoordinates,
  InputTarget,
  BinningMode,
  EditorSequence,
  EditorSequenceItem,
  EditorCondition,
  EditorTrigger,
  EditorTarget,
} from './types';
import { 
  generateId, 
  resetIdCounter, 
} from './utils';
import { getItemDefinition, isContainerType } from './constants';

// ============================================================================
// NINA JSON Types for Serialization
// ============================================================================


// ============================================================================
// ID Management for NINA Format
// ============================================================================

let ninaIdCounter = 0;
const idMap = new Map<string, string>();

function resetNinaIds(): void {
  ninaIdCounter = 0;
  idMap.clear();
}

function getNinaId(editorId: string): string {
  if (!idMap.has(editorId)) {
    idMap.set(editorId, String(++ninaIdCounter));
  }
  return idMap.get(editorId)!;
}

// ============================================================================
// Export to NINA Format
// ============================================================================

export function exportToNINA(sequence: EditorSequence): string {
  resetNinaIds();
  
  const rootContainer = createNINARootContainer(sequence);
  
  return JSON.stringify(rootContainer, null, 2);
}

function createNINARootContainer(sequence: EditorSequence): ISequenceRootContainer {
  const rootId = getNinaId('root');
  
  // Create the three area containers
  const startContainer = createNINAAreaContainer(
    sequence.startItems, 
    'Start Area',
    'NINA.Sequencer.Container.StartAreaContainer, NINA.Sequencer',
    rootId
  );
  
  const targetContainer = createNINAAreaContainer(
    sequence.targetItems,
    'Target Area',
    'NINA.Sequencer.Container.TargetAreaContainer, NINA.Sequencer',
    rootId
  );
  
  const endContainer = createNINAAreaContainer(
    sequence.endItems,
    'End Area',
    'NINA.Sequencer.Container.EndAreaContainer, NINA.Sequencer',
    rootId
  );
  
  return {
    $id: rootId,
    $type: 'NINA.Sequencer.Container.SequenceRootContainer, NINA.Sequencer',
    Name: sequence.title,
    SequenceTitle: sequence.title,
    Strategy: {
      $type: 'NINA.Sequencer.Container.ExecutionStrategy.SequentialStrategy, NINA.Sequencer',
    },
    IsExpanded: true,
    Items: {
      $id: getNinaId('root-items'),
      $type: 'System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.SequenceItem.ISequenceItem, NINA.Sequencer]], System.ObjectModel',
      $values: [startContainer, targetContainer, endContainer],
    },
    Conditions: {
      $id: getNinaId('root-conditions'),
      $type: 'System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Conditions.ISequenceCondition, NINA.Sequencer]], System.ObjectModel',
      $values: [],
    },
    Triggers: {
      $id: getNinaId('root-triggers'),
      $type: 'System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Trigger.ISequenceTrigger, NINA.Sequencer]], System.ObjectModel',
      $values: sequence.globalTriggers.map(t => convertEditorTriggerToNINA(t, rootId)),
    },
    Parent: null,
  };
}

function createNINAAreaContainer(
  items: EditorSequenceItem[],
  name: string,
  type: string,
  parentId: string
): ISequenceContainer {
  const containerId = getNinaId(`area-${name}`);
  
  return {
    $id: containerId,
    $type: type,
    Name: name,
    Strategy: {
      $type: 'NINA.Sequencer.Container.ExecutionStrategy.SequentialStrategy, NINA.Sequencer',
    },
    IsExpanded: true,
    Items: {
      $id: getNinaId(`${name}-items`),
      $type: 'System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.SequenceItem.ISequenceItem, NINA.Sequencer]], System.ObjectModel',
      $values: items.map(item => convertEditorItemToNINA(item, containerId)),
    },
    Conditions: {
      $id: getNinaId(`${name}-conditions`),
      $type: 'System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Conditions.ISequenceCondition, NINA.Sequencer]], System.ObjectModel',
      $values: [],
    },
    Triggers: {
      $id: getNinaId(`${name}-triggers`),
      $type: 'System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Trigger.ISequenceTrigger, NINA.Sequencer]], System.ObjectModel',
      $values: [],
    },
    Parent: { $ref: parentId },
  };
}

function convertEditorItemToNINA(item: EditorSequenceItem, parentId: string): ISequenceItem {
  const itemId = getNinaId(item.id);
  const isContainer = isContainerType(item.type);
  
  // Base item properties
  const baseItem: ISequenceItem = {
    $id: itemId,
    $type: item.type,
    Name: item.name,
    Parent: { $ref: parentId },
    ...item.data,
  };
  
  // Handle containers
  if (isContainer && item.items) {
    const container = baseItem as ISequenceContainer;
    
    // Determine strategy based on type
    const strategyType = item.type.includes('Parallel') 
      ? 'NINA.Sequencer.Container.ExecutionStrategy.ParallelStrategy, NINA.Sequencer'
      : 'NINA.Sequencer.Container.ExecutionStrategy.SequentialStrategy, NINA.Sequencer';
    
    container.Strategy = { $type: strategyType };
    container.IsExpanded = item.isExpanded ?? true;
    
    container.Items = {
      $id: getNinaId(`${item.id}-items`),
      $type: 'System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.SequenceItem.ISequenceItem, NINA.Sequencer]], System.ObjectModel',
      $values: item.items.map(child => convertEditorItemToNINA(child, itemId)),
    };
    
    container.Conditions = {
      $id: getNinaId(`${item.id}-conditions`),
      $type: 'System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Conditions.ISequenceCondition, NINA.Sequencer]], System.ObjectModel',
      $values: (item.conditions || []).map(c => convertEditorConditionToNINA(c, itemId)),
    };
    
    container.Triggers = {
      $id: getNinaId(`${item.id}-triggers`),
      $type: 'System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Trigger.ISequenceTrigger, NINA.Sequencer]], System.ObjectModel',
      $values: (item.triggers || []).map(t => convertEditorTriggerToNINA(t, itemId)),
    };
    
    // Handle DeepSkyObjectContainer target
    if (item.type === 'NINA.Sequencer.Container.DeepSkyObjectContainer, NINA.Sequencer') {
      const dsoContainer = container as IDeepSkyObjectContainer;
      const targetData = item.data.Target as EditorTarget | undefined;
      
      if (targetData) {
        dsoContainer.Target = convertEditorTargetToNINA(targetData);
      }
    }
    
    return container;
  }
  
  // Handle Binning for exposure items
  if (item.data.Binning) {
    const binning = item.data.Binning as { X: number; Y: number };
    (baseItem as unknown as Record<string, unknown>).Binning = {
      $id: getNinaId(`${item.id}-binning`),
      $type: 'NINA.Core.Model.Equipment.BinningMode, NINA.Core',
      X: binning.X,
      Y: binning.Y,
    } as BinningMode;
  }
  
  // Handle Coordinates
  if (item.data.Coordinates) {
    const coords = item.data.Coordinates as { 
      RAHours: number; RAMinutes: number; RASeconds: number;
      DecDegrees: number; DecMinutes: number; DecSeconds: number;
    };
    (baseItem as unknown as Record<string, unknown>).Coordinates = {
      $id: getNinaId(`${item.id}-coords`),
      $type: 'NINA.Astrometry.InputCoordinates, NINA.Astrometry',
      ...coords,
    } as InputCoordinates;
  }
  
  return baseItem;
}

function convertEditorConditionToNINA(condition: EditorCondition, parentId: string): ISequenceCondition {
  return {
    $id: getNinaId(condition.id),
    $type: condition.type,
    Name: condition.name,
    Parent: { $ref: parentId },
    ...condition.data,
  };
}

function convertEditorTriggerToNINA(trigger: EditorTrigger, parentId: string): ISequenceTrigger {
  const triggerId = getNinaId(trigger.id);
  
  // Create TriggerRunner container
  const triggerRunner = {
    $id: getNinaId(`${trigger.id}-runner`),
    $type: 'NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer',
    Name: null,
    Strategy: {
      $type: 'NINA.Sequencer.Container.ExecutionStrategy.SequentialStrategy, NINA.Sequencer',
    },
    IsExpanded: true,
    Items: {
      $id: getNinaId(`${trigger.id}-runner-items`),
      $type: 'System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.SequenceItem.ISequenceItem, NINA.Sequencer]], System.ObjectModel',
      $values: (trigger.triggerItems || []).map(item => 
        convertEditorItemToNINA(item, getNinaId(`${trigger.id}-runner`))
      ),
    },
    Conditions: {
      $id: getNinaId(`${trigger.id}-runner-conditions`),
      $type: 'System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Conditions.ISequenceCondition, NINA.Sequencer]], System.ObjectModel',
      $values: [],
    },
    Triggers: {
      $id: getNinaId(`${trigger.id}-runner-triggers`),
      $type: 'System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Trigger.ISequenceTrigger, NINA.Sequencer]], System.ObjectModel',
      $values: [],
    },
    Parent: null,
  };
  
  return {
    $id: triggerId,
    $type: trigger.type,
    Name: trigger.name,
    Parent: { $ref: parentId },
    TriggerRunner: triggerRunner,
    ...trigger.data,
  };
}

function convertEditorTargetToNINA(target: EditorTarget): InputTarget {
  return {
    $id: getNinaId(`target-${target.name}`),
    $type: 'NINA.Astrometry.InputTarget, NINA.Astrometry',
    Expanded: true,
    TargetName: target.name,
    PositionAngle: target.rotation,
    Rotation: target.rotation,
    InputCoordinates: {
      $id: getNinaId(`target-${target.name}-coords`),
      $type: 'NINA.Astrometry.InputCoordinates, NINA.Astrometry',
      RAHours: target.ra.hours,
      RAMinutes: target.ra.minutes,
      RASeconds: target.ra.seconds,
      DecDegrees: target.dec.degrees,
      DecMinutes: target.dec.minutes,
      DecSeconds: target.dec.seconds,
      NegativeDec: target.dec.negative,
    },
  };
}

// ============================================================================
// Import from NINA Format
// ============================================================================

export function importFromNINA(jsonString: string): EditorSequence {
  resetIdCounter();
  
  const data = JSON.parse(jsonString);
  
  // Determine if this is a root container or a template
  if (data.$type?.includes('SequenceRootContainer')) {
    return importRootContainer(data as ISequenceRootContainer);
  } else if (data.$type?.includes('Container')) {
    // Single container (template)
    return importTemplate(data as ISequenceContainer);
  }
  
  throw new Error('Invalid NINA sequence format');
}

function importRootContainer(root: ISequenceRootContainer): EditorSequence {
  const items = root.Items?.$values || [];
  
  // NINA root container has 3 items: Start, Target, End areas
  const startItems = items[0] ? convertNINAContainerItems(items[0] as ISequenceContainer) : [];
  const targetItems = items[1] ? convertNINAContainerItems(items[1] as ISequenceContainer) : [];
  const endItems = items[2] ? convertNINAContainerItems(items[2] as ISequenceContainer) : [];
  
  const globalTriggers = (root.Triggers?.$values || []).map(convertNINATriggerToEditor);
  
  return {
    id: generateId(),
    title: root.SequenceTitle || root.Name || 'Imported Sequence',
    startItems,
    targetItems,
    endItems,
    globalTriggers,
  };
}

function importTemplate(container: ISequenceContainer): EditorSequence {
  const items = convertNINAContainerItems(container);
  
  return {
    id: generateId(),
    title: container.Name || 'Imported Template',
    startItems: [],
    targetItems: items,
    endItems: [],
    globalTriggers: [],
  };
}

function convertNINAContainerItems(container: ISequenceContainer): EditorSequenceItem[] {
  const items = container.Items?.$values || [];
  return items.map(convertNINAItemToEditor);
}

function convertNINAItemToEditor(item: ISequenceItem): EditorSequenceItem {
  const definition = getItemDefinition(item.$type);
  const isContainer = isContainerType(item.$type);
  
  // Extract data properties (exclude metadata)
  const excludeKeys = ['$id', '$type', 'Name', 'Parent', 'Items', 'Conditions', 'Triggers', 'Strategy', 'IsExpanded'];
  const data: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(item)) {
    if (!excludeKeys.includes(key)) {
      data[key] = value;
    }
  }
  
  const editorItem: EditorSequenceItem = {
    id: generateId(),
    type: item.$type,
    name: item.Name || definition?.name || 'Unknown',
    category: definition?.category || 'Unknown',
    icon: definition?.icon,
    description: definition?.description,
    status: 'CREATED' as const,
    data,
  };
  
  if (isContainer) {
    const container = item as ISequenceContainer;
    editorItem.isExpanded = container.IsExpanded ?? true;
    editorItem.items = (container.Items?.$values || []).map(convertNINAItemToEditor);
    editorItem.conditions = (container.Conditions?.$values || []).map(convertNINAConditionToEditor);
    editorItem.triggers = (container.Triggers?.$values || []).map(convertNINATriggerToEditor);
    
    // Handle DeepSkyObjectContainer target
    if (item.$type === 'NINA.Sequencer.Container.DeepSkyObjectContainer, NINA.Sequencer') {
      const dsoContainer = item as IDeepSkyObjectContainer;
      if (dsoContainer.Target) {
        editorItem.data.Target = convertNINATargetToEditor(dsoContainer.Target);
      }
    }
  }
  
  return editorItem;
}

function convertNINAConditionToEditor(condition: ISequenceCondition): EditorCondition {
  const definition = getItemDefinition(condition.$type);
  
  // Extract data properties
  const excludeKeys = ['$id', '$type', 'Name', 'Parent'];
  const data: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(condition)) {
    if (!excludeKeys.includes(key)) {
      data[key] = value;
    }
  }
  
  return {
    id: generateId(),
    type: condition.$type,
    name: condition.Name || definition?.name || 'Unknown Condition',
    category: definition?.category || 'Condition',
    icon: definition?.icon,
    data,
  };
}

function convertNINATriggerToEditor(trigger: ISequenceTrigger): EditorTrigger {
  const definition = getItemDefinition(trigger.$type);
  
  // Extract data properties
  const excludeKeys = ['$id', '$type', 'Name', 'Parent', 'TriggerRunner'];
  const data: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(trigger)) {
    if (!excludeKeys.includes(key)) {
      data[key] = value;
    }
  }
  
  const triggerItems = trigger.TriggerRunner?.Items?.$values?.map(convertNINAItemToEditor) || [];
  
  return {
    id: generateId(),
    type: trigger.$type,
    name: trigger.Name || definition?.name || 'Unknown Trigger',
    category: definition?.category || 'Trigger',
    icon: definition?.icon,
    data,
    triggerItems,
  };
}

function convertNINATargetToEditor(target: InputTarget): EditorTarget {
  const coords = target.InputCoordinates;
  
  return {
    name: target.TargetName || '',
    ra: {
      hours: coords?.RAHours || 0,
      minutes: coords?.RAMinutes || 0,
      seconds: coords?.RASeconds || 0,
    },
    dec: {
      degrees: coords?.DecDegrees || 0,
      minutes: coords?.DecMinutes || 0,
      seconds: coords?.DecSeconds || 0,
      negative: coords?.NegativeDec || false,
    },
    rotation: target.PositionAngle || target.Rotation || 0,
  };
}

// ============================================================================
// Template Export (Single Container)
// ============================================================================

export function exportTemplateToNINA(items: EditorSequenceItem[], name: string): string {
  resetNinaIds();
  
  const containerId = getNinaId('template');
  
  const container: ISequenceContainer = {
    $id: containerId,
    $type: 'NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer',
    Name: name,
    Strategy: {
      $type: 'NINA.Sequencer.Container.ExecutionStrategy.SequentialStrategy, NINA.Sequencer',
    },
    IsExpanded: true,
    Items: {
      $id: getNinaId('template-items'),
      $type: 'System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.SequenceItem.ISequenceItem, NINA.Sequencer]], System.ObjectModel',
      $values: items.map(item => convertEditorItemToNINA(item, containerId)),
    },
    Conditions: {
      $id: getNinaId('template-conditions'),
      $type: 'System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Conditions.ISequenceCondition, NINA.Sequencer]], System.ObjectModel',
      $values: [],
    },
    Triggers: {
      $id: getNinaId('template-triggers'),
      $type: 'System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Trigger.ISequenceTrigger, NINA.Sequencer]], System.ObjectModel',
      $values: [],
    },
    Parent: null,
  };
  
  return JSON.stringify(container, null, 2);
}

// ============================================================================
// Validation
// ============================================================================

export function validateNINAJson(jsonString: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.$type) {
      errors.push('Missing $type field');
    }
    
    if (!data.$type?.includes('Container')) {
      errors.push('Root element must be a container type');
    }
    
    // Validate items structure
    if (data.Items && !data.Items.$values) {
      errors.push('Items collection missing $values array');
    }
    
  } catch (e) {
    errors.push(`Invalid JSON: ${(e as Error).message}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
