/**
 * Unit tests for EditorModeToggle component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorModeToggle } from "../EditorModeToggle";

const defaultTranslations = {
  normalMode: "Normal Mode",
  advancedMode: "Advanced Mode",
  modeDescription: "Select editor mode",
  normalModeDesc: "Simplified interface",
  advancedModeDesc: "Full features",
};

describe("EditorModeToggle", () => {
  describe("Rendering", () => {
    it("should render toggle button", () => {
      const onModeChange = jest.fn();

      render(
        <EditorModeToggle
          editorMode="normal"
          onModeChange={onModeChange}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should show normal mode text when in normal mode", () => {
      const onModeChange = jest.fn();

      render(
        <EditorModeToggle
          editorMode="normal"
          onModeChange={onModeChange}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("Normal Mode")).toBeInTheDocument();
    });

    it("should show advanced mode text when in advanced mode", () => {
      const onModeChange = jest.fn();

      render(
        <EditorModeToggle
          editorMode="advanced"
          onModeChange={onModeChange}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("Advanced Mode")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should open dropdown menu when clicked", async () => {
      const user = userEvent.setup();
      const onModeChange = jest.fn();

      render(
        <EditorModeToggle
          editorMode="normal"
          onModeChange={onModeChange}
          translations={defaultTranslations}
        />,
      );

      await user.click(screen.getByRole("button"));

      expect(screen.getByText("Select editor mode")).toBeInTheDocument();
    });

    it("should call onModeChange when selecting normal mode", async () => {
      const user = userEvent.setup();
      const onModeChange = jest.fn();

      render(
        <EditorModeToggle
          editorMode="advanced"
          onModeChange={onModeChange}
          translations={defaultTranslations}
        />,
      );

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByText("Simplified interface").closest('[role="menuitem"]')!);

      expect(onModeChange).toHaveBeenCalledWith("normal");
    });

    it("should call onModeChange when selecting advanced mode", async () => {
      const user = userEvent.setup();
      const onModeChange = jest.fn();

      render(
        <EditorModeToggle
          editorMode="normal"
          onModeChange={onModeChange}
          translations={defaultTranslations}
        />,
      );

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByText("Full features").closest('[role="menuitem"]')!);

      expect(onModeChange).toHaveBeenCalledWith("advanced");
    });
  });
});
