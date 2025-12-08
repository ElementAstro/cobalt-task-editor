/**
 * Unit tests for AnnotationProperties component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnnotationProperties } from "../AnnotationProperties";
import { I18nProvider } from "@/lib/i18n/context";
import type { EditorSequenceItem } from "@/lib/nina/types";

const createMockItem = (
  overrides: Partial<EditorSequenceItem> = {},
): EditorSequenceItem =>
  ({
    id: "item-1",
    type: "NINA.Sequencer.SequenceItem.Utility.Annotation",
    name: "Annotation",
    status: "CREATED",
    data: {
      Text: "Test annotation text",
    },
    ...overrides,
  }) as EditorSequenceItem;

const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe("AnnotationProperties", () => {
  const defaultProps = {
    item: createMockItem(),
    onUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render text input", () => {
      renderWithProviders(<AnnotationProperties {...defaultProps} />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should display current text value", () => {
      renderWithProviders(<AnnotationProperties {...defaultProps} />);

      expect(screen.getByDisplayValue("Test annotation text")).toBeInTheDocument();
    });

    it("should display empty text when no value", () => {
      const itemWithNoText = createMockItem({ data: {} });
      renderWithProviders(
        <AnnotationProperties {...defaultProps} item={itemWithNoText} />,
      );

      expect(screen.getByRole("textbox")).toHaveValue("");
    });
  });

  describe("Interactions", () => {
    it("should call onUpdate when text is changed", async () => {
      const user = userEvent.setup();
      renderWithProviders(<AnnotationProperties {...defaultProps} />);

      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, "New text");

      expect(defaultProps.onUpdate).toHaveBeenCalled();
    });

    it("should update data with new text value", async () => {
      const user = userEvent.setup();
      renderWithProviders(<AnnotationProperties {...defaultProps} />);

      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, "X");

      expect(defaultProps.onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            Text: expect.any(String),
          }),
        }),
      );
    });
  });
});
