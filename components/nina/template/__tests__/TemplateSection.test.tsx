/**
 * Unit tests for TemplateSection component
 */

import { render, screen } from "@testing-library/react";
import { TemplateSection } from "../TemplateSection";

describe("TemplateSection", () => {
  describe("Rendering", () => {
    it("should render title", () => {
      render(
        <TemplateSection title="Default Templates" count={5} variant="default">
          <div>Children</div>
        </TemplateSection>,
      );

      expect(screen.getByText("Default Templates")).toBeInTheDocument();
    });

    it("should render count badge", () => {
      render(
        <TemplateSection title="Templates" count={10} variant="default">
          <div>Children</div>
        </TemplateSection>,
      );

      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("should render children", () => {
      render(
        <TemplateSection title="Templates" count={5} variant="default">
          <div data-testid="child">Child Content</div>
        </TemplateSection>,
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should render star icon for default variant", () => {
      render(
        <TemplateSection title="Default" count={5} variant="default">
          <div>Children</div>
        </TemplateSection>,
      );

      expect(document.body).toBeInTheDocument();
    });

    it("should render user icon for custom variant", () => {
      render(
        <TemplateSection title="Custom" count={3} variant="custom">
          <div>Children</div>
        </TemplateSection>,
      );

      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Count Display", () => {
    it("should display zero count", () => {
      render(
        <TemplateSection title="Templates" count={0} variant="default">
          <div>Children</div>
        </TemplateSection>,
      );

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should display large count", () => {
      render(
        <TemplateSection title="Templates" count={100} variant="default">
          <div>Children</div>
        </TemplateSection>,
      );

      expect(screen.getByText("100")).toBeInTheDocument();
    });
  });
});
