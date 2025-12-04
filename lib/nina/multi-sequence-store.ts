// NINA Sequence Editor - Multi-Sequence Management Store

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { EditorSequence } from './types';
import { generateId, deepClone } from './utils';

// ============================================================================
// Types
// ============================================================================

export interface SequenceTab {
  id: string;
  sequence: EditorSequence;
  isDirty: boolean;
  filePath?: string;
  lastModified: number;
}

export interface SequenceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'default' | 'custom';
  sequence: EditorSequence;
  createdAt: number;
  updatedAt: number;
}

interface MultiSequenceState {
  // Open sequences (tabs)
  tabs: SequenceTab[];
  activeTabId: string | null;
  
  // Templates
  templates: SequenceTemplate[];
}

interface MultiSequenceActions {
  // Tab management
  addTab: (sequence?: EditorSequence, filePath?: string) => string;
  closeTab: (tabId: string) => void;
  closeOtherTabs: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (tabId: string) => void;
  updateTabSequence: (tabId: string, sequence: EditorSequence) => void;
  setTabDirty: (tabId: string, isDirty: boolean) => void;
  duplicateTab: (tabId: string) => string;
  renameTab: (tabId: string, title: string) => void;
  
  // Template management
  addTemplate: (template: Omit<SequenceTemplate, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTemplate: (templateId: string, updates: Partial<SequenceTemplate>) => void;
  deleteTemplate: (templateId: string) => void;
  applyTemplate: (templateId: string) => string | null;
  saveAsTemplate: (tabId: string, name: string, description: string) => string;
  
  // Utility
  getActiveTab: () => SequenceTab | null;
  getTabById: (tabId: string) => SequenceTab | null;
  hasUnsavedChanges: () => boolean;
}

type MultiSequenceStore = MultiSequenceState & MultiSequenceActions;

// ============================================================================
// Default Templates
// ============================================================================

function createEmptySequence(title: string = 'New Sequence'): EditorSequence {
  return {
    id: generateId(),
    title,
    startItems: [],
    targetItems: [],
    endItems: [],
    globalTriggers: [],
  };
}

// Template definitions - simplified to avoid hydration issues
// Templates are generated with new IDs when applied
interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
}

const templateDefinitions: TemplateDefinition[] = [
  {
    id: 'template-basic-imaging',
    name: 'Basic Imaging Session',
    description: 'Simple setup for single target imaging with cooling, focusing, and guiding',
  },
  {
    id: 'template-startup',
    name: 'Startup Routine',
    description: 'Equipment initialization and preparation',
  },
  {
    id: 'template-shutdown',
    name: 'Shutdown Routine',
    description: 'Safe equipment shutdown and parking',
  },
  {
    id: 'template-flat-capture',
    name: 'Flat Frame Capture',
    description: 'Automated flat frame acquisition sequence',
  },
];

