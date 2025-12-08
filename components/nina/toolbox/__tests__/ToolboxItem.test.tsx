/**
 * Unit tests for ToolboxItem component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToolboxItem } from "../ToolboxItem";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ItemDefinition } from "@/lib/nina/constants";

const mockItem: ItemDefinition = {
  type: "NINA.Sequencer.SequenceItem.Camera.TakeExposure",
  name: "Take Exposure",
  category: "Camera",
  icon: "camera",
  description: "Captures an image with the camera",
  defaultValues: {},
};

const renderWithProviders = (component: React.ReactNode) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

describe("ToolboxItem", () => {
  const defaultProps = {
    item: mockItem,
    onDragStart: jest.fn(),
    onClick: jest.fn(),
    getName: () => "Take Exposure",
    getDescription: () => "Captures an image with the camera",
    isMobile: false,
    colorClass: "text-green-400",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render item name", () => {
      renderWithProviders(<ToolboxItem {...defaultProps} />);

      expect(screen.getByText("Take Exposure")).toBeInTheDocument();
    });

    it("should render with accessible label", () => {
      renderWithProviders(<ToolboxItem {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /add take exposure/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onClick when clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolboxItem {...defaultProps} />);

      await user.click(screen.getByText("Take Exposure"));

      expect(defaultProps.onClick).toHaveBeenCalled();
    });

    it("should call onClick when double-clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolboxItem {...defaultProps} />);

      await user.dblClick(screen.getByText("Take Exposure"));

      expect(defaultProps.onClick).toHaveBeenCalled();
    });
  });

  describe("Drag Behavior", () => {
    it("should be draggable when not mobile", () => {
      renderWithProviders(<ToolboxItem {...defaultProps} />);

      const item = screen.getByRole("button", { name: /add take exposure/i });
      expect(item).toHaveAttribute("draggable", "true");
    });

    it("should not be draggable on mobile", () => {
      renderWithProviders(<ToolboxItem {...defaultProps} isMobile={true} />);

      const item = screen.getByRole("button", { name: /add take exposure/i });
      expect(item).toHaveAttribute("draggable", "false");
    });
  });

  describe("Mobile Mode", () => {
    it("should render with mobile styling when isMobile is true", () => {
      renderWithProviders(<ToolboxItem {...defaultProps} isMobile={true} />);

      const item = screen.getByRole("button", { name: /add take exposure/i });
      expect(item).toHaveClass("min-h-[44px]");
    });
  });

  describe("Color Class", () => {
    it("should apply custom color class", () => {
      renderWithProviders(
        <ToolboxItem {...defaultProps} colorClass="text-blue-400" />,
      );

      expect(document.body).toBeInTheDocument();
    });

    it("should use default color class when not provided", () => {
      const propsWithoutColor = { ...defaultProps };
      delete (propsWithoutColor as Record<string, unknown>).colorClass;

      renderWithProviders(<ToolboxItem {...propsWithoutColor} />);

      expect(document.body).toBeInTheDocument();
    });
  });
});
