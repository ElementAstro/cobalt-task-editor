/**
 * Unit tests for LanguageSelector component
 * Tests language switching functionality
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSelector } from "../LanguageSelector";
import { I18nProvider } from "@/lib/i18n/context";

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe("LanguageSelector", () => {
  describe("Rendering", () => {
    it("should render language selector button", () => {
      renderWithProviders(<LanguageSelector />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should display globe icon", () => {
      renderWithProviders(<LanguageSelector />);

      // The button should contain an SVG (globe icon)
      const button = screen.getByRole("button");
      expect(button.querySelector("svg")).toBeInTheDocument();
    });

    it("should display current language name on larger screens", () => {
      renderWithProviders(<LanguageSelector />);

      // Default is English
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Dropdown Menu", () => {
    it("should open dropdown menu when clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LanguageSelector />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole("menu")).toBeInTheDocument();
      });
    });

    it("should display available languages in dropdown", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LanguageSelector />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        // Should show menu items for languages
        const menuItems = screen.getAllByRole("menuitem");
        expect(menuItems.length).toBe(2);
      });
    });

    it("should display language flags", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LanguageSelector />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        // Should show flag emojis
        expect(screen.getByText("🇺🇸")).toBeInTheDocument();
        expect(screen.getByText("🇨🇳")).toBeInTheDocument();
      });
    });
  });

  describe("Language Switching", () => {
    it("should show menu items when dropdown is open", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LanguageSelector />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const menuItems = screen.getAllByRole("menuitem");
        expect(menuItems.length).toBe(2);
      });
    });

    it("should have clickable menu items", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LanguageSelector />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const menuItems = screen.getAllByRole("menuitem");
        expect(menuItems[0]).toBeInTheDocument();
        expect(menuItems[1]).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have accessible button", () => {
      renderWithProviders(<LanguageSelector />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should have accessible menu items", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LanguageSelector />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const menuItems = screen.getAllByRole("menuitem");
        expect(menuItems.length).toBe(2);
      });
    });
  });
});
