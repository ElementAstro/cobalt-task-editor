/**
 * Unit tests for types.ts
 * Tests enums and type guards
 */

import {
  InstructionErrorBehavior,
  ExecutionStrategyType,
  ImageType,
  isSequenceContainer,
  isDeepSkyObjectContainer,
} from '../types';

describe('types', () => {
  describe('Enums', () => {
    describe('InstructionErrorBehavior', () => {
      it('should have ContinueOnError value', () => {
        expect(InstructionErrorBehavior.ContinueOnError).toBe('ContinueOnError');
      });

      it('should have AbortOnError value', () => {
        expect(InstructionErrorBehavior.AbortOnError).toBe('AbortOnError');
      });

      it('should have SkipInstructionSetOnError value', () => {
        expect(InstructionErrorBehavior.SkipInstructionSetOnError).toBe('SkipInstructionSetOnError');
      });

      it('should have SkipToSequenceEndInstructions value', () => {
        expect(InstructionErrorBehavior.SkipToSequenceEndInstructions).toBe('SkipToSequenceEndInstructions');
      });
    });

    describe('ExecutionStrategyType', () => {
      it('should have Sequential value', () => {
        expect(ExecutionStrategyType.Sequential).toBe('Sequential');
      });

      it('should have Parallel value', () => {
        expect(ExecutionStrategyType.Parallel).toBe('Parallel');
      });
    });

    describe('ImageType', () => {
      it('should have LIGHT value', () => {
        expect(ImageType.LIGHT).toBe('LIGHT');
      });

      it('should have DARK value', () => {
        expect(ImageType.DARK).toBe('DARK');
      });

      it('should have BIAS value', () => {
        expect(ImageType.BIAS).toBe('BIAS');
      });

      it('should have FLAT value', () => {
        expect(ImageType.FLAT).toBe('FLAT');
      });

      it('should have SNAPSHOT value', () => {
        expect(ImageType.SNAPSHOT).toBe('SNAPSHOT');
      });
    });
  });

  describe('Type Guards', () => {
    describe('isSequenceContainer', () => {
      it('should return true for container with Items and Strategy', () => {
        const container = {
          $id: '1',
          $type: 'NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer',
          Name: 'Test Container',
          Items: [],
          Strategy: { $type: 'Sequential' },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isSequenceContainer(container as any)).toBe(true);
      });

      it('should return false for item without Items', () => {
        const item = {
          $id: '1',
          $type: 'NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer',
          Name: 'Cool Camera',
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isSequenceContainer(item as any)).toBe(false);
      });
    });

    describe('isDeepSkyObjectContainer', () => {
      it('should return true for DSO container', () => {
        const dsoContainer = {
          $id: '1',
          $type: 'NINA.Sequencer.Container.DeepSkyObjectContainer, NINA.Sequencer',
          Name: 'M31',
          Items: [],
          Strategy: { $type: 'Sequential' },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isDeepSkyObjectContainer(dsoContainer as any)).toBe(true);
      });

      it('should return false for non-DSO container', () => {
        const container = {
          $id: '1',
          $type: 'NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer',
          Name: 'Test',
          Items: [],
          Strategy: { $type: 'Sequential' },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isDeepSkyObjectContainer(container as any)).toBe(false);
      });
    });
  });

  describe('SequenceEntityStatus', () => {
    it('should be a string union type', () => {
      const statuses = ['CREATED', 'RUNNING', 'FINISHED', 'FAILED', 'SKIPPED', 'DISABLED'];
      statuses.forEach(status => {
        expect(typeof status).toBe('string');
      });
    });
  });
});
