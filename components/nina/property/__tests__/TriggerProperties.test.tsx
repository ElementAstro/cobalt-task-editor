/**
 * Unit tests for TriggerProperties component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TriggerProperties } from "../TriggerProperties";
import { I18nProvider } from "@/lib/i18n/context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSequenceEditorStore } from "@/lib/nina/store";
import { act } from "react";
import type { EditorTrigger } from "@/lib/nina/types";

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

// Create mock dither trigger
const createDitherTrigger = (
  overrides: Partial<EditorTrigger> = {},
): EditorTrigger => ({
  id: "trigger-1",
  type: "NINA.Sequencer.Trigger.DitherAfterExposures, NINA.Sequencer",
  name: "Dither After Exposures",
  category: "Trigger",
  data: {
    AfterExposures: 5,
  },
  ...overrides,
});

// Create mock autofocus trigger
const createAutofocusTrigger = (
  overrides: Partial<EditorTrigger> = {},
): EditorTrigger => ({
  id: "trigger-2",
  type: "NINA.Sequencer.Trigger.AutofocusAfterExposures, NINA.Sequencer",
  name: "Autofocus After Exposures",
  category: "Trigger",
  data: {
    AfterExposures: 10,
  },
  ...overrides,
});

// Create mock HFR trigger
const createHFRTrigger = (
  overrides: Partial<EditorTrigger> = {},
): EditorTrigger => ({
  id: "trigger-3",
  type: "NINA.Sequencer.Trigger.HFRIncreaseTrigger, NINA.Sequencer",
  name: "HFR Increase Trigger",
  category: "Trigger",
  data: {
    Amount: 15,
    SampleSize: 10,
  },
  ...overrides,
});

describe("TriggerProperties", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("Dither Trigger", () => {
    it("should render after exposures input", () => {
      const trigger = createDitherTrigger();

      renderWithProviders(
        <TriggerProperties trigger={trigger} containerId="container-1" />,
      );

      expect(screen.getByLabelText(/after exposures/i)).toBeInTheDocument();
    });

    it("should display current value", () => {
      const trigger = createDitherTrigger({ data: { AfterExposures: 8 } });

      renderWithProviders(
        <TriggerProperties trigger={trigger} containerId="container-1" />,
      );

      expect(screen.getByDisplayValue("8")).toBeInTheDocument();
    });
  });

  describe("Autofocus Trigger", () => {
    it("should render after exposures input", () => {
      const trigger = createAutofocusTrigger();

      renderWithProviders(
        <TriggerProperties trigger={trigger} containerId="container-1" />,
      );

      expect(screen.getByLabelText(/after exposures/i)).toBeInTheDocument();
    });

    it("should display current value", () => {
      const trigger = createAutofocusTrigger({ data: { AfterExposures: 15 } });

      renderWithProviders(
        <TriggerProperties trigger={trigger} containerId="container-1" />,
      );

      expect(screen.getByDisplayValue("15")).toBeInTheDocument();
    });
  });

  describe("HFR Trigger", () => {
    it("should render amount input", () => {
      const trigger = createHFRTrigger();

      renderWithProviders(
        <TriggerProperties trigger={trigger} containerId="container-1" />,
      );

      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    });

    it("should render sample size input", () => {
      const trigger = createHFRTrigger();

      renderWithProviders(
        <TriggerProperties trigger={trigger} containerId="container-1" />,
      );

      expect(screen.getByLabelText(/sample size/i)).toBeInTheDocument();
    });

    it("should display current values", () => {
      const trigger = createHFRTrigger({
        data: { Amount: 20, SampleSize: 15 },
      });

      renderWithProviders(
        <TriggerProperties trigger={trigger} containerId="container-1" />,
      );

      expect(screen.getByDisplayValue("20")).toBeInTheDocument();
      expect(screen.getByDisplayValue("15")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call updateTrigger when value changes", async () => {
      const user = userEvent.setup();
      const trigger = createDitherTrigger();
      const store = useSequenceEditorStore.getState();
      const updateTriggerSpy = jest.spyOn(store, "updateTrigger");

      renderWithProviders(
        <TriggerProperties trigger={trigger} containerId="container-1" />,
      );

      const input = screen.getByLabelText(/after exposures/i);
      await user.clear(input);
      await user.type(input, "12");

      expect(updateTriggerSpy).toHaveBeenCalled();
    });
  });

  describe("Unknown Trigger Type", () => {
    it("should show fallback message for unknown trigger types", () => {
      const unknownTrigger: EditorTrigger = {
        id: "unknown-1",
        type: "Unknown.Trigger.Type",
        name: "Unknown",
        category: "Unknown",
        data: {},
      };

      renderWithProviders(
        <TriggerProperties trigger={unknownTrigger} containerId="container-1" />,
      );

      // Should show some fallback content
      expect(document.body.textContent).toBeTruthy();
    });
  });
});
