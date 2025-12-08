/**
 * Unit tests for WorkflowContextMenu component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkflowContextMenu } from "../WorkflowContextMenu";
import type { Translations } from "@/lib/i18n";

const mockTranslations = {
  common: {
    duplicate: "Duplicate",
    delete: "Delete",
  },
  workflow: {
    toggleEnabled: "Toggle Enabled",
    moveToStart: "Move to...",
  },
  editor: {
    startInstructions: "Start",
    targetInstructions: "Target",
    endInstructions: "End",
  },
} as unknown as Translations;

describe("WorkflowContextMenu", () => {
  const defaultProps = {
    contextMenu: {
      x: 100,
      y: 200,
      nodeId: "node-1",
      nodeType: "item" as const,
    },
    t: mockTranslations,
    onDuplicate: jest.fn(),
    onToggleEnabled: jest.fn(),
    onMoveToArea: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when contextMenu is provided", () => {
      render(<WorkflowContextMenu {...defaultProps} />);

      expect(screen.getByText("Duplicate")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("should not render when contextMenu is null", () => {
      const { container } = render(
        <WorkflowContextMenu {...defaultProps} contextMenu={null} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render move to area options for item type", () => {
      render(<WorkflowContextMenu {...defaultProps} />);

      expect(screen.getByText("Start")).toBeInTheDocument();
      expect(screen.getByText("Target")).toBeInTheDocument();
      expect(screen.getByText("End")).toBeInTheDocument();
    });

    it("should not render item-specific options for condition type", () => {
      const conditionProps = {
        ...defaultProps,
        contextMenu: {
          ...defaultProps.contextMenu,
          nodeType: "condition" as const,
        },
      };
      render(<WorkflowContextMenu {...conditionProps} />);

      expect(screen.queryByText("Duplicate")).not.toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onDuplicate when duplicate is clicked", async () => {
      const user = userEvent.setup();
      render(<WorkflowContextMenu {...defaultProps} />);

      await user.click(screen.getByText("Duplicate"));

      expect(defaultProps.onDuplicate).toHaveBeenCalled();
    });

    it("should call onToggleEnabled when toggle is clicked", async () => {
      const user = userEvent.setup();
      render(<WorkflowContextMenu {...defaultProps} />);

      await user.click(screen.getByText("Toggle Enabled"));

      expect(defaultProps.onToggleEnabled).toHaveBeenCalled();
    });

    it("should call onMoveToArea with start when start is clicked", async () => {
      const user = userEvent.setup();
      render(<WorkflowContextMenu {...defaultProps} />);

      await user.click(screen.getByText("Start"));

      expect(defaultProps.onMoveToArea).toHaveBeenCalledWith("start");
    });

    it("should call onMoveToArea with target when target is clicked", async () => {
      const user = userEvent.setup();
      render(<WorkflowContextMenu {...defaultProps} />);

      await user.click(screen.getByText("Target"));

      expect(defaultProps.onMoveToArea).toHaveBeenCalledWith("target");
    });

    it("should call onMoveToArea with end when end is clicked", async () => {
      const user = userEvent.setup();
      render(<WorkflowContextMenu {...defaultProps} />);

      await user.click(screen.getByText("End"));

      expect(defaultProps.onMoveToArea).toHaveBeenCalledWith("end");
    });

    it("should call onDelete when delete is clicked", async () => {
      const user = userEvent.setup();
      render(<WorkflowContextMenu {...defaultProps} />);

      await user.click(screen.getByText("Delete"));

      expect(defaultProps.onDelete).toHaveBeenCalled();
    });
  });

  describe("Positioning", () => {
    it("should be positioned at contextMenu coordinates", () => {
      render(<WorkflowContextMenu {...defaultProps} />);

      const menu = screen.getByText("Duplicate").closest("div");
      expect(menu).toHaveStyle({ left: "100px", top: "200px" });
    });
  });
});
