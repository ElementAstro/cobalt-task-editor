/**
 * Unit tests for ThemeToggle component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "../theme-toggle";
import { TooltipProvider } from "@/components/ui/tooltip";

// Mock next-themes
const mockSetTheme = jest.fn();
jest.mock("next-themes", () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    theme: "light",
  }),
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

describe("ThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render toggle button", () => {
      renderWithProviders(<ThemeToggle />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should have accessible label", () => {
      renderWithProviders(<ThemeToggle />);

      expect(screen.getByText("Toggle theme")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should open dropdown menu when clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ThemeToggle />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByText("Light")).toBeInTheDocument();
      expect(screen.getByText("Dark")).toBeInTheDocument();
      expect(screen.getByText("System")).toBeInTheDocument();
    });

    it("should call setTheme with 'light' when Light is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ThemeToggle />);

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByText("Light"));

      expect(mockSetTheme).toHaveBeenCalledWith("light");
    });

    it("should call setTheme with 'dark' when Dark is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ThemeToggle />);

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByText("Dark"));

      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });

    it("should call setTheme with 'system' when System is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ThemeToggle />);

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByText("System"));

      expect(mockSetTheme).toHaveBeenCalledWith("system");
    });
  });
});
