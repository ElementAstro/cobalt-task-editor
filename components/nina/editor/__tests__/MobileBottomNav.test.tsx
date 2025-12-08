/**
 * Unit tests for MobileBottomNav component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileBottomNav } from "../MobileBottomNav";

const defaultTranslations = {
  toolbox: "Toolbox",
  properties: "Properties",
  items: "Items",
};

describe("MobileBottomNav", () => {
  describe("Rendering", () => {
    it("should render toolbox button", () => {
      render(
        <MobileBottomNav
          onToolboxOpen={jest.fn()}
          onPropertiesOpen={jest.fn()}
          itemCount={10}
          hasSelection={false}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("Toolbox")).toBeInTheDocument();
    });

    it("should render properties button", () => {
      render(
        <MobileBottomNav
          onToolboxOpen={jest.fn()}
          onPropertiesOpen={jest.fn()}
          itemCount={10}
          hasSelection={false}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("Properties")).toBeInTheDocument();
    });

    it("should display item count", () => {
      render(
        <MobileBottomNav
          onToolboxOpen={jest.fn()}
          onPropertiesOpen={jest.fn()}
          itemCount={25}
          hasSelection={false}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("25")).toBeInTheDocument();
    });

    it("should display items label", () => {
      render(
        <MobileBottomNav
          onToolboxOpen={jest.fn()}
          onPropertiesOpen={jest.fn()}
          itemCount={10}
          hasSelection={false}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("Items")).toBeInTheDocument();
    });
  });

  describe("Selection Indicator", () => {
    it("should show selection indicator when hasSelection is true", () => {
      const { container } = render(
        <MobileBottomNav
          onToolboxOpen={jest.fn()}
          onPropertiesOpen={jest.fn()}
          itemCount={10}
          hasSelection={true}
          translations={defaultTranslations}
        />,
      );

      const indicator = container.querySelector(".animate-pulse");
      expect(indicator).toBeInTheDocument();
    });

    it("should not show selection indicator when hasSelection is false", () => {
      const { container } = render(
        <MobileBottomNav
          onToolboxOpen={jest.fn()}
          onPropertiesOpen={jest.fn()}
          itemCount={10}
          hasSelection={false}
          translations={defaultTranslations}
        />,
      );

      const indicator = container.querySelector(".animate-pulse");
      expect(indicator).not.toBeInTheDocument();
    });

    it("should highlight properties button when hasSelection is true", () => {
      const { container } = render(
        <MobileBottomNav
          onToolboxOpen={jest.fn()}
          onPropertiesOpen={jest.fn()}
          itemCount={10}
          hasSelection={true}
          translations={defaultTranslations}
        />,
      );

      const propertiesButton = container.querySelector(".text-primary");
      expect(propertiesButton).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onToolboxOpen when toolbox button is clicked", async () => {
      const user = userEvent.setup();
      const onToolboxOpen = jest.fn();

      render(
        <MobileBottomNav
          onToolboxOpen={onToolboxOpen}
          onPropertiesOpen={jest.fn()}
          itemCount={10}
          hasSelection={false}
          translations={defaultTranslations}
        />,
      );

      await user.click(screen.getByLabelText("Toolbox"));

      expect(onToolboxOpen).toHaveBeenCalledTimes(1);
    });

    it("should call onPropertiesOpen when properties button is clicked", async () => {
      const user = userEvent.setup();
      const onPropertiesOpen = jest.fn();

      render(
        <MobileBottomNav
          onToolboxOpen={jest.fn()}
          onPropertiesOpen={onPropertiesOpen}
          itemCount={10}
          hasSelection={false}
          translations={defaultTranslations}
        />,
      );

      await user.click(screen.getByLabelText("Properties"));

      expect(onPropertiesOpen).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("should have navigation role", () => {
      render(
        <MobileBottomNav
          onToolboxOpen={jest.fn()}
          onPropertiesOpen={jest.fn()}
          itemCount={10}
          hasSelection={false}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should have aria-label on navigation", () => {
      render(
        <MobileBottomNav
          onToolboxOpen={jest.fn()}
          onPropertiesOpen={jest.fn()}
          itemCount={10}
          hasSelection={false}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByRole("navigation")).toHaveAttribute(
        "aria-label",
        "Mobile navigation",
      );
    });
  });
});
