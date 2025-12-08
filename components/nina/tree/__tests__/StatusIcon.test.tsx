/**
 * Unit tests for StatusIcon component
 */

import { render } from "@testing-library/react";
import { StatusIcon } from "../StatusIcon";
import type { SequenceEntityStatus } from "@/lib/nina/types";

describe("StatusIcon", () => {
  describe("Rendering", () => {
    it("should render running status with pulse animation", () => {
      const { container } = render(<StatusIcon status="RUNNING" />);

      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("animate-pulse");
      expect(svg).toHaveClass("text-blue-400");
    });

    it("should render finished status", () => {
      const { container } = render(<StatusIcon status="FINISHED" />);

      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("text-green-400");
    });

    it("should render failed status", () => {
      const { container } = render(<StatusIcon status="FAILED" />);

      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("text-red-400");
    });

    it("should render skipped status", () => {
      const { container } = render(<StatusIcon status="SKIPPED" />);

      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("text-yellow-400");
    });

    it("should render disabled status", () => {
      const { container } = render(<StatusIcon status="DISABLED" />);

      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("text-zinc-500");
    });

    it("should return null for CREATED status", () => {
      const { container } = render(
        <StatusIcon status={"CREATED" as SequenceEntityStatus} />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Custom Class", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <StatusIcon status="RUNNING" className="w-5 h-5" />,
      );

      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("w-5", "h-5");
    });

    it("should use default class when not provided", () => {
      const { container } = render(<StatusIcon status="RUNNING" />);

      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("w-3", "h-3");
    });
  });
});
