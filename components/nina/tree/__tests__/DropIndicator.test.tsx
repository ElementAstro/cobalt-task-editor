/**
 * Unit tests for DropIndicator component
 */

import { render } from "@testing-library/react";
import { DropIndicator } from "../DropIndicator";

describe("DropIndicator", () => {
  describe("Rendering", () => {
    it("should render indicator", () => {
      const { container } = render(<DropIndicator depth={0} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("should have correct base styling", () => {
      const { container } = render(<DropIndicator depth={0} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator).toHaveClass("bg-primary");
      expect(indicator).toHaveClass("rounded-full");
    });
  });

  describe("Depth Styling", () => {
    it("should apply margin based on depth 0", () => {
      const { container } = render(<DropIndicator depth={0} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ marginLeft: "8px" });
    });

    it("should apply margin based on depth 1", () => {
      const { container } = render(<DropIndicator depth={1} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ marginLeft: "12px" });
    });

    it("should apply margin based on depth 2", () => {
      const { container } = render(<DropIndicator depth={2} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ marginLeft: "24px" });
    });

    it("should apply margin based on depth 3", () => {
      const { container } = render(<DropIndicator depth={3} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ marginLeft: "36px" });
    });
  });

  describe("Animation", () => {
    it("should have pulse animation", () => {
      const { container } = render(<DropIndicator depth={0} />);

      const indicator = container.firstChild as HTMLElement;
      expect(indicator).toHaveClass("animate-pulse");
    });
  });
});
