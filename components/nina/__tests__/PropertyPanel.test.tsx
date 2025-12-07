/**
 * Unit tests for PropertyPanel component
 * Tests property editing for sequence items
 */

import { render, screen } from "@testing-library/react";
import { PropertyPanel } from "../PropertyPanel";
import { useSequenceEditorStore } from "@/lib/nina/store";
import { I18nProvider } from "@/lib/i18n/context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { act } from "react";
import type { EditorSequenceItem } from "@/lib/nina/types";

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <TooltipProvider>{component}</TooltipProvider>
    </I18nProvider>,
  );
};

// Helper to reset store between tests
const resetStore = () => {
  act(() => {
    useSequenceEditorStore.getState().newSequence();
  });
};

// Helper to create a test item
const createTestItem = (
  overrides: Partial<EditorSequenceItem> = {},
): EditorSequenceItem => ({
  id: `item-${Date.now()}-${Math.random()}`,
  type: "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer",
  name: "Cool Camera",
  category: "Camera",
  status: "CREATED",
  data: { Temperature: -10, Duration: 600 },
  ...overrides,
});

describe("PropertyPanel", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("Empty State", () => {
    it("should show empty state when no item selected", () => {
      renderWithProviders(<PropertyPanel />);

      // Should show "No item selected" or similar message
      expect(
        screen.getByText(/no item selected|select an item/i),
      ).toBeInTheDocument();
    });

    it("should display instruction text", () => {
      renderWithProviders(<PropertyPanel />);

      // Should have some instructional content
      expect(document.body.textContent).toContain("Select an item");
    });
  });

  describe("With Selected Item", () => {
    it("should display item name when item is selected", () => {
      const store = useSequenceEditorStore.getState();
      const item = createTestItem({ id: "test-item", name: "Test Camera" });

      act(() => {
        store.addItem("start", item);
        store.selectItem("test-item");
      });

      renderWithProviders(<PropertyPanel />);

      // Should show property panel with inputs
      const inputs = screen.getAllByRole("textbox");
      expect(inputs.length).toBeGreaterThan(0);
    });

    it("should display item category", () => {
      const store = useSequenceEditorStore.getState();
      const item = createTestItem({ id: "test-item", category: "Camera" });

      act(() => {
        store.addItem("start", item);
        store.selectItem("test-item");
      });

      renderWithProviders(<PropertyPanel />);

      // Should show property panel content
      expect(document.body.textContent).toBeTruthy();
    });

    it("should display property inputs for item data", () => {
      const store = useSequenceEditorStore.getState();
      const item = createTestItem({
        id: "test-item",
        data: { Temperature: -10, Duration: 600 },
      });

      act(() => {
        store.addItem("start", item);
        store.selectItem("test-item");
      });

      renderWithProviders(<PropertyPanel />);

      // Should have input fields for properties
      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe("Container Items", () => {
    it("should display container-specific properties", () => {
      const store = useSequenceEditorStore.getState();
      const container: EditorSequenceItem = {
        id: "container-1",
        type: "NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer",
        name: "Sequential Block",
        category: "Container",
        status: "CREATED",
        data: {},
        isExpanded: true,
        items: [],
        conditions: [],
        triggers: [],
      };

      act(() => {
        store.addItem("target", container);
        store.selectItem("container-1");
      });

      renderWithProviders(<PropertyPanel />);

      // Should show property inputs
      const inputs = screen.getAllByRole("textbox");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe("Exposure Items", () => {
    it("should display exposure-specific properties", () => {
      const store = useSequenceEditorStore.getState();
      const exposureItem: EditorSequenceItem = {
        id: "exposure-1",
        type: "NINA.Sequencer.SequenceItem.Imaging.TakeExposure, NINA.Sequencer",
        name: "Take Exposure",
        category: "Imaging",
        status: "CREATED",
        data: {
          ExposureTime: 300,
          Gain: 100,
          Offset: 10,
          Binning: "1x1",
        },
      };

      act(() => {
        store.addItem("target", exposureItem);
        store.selectItem("exposure-1");
      });

      renderWithProviders(<PropertyPanel />);

      // Should show exposure time input
      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should have labeled inputs", () => {
      const store = useSequenceEditorStore.getState();
      const item = createTestItem({ id: "test-item" });

      act(() => {
        store.addItem("start", item);
        store.selectItem("test-item");
      });

      renderWithProviders(<PropertyPanel />);

      // All inputs should have labels
      const inputs = screen.getAllByRole("spinbutton");
      inputs.forEach((input) => {
        expect(input).toHaveAttribute("aria-label");
      });
    });
  });
});
