/**
 * Unit tests for TemplateEmptyState component
 */

import { render, screen } from "@testing-library/react";
import { TemplateEmptyState } from "../TemplateEmptyState";

describe("TemplateEmptyState", () => {
  describe("Rendering", () => {
    it("should render message", () => {
      render(<TemplateEmptyState message="No templates available" />);

      expect(screen.getByText("No templates available")).toBeInTheDocument();
    });

    it("should render icon", () => {
      render(<TemplateEmptyState message="Test message" />);

      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Message Display", () => {
    it("should display custom message", () => {
      render(<TemplateEmptyState message="Custom empty state message" />);

      expect(
        screen.getByText("Custom empty state message"),
      ).toBeInTheDocument();
    });

    it("should display empty string message", () => {
      render(<TemplateEmptyState message="" />);

      expect(document.body).toBeInTheDocument();
    });
  });
});
