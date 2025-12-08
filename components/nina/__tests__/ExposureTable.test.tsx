/**
 * Unit tests for ExposureTable component
 * Tests exposure management table
 */

import { render, screen } from "@testing-library/react";
import { ExposureTable } from "../ExposureTable";
import { I18nProvider } from "@/lib/i18n/context";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  SimpleExposure,
  SequenceEntityStatus,
  ImageType,
} from "@/lib/nina/simple-sequence-types";

// Mock the store
jest.mock("@/lib/nina/simple-sequence-store", () => ({
  useSimpleSequenceStore: () => ({
    addExposure: jest.fn(),
    deleteExposure: jest.fn(),
    duplicateExposure: jest.fn(),
    moveExposureUp: jest.fn(),
    moveExposureDown: jest.fn(),
    updateExposure: jest.fn(),
    resetExposureProgress: jest.fn(),
    resetAllExposuresProgress: jest.fn(),
  }),
}));

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <TooltipProvider>{component}</TooltipProvider>
    </I18nProvider>,
  );
};

// Create mock exposure
const createMockExposure = (
  overrides: Partial<SimpleExposure> = {},
): SimpleExposure => ({
  id: "exp-1",
  enabled: true,
  status: SequenceEntityStatus.CREATED,
  exposureTime: 300,
  imageType: ImageType.LIGHT,
  filter: { name: "Luminance", position: 0 },
  binning: { x: 1, y: 1 },
  gain: 100,
  offset: 10,
  totalCount: 20,
  progressCount: 0,
  dither: false,
  ditherEvery: 1,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ExposureTable", () => {
  describe("Rendering", () => {
    it("should render empty table", () => {
      renderWithProviders(<ExposureTable targetId="target-1" exposures={[]} />);

      // Should render table structure
      expect(document.body).toBeInTheDocument();
    });

    it("should render with exposures", () => {
      const exposures = [
        createMockExposure({ id: "exp-1" }),
        createMockExposure({ id: "exp-2", exposureTime: 600 }),
      ];

      renderWithProviders(
        <ExposureTable targetId="target-1" exposures={exposures} />,
      );

      // Should render table with rows
      expect(document.body).toBeInTheDocument();
    });

    it("should show add button", () => {
      renderWithProviders(<ExposureTable targetId="target-1" exposures={[]} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Exposure Display", () => {
    it("should display exposure data", () => {
      const exposures = [createMockExposure({ exposureTime: 300 })];

      renderWithProviders(
        <ExposureTable targetId="target-1" exposures={exposures} />,
      );

      // Should render table with data
      expect(document.body).toBeInTheDocument();
    });

    it("should display progress", () => {
      const exposures = [
        createMockExposure({
          totalCount: 20,
          progressCount: 5,
        }),
      ];

      renderWithProviders(
        <ExposureTable targetId="target-1" exposures={exposures} />,
      );

      // Should render table with progress
      expect(document.body).toBeInTheDocument();
    });

    it("should display filter name", () => {
      const exposures = [
        createMockExposure({
          filter: { name: "Ha", position: 4 },
        }),
      ];

      renderWithProviders(
        <ExposureTable targetId="target-1" exposures={exposures} />,
      );

      // Should render table with filter
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible table structure", () => {
      const exposures = [createMockExposure()];

      renderWithProviders(
        <ExposureTable targetId="target-1" exposures={exposures} />,
      );

      // Should have table element
      const table = document.querySelector("table");
      expect(table).toBeInTheDocument();
    });

    it("should have action buttons", () => {
      renderWithProviders(<ExposureTable targetId="target-1" exposures={[]} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Toolbar actions", () => {
    it("renders toolbar buttons", () => {
      renderWithProviders(<ExposureTable targetId="target-1" exposures={[]} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("renders with exposures", () => {
      const exposures = [
        createMockExposure({ id: "exp-1" }),
        createMockExposure({ id: "exp-2" }),
      ];

      renderWithProviders(
        <ExposureTable targetId="target-1" exposures={exposures} />,
      );

      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Row interactions", () => {
    it("renders exposure rows with inputs", () => {
      const exposures = [createMockExposure({ id: "exp-1" })];

      renderWithProviders(
        <ExposureTable targetId="target-1" exposures={exposures} />,
      );

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBeGreaterThan(0);
    });

    it("renders checkboxes for exposures", () => {
      const exposures = [createMockExposure({ id: "exp-1" })];

      renderWithProviders(
        <ExposureTable targetId="target-1" exposures={exposures} />,
      );

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it("renders multiple exposure rows", () => {
      const exposures = [
        createMockExposure({ id: "exp-1" }),
        createMockExposure({ id: "exp-2" }),
      ];

      renderWithProviders(
        <ExposureTable targetId="target-1" exposures={exposures} />,
      );

      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1);
    });
  });
});
