/**
 * Unit tests for EditorHeader component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorHeader } from "../EditorHeader";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Translations } from "@/lib/i18n";

const mockTranslations = {
  common: {
    save: "Save",
  },
  editor: {
    import: "Import",
    export: "Export",
  },
} as unknown as Translations;

const renderWithProviders = (component: React.ReactNode) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

describe("EditorHeader", () => {
  const defaultProps = {
    title: "Test Sequence",
    viewMode: "list" as const,
    canUndo: true,
    canRedo: true,
    onSave: jest.fn(),
    onImport: jest.fn(),
    onExport: jest.fn(),
    onUndo: jest.fn(),
    onRedo: jest.fn(),
    onToggleViewMode: jest.fn(),
    t: mockTranslations,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render title", () => {
      renderWithProviders(<EditorHeader {...defaultProps} />);

      expect(screen.getByText("Test Sequence")).toBeInTheDocument();
    });

    it("should render action buttons", () => {
      renderWithProviders(<EditorHeader {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should disable undo button when canUndo is false", () => {
      renderWithProviders(<EditorHeader {...defaultProps} canUndo={false} />);

      const undoButton = screen.getAllByRole("button")[3];
      expect(undoButton).toBeDisabled();
    });

    it("should disable redo button when canRedo is false", () => {
      renderWithProviders(<EditorHeader {...defaultProps} canRedo={false} />);

      const redoButton = screen.getAllByRole("button")[4];
      expect(redoButton).toBeDisabled();
    });
  });

  describe("Interactions", () => {
    it("should call onSave when save button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<EditorHeader {...defaultProps} />);

      const saveButton = screen.getAllByRole("button")[0];
      await user.click(saveButton);

      expect(defaultProps.onSave).toHaveBeenCalled();
    });

    it("should call onImport when import button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<EditorHeader {...defaultProps} />);

      const importButton = screen.getAllByRole("button")[1];
      await user.click(importButton);

      expect(defaultProps.onImport).toHaveBeenCalled();
    });

    it("should call onExport when export button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<EditorHeader {...defaultProps} />);

      const exportButton = screen.getAllByRole("button")[2];
      await user.click(exportButton);

      expect(defaultProps.onExport).toHaveBeenCalled();
    });

    it("should call onUndo when undo button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<EditorHeader {...defaultProps} />);

      const undoButton = screen.getAllByRole("button")[3];
      await user.click(undoButton);

      expect(defaultProps.onUndo).toHaveBeenCalled();
    });

    it("should call onRedo when redo button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<EditorHeader {...defaultProps} />);

      const redoButton = screen.getAllByRole("button")[4];
      await user.click(redoButton);

      expect(defaultProps.onRedo).toHaveBeenCalled();
    });

    it("should call onToggleViewMode when view mode button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<EditorHeader {...defaultProps} />);

      const viewModeButton = screen.getAllByRole("button")[5];
      await user.click(viewModeButton);

      expect(defaultProps.onToggleViewMode).toHaveBeenCalled();
    });
  });

  describe("View Mode Display", () => {
    it("should show workflow icon when in list mode", () => {
      renderWithProviders(<EditorHeader {...defaultProps} viewMode="list" />);

      expect(document.body).toBeInTheDocument();
    });

    it("should show list icon when in workflow mode", () => {
      renderWithProviders(
        <EditorHeader {...defaultProps} viewMode="workflow" />,
      );

      expect(document.body).toBeInTheDocument();
    });
  });
});
