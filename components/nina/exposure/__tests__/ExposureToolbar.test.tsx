/**
 * Unit tests for ExposureToolbar component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExposureToolbar } from "../ExposureToolbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Translations } from "@/lib/i18n";

const mockTranslations = {
  common: {
    add: "Add",
    delete: "Delete",
    duplicate: "Duplicate",
  },
  editor: {
    moveUp: "Move Up",
    moveDown: "Move Down",
  },
  simple: {
    addExposure: "Add Exposure",
    resetProgress: "Reset Progress",
    resetAll: "Reset All",
    resetAllProgress: "Reset All Progress",
  },
} as unknown as Translations;

const renderWithProviders = (component: React.ReactNode) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

describe("ExposureToolbar", () => {
  const defaultProps = {
    selectedExposureId: "exp-1",
    selectedIndex: 1,
    exposureCount: 5,
    onAddExposure: jest.fn(),
    onDeleteSelected: jest.fn(),
    onDuplicateSelected: jest.fn(),
    onMoveUp: jest.fn(),
    onMoveDown: jest.fn(),
    onResetProgress: jest.fn(),
    onResetAll: jest.fn(),
    t: mockTranslations,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render toolbar", () => {
      renderWithProviders(<ExposureToolbar {...defaultProps} />);

      expect(screen.getByText("Add")).toBeInTheDocument();
    });

    it("should render all action buttons", () => {
      renderWithProviders(<ExposureToolbar {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Button States", () => {
    it("should disable delete button when no exposure selected", () => {
      renderWithProviders(
        <ExposureToolbar {...defaultProps} selectedExposureId={null} />,
      );

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      expect(deleteButton).toBeDisabled();
    });

    it("should disable duplicate button when no exposure selected", () => {
      renderWithProviders(
        <ExposureToolbar {...defaultProps} selectedExposureId={null} />,
      );

      const duplicateButton = screen.getByRole("button", {
        name: /duplicate/i,
      });
      expect(duplicateButton).toBeDisabled();
    });

    it("should disable move up button when at first position", () => {
      renderWithProviders(
        <ExposureToolbar {...defaultProps} selectedIndex={0} />,
      );

      const moveUpButton = screen.getByRole("button", { name: /move up/i });
      expect(moveUpButton).toBeDisabled();
    });

    it("should disable move down button when at last position", () => {
      renderWithProviders(
        <ExposureToolbar {...defaultProps} selectedIndex={4} />,
      );

      const moveDownButton = screen.getByRole("button", { name: /move down/i });
      expect(moveDownButton).toBeDisabled();
    });

    it("should disable reset progress button when no exposure selected", () => {
      renderWithProviders(
        <ExposureToolbar {...defaultProps} selectedExposureId={null} />,
      );

      const resetButton = screen.getByRole("button", {
        name: /reset progress/i,
      });
      expect(resetButton).toBeDisabled();
    });
  });

  describe("Interactions", () => {
    it("should call onAddExposure when add button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExposureToolbar {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /add/i }));

      expect(defaultProps.onAddExposure).toHaveBeenCalled();
    });

    it("should call onDeleteSelected when delete button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExposureToolbar {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /delete/i }));

      expect(defaultProps.onDeleteSelected).toHaveBeenCalled();
    });

    it("should call onDuplicateSelected when duplicate button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExposureToolbar {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /duplicate/i }));

      expect(defaultProps.onDuplicateSelected).toHaveBeenCalled();
    });

    it("should call onMoveUp when move up button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExposureToolbar {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /move up/i }));

      expect(defaultProps.onMoveUp).toHaveBeenCalled();
    });

    it("should call onMoveDown when move down button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExposureToolbar {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /move down/i }));

      expect(defaultProps.onMoveDown).toHaveBeenCalled();
    });

    it("should call onResetProgress when reset progress button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExposureToolbar {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /reset progress/i }));

      expect(defaultProps.onResetProgress).toHaveBeenCalled();
    });

    it("should call onResetAll when reset all button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExposureToolbar {...defaultProps} />);

      await user.click(
        screen.getByRole("button", { name: /reset all progress/i }),
      );

      expect(defaultProps.onResetAll).toHaveBeenCalled();
    });
  });
});
