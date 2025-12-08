/**
 * Unit tests for PropertySidebar component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertySidebar } from "../PropertySidebar";
import { I18nProvider } from "@/lib/i18n/context";

// Mock PropertyPanel to avoid complex dependencies
jest.mock("../../PropertyPanel", () => ({
  PropertyPanel: () => <div data-testid="property-panel">Property Panel</div>,
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe("PropertySidebar", () => {
  const defaultProps = {
    expanded: true,
    width: 300,
    onExpandedChange: jest.fn(),
    onResizeStart: jest.fn(),
    title: "Properties",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when expanded", () => {
      renderWithProviders(<PropertySidebar {...defaultProps} />);

      expect(screen.getByText("Properties")).toBeInTheDocument();
    });

    it("should render PropertyPanel when expanded", () => {
      renderWithProviders(<PropertySidebar {...defaultProps} />);

      expect(screen.getByTestId("property-panel")).toBeInTheDocument();
    });

    it("should render collapse button", () => {
      renderWithProviders(<PropertySidebar {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /collapse/i }),
      ).toBeInTheDocument();
    });

    it("should render resize handle when expanded", () => {
      renderWithProviders(<PropertySidebar {...defaultProps} />);

      expect(screen.getByRole("separator")).toBeInTheDocument();
    });
  });

  describe("Collapsed State", () => {
    it("should show expand button when collapsed", () => {
      renderWithProviders(
        <PropertySidebar {...defaultProps} expanded={false} />,
      );

      expect(
        screen.getByRole("button", { name: /expand/i }),
      ).toBeInTheDocument();
    });

    it("should not render resize handle when collapsed", () => {
      renderWithProviders(
        <PropertySidebar {...defaultProps} expanded={false} />,
      );

      expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onExpandedChange when toggle button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<PropertySidebar {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /collapse/i }));

      expect(defaultProps.onExpandedChange).toHaveBeenCalledWith(false);
    });

    it("should call onResizeStart when resize handle is pressed", async () => {
      const user = userEvent.setup();
      renderWithProviders(<PropertySidebar {...defaultProps} />);

      const resizeHandle = screen.getByRole("separator");
      await user.pointer({ keys: "[MouseLeft>]", target: resizeHandle });

      expect(defaultProps.onResizeStart).toHaveBeenCalled();
    });
  });

  describe("Width Styling", () => {
    it("should apply custom width when expanded", () => {
      renderWithProviders(
        <PropertySidebar {...defaultProps} width={400} />,
      );

      const sidebar = screen.getByText("Properties").closest("aside");
      expect(sidebar).toHaveStyle({ width: "400px" });
    });
  });
});
