/**
 * Unit tests for ExposureProperties component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExposureProperties } from "../ExposureProperties";
import { I18nProvider } from "@/lib/i18n/context";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { EditorSequenceItem } from "@/lib/nina/types";

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <TooltipProvider>{component}</TooltipProvider>
    </I18nProvider>,
  );
};

// Create mock exposure item
const createMockExposureItem = (
  overrides: Partial<EditorSequenceItem> = {},
): EditorSequenceItem => ({
  id: "exposure-1",
  type: "NINA.Sequencer.SequenceItem.Imaging.TakeExposure, NINA.Sequencer",
  name: "Take Exposure",
  category: "Imaging",
  status: "CREATED",
  data: {
    ExposureTime: 300,
    Gain: 100,
    Offset: 10,
    ImageType: "LIGHT",
    Binning: { X: 1, Y: 1 },
  },
  ...overrides,
});

describe("ExposureProperties", () => {
  describe("Rendering", () => {
    it("should render exposure time input", () => {
      const item = createMockExposureItem();
      const onUpdate = jest.fn();

      renderWithProviders(
        <ExposureProperties item={item} onUpdate={onUpdate} />,
      );

      expect(screen.getByLabelText(/exposure time/i)).toBeInTheDocument();
    });

    it("should render gain input", () => {
      const item = createMockExposureItem();
      const onUpdate = jest.fn();

      renderWithProviders(
        <ExposureProperties item={item} onUpdate={onUpdate} />,
      );

      expect(screen.getByLabelText(/gain/i)).toBeInTheDocument();
    });

    it("should render offset input", () => {
      const item = createMockExposureItem();
      const onUpdate = jest.fn();

      renderWithProviders(
        <ExposureProperties item={item} onUpdate={onUpdate} />,
      );

      expect(screen.getByLabelText(/offset/i)).toBeInTheDocument();
    });

    it("should render image type select", () => {
      const item = createMockExposureItem();
      const onUpdate = jest.fn();

      renderWithProviders(
        <ExposureProperties item={item} onUpdate={onUpdate} />,
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should render binning inputs", () => {
      const item = createMockExposureItem();
      const onUpdate = jest.fn();

      renderWithProviders(
        <ExposureProperties item={item} onUpdate={onUpdate} />,
      );

      expect(screen.getByLabelText(/binning x/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/binning y/i)).toBeInTheDocument();
    });

    it("should display current values", () => {
      const item = createMockExposureItem({
        data: {
          ExposureTime: 120,
          Gain: 200,
          Offset: 20,
          ImageType: "LIGHT",
          Binning: { X: 2, Y: 2 },
        },
      });
      const onUpdate = jest.fn();

      renderWithProviders(
        <ExposureProperties item={item} onUpdate={onUpdate} />,
      );

      expect(screen.getByDisplayValue("120")).toBeInTheDocument();
      expect(screen.getByDisplayValue("200")).toBeInTheDocument();
      expect(screen.getByDisplayValue("20")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onUpdate when exposure time changes", async () => {
      const user = userEvent.setup();
      const item = createMockExposureItem();
      const onUpdate = jest.fn();

      renderWithProviders(
        <ExposureProperties item={item} onUpdate={onUpdate} />,
      );

      const input = screen.getByLabelText(/exposure time/i);
      await user.clear(input);
      await user.type(input, "600");

      expect(onUpdate).toHaveBeenCalled();
    });

    it("should call onUpdate when gain changes", async () => {
      const user = userEvent.setup();
      const item = createMockExposureItem();
      const onUpdate = jest.fn();

      renderWithProviders(
        <ExposureProperties item={item} onUpdate={onUpdate} />,
      );

      const input = screen.getByLabelText(/gain/i);
      await user.clear(input);
      await user.type(input, "150");

      expect(onUpdate).toHaveBeenCalled();
    });

    it("should update data property correctly", async () => {
      const user = userEvent.setup();
      const item = createMockExposureItem();
      const onUpdate = jest.fn();

      renderWithProviders(
        <ExposureProperties item={item} onUpdate={onUpdate} />,
      );

      const input = screen.getByLabelText(/offset/i);
      await user.clear(input);
      await user.type(input, "5");

      // Should be called with data update
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            Offset: expect.any(Number),
          }),
        }),
      );
    });
  });
});
