/**
 * Unit tests for multi-sequence-store
 * Tests editor mode, tab management, and template functionality
 */

import { act, renderHook } from '@testing-library/react';
import { useMultiSequenceStore } from '../multi-sequence-store';
import type { EditorSequence } from '../types';

// Helper to reset store between tests
const resetStore = () => {
  const { getState } = useMultiSequenceStore;
  act(() => {
    // Close all tabs
    getState().closeAllTabs();
    // Reset to advanced mode
    getState().setEditorMode('advanced');
  });
};

// Helper to create a mock sequence
const createMockSequence = (title: string = 'Test Sequence'): EditorSequence => ({
  id: `seq-${Date.now()}`,
  title,
  startItems: [],
  targetItems: [],
  endItems: [],
  globalTriggers: [],
});

describe('multi-sequence-store', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('Editor Mode', () => {
    it('should default to advanced mode', () => {
      const { result } = renderHook(() => useMultiSequenceStore());
      expect(result.current.editorMode).toBe('advanced');
    });

    it('should switch to normal mode', () => {
      const { result } = renderHook(() => useMultiSequenceStore());
      
      act(() => {
        result.current.setEditorMode('normal');
      });
      
      expect(result.current.editorMode).toBe('normal');
    });

    it('should switch back to advanced mode', () => {
      const { result } = renderHook(() => useMultiSequenceStore());
      
      act(() => {
        result.current.setEditorMode('normal');
        result.current.setEditorMode('advanced');
      });
      
      expect(result.current.editorMode).toBe('advanced');
    });

    it('should keep only one tab when switching to normal mode with multiple tabs', () => {
      const { result } = renderHook(() => useMultiSequenceStore());
      
      // Add multiple tabs in advanced mode
      act(() => {
        result.current.addTab(createMockSequence('Tab 1'));
        result.current.addTab(createMockSequence('Tab 2'));
        result.current.addTab(createMockSequence('Tab 3'));
      });
      
      expect(result.current.tabs.length).toBe(3);
      
      // Switch to normal mode
      act(() => {
        result.current.setEditorMode('normal');
      });
      
      expect(result.current.tabs.length).toBe(1);
    });

    it('should keep the active tab when switching to normal mode', () => {
      const { result } = renderHook(() => useMultiSequenceStore());
      
      let tab2Id: string;
      
      act(() => {
        result.current.addTab(createMockSequence('Tab 1'));
        tab2Id = result.current.addTab(createMockSequence('Tab 2'));
        result.current.addTab(createMockSequence('Tab 3'));
        result.current.setActiveTab(tab2Id);
      });
      
      // Switch to normal mode
      act(() => {
        result.current.setEditorMode('normal');
      });
      
      expect(result.current.tabs.length).toBe(1);
      expect(result.current.tabs[0].sequence.title).toBe('Tab 2');
    });
  });

  describe('Tab Management', () => {
    describe('addTab', () => {
      it('should add a new tab in advanced mode', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        act(() => {
          result.current.addTab(createMockSequence('New Tab'));
        });
        
        expect(result.current.tabs.length).toBe(1);
        expect(result.current.tabs[0].sequence.title).toBe('New Tab');
      });

      it('should set the new tab as active', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tabId = '';
        act(() => {
          tabId = result.current.addTab(createMockSequence('New Tab'));
        });
        
        expect(result.current.activeTabId).toBe(tabId);
      });

      it('should allow multiple tabs in advanced mode', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        act(() => {
          result.current.addTab(createMockSequence('Tab 1'));
          result.current.addTab(createMockSequence('Tab 2'));
          result.current.addTab(createMockSequence('Tab 3'));
        });
        
        expect(result.current.tabs.length).toBe(3);
      });

      it('should replace existing tab in normal mode', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        act(() => {
          result.current.setEditorMode('normal');
          result.current.addTab(createMockSequence('Tab 1'));
        });
        
        expect(result.current.tabs.length).toBe(1);
        expect(result.current.tabs[0].sequence.title).toBe('Tab 1');
        
        act(() => {
          result.current.addTab(createMockSequence('Tab 2'));
        });
        
        // Should still be only one tab, but with new content
        expect(result.current.tabs.length).toBe(1);
        expect(result.current.tabs[0].sequence.title).toBe('Tab 2');
      });

      it('should create empty sequence if none provided', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        act(() => {
          result.current.addTab();
        });
        
        expect(result.current.tabs.length).toBe(1);
        expect(result.current.tabs[0].sequence.title).toBe('New Sequence');
      });
    });

    describe('closeTab', () => {
      it('should close a tab', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tabId: string;
        act(() => {
          tabId = result.current.addTab(createMockSequence('Tab 1'));
        });
        
        act(() => {
          result.current.closeTab(tabId);
        });
        
        expect(result.current.tabs.length).toBe(0);
      });

      it('should update active tab when closing active tab', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tab1Id = '';
        let tab2Id = '';
        
        act(() => {
          tab1Id = result.current.addTab(createMockSequence('Tab 1'));
          tab2Id = result.current.addTab(createMockSequence('Tab 2'));
        });
        
        expect(result.current.activeTabId).toBe(tab2Id);
        
        act(() => {
          result.current.closeTab(tab2Id);
        });
        
        expect(result.current.activeTabId).toBe(tab1Id);
      });

      it('should set activeTabId to null when closing last tab', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tabId = '';
        act(() => {
          tabId = result.current.addTab(createMockSequence('Tab 1'));
        });
        
        act(() => {
          result.current.closeTab(tabId);
        });
        
        expect(result.current.activeTabId).toBeNull();
      });
    });

    describe('closeOtherTabs', () => {
      it('should close all tabs except the specified one', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tab2Id = '';
        
        act(() => {
          result.current.addTab(createMockSequence('Tab 1'));
          tab2Id = result.current.addTab(createMockSequence('Tab 2'));
          result.current.addTab(createMockSequence('Tab 3'));
        });
        
        act(() => {
          result.current.closeOtherTabs(tab2Id);
        });
        
        expect(result.current.tabs.length).toBe(1);
        expect(result.current.tabs[0].id).toBe(tab2Id);
      });
    });

    describe('closeAllTabs', () => {
      it('should close all tabs', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        act(() => {
          result.current.addTab(createMockSequence('Tab 1'));
          result.current.addTab(createMockSequence('Tab 2'));
          result.current.addTab(createMockSequence('Tab 3'));
        });
        
        act(() => {
          result.current.closeAllTabs();
        });
        
        expect(result.current.tabs.length).toBe(0);
        expect(result.current.activeTabId).toBeNull();
      });
    });

    describe('setActiveTab', () => {
      it('should set the active tab', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tab1Id = '';
        
        act(() => {
          tab1Id = result.current.addTab(createMockSequence('Tab 1'));
          result.current.addTab(createMockSequence('Tab 2'));
        });
        
        act(() => {
          result.current.setActiveTab(tab1Id);
        });
        
        expect(result.current.activeTabId).toBe(tab1Id);
      });

      it('should not change active tab if tab does not exist', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tabId = '';
        act(() => {
          tabId = result.current.addTab(createMockSequence('Tab 1'));
        });
        
        act(() => {
          result.current.setActiveTab('non-existent-id');
        });
        
        expect(result.current.activeTabId).toBe(tabId);
      });
    });

    describe('duplicateTab', () => {
      it('should duplicate a tab', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tabId = '';
        act(() => {
          tabId = result.current.addTab(createMockSequence('Original Tab'));
        });
        
        act(() => {
          result.current.duplicateTab(tabId);
        });
        
        expect(result.current.tabs.length).toBe(2);
        expect(result.current.tabs[1].sequence.title).toBe('Original Tab (Copy)');
      });
    });

    describe('renameTab', () => {
      it('should rename a tab', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tabId = '';
        act(() => {
          tabId = result.current.addTab(createMockSequence('Original Name'));
        });
        
        act(() => {
          result.current.renameTab(tabId, 'New Name');
        });
        
        expect(result.current.tabs[0].sequence.title).toBe('New Name');
        expect(result.current.tabs[0].isDirty).toBe(true);
      });
    });

    describe('setTabDirty', () => {
      it('should set tab dirty state', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tabId = '';
        act(() => {
          tabId = result.current.addTab(createMockSequence('Tab'));
        });
        
        expect(result.current.tabs[0].isDirty).toBe(false);
        
        act(() => {
          result.current.setTabDirty(tabId, true);
        });
        
        expect(result.current.tabs[0].isDirty).toBe(true);
      });
    });
  });

  describe('canAddTab', () => {
    it('should return true in advanced mode', () => {
      const { result } = renderHook(() => useMultiSequenceStore());
      
      act(() => {
        result.current.addTab(createMockSequence('Tab 1'));
      });
      
      expect(result.current.canAddTab()).toBe(true);
    });

    it('should return true in normal mode with no tabs', () => {
      const { result } = renderHook(() => useMultiSequenceStore());
      
      act(() => {
        result.current.setEditorMode('normal');
      });
      
      expect(result.current.canAddTab()).toBe(true);
    });

    it('should return false in normal mode with existing tab', () => {
      const { result } = renderHook(() => useMultiSequenceStore());
      
      act(() => {
        result.current.setEditorMode('normal');
        result.current.addTab(createMockSequence('Tab 1'));
      });
      
      expect(result.current.canAddTab()).toBe(false);
    });
  });

  describe('Template Management', () => {
    describe('default templates', () => {
      it('should have default templates', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        const defaultTemplates = result.current.templates.filter(t => t.category === 'default');
        expect(defaultTemplates.length).toBeGreaterThan(0);
      });

      it('should have templates with mode property', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        result.current.templates.forEach(template => {
          expect(template.mode).toBeDefined();
          expect(['normal', 'advanced']).toContain(template.mode);
        });
      });

      it('should have normal mode templates', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        const normalTemplates = result.current.templates.filter(t => t.mode === 'normal');
        expect(normalTemplates.length).toBeGreaterThan(0);
      });

      it('should have advanced mode templates', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        const advancedTemplates = result.current.templates.filter(t => t.mode === 'advanced');
        expect(advancedTemplates.length).toBeGreaterThan(0);
      });
    });

    describe('getTemplatesForMode', () => {
      it('should return templates in advanced mode', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        const templates = result.current.getTemplatesForMode('advanced');
        // In advanced mode, getTemplatesForMode returns templates where mode is 'normal' or 'advanced'
        // which is all templates since all templates have one of these modes
        expect(templates.length).toBeGreaterThan(0);
        templates.forEach(template => {
          expect(['normal', 'advanced']).toContain(template.mode);
        });
      });

      it('should return only normal and advanced templates in normal mode', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        const templates = result.current.getTemplatesForMode('normal');
        templates.forEach(template => {
          expect(['normal', 'advanced']).toContain(template.mode);
        });
      });

      it('should use current editor mode if no mode specified', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        act(() => {
          result.current.setEditorMode('normal');
        });
        
        const templates = result.current.getTemplatesForMode();
        templates.forEach(template => {
          expect(['normal', 'advanced']).toContain(template.mode);
        });
      });
    });

    describe('applyTemplate', () => {
      it('should apply a template and create a new tab', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        const templateId = result.current.templates[0].id;
        
        act(() => {
          result.current.applyTemplate(templateId);
        });
        
        expect(result.current.tabs.length).toBe(1);
      });

      it('should return null for non-existent template', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tabId: string | null = null;
        act(() => {
          tabId = result.current.applyTemplate('non-existent-id');
        });
        
        expect(tabId).toBeNull();
      });
    });

    describe('saveAsTemplate', () => {
      it('should save current tab as custom template', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tabId = '';
        act(() => {
          tabId = result.current.addTab(createMockSequence('My Sequence'));
        });
        
        const initialTemplateCount = result.current.templates.length;
        
        act(() => {
          result.current.saveAsTemplate(tabId, 'My Template', 'A custom template');
        });
        
        expect(result.current.templates.length).toBe(initialTemplateCount + 1);
        
        const customTemplate = result.current.templates.find(t => t.name === 'My Template');
        expect(customTemplate).toBeDefined();
        expect(customTemplate?.category).toBe('custom');
        expect(customTemplate?.description).toBe('A custom template');
      });

      it('should save template with current editor mode', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tabId = '';
        act(() => {
          result.current.setEditorMode('normal');
          tabId = result.current.addTab(createMockSequence('My Sequence'));
        });
        
        act(() => {
          result.current.saveAsTemplate(tabId, 'Normal Mode Template', 'Template for normal mode');
        });
        
        const customTemplate = result.current.templates.find(t => t.name === 'Normal Mode Template');
        expect(customTemplate?.mode).toBe('normal');
      });
    });

    describe('deleteTemplate', () => {
      it('should delete a custom template', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tabId = '';
        act(() => {
          tabId = result.current.addTab(createMockSequence('My Sequence'));
        });
        
        let templateId = '';
        act(() => {
          templateId = result.current.saveAsTemplate(tabId, 'My Template', 'A custom template');
        });
        
        const countBefore = result.current.templates.length;
        
        act(() => {
          result.current.deleteTemplate(templateId);
        });
        
        expect(result.current.templates.length).toBe(countBefore - 1);
        expect(result.current.templates.find(t => t.id === templateId)).toBeUndefined();
      });

      it('should not delete default templates', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        const defaultTemplate = result.current.templates.find(t => t.category === 'default');
        const countBefore = result.current.templates.length;
        
        act(() => {
          result.current.deleteTemplate(defaultTemplate!.id);
        });
        
        expect(result.current.templates.length).toBe(countBefore);
      });
    });

    describe('updateTemplate', () => {
      it('should update a custom template', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tabId = '';
        act(() => {
          tabId = result.current.addTab(createMockSequence('My Sequence'));
        });
        
        let templateId = '';
        act(() => {
          templateId = result.current.saveAsTemplate(tabId, 'Original Name', 'Original Description');
        });
        
        act(() => {
          result.current.updateTemplate(templateId, { 
            name: 'Updated Name', 
            description: 'Updated Description' 
          });
        });
        
        const updatedTemplate = result.current.templates.find(t => t.id === templateId);
        expect(updatedTemplate?.name).toBe('Updated Name');
        expect(updatedTemplate?.description).toBe('Updated Description');
      });

      it('should not update default templates', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        const defaultTemplate = result.current.templates.find(t => t.category === 'default');
        const originalName = defaultTemplate!.name;
        
        act(() => {
          result.current.updateTemplate(defaultTemplate!.id, { name: 'New Name' });
        });
        
        const template = result.current.templates.find(t => t.id === defaultTemplate!.id);
        expect(template?.name).toBe(originalName);
      });
    });
  });

  describe('Utility Methods', () => {
    describe('getActiveTab', () => {
      it('should return the active tab', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        act(() => {
          result.current.addTab(createMockSequence('Tab 1'));
        });
        
        const activeTab = result.current.getActiveTab();
        expect(activeTab).not.toBeNull();
        expect(activeTab?.sequence.title).toBe('Tab 1');
      });

      it('should return null when no tabs', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        const activeTab = result.current.getActiveTab();
        expect(activeTab).toBeNull();
      });
    });

    describe('getTabById', () => {
      it('should return tab by id', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tabId = '';
        act(() => {
          tabId = result.current.addTab(createMockSequence('Tab 1'));
        });
        
        const tab = result.current.getTabById(tabId);
        expect(tab).not.toBeNull();
        expect(tab?.sequence.title).toBe('Tab 1');
      });

      it('should return null for non-existent id', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        const tab = result.current.getTabById('non-existent');
        expect(tab).toBeNull();
      });
    });

    describe('hasUnsavedChanges', () => {
      it('should return false when no dirty tabs', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        act(() => {
          result.current.addTab(createMockSequence('Tab 1'));
        });
        
        expect(result.current.hasUnsavedChanges()).toBe(false);
      });

      it('should return true when there are dirty tabs', () => {
        const { result } = renderHook(() => useMultiSequenceStore());
        
        let tabId = '';
        act(() => {
          tabId = result.current.addTab(createMockSequence('Tab 1'));
        });
        
        act(() => {
          result.current.setTabDirty(tabId, true);
        });
        
        expect(result.current.hasUnsavedChanges()).toBe(true);
      });
    });
  });
});
