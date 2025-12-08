/**
 * Unit tests for MobileToolboxSheet component
 */

import { render, screen } from "@testing-library/react";
import { MobileToolboxSheet } from "../MobileToolboxSheet";
import { I18nProvider } from "@/lib/i18n/context";

// Mock SequenceToolbox to avoid complex dependencies
jest.mock("../../SequenceToolbox", () => ({
  SequenceToolbox: ({ isMobile }: { isMobile?: boolean }) => (
    <div data-testid="sequence-toolbox" data-mobile={isMobile}>
      Sequence Toolbox
    </div>
  ),
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe("MobileToolboxSheet", () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onClose: jest.fn(),
    title: "Toolbox",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when open", () => {
      renderWithProviders(<MobileToolboxSheet {...defaultProps} />);

      expect(screen.getByText("Toolbox")).toBeInTheDocument();
    });

    it("should render SequenceToolbox", () => {
      renderWithProviders(<MobileToolboxSheet {...defaultProps} />);

      expect(screen.getByTestId("sequence-toolbox")).toBeInTheDocument();
    });

    it("should pass isMobile prop to SequenceToolbox", () => {
      renderWithProviders(<MobileToolboxSheet {...defaultProps} />);

      const toolbox = screen.getByTestId("sequence-toolbox");
      expect(toolbox).toHaveAttribute("data-mobile", "true");
    });

    it("should not render content when closed", () => {
      renderWithProviders(
        <MobileToolboxSheet {...defaultProps} open={false} />,
      );

      expect(screen.queryByTestId("sequence-toolbox")).not.toBeInTheDocument();
    });
  });

  describe("Title Display", () => {
    it("should display custom title", () => {
      renderWithProviders(
        <MobileToolboxSheet {...defaultProps} title="Custom Toolbox" />,
      );

      expect(screen.getByText("Custom Toolbox")).toBeInTheDocument();
    });
  });
});
