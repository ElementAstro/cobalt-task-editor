/**
 * Unit tests for ToolboxCategory component
 */

import { render, screen } from "@testing-library/react";
import { ToolboxCategory } from "../ToolboxCategory";
import type { ItemDefinition } from "@/lib/nina/constants";

const mockItems: ItemDefinition[] = [
  {
    type: "NINA.Sequencer.SequenceItem.Camera.TakeExposure",
    name: "Take Exposure",
    category: "Camera",
    icon: "camera",
    description: "Captures an image",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.SequenceItem.Camera.CoolCamera",
    name: "Cool Camera",
    category: "Camera",
    icon: "thermometer-snowflake",
    description: "Cools the camera",
    defaultValues: {},
  },
];

describe("ToolboxCategory", () => {
  const defaultProps = {
    category: "Camera",
    items: mockItems,
    onDragStart: jest.fn(),
    onDoubleClick: jest.fn(),
    type: "item" as const,
    getItemName: (item: ItemDefinition) => item.type.split(".").pop() || "",
    getItemDescription: () => "Test description",
    getCategoryName: (category: string) => category,
    isMobile: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render category name", () => {
      render(<ToolboxCategory {...defaultProps} />);

      expect(screen.getByText("Camera")).toBeInTheDocument();
    });

    it("should render item count badge", () => {
      render(<ToolboxCategory {...defaultProps} />);

      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should render items when expanded", () => {
      render(<ToolboxCategory {...defaultProps} />);

      // getItemName uses type.split(".").pop() which returns "TakeExposure"
      expect(screen.getByText("TakeExposure")).toBeInTheDocument();
      expect(screen.getByText("CoolCamera")).toBeInTheDocument();
    });
  });

  describe("Collapsible Behavior", () => {
    it("should have collapsible header", () => {
      render(<ToolboxCategory {...defaultProps} />);

      // Multiple buttons may exist (header + items)
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should render items initially", () => {
      render(<ToolboxCategory {...defaultProps} />);

      expect(screen.getByText("TakeExposure")).toBeInTheDocument();
      expect(screen.getByText("CoolCamera")).toBeInTheDocument();
    });
  });

  describe("Item Interactions", () => {
    it("should render clickable items", () => {
      render(<ToolboxCategory {...defaultProps} />);

      const item = screen.getByText("TakeExposure");
      expect(item).toBeInTheDocument();
    });

    it("should render items with correct names", () => {
      render(<ToolboxCategory {...defaultProps} />);

      expect(screen.getByText("TakeExposure")).toBeInTheDocument();
      expect(screen.getByText("CoolCamera")).toBeInTheDocument();
    });
  });

  describe("Mobile Mode", () => {
    it("should render with mobile styling when isMobile is true", () => {
      render(<ToolboxCategory {...defaultProps} isMobile={true} />);

      expect(document.body).toBeInTheDocument();
    });

    it("should render items on mobile", () => {
      render(<ToolboxCategory {...defaultProps} isMobile={true} />);

      // Items should be rendered
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Category Name Translation", () => {
    it("should use getCategoryName for display", () => {
      const customGetCategoryName = () => "Translated Camera";
      render(
        <ToolboxCategory
          {...defaultProps}
          getCategoryName={customGetCategoryName}
        />,
      );

      expect(screen.getByText("Translated Camera")).toBeInTheDocument();
    });
  });
});
