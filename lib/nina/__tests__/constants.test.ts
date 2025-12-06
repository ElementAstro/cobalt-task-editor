/**
 * Unit tests for constants.ts
 * Tests item definitions, categories, and helper functions
 */

import {
  CATEGORIES,
  SEQUENCE_ITEMS,
  CONDITION_ITEMS,
  TRIGGER_ITEMS,
  IMAGE_TYPES,
  ERROR_BEHAVIORS,
  EXECUTION_STRATEGIES,
  COMPARATORS,
  TRACKING_MODES,
  getItemDefinition,
  getItemsByCategory,
  getAllCategories,
  isContainerType,
} from '../constants';

describe('Constants', () => {
  describe('CATEGORIES', () => {
    it('should have all expected categories', () => {
      expect(CATEGORIES.CONTAINER).toBe('Container');
      expect(CATEGORIES.CAMERA).toBe('Camera');
      expect(CATEGORIES.IMAGING).toBe('Imaging');
      expect(CATEGORIES.TELESCOPE).toBe('Telescope');
      expect(CATEGORIES.FOCUSER).toBe('Focuser');
      expect(CATEGORIES.FILTER_WHEEL).toBe('Filter Wheel');
      expect(CATEGORIES.GUIDER).toBe('Guider');
      expect(CATEGORIES.AUTOFOCUS).toBe('Autofocus');
      expect(CATEGORIES.PLATESOLVING).toBe('Platesolving');
      expect(CATEGORIES.ROTATOR).toBe('Rotator');
      expect(CATEGORIES.DOME).toBe('Dome');
      expect(CATEGORIES.FLAT_DEVICE).toBe('Flat Device');
      expect(CATEGORIES.SAFETY_MONITOR).toBe('Safety Monitor');
      expect(CATEGORIES.SWITCH).toBe('Switch');
      expect(CATEGORIES.UTILITY).toBe('Utility');
      expect(CATEGORIES.CONNECT).toBe('Connect');
      expect(CATEGORIES.CONDITION).toBe('Condition');
      expect(CATEGORIES.TRIGGER).toBe('Trigger');
    });
  });

  describe('SEQUENCE_ITEMS', () => {
    it('should have items defined', () => {
      expect(SEQUENCE_ITEMS.length).toBeGreaterThan(0);
    });

    it('should have valid item structure', () => {
      SEQUENCE_ITEMS.forEach(item => {
        expect(item.type).toBeDefined();
        expect(item.name).toBeDefined();
        expect(item.category).toBeDefined();
        expect(item.icon).toBeDefined();
        expect(item.description).toBeDefined();
        expect(item.defaultValues).toBeDefined();
      });
    });

    it('should include container items', () => {
      const containers = SEQUENCE_ITEMS.filter(item => item.category === CATEGORIES.CONTAINER);
      expect(containers.length).toBeGreaterThan(0);
      expect(containers.some(c => c.name === 'Sequential Container')).toBe(true);
      expect(containers.some(c => c.name === 'Parallel Container')).toBe(true);
    });

    it('should include camera items', () => {
      const cameraItems = SEQUENCE_ITEMS.filter(item => item.category === CATEGORIES.CAMERA);
      expect(cameraItems.length).toBeGreaterThan(0);
      expect(cameraItems.some(c => c.name === 'Cool Camera')).toBe(true);
    });

    it('should include imaging items', () => {
      const imagingItems = SEQUENCE_ITEMS.filter(item => item.category === CATEGORIES.IMAGING);
      expect(imagingItems.length).toBeGreaterThan(0);
      expect(imagingItems.some(c => c.name === 'Take Exposure')).toBe(true);
    });
  });

  describe('CONDITION_ITEMS', () => {
    it('should have conditions defined', () => {
      expect(CONDITION_ITEMS.length).toBeGreaterThan(0);
    });

    it('should have valid condition structure', () => {
      CONDITION_ITEMS.forEach(item => {
        expect(item.type).toBeDefined();
        expect(item.name).toBeDefined();
        expect(item.category).toBe(CATEGORIES.CONDITION);
        expect(item.icon).toBeDefined();
        expect(item.description).toBeDefined();
      });
    });

    it('should include loop condition', () => {
      const loopCondition = CONDITION_ITEMS.find(c => c.name === 'Loop');
      expect(loopCondition).toBeDefined();
      expect(loopCondition?.defaultValues).toHaveProperty('Iterations');
    });
  });

  describe('TRIGGER_ITEMS', () => {
    it('should have triggers defined', () => {
      expect(TRIGGER_ITEMS.length).toBeGreaterThan(0);
    });

    it('should have valid trigger structure', () => {
      TRIGGER_ITEMS.forEach(item => {
        expect(item.type).toBeDefined();
        expect(item.name).toBeDefined();
        expect(item.category).toBe(CATEGORIES.TRIGGER);
        expect(item.icon).toBeDefined();
        expect(item.description).toBeDefined();
      });
    });

    it('should include meridian flip trigger', () => {
      const meridianFlip = TRIGGER_ITEMS.find(t => t.name === 'Meridian Flip');
      expect(meridianFlip).toBeDefined();
    });
  });

  describe('IMAGE_TYPES', () => {
    it('should have all image types', () => {
      expect(IMAGE_TYPES.length).toBe(5);
      expect(IMAGE_TYPES.some(t => t.label === 'Light')).toBe(true);
      expect(IMAGE_TYPES.some(t => t.label === 'Dark')).toBe(true);
      expect(IMAGE_TYPES.some(t => t.label === 'Bias')).toBe(true);
      expect(IMAGE_TYPES.some(t => t.label === 'Flat')).toBe(true);
      expect(IMAGE_TYPES.some(t => t.label === 'Snapshot')).toBe(true);
    });
  });

  describe('ERROR_BEHAVIORS', () => {
    it('should have error behavior options', () => {
      expect(ERROR_BEHAVIORS.length).toBe(4);
      expect(ERROR_BEHAVIORS.some(b => b.label === 'Continue on Error')).toBe(true);
      expect(ERROR_BEHAVIORS.some(b => b.label === 'Abort on Error')).toBe(true);
    });
  });

  describe('EXECUTION_STRATEGIES', () => {
    it('should have execution strategies', () => {
      expect(EXECUTION_STRATEGIES.length).toBe(2);
      expect(EXECUTION_STRATEGIES.some(s => s.label === 'Sequential')).toBe(true);
      expect(EXECUTION_STRATEGIES.some(s => s.label === 'Parallel')).toBe(true);
    });
  });

  describe('COMPARATORS', () => {
    it('should have all comparators', () => {
      expect(COMPARATORS.length).toBe(5);
      expect(COMPARATORS.some(c => c.value === '>=')).toBe(true);
      expect(COMPARATORS.some(c => c.value === '<=')).toBe(true);
      expect(COMPARATORS.some(c => c.value === '>')).toBe(true);
      expect(COMPARATORS.some(c => c.value === '<')).toBe(true);
      expect(COMPARATORS.some(c => c.value === '==')).toBe(true);
    });
  });

  describe('TRACKING_MODES', () => {
    it('should have tracking modes', () => {
      expect(TRACKING_MODES.length).toBe(4);
      expect(TRACKING_MODES.some(m => m.label === 'Sidereal')).toBe(true);
      expect(TRACKING_MODES.some(m => m.label === 'Lunar')).toBe(true);
      expect(TRACKING_MODES.some(m => m.label === 'Solar')).toBe(true);
      expect(TRACKING_MODES.some(m => m.label === 'King')).toBe(true);
    });
  });
});

