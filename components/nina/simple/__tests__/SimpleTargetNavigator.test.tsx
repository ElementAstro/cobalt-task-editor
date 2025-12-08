/**
 * Unit tests for SimpleTargetNavigator component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SimpleTargetNavigator } from "../SimpleTargetNavigator";
import { I18nProvider } from "@/lib/i18n/context";
import type { Translations } from "@/lib/i18n";
import {
  SequenceEntityStatus,
  SequenceMode,
  createDefaultCoordinates,
  type SimpleTarget,
} from "@/lib/nina/simple-sequence-types";

// Mock StartEndOptions
jest.mock("../../StartEndOptions", () => ({
  StartEndOptions: () => (
    <div data-testid="start-end-options">Start End Options</div>
  ),
}));

const createMockTarget = (id: string, name: string): SimpleTarget => ({
  id,
  name,
  status: SequenceEntityStatus.CREATED,
  targetName: name,
  coordinates: createDefaultCoordinates(),
  positionAngle: 0,
  rotation: 0,
  delay: 0,
  mode: SequenceMode.STANDARD,
  slewToTarget: true,
  centerTarget: true,
  rotateTarget: false,
  startGuiding: true,
  autoFocusOnStart: true,
  autoFocusOnFilterChange: false,
  autoFocusAfterSetTime: false,
  autoFocusSetTime: 30,
  autoFocusAfterSetExposures: false,
  autoFocusSetExposures: 10,
  autoFocusAfterTemperatureChange: false,
  autoFocusAfterTemperatureChangeAmount: 1,
  autoFocusAfterHFRChange: false,
  autoFocusAfterHFRChangeAmount: 15,
  exposures: [],
});

const mockTranslations = {
  simple: {
    options: "Options",
    sequenceOptions: "Sequence Options",
  },
} as unknown as Translations;

const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe("SimpleTargetNavigator", () => {
  const targets = [
    createMockTarget("target-1", "M31"),
    createMockTarget("target-2", "M42"),
    createMockTarget("target-3", "NGC 7000"),
  ];

  const defaultProps = {
    targets,
    selectedTargetId: "target-2",
    mobileDrawerOpen: false,
    onMobileDrawerOpenChange: jest.fn(),
    onSelectTarget: jest.fn(),
    onAddTarget: jest.fn(),
    t: mockTranslations,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render options button", () => {
      renderWithProviders(<SimpleTargetNavigator {...defaultProps} />);

      expect(screen.getByText("Options")).toBeInTheDocument();
    });

    it("should render navigation buttons", () => {
      renderWithProviders(<SimpleTargetNavigator {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should display current position", () => {
      renderWithProviders(<SimpleTargetNavigator {...defaultProps} />);

      expect(screen.getByText("2/3")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("should call onSelectTarget with previous target when prev is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SimpleTargetNavigator {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      const prevButton = buttons[1]; // Second button is prev
      await user.click(prevButton);

      expect(defaultProps.onSelectTarget).toHaveBeenCalledWith("target-1");
    });

    it("should call onSelectTarget with next target when next is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SimpleTargetNavigator {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      const nextButton = buttons[2]; // Third button is next
      await user.click(nextButton);

      expect(defaultProps.onSelectTarget).toHaveBeenCalledWith("target-3");
    });

    it("should disable prev button when at first target", () => {
      renderWithProviders(
        <SimpleTargetNavigator {...defaultProps} selectedTargetId="target-1" />,
      );

      const buttons = screen.getAllByRole("button");
      const prevButton = buttons[1];
      expect(prevButton).toBeDisabled();
    });

    it("should disable next button when at last target", () => {
      renderWithProviders(
        <SimpleTargetNavigator {...defaultProps} selectedTargetId="target-3" />,
      );

      const buttons = screen.getAllByRole("button");
      const nextButton = buttons[2];
      expect(nextButton).toBeDisabled();
    });
  });

  describe("Add Target", () => {
    it("should call onAddTarget when add button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SimpleTargetNavigator {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      const addButton = buttons[3]; // Fourth button is add
      await user.click(addButton);

      expect(defaultProps.onAddTarget).toHaveBeenCalled();
    });
  });

  describe("Position Display", () => {
    it("should show 0/N when no target selected", () => {
      renderWithProviders(
        <SimpleTargetNavigator {...defaultProps} selectedTargetId={null} />,
      );

      expect(screen.getByText("0/3")).toBeInTheDocument();
    });

    it("should disable navigation when no target selected", () => {
      renderWithProviders(
        <SimpleTargetNavigator {...defaultProps} selectedTargetId={null} />,
      );

      const buttons = screen.getAllByRole("button");
      const prevButton = buttons[1];
      const nextButton = buttons[2];

      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });
  });
});
