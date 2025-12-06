/**
 * Unit tests for lib/nina/serializer.ts
 * Tests export/import between editor format and NINA JSON format
 */

import {
  exportToNINA,
  importFromNINA,
  exportTemplateToNINA,
  validateNINAJson,
} from '../serializer';
import type { EditorSequence, EditorSequenceItem } from '../types';
import { resetIdCounter } from '../utils';

// Helper to create a minimal editor sequence
const createTestSequence = (): EditorSequence => ({
  id: 'test-seq',
  title: 'Test Sequence',
  startItems: [],
  targetItems: [],
  endItems: [],
  globalTriggers: [],
});

// Helper to create a test item
const createTestItem = (overrides: Partial<EditorSequenceItem> = {}): EditorSequenceItem => ({
  id: 'test-item',
  type: 'NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer',
  name: 'Cool Camera',
  category: 'Camera',
  status: 'CREATED',
  data: { Temperature: -10, Duration: 600 },
  ...overrides,
});

describe('Serializer', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  describe('exportToNINA', () => {
    it('should export empty sequence', () => {
      const sequence = createTestSequence();
      const json = exportToNINA(sequence);
      const parsed = JSON.parse(json);
      
      expect(parsed.$type).toBe('NINA.Sequencer.Container.SequenceRootContainer, NINA.Sequencer');
      expect(parsed.Name).toBe('Test Sequence');
      expect(parsed.SequenceTitle).toBe('Test Sequence');
    });

    it('should include $id fields', () => {
      const sequence = createTestSequence();
      const json = exportToNINA(sequence);
      const parsed = JSON.parse(json);
      
      expect(parsed.$id).toBeTruthy();
      expect(parsed.Items.$id).toBeTruthy();
    });

    it('should export sequence with start items', () => {
      const sequence = createTestSequence();
      sequence.startItems = [createTestItem()];
      
      const json = exportToNINA(sequence);
      const parsed = JSON.parse(json);
      
      // Start area is the first item in the root container
      const startArea = parsed.Items.$values[0];
      expect(startArea.$type).toBe('NINA.Sequencer.Container.StartAreaContainer, NINA.Sequencer');
      expect(startArea.Items.$values.length).toBe(1);
    });

    it('should export sequence with target items', () => {
      const sequence = createTestSequence();
      sequence.targetItems = [createTestItem({ name: 'Target Item' })];
      
      const json = exportToNINA(sequence);
      const parsed = JSON.parse(json);
      
      // Target area is the second item in the root container
      const targetArea = parsed.Items.$values[1];
      expect(targetArea.$type).toBe('NINA.Sequencer.Container.TargetAreaContainer, NINA.Sequencer');
      expect(targetArea.Items.$values.length).toBe(1);
    });

    it('should export sequence with end items', () => {
      const sequence = createTestSequence();
      sequence.endItems = [createTestItem({ name: 'End Item' })];
      
      const json = exportToNINA(sequence);
      const parsed = JSON.parse(json);
      
      // End area is the third item in the root container
      const endArea = parsed.Items.$values[2];
      expect(endArea.$type).toBe('NINA.Sequencer.Container.EndAreaContainer, NINA.Sequencer');
      expect(endArea.Items.$values.length).toBe(1);
    });

    it('should export item data properties', () => {
      const sequence = createTestSequence();
      sequence.startItems = [createTestItem({
        data: { Temperature: -15, Duration: 900 },
      })];
      
      const json = exportToNINA(sequence);
      const parsed = JSON.parse(json);
      
      const startArea = parsed.Items.$values[0];
      const item = startArea.Items.$values[0];
      expect(item.Temperature).toBe(-15);
      expect(item.Duration).toBe(900);
    });

    it('should export container items with nested children', () => {
      const sequence = createTestSequence();
      sequence.targetItems = [{
        id: 'container-1',
        type: 'NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer',
        name: 'Sequential Block',
        category: 'Container',
        status: 'CREATED',
        data: {},
        isExpanded: true,
        items: [createTestItem()],
        conditions: [],
        triggers: [],
      }];
      
      const json = exportToNINA(sequence);
      const parsed = JSON.parse(json);
      
      const targetArea = parsed.Items.$values[1];
      const container = targetArea.Items.$values[0];
      expect(container.Items.$values.length).toBe(1);
    });

    it('should export global triggers', () => {
      const sequence = createTestSequence();
      sequence.globalTriggers = [{
        id: 'trigger-1',
        type: 'NINA.Sequencer.Trigger.MeridianFlip.MeridianFlipTrigger, NINA.Sequencer',
        name: 'Meridian Flip',
        category: 'Trigger',
        data: {},
        triggerItems: [],
      }];
      
      const json = exportToNINA(sequence);
      const parsed = JSON.parse(json);
      
      expect(parsed.Triggers.$values.length).toBe(1);
      expect(parsed.Triggers.$values[0].$type).toBe('NINA.Sequencer.Trigger.MeridianFlip.MeridianFlipTrigger, NINA.Sequencer');
    });
  });

  describe('importFromNINA', () => {
    it('should import valid NINA JSON', () => {
      const ninaJson = JSON.stringify({
        $id: '1',
        $type: 'NINA.Sequencer.Container.SequenceRootContainer, NINA.Sequencer',
        Name: 'Imported Sequence',
        SequenceTitle: 'Imported Sequence',
        Items: {
          $id: '2',
          $values: [
            {
              $id: '3',
              $type: 'NINA.Sequencer.Container.StartAreaContainer, NINA.Sequencer',
              Name: 'Start Area',
              Items: { $id: '4', $values: [] },
              Conditions: { $id: '5', $values: [] },
              Triggers: { $id: '6', $values: [] },
            },
            {
              $id: '7',
              $type: 'NINA.Sequencer.Container.TargetAreaContainer, NINA.Sequencer',
              Name: 'Target Area',
              Items: { $id: '8', $values: [] },
              Conditions: { $id: '9', $values: [] },
              Triggers: { $id: '10', $values: [] },
            },
            {
              $id: '11',
              $type: 'NINA.Sequencer.Container.EndAreaContainer, NINA.Sequencer',
              Name: 'End Area',
              Items: { $id: '12', $values: [] },
              Conditions: { $id: '13', $values: [] },
              Triggers: { $id: '14', $values: [] },
            },
          ],
        },
        Conditions: { $id: '15', $values: [] },
        Triggers: { $id: '16', $values: [] },
      });
      
      const sequence = importFromNINA(ninaJson);
      
      expect(sequence.title).toBe('Imported Sequence');
      expect(sequence.startItems).toEqual([]);
      expect(sequence.targetItems).toEqual([]);
      expect(sequence.endItems).toEqual([]);
    });

    it('should import sequence with items', () => {
      const ninaJson = JSON.stringify({
        $id: '1',
        $type: 'NINA.Sequencer.Container.SequenceRootContainer, NINA.Sequencer',
        Name: 'Test',
        Items: {
          $id: '2',
          $values: [
            {
              $id: '3',
              $type: 'NINA.Sequencer.Container.StartAreaContainer, NINA.Sequencer',
              Name: 'Start Area',
              Items: {
                $id: '4',
                $values: [
                  {
                    $id: '5',
                    $type: 'NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer',
                    Name: 'Cool Camera',
                    Temperature: -10,
                    Duration: 600,
                  },
                ],
              },
              Conditions: { $id: '6', $values: [] },
              Triggers: { $id: '7', $values: [] },
            },
            {
              $id: '8',
              $type: 'NINA.Sequencer.Container.TargetAreaContainer, NINA.Sequencer',
              Name: 'Target Area',
              Items: { $id: '9', $values: [] },
              Conditions: { $id: '10', $values: [] },
              Triggers: { $id: '11', $values: [] },
            },
            {
              $id: '12',
              $type: 'NINA.Sequencer.Container.EndAreaContainer, NINA.Sequencer',
              Name: 'End Area',
              Items: { $id: '13', $values: [] },
              Conditions: { $id: '14', $values: [] },
              Triggers: { $id: '15', $values: [] },
            },
          ],
        },
        Conditions: { $id: '16', $values: [] },
        Triggers: { $id: '17', $values: [] },
      });
      
      const sequence = importFromNINA(ninaJson);
      
      expect(sequence.startItems.length).toBe(1);
      expect(sequence.startItems[0].type).toBe('NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer');
      expect(sequence.startItems[0].data.Temperature).toBe(-10);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => importFromNINA('invalid json')).toThrow();
    });
  });


  describe('exportTemplateToNINA', () => {
    it('should export items as template container', () => {
      const items: EditorSequenceItem[] = [createTestItem()];
      
      const json = exportTemplateToNINA(items, 'My Template');
      const parsed = JSON.parse(json);
      
      expect(parsed.$type).toBe('NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer');
      expect(parsed.Name).toBe('My Template');
      expect(parsed.Items.$values.length).toBe(1);
    });
  });

  describe('validateNINAJson', () => {
    it('should validate correct NINA JSON', () => {
      const validJson = JSON.stringify({
        $id: '1',
        $type: 'NINA.Sequencer.Container.SequenceRootContainer, NINA.Sequencer',
        Name: 'Test',
        Items: { $id: '2', $values: [] },
      });
      
      const result = validateNINAJson(validJson);
      
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should return error for invalid JSON', () => {
      const result = validateNINAJson('not valid json');
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid JSON');
    });

    it('should return error for missing $type', () => {
      const invalidJson = JSON.stringify({
        $id: '1',
        Name: 'Test',
      });
      
      const result = validateNINAJson(invalidJson);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing $type field');
    });

    it('should return error for non-container root', () => {
      const invalidJson = JSON.stringify({
        $id: '1',
        $type: 'NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer',
        Name: 'Test',
      });
      
      const result = validateNINAJson(invalidJson);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Root element must be a container type');
    });

    it('should return error for invalid Items structure', () => {
      const invalidJson = JSON.stringify({
        $id: '1',
        $type: 'NINA.Sequencer.Container.SequenceRootContainer, NINA.Sequencer',
        Name: 'Test',
        Items: { $id: '2' }, // Missing $values
      });
      
      const result = validateNINAJson(invalidJson);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Items collection missing $values array');
    });
  });

  describe('Round-trip conversion', () => {
    it('should preserve sequence structure through export/import', () => {
      const original = createTestSequence();
      original.title = 'Round Trip Test';
      original.startItems = [createTestItem({ name: 'Start Item' })];
      original.targetItems = [createTestItem({ name: 'Target Item' })];
      original.endItems = [createTestItem({ name: 'End Item' })];
      
      const exported = exportToNINA(original);
      const imported = importFromNINA(exported);
      
      expect(imported.title).toBe(original.title);
      expect(imported.startItems.length).toBe(original.startItems.length);
      expect(imported.targetItems.length).toBe(original.targetItems.length);
      expect(imported.endItems.length).toBe(original.endItems.length);
    });

    it('should preserve item data through export/import', () => {
      const original = createTestSequence();
      original.startItems = [createTestItem({
        data: { Temperature: -20, Duration: 1200 },
      })];
      
      const exported = exportToNINA(original);
      const imported = importFromNINA(exported);
      
      expect(imported.startItems[0].data.Temperature).toBe(-20);
      expect(imported.startItems[0].data.Duration).toBe(1200);
    });
  });
});
