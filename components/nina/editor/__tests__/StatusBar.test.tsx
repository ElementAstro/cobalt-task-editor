/**
 * Unit tests for StatusBar component
 */

import { render, screen } from "@testing-library/react";
import { StatusBar } from "../StatusBar";

const defaultTranslations = {
  items: "Items",
  triggers: "Triggers",
  noSelection: "No selection",
};

describe("StatusBar", () => {
  describe("Rendering", () => {
    it("should display item count", () => {
      render(
        <StatusBar
          itemCount={15}
          triggerCount={3}
          selectedItemId={null}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("15")).toBeInTheDocument();
    });

    it("should display trigger count", () => {
      render(
        <StatusBar
          itemCount={10}
          triggerCount={5}
          selectedItemId={null}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should display no selection message when no item selected", () => {
      render(
        <StatusBar
          itemCount={10}
          triggerCount={3}
          selectedItemId={null}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("No selection")).toBeInTheDocument();
    });

    it("should display selected item ID when item is selected", () => {
      render(
        <StatusBar
          itemCount={10}
          triggerCount={3}
          selectedItemId="item-12345678-abcd"
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("item-123...")).toBeInTheDocument();
    });

    it("should display items label", () => {
      render(
        <StatusBar
          itemCount={10}
          triggerCount={3}
          selectedItemId={null}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("Items:")).toBeInTheDocument();
    });

    it("should display triggers label", () => {
      render(
        <StatusBar
          itemCount={10}
          triggerCount={3}
          selectedItemId={null}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("Triggers:")).toBeInTheDocument();
    });
  });

  describe("Selection Indicator", () => {
    it("should show selection indicator when item is selected", () => {
      const { container } = render(
        <StatusBar
          itemCount={10}
          triggerCount={3}
          selectedItemId="item-123"
          translations={defaultTranslations}
        />,
      );

      // Should have a colored dot indicator
      const dot = container.querySelector(".bg-primary");
      expect(dot).toBeInTheDocument();
    });

    it("should not show selection indicator when no item selected", () => {
      const { container } = render(
        <StatusBar
          itemCount={10}
          triggerCount={3}
          selectedItemId={null}
          translations={defaultTranslations}
        />,
      );

      // Should not have a colored dot indicator
      const dot = container.querySelector(".bg-primary");
      expect(dot).not.toBeInTheDocument();
    });
  });
});
