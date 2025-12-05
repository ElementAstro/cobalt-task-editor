// NINA Sequence Editor - Zustand Store

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { 
  EditorSequenceItem, 
  EditorCondition, 
  EditorTrigger,
  EditorSequence,
} from './types';
import { 
  generateId, 
  findItemById,
  cloneSequenceItem,
  deepClone,
} from './utils';

// ============================================================================
// State Types
// ============================================================================

interface HistoryEntry {
  sequence: EditorSequence;
  timestamp: number;
}

interface SequenceEditorState {
  // Current sequence
  sequence: EditorSequence;
  
  // Selection state
  selectedItemId: string | null;
  selectedConditionId: string | null;
  selectedTriggerId: string | null;
  
  // UI state
  activeArea: 'start' | 'target' | 'end';
  toolboxExpanded: boolean;
  propertyPanelExpanded: boolean;
  toolboxWidth: number;
  propertyPanelWidth: number;
  searchQuery: string;
  
  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;
  
  // Dirty state
  isDirty: boolean;
}

interface SequenceEditorActions {
  // Sequence management
  newSequence: () => void;
  loadSequence: (sequence: EditorSequence) => void;
  setSequenceTitle: (title: string) => void;
  
  // Item operations
  addItem: (area: 'start' | 'target' | 'end', item: EditorSequenceItem, parentId?: string | null, index?: number) => void;
  updateItem: (itemId: string, updates: Partial<EditorSequenceItem>) => void;
  deleteItem: (itemId: string) => void;
  moveItem: (itemId: string, targetArea: 'start' | 'target' | 'end', targetParentId: string | null, targetIndex: number) => void;
  duplicateItem: (itemId: string) => void;
  
  // Condition operations
  addCondition: (containerId: string, condition: EditorCondition) => void;
  updateCondition: (containerId: string, conditionId: string, updates: Partial<EditorCondition>) => void;
  deleteCondition: (containerId: string, conditionId: string) => void;
  
  // Trigger operations
  addTrigger: (containerId: string, trigger: EditorTrigger) => void;
  updateTrigger: (containerId: string, triggerId: string, updates: Partial<EditorTrigger>) => void;
  deleteTrigger: (containerId: string, triggerId: string) => void;
  addGlobalTrigger: (trigger: EditorTrigger) => void;
  deleteGlobalTrigger: (triggerId: string) => void;
  
  // Selection
  selectItem: (itemId: string | null) => void;
  selectCondition: (conditionId: string | null) => void;
  selectTrigger: (triggerId: string | null) => void;
  
  // UI state
  setActiveArea: (area: 'start' | 'target' | 'end') => void;
  setToolboxExpanded: (expanded: boolean) => void;
  setPropertyPanelExpanded: (expanded: boolean) => void;
  setToolboxWidth: (width: number) => void;
  setPropertyPanelWidth: (width: number) => void;
  setSearchQuery: (query: string) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // Utility
  getItemById: (itemId: string) => EditorSequenceItem | null;
  clearDirty: () => void;
}

type SequenceEditorStore = SequenceEditorState & SequenceEditorActions;

// ============================================================================
// Initial State
// ============================================================================

function createEmptySequence(): EditorSequence {
  return {
    id: generateId(),
    title: 'New Sequence',
    startItems: [],
    targetItems: [],
    endItems: [],
    globalTriggers: [],
  };
}

