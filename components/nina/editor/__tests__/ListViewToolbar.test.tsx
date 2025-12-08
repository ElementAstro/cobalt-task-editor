/**
 * Unit tests for ListViewToolbar component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListViewToolbar } from "../ListViewToolbar";
import { TooltipProvider } from "@/components/ui/tooltip";

const defaultTranslations = {
  copy: "Copy",
  cut: "Cut",
  paste: "Paste",
  expandAll: "Expand All",
  collapseAll: "Collapse All",
  start: "Start",
  target: "Target",
  end: "End",
  conditions: "Conditions",
  triggers: "Triggers",
};

const defaultStats = {
  totalItems: 10,
  startItems: 2,
  targetItems: 5,
  endItems: 3,
  conditions: 4,
  triggers: 2,
};

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

describe("ListViewToolbar", () => {
  describe("Rendering", () => {
    it("should render copy button", () => {
      renderWithProviders(
        <ListViewToolbar
          onCopy={jest.fn()}
          onCut={jest.fn()}
          onPaste={jest.fn()}
          canPaste={true}
          onExpandAll={jest.fn()}
          onCollapseAll={jest.fn()}
          stats={defaultStats}
          translations={defaultTranslations}
        />,
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should display total items count", () => {
      renderWithProviders(
        <ListViewToolbar
          onCopy={jest.fn()}
          onCut={jest.fn()}
          onPaste={jest.fn()}
          canPaste={true}
          onExpandAll={jest.fn()}
          onCollapseAll={jest.fn()}
          stats={defaultStats}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("should disable paste button when canPaste is false", () => {
      renderWithProviders(
        <ListViewToolbar
          onCopy={jest.fn()}
          onCut={jest.fn()}
          onPaste={jest.fn()}
          canPaste={false}
          onExpandAll={jest.fn()}
          onCollapseAll={jest.fn()}
          stats={defaultStats}
          translations={defaultTranslations}
        />,
      );

      const buttons = screen.getAllByRole("button");
      const disabledButton = buttons.find((btn) => btn.hasAttribute("disabled"));
      expect(disabledButton).toBeTruthy();
    });
  });

  describe("Interactions", () => {
    it("should call onCopy when copy button is clicked", async () => {
      const user = userEvent.setup();
      const onCopy = jest.fn();

      renderWithProviders(
        <ListViewToolbar
          onCopy={onCopy}
          onCut={jest.fn()}
          onPaste={jest.fn()}
          canPaste={true}
          onExpandAll={jest.fn()}
          onCollapseAll={jest.fn()}
          stats={defaultStats}
          translations={defaultTranslations}
        />,
      );

      const buttons = screen.getAllByRole("button");
      await user.click(buttons[0]); // First button is copy

      expect(onCopy).toHaveBeenCalledTimes(1);
    });

    it("should call onCut when cut button is clicked", async () => {
      const user = userEvent.setup();
      const onCut = jest.fn();

      renderWithProviders(
        <ListViewToolbar
          onCopy={jest.fn()}
          onCut={onCut}
          onPaste={jest.fn()}
          canPaste={true}
          onExpandAll={jest.fn()}
          onCollapseAll={jest.fn()}
          stats={defaultStats}
          translations={defaultTranslations}
        />,
      );

      const buttons = screen.getAllByRole("button");
      await user.click(buttons[1]); // Second button is cut

      expect(onCut).toHaveBeenCalledTimes(1);
    });

    it("should call onPaste when paste button is clicked", async () => {
      const user = userEvent.setup();
      const onPaste = jest.fn();

      renderWithProviders(
        <ListViewToolbar
          onCopy={jest.fn()}
          onCut={jest.fn()}
          onPaste={onPaste}
          canPaste={true}
          onExpandAll={jest.fn()}
          onCollapseAll={jest.fn()}
          stats={defaultStats}
          translations={defaultTranslations}
        />,
      );

      const buttons = screen.getAllByRole("button");
      await user.click(buttons[2]); // Third button is paste

      expect(onPaste).toHaveBeenCalledTimes(1);
    });

    it("should call onExpandAll when expand button is clicked", async () => {
      const user = userEvent.setup();
      const onExpandAll = jest.fn();

      renderWithProviders(
        <ListViewToolbar
          onCopy={jest.fn()}
          onCut={jest.fn()}
          onPaste={jest.fn()}
          canPaste={true}
          onExpandAll={onExpandAll}
          onCollapseAll={jest.fn()}
          stats={defaultStats}
          translations={defaultTranslations}
        />,
      );

      const buttons = screen.getAllByRole("button");
      await user.click(buttons[3]); // Fourth button is expand

      expect(onExpandAll).toHaveBeenCalledTimes(1);
    });

    it("should call onCollapseAll when collapse button is clicked", async () => {
      const user = userEvent.setup();
      const onCollapseAll = jest.fn();

      renderWithProviders(
        <ListViewToolbar
          onCopy={jest.fn()}
          onCut={jest.fn()}
          onPaste={jest.fn()}
          canPaste={true}
          onExpandAll={jest.fn()}
          onCollapseAll={onCollapseAll}
          stats={defaultStats}
          translations={defaultTranslations}
        />,
      );

      const buttons = screen.getAllByRole("button");
      await user.click(buttons[4]); // Fifth button is collapse

      expect(onCollapseAll).toHaveBeenCalledTimes(1);
    });
  });
});