// Generate template sequence on demand
function generateTemplateSequence(templateId: string): EditorSequence {
  switch (templateId) {
    case 'template-basic-imaging':
      return {
        id: generateId(),
        title: 'Basic Imaging Session',
        startItems: [
          { id: generateId(), type: 'CoolCamera', name: 'Cool Camera', category: 'Camera', icon: 'Thermometer', status: 'CREATED', data: { Temperature: -10, Duration: 600 } },
          { id: generateId(), type: 'UnparkScope', name: 'Unpark Telescope', category: 'Telescope', icon: 'Telescope', status: 'CREATED', data: {} },
          { id: generateId(), type: 'StartGuiding', name: 'Start Guiding', category: 'Guider', icon: 'Crosshair', status: 'CREATED', data: { ForceCalibration: false } },
        ],
        targetItems: [
          {
            id: generateId(),
            type: 'DeepSkyObjectContainer',
            name: 'Deep Sky Object',
            category: 'Container',
            icon: 'Star',
            status: 'CREATED',
            isExpanded: true,
            data: { Target: { name: 'M31', ra: { hours: 0, minutes: 42, seconds: 44 }, dec: { degrees: 41, minutes: 16, seconds: 9, negative: false }, rotation: 0 } },
            items: [
              { id: generateId(), type: 'TakeManyExposures', name: 'Take Many Exposures', category: 'Imaging', icon: 'Camera', status: 'CREATED', data: { ExposureTime: 300, Gain: 100, Offset: 10, ImageType: 'LIGHT', TotalExposureCount: 20, Binning: { X: 1, Y: 1 } } },
            ],
            conditions: [{ id: generateId(), type: 'LoopCondition', name: 'Loop', category: 'Loop', data: { Iterations: 20, CompletedIterations: 0 } }],
            triggers: [],
          },
        ],
        endItems: [
          { id: generateId(), type: 'StopGuiding', name: 'Stop Guiding', category: 'Guider', icon: 'Crosshair', status: 'CREATED', data: {} },
          { id: generateId(), type: 'WarmCamera', name: 'Warm Camera', category: 'Camera', icon: 'Thermometer', status: 'CREATED', data: { Duration: 600 } },
          { id: generateId(), type: 'ParkScope', name: 'Park Telescope', category: 'Telescope', icon: 'Telescope', status: 'CREATED', data: {} },
        ],
        globalTriggers: [],
      };
    case 'template-startup':
      return {
        id: generateId(),
        title: 'Startup Routine',
        startItems: [
          { id: generateId(), type: 'ConnectEquipment', name: 'Connect Equipment', category: 'Connect', icon: 'Plug', status: 'CREATED', data: {} },
          { id: generateId(), type: 'CoolCamera', name: 'Cool Camera', category: 'Camera', icon: 'Thermometer', status: 'CREATED', data: { Temperature: -10, Duration: 600 } },
          { id: generateId(), type: 'UnparkScope', name: 'Unpark Telescope', category: 'Telescope', icon: 'Telescope', status: 'CREATED', data: {} },
          { id: generateId(), type: 'OpenDomeShutter', name: 'Open Dome Shutter', category: 'Dome', icon: 'Home', status: 'CREATED', data: {} },
        ],
        targetItems: [],
        endItems: [],
        globalTriggers: [],
      };
    case 'template-shutdown':
      return {
        id: generateId(),
        title: 'Shutdown Routine',
        startItems: [],
        targetItems: [],
        endItems: [
          { id: generateId(), type: 'StopGuiding', name: 'Stop Guiding', category: 'Guider', icon: 'Crosshair', status: 'CREATED', data: {} },
          { id: generateId(), type: 'WarmCamera', name: 'Warm Camera', category: 'Camera', icon: 'Thermometer', status: 'CREATED', data: { Duration: 600 } },
          { id: generateId(), type: 'ParkScope', name: 'Park Telescope', category: 'Telescope', icon: 'Telescope', status: 'CREATED', data: {} },
          { id: generateId(), type: 'CloseDomeShutter', name: 'Close Dome Shutter', category: 'Dome', icon: 'Home', status: 'CREATED', data: {} },
          { id: generateId(), type: 'ParkDome', name: 'Park Dome', category: 'Dome', icon: 'Home', status: 'CREATED', data: {} },
          { id: generateId(), type: 'DisconnectEquipment', name: 'Disconnect Equipment', category: 'Connect', icon: 'Plug', status: 'CREATED', data: {} },
        ],
        globalTriggers: [],
      };
    case 'template-flat-capture':
      return {
        id: generateId(),
        title: 'Flat Frame Capture',
        startItems: [
          { id: generateId(), type: 'SetBrightness', name: 'Set Panel Brightness', category: 'FlatDevice', icon: 'Sun', status: 'CREATED', data: { Brightness: 50 } },
          { id: generateId(), type: 'ToggleLight', name: 'Turn On Light', category: 'FlatDevice', icon: 'Lightbulb', status: 'CREATED', data: { OnOff: true } },
        ],
        targetItems: [
          {
            id: generateId(),
            type: 'SequentialContainer',
            name: 'Flat Frames',
            category: 'Container',
            icon: 'Layers',
            status: 'CREATED',
            isExpanded: true,
            data: {},
            items: [
              { id: generateId(), type: 'TakeManyExposures', name: 'Take Flat Frames', category: 'Imaging', icon: 'Camera', status: 'CREATED', data: { ExposureTime: 2, Gain: 0, Offset: 10, ImageType: 'FLAT', TotalExposureCount: 30, Binning: { X: 1, Y: 1 } } },
            ],
            conditions: [],
            triggers: [],
          },
        ],
        endItems: [
          { id: generateId(), type: 'ToggleLight', name: 'Turn Off Light', category: 'FlatDevice', icon: 'Lightbulb', status: 'CREATED', data: { OnOff: false } },
        ],
        globalTriggers: [],
      };
    default:
      return createEmptySequence();
  }
}

// Create default templates with empty sequences (sequences are generated on apply)
const defaultTemplates: SequenceTemplate[] = templateDefinitions.map(def => ({
  id: def.id,
  name: def.name,
  description: def.description,
  category: 'default' as const,
  sequence: {
    id: def.id + '-seq',
    title: def.name,
    startItems: [],
    targetItems: [],
    endItems: [],
    globalTriggers: [],
  },
  createdAt: 0,
  updatedAt: 0,
}));

// ============================================================================
// Initial State
// ============================================================================

