/**
 * Unit tests for DeepSkyObjectProperties component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeepSkyObjectProperties } from "../DeepSkyObjectProperties";
import { I18nProvider } from "@/lib/i18n/context";
import type { EditorSequenceItem } from "@/lib/nina/types";

const createMockItem = (
  overrides: Partial<EditorSequenceItem> = {},
): EditorSequenceItem =>
  ({
    id: "item-1",
    type: "NINA.Sequencer.Container.DeepSkyObjectContainer",
    name: "Deep Sky Object",
    status: "CREATED",
    data: {
      Target: {
        name: "M31",
        ra: { hours: 0, minutes: 42, seconds: 44 },
        dec: { degrees: 41, minutes: 16, seconds: 9, negative: false },
        rotation: 45,
      },
    },
    ...overrides,
  }) as EditorSequenceItem;

const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe("DeepSkyObjectProperties", () => {
  const defaultProps = {
    item: createMockItem(),
    onUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render target name input", () => {
      renderWithProviders(<DeepSkyObjectProperties {...defaultProps} />);

      expect(screen.getByDisplayValue("M31")).toBeInTheDocument();
    });

    it("should render coordinate inputs", () => {
      renderWithProviders(<DeepSkyObjectProperties {...defaultProps} />);

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBeGreaterThan(0);
    });

    it("should render rotation input", () => {
      renderWithProviders(<DeepSkyObjectProperties {...defaultProps} />);

      expect(screen.getByDisplayValue("45")).toBeInTheDocument();
    });
  });

  describe("Default Values", () => {
    it("should use default values when target is undefined", () => {
      const itemWithNoTarget = createMockItem({ data: {} });
      renderWithProviders(
        <DeepSkyObjectProperties {...defaultProps} item={itemWithNoTarget} />,
      );

      expect(document.body).toBeInTheDocument();
    });

    it("should use default coordinates when not provided", () => {
      const itemWithPartialTarget = createMockItem({
        data: { Target: { name: "Test" } },
      });
      renderWithProviders(
        <DeepSkyObjectProperties
          {...defaultProps}
          item={itemWithPartialTarget}
        />,
      );

      expect(screen.getByDisplayValue("Test")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onUpdate when target name is changed", async () => {
      const user = userEvent.setup();
      renderWithProviders(<DeepSkyObjectProperties {...defaultProps} />);

      const nameInput = screen.getByDisplayValue("M31");
      await user.clear(nameInput);
      await user.type(nameInput, "NGC 7000");

      expect(defaultProps.onUpdate).toHaveBeenCalled();
    });

    it("should call onUpdate when rotation is changed", async () => {
      const user = userEvent.setup();
      renderWithProviders(<DeepSkyObjectProperties {...defaultProps} />);

      const rotationInput = screen.getByDisplayValue("45");
      await user.clear(rotationInput);
      await user.type(rotationInput, "90");

      expect(defaultProps.onUpdate).toHaveBeenCalled();
    });
  });
});
