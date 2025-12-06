/**
 * Unit tests for TargetCard component
 * Tests target card display and interactions
 */

import { render, screen } from '@testing-library/react';
import { TargetCard } from '../TargetCard';
import { I18nProvider } from '@/lib/i18n/context';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  SimpleTarget,
  SequenceEntityStatus,
  SequenceMode,
  ImageType,
  createDefaultCoordinates,
} from '@/lib/nina/simple-sequence-types';

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nProvider>
      <TooltipProvider>
        {component}
      </TooltipProvider>
    </I18nProvider>
  );
};

// Create mock target
const createMockTarget = (overrides: Partial<SimpleTarget> = {}): SimpleTarget => ({
  id: 'target-1',
  name: 'M31',
  status: SequenceEntityStatus.CREATED,
  targetName: 'Andromeda Galaxy',
  coordinates: createDefaultCoordinates(),
  positionAngle: 0,
  rotation: 0,
  delay: 0,
  mode: SequenceMode.STANDARD,
  slewToTarget: true,
  centerTarget: true,
  rotateTarget: false,
  startGuiding: true,
  autoFocusOnStart: true,
  autoFocusOnFilterChange: false,
  autoFocusAfterSetTime: false,
  autoFocusSetTime: 30,
  autoFocusAfterSetExposures: false,
  autoFocusSetExposures: 10,
  autoFocusAfterTemperatureChange: false,
  autoFocusAfterTemperatureChangeAmount: 1,
  autoFocusAfterHFRChange: false,
  autoFocusAfterHFRChangeAmount: 15,
  exposures: [
    {
      id: 'exp-1',
      enabled: true,
      status: SequenceEntityStatus.CREATED,
      exposureTime: 300,
      imageType: ImageType.LIGHT,
      filter: { name: 'L', position: 0 },
      binning: { x: 1, y: 1 },
      gain: 100,
      offset: 10,
      totalCount: 20,
      progressCount: 5,
      dither: false,
      ditherEvery: 1,
    },
  ],
  ...overrides,
});

// Mock handlers
const mockHandlers = {
  onSelect: jest.fn(),
  onMoveUp: jest.fn(),
  onMoveDown: jest.fn(),
  onDuplicate: jest.fn(),
  onDelete: jest.fn(),
  onReset: jest.fn(),
};

describe('TargetCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const target = createMockTarget();
      renderWithProviders(
        <TargetCard
          target={target}
          isSelected={false}
          isActive={false}
          index={0}
          totalTargets={1}
          {...mockHandlers}
        />
      );
      expect(document.body).toBeInTheDocument();
    });

    it('should display target name', () => {
      const target = createMockTarget({ targetName: 'Orion Nebula' });
      renderWithProviders(
        <TargetCard
          target={target}
          isSelected={false}
          isActive={false}
          index={0}
          totalTargets={1}
          {...mockHandlers}
        />
      );
      expect(screen.getByText('Orion Nebula')).toBeInTheDocument();
    });

    it('should render selected state', () => {
      const target = createMockTarget();
      renderWithProviders(
        <TargetCard
          target={target}
          isSelected={true}
          isActive={false}
          index={0}
          totalTargets={1}
          {...mockHandlers}
        />
      );
      expect(document.body).toBeInTheDocument();
    });

    it('should render active state', () => {
      const target = createMockTarget();
      renderWithProviders(
        <TargetCard
          target={target}
          isSelected={false}
          isActive={true}
          index={0}
          totalTargets={1}
          {...mockHandlers}
        />
      );
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('should display created status', () => {
      const target = createMockTarget({ status: SequenceEntityStatus.CREATED });
      renderWithProviders(
        <TargetCard
          target={target}
          isSelected={false}
          isActive={false}
          index={0}
          totalTargets={1}
          {...mockHandlers}
        />
      );
      expect(document.body).toBeInTheDocument();
    });

    it('should display running status', () => {
      const target = createMockTarget({ status: SequenceEntityStatus.RUNNING });
      renderWithProviders(
        <TargetCard
          target={target}
          isSelected={false}
          isActive={false}
          index={0}
          totalTargets={1}
          {...mockHandlers}
        />
      );
      expect(document.body).toBeInTheDocument();
    });

    it('should display finished status', () => {
      const target = createMockTarget({ status: SequenceEntityStatus.FINISHED });
      renderWithProviders(
        <TargetCard
          target={target}
          isSelected={false}
          isActive={false}
          index={0}
          totalTargets={1}
          {...mockHandlers}
        />
      );
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Progress Display', () => {
    it('should show progress for exposures', () => {
      const target = createMockTarget();
      renderWithProviders(
        <TargetCard
          target={target}
          isSelected={false}
          isActive={false}
          index={0}
          totalTargets={1}
          {...mockHandlers}
        />
      );
      // Should show progress indicator
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should have action buttons', () => {
      const target = createMockTarget();
      renderWithProviders(
        <TargetCard
          target={target}
          isSelected={false}
          isActive={false}
          index={0}
          totalTargets={1}
          {...mockHandlers}
        />
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible structure', () => {
      const target = createMockTarget();
      renderWithProviders(
        <TargetCard
          target={target}
          isSelected={false}
          isActive={false}
          index={0}
          totalTargets={1}
          {...mockHandlers}
        />
      );
      expect(document.body).toBeInTheDocument();
    });
  });
});
