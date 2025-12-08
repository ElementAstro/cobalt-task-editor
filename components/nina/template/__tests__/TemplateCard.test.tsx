/**
 * Unit tests for TemplateCard component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplateCard } from "../TemplateCard";
import { I18nProvider } from "@/lib/i18n/context";
import type { SequenceTemplate } from "@/lib/nina/multi-sequence-store";

import { TooltipProvider } from "@/components/ui/tooltip";

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <TooltipProvider>{component}</TooltipProvider>
    </I18nProvider>,
  );
};

// Mock template data
const createMockTemplate = (
  overrides: Partial<SequenceTemplate> = {},
): SequenceTemplate => ({
  id: "template-1",
  name: "Test Template",
  description: "A test template description",
  category: "custom",
  mode: "advanced",
  sequence: {
    id: "seq-1",
    title: "Test Sequence",
    startItems: [],
    targetItems: [{ id: "item-1", type: "test", name: "Test Item", category: "Test", status: "CREATED", data: {} }],
    endItems: [],
    globalTriggers: [],
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

describe("TemplateCard", () => {
  describe("Rendering", () => {
    it("should render template name", () => {
      const template = createMockTemplate({ name: "My Template" });
      const onApply = jest.fn();

      renderWithProviders(<TemplateCard template={template} onApply={onApply} />);

      expect(screen.getByText("My Template")).toBeInTheDocument();
    });

    it("should render template description", () => {
      const template = createMockTemplate({ description: "Template description" });
      const onApply = jest.fn();

      renderWithProviders(<TemplateCard template={template} onApply={onApply} />);

      expect(screen.getByText("Template description")).toBeInTheDocument();
    });

    it("should display custom name when displayName is provided", () => {
      const template = createMockTemplate({ name: "Original Name" });
      const onApply = jest.fn();

      renderWithProviders(
        <TemplateCard
          template={template}
          onApply={onApply}
          displayName="Localized Name"
        />,
      );

      expect(screen.getByText("Localized Name")).toBeInTheDocument();
      expect(screen.queryByText("Original Name")).not.toBeInTheDocument();
    });

    it("should display custom description when displayDescription is provided", () => {
      const template = createMockTemplate({ description: "Original Description" });
      const onApply = jest.fn();

      renderWithProviders(
        <TemplateCard
          template={template}
          onApply={onApply}
          displayDescription="Localized Description"
        />,
      );

      expect(screen.getByText("Localized Description")).toBeInTheDocument();
    });

    it("should show star icon for default templates", () => {
      const template = createMockTemplate({ category: "default" });
      const onApply = jest.fn();

      renderWithProviders(<TemplateCard template={template} onApply={onApply} />);

      // Star icon should be present (SVG element)
      const buttons = screen.getAllByRole("button");
      const cardButton = buttons.find((btn) => btn.getAttribute("tabindex") === "0");
      expect(cardButton?.querySelector("svg")).toBeInTheDocument();
    });

    it("should show user icon for custom templates", () => {
      const template = createMockTemplate({ category: "custom" });
      const onApply = jest.fn();

      renderWithProviders(<TemplateCard template={template} onApply={onApply} />);

      // User icon should be present (SVG element)
      const buttons = screen.getAllByRole("button");
      const cardButton = buttons.find((btn) => btn.getAttribute("tabindex") === "0");
      expect(cardButton?.querySelector("svg")).toBeInTheDocument();
    });

    it("should display item count badge", () => {
      const template = createMockTemplate();
      const onApply = jest.fn();

      renderWithProviders(<TemplateCard template={template} onApply={onApply} />);

      // Should show "1 items" badge (1 target item in mock)
      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onApply when card is clicked", async () => {
      const user = userEvent.setup();
      const template = createMockTemplate();
      const onApply = jest.fn();

      renderWithProviders(<TemplateCard template={template} onApply={onApply} />);

      // Find the main card button (has tabindex="0")
      const buttons = screen.getAllByRole("button");
      const cardButton = buttons.find((btn) => btn.getAttribute("tabindex") === "0");
      if (cardButton) {
        await user.click(cardButton);
      }

      expect(onApply).toHaveBeenCalledTimes(1);
    });

    it("should call onApply when Enter key is pressed", async () => {
      const user = userEvent.setup();
      const template = createMockTemplate();
      const onApply = jest.fn();

      renderWithProviders(<TemplateCard template={template} onApply={onApply} />);

      // Find the main card button (has tabindex="0")
      const buttons = screen.getAllByRole("button");
      const cardButton = buttons.find((btn) => btn.getAttribute("tabindex") === "0");
      if (cardButton) {
        cardButton.focus();
        await user.keyboard("{Enter}");
      }

      expect(onApply).toHaveBeenCalledTimes(1);
    });

    it("should show edit button for custom templates when onEdit is provided", async () => {
      const template = createMockTemplate({ category: "custom" });
      const onApply = jest.fn();
      const onEdit = jest.fn();

      renderWithProviders(
        <TemplateCard template={template} onApply={onApply} onEdit={onEdit} />,
      );

      expect(screen.getByLabelText(/edit/i)).toBeInTheDocument();
    });

    it("should not show edit button for default templates", () => {
      const template = createMockTemplate({ category: "default" });
      const onApply = jest.fn();
      const onEdit = jest.fn();

      renderWithProviders(
        <TemplateCard template={template} onApply={onApply} onEdit={onEdit} />,
      );

      expect(screen.queryByLabelText(/edit/i)).not.toBeInTheDocument();
    });

    it("should call onEdit when edit button is clicked", async () => {
      const user = userEvent.setup();
      const template = createMockTemplate({ category: "custom" });
      const onApply = jest.fn();
      const onEdit = jest.fn();

      renderWithProviders(
        <TemplateCard template={template} onApply={onApply} onEdit={onEdit} />,
      );

      await user.click(screen.getByLabelText(/edit/i));

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onApply).not.toHaveBeenCalled(); // Should not trigger apply
    });

    it("should show delete button when onDelete is provided", () => {
      const template = createMockTemplate();
      const onApply = jest.fn();
      const onDelete = jest.fn();

      renderWithProviders(
        <TemplateCard template={template} onApply={onApply} onDelete={onDelete} />,
      );

      expect(screen.getByLabelText(/delete/i)).toBeInTheDocument();
    });

    it("should show confirmation dialog when delete button is clicked", async () => {
      const user = userEvent.setup();
      const template = createMockTemplate();
      const onApply = jest.fn();
      const onDelete = jest.fn();

      renderWithProviders(
        <TemplateCard template={template} onApply={onApply} onDelete={onDelete} />,
      );

      await user.click(screen.getByLabelText(/delete/i));

      // Should show confirmation dialog
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have button role", () => {
      const template = createMockTemplate();
      const onApply = jest.fn();

      renderWithProviders(<TemplateCard template={template} onApply={onApply} />);

      // Multiple buttons now exist (card + preview button)
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should be focusable", () => {
      const template = createMockTemplate();
      const onApply = jest.fn();

      renderWithProviders(<TemplateCard template={template} onApply={onApply} />);

      // Card has tabIndex="0"
      const buttons = screen.getAllByRole("button");
      const cardButton = buttons.find((btn) => btn.getAttribute("tabindex") === "0");
      expect(cardButton).toBeInTheDocument();
    });
  });
});
