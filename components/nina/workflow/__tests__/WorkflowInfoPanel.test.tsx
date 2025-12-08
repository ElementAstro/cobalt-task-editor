/**
 * Unit tests for WorkflowInfoPanel component
 */

import { render, screen } from "@testing-library/react";
import { WorkflowInfoPanel } from "../WorkflowInfoPanel";
import { ReactFlowProvider } from "@xyflow/react";
import type { Translations } from "@/lib/i18n";

const mockTranslations = {
  editor: {
    startInstructions: "Start Instructions",
    targetInstructions: "Target Instructions",
    endInstructions: "End Instructions",
  },
  toolbox: {
    conditions: "Conditions",
    triggers: "Triggers",
  },
} as unknown as Translations;

const renderWithProviders = (component: React.ReactNode) => {
  return render(<ReactFlowProvider>{component}</ReactFlowProvider>);
};

describe("WorkflowInfoPanel", () => {
  const defaultProps = {
    t: mockTranslations,
  };

  describe("Rendering", () => {
    it("should render all area labels", () => {
      renderWithProviders(<WorkflowInfoPanel {...defaultProps} />);

      expect(screen.getByText("Start Instructions")).toBeInTheDocument();
      expect(screen.getByText("Target Instructions")).toBeInTheDocument();
      expect(screen.getByText("End Instructions")).toBeInTheDocument();
    });

    it("should render conditions label", () => {
      renderWithProviders(<WorkflowInfoPanel {...defaultProps} />);

      expect(screen.getByText("Conditions")).toBeInTheDocument();
    });

    it("should render triggers label", () => {
      renderWithProviders(<WorkflowInfoPanel {...defaultProps} />);

      expect(screen.getByText("Triggers")).toBeInTheDocument();
    });

    it("should render color indicators", () => {
      renderWithProviders(<WorkflowInfoPanel {...defaultProps} />);

      // Check for color indicator elements
      const greenIndicator = document.querySelector(".bg-green-500");
      const blueIndicator = document.querySelector(".bg-blue-500");
      const orangeIndicator = document.querySelector(".bg-orange-500");
      const yellowIndicator = document.querySelector(".bg-yellow-500");
      const purpleIndicator = document.querySelector(".bg-purple-500");

      expect(greenIndicator).toBeInTheDocument();
      expect(blueIndicator).toBeInTheDocument();
      expect(orangeIndicator).toBeInTheDocument();
      expect(yellowIndicator).toBeInTheDocument();
      expect(purpleIndicator).toBeInTheDocument();
    });
  });
});
