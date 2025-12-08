/**
 * Unit tests for TemplatePreview component
 */

import { render, screen } from "@testing-library/react";
import { TemplatePreview } from "../TemplatePreview";
import { I18nProvider } from "@/lib/i18n/context";
import type { SequenceTemplate } from "@/lib/nina/multi-sequence-store";

const renderWithProviders = (component: React.ReactNode) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

const createMockTemplate = (): SequenceTemplate => ({
  id: "template-1",
  name: "Test Template",
  description: "A test template description",
  category: "custom",
  mode: "advanced",
  sequence: {
    id: "seq-1",
    title: "Test Sequence",
    startItems: [
      { id: "start-1", type: "NINA.Camera.CoolCamera", name: "Cool", category: "Camera", status: "CREATED", data: {} },
    ],
    targetItems: [
      { id: "target-1", type: "NINA.Camera.TakeExposure", name: "Exposure", category: "Camera", status: "CREATED", data: {} },
    ],
    endItems: [],
    globalTriggers: [],
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

describe("TemplatePreview", () => {
  it("should render template name", () => {
    renderWithProviders(<TemplatePreview template={createMockTemplate()} />);
    expect(screen.getByText("Test Template")).toBeInTheDocument();
  });

  it("should render template description", () => {
    renderWithProviders(<TemplatePreview template={createMockTemplate()} />);
    expect(screen.getByText("A test template description")).toBeInTheDocument();
  });

  it("should render item count badge", () => {
    renderWithProviders(<TemplatePreview template={createMockTemplate()} />);
    // Multiple "2" may appear, use getAllByText
    expect(screen.getAllByText(/2/).length).toBeGreaterThan(0);
  });

  it("should render mode badge", () => {
    renderWithProviders(<TemplatePreview template={createMockTemplate()} />);
    expect(screen.getByText("Advanced")).toBeInTheDocument();
  });

  it("should render area sections", () => {
    renderWithProviders(<TemplatePreview template={createMockTemplate()} />);
    expect(screen.getByText("Start Area")).toBeInTheDocument();
    expect(screen.getByText("Target Area")).toBeInTheDocument();
    expect(screen.getByText("End Area")).toBeInTheDocument();
  });
});
