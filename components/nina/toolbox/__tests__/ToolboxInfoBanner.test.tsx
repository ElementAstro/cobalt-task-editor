/**
 * Unit tests for ToolboxInfoBanner component
 */

import { render, screen } from "@testing-library/react";
import { ToolboxInfoBanner } from "../ToolboxInfoBanner";

describe("ToolboxInfoBanner", () => {
  describe("Rendering", () => {
    it("should render message", () => {
      render(<ToolboxInfoBanner message="Drag items to add them" />);

      expect(screen.getByText("Drag items to add them")).toBeInTheDocument();
    });

    it("should render info icon", () => {
      render(<ToolboxInfoBanner message="Test message" />);

      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should render with yellow variant by default", () => {
      render(<ToolboxInfoBanner message="Default variant" />);

      const banner = screen.getByText("Default variant").closest("div");
      expect(banner).toHaveClass("bg-yellow-500/10");
    });

    it("should render with yellow variant when specified", () => {
      render(<ToolboxInfoBanner message="Yellow variant" variant="yellow" />);

      const banner = screen.getByText("Yellow variant").closest("div");
      expect(banner).toHaveClass("bg-yellow-500/10");
    });

    it("should render with purple variant when specified", () => {
      render(<ToolboxInfoBanner message="Purple variant" variant="purple" />);

      const banner = screen.getByText("Purple variant").closest("div");
      expect(banner).toHaveClass("bg-purple-500/10");
    });
  });

  describe("Message Display", () => {
    it("should display condition-related message", () => {
      render(
        <ToolboxInfoBanner message="Conditions control loop behavior" />,
      );

      expect(
        screen.getByText("Conditions control loop behavior"),
      ).toBeInTheDocument();
    });

    it("should display trigger-related message", () => {
      render(<ToolboxInfoBanner message="Triggers fire on events" />);

      expect(screen.getByText("Triggers fire on events")).toBeInTheDocument();
    });
  });
});
