/**
 * Unit tests for ToolboxTabs component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToolboxTabs } from "../ToolboxTabs";
import type { Translations } from "@/lib/i18n";

const mockTranslations = {
  toolbox: {
    items: "Items",
    conditions: "Conditions",
    triggers: "Triggers",
  },
} as unknown as Translations;

describe("ToolboxTabs", () => {
  const defaultProps = {
    activeTab: "items" as const,
    onTabChange: jest.fn(),
    itemsCount: 50,
    conditionsCount: 10,
    triggersCount: 5,
    t: mockTranslations,
    children: <div data-testid="tab-content">Tab Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all tabs", () => {
      render(<ToolboxTabs {...defaultProps} />);

      expect(screen.getByRole("tab", { name: /items/i })).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: /cond/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /trig/i })).toBeInTheDocument();
    });

    it("should render count badges", () => {
      render(<ToolboxTabs {...defaultProps} />);

      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should render children", () => {
      render(<ToolboxTabs {...defaultProps} />);

      expect(screen.getByTestId("tab-content")).toBeInTheDocument();
    });
  });

  describe("Tab Selection", () => {
    it("should highlight items tab when active", () => {
      render(<ToolboxTabs {...defaultProps} activeTab="items" />);

      const itemsTab = screen.getByRole("tab", { name: /items/i });
      expect(itemsTab).toHaveAttribute("data-state", "active");
    });

    it("should highlight conditions tab when active", () => {
      render(<ToolboxTabs {...defaultProps} activeTab="conditions" />);

      const conditionsTab = screen.getByRole("tab", { name: /cond/i });
      expect(conditionsTab).toHaveAttribute("data-state", "active");
    });

    it("should highlight triggers tab when active", () => {
      render(<ToolboxTabs {...defaultProps} activeTab="triggers" />);

      const triggersTab = screen.getByRole("tab", { name: /trig/i });
      expect(triggersTab).toHaveAttribute("data-state", "active");
    });
  });

  describe("Interactions", () => {
    it("should call onTabChange when items tab is clicked", async () => {
      const user = userEvent.setup();
      render(<ToolboxTabs {...defaultProps} activeTab="conditions" />);

      await user.click(screen.getByRole("tab", { name: /items/i }));

      expect(defaultProps.onTabChange).toHaveBeenCalledWith("items");
    });

    it("should call onTabChange when conditions tab is clicked", async () => {
      const user = userEvent.setup();
      render(<ToolboxTabs {...defaultProps} />);

      await user.click(screen.getByRole("tab", { name: /cond/i }));

      expect(defaultProps.onTabChange).toHaveBeenCalledWith("conditions");
    });

    it("should call onTabChange when triggers tab is clicked", async () => {
      const user = userEvent.setup();
      render(<ToolboxTabs {...defaultProps} />);

      await user.click(screen.getByRole("tab", { name: /trig/i }));

      expect(defaultProps.onTabChange).toHaveBeenCalledWith("triggers");
    });
  });

  describe("Count Display", () => {
    it("should display zero counts", () => {
      render(
        <ToolboxTabs
          {...defaultProps}
          itemsCount={0}
          conditionsCount={0}
          triggersCount={0}
        />,
      );

      expect(screen.getAllByText("0").length).toBe(3);
    });

    it("should display large counts", () => {
      render(
        <ToolboxTabs
          {...defaultProps}
          itemsCount={100}
          conditionsCount={50}
          triggersCount={25}
        />,
      );

      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument();
    });
  });
});
