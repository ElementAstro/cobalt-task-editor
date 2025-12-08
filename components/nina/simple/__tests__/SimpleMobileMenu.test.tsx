/**
 * Unit tests for SimpleMobileMenu component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SimpleMobileMenu } from "../SimpleMobileMenu";
import type { Translations } from "@/lib/i18n";

const mockTranslations = {
  common: {
    actions: "Actions",
  },
  editor: {
    newSequence: "New",
    undo: "Undo",
    redo: "Redo",
  },
  simple: {
    importJSON: "Import JSON",
    importCSV: "Import CSV",
    exportJSON: "Export JSON",
    exportCSV: "Export CSV",
    exportXML: "Export NINA",
  },
} as unknown as Translations;

describe("SimpleMobileMenu", () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    canUndo: true,
    canRedo: true,
    onNew: jest.fn(),
    onImportJSON: jest.fn(),
    onImportCSV: jest.fn(),
    onExportJSON: jest.fn(),
    onExportCSV: jest.fn(),
    onExportXML: jest.fn(),
    onUndo: jest.fn(),
    onRedo: jest.fn(),
    t: mockTranslations,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when open", () => {
      render(<SimpleMobileMenu {...defaultProps} />);

      expect(screen.getByText("Actions")).toBeInTheDocument();
    });

    it("should render all action buttons", () => {
      render(<SimpleMobileMenu {...defaultProps} />);

      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getByText("Import JSON")).toBeInTheDocument();
      expect(screen.getByText("Import CSV")).toBeInTheDocument();
      expect(screen.getByText("Export JSON")).toBeInTheDocument();
      expect(screen.getByText("Export CSV")).toBeInTheDocument();
      expect(screen.getByText("Export NINA")).toBeInTheDocument();
      expect(screen.getByText("Undo")).toBeInTheDocument();
      expect(screen.getByText("Redo")).toBeInTheDocument();
    });

    it("should disable undo button when canUndo is false", () => {
      render(<SimpleMobileMenu {...defaultProps} canUndo={false} />);

      const undoButton = screen.getByText("Undo").closest("button");
      expect(undoButton).toBeDisabled();
    });

    it("should disable redo button when canRedo is false", () => {
      render(<SimpleMobileMenu {...defaultProps} canRedo={false} />);

      const redoButton = screen.getByText("Redo").closest("button");
      expect(redoButton).toBeDisabled();
    });
  });

  describe("Interactions", () => {
    it("should call onNew and close menu when new button is clicked", async () => {
      const user = userEvent.setup();
      render(<SimpleMobileMenu {...defaultProps} />);

      await user.click(screen.getByText("New"));

      expect(defaultProps.onNew).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should call onImportJSON and close menu", async () => {
      const user = userEvent.setup();
      render(<SimpleMobileMenu {...defaultProps} />);

      await user.click(screen.getByText("Import JSON"));

      expect(defaultProps.onImportJSON).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should call onImportCSV and close menu", async () => {
      const user = userEvent.setup();
      render(<SimpleMobileMenu {...defaultProps} />);

      await user.click(screen.getByText("Import CSV"));

      expect(defaultProps.onImportCSV).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should call onExportJSON and close menu", async () => {
      const user = userEvent.setup();
      render(<SimpleMobileMenu {...defaultProps} />);

      await user.click(screen.getByText("Export JSON"));

      expect(defaultProps.onExportJSON).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should call onExportCSV and close menu", async () => {
      const user = userEvent.setup();
      render(<SimpleMobileMenu {...defaultProps} />);

      await user.click(screen.getByText("Export CSV"));

      expect(defaultProps.onExportCSV).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should call onExportXML and close menu", async () => {
      const user = userEvent.setup();
      render(<SimpleMobileMenu {...defaultProps} />);

      await user.click(screen.getByText("Export NINA"));

      expect(defaultProps.onExportXML).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should call onUndo and close menu", async () => {
      const user = userEvent.setup();
      render(<SimpleMobileMenu {...defaultProps} />);

      await user.click(screen.getByText("Undo"));

      expect(defaultProps.onUndo).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should call onRedo and close menu", async () => {
      const user = userEvent.setup();
      render(<SimpleMobileMenu {...defaultProps} />);

      await user.click(screen.getByText("Redo"));

      expect(defaultProps.onRedo).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
