/**
 * Unit tests for ConditionProperties component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConditionProperties } from "../ConditionProperties";
import { I18nProvider } from "@/lib/i18n/context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSequenceEditorStore } from "@/lib/nina/store";
import { act } from "react";
import type { EditorCondition } from "@/lib/nina/types";

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

// Create mock loop condition
const createLoopCondition = (
  overrides: Partial<EditorCondition> = {},
): EditorCondition => ({
  id: "condition-1",
  type: "NINA.Sequencer.Conditions.LoopCondition, NINA.Sequencer",
  name: "Loop Condition",
  category: "Condition",
  data: {
    Iterations: 5,
    CompletedIterations: 2,
  },
  ...overrides,
});

// Create mock time condition
const createTimeCondition = (
  overrides: Partial<EditorCondition> = {},
): EditorCondition => ({
  id: "condition-2",
  type: "NINA.Sequencer.Conditions.TimeCondition, NINA.Sequencer",
  name: "Time Condition",
  category: "Condition",
  data: {
    Hours: 22,
    Minutes: 30,
    Seconds: 0,
  },
  ...overrides,
});

// Create mock altitude condition
const createAltitudeCondition = (
  overrides: Partial<EditorCondition> = {},
): EditorCondition => ({
  id: "condition-3",
  type: "NINA.Sequencer.Conditions.AltitudeCondition, NINA.Sequencer",
  name: "Altitude Condition",
  category: "Condition",
  data: {
    TargetAltitude: 30,
    Comparator: ">=",
  },
  ...overrides,
});

describe("ConditionProperties", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("Loop Condition", () => {
    it("should render iterations input", () => {
      const condition = createLoopCondition();

      renderWithProviders(
        <ConditionProperties condition={condition} containerId="container-1" />,
      );

      expect(screen.getByLabelText(/iterations/i)).toBeInTheDocument();
    });

    it("should display current iterations value", () => {
      const condition = createLoopCondition({ data: { Iterations: 10 } });

      renderWithProviders(
        <ConditionProperties condition={condition} containerId="container-1" />,
      );

      expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    });

    it("should display completed iterations", () => {
      const condition = createLoopCondition({
        data: { Iterations: 5, CompletedIterations: 3 },
      });

      renderWithProviders(
        <ConditionProperties condition={condition} containerId="container-1" />,
      );

      expect(screen.getByText(/3/)).toBeInTheDocument();
    });
  });

  describe("Time Condition", () => {
    it("should render hours, minutes, seconds inputs", () => {
      const condition = createTimeCondition();

      renderWithProviders(
        <ConditionProperties condition={condition} containerId="container-1" />,
      );

      expect(screen.getByLabelText(/hours/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/minutes/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/seconds/i)).toBeInTheDocument();
    });

    it("should display current time values", () => {
      const condition = createTimeCondition({
        data: { Hours: 21, Minutes: 45, Seconds: 30 },
      });

      renderWithProviders(
        <ConditionProperties condition={condition} containerId="container-1" />,
      );

      expect(screen.getByDisplayValue("21")).toBeInTheDocument();
      expect(screen.getByDisplayValue("45")).toBeInTheDocument();
      expect(screen.getByDisplayValue("30")).toBeInTheDocument();
    });
  });

  describe("Altitude Condition", () => {
    it("should render altitude input", () => {
      const condition = createAltitudeCondition();

      renderWithProviders(
        <ConditionProperties condition={condition} containerId="container-1" />,
      );

      expect(screen.getByLabelText(/altitude/i)).toBeInTheDocument();
    });

    it("should render comparator select", () => {
      const condition = createAltitudeCondition();

      renderWithProviders(
        <ConditionProperties condition={condition} containerId="container-1" />,
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should display current altitude value", () => {
      const condition = createAltitudeCondition({
        data: { TargetAltitude: 45, Comparator: ">=" },
      });

      renderWithProviders(
        <ConditionProperties condition={condition} containerId="container-1" />,
      );

      expect(screen.getByDisplayValue("45")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call updateCondition when value changes", async () => {
      const user = userEvent.setup();
      const condition = createLoopCondition();
      const store = useSequenceEditorStore.getState();
      const updateConditionSpy = jest.spyOn(store, "updateCondition");

      renderWithProviders(
        <ConditionProperties condition={condition} containerId="container-1" />,
      );

      const input = screen.getByLabelText(/iterations/i);
      await user.clear(input);
      await user.type(input, "8");

      expect(updateConditionSpy).toHaveBeenCalled();
    });
  });

  describe("Unknown Condition Type", () => {
    it("should show fallback message for unknown condition types", () => {
      const unknownCondition: EditorCondition = {
        id: "unknown-1",
        type: "Unknown.Condition.Type",
        name: "Unknown",
        category: "Unknown",
        data: {},
      };

      renderWithProviders(
        <ConditionProperties
          condition={unknownCondition}
          containerId="container-1"
        />,
      );

      // Should show some fallback content
      expect(document.body.textContent).toBeTruthy();
    });
  });
});