describe('Helper Functions', () => {
  describe('getItemDefinition', () => {
    it('should find sequence item by type', () => {
      const coolCamera = getItemDefinition('NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer');
      expect(coolCamera).toBeDefined();
      expect(coolCamera?.name).toBe('Cool Camera');
    });

    it('should find condition by type', () => {
      const loopCondition = getItemDefinition('NINA.Sequencer.Conditions.LoopCondition, NINA.Sequencer');
      expect(loopCondition).toBeDefined();
      expect(loopCondition?.name).toBe('Loop');
    });

    it('should find trigger by type', () => {
      const meridianFlip = getItemDefinition('NINA.Sequencer.Trigger.MeridianFlip.MeridianFlipTrigger, NINA.Sequencer');
      expect(meridianFlip).toBeDefined();
      expect(meridianFlip?.name).toBe('Meridian Flip');
    });

    it('should return undefined for unknown type', () => {
      const unknown = getItemDefinition('Unknown.Type');
      expect(unknown).toBeUndefined();
    });
  });

  describe('getItemsByCategory', () => {
    it('should return items for camera category', () => {
      const cameraItems = getItemsByCategory(CATEGORIES.CAMERA);
      expect(cameraItems.length).toBeGreaterThan(0);
      cameraItems.forEach(item => {
        expect(item.category).toBe(CATEGORIES.CAMERA);
      });
    });

    it('should return items for imaging category', () => {
      const imagingItems = getItemsByCategory(CATEGORIES.IMAGING);
      expect(imagingItems.length).toBeGreaterThan(0);
      imagingItems.forEach(item => {
        expect(item.category).toBe(CATEGORIES.IMAGING);
      });
    });

    it('should return empty array for unknown category', () => {
      const unknownItems = getItemsByCategory('Unknown');
      expect(unknownItems).toEqual([]);
    });
  });

  describe('getAllCategories', () => {
    it('should return all unique categories', () => {
      const categories = getAllCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain(CATEGORIES.CONTAINER);
      expect(categories).toContain(CATEGORIES.CAMERA);
      expect(categories).toContain(CATEGORIES.IMAGING);
    });

    it('should not have duplicates', () => {
      const categories = getAllCategories();
      const uniqueCategories = [...new Set(categories)];
      expect(categories.length).toBe(uniqueCategories.length);
    });
  });

  describe('isContainerType', () => {
    it('should return true for container types', () => {
      expect(isContainerType('NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer')).toBe(true);
      expect(isContainerType('NINA.Sequencer.Container.ParallelContainer, NINA.Sequencer')).toBe(true);
      expect(isContainerType('NINA.Sequencer.Container.DeepSkyObjectContainer, NINA.Sequencer')).toBe(true);
    });

    it('should return true for SmartExposure', () => {
      expect(isContainerType('NINA.Sequencer.SequenceItem.Imaging.SmartExposure, NINA.Sequencer')).toBe(true);
    });

    it('should return false for non-container types', () => {
      expect(isContainerType('NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer')).toBe(false);
      expect(isContainerType('NINA.Sequencer.SequenceItem.Imaging.TakeExposure, NINA.Sequencer')).toBe(false);
    });
  });
});
