/**
 * Unit tests for WaitProperties component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WaitProperties } from "../WaitProperties";
import { I18nProvider } from "@/lib/i18n/context";
import type { EditorSequenceItem } from "@/lib/nina/types";

const createMockItem = (
  type: string,
  data: Record<string, unknown> = {},
): EditorSequenceItem =>
  ({
    id: "item-1",
    type,
    name: "Wait",
    status: "CREATED",
    data,
  }) as EditorSequenceItem;

const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe("WaitProperties", () => {
  const defaultProps = {
    item: createMockItem("NINA.Sequencer.SequenceItem.Utility.WaitForTimeSpan", {
      Time: 60,
    }),
    onUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("WaitForTimeSpan Rendering", () => {
    it("should render time input for WaitForTimeSpan", () => {
      renderWithProviders(<WaitProperties {...defaultProps} />);

      expect(screen.getByDisplayValue("60")).toBeInTheDocument();
    });
  });

  describe("WaitForTime Rendering", () => {
    it("should render hours, minutes, seconds inputs for WaitForTime", () => {
      const waitForTimeItem = createMockItem(
        "NINA.Sequencer.SequenceItem.Utility.WaitForTime",
        { Hours: 12, Minutes: 30, Seconds: 45 },
      );
      renderWithProviders(
        <WaitProperties {...defaultProps} item={waitForTimeItem} />,
      );

      expect(screen.getByDisplayValue("12")).toBeInTheDocument();
      expect(screen.getByDisplayValue("30")).toBeInTheDocument();
      expect(screen.getByDisplayValue("45")).toBeInTheDocument();
    });
  });

  describe("WaitForAltitude Rendering", () => {
    it("should render altitude and comparator inputs", () => {
      const altitudeItem = createMockItem(
        "NINA.Sequencer.SequenceItem.Utility.WaitForAltitude",
        { TargetAltitude: 30, Comparator: ">=" },
      );
      renderWithProviders(
        <WaitProperties {...defaultProps} item={altitudeItem} />,
      );

      expect(screen.getByDisplayValue("30")).toBeInTheDocument();
    });
  });

  describe("Other Types", () => {
    it("should return null for non-wait types", () => {
      const otherItem = createMockItem(
        "NINA.Sequencer.SequenceItem.Other.Something",
        {},
      );
      const { container } = renderWithProviders(
        <WaitProperties {...defaultProps} item={otherItem} />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Interactions", () => {
    it("should call onUpdate when time is changed", async () => {
      const user = userEvent.setup();
      renderWithProviders(<WaitProperties {...defaultProps} />);

      const timeInput = screen.getByDisplayValue("60");
      await user.clear(timeInput);
      await user.type(timeInput, "120");

      expect(defaultProps.onUpdate).toHaveBeenCalled();
    });

    it("should call onUpdate when hours is changed for WaitForTime", async () => {
      const user = userEvent.setup();
      const waitForTimeItem = createMockItem(
        "NINA.Sequencer.SequenceItem.Utility.WaitForTime",
        { Hours: 12, Minutes: 30, Seconds: 45 },
      );
      renderWithProviders(
        <WaitProperties {...defaultProps} item={waitForTimeItem} />,
      );

      const hoursInput = screen.getByDisplayValue("12");
      await user.clear(hoursInput);
      await user.type(hoursInput, "15");

      expect(defaultProps.onUpdate).toHaveBeenCalled();
    });

    it("should call onUpdate when altitude is changed", async () => {
      const user = userEvent.setup();
      const altitudeItem = createMockItem(
        "NINA.Sequencer.SequenceItem.Utility.WaitForAltitude",
        { TargetAltitude: 30, Comparator: ">=" },
      );
      renderWithProviders(
        <WaitProperties {...defaultProps} item={altitudeItem} />,
      );

      const altitudeInput = screen.getByDisplayValue("30");
      await user.clear(altitudeInput);
      await user.type(altitudeInput, "45");

      expect(defaultProps.onUpdate).toHaveBeenCalled();
    });
  });
});
