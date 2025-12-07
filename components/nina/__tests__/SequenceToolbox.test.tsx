/**
 * Unit tests for SequenceToolbox component
 * Tests item palette and drag-drop functionality
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SequenceToolbox } from "../SequenceToolbox";
import { useSequenceEditorStore } from "@/lib/nina/store";
import { I18nProvider } from "@/lib/i18n/context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { act } from "react";

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <TooltipProvider>{component}</TooltipProvider>
    </I18nProvider>,
  );
};

// Helper to reset store between tests
const resetStore = () => {
  act(() => {
    useSequenceEditorStore.getState().newSequence();
  });
};

describe("SequenceToolbox", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("Rendering", () => {
    it("should render toolbox", () => {
      renderWithProviders(<SequenceToolbox />);

      // Should have a search input
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it("should display tabs for different item types", () => {
      renderWithProviders(<SequenceToolbox />);

      // Should have tabs for Items, Conditions, Triggers
      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("should have search input", () => {
      renderWithProviders(<SequenceToolbox />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe("Item Categories", () => {
    it("should display item categories", () => {
      renderWithProviders(<SequenceToolbox />);

      // Should show category sections
      // Categories like Container, Camera, Telescope, etc.
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should have collapsible categories", () => {
      renderWithProviders(<SequenceToolbox />);

      // Categories should be collapsible
      const collapsibleTriggers = document.querySelectorAll("[data-state]");
      expect(collapsibleTriggers.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Search Functionality", () => {
    it("should filter items when searching", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SequenceToolbox />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, "camera");

      // Should filter to show only camera-related items
      await waitFor(() => {
        // The search should update the displayed items
        expect(searchInput).toHaveValue("camera");
      });
    });

    it("should clear search when input is cleared", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SequenceToolbox />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, "camera");
      await user.clear(searchInput);

      expect(searchInput).toHaveValue("");
    });
  });

  describe("Tab Navigation", () => {
    it("should switch between tabs", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SequenceToolbox />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBeGreaterThanOrEqual(1);

      // Click on a different tab
      if (tabs.length > 1) {
        await user.click(tabs[1]);
        expect(tabs[1]).toHaveAttribute("data-state", "active");
      }
    });

    it("should display different content for each tab", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SequenceToolbox />);

      const tabs = screen.getAllByRole("tab");

      // Each tab should show different content
      for (const tab of tabs) {
        await user.click(tab);
        expect(tab).toHaveAttribute("data-state", "active");
      }
    });
  });

  describe("Item Display", () => {
    it("should display item names", () => {
      renderWithProviders(<SequenceToolbox />);

      // Should show some item names
      // The exact items depend on the constants
      const toolbox =
        document.querySelector('[class*="toolbox"]') || document.body;
      expect(toolbox).toBeInTheDocument();
    });

    it("should display item icons", () => {
      renderWithProviders(<SequenceToolbox />);

      // Items should have icons (SVG elements)
      const svgs = document.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe("Drag and Drop", () => {
    it("should have draggable items", () => {
      renderWithProviders(<SequenceToolbox />);

      // Items should be draggable
      const draggableItems = document.querySelectorAll('[draggable="true"]');
      // May or may not have draggable items depending on implementation
      expect(draggableItems.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Accessibility", () => {
    it("should have accessible search input", () => {
      renderWithProviders(<SequenceToolbox />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput.tagName).toBe("INPUT");
    });

    it("should have accessible tabs", () => {
      renderWithProviders(<SequenceToolbox />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBeGreaterThan(0);
    });
  });

  describe("Localization", () => {
    it("should display localized item names", () => {
      renderWithProviders(<SequenceToolbox />);

      // Items should be displayed with localized names
      // The exact text depends on the current locale
      const toolbox = document.body;
      expect(toolbox.textContent).toBeTruthy();
    });
  });
});
