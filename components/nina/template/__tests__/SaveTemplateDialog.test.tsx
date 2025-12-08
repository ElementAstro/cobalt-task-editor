/**
 * Unit tests for SaveTemplateDialog component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SaveTemplateDialog } from "../SaveTemplateDialog";
import { I18nProvider } from "@/lib/i18n/context";

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe("SaveTemplateDialog", () => {
  describe("Rendering", () => {
    it("should render dialog when open", () => {
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />,
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render dialog when closed", () => {
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={false}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />,
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should show create mode title by default", () => {
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />,
      );

      expect(screen.getByText(/save as template/i)).toBeInTheDocument();
    });

    it("should show edit mode title when mode is edit", () => {
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
          mode="edit"
        />,
      );

      // Check for dialog title specifically
      expect(screen.getByRole("heading", { name: /edit template/i })).toBeInTheDocument();
    });

    it("should display name input field", () => {
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />,
      );

      expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
    });

    it("should display description input field", () => {
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />,
      );

      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it("should pre-fill inputs with initial values", () => {
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
          initialName="Initial Name"
          initialDescription="Initial Description"
        />,
      );

      expect(screen.getByDisplayValue("Initial Name")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Initial Description")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should update name input when typing", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />,
      );

      const nameInput = screen.getByLabelText(/template name/i);
      await user.type(nameInput, "New Template");

      expect(nameInput).toHaveValue("New Template");
    });

    it("should update description input when typing", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />,
      );

      const descInput = screen.getByLabelText(/description/i);
      await user.type(descInput, "New Description");

      expect(descInput).toHaveValue("New Description");
    });

    it("should disable save button when name is empty", () => {
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />,
      );

      const saveButton = screen.getByRole("button", { name: /create template|save/i });
      expect(saveButton).toBeDisabled();
    });

    it("should enable save button when name is provided", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />,
      );

      const nameInput = screen.getByLabelText(/template name/i);
      await user.type(nameInput, "Template Name");

      const saveButton = screen.getByRole("button", { name: /create template/i });
      expect(saveButton).not.toBeDisabled();
    });

    it("should call onSave with name and description when save is clicked", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />,
      );

      const nameInput = screen.getByLabelText(/template name/i);
      const descInput = screen.getByLabelText(/description/i);

      await user.type(nameInput, "My Template");
      await user.type(descInput, "My Description");

      const saveButton = screen.getByRole("button", { name: /create template/i });
      await user.click(saveButton);

      expect(onSave).toHaveBeenCalledWith("My Template", "My Description");
    });

    it("should call onOpenChange(false) when cancel is clicked", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />,
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should close dialog after saving", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />,
      );

      const nameInput = screen.getByLabelText(/template name/i);
      await user.type(nameInput, "Template");

      const saveButton = screen.getByRole("button", { name: /create template/i });
      await user.click(saveButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should trim whitespace from name and description", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />,
      );

      const nameInput = screen.getByLabelText(/template name/i);
      const descInput = screen.getByLabelText(/description/i);

      await user.type(nameInput, "  Trimmed Name  ");
      await user.type(descInput, "  Trimmed Desc  ");

      const saveButton = screen.getByRole("button", { name: /create template/i });
      await user.click(saveButton);

      expect(onSave).toHaveBeenCalledWith("Trimmed Name", "Trimmed Desc");
    });
  });

  describe("Accessibility", () => {
    it("should have labeled inputs", () => {
      const onOpenChange = jest.fn();
      const onSave = jest.fn();

      renderWithProviders(
        <SaveTemplateDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />,
      );

      expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });
  });
});
