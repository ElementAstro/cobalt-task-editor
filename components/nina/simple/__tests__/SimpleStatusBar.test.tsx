/**
 * Unit tests for SimpleStatusBar component
 */

import { render, screen } from "@testing-library/react";
import { SimpleStatusBar } from "../SimpleStatusBar";
import type { Translations } from "@/lib/i18n";

const mockTranslations = {
  simple: {
    targets: "Targets",
    totalDuration: "Duration",
    unsaved: "Unsaved",
  },
} as unknown as Translations;

describe("SimpleStatusBar", () => {
  const defaultProps = {
    targetCount: 5,
    overallDuration: 3600,
    savePath: null,
    t: mockTranslations,
  };

  describe("Rendering", () => {
    it("should render target count", () => {
      render(<SimpleStatusBar {...defaultProps} />);

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should render duration", () => {
      render(<SimpleStatusBar {...defaultProps} />);

      // Duration format includes seconds
      expect(screen.getByText("1h 0m 0s")).toBeInTheDocument();
    });

    it("should show unsaved when no save path", () => {
      render(<SimpleStatusBar {...defaultProps} />);

      expect(screen.getByText("Unsaved")).toBeInTheDocument();
    });

    it("should show save path when provided", () => {
      render(
        <SimpleStatusBar {...defaultProps} savePath="/path/to/file.json" />,
      );

      expect(screen.getByText("/path/to/file.json")).toBeInTheDocument();
    });
  });

  describe("Duration Display", () => {
    it("should show -- when duration is null", () => {
      render(<SimpleStatusBar {...defaultProps} overallDuration={null} />);

      expect(screen.getByText("--")).toBeInTheDocument();
    });

    it("should format duration correctly", () => {
      render(<SimpleStatusBar {...defaultProps} overallDuration={7200} />);

      // Duration format includes seconds: "2h 0m 0s"
      expect(screen.getByText("2h 0m 0s")).toBeInTheDocument();
    });

    it("should show minutes for short durations", () => {
      render(<SimpleStatusBar {...defaultProps} overallDuration={1800} />);

      // Duration format includes seconds: "30m 0s"
      expect(screen.getByText("30m 0s")).toBeInTheDocument();
    });
  });

  describe("Target Count Display", () => {
    it("should display zero targets", () => {
      render(<SimpleStatusBar {...defaultProps} targetCount={0} />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should display large target count", () => {
      render(<SimpleStatusBar {...defaultProps} targetCount={100} />);

      expect(screen.getByText("100")).toBeInTheDocument();
    });
  });
});
