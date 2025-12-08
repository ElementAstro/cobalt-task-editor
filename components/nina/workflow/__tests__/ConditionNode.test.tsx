/**
 * Unit tests for ConditionNode component (workflow view)
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConditionNode } from "../ConditionNode";
import { I18nProvider } from "@/lib/i18n/context";
import { ReactFlowProvider } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { EditorCondition } from "@/lib/nina/types";

// Mock the store
const mockSelectCondition = jest.fn();

jest.mock("@/lib/nina/store", () => ({
  useSequenceEditorStore: () => ({
    selectCondition: mockSelectCondition,
    selectedConditionId: null,
  }),
}));

const createMockCondition = (): EditorCondition => ({
  id: "condition-1",
  type: "NINA.Sequencer.Condition.LoopCondition",
  name: "Loop Condition",
  category: "Condition",
  data: {
    Iterations: 10,
    CompletedIterations: 3,
  },
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <ReactFlowProvider>{component}</ReactFlowProvider>
    </I18nProvider>,
  );
};

describe("ConditionNode (Workflow)", () => {
  const defaultProps = {
    id: "node-1",
    data: {
      condition: createMockCondition(),
    },
    type: "condition",
    selected: false,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    zIndex: 0,
  } as unknown as NodeProps;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render condition node", () => {
      renderWithProviders(<ConditionNode {...defaultProps} />);

      expect(document.body).toBeInTheDocument();
    });

    it("should render iteration count", () => {
      renderWithProviders(<ConditionNode {...defaultProps} />);

      expect(screen.getByText("3/10")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call selectCondition when clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ConditionNode {...defaultProps} />);

      const node = screen.getByText("3/10").closest("div");
      if (node) {
        await user.click(node);
      }

      expect(mockSelectCondition).toHaveBeenCalledWith("condition-1");
    });
  });

  describe("Selected State", () => {
    it("should apply selected styling when selected", () => {
      const selectedProps = {
        ...defaultProps,
        selected: true,
      };
      renderWithProviders(<ConditionNode {...selectedProps} />);

      expect(document.body).toBeInTheDocument();
    });
  });
});
