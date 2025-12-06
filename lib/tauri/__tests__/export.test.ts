/**
 * Tests for export module
 */

import {
  getDefaultExportOptions,
  exportSequenceWithOptions,
  exportToCsvFormat,
  exportToJsonFormat,
  exportToStellariumFormat,
  generateTargetsCsv,
  generateTargetsXml,
  getExportFormats,
  getCoordinateFormats,
  formatCoordinates,
  downloadAsFile,
} from '../export';
import type { SimpleSequence, SimpleTarget } from '../../nina/simple-sequence-types';
import { SequenceEntityStatus, SequenceMode, ImageType, createDefaultStartOptions, createDefaultEndOptions } from '../../nina/simple-sequence-types';

// Mock isTauri to always return false for browser fallback testing
jest.mock('../platform', () => ({
  isTauri: () => false,
  invoke: jest.fn(),
}));

describe('Export Module', () => {
  const createTestTarget = (name: string): SimpleTarget => ({
    id: 'test-id',
    name,
    status: SequenceEntityStatus.CREATED,
    targetName: name,
    coordinates: {
      raHours: 0,
      raMinutes: 42,
      raSeconds: 44.3,
      decDegrees: 41,
      decMinutes: 16,
      decSeconds: 9.0,
      negativeDec: false,
    },
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
    exposures: [{
      id: 'exp-1',
      enabled: true,
      status: SequenceEntityStatus.CREATED,
      exposureTime: 60,
      imageType: ImageType.LIGHT,
      filter: null,
      binning: { x: 1, y: 1 },
      gain: -1,
      offset: -1,
      totalCount: 10,
      progressCount: 0,
      dither: false,
      ditherEvery: 1,
    }],
  });

  const createTestSequence = (): SimpleSequence => ({
    id: 'seq-1',
    title: 'Test Sequence',
    isDirty: false,
    targets: [createTestTarget('M31'), createTestTarget('M42')],
    selectedTargetId: null,
    activeTargetId: null,
    isRunning: false,
    startOptions: createDefaultStartOptions(),
    endOptions: createDefaultEndOptions(),
    estimatedDownloadTime: 5,
  });

  describe('getDefaultExportOptions', () => {
    it('should return default options', () => {
      const options = getDefaultExportOptions();
      
      expect(options.format).toBe('csv');
      expect(options.includeExposures).toBe(true);
      expect(options.includeSettings).toBe(true);
      expect(options.includeProgress).toBe(false);
      expect(options.decimalPlaces).toBe(2);
      expect(options.coordinateFormat).toBe('sexagesimal');
    });
  });

  describe('exportSequenceWithOptions (browser fallback)', () => {
    it('should export to CSV', async () => {
      const sequence = createTestSequence();
      const options = getDefaultExportOptions();
      
      const result = await exportSequenceWithOptions(sequence, options);
      
      expect(result.success).toBe(true);
      expect(result.content).toContain('Name,RA,Dec');
      expect(result.content).toContain('M31');
      expect(result.content).toContain('M42');
      expect(result.targetCount).toBe(2);
    });

    it('should export to JSON', async () => {
      const sequence = createTestSequence();
      const options = { ...getDefaultExportOptions(), format: 'json' as const };
      
      const result = await exportSequenceWithOptions(sequence, options);
      
      expect(result.success).toBe(true);
      expect(result.format).toBe('JSON');
      
      const parsed = JSON.parse(result.content);
      expect(parsed.title).toBe('Test Sequence');
    });

    it('should fail for unsupported formats', async () => {
      const sequence = createTestSequence();
      const options = { ...getDefaultExportOptions(), format: 'xml' as const };
      
      const result = await exportSequenceWithOptions(sequence, options);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('exportToCsvFormat (browser fallback)', () => {
    it('should export with exposures', async () => {
      const sequence = createTestSequence();
      const result = await exportToCsvFormat(sequence, true, false);
      
      expect(result.success).toBe(true);
      expect(result.content).toContain('Exposure Time');
      expect(result.content).toContain('60.0');
    });

    it('should export without exposures', async () => {
      const sequence = createTestSequence();
      const result = await exportToCsvFormat(sequence, false, false);
      
      expect(result.success).toBe(true);
      expect(result.content).not.toContain('Exposure Time');
    });
  });

  describe('exportToJsonFormat (browser fallback)', () => {
    it('should export valid JSON', async () => {
      const sequence = createTestSequence();
      const result = await exportToJsonFormat(sequence);
      
      expect(result.success).toBe(true);
      expect(() => JSON.parse(result.content)).not.toThrow();
    });
  });

  describe('exportToStellariumFormat (browser fallback)', () => {
    it('should export Stellarium skylist', async () => {
      const sequence = createTestSequence();
      const result = await exportToStellariumFormat(sequence);
      
      expect(result.success).toBe(true);
      expect(result.content).toContain('# Stellarium Skylist');
      expect(result.content).toContain('M31');
    });
  });

  describe('generateTargetsCsv (browser fallback)', () => {
    it('should generate CSV content', async () => {
      const targets = [createTestTarget('M31')];
      const content = await generateTargetsCsv(targets);
      
      expect(content).toContain('Name,RA,Dec');
      expect(content).toContain('M31');
    });
  });

  describe('generateTargetsXml (browser fallback)', () => {
    it('should generate XML content', async () => {
      const targets = [createTestTarget('M31')];
      const content = await generateTargetsXml(targets);
      
      expect(content).toContain('<?xml');
      expect(content).toContain('<Targets>');
      expect(content).toContain('<Name>M31</Name>');
    });
  });

  describe('getExportFormats (browser fallback)', () => {
    it('should return available formats', async () => {
      const formats = await getExportFormats();
      
      expect(formats.length).toBeGreaterThan(0);
      expect(formats.find(f => f.id === 'csv')).toBeDefined();
      expect(formats.find(f => f.id === 'json')).toBeDefined();
    });
  });

  describe('getCoordinateFormats (browser fallback)', () => {
    it('should return available coordinate formats', async () => {
      const formats = await getCoordinateFormats();
      
      expect(formats.length).toBeGreaterThan(0);
      expect(formats.find(f => f.id === 'sexagesimal')).toBeDefined();
      expect(formats.find(f => f.id === 'decimal')).toBeDefined();
    });
  });

  describe('formatCoordinates (browser fallback)', () => {
    it('should format coordinates in sexagesimal', async () => {
      const result = await formatCoordinates(
        12, 30, 45.5,
        45, 30, 0,
        false,
        'sexagesimal',
        1
      );
      
      expect(result.ra).toContain('12h');
      expect(result.ra).toContain('30m');
      expect(result.dec).toContain('+');
      expect(result.dec).toContain('45°');
    });

    it('should format negative declination', async () => {
      const result = await formatCoordinates(
        12, 30, 0,
        45, 30, 0,
        true,
        'sexagesimal',
        1
      );
      
      expect(result.dec).toContain('-');
    });
  });

  describe('downloadAsFile', () => {
    it('should create download link', () => {
      // Mock DOM methods
      const mockClick = jest.fn();
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      
      document.createElement = jest.fn().mockReturnValue({
        href: '',
        download: '',
        click: mockClick,
      });
      document.body.appendChild = mockAppendChild;
      document.body.removeChild = mockRemoveChild;
      
      URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
      URL.revokeObjectURL = jest.fn();
      
      downloadAsFile('test content', 'test.csv', 'text/csv');
      
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty sequence', async () => {
      const sequence = { ...createTestSequence(), targets: [] };
      const result = await exportToCsvFormat(sequence);
      
      expect(result.success).toBe(true);
      expect(result.targetCount).toBe(0);
    });

    it('should escape special characters in CSV', async () => {
      const sequence = createTestSequence();
      sequence.targets[0].targetName = 'Test, "with" special';
      
      const result = await exportToCsvFormat(sequence);
      
      expect(result.success).toBe(true);
      expect(result.content).toContain('"Test, ""with"" special"');
    });
  });
});
