/**
 * Unit tests for MobilePropertiesSheet component
 */

import { render, screen } from "@testing-library/react";
import { MobilePropertiesSheet } from "../MobilePropertiesSheet";
import { I18nProvider } from "@/lib/i18n/context";

// Mock PropertyPanel to avoid complex dependencies
jest.mock("../../PropertyPanel", () => ({
  PropertyPanel: () => <div data-testid="property-panel">Property Panel</div>,
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe("MobilePropertiesSheet", () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    title: "Properties",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when open", () => {
      renderWithProviders(<MobilePropertiesSheet {...defaultProps} />);

      expect(screen.getByText("Properties")).toBeInTheDocument();
    });

    it("should render PropertyPanel", () => {
      renderWithProviders(<MobilePropertiesSheet {...defaultProps} />);

      expect(screen.getByTestId("property-panel")).toBeInTheDocument();
    });

    it("should not render content when closed", () => {
      renderWithProviders(
        <MobilePropertiesSheet {...defaultProps} open={false} />,
      );

      expect(screen.queryByTestId("property-panel")).not.toBeInTheDocument();
    });
  });

  describe("Title Display", () => {
    it("should display custom title", () => {
      renderWithProviders(
        <MobilePropertiesSheet {...defaultProps} title="Custom Title" />,
      );

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });
  });
});
