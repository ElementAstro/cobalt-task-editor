'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useI18n } from '@/lib/i18n';

interface TourStep {
  id: string;
  titleKey: keyof typeof import('@/lib/i18n/locales/en').en.onboarding;
  descKey: keyof typeof import('@/lib/i18n/locales/en').en.onboarding;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    titleKey: 'welcome',
    descKey: 'welcomeDesc',
    position: 'center',
  },
  {
    id: 'toolbox',
    titleKey: 'toolboxTitle',
    descKey: 'toolboxDesc',
    targetSelector: '[data-tour="toolbox"]',
    position: 'right',
  },
  {
    id: 'tabs',
    titleKey: 'tabsTitle',
    descKey: 'tabsDesc',
    targetSelector: '[data-tour="tabs"]',
    position: 'bottom',
  },
  {
    id: 'sequence',
    titleKey: 'sequenceAreaTitle',
    descKey: 'sequenceAreaDesc',
    targetSelector: '[data-tour="sequence"]',
    position: 'top',
  },
  {
    id: 'properties',
    titleKey: 'propertiesTitle',
    descKey: 'propertiesDesc',
    targetSelector: '[data-tour="properties"]',
    position: 'left',
  },
];

const STORAGE_KEY = 'nina-editor-tour-completed';

interface OnboardingTourProps {
  forceShow?: boolean;
}

export function OnboardingTour({ forceShow = false }: OnboardingTourProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Check if tour should be shown
  useEffect(() => {
    if (forceShow) {
      requestAnimationFrame(() => {
        setIsOpen(true);
        setCurrentStep(0);
      });
      return;
    }

    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Delay showing the tour slightly for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  // Update highlight position when step changes
  useEffect(() => {
    if (!isOpen) return;

    const step = TOUR_STEPS[currentStep];
    if (step.targetSelector && step.position !== 'center') {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        requestAnimationFrame(() => {
          const rect = element.getBoundingClientRect();
          setHighlightRect(rect);
        });
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        requestAnimationFrame(() => setHighlightRect(null));
      }
    } else {
      requestAnimationFrame(() => setHighlightRect(null));
    }
  }, [currentStep, isOpen]);

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleFinish = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const handleSkip = useCallback(() => {
    setIsOpen(false);
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [dontShowAgain]);

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isCenterPosition = step.position === 'center';

  // Get step progress text
  const stepProgress = t.onboarding.stepOf
    .replace('{current}', String(currentStep + 1))
    .replace('{total}', String(TOUR_STEPS.length));

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay with highlight cutout */}
      {highlightRect && !isCenterPosition && (
        <div className="fixed inset-0 z-100 pointer-events-none">
          {/* Dark overlay with cutout */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <mask id="tour-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={highlightRect.left - 8}
                  y={highlightRect.top - 8}
                  width={highlightRect.width + 16}
                  height={highlightRect.height + 16}
                  rx="8"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.7)"
              mask="url(#tour-mask)"
            />
          </svg>
          {/* Highlight border */}
          <div
            className="absolute border-2 border-blue-500 rounded-lg animate-pulse pointer-events-none"
            style={{
              left: highlightRect.left - 8,
              top: highlightRect.top - 8,
              width: highlightRect.width + 16,
              height: highlightRect.height + 16,
            }}
          />
        </div>
      )}

      {/* Tour Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className={`max-w-[90vw] sm:max-w-md z-101 p-4 sm:p-6 ${
            isCenterPosition ? '' : 'fixed'
          }`}
          style={
            !isCenterPosition && highlightRect && step.position !== 'center'
              ? getTooltipPosition(highlightRect, step.position || 'bottom')
              : undefined
          }
        >
          <DialogHeader>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
              <DialogTitle className="text-base sm:text-lg">{t.onboarding[step.titleKey]}</DialogTitle>
            </div>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t.onboarding[step.descKey]}
            </DialogDescription>
          </DialogHeader>

          {/* Progress indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 py-2">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 sm:h-1.5 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center">{stepProgress}</p>

          <DialogFooter className="flex-col gap-3 sm:gap-2 pt-2">
            <div className="flex items-center gap-2 w-full sm:mr-auto sm:w-auto">
              <Checkbox
                id="dont-show"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                className="h-4 w-4"
              />
              <Label htmlFor="dont-show" className="text-[11px] sm:text-xs text-muted-foreground cursor-pointer">
                {t.onboarding.dontShowAgain}
              </Label>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {!isFirstStep && (
                <Button variant="outline" size="sm" onClick={handlePrev} className="h-8 sm:h-9 text-xs sm:text-sm">
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                  {t.onboarding.prev}
                </Button>
              )}

              {isFirstStep && (
                <Button variant="ghost" size="sm" onClick={handleSkip} className="h-8 sm:h-9 text-xs sm:text-sm">
                  {t.onboarding.skip}
                </Button>
              )}

              {isLastStep ? (
                <Button size="sm" onClick={handleFinish} className="h-8 sm:h-9 text-xs sm:text-sm">
                  {t.onboarding.finish}
                </Button>
              ) : (
                <Button size="sm" onClick={handleNext} className="h-8 sm:h-9 text-xs sm:text-sm">
                  {t.onboarding.next}
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper function to calculate tooltip position
function getTooltipPosition(
  rect: DOMRect,
  position: 'top' | 'bottom' | 'left' | 'right'
): React.CSSProperties {
  const offset = 16;
  const dialogWidth = 400;
  const dialogHeight = 200;

  switch (position) {
    case 'top':
      return {
        left: Math.max(16, Math.min(rect.left + rect.width / 2 - dialogWidth / 2, window.innerWidth - dialogWidth - 16)),
        top: Math.max(16, rect.top - dialogHeight - offset),
        transform: 'none',
      };
    case 'bottom':
      return {
        left: Math.max(16, Math.min(rect.left + rect.width / 2 - dialogWidth / 2, window.innerWidth - dialogWidth - 16)),
        top: rect.bottom + offset,
        transform: 'none',
      };
    case 'left':
      return {
        left: Math.max(16, rect.left - dialogWidth - offset),
        top: Math.max(16, rect.top + rect.height / 2 - dialogHeight / 2),
        transform: 'none',
      };
    case 'right':
      return {
        left: rect.right + offset,
        top: Math.max(16, rect.top + rect.height / 2 - dialogHeight / 2),
        transform: 'none',
      };
    default:
      return {};
  }
}

// Help button to restart tour
export function TourHelpButton() {
  const { t } = useI18n();
  const [showTour, setShowTour] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTour(true)}
            className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
            aria-label={t.onboarding.startTour}
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="hidden sm:block">{t.onboarding.startTour}</TooltipContent>
      </Tooltip>
      {showTour && <OnboardingTour forceShow />}
    </>
  );
}
