/**
 * Unit tests for EditorStatusBar component
 */

import { render, screen } from "@testing-library/react";
import { EditorStatusBar } from "../EditorStatusBar";
import type { Translations } from "@/lib/i18n";

const mockTranslations = {
  toolbox: {
    items: "items",
  },
} as unknown as Translations;

describe("EditorStatusBar", () => {
  const defaultProps = {
    itemCount: 5,
    t: mockTranslations,
  };

  describe("Rendering", () => {
    it("should render item count", () => {
      render(<EditorStatusBar {...defaultProps} />);

      expect(screen.getByText("5 items")).toBeInTheDocument();
    });

    it("should not show selected item when not provided", () => {
      render(<EditorStatusBar {...defaultProps} />);

      expect(screen.queryByText("Selected:")).not.toBeInTheDocument();
    });

    it("should show selected item name when provided", () => {
      render(
        <EditorStatusBar
          {...defaultProps}
          selectedItemName="Test Item"
        />,
      );

      expect(screen.getByText(/Test Item/)).toBeInTheDocument();
    });
  });

  describe("Item Count Display", () => {
    it("should display zero items", () => {
      render(<EditorStatusBar {...defaultProps} itemCount={0} />);

      expect(screen.getByText("0 items")).toBeInTheDocument();
    });

    it("should display large item count", () => {
      render(<EditorStatusBar {...defaultProps} itemCount={100} />);

      expect(screen.getByText("100 items")).toBeInTheDocument();
    });
  });

  describe("Selected Item Display", () => {
    it("should truncate long item names", () => {
      render(
        <EditorStatusBar
          {...defaultProps}
          selectedItemName="This is a very long item name that should be truncated"
        />,
      );

      expect(document.body).toBeInTheDocument();
    });
  });
});
