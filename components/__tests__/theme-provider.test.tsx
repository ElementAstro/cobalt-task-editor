/**
 * Unit tests for ThemeProvider component
 */

import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "../theme-provider";

// Mock next-themes
jest.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

describe("ThemeProvider", () => {
  describe("Rendering", () => {
    it("should render children", () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Test Child</div>
        </ThemeProvider>,
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
      expect(screen.getByText("Test Child")).toBeInTheDocument();
    });

    it("should pass props to NextThemesProvider", () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="dark">
          <div data-testid="child">Test Child</div>
        </ThemeProvider>,
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("should render multiple children", () => {
      render(
        <ThemeProvider>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </ThemeProvider>,
      );

      expect(screen.getByTestId("child1")).toBeInTheDocument();
      expect(screen.getByTestId("child2")).toBeInTheDocument();
    });
  });
});
