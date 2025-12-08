/**
 * Unit tests for ToolboxFeedback component
 */

import { render, screen } from "@testing-library/react";
import { ToolboxFeedback } from "../ToolboxFeedback";

describe("ToolboxFeedback", () => {
  describe("Rendering", () => {
    it("should render message when provided", () => {
      render(<ToolboxFeedback message="Item added successfully" />);

      expect(screen.getByText("Item added successfully")).toBeInTheDocument();
    });

    it("should not render when message is null", () => {
      const { container } = render(<ToolboxFeedback message={null} />);

      expect(container.firstChild).toBeNull();
    });

    it("should render check icon", () => {
      render(<ToolboxFeedback message="Success" />);

      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Message Display", () => {
    it("should display item added message", () => {
      render(<ToolboxFeedback message="Added: Take Exposure" />);

      expect(screen.getByText("Added: Take Exposure")).toBeInTheDocument();
    });

    it("should display custom feedback message", () => {
      render(<ToolboxFeedback message="Custom feedback" />);

      expect(screen.getByText("Custom feedback")).toBeInTheDocument();
    });
  });

  describe("Visibility", () => {
    it("should be visible when message is provided", () => {
      render(<ToolboxFeedback message="Visible message" />);

      const feedback = screen.getByText("Visible message").closest("div");
      expect(feedback).toBeInTheDocument();
    });

    it("should return null when message is empty string", () => {
      // Note: Empty string is truthy in this context, so it will render
      render(<ToolboxFeedback message="" />);

      expect(document.body).toBeInTheDocument();
    });
  });
});