const initialState: SequenceEditorState = {
  sequence: createEmptySequence(),
  selectedItemId: null,
  selectedConditionId: null,
  selectedTriggerId: null,
  activeArea: 'target',
  toolboxExpanded: true,
  propertyPanelExpanded: true,
  toolboxWidth: 300,
  propertyPanelWidth: 320,
  searchQuery: '',
  history: [],
  historyIndex: -1,
  isDirty: false,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useSequenceEditorStore = create<SequenceEditorStore>()(
  immer((set, get) => ({
    ...initialState,
    
    // ========================================================================
    // Sequence Management
    // ========================================================================
    
    newSequence: () => {
      set(state => {
        state.sequence = createEmptySequence();
        state.selectedItemId = null;
        state.selectedConditionId = null;
        state.selectedTriggerId = null;
        state.history = [];
        state.historyIndex = -1;
        state.isDirty = false;
      });
    },
    
    loadSequence: (sequence) => {
      set(state => {
        state.sequence = sequence;
        state.selectedItemId = null;
        state.selectedConditionId = null;
        state.selectedTriggerId = null;
        state.history = [];
        state.historyIndex = -1;
        state.isDirty = false;
      });
    },
    
    setSequenceTitle: (title) => {
      set(state => {
        state.sequence.title = title;
        state.isDirty = true;
      });
    },
    
    // ========================================================================
    // Item Operations
    // ========================================================================
    
    addItem: (area, item, parentId = null, index) => {
      get().saveToHistory();
      
      set(state => {
        const items = area === 'start' ? state.sequence.startItems :
                      area === 'target' ? state.sequence.targetItems :
                      state.sequence.endItems;
        
        if (parentId) {
          // Add to parent container
          const addToParent = (items: EditorSequenceItem[]): boolean => {
            for (const i of items) {
              if (i.id === parentId && i.items) {
                const idx = index !== undefined ? index : i.items.length;
                i.items.splice(idx, 0, item);
                return true;
              }
              if (i.items && addToParent(i.items)) return true;
            }
            return false;
          };
          addToParent(items);
        } else {
          // Add to root level
          const idx = index !== undefined ? index : items.length;
          items.splice(idx, 0, item);
        }
        
        state.isDirty = true;
      });
    },
    
    updateItem: (itemId, updates) => {
      get().saveToHistory();
      
      set(state => {
        const updateInItems = (items: EditorSequenceItem[]): boolean => {
          for (const item of items) {
            if (item.id === itemId) {
              Object.assign(item, updates);
              return true;
            }
            if (item.items && updateInItems(item.items)) return true;
          }
          return false;
        };
        
        const updated = updateInItems(state.sequence.startItems) ||
          updateInItems(state.sequence.targetItems) ||
          updateInItems(state.sequence.endItems);
        if (!updated) console.warn('Item not found for update:', itemId);
        
        state.isDirty = true;
      });
    },
    
    deleteItem: (itemId) => {
      const itemToDelete = get().getItemById(itemId);
      const affectedIds = {
        items: new Set<string>(),
        conditions: new Set<string>(),
        triggers: new Set<string>(),
      };

      const collectIds = (item: EditorSequenceItem | null) => {
        if (!item) return;
        affectedIds.items.add(item.id);
        item.conditions?.forEach((c) => affectedIds.conditions.add(c.id));
        item.triggers?.forEach((t) => affectedIds.triggers.add(t.id));
        item.items?.forEach(collectIds);
      };

      collectIds(itemToDelete || null);

      get().saveToHistory();
      
      set(state => {
        const deleteFromItems = (items: EditorSequenceItem[]): EditorSequenceItem[] => {
          return items.filter(item => {
            if (item.id === itemId) return false;
            if (item.items) {
              item.items = deleteFromItems(item.items);
            }
            return true;
          });
        };
        
        state.sequence.startItems = deleteFromItems(state.sequence.startItems);
        state.sequence.targetItems = deleteFromItems(state.sequence.targetItems);
        state.sequence.endItems = deleteFromItems(state.sequence.endItems);
        
        if (state.selectedItemId && affectedIds.items.has(state.selectedItemId)) {
          state.selectedItemId = null;
        }
        if (state.selectedConditionId && affectedIds.conditions.has(state.selectedConditionId)) {
          state.selectedConditionId = null;
        }
        if (state.selectedTriggerId && affectedIds.triggers.has(state.selectedTriggerId)) {
          state.selectedTriggerId = null;
        }
        
        state.isDirty = true;
      });
    },
    
    moveItem: (itemId, targetArea, targetParentId, targetIndex) => {
      get().saveToHistory();
      
      set(state => {
        // Find and remove the item
        let movedItem: EditorSequenceItem | null = null;
        
        const removeFromItems = (items: EditorSequenceItem[]): EditorSequenceItem[] => {
          return items.filter(item => {
            if (item.id === itemId) {
              movedItem = deepClone(item);
              return false;
            }
            if (item.items) {
              item.items = removeFromItems(item.items);
            }
            return true;
          });
        };
        
        state.sequence.startItems = removeFromItems(state.sequence.startItems);
        state.sequence.targetItems = removeFromItems(state.sequence.targetItems);
        state.sequence.endItems = removeFromItems(state.sequence.endItems);
        
        if (!movedItem) return;
        
        // Add to new location
        const targetItems = targetArea === 'start' ? state.sequence.startItems :
                           targetArea === 'target' ? state.sequence.targetItems :
                           state.sequence.endItems;
        
        if (targetParentId) {
          const addToParent = (items: EditorSequenceItem[]): boolean => {
            for (const item of items) {
              if (item.id === targetParentId && item.items) {
                item.items.splice(targetIndex, 0, movedItem!);
                return true;
              }
              if (item.items && addToParent(item.items)) return true;
            }
            return false;
          };
          addToParent(targetItems);
        } else {
          targetItems.splice(targetIndex, 0, movedItem);
        }
        
        state.isDirty = true;
      });
    },
    
    duplicateItem: (itemId) => {
      const item = get().getItemById(itemId);
      if (!item) return;
      
      // Find which area the item is in
      let area: 'start' | 'target' | 'end' = 'target';
      if (findItemById(get().sequence.startItems, itemId)) area = 'start';
      else if (findItemById(get().sequence.endItems, itemId)) area = 'end';
      
      const cloned = cloneSequenceItem(item);
      cloned.name = `${cloned.name} (Copy)`;
      
      get().addItem(area, cloned);
    },
    
    // ========================================================================
    // Condition Operations
    // ========================================================================
    
    addCondition: (containerId, condition) => {
      get().saveToHistory();
      
      set(state => {
        const addToContainer = (items: EditorSequenceItem[]): boolean => {
          for (const item of items) {
            if (item.id === containerId && item.conditions) {
              item.conditions.push(condition);
              return true;
            }
            if (item.items && addToContainer(item.items)) return true;
          }
          return false;
        };
        
        const added = addToContainer(state.sequence.startItems) ||
          addToContainer(state.sequence.targetItems) ||
          addToContainer(state.sequence.endItems);
        if (!added) console.warn('Container not found for condition:', containerId);
        
        state.isDirty = true;
      });
    },
    
    updateCondition: (containerId, conditionId, updates) => {
      get().saveToHistory();
      
      set(state => {
        const updateInContainer = (items: EditorSequenceItem[]): boolean => {
          for (const item of items) {
            if (item.id === containerId && item.conditions) {
              const condition = item.conditions.find(c => c.id === conditionId);
              if (condition) {
                Object.assign(condition, updates);
                return true;
              }
            }
            if (item.items && updateInContainer(item.items)) return true;
          }
          return false;
        };
        
        const updated = updateInContainer(state.sequence.startItems) ||
          updateInContainer(state.sequence.targetItems) ||
          updateInContainer(state.sequence.endItems);
        if (!updated) console.warn('Condition not found for update:', conditionId);
        
        state.isDirty = true;
      });
    },
    
    deleteCondition: (containerId, conditionId) => {
      get().saveToHistory();
      
      set(state => {
        const deleteFromContainer = (items: EditorSequenceItem[]): boolean => {
          for (const item of items) {
            if (item.id === containerId && item.conditions) {
              item.conditions = item.conditions.filter(c => c.id !== conditionId);
              return true;
            }
            if (item.items && deleteFromContainer(item.items)) return true;
          }
          return false;
        };
        
        const deleted = deleteFromContainer(state.sequence.startItems) ||
          deleteFromContainer(state.sequence.targetItems) ||
          deleteFromContainer(state.sequence.endItems);
        if (!deleted) console.warn('Condition not found for deletion:', conditionId);
        
        if (state.selectedConditionId === conditionId) {
          state.selectedConditionId = null;
        }
        
        state.isDirty = true;
      });
    },
    
    // ========================================================================
    // Trigger Operations
    // ========================================================================
    
    addTrigger: (containerId, trigger) => {
      get().saveToHistory();
      
      set(state => {
        const addToContainer = (items: EditorSequenceItem[]): boolean => {
          for (const item of items) {
            if (item.id === containerId && item.triggers) {
              item.triggers.push(trigger);
              return true;
            }
            if (item.items && addToContainer(item.items)) return true;
          }
          return false;
        };
        
        const added = addToContainer(state.sequence.startItems) ||
          addToContainer(state.sequence.targetItems) ||
          addToContainer(state.sequence.endItems);
        if (!added) console.warn('Container not found for trigger:', containerId);
        
        state.isDirty = true;
      });
    },
    
    updateTrigger: (containerId, triggerId, updates) => {
      get().saveToHistory();
      
      set(state => {
        const updateInContainer = (items: EditorSequenceItem[]): boolean => {
          for (const item of items) {
            if (item.id === containerId && item.triggers) {
              const trigger = item.triggers.find(t => t.id === triggerId);
              if (trigger) {
                Object.assign(trigger, updates);
                return true;
              }
            }
            if (item.items && updateInContainer(item.items)) return true;
          }
          return false;
        };
        
        const updated = updateInContainer(state.sequence.startItems) ||
          updateInContainer(state.sequence.targetItems) ||
          updateInContainer(state.sequence.endItems);
        if (!updated) console.warn('Trigger not found for update:', triggerId);
        
        state.isDirty = true;
      });
    },
    
    deleteTrigger: (containerId, triggerId) => {
      get().saveToHistory();
      
      set(state => {
        const deleteFromContainer = (items: EditorSequenceItem[]): boolean => {
          for (const item of items) {
            if (item.id === containerId && item.triggers) {
              item.triggers = item.triggers.filter(t => t.id !== triggerId);
              return true;
            }
            if (item.items && deleteFromContainer(item.items)) return true;
          }
          return false;
        };
        
        const deleted = deleteFromContainer(state.sequence.startItems) ||
          deleteFromContainer(state.sequence.targetItems) ||
          deleteFromContainer(state.sequence.endItems);
        if (!deleted) console.warn('Trigger not found for deletion:', triggerId);
        
        if (state.selectedTriggerId === triggerId) {
          state.selectedTriggerId = null;
        }
        
        state.isDirty = true;
      });
    },
    
    addGlobalTrigger: (trigger) => {
      get().saveToHistory();
      
      set(state => {
        state.sequence.globalTriggers.push(trigger);
        state.isDirty = true;
      });
    },
    
    deleteGlobalTrigger: (triggerId) => {
      get().saveToHistory();
      
      set(state => {
        state.sequence.globalTriggers = state.sequence.globalTriggers.filter(
          t => t.id !== triggerId
        );
        
        if (state.selectedTriggerId === triggerId) {
          state.selectedTriggerId = null;
        }
        
        state.isDirty = true;
      });
    },
    
    // ========================================================================
    // Selection
    // ========================================================================
    
    selectItem: (itemId) => {
      set(state => {
        state.selectedItemId = itemId;
        state.selectedConditionId = null;
        state.selectedTriggerId = null;
      });
    },
    
    selectCondition: (conditionId) => {
      set(state => {
        state.selectedConditionId = conditionId;
        state.selectedTriggerId = null;
      });
    },
    
    selectTrigger: (triggerId) => {
      set(state => {
        state.selectedTriggerId = triggerId;
        state.selectedConditionId = null;
      });
    },
    
    // ========================================================================
    // UI State
    // ========================================================================
    
    setActiveArea: (area) => {
      set(state => {
        state.activeArea = area;
      });
    },
    
    setToolboxExpanded: (expanded) => {
      set(state => {
        state.toolboxExpanded = expanded;
      });
    },
    
    setPropertyPanelExpanded: (expanded) => {
      set(state => {
        state.propertyPanelExpanded = expanded;
      });
    },

    setToolboxWidth: (width) => {
      set(state => {
        state.toolboxWidth = width;
      });
    },

    setPropertyPanelWidth: (width) => {
      set(state => {
        state.propertyPanelWidth = width;
      });
    },
    
    setSearchQuery: (query) => {
      set(state => {
        state.searchQuery = query;
      });
    },
    
    // ========================================================================
    // History
    // ========================================================================
    
    undo: () => {
      set(state => {
        if (state.historyIndex > 0) {
          state.historyIndex--;
          state.sequence = deepClone(state.history[state.historyIndex].sequence);
        }
      });
    },
    
    redo: () => {
      set(state => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++;
          state.sequence = deepClone(state.history[state.historyIndex].sequence);
        }
      });
    },
    
    saveToHistory: () => {
      set(state => {
        // Remove any future history if we're not at the end
        if (state.historyIndex < state.history.length - 1) {
          state.history = state.history.slice(0, state.historyIndex + 1);
        }
        
        // Add current state to history
        state.history.push({
          sequence: deepClone(state.sequence),
          timestamp: Date.now(),
        });
        
        // Limit history size
        if (state.history.length > 50) {
          state.history = state.history.slice(-50);
        }
        
        state.historyIndex = state.history.length - 1;
      });
    },
    
    // ========================================================================
    // Utility
    // ========================================================================
    
    getItemById: (itemId) => {
      const { sequence } = get();
      return findItemById(sequence.startItems, itemId) ||
             findItemById(sequence.targetItems, itemId) ||
             findItemById(sequence.endItems, itemId);
    },
    
    clearDirty: () => {
      set(state => {
        state.isDirty = false;
      });
    },
  }))
);

// ============================================================================
// Selectors
// ============================================================================

export const selectSequence = (state: SequenceEditorStore) => state.sequence;
export const selectSelectedItem = (state: SequenceEditorStore) => {
  if (!state.selectedItemId) return null;
  return state.getItemById(state.selectedItemId);
};
export const selectIsDirty = (state: SequenceEditorStore) => state.isDirty;
export const selectCanUndo = (state: SequenceEditorStore) => state.historyIndex > 0;
export const selectCanRedo = (state: SequenceEditorStore) => state.historyIndex < state.history.length - 1;
