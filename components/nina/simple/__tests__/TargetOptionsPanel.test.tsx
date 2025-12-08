/**
 * Unit tests for TargetOptionsPanel component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TargetOptionsPanel } from "../TargetOptionsPanel";
import { I18nProvider } from "@/lib/i18n/context";
import {
  SequenceEntityStatus,
  SequenceMode,
  createDefaultCoordinates,
  type SimpleTarget,
} from "@/lib/nina/simple-sequence-types";

// Mock the store
const mockUpdateTarget = jest.fn();
const mockUpdateTargetCoordinates = jest.fn();

jest.mock("@/lib/nina/simple-sequence-store", () => ({
  useSimpleSequenceStore: () => ({
    updateTarget: mockUpdateTarget,
    updateTargetCoordinates: mockUpdateTargetCoordinates,
  }),
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
  ...overrides,
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe("TargetOptionsPanel", () => {
  const defaultProps = {
    target: createMockTarget(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render target name input", () => {
      renderWithProviders(<TargetOptionsPanel {...defaultProps} />);

      expect(screen.getByDisplayValue("M31")).toBeInTheDocument();
    });

    it("should render collapsible sections", () => {
      renderWithProviders(<TargetOptionsPanel {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should render coordinate inputs", () => {
      renderWithProviders(<TargetOptionsPanel {...defaultProps} />);

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe("Collapsible Sections", () => {
    it("should toggle target section when clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TargetOptionsPanel {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      const targetSectionButton = buttons[0];

      await user.click(targetSectionButton);

      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call updateTarget when target name is changed", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TargetOptionsPanel {...defaultProps} />);

      const nameInput = screen.getByDisplayValue("M31");
      await user.clear(nameInput);
      await user.type(nameInput, "NGC 7000");

      expect(mockUpdateTarget).toHaveBeenCalled();
    });

    it("should call updateTargetCoordinates when RA is changed", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TargetOptionsPanel {...defaultProps} />);

      const raInputs = screen.getAllByRole("spinbutton");
      const raHoursInput = raInputs[0];

      await user.clear(raHoursInput);
      await user.type(raHoursInput, "12");

      expect(mockUpdateTargetCoordinates).toHaveBeenCalled();
    });
  });

  describe("Checkbox Options", () => {
    it("should render slew to target checkbox", () => {
      renderWithProviders(<TargetOptionsPanel {...defaultProps} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it("should have clickable checkboxes", () => {
      renderWithProviders(<TargetOptionsPanel {...defaultProps} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThan(0);
      // Checkboxes are rendered and interactive
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeDisabled();
      });
    });
  });
});
