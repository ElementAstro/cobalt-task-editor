/**
 * Unit tests for ConditionNode component (tree view)
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConditionNode } from "../ConditionNode";
import { I18nProvider } from "@/lib/i18n/context";
import type { EditorCondition } from "@/lib/nina/types";

// Mock the store
const mockSelectCondition = jest.fn();
const mockDeleteCondition = jest.fn();

jest.mock("@/lib/nina/store", () => ({
  useSequenceEditorStore: () => ({
    selectCondition: mockSelectCondition,
    selectedConditionId: null,
    deleteCondition: mockDeleteCondition,
  }),
}));

const createMockCondition = (
  overrides: Partial<EditorCondition> = {},
): EditorCondition => ({
  id: "condition-1",
  type: "NINA.Sequencer.Condition.LoopCondition",
  name: "Loop Condition",
  category: "Condition",
  data: {
    Iterations: 10,
    CompletedIterations: 3,
  },
  ...overrides,
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe("ConditionNode", () => {
  const defaultProps = {
    condition: createMockCondition(),
    containerId: "container-1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render condition name", () => {
      renderWithProviders(<ConditionNode {...defaultProps} />);

      expect(screen.getByText(/Loop/i)).toBeInTheDocument();
    });

    it("should render iteration count", () => {
      renderWithProviders(<ConditionNode {...defaultProps} />);

      expect(screen.getByText("3/10")).toBeInTheDocument();
    });

    it("should render delete button", () => {
      renderWithProviders(<ConditionNode {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /delete/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call selectCondition when clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ConditionNode {...defaultProps} />);

      const node = screen.getByText(/Loop/i).closest("div");
      if (node) {
        await user.click(node);
      }

      expect(mockSelectCondition).toHaveBeenCalledWith("condition-1");
    });

    it("should call deleteCondition when delete button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ConditionNode {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /delete/i }));

      expect(mockDeleteCondition).toHaveBeenCalledWith(
        "container-1",
        "condition-1",
      );
    });
  });

  describe("Without Iterations", () => {
    it("should not show iteration count when not provided", () => {
      const conditionWithoutIterations = createMockCondition({
        data: {},
      });
      renderWithProviders(
        <ConditionNode
          {...defaultProps}
          condition={conditionWithoutIterations}
        />,
      );

      expect(screen.queryByText(/\//)).not.toBeInTheDocument();
    });
  });
});
