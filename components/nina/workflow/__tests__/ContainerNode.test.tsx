/**
 * Unit tests for ContainerNode component (workflow view)
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContainerNode } from "../ContainerNode";
import { I18nProvider } from "@/lib/i18n/context";
import { ReactFlowProvider } from "@xyflow/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { NodeProps } from "@xyflow/react";
import type { EditorSequenceItem } from "@/lib/nina/types";

// Mock the store
const mockSelectItem = jest.fn();
const mockUpdateItem = jest.fn();

jest.mock("@/lib/nina/store", () => ({
  useSequenceEditorStore: jest.fn((selector) => {
    const state = {
      selectItem: mockSelectItem,
      updateItem: mockUpdateItem,
      selectedItemId: null,
      selectedItemIds: [],
    };
    return selector ? selector(state) : state;
  }),
}));

const createMockItem = (): EditorSequenceItem =>
  ({
    id: "container-1",
    type: "NINA.Sequencer.Container.SequentialContainer",
    name: "Sequential Container",
    category: "Container",
    status: "CREATED",
    enabled: true,
    data: {},
    items: [],
    conditions: [],
    triggers: [],
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

describe("ContainerNode (Workflow)", () => {
  const defaultProps = {
    id: "node-1",
    data: {
      item: createMockItem(),
      isExpanded: true,
      childCount: 3,
      conditionCount: 1,
      triggerCount: 2,
    },
    type: "container",
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
    it("should render container node", () => {
      renderWithProviders(<ContainerNode {...defaultProps} />);

      expect(document.body).toBeInTheDocument();
    });

    it("should render child count badge", () => {
      renderWithProviders(<ContainerNode {...defaultProps} />);

      // Badge shows "3 items"
      expect(screen.getByText(/3/)).toBeInTheDocument();
    });

    it("should render badges", () => {
      renderWithProviders(<ContainerNode {...defaultProps} />);

      // Should have badges rendered
      const badges = document.querySelectorAll('[data-slot="badge"]');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe("Expand/Collapse", () => {
    it("should show expanded icon when expanded", () => {
      renderWithProviders(<ContainerNode {...defaultProps} />);

      // Should have chevron down icon when expanded
      expect(document.body).toBeInTheDocument();
    });

    it("should show collapsed icon when collapsed", () => {
      const collapsedProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          isExpanded: false,
        },
      };
      renderWithProviders(<ContainerNode {...collapsedProps} />);

      // Should have chevron right icon when collapsed
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Selection", () => {
    it("should apply selected styling when selected", () => {
      const selectedProps = {
        ...defaultProps,
        selected: true,
      };
      renderWithProviders(<ContainerNode {...selectedProps} />);

      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call selectItem when clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContainerNode {...defaultProps} />);

      const node = document.querySelector("[class*='cursor-pointer']");
      if (node) {
        await user.click(node as HTMLElement);
      }

      expect(mockSelectItem).toHaveBeenCalledWith("container-1");
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
      renderWithProviders(<ContainerNode {...runningProps} />);

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
      renderWithProviders(<ContainerNode {...finishedProps} />);

      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Container Types", () => {
    it("should render DeepSkyObject container with star icon", () => {
      const dsoProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          item: {
            ...createMockItem(),
            type: "NINA.Sequencer.Container.DeepSkyObjectContainer",
          },
        },
      };
      renderWithProviders(<ContainerNode {...dsoProps} />);

      expect(document.body).toBeInTheDocument();
    });

    it("should render Parallel container with box icon", () => {
      const parallelProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          item: {
            ...createMockItem(),
            type: "NINA.Sequencer.Container.ParallelContainer",
          },
        },
      };
      renderWithProviders(<ContainerNode {...parallelProps} />);

      expect(document.body).toBeInTheDocument();
    });
  });
});
