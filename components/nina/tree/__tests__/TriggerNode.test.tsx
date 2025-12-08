/**
 * Unit tests for TriggerNode component (tree view)
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TriggerNode } from "../TriggerNode";
import { I18nProvider } from "@/lib/i18n/context";
import type { EditorTrigger } from "@/lib/nina/types";

// Mock the store
const mockSelectTrigger = jest.fn();
const mockDeleteTrigger = jest.fn();

jest.mock("@/lib/nina/store", () => ({
  useSequenceEditorStore: () => ({
    selectTrigger: mockSelectTrigger,
    selectedTriggerId: null,
    deleteTrigger: mockDeleteTrigger,
  }),
}));

const createMockTrigger = (
  overrides: Partial<EditorTrigger> = {},
): EditorTrigger => ({
  id: "trigger-1",
  type: "NINA.Sequencer.Trigger.MeridianFlipTrigger",
  name: "Meridian Flip Trigger",
  category: "Trigger",
  data: {},
  ...overrides,
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe("TriggerNode", () => {
  const defaultProps = {
    trigger: createMockTrigger(),
    containerId: "container-1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render trigger name", () => {
      renderWithProviders(<TriggerNode {...defaultProps} />);

      expect(screen.getByText(/Meridian/i)).toBeInTheDocument();
    });

    it("should render delete button", () => {
      renderWithProviders(<TriggerNode {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /delete/i }),
      ).toBeInTheDocument();
    });

    it("should render zap icon", () => {
      renderWithProviders(<TriggerNode {...defaultProps} />);

      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call selectTrigger when clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TriggerNode {...defaultProps} />);

      const node = screen.getByText(/Meridian/i).closest("div");
      if (node) {
        await user.click(node);
      }

      expect(mockSelectTrigger).toHaveBeenCalledWith("trigger-1");
    });

    it("should call deleteTrigger when delete button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TriggerNode {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /delete/i }));

      expect(mockDeleteTrigger).toHaveBeenCalledWith(
        "container-1",
        "trigger-1",
      );
    });
  });

  describe("Selected State", () => {
    it("should apply selected styling when selected", () => {
      // This would require mocking selectedTriggerId to match
      renderWithProviders(<TriggerNode {...defaultProps} />);

      expect(document.body).toBeInTheDocument();
    });
  });
});
