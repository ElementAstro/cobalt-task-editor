/**
 * Unit tests for ToolboxSidebar component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToolboxSidebar } from "../ToolboxSidebar";
import { I18nProvider } from "@/lib/i18n/context";

// Mock SequenceToolbox to avoid complex dependencies
jest.mock("../../SequenceToolbox", () => ({
  SequenceToolbox: () => (
    <div data-testid="sequence-toolbox">Sequence Toolbox</div>
  ),
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe("ToolboxSidebar", () => {
  const defaultProps = {
    expanded: true,
    width: 280,
    onExpandedChange: jest.fn(),
    onResizeStart: jest.fn(),
    title: "Toolbox",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when expanded", () => {
      renderWithProviders(<ToolboxSidebar {...defaultProps} />);

      expect(screen.getByText("Toolbox")).toBeInTheDocument();
    });

    it("should render SequenceToolbox when expanded", () => {
      renderWithProviders(<ToolboxSidebar {...defaultProps} />);

      expect(screen.getByTestId("sequence-toolbox")).toBeInTheDocument();
    });

    it("should render collapse button", () => {
      renderWithProviders(<ToolboxSidebar {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /collapse/i }),
      ).toBeInTheDocument();
    });

    it("should render resize handle when expanded", () => {
      renderWithProviders(<ToolboxSidebar {...defaultProps} />);

      expect(screen.getByRole("separator")).toBeInTheDocument();
    });
  });

  describe("Collapsed State", () => {
    it("should show expand button when collapsed", () => {
      renderWithProviders(
        <ToolboxSidebar {...defaultProps} expanded={false} />,
      );

      expect(
        screen.getByRole("button", { name: /expand/i }),
      ).toBeInTheDocument();
    });

    it("should not render resize handle when collapsed", () => {
      renderWithProviders(
        <ToolboxSidebar {...defaultProps} expanded={false} />,
      );

      expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onExpandedChange when toggle button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolboxSidebar {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /collapse/i }));

      expect(defaultProps.onExpandedChange).toHaveBeenCalledWith(false);
    });

    it("should call onResizeStart when resize handle is pressed", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolboxSidebar {...defaultProps} />);

      const resizeHandle = screen.getByRole("separator");
      await user.pointer({ keys: "[MouseLeft>]", target: resizeHandle });

      expect(defaultProps.onResizeStart).toHaveBeenCalled();
    });
  });

  describe("Width Styling", () => {
    it("should apply custom width when expanded", () => {
      renderWithProviders(<ToolboxSidebar {...defaultProps} width={350} />);

      const sidebar = screen.getByText("Toolbox").closest("aside");
      expect(sidebar).toHaveStyle({ width: "350px" });
    });
  });
});
