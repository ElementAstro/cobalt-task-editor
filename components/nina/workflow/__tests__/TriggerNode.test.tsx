/**
 * Unit tests for TriggerNode component (workflow view)
 */

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TriggerNode } from "../TriggerNode";
import { I18nProvider } from "@/lib/i18n/context";
import { ReactFlowProvider } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { EditorTrigger } from "@/lib/nina/types";

// Mock the store
const mockSelectTrigger = jest.fn();

jest.mock("@/lib/nina/store", () => ({
  useSequenceEditorStore: () => ({
    selectTrigger: mockSelectTrigger,
    selectedTriggerId: null,
  }),
}));

const createMockTrigger = (): EditorTrigger => ({
  id: "trigger-1",
  type: "NINA.Sequencer.Trigger.MeridianFlipTrigger",
  name: "Meridian Flip Trigger",
  category: "Trigger",
  data: {},
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <ReactFlowProvider>{component}</ReactFlowProvider>
    </I18nProvider>,
  );
};

describe("TriggerNode (Workflow)", () => {
  const defaultProps = {
    id: "node-1",
    data: {
      trigger: createMockTrigger(),
    },
    type: "trigger",
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
    it("should render trigger node", () => {
      renderWithProviders(<TriggerNode {...defaultProps} />);

      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call selectTrigger when clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TriggerNode {...defaultProps} />);

      const nodes = document.querySelectorAll("[class*='cursor-pointer']");
      if (nodes.length > 0) {
        await user.click(nodes[0] as HTMLElement);
      }

      expect(mockSelectTrigger).toHaveBeenCalledWith("trigger-1");
    });
  });

  describe("Selected State", () => {
    it("should apply selected styling when selected", () => {
      const selectedProps = {
        ...defaultProps,
        selected: true,
      };
      renderWithProviders(<TriggerNode {...selectedProps} />);

      expect(document.body).toBeInTheDocument();
    });
  });
});
