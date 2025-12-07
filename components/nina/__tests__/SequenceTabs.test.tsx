/**
 * Unit tests for SequenceTabs component
 * Tests tab display, mode-aware behavior, and user interactions
 */

import { render, screen } from "@testing-library/react";
import { SequenceTabs } from "../SequenceTabs";
import { useMultiSequenceStore } from "@/lib/nina/multi-sequence-store";
import { I18nProvider } from "@/lib/i18n/context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { act } from "react";
import type { EditorSequence } from "@/lib/nina/types";

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <TooltipProvider>{component}</TooltipProvider>
    </I18nProvider>,
  );
};

// Helper to create a mock sequence
const createMockSequence = (
  title: string = "Test Sequence",
): EditorSequence => ({
  id: `seq-${Date.now()}-${Math.random()}`,
  title,
  startItems: [],
  targetItems: [],
  endItems: [],
  globalTriggers: [],
});

// Helper to reset store between tests
const resetStore = () => {
  const store = useMultiSequenceStore.getState();
  act(() => {
    store.closeAllTabs();
    store.setEditorMode("advanced");
  });
};

describe("SequenceTabs", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("Empty State", () => {
    it("should render new sequence button when no tabs exist", () => {
      renderWithProviders(<SequenceTabs />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should have add button available when no tabs exist", () => {
      renderWithProviders(<SequenceTabs />);

      // The add button should be present
      const newButton = screen.getByRole("button");
      expect(newButton).toBeInTheDocument();
    });
  });

  describe("Tab Display", () => {
    it("should display tab with sequence title", () => {
      const store = useMultiSequenceStore.getState();
      act(() => {
        store.addTab(createMockSequence("My Test Sequence"));
      });

      renderWithProviders(<SequenceTabs />);

      expect(screen.getByText("My Test Sequence")).toBeInTheDocument();
    });

    it("should display multiple tabs in advanced mode", () => {
      const store = useMultiSequenceStore.getState();
      act(() => {
        store.addTab(createMockSequence("Tab 1"));
        store.addTab(createMockSequence("Tab 2"));
        store.addTab(createMockSequence("Tab 3"));
      });

      renderWithProviders(<SequenceTabs />);

      expect(screen.getByText("Tab 1")).toBeInTheDocument();
      expect(screen.getByText("Tab 2")).toBeInTheDocument();
      expect(screen.getByText("Tab 3")).toBeInTheDocument();
    });

    it("should highlight active tab", () => {
      const store = useMultiSequenceStore.getState();
      act(() => {
        store.addTab(createMockSequence("Tab 1"));
        store.addTab(createMockSequence("Tab 2"));
      });

      renderWithProviders(<SequenceTabs />);

      const tabs = screen.getAllByRole("tab");
      // Last added tab should be active
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
      expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    });

    it("should show dirty indicator for modified tabs", () => {
      const store = useMultiSequenceStore.getState();
      let tabId = "";
      act(() => {
        tabId = store.addTab(createMockSequence("Modified Tab"));
        store.setTabDirty(tabId, true);
      });

      renderWithProviders(<SequenceTabs />);

      // Should show the dirty indicator (bullet point)
      expect(screen.getByText("•")).toBeInTheDocument();
    });
  });

  describe("Tab Interactions", () => {
    it("should display tabs that can be interacted with", async () => {
      const store = useMultiSequenceStore.getState();

      act(() => {
        store.addTab(createMockSequence("Tab 1"));
        store.addTab(createMockSequence("Tab 2"));
      });

      renderWithProviders(<SequenceTabs />);

      // Both tabs should be visible
      expect(screen.getByText("Tab 1")).toBeInTheDocument();
      expect(screen.getByText("Tab 2")).toBeInTheDocument();

      // Tabs should have proper role
      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBe(2);
    });

    it("should mark dirty tabs with indicator", () => {
      const store = useMultiSequenceStore.getState();

      let tabId = "";
      act(() => {
        tabId = store.addTab(createMockSequence("Dirty Tab"));
        store.setTabDirty(tabId, true);
      });

      renderWithProviders(<SequenceTabs />);

      // Should show the dirty indicator (bullet point)
      expect(screen.getByText("•")).toBeInTheDocument();
    });
  });

  describe("Normal Mode Behavior", () => {
    it("should hide add tab button when in normal mode with existing tab", () => {
      const store = useMultiSequenceStore.getState();
      act(() => {
        store.setEditorMode("normal");
        store.addTab(createMockSequence("Single Tab"));
      });

      renderWithProviders(<SequenceTabs />);

      // The add button should not be visible (canAddTab returns false)
      const addButtons = screen.queryAllByLabelText(/new sequence/i);
      expect(addButtons.length).toBe(0);
    });

    it("should show mode indicator badge in normal mode", () => {
      const store = useMultiSequenceStore.getState();
      act(() => {
        store.setEditorMode("normal");
        store.addTab(createMockSequence("Single Tab"));
      });

      renderWithProviders(<SequenceTabs />);

      // Should show "Normal" badge
      expect(screen.getByText("Normal")).toBeInTheDocument();
    });

    it("should not show mode indicator in advanced mode", () => {
      const store = useMultiSequenceStore.getState();
      act(() => {
        store.setEditorMode("advanced");
        store.addTab(createMockSequence("Tab"));
      });

      renderWithProviders(<SequenceTabs />);

      // Should not show "Normal" badge
      expect(screen.queryByText("Normal")).not.toBeInTheDocument();
    });

    it("should show add tab button in advanced mode", () => {
      const store = useMultiSequenceStore.getState();
      act(() => {
        store.setEditorMode("advanced");
        store.addTab(createMockSequence("Tab"));
      });

      renderWithProviders(<SequenceTabs />);

      // The add button should be visible
      expect(screen.getByLabelText(/new sequence/i)).toBeInTheDocument();
    });
  });

  describe("Tab Accessibility", () => {
    it("should have accessible tab structure", () => {
      const store = useMultiSequenceStore.getState();

      act(() => {
        store.addTab(createMockSequence("Tab 1"));
        store.addTab(createMockSequence("Tab 2"));
      });

      renderWithProviders(<SequenceTabs />);

      // Tabs should have proper ARIA attributes
      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBe(2);

      // Active tab should have aria-selected
      const activeTab = tabs.find(
        (tab) => tab.getAttribute("aria-selected") === "true",
      );
      expect(activeTab).toBeTruthy();
    });

    it("should have tab list container", () => {
      const store = useMultiSequenceStore.getState();

      act(() => {
        store.addTab(createMockSequence("Tab 1"));
      });

      renderWithProviders(<SequenceTabs />);

      // Should have a tablist role
      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });
  });
});
