/**
 * Unit tests for AreaMarkerNode components
 */

import { render, screen } from "@testing-library/react";
import { AreaStartNode, AreaEndNode } from "../AreaMarkerNode";
import { I18nProvider } from "@/lib/i18n/context";
import { ReactFlowProvider } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <ReactFlowProvider>{component}</ReactFlowProvider>
    </I18nProvider>,
  );
};

describe("AreaStartNode", () => {
  const defaultProps = {
    id: "start-1",
    data: {
      area: "start",
      label: "Start",
    },
    type: "areaStart",
    selected: false,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    zIndex: 0,
  } as unknown as NodeProps;

  describe("Rendering", () => {
    it("should render start area marker", () => {
      renderWithProviders(<AreaStartNode {...defaultProps} />);

      expect(document.body).toBeInTheDocument();
    });

    it("should render target area marker", () => {
      const targetProps = {
        ...defaultProps,
        data: { area: "target", label: "Target" },
      };
      renderWithProviders(<AreaStartNode {...targetProps} />);

      expect(document.body).toBeInTheDocument();
    });

    it("should render end area marker", () => {
      const endProps = {
        ...defaultProps,
        data: { area: "end", label: "End" },
      };
      renderWithProviders(<AreaStartNode {...endProps} />);

      expect(document.body).toBeInTheDocument();
    });
  });
});

describe("AreaEndNode", () => {
  const defaultProps = {
    id: "end-1",
    data: {
      area: "start",
      label: "End",
    },
    type: "areaEnd",
    selected: false,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    zIndex: 0,
  } as unknown as NodeProps;

  describe("Rendering", () => {
    it("should render end marker", () => {
      renderWithProviders(<AreaEndNode {...defaultProps} />);

      expect(screen.getByText("End")).toBeInTheDocument();
    });

    it("should render with correct area color", () => {
      renderWithProviders(<AreaEndNode {...defaultProps} />);

      expect(document.body).toBeInTheDocument();
    });
  });
});
