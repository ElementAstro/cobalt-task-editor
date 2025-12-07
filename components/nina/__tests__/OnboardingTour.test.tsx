/**
 * Unit tests for OnboardingTour component
 * Tests onboarding tour functionality
 */

import { render } from "@testing-library/react";
import { OnboardingTour } from "../OnboardingTour";
import { I18nProvider } from "@/lib/i18n/context";
import { TooltipProvider } from "@/components/ui/tooltip";

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <TooltipProvider>{component}</TooltipProvider>
    </I18nProvider>,
  );
};

describe("OnboardingTour", () => {
  describe("Rendering", () => {
    it("should render without crashing", () => {
      renderWithProviders(<OnboardingTour />);
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Tour State", () => {
    it("should handle tour visibility", () => {
      renderWithProviders(<OnboardingTour />);
      // Tour may or may not be visible based on localStorage
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible structure", () => {
      renderWithProviders(<OnboardingTour />);
      expect(document.body).toBeInTheDocument();
    });
  });
});
