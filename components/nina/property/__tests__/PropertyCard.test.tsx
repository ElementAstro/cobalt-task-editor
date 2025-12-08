/**
 * Unit tests for PropertyCard component
 */

import { render, screen } from "@testing-library/react";
import { PropertyCard } from "../PropertyCard";

describe("PropertyCard", () => {
  describe("Rendering", () => {
    it("should render title", () => {
      render(
        <PropertyCard title="Test Title" subtitle="Subtitle" variant="item">
          <div>Content</div>
        </PropertyCard>,
      );

      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("should render subtitle", () => {
      render(
        <PropertyCard title="Title" subtitle="Test Subtitle" variant="item">
          <div>Content</div>
        </PropertyCard>,
      );

      expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
    });

    it("should render children", () => {
      render(
        <PropertyCard title="Title" subtitle="Subtitle" variant="item">
          <div data-testid="child-content">Child Content</div>
        </PropertyCard>,
      );

      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should apply item variant styles", () => {
      const { container } = render(
        <PropertyCard title="Title" subtitle="Subtitle" variant="item">
          <div>Content</div>
        </PropertyCard>,
      );

      // Item variant should have blue border
      const card = container.querySelector(".border-blue-500\\/30");
      expect(card).toBeInTheDocument();
    });

    it("should apply condition variant styles", () => {
      const { container } = render(
        <PropertyCard title="Title" subtitle="Subtitle" variant="condition">
          <div>Content</div>
        </PropertyCard>,
      );

      // Condition variant should have yellow border
      const card = container.querySelector(".border-yellow-500\\/30");
      expect(card).toBeInTheDocument();
    });

    it("should apply trigger variant styles", () => {
      const { container } = render(
        <PropertyCard title="Title" subtitle="Subtitle" variant="trigger">
          <div>Content</div>
        </PropertyCard>,
      );

      // Trigger variant should have purple border
      const card = container.querySelector(".border-purple-500\\/30");
      expect(card).toBeInTheDocument();
    });
  });

  describe("Visual Elements", () => {
    it("should display colored dot indicator for item variant", () => {
      const { container } = render(
        <PropertyCard title="Title" subtitle="Subtitle" variant="item">
          <div>Content</div>
        </PropertyCard>,
      );

      const dot = container.querySelector(".bg-blue-400");
      expect(dot).toBeInTheDocument();
    });

    it("should display colored dot indicator for condition variant", () => {
      const { container } = render(
        <PropertyCard title="Title" subtitle="Subtitle" variant="condition">
          <div>Content</div>
        </PropertyCard>,
      );

      const dot = container.querySelector(".bg-yellow-400");
      expect(dot).toBeInTheDocument();
    });

    it("should display colored dot indicator for trigger variant", () => {
      const { container } = render(
        <PropertyCard title="Title" subtitle="Subtitle" variant="trigger">
          <div>Content</div>
        </PropertyCard>,
      );

      const dot = container.querySelector(".bg-purple-400");
      expect(dot).toBeInTheDocument();
    });
  });
});
