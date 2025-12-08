/**
 * Unit tests for PropertyEmptyState component
 */

import { render, screen } from "@testing-library/react";
import { PropertyEmptyState } from "../PropertyEmptyState";

describe("PropertyEmptyState", () => {
  it("should render message", () => {
    render(<PropertyEmptyState message="Select an item to edit" />);

    expect(screen.getByText("Select an item to edit")).toBeInTheDocument();
  });

  it("should display help icon", () => {
    const { container } = render(
      <PropertyEmptyState message="Test message" />,
    );

    // Should have an SVG icon
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should be centered", () => {
    const { container } = render(
      <PropertyEmptyState message="Test message" />,
    );

    // Should have centering classes
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("flex");
    expect(wrapper.className).toContain("items-center");
    expect(wrapper.className).toContain("justify-center");
  });
});
