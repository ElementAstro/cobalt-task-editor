/**
 * Unit tests for MobileMenu component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileMenu } from "../MobileMenu";
import { I18nProvider } from "@/lib/i18n/context";

const mockTranslations = {
  actions: "Actions",
  newSequence: "New Sequence",
  import: "Import",
  export: "Export",
  undo: "Undo",
  redo: "Redo",
};

const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe("MobileMenu", () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onNew: jest.fn(),
    onImport: jest.fn(),
    onExport: jest.fn(),
    onUndo: jest.fn(),
    onRedo: jest.fn(),
    canUndo: true,
    canRedo: true,
    activeTabId: "tab-1",
    translations: mockTranslations,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when open", () => {
      renderWithProviders(<MobileMenu {...defaultProps} />);

      expect(screen.getByText("Actions")).toBeInTheDocument();
    });

    it("should render action buttons", () => {
      renderWithProviders(<MobileMenu {...defaultProps} />);

      expect(screen.getByText("New Sequence")).toBeInTheDocument();
      expect(screen.getByText("Import")).toBeInTheDocument();
      expect(screen.getByText("Export")).toBeInTheDocument();
      expect(screen.getByText("Undo")).toBeInTheDocument();
      expect(screen.getByText("Redo")).toBeInTheDocument();
    });

    it("should disable undo button when canUndo is false", () => {
      renderWithProviders(<MobileMenu {...defaultProps} canUndo={false} />);

      const undoButton = screen.getByText("Undo").closest("button");
      expect(undoButton).toBeDisabled();
    });

    it("should disable redo button when canRedo is false", () => {
      renderWithProviders(<MobileMenu {...defaultProps} canRedo={false} />);

      const redoButton = screen.getByText("Redo").closest("button");
      expect(redoButton).toBeDisabled();
    });
  });

  describe("Interactions", () => {
    it("should call onNew and close menu when new button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<MobileMenu {...defaultProps} />);

      await user.click(screen.getByText("New Sequence"));

      expect(defaultProps.onNew).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should call onImport and close menu when import button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<MobileMenu {...defaultProps} />);

      await user.click(screen.getByText("Import"));

      expect(defaultProps.onImport).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should call onExport and close menu when export button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<MobileMenu {...defaultProps} />);

      await user.click(screen.getByText("Export"));

      expect(defaultProps.onExport).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should call onUndo and close menu when undo button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<MobileMenu {...defaultProps} />);

      await user.click(screen.getByText("Undo"));

      expect(defaultProps.onUndo).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should call onRedo and close menu when redo button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<MobileMenu {...defaultProps} />);

      await user.click(screen.getByText("Redo"));

      expect(defaultProps.onRedo).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
