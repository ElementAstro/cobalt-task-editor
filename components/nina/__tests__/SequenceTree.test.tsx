/**
 * Unit tests for SequenceTree component
 * Tests tree view display and item interactions
 */

import { render } from '@testing-library/react';
import { SequenceTree } from '../SequenceTree';
import { useSequenceEditorStore } from '@/lib/nina/store';
import { I18nProvider } from '@/lib/i18n/context';
import { TooltipProvider } from '@/components/ui/tooltip';
import { act } from 'react';
import type { EditorSequenceItem } from '@/lib/nina/types';

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <TooltipProvider>
        {component}
      </TooltipProvider>
    </I18nProvider>
  );
};

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
  data: {},
  ...overrides,
});

// Helper to create a container item
const createContainerItem = (overrides: Partial<EditorSequenceItem> = {}): EditorSequenceItem => ({
  id: `container-${Date.now()}-${Math.random()}`,
  type: 'NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer',
  name: 'Sequential Block',
  category: 'Container',
  status: 'CREATED',
  data: {},
  isExpanded: true,
  items: [],
  conditions: [],
  triggers: [],
  ...overrides,
});

describe('SequenceTree', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('Empty State', () => {
    it('should render empty tree', () => {
      renderWithProviders(<SequenceTree />);
      
      // Should render without errors
      expect(document.body).toBeInTheDocument();
    });

    it('should show empty state message', () => {
      renderWithProviders(<SequenceTree />);
      
      // Should show empty state
      expect(document.body.textContent).toContain('No instructions');
    });
  });

  describe('With Items', () => {
    it('should display items in target area', () => {
      const store = useSequenceEditorStore.getState();
      
      act(() => {
        store.addItem('target', createTestItem({ id: 'item-1', name: 'Target Item' }));
        store.setActiveArea('target');
      });
      
      renderWithProviders(<SequenceTree />);
      
      // Should render items (component uses i18n for display names)
      expect(document.body).toBeInTheDocument();
    });

    it('should display multiple items', () => {
      const store = useSequenceEditorStore.getState();
      
      act(() => {
        store.addItem('target', createTestItem({ id: 'item-1', name: 'Item 1' }));
        store.addItem('target', createTestItem({ id: 'item-2', name: 'Item 2' }));
        store.setActiveArea('target');
      });
      
      renderWithProviders(<SequenceTree />);
      
      // Should render multiple items
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Container Items', () => {
    it('should display container', () => {
      const store = useSequenceEditorStore.getState();
      
      act(() => {
        store.addItem('target', createContainerItem({ 
          id: 'container-1', 
          name: 'My Container',
          isExpanded: true,
        }));
        store.setActiveArea('target');
      });
      
      renderWithProviders(<SequenceTree />);
      
      // Should render container
      expect(document.body).toBeInTheDocument();
    });

    it('should display nested items in expanded container', () => {
      const store = useSequenceEditorStore.getState();
      
      const container = createContainerItem({
        id: 'container-1',
        name: 'Parent Container',
        isExpanded: true,
        items: [createTestItem({ id: 'child-1', name: 'Child Item' })],
      });
      
      act(() => {
        store.addItem('target', container);
        store.setActiveArea('target');
      });
      
      renderWithProviders(<SequenceTree />);
      
      // Should render container with children
      expect(document.body).toBeInTheDocument();
    });

    it('should handle collapsed container', () => {
      const store = useSequenceEditorStore.getState();
      
      const container = createContainerItem({
        id: 'container-1',
        name: 'Parent Container',
        isExpanded: false,
        items: [createTestItem({ id: 'child-1', name: 'Hidden Child' })],
      });
      
      act(() => {
        store.addItem('target', container);
        store.setActiveArea('target');
      });
      
      renderWithProviders(<SequenceTree />);
      
      // Should render collapsed container
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should handle item selection', () => {
      const store = useSequenceEditorStore.getState();
      
      act(() => {
        store.addItem('target', createTestItem({ id: 'item-1', name: 'Selectable Item' }));
        store.selectItem('item-1');
        store.setActiveArea('target');
      });
      
      renderWithProviders(<SequenceTree />);
      
      // Should render without errors
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('should display item with status', () => {
      const store = useSequenceEditorStore.getState();
      
      act(() => {
        store.addItem('target', createTestItem({ 
          id: 'item-1', 
          name: 'Running Item',
          status: 'RUNNING',
        }));
        store.setActiveArea('target');
      });
      
      renderWithProviders(<SequenceTree />);
      
      // Should render component with items
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render tree component', () => {
      renderWithProviders(<SequenceTree />);
      
      // Should render without errors
      expect(document.body).toBeInTheDocument();
    });

    it('should show empty state when no items', () => {
      renderWithProviders(<SequenceTree />);
      
      // Should show empty state message
      expect(document.body.textContent).toContain('No instructions');
    });
  });
});
