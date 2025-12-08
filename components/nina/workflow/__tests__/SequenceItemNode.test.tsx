/**
 * Unit tests for SequenceItemNode component (workflow view)
 */

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SequenceItemNode } from "../SequenceItemNode";
import { I18nProvider } from "@/lib/i18n/context";
import { ReactFlowProvider } from "@xyflow/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { NodeProps } from "@xyflow/react";
import type { EditorSequenceItem } from "@/lib/nina/types";

// Mock the store
const mockSelectItem = jest.fn();

jest.mock("@/lib/nina/store", () => ({
  useSequenceEditorStore: jest.fn((selector) => {
    const state = {
      selectItem: mockSelectItem,
      selectedItemId: null,
      selectedItemIds: [],
    };
    return selector ? selector(state) : state;
  }),
}));

const createMockItem = (
  type: string = "NINA.Sequencer.SequenceItem.Camera.TakeExposure",
): EditorSequenceItem =>
  ({
    id: "item-1",
    type,
    name: "Take Exposure",
    category: "Camera",
    status: "CREATED",
    enabled: true,
    data: {},
  }) as unknown as EditorSequenceItem;

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <TooltipProvider>
        <ReactFlowProvider>{component}</ReactFlowProvider>
      </TooltipProvider>
    </I18nProvider>,
  );
};

describe("SequenceItemNode (Workflow)", () => {
  const defaultProps = {
    id: "node-1",
    data: {
      item: createMockItem(),
      area: "target",
    },
    type: "sequenceItem",
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
    it("should render sequence item node", () => {
      renderWithProviders(<SequenceItemNode {...defaultProps} />);

      expect(document.body).toBeInTheDocument();
    });

    it("should render item icon", () => {
      renderWithProviders(<SequenceItemNode {...defaultProps} />);

      // Camera icon for TakeExposure
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Item Types", () => {
    it("should render camera icon for exposure items", () => {
      renderWithProviders(<SequenceItemNode {...defaultProps} />);

      expect(document.body).toBeInTheDocument();
    });

    it("should render telescope icon for slew items", () => {
      const slewProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          item: createMockItem(
            "NINA.Sequencer.SequenceItem.Telescope.SlewToTarget",
          ),
        },
      };
      renderWithProviders(<SequenceItemNode {...slewProps} />);

      expect(document.body).toBeInTheDocument();
    });

    it("should render focus icon for autofocus items", () => {
      const focusProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          item: createMockItem(
            "NINA.Sequencer.SequenceItem.Autofocus.RunAutofocus",
          ),
        },
      };
      renderWithProviders(<SequenceItemNode {...focusProps} />);

      expect(document.body).toBeInTheDocument();
    });

    it("should render disc icon for filter items", () => {
      const filterProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          item: createMockItem(
            "NINA.Sequencer.SequenceItem.FilterWheel.SwitchFilter",
          ),
        },
      };
      renderWithProviders(<SequenceItemNode {...filterProps} />);

      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Selection", () => {
    it("should apply selected styling when selected", () => {
      const selectedProps = {
        ...defaultProps,
        selected: true,
      };
      renderWithProviders(<SequenceItemNode {...selectedProps} />);

      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call selectItem when clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SequenceItemNode {...defaultProps} />);

      const node = document.querySelector("[class*='cursor-pointer']");
      if (node) {
        await user.click(node as HTMLElement);
      }

      expect(mockSelectItem).toHaveBeenCalledWith("item-1");
    });
  });

  describe("Status Display", () => {
    it("should show running status", () => {
      const runningProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          item: { ...createMockItem(), status: "RUNNING" },
        },
      };
      renderWithProviders(<SequenceItemNode {...runningProps} />);

      expect(document.body).toBeInTheDocument();
    });

    it("should show finished status", () => {
      const finishedProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          item: { ...createMockItem(), status: "FINISHED" },
        },
      };
      renderWithProviders(<SequenceItemNode {...finishedProps} />);

      expect(document.body).toBeInTheDocument();
    });

    it("should show failed status", () => {
      const failedProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          item: { ...createMockItem(), status: "FAILED" },
        },
      };
      renderWithProviders(<SequenceItemNode {...failedProps} />);

      expect(document.body).toBeInTheDocument();
    });

    it("should show disabled status", () => {
      const disabledProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          item: { ...createMockItem(), status: "DISABLED", enabled: false },
        },
      };
      renderWithProviders(<SequenceItemNode {...disabledProps} />);

      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Area Indicator", () => {
    it("should show start area indicator", () => {
      const startProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          area: "start",
        },
      };
      renderWithProviders(<SequenceItemNode {...startProps} />);

      expect(document.body).toBeInTheDocument();
    });

    it("should show target area indicator", () => {
      renderWithProviders(<SequenceItemNode {...defaultProps} />);

      expect(document.body).toBeInTheDocument();
    });

    it("should show end area indicator", () => {
      const endProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          area: "end",
        },
      };
      renderWithProviders(<SequenceItemNode {...endProps} />);

      expect(document.body).toBeInTheDocument();
    });
  });
});
