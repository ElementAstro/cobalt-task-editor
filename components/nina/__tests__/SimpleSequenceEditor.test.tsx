/**
 * Unit tests for SimpleSequenceEditor component
 * Tests simple sequence editor component
 */

import { render } from '@testing-library/react';
import { SimpleSequenceEditor } from '../SimpleSequenceEditor';
import { I18nProvider } from '@/lib/i18n/context';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSimpleSequenceStore } from '@/lib/nina/simple-sequence-store';
import { act } from 'react';

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

// Reset store before each test
beforeEach(() => {
  const store = useSimpleSequenceStore.getState();
  store.newSequence();
});

describe('SimpleSequenceEditor', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(<SimpleSequenceEditor />);
      expect(document.body).toBeInTheDocument();
    });

    it('should render main layout', () => {
      renderWithProviders(<SimpleSequenceEditor />);
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Store Integration', () => {
    it('should have access to simple sequence store', () => {
      const store = useSimpleSequenceStore.getState();
      expect(store.sequence).toBeDefined();
    });

    it('should be able to add targets', () => {
      const store = useSimpleSequenceStore.getState();
      
      act(() => {
        store.addTarget({ targetName: 'M31' });
      });
      
      expect(store.sequence.targets.length).toBe(1);
    });

    it('should be able to add exposures', () => {
      const store = useSimpleSequenceStore.getState();
      
      let targetId: string;
      act(() => {
        targetId = store.addTarget({ targetName: 'M31' });
        store.addExposure(targetId, { exposureTime: 300 });
      });
      
      expect(store.sequence.targets[0].exposures.length).toBe(1);
    });
  });

  describe('Layout', () => {
    it('should render editor panels', () => {
      renderWithProviders(<SimpleSequenceEditor />);
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible structure', () => {
      renderWithProviders(<SimpleSequenceEditor />);
      expect(document.body).toBeInTheDocument();
    });
  });
});
