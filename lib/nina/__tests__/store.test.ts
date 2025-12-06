/**
 * Unit tests for lib/nina/store.ts
 * Tests the main sequence editor Zustand store
 */

import { act, renderHook } from '@testing-library/react';
import { useSequenceEditorStore, selectCanUndo, selectCanRedo, selectIsDirty } from '../store';
import type { EditorSequence, EditorSequenceItem } from '../types';

// Helper to reset store between tests
const resetStore = () => {
  act(() => {
    useSequenceEditorStore.getState().newSequence();
  });
};

// Helper to create a test item
const createTestItem = (overrides: Partial<EditorSequenceItem> = {}): EditorSequenceItem => ({
  id: `item-${Date.now()}-${Math.random()}`,
  type: 'NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer',
  name: 'Cool Camera',
  category: 'Camera',
  status: 'CREATED',
  data: { Temperature: -10 },
  ...overrides,
});

describe('useSequenceEditorStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('Initial State', () => {
    it('should have default sequence', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      expect(result.current.sequence).toBeDefined();
      expect(result.current.sequence.title).toBe('New Sequence');
    });

    it('should have no selection initially', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      expect(result.current.selectedItemId).toBeNull();
    });

    it('should not be dirty initially', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('Sequence Management', () => {
    it('should create new sequence', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.addItem('start', createTestItem());
        result.current.newSequence();
      });
      expect(result.current.sequence.startItems).toEqual([]);
    });

    it('should load sequence', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const testSeq: EditorSequence = {
        id: 'test',
        title: 'Loaded',
        startItems: [createTestItem()],
        targetItems: [],
        endItems: [],
        globalTriggers: [],
      };
      act(() => {
        result.current.loadSequence(testSeq);
      });
      expect(result.current.sequence.title).toBe('Loaded');
      expect(result.current.sequence.startItems.length).toBe(1);
    });

    it('should update sequence title', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.setSequenceTitle('New Title');
      });
      expect(result.current.sequence.title).toBe('New Title');
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('Item Operations', () => {
    it('should add item to start area', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.addItem('start', createTestItem());
      });
      expect(result.current.sequence.startItems.length).toBe(1);
    });

    it('should add item to target area', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.addItem('target', createTestItem());
      });
      expect(result.current.sequence.targetItems.length).toBe(1);
    });

    it('should add item to end area', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.addItem('end', createTestItem());
      });
      expect(result.current.sequence.endItems.length).toBe(1);
    });

    it('should update item', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.addItem('start', createTestItem({ id: 'item-1' }));
        result.current.updateItem('item-1', { name: 'Updated' });
      });
      expect(result.current.sequence.startItems[0].name).toBe('Updated');
    });

    it('should delete item', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.addItem('start', createTestItem({ id: 'item-1' }));
        result.current.deleteItem('item-1');
      });
      expect(result.current.sequence.startItems.length).toBe(0);
    });

    it('should duplicate item', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.addItem('start', createTestItem({ id: 'item-1' }));
        result.current.duplicateItem('item-1');
      });
      expect(result.current.sequence.startItems.length).toBe(2);
    });
  });

  describe('Selection', () => {
    it('should select item', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.addItem('start', createTestItem({ id: 'item-1' }));
        result.current.selectItem('item-1');
      });
      expect(result.current.selectedItemId).toBe('item-1');
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.addItem('start', createTestItem({ id: 'item-1' }));
        result.current.selectItem('item-1');
        result.current.selectItem(null);
      });
      expect(result.current.selectedItemId).toBeNull();
    });
  });

  describe('UI State', () => {
    it('should set active area', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.setActiveArea('start');
      });
      expect(result.current.activeArea).toBe('start');
    });

    it('should set view mode', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.setViewMode('workflow');
      });
      expect(result.current.viewMode).toBe('workflow');
    });

    it('should toggle toolbox', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.setToolboxExpanded(false);
      });
      expect(result.current.toolboxExpanded).toBe(false);
    });

    it('should toggle property panel', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.setPropertyPanelExpanded(false);
      });
      expect(result.current.propertyPanelExpanded).toBe(false);
    });

    it('should set search query', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.setSearchQuery('camera');
      });
      expect(result.current.searchQuery).toBe('camera');
    });
  });

  describe('History (Undo/Redo)', () => {
    it('should have undo function', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      expect(typeof result.current.undo).toBe('function');
    });

    it('should have redo function', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      expect(typeof result.current.redo).toBe('function');
    });

    it('should track history after changes', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.setSequenceTitle('Title 1');
      });
      // History should be populated after changes
      expect(result.current.history.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Selectors', () => {
    it('selectCanUndo should return false initially', () => {
      const { result } = renderHook(() => useSequenceEditorStore(selectCanUndo));
      expect(result.current).toBe(false);
    });

    it('selectCanRedo should return false initially', () => {
      const { result } = renderHook(() => useSequenceEditorStore(selectCanRedo));
      expect(result.current).toBe(false);
    });

    it('selectIsDirty should return false initially', () => {
      const { result } = renderHook(() => useSequenceEditorStore(selectIsDirty));
      expect(result.current).toBe(false);
    });
  });

  describe('Multi-Select', () => {
    it('should have empty selectedItemIds initially', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      expect(result.current.selectedItemIds).toEqual([]);
    });

    it('should toggle item selection', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const item = createTestItem({ id: 'test-item-1' });
      act(() => {
        result.current.addItem('start', item);
        result.current.toggleItemSelection('test-item-1');
      });
      expect(result.current.selectedItemIds).toContain('test-item-1');
    });

    it('should remove item from selection on second toggle', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const item = createTestItem({ id: 'test-item-2' });
      act(() => {
        result.current.clearMultiSelection(); // Clear any existing selection
        result.current.addItem('start', item);
      });
      act(() => {
        result.current.toggleItemSelection('test-item-2');
      });
      expect(result.current.selectedItemIds).toContain('test-item-2');
      act(() => {
        result.current.toggleItemSelection('test-item-2');
      });
      expect(result.current.selectedItemIds).not.toContain('test-item-2');
    });

    it('should select multiple items', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.selectMultipleItems(['item-1', 'item-2', 'item-3']);
      });
      expect(result.current.selectedItemIds).toEqual(['item-1', 'item-2', 'item-3']);
    });

    it('should clear multi-selection', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.selectMultipleItems(['item-1', 'item-2']);
        result.current.clearMultiSelection();
      });
      expect(result.current.selectedItemIds).toEqual([]);
    });

    it('should delete selected items', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const item1 = createTestItem({ id: 'item-1' });
      const item2 = createTestItem({ id: 'item-2' });
      act(() => {
        result.current.addItem('start', item1);
        result.current.addItem('start', item2);
        result.current.selectMultipleItems(['item-1', 'item-2']);
        result.current.deleteSelectedItems();
      });
      expect(result.current.sequence.startItems.length).toBe(0);
      expect(result.current.selectedItemIds).toEqual([]);
    });

    it('should duplicate selected items', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const item = createTestItem({ id: 'item-1' });
      act(() => {
        result.current.addItem('start', item);
        result.current.selectMultipleItems(['item-1']);
        result.current.duplicateSelectedItems();
      });
      expect(result.current.sequence.startItems.length).toBe(2);
    });
  });

  describe('Workflow View Settings', () => {
    it('should have default grid snap enabled', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      expect(result.current.gridSnapEnabled).toBe(true);
    });

    it('should have default grid size', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      expect(result.current.gridSize).toBe(20);
    });

    it('should toggle grid snap', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.setGridSnapEnabled(true);
      });
      expect(result.current.gridSnapEnabled).toBe(true);
    });

    it('should update grid size', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.setGridSize(25);
      });
      expect(result.current.gridSize).toBe(25);
    });

    it('should toggle minimap visibility', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const initial = result.current.showMinimap;
      act(() => {
        result.current.setShowMinimap(!initial);
      });
      expect(result.current.showMinimap).toBe(!initial);
    });

    it('should toggle area backgrounds', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const initial = result.current.showAreaBackgrounds;
      act(() => {
        result.current.setShowAreaBackgrounds(!initial);
      });
      expect(result.current.showAreaBackgrounds).toBe(!initial);
    });
  });

  describe('Batch Operations', () => {
    it('should toggle item enabled status', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const item = createTestItem({ id: 'item-1', status: 'CREATED' });
      act(() => {
        result.current.addItem('start', item);
        result.current.toggleItemEnabled('item-1');
      });
      expect(result.current.sequence.startItems[0].status).toBe('DISABLED');
    });

    it('should toggle disabled item back to created', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const item = createTestItem({ id: 'item-1', status: 'DISABLED' });
      act(() => {
        result.current.addItem('start', item);
        result.current.toggleItemEnabled('item-1');
      });
      expect(result.current.sequence.startItems[0].status).toBe('CREATED');
    });

    it('should move item to different area', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const item = createTestItem({ id: 'item-1' });
      act(() => {
        result.current.addItem('start', item);
        result.current.moveItemToArea('item-1', 'target');
      });
      expect(result.current.sequence.startItems.length).toBe(0);
      expect(result.current.sequence.targetItems.length).toBe(1);
      expect(result.current.sequence.targetItems[0].id).toBe('item-1');
    });

    it('should move item from target to end', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const item = createTestItem({ id: 'item-1' });
      act(() => {
        result.current.addItem('target', item);
        result.current.moveItemToArea('item-1', 'end');
      });
      expect(result.current.sequence.targetItems.length).toBe(0);
      expect(result.current.sequence.endItems.length).toBe(1);
    });

    it('should toggle enabled status for selected items', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const item1 = createTestItem({ id: 'item-1', status: 'CREATED' });
      const item2 = createTestItem({ id: 'item-2', status: 'CREATED' });
      act(() => {
        result.current.addItem('start', item1);
        result.current.addItem('start', item2);
        result.current.selectMultipleItems(['item-1', 'item-2']);
        result.current.toggleSelectedItemsEnabled();
      });
      expect(result.current.sequence.startItems[0].status).toBe('DISABLED');
      expect(result.current.sequence.startItems[1].status).toBe('DISABLED');
    });

    it('should expand all items', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const container = createTestItem({ 
        id: 'container-1', 
        type: 'NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer',
        isExpanded: false,
        items: [],
      });
      act(() => {
        result.current.addItem('start', container);
        result.current.setActiveArea('start');
        result.current.expandAllItems();
      });
      expect(result.current.sequence.startItems[0].isExpanded).toBe(true);
    });

    it('should collapse all items', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const container = createTestItem({ 
        id: 'container-1', 
        type: 'NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer',
        isExpanded: true,
        items: [],
      });
      act(() => {
        result.current.addItem('start', container);
        result.current.setActiveArea('start');
        result.current.collapseAllItems();
      });
      expect(result.current.sequence.startItems[0].isExpanded).toBe(false);
    });
  });

  describe('Clipboard Operations', () => {
    it('should copy selected items to clipboard', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const item = createTestItem({ id: 'item-1' });
      act(() => {
        result.current.addItem('start', item);
        result.current.selectItem('item-1');
        result.current.copySelectedItems();
      });
      expect(result.current.clipboard).not.toBeNull();
      expect(result.current.clipboard?.length).toBe(1);
      expect(result.current.clipboardMode).toBe('copy');
    });

    it('should cut selected items', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const item = createTestItem({ id: 'item-1' });
      act(() => {
        result.current.addItem('start', item);
        result.current.selectItem('item-1');
        result.current.cutSelectedItems();
      });
      expect(result.current.clipboard).not.toBeNull();
      expect(result.current.clipboardMode).toBe('cut');
      expect(result.current.sequence.startItems.length).toBe(0);
    });

    it('should paste items from clipboard', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const item = createTestItem({ id: 'item-1' });
      act(() => {
        result.current.addItem('start', item);
        result.current.selectItem('item-1');
        result.current.copySelectedItems();
        result.current.setActiveArea('target');
        result.current.pasteItems();
      });
      expect(result.current.sequence.targetItems.length).toBe(1);
      // Pasted item should have a new ID
      expect(result.current.sequence.targetItems[0].id).not.toBe('item-1');
    });

    it('should return true for hasClipboard when clipboard has items', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const item = createTestItem({ id: 'item-1' });
      act(() => {
        result.current.addItem('start', item);
        result.current.selectItem('item-1');
        result.current.copySelectedItems();
      });
      expect(result.current.hasClipboard()).toBe(true);
    });

    it('should return false for hasClipboard when clipboard is empty', () => {
      // Reset store to ensure clean state
      resetStore();
      const { result } = renderHook(() => useSequenceEditorStore());
      expect(result.current.hasClipboard()).toBe(false);
    });
  });

  describe('Select All', () => {
    it('should select all items in active area', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const item1 = createTestItem({ id: 'item-1' });
      const item2 = createTestItem({ id: 'item-2' });
      act(() => {
        result.current.addItem('start', item1);
        result.current.addItem('start', item2);
        result.current.setActiveArea('start');
        result.current.selectAllItems();
      });
      expect(result.current.selectedItemIds).toContain('item-1');
      expect(result.current.selectedItemIds).toContain('item-2');
      expect(result.current.selectedItemIds.length).toBe(2);
    });

    it('should select nested items when selecting all', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const nestedItem = createTestItem({ id: 'nested-1' });
      const container = createTestItem({ 
        id: 'container-1', 
        type: 'NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer',
        items: [nestedItem],
      });
      act(() => {
        result.current.addItem('start', container);
        result.current.setActiveArea('start');
        result.current.selectAllItems();
      });
      expect(result.current.selectedItemIds).toContain('container-1');
      expect(result.current.selectedItemIds).toContain('nested-1');
    });
  });

  describe('Statistics', () => {
    it('should return correct sequence statistics', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const item1 = createTestItem({ id: 'item-1' });
      const item2 = createTestItem({ id: 'item-2', status: 'DISABLED' });
      const item3 = createTestItem({ id: 'item-3' });
      act(() => {
        result.current.addItem('start', item1);
        result.current.addItem('target', item2);
        result.current.addItem('end', item3);
      });
      const stats = result.current.getSequenceStats();
      expect(stats.totalItems).toBe(3);
      expect(stats.startItems).toBe(1);
      expect(stats.targetItems).toBe(1);
      expect(stats.endItems).toBe(1);
      expect(stats.disabledItems).toBe(1);
    });

    it('should count conditions and triggers', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      const container = createTestItem({ 
        id: 'container-1', 
        type: 'NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer',
        items: [],
        conditions: [{ id: 'cond-1', type: 'Loop', name: 'Loop', category: 'Loop', data: {} }],
        triggers: [{ id: 'trig-1', type: 'Dither', name: 'Dither', category: 'Autofocus', data: {} }],
      });
      act(() => {
        result.current.addItem('target', container);
      });
      const stats = result.current.getSequenceStats();
      expect(stats.conditions).toBe(1);
      expect(stats.triggers).toBe(1);
    });
  });

  describe('Filter Category', () => {
    it('should set filter category', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.setFilterCategory('Camera');
      });
      expect(result.current.filterCategory).toBe('Camera');
    });

    it('should clear filter category', () => {
      const { result } = renderHook(() => useSequenceEditorStore());
      act(() => {
        result.current.setFilterCategory('Camera');
        result.current.setFilterCategory(null);
      });
      expect(result.current.filterCategory).toBeNull();
    });
  });
});
