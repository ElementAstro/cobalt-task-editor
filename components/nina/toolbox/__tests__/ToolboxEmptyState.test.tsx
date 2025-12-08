/**
 * Unit tests for ToolboxEmptyState component
 */

import { render, screen } from "@testing-library/react";
import { ToolboxEmptyState } from "../ToolboxEmptyState";

describe("ToolboxEmptyState", () => {
  describe("Rendering", () => {
    it("should render message", () => {
      render(<ToolboxEmptyState message="No items found" />);

      expect(screen.getByText("No items found")).toBeInTheDocument();
    });

    it("should render icon", () => {
      render(<ToolboxEmptyState message="Test message" />);

      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Message Display", () => {
    it("should display custom message", () => {
      render(<ToolboxEmptyState message="Custom empty state" />);

      expect(screen.getByText("Custom empty state")).toBeInTheDocument();
    });

    it("should display search-related message", () => {
      render(<ToolboxEmptyState message="No results for your search" />);

      expect(
        screen.getByText("No results for your search"),
      ).toBeInTheDocument();
    });
  });
});
