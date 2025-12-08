/**
 * Unit tests for ConfirmNewDialog component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmNewDialog } from "../ConfirmNewDialog";

const defaultTranslations = {
  unsavedChanges: "Unsaved Changes",
  confirmNew: "Are you sure you want to create a new sequence?",
  cancel: "Cancel",
  confirm: "Confirm",
};

describe("ConfirmNewDialog", () => {
  describe("Rendering", () => {
    it("should render dialog when open", () => {
      const onOpenChange = jest.fn();
      const onConfirm = jest.fn();

      render(
        <ConfirmNewDialog
          open={true}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("should not render dialog when closed", () => {
      const onOpenChange = jest.fn();
      const onConfirm = jest.fn();

      render(
        <ConfirmNewDialog
          open={false}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
          translations={defaultTranslations}
        />,
      );

      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("should display title", () => {
      const onOpenChange = jest.fn();
      const onConfirm = jest.fn();

      render(
        <ConfirmNewDialog
          open={true}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("Unsaved Changes")).toBeInTheDocument();
    });

    it("should display description", () => {
      const onOpenChange = jest.fn();
      const onConfirm = jest.fn();

      render(
        <ConfirmNewDialog
          open={true}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
          translations={defaultTranslations}
        />,
      );

      expect(
        screen.getByText("Are you sure you want to create a new sequence?"),
      ).toBeInTheDocument();
    });

    it("should display cancel and confirm buttons", () => {
      const onOpenChange = jest.fn();
      const onConfirm = jest.fn();

      render(
        <ConfirmNewDialog
          open={true}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onConfirm when confirm button is clicked", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      const onConfirm = jest.fn();

      render(
        <ConfirmNewDialog
          open={true}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
          translations={defaultTranslations}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Confirm" }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("should call onOpenChange(false) when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      const onConfirm = jest.fn();

      render(
        <ConfirmNewDialog
          open={true}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
          translations={defaultTranslations}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
