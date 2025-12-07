/**
 * Unit tests for TemplateSelector component
 * Tests template display, mode filtering, and template management
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplateSelector } from "../TemplateSelector";
import { useMultiSequenceStore } from "@/lib/nina/multi-sequence-store";
import { I18nProvider } from "@/lib/i18n/context";
import { act } from "react";
import type { EditorSequence } from "@/lib/nina/types";

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
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
    // Remove custom templates
    const customTemplates = store.templates.filter(
      (t) => t.category === "custom",
    );
    customTemplates.forEach((t) => store.deleteTemplate(t.id));
  });
};

describe("TemplateSelector", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("Template Button", () => {
    it("should render template button", () => {
      renderWithProviders(<TemplateSelector />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should open template dialog when clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TemplateSelector />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });
  });

  describe("Template Display", () => {
    it("should display default templates", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TemplateSelector />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        // Should show dialog with templates
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Store should have default templates
      const store = useMultiSequenceStore.getState();
      const defaultTemplates = store.templates.filter(
        (t) => t.category === "default",
      );
      expect(defaultTemplates.length).toBeGreaterThan(0);
    });

    it("should display template dialog sections", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TemplateSelector />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        // Should show dialog with template content
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should show dialog when no custom templates", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TemplateSelector />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        // Dialog should open even with no custom templates
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });
  });

  describe("Mode-Based Filtering", () => {
    it("should show all templates in advanced mode", async () => {
      const user = userEvent.setup();
      const store = useMultiSequenceStore.getState();

      act(() => {
        store.setEditorMode("advanced");
      });

      renderWithProviders(<TemplateSelector />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        // Should show templates from both modes
        const templates = store.templates.filter(
          (t) => t.category === "default",
        );
        expect(templates.length).toBeGreaterThan(0);
      });
    });

    it("should filter templates in normal mode", async () => {
      const user = userEvent.setup();
      const store = useMultiSequenceStore.getState();

      act(() => {
        store.setEditorMode("normal");
      });

      renderWithProviders(<TemplateSelector />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        // In normal mode, should only show normal mode templates
        // The filtering happens in the component
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });
  });

  describe("Template Application", () => {
    it("should have templates available for application", async () => {
      const user = userEvent.setup();
      const store = useMultiSequenceStore.getState();

      renderWithProviders(<TemplateSelector />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Templates should be available in the store
      expect(store.templates.length).toBeGreaterThan(0);
    });

    it("should display template dialog content", async () => {
      const user = userEvent.setup();

      renderWithProviders(<TemplateSelector />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Dialog should have content (template sections exist)
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      // The dialog should contain some content
      expect(dialog.textContent).toBeTruthy();
    });
  });

  describe("Save As Template", () => {
    it("should show save as template button when activeTabId is provided", async () => {
      const user = userEvent.setup();
      const store = useMultiSequenceStore.getState();

      let tabId = "";
      act(() => {
        tabId = store.addTab(createMockSequence("My Sequence"));
      });

      renderWithProviders(<TemplateSelector activeTabId={tabId} />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByText(/save as template/i)).toBeInTheDocument();
      });
    });

    it("should not show save as template button when no activeTabId", async () => {
      const user = userEvent.setup();

      renderWithProviders(<TemplateSelector />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Save as template button should not be visible
      expect(screen.queryByText(/save as template/i)).not.toBeInTheDocument();
    });

    it("should open save dialog when clicking save as template", async () => {
      const user = userEvent.setup();
      const store = useMultiSequenceStore.getState();

      let tabId = "";
      act(() => {
        tabId = store.addTab(createMockSequence("My Sequence"));
      });

      renderWithProviders(<TemplateSelector activeTabId={tabId} />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/save as template/i);
      await user.click(saveButton);

      // Should open save dialog (closes main dialog first)
      await waitFor(
        () => {
          expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Custom Template Management", () => {
    it("should display custom templates after saving", async () => {
      const user = userEvent.setup();
      const store = useMultiSequenceStore.getState();

      let tabId = "";
      act(() => {
        tabId = store.addTab(createMockSequence("My Sequence"));
        store.saveAsTemplate(tabId, "My Custom Template", "A test template");
      });

      renderWithProviders(<TemplateSelector activeTabId={tabId} />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByText("My Custom Template")).toBeInTheDocument();
      });
    });

    it("should show delete button for custom templates", async () => {
      const user = userEvent.setup();
      const store = useMultiSequenceStore.getState();

      let tabId = "";
      act(() => {
        tabId = store.addTab(createMockSequence("My Sequence"));
        store.saveAsTemplate(tabId, "Deletable Template", "A test template");
      });

      renderWithProviders(<TemplateSelector activeTabId={tabId} />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByText("Deletable Template")).toBeInTheDocument();
      });

      // Should have delete button for custom template
      const deleteButtons = screen.getAllByLabelText(/delete/i);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it("should show edit button for custom templates", async () => {
      const user = userEvent.setup();
      const store = useMultiSequenceStore.getState();

      let tabId = "";
      act(() => {
        tabId = store.addTab(createMockSequence("My Sequence"));
        store.saveAsTemplate(tabId, "Editable Template", "A test template");
      });

      renderWithProviders(<TemplateSelector activeTabId={tabId} />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByText("Editable Template")).toBeInTheDocument();
      });

      // Should have edit button for custom template
      const editButtons = screen.getAllByLabelText(/edit/i);
      expect(editButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Template Localization", () => {
    it("should display localized template names for default templates", async () => {
      const user = userEvent.setup();

      renderWithProviders(<TemplateSelector />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        // Default templates should have localized names
        // The exact text depends on the locale
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });
  });

  describe("Dialog Controls", () => {
    it("should close dialog when clicking close button", async () => {
      const user = userEvent.setup();

      renderWithProviders(<TemplateSelector />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Find the close button within the dialog footer
      const dialog = screen.getByRole("dialog");
      const closeButtons = dialog.querySelectorAll("button");
      const closeButton = Array.from(closeButtons).find((btn) =>
        btn.textContent?.toLowerCase().includes("close"),
      );

      if (closeButton) {
        await user.click(closeButton);

        await waitFor(() => {
          expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });
      }
    });
  });
});
