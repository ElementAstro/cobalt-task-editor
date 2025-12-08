/**
 * Unit tests for CameraProperties component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CameraProperties } from "../CameraProperties";
import { I18nProvider } from "@/lib/i18n/context";
import type { EditorSequenceItem } from "@/lib/nina/types";

const createMockItem = (
  type: string,
  overrides: Partial<EditorSequenceItem> = {},
): EditorSequenceItem =>
  ({
    id: "item-1",
    type,
    name: "Camera Action",
    status: "CREATED",
    data: {
      Temperature: -10,
      Duration: 5,
    },
    ...overrides,
  }) as EditorSequenceItem;

const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe("CameraProperties", () => {
  const defaultProps = {
    item: createMockItem("NINA.Sequencer.SequenceItem.Camera.CoolCamera"),
    onUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("CoolCamera Rendering", () => {
    it("should render temperature input for CoolCamera", () => {
      renderWithProviders(<CameraProperties {...defaultProps} />);

      expect(screen.getByDisplayValue("-10")).toBeInTheDocument();
    });

    it("should render duration input for CoolCamera", () => {
      renderWithProviders(<CameraProperties {...defaultProps} />);

      expect(screen.getByDisplayValue("5")).toBeInTheDocument();
    });
  });

  describe("WarmCamera Rendering", () => {
    it("should render duration input for WarmCamera", () => {
      const warmCameraItem = createMockItem(
        "NINA.Sequencer.SequenceItem.Camera.WarmCamera",
      );
      renderWithProviders(
        <CameraProperties {...defaultProps} item={warmCameraItem} />,
      );

      expect(screen.getByDisplayValue("5")).toBeInTheDocument();
    });

    it("should not render temperature input for WarmCamera", () => {
      const warmCameraItem = createMockItem(
        "NINA.Sequencer.SequenceItem.Camera.WarmCamera",
      );
      renderWithProviders(
        <CameraProperties {...defaultProps} item={warmCameraItem} />,
      );

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBe(1);
    });
  });

  describe("Other Camera Types", () => {
    it("should return null for non-camera types", () => {
      const otherItem = createMockItem(
        "NINA.Sequencer.SequenceItem.Other.Something",
      );
      const { container } = renderWithProviders(
        <CameraProperties {...defaultProps} item={otherItem} />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Interactions", () => {
    it("should call onUpdate when temperature is changed", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CameraProperties {...defaultProps} />);

      const tempInput = screen.getByDisplayValue("-10");
      await user.clear(tempInput);
      await user.type(tempInput, "-20");

      expect(defaultProps.onUpdate).toHaveBeenCalled();
    });

    it("should call onUpdate when duration is changed", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CameraProperties {...defaultProps} />);

      const durationInput = screen.getByDisplayValue("5");
      await user.clear(durationInput);
      await user.type(durationInput, "10");

      expect(defaultProps.onUpdate).toHaveBeenCalled();
    });
  });
});