const initialState: MultiSequenceState = {
  tabs: [],
  activeTabId: null,
  templates: defaultTemplates,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useMultiSequenceStore = create<MultiSequenceStore>()(
  immer((set, get) => ({
    ...initialState,

      // ========================================================================
      // Tab Management
      // ========================================================================

      addTab: (sequence, filePath) => {
        const newSequence = sequence || createEmptySequence();
        const tabId = generateId();
        
        set(state => {
          state.tabs.push({
            id: tabId,
            sequence: newSequence,
            isDirty: false,
            filePath,
            lastModified: Date.now(),
          });
          state.activeTabId = tabId;
        });
        
        return tabId;
      },

      closeTab: (tabId) => {
        set(state => {
          const index = state.tabs.findIndex(t => t.id === tabId);
          if (index === -1) return;
          
          state.tabs.splice(index, 1);
          
          // Update active tab
          if (state.activeTabId === tabId) {
            if (state.tabs.length > 0) {
              // Select the tab at the same position or the last one
              const newIndex = Math.min(index, state.tabs.length - 1);
              state.activeTabId = state.tabs[newIndex].id;
            } else {
              state.activeTabId = null;
            }
          }
        });
      },

      closeOtherTabs: (tabId) => {
        set(state => {
          state.tabs = state.tabs.filter(t => t.id === tabId);
          state.activeTabId = tabId;
        });
      },

      closeAllTabs: () => {
        set(state => {
          state.tabs = [];
          state.activeTabId = null;
        });
      },

      setActiveTab: (tabId) => {
        set(state => {
          if (state.tabs.some(t => t.id === tabId)) {
            state.activeTabId = tabId;
          }
        });
      },

      updateTabSequence: (tabId, sequence) => {
        set(state => {
          const tab = state.tabs.find(t => t.id === tabId);
          if (tab) {
            tab.sequence = sequence;
            tab.lastModified = Date.now();
          }
        });
      },

      setTabDirty: (tabId, isDirty) => {
        set(state => {
          const tab = state.tabs.find(t => t.id === tabId);
          if (tab) {
            tab.isDirty = isDirty;
          }
        });
      },

      duplicateTab: (tabId) => {
        const { tabs, addTab } = get();
        const tab = tabs.find(t => t.id === tabId);
        if (!tab) return '';
        
        const newSequence = deepClone(tab.sequence);
        newSequence.id = generateId();
        newSequence.title = `${tab.sequence.title} (Copy)`;
        
        return addTab(newSequence);
      },

      renameTab: (tabId, title) => {
        set(state => {
          const tab = state.tabs.find(t => t.id === tabId);
          if (tab) {
            tab.sequence.title = title;
            tab.isDirty = true;
            tab.lastModified = Date.now();
          }
        });
      },

      // ========================================================================
      // Template Management
      // ========================================================================

      addTemplate: (template) => {
        const templateId = generateId();
        const now = Date.now();
        
        set(state => {
          state.templates.push({
            ...template,
            id: templateId,
            createdAt: now,
            updatedAt: now,
          });
        });
        
        return templateId;
      },

      updateTemplate: (templateId, updates) => {
        set(state => {
          const template = state.templates.find(t => t.id === templateId);
          if (template && template.category === 'custom') {
            Object.assign(template, updates, { updatedAt: Date.now() });
          }
        });
      },

      deleteTemplate: (templateId) => {
        set(state => {
          const index = state.templates.findIndex(t => t.id === templateId);
          if (index !== -1 && state.templates[index].category === 'custom') {
            state.templates.splice(index, 1);
          }
        });
      },

      applyTemplate: (templateId) => {
        const { templates, addTab } = get();
        const template = templates.find(t => t.id === templateId);
        if (!template) return null;
        
        // For default templates, generate fresh sequence with new IDs
        // For custom templates, clone the saved sequence
        const newSequence = template.category === 'default' 
          ? generateTemplateSequence(templateId)
          : deepClone(template.sequence);
        newSequence.id = generateId();
        
        return addTab(newSequence);
      },

      saveAsTemplate: (tabId, name, description) => {
        const { tabs, addTemplate } = get();
        const tab = tabs.find(t => t.id === tabId);
        if (!tab) return '';
        
        return addTemplate({
          name,
          description,
          category: 'custom',
          sequence: deepClone(tab.sequence),
        });
      },

      // ========================================================================
      // Utility
      // ========================================================================

      getActiveTab: () => {
        const { tabs, activeTabId } = get();
        return tabs.find(t => t.id === activeTabId) || null;
      },

      getTabById: (tabId) => {
        const { tabs } = get();
        return tabs.find(t => t.id === tabId) || null;
      },

      hasUnsavedChanges: () => {
        const { tabs } = get();
        return tabs.some(t => t.isDirty);
      },
    }))
);

// ============================================================================
// Selectors
// ============================================================================

export const selectTabs = (state: MultiSequenceStore) => state.tabs;
export const selectActiveTabId = (state: MultiSequenceStore) => state.activeTabId;
export const selectTemplates = (state: MultiSequenceStore) => state.templates;
export const selectDefaultTemplates = (state: MultiSequenceStore) => 
  state.templates.filter(t => t.category === 'default');
export const selectCustomTemplates = (state: MultiSequenceStore) => 
  state.templates.filter(t => t.category === 'custom');
