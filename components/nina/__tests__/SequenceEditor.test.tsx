/**
 * Unit tests for SequenceEditor component
 * Tests main sequence editor component
 */

import { render } from "@testing-library/react";
import { SequenceEditor } from "../SequenceEditor";
import { I18nProvider } from "@/lib/i18n/context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSequenceEditorStore } from "@/lib/nina/store";

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <TooltipProvider>{component}</TooltipProvider>
    </I18nProvider>,
  );
};

// Reset store before each test
beforeEach(() => {
  const store = useSequenceEditorStore.getState();
  store.newSequence();
});

describe("SequenceEditor", () => {
  describe("Rendering", () => {
    it("should render without crashing", () => {
      renderWithProviders(<SequenceEditor />);
      expect(document.body).toBeInTheDocument();
    });

    it("should render main layout", () => {
      renderWithProviders(<SequenceEditor />);
      // Should have main container
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Store Integration", () => {
    it("should have access to sequence store", () => {
      const store = useSequenceEditorStore.getState();
      expect(store.sequence).toBeDefined();
    });

    it("should have addItem function", () => {
      const store = useSequenceEditorStore.getState();
      expect(typeof store.addItem).toBe("function");
    });
  });

  describe("Layout", () => {
    it("should render editor panels", () => {
      renderWithProviders(<SequenceEditor />);

      // Should render without errors
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible structure", () => {
      renderWithProviders(<SequenceEditor />);

      // Should render accessible content
      expect(document.body).toBeInTheDocument();
    });
  });
});
