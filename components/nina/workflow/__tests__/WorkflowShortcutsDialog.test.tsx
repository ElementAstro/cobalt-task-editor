/**
 * Unit tests for WorkflowShortcutsDialog component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkflowShortcutsDialog } from "../WorkflowShortcutsDialog";
import type { Translations } from "@/lib/i18n";

const mockTranslations = {
  shortcuts: {
    title: "Keyboard Shortcuts",
    undo: "Undo",
    redo: "Redo",
    delete: "Delete",
    duplicate: "Duplicate",
    copy: "Copy",
    cut: "Cut",
    paste: "Paste",
    selectAll: "Select All",
  },
  common: {
    close: "Close",
  },
} as unknown as Translations;

describe("WorkflowShortcutsDialog", () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    t: mockTranslations,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when open", () => {
      render(<WorkflowShortcutsDialog {...defaultProps} />);

      expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
    });

    it("should not render when closed", () => {
      render(<WorkflowShortcutsDialog {...defaultProps} open={false} />);

      expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
    });

    it("should render all shortcuts", () => {
      render(<WorkflowShortcutsDialog {...defaultProps} />);

      expect(screen.getByText("Undo")).toBeInTheDocument();
      expect(screen.getByText("Redo")).toBeInTheDocument();
      // Delete appears twice (label and key)
      expect(screen.getAllByText("Delete").length).toBeGreaterThan(0);
      expect(screen.getByText("Duplicate")).toBeInTheDocument();
      expect(screen.getByText("Copy")).toBeInTheDocument();
      expect(screen.getByText("Cut")).toBeInTheDocument();
      expect(screen.getByText("Paste")).toBeInTheDocument();
      expect(screen.getByText("Select All")).toBeInTheDocument();
    });

    it("should render keyboard shortcuts", () => {
      render(<WorkflowShortcutsDialog {...defaultProps} />);

      expect(screen.getByText("Ctrl+Z")).toBeInTheDocument();
      expect(screen.getByText("Ctrl+Y")).toBeInTheDocument();
      expect(screen.getByText("Ctrl+D")).toBeInTheDocument();
      expect(screen.getByText("Ctrl+C")).toBeInTheDocument();
      expect(screen.getByText("Ctrl+X")).toBeInTheDocument();
      expect(screen.getByText("Ctrl+V")).toBeInTheDocument();
      expect(screen.getByText("Ctrl+A")).toBeInTheDocument();
    });

    it("should render close button", () => {
      render(<WorkflowShortcutsDialog {...defaultProps} />);

      expect(screen.getByText("Close")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<WorkflowShortcutsDialog {...defaultProps} />);

      await user.click(screen.getByText("Close"));

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it("should call onClose when backdrop is clicked", async () => {
      const user = userEvent.setup();
      render(<WorkflowShortcutsDialog {...defaultProps} />);

      const backdrop = screen.getByText("Keyboard Shortcuts").closest(".fixed");
      if (backdrop) {
        await user.click(backdrop);
      }

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it("should not close when dialog content is clicked", async () => {
      const user = userEvent.setup();
      render(<WorkflowShortcutsDialog {...defaultProps} />);

      await user.click(screen.getByText("Keyboard Shortcuts"));

      // onClose should not be called when clicking inside the dialog
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });
});
