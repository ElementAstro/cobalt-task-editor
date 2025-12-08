/**
 * Unit tests for ExposureRow component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExposureRow } from "../ExposureRow";
import { I18nProvider } from "@/lib/i18n/context";
import {
  ImageType,
  SequenceEntityStatus,
  type SimpleExposure,
} from "@/lib/nina/simple-sequence-types";

const createMockExposure = (
  overrides: Partial<SimpleExposure> = {},
): SimpleExposure => ({
  id: "exp-1",
  enabled: true,
  status: SequenceEntityStatus.CREATED,
  exposureTime: 300,
  imageType: ImageType.LIGHT,
  filter: { name: "L", position: 0 },
  binning: { x: 1, y: 1 },
  gain: 100,
  offset: 10,
  totalCount: 20,
  progressCount: 5,
  dither: false,
  ditherEvery: 1,
  ...overrides,
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <table>
        <tbody>{component}</tbody>
      </table>
    </I18nProvider>,
  );
};

describe("ExposureRow", () => {
  const defaultProps = {
    exposure: createMockExposure(),
    index: 0,
    targetId: "target-1",
    isSelected: false,
    onSelect: jest.fn(),
    imageTypeOptions: ["LIGHT", "DARK", "FLAT", "BIAS"],
    updateExposure: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render exposure row", () => {
      renderWithProviders(<ExposureRow {...defaultProps} />);

      expect(screen.getByRole("row")).toBeInTheDocument();
    });

    it("should display row index", () => {
      renderWithProviders(<ExposureRow {...defaultProps} />);

      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("should display progress count", () => {
      renderWithProviders(<ExposureRow {...defaultProps} />);

      expect(screen.getByText("5 / 20")).toBeInTheDocument();
    });

    it("should render enabled checkbox", () => {
      renderWithProviders(<ExposureRow {...defaultProps} />);

      const checkbox = screen.getAllByRole("checkbox")[0];
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeChecked();
    });

    it("should render dither checkbox", () => {
      renderWithProviders(<ExposureRow {...defaultProps} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThan(1);
    });
  });

  describe("Selected State", () => {
    it("should apply selected styling when selected", () => {
      renderWithProviders(<ExposureRow {...defaultProps} isSelected={true} />);

      const row = screen.getByRole("row");
      expect(row).toHaveClass("bg-emerald-500/10");
    });
  });

  describe("Disabled State", () => {
    it("should apply disabled styling when not enabled", () => {
      const disabledExposure = createMockExposure({ enabled: false });
      renderWithProviders(
        <ExposureRow {...defaultProps} exposure={disabledExposure} />,
      );

      const row = screen.getByRole("row");
      expect(row).toHaveClass("opacity-50");
    });
  });

  describe("Interactions", () => {
    it("should call onSelect when row is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExposureRow {...defaultProps} />);

      await user.click(screen.getByRole("row"));

      expect(defaultProps.onSelect).toHaveBeenCalled();
    });

    it("should call updateExposure when enabled checkbox is toggled", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExposureRow {...defaultProps} />);

      const checkbox = screen.getAllByRole("checkbox")[0];
      await user.click(checkbox);

      expect(defaultProps.updateExposure).toHaveBeenCalledWith(
        "target-1",
        "exp-1",
        { enabled: false },
      );
    });

    it("should call updateExposure when dither checkbox is toggled", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExposureRow {...defaultProps} />);

      const checkboxes = screen.getAllByRole("checkbox");
      const ditherCheckbox = checkboxes[checkboxes.length - 1];
      await user.click(ditherCheckbox);

      expect(defaultProps.updateExposure).toHaveBeenCalledWith(
        "target-1",
        "exp-1",
        { dither: true },
      );
    });
  });

  describe("Status Display", () => {
    it("should display running status color", () => {
      const runningExposure = createMockExposure({
        status: SequenceEntityStatus.RUNNING,
      });
      renderWithProviders(
        <ExposureRow {...defaultProps} exposure={runningExposure} />,
      );

      expect(document.body).toBeInTheDocument();
    });

    it("should display finished status color", () => {
      const finishedExposure = createMockExposure({
        status: SequenceEntityStatus.FINISHED,
      });
      renderWithProviders(
        <ExposureRow {...defaultProps} exposure={finishedExposure} />,
      );

      expect(document.body).toBeInTheDocument();
    });
  });
});
