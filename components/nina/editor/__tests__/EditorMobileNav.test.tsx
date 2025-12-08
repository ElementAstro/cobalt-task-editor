/**
 * Unit tests for EditorMobileNav component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorMobileNav } from "../EditorMobileNav";
import type { Translations } from "@/lib/i18n";

const mockTranslations = {
  toolbox: {
    title: "Toolbox",
    items: "items",
  },
  properties: {
    title: "Properties",
  },
} as unknown as Translations;

describe("EditorMobileNav", () => {
  const defaultProps = {
    itemCount: 5,
    onOpenToolbox: jest.fn(),
    onOpenProperties: jest.fn(),
    t: mockTranslations,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render navigation buttons", () => {
      render(<EditorMobileNav {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBe(2);
    });

    it("should display item count", () => {
      render(<EditorMobileNav {...defaultProps} />);

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should display toolbox label", () => {
      render(<EditorMobileNav {...defaultProps} />);

      expect(screen.getByText("Toolbox")).toBeInTheDocument();
    });

    it("should display properties label", () => {
      render(<EditorMobileNav {...defaultProps} />);

      expect(screen.getByText("Properties")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onOpenToolbox when toolbox button is clicked", async () => {
      const user = userEvent.setup();
      render(<EditorMobileNav {...defaultProps} />);

      const toolboxButton = screen.getAllByRole("button")[0];
      await user.click(toolboxButton);

      expect(defaultProps.onOpenToolbox).toHaveBeenCalled();
    });

    it("should call onOpenProperties when properties button is clicked", async () => {
      const user = userEvent.setup();
      render(<EditorMobileNav {...defaultProps} />);

      const propertiesButton = screen.getAllByRole("button")[1];
      await user.click(propertiesButton);

      expect(defaultProps.onOpenProperties).toHaveBeenCalled();
    });
  });

  describe("Item Count Display", () => {
    it("should update item count when prop changes", () => {
      const { rerender } = render(<EditorMobileNav {...defaultProps} />);

      expect(screen.getByText("5")).toBeInTheDocument();

      rerender(<EditorMobileNav {...defaultProps} itemCount={10} />);

      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("should display zero item count", () => {
      render(<EditorMobileNav {...defaultProps} itemCount={0} />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });
});
