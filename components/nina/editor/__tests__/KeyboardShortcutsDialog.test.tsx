/**
 * Unit tests for KeyboardShortcutsDialog component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KeyboardShortcutsDialog } from "../KeyboardShortcutsDialog";

const mockTranslations = {
  title: "Keyboard Shortcuts",
  undo: "Undo",
  redo: "Redo",
  save: "Save",
  open: "Open",
  delete: "Delete",
  duplicate: "Duplicate",
};

describe("KeyboardShortcutsDialog", () => {
  describe("Rendering", () => {
    it("should render trigger button", () => {
      render(<KeyboardShortcutsDialog translations={mockTranslations} />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("Dialog Content", () => {
    it("should show dialog when trigger is clicked", async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcutsDialog translations={mockTranslations} />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
    });

    it("should display all shortcuts", async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcutsDialog translations={mockTranslations} />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByText("Undo")).toBeInTheDocument();
      expect(screen.getByText("Redo")).toBeInTheDocument();
      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Open")).toBeInTheDocument();
      // Delete and Duplicate may have multiple occurrences
      expect(screen.getAllByText("Delete").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Duplicate").length).toBeGreaterThan(0);
    });

    it("should display keyboard shortcuts", async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcutsDialog translations={mockTranslations} />);

      await user.click(screen.getByRole("button"));

      expect(screen.getAllByText("Ctrl").length).toBeGreaterThan(0);
      expect(screen.getByText("Z")).toBeInTheDocument();
      expect(screen.getByText("Y")).toBeInTheDocument();
      expect(screen.getByText("S")).toBeInTheDocument();
      expect(screen.getByText("O")).toBeInTheDocument();
      expect(screen.getByText("D")).toBeInTheDocument();
    });
  });
});
