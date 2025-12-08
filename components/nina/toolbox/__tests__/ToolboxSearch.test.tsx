/**
 * Unit tests for ToolboxSearch component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToolboxSearch } from "../ToolboxSearch";

describe("ToolboxSearch", () => {
  const defaultProps = {
    value: "",
    onChange: jest.fn(),
    placeholder: "Search items...",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render search input", () => {
      render(<ToolboxSearch {...defaultProps} />);

      expect(
        screen.getByPlaceholderText("Search items..."),
      ).toBeInTheDocument();
    });

    it("should render with current value", () => {
      render(<ToolboxSearch {...defaultProps} value="exposure" />);

      expect(screen.getByDisplayValue("exposure")).toBeInTheDocument();
    });

    it("should have accessible label", () => {
      render(<ToolboxSearch {...defaultProps} />);

      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-label",
        "Search items...",
      );
    });
  });

  describe("Interactions", () => {
    it("should call onChange when typing", async () => {
      const user = userEvent.setup();
      render(<ToolboxSearch {...defaultProps} />);

      const input = screen.getByPlaceholderText("Search items...");
      await user.type(input, "camera");

      expect(defaultProps.onChange).toHaveBeenCalled();
    });

    it("should call onChange with correct value", async () => {
      const user = userEvent.setup();
      render(<ToolboxSearch {...defaultProps} />);

      const input = screen.getByPlaceholderText("Search items...");
      await user.type(input, "a");

      expect(defaultProps.onChange).toHaveBeenCalledWith("a");
    });

    it("should call onChange when clearing input", async () => {
      const user = userEvent.setup();
      render(<ToolboxSearch {...defaultProps} value="test" />);

      const input = screen.getByDisplayValue("test");
      await user.clear(input);

      expect(defaultProps.onChange).toHaveBeenCalledWith("");
    });
  });

  describe("Placeholder", () => {
    it("should display custom placeholder", () => {
      render(
        <ToolboxSearch {...defaultProps} placeholder="Find sequence items" />,
      );

      expect(
        screen.getByPlaceholderText("Find sequence items"),
      ).toBeInTheDocument();
    });
  });
});
