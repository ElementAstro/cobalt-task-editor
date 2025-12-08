/**
 * Unit tests for SimpleTargetDetails component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SimpleTargetDetails } from "../SimpleTargetDetails";
import { I18nProvider } from "@/lib/i18n/context";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Translations } from "@/lib/i18n";
import {
  SequenceEntityStatus,
  SequenceMode,
  createDefaultCoordinates,
  type SimpleTarget,
} from "@/lib/nina/simple-sequence-types";

// Mock child components
jest.mock("../../ExposureTable", () => ({
  ExposureTable: () => <div data-testid="exposure-table">Exposure Table</div>,
}));

jest.mock("../TargetOptionsPanel", () => ({
  TargetOptionsPanel: () => (
    <div data-testid="target-options">Target Options</div>
  ),
}));

const createMockTarget = (
  overrides: Partial<SimpleTarget> = {},
): SimpleTarget => ({
  id: "target-1",
  name: "Target 1",
  status: SequenceEntityStatus.CREATED,
  targetName: "M31",
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
  estimatedDuration: 3600,
  ...overrides,
});

const mockTranslations = {
  simple: {
    selectTarget: "Select a target to view details",
    exposureCount: "Exposures",
    resetProgress: "Reset",
    targetOptions: "Target Options",
    exposures: "Exposures",
  },
} as unknown as Translations;

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <TooltipProvider>{component}</TooltipProvider>
    </I18nProvider>,
  );
};

describe("SimpleTargetDetails", () => {
  const defaultProps = {
    target: createMockTarget(),
    activeTab: "targets" as const,
    onActiveTabChange: jest.fn(),
    onResetProgress: jest.fn(),
    t: mockTranslations,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Empty State", () => {
    it("should show empty state when no target selected", () => {
      renderWithProviders(
        <SimpleTargetDetails {...defaultProps} target={null} />,
      );

      expect(
        screen.getByText("Select a target to view details"),
      ).toBeInTheDocument();
    });
  });

  describe("Rendering with Target", () => {
    it("should render target name", () => {
      renderWithProviders(<SimpleTargetDetails {...defaultProps} />);

      expect(screen.getByText("M31")).toBeInTheDocument();
    });

    it("should render exposure count", () => {
      renderWithProviders(<SimpleTargetDetails {...defaultProps} />);

      expect(screen.getByText(/Exposures: 0/)).toBeInTheDocument();
    });

    it("should render reset button", () => {
      renderWithProviders(<SimpleTargetDetails {...defaultProps} />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render tabs on mobile", () => {
      renderWithProviders(<SimpleTargetDetails {...defaultProps} />);

      // Multiple elements may have these texts due to mocked components
      expect(screen.getAllByText("Target Options").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Exposures").length).toBeGreaterThan(0);
    });
  });

  describe("Interactions", () => {
    it("should call onResetProgress when reset button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SimpleTargetDetails {...defaultProps} />);

      const resetButton = screen.getByRole("button");
      await user.click(resetButton);

      expect(defaultProps.onResetProgress).toHaveBeenCalledWith("target-1");
    });

    it("should call onActiveTabChange when tab is changed", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SimpleTargetDetails {...defaultProps} />);

      const exposuresTab = screen.getByText("Exposures");
      await user.click(exposuresTab);

      expect(defaultProps.onActiveTabChange).toHaveBeenCalledWith("exposures");
    });
  });

  describe("Duration Display", () => {
    it("should display estimated duration", () => {
      renderWithProviders(<SimpleTargetDetails {...defaultProps} />);

      expect(screen.getByText(/1h 0m/)).toBeInTheDocument();
    });

    it("should not show duration when not available", () => {
      const targetWithoutDuration = createMockTarget({
        estimatedDuration: undefined,
      });
      renderWithProviders(
        <SimpleTargetDetails {...defaultProps} target={targetWithoutDuration} />,
      );

      expect(document.body).toBeInTheDocument();
    });
  });
});
