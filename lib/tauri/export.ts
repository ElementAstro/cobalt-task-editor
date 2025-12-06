/**
 * Export operations with Tauri/browser fallback
 */

import { isTauri, invoke } from './platform';
import type { SimpleSequence, SimpleTarget } from '../nina/simple-sequence-types';

export type ExportFormat = 
  | 'csv'
  | 'csv_telescopius'
  | 'xml'
  | 'xml_apt'
  | 'stellarium'
  | 'voyager'
  | 'nina_target_set'
  | 'json';

export type CoordinateFormat = 
  | 'sexagesimal'
  | 'colon'
  | 'decimal'
  | 'degrees';

export interface ExportOptions {
  format: ExportFormat;
  includeExposures: boolean;
  includeSettings: boolean;
  includeProgress: boolean;
  decimalPlaces: number;
  coordinateFormat: CoordinateFormat;
}

export interface ExportResult {
  success: boolean;
  content: string;
  format: string;
  targetCount: number;
  errors: string[];
}

export interface FormatInfo {
  id: string;
  name: string;
  description: string;
}

/**
 * Default export options
 */
export function getDefaultExportOptions(): ExportOptions {
  return {
    format: 'csv',
    includeExposures: true,
    includeSettings: true,
    includeProgress: false,
    decimalPlaces: 2,
    coordinateFormat: 'sexagesimal',
  };
}

/**
 * Export sequence with options
 */
export async function exportSequenceWithOptions(
  sequence: SimpleSequence,
  options: ExportOptions
): Promise<ExportResult> {
  if (isTauri()) {
    return invoke<ExportResult>('export_sequence_with_options', { sequence, options });
  }
  
  // Browser fallback
  switch (options.format) {
    case 'csv':
    case 'csv_telescopius':
      return exportToCsvBrowser(sequence, options);
    case 'json':
      return exportToJsonBrowser(sequence);
    default:
      return {
        success: false,
        content: '',
        format: options.format,
        targetCount: 0,
        errors: [`Format '${options.format}' requires desktop app`],
      };
  }
}

/**
 * Export sequence to CSV
 */
export async function exportToCsvFormat(
  sequence: SimpleSequence,
  includeExposures: boolean = true,
  includeProgress: boolean = false
): Promise<ExportResult> {
  if (isTauri()) {
    return invoke<ExportResult>('export_to_csv_format', {
      sequence, includeExposures, includeProgress
    });
  }
  
  return exportToCsvBrowser(sequence, {
    ...getDefaultExportOptions(),
    includeExposures,
    includeProgress,
  });
}

/**
 * Export sequence to Telescopius CSV format
 */
export async function exportToTelescopiusFormat(
  sequence: SimpleSequence
): Promise<ExportResult> {
  if (isTauri()) {
    return invoke<ExportResult>('export_to_telescopius_format', { sequence });
  }
  
  return exportToCsvBrowser(sequence, {
    ...getDefaultExportOptions(),
    format: 'csv_telescopius',
  });
}

/**
 * Export sequence to XML
 */
export async function exportToXmlFormat(
  sequence: SimpleSequence,
  includeExposures: boolean = true,
  includeSettings: boolean = true
): Promise<ExportResult> {
  if (isTauri()) {
    return invoke<ExportResult>('export_to_xml_format', {
      sequence, includeExposures, includeSettings
    });
  }
  
  return {
    success: false,
    content: '',
    format: 'XML',
    targetCount: 0,
    errors: ['XML export requires desktop app'],
  };
}

/**
 * Export sequence to APT XML format
 */
export async function exportToAptFormat(
  sequence: SimpleSequence
): Promise<ExportResult> {
  if (isTauri()) {
    return invoke<ExportResult>('export_to_apt_format', { sequence });
  }
  
  return {
    success: false,
    content: '',
    format: 'APT XML',
    targetCount: 0,
    errors: ['APT export requires desktop app'],
  };
}

/**
 * Export sequence to Stellarium skylist
 */
export async function exportToStellariumFormat(
  sequence: SimpleSequence
): Promise<ExportResult> {
  if (isTauri()) {
    return invoke<ExportResult>('export_to_stellarium_format', { sequence });
  }
  
  // Browser fallback - simple format
  const lines = [
    '# Stellarium Skylist',
    `# Exported from: ${sequence.title}`,
    `# Date: ${new Date().toISOString()}`,
    '',
  ];
  
  for (const target of sequence.targets) {
    const ra = target.coordinates.raHours + 
      target.coordinates.raMinutes / 60 + 
      target.coordinates.raSeconds / 3600;
    const dec = (target.coordinates.negativeDec ? -1 : 1) * (
      target.coordinates.decDegrees + 
      target.coordinates.decMinutes / 60 + 
      target.coordinates.decSeconds / 3600
    );
    lines.push(`${target.targetName.replace(/\s/g, '_')} ${ra.toFixed(4)} ${dec.toFixed(4)}`);
  }
  
  return {
    success: true,
    content: lines.join('\n'),
    format: 'Stellarium',
    targetCount: sequence.targets.length,
    errors: [],
  };
}

/**
 * Export sequence to Voyager format
 */
export async function exportToVoyagerFormat(
  sequence: SimpleSequence,
  includeExposures: boolean = true
): Promise<ExportResult> {
  if (isTauri()) {
    return invoke<ExportResult>('export_to_voyager_format', {
      sequence, includeExposures
    });
  }
  
  return {
    success: false,
    content: '',
    format: 'Voyager',
    targetCount: 0,
    errors: ['Voyager export requires desktop app'],
  };
}

/**
 * Export sequence to NINA Target Set format
 */
export async function exportToNinaTargetSetFormat(
  sequence: SimpleSequence
): Promise<ExportResult> {
  if (isTauri()) {
    return invoke<ExportResult>('export_to_nina_target_set_format', { sequence });
  }
  
  return {
    success: false,
    content: '',
    format: 'NINA Target Set',
    targetCount: 0,
    errors: ['NINA Target Set export requires desktop app'],
  };
}

/**
 * Export sequence to JSON
 */
export async function exportToJsonFormat(
  sequence: SimpleSequence
): Promise<ExportResult> {
  if (isTauri()) {
    return invoke<ExportResult>('export_to_json_format', { sequence });
  }
  
  return exportToJsonBrowser(sequence);
}

/**
 * Generate CSV content from targets
 */
export async function generateTargetsCsv(
  targets: SimpleTarget[],
  coordinateFormat: CoordinateFormat = 'sexagesimal',
  decimalPlaces: number = 2
): Promise<string> {
  if (isTauri()) {
    return invoke<string>('generate_targets_csv', {
      targets, coordinateFormat, decimalPlaces
    });
  }
  
  // Browser fallback
  const lines = ['Name,RA,Dec,Position Angle'];
  for (const target of targets) {
    const ra = formatRa(target.coordinates, coordinateFormat, decimalPlaces);
    const dec = formatDec(target.coordinates, coordinateFormat, decimalPlaces);
    lines.push(`${escapeCsv(target.targetName)},${ra},${dec},${target.positionAngle.toFixed(1)}`);
  }
  return lines.join('\n');
}

/**
 * Generate XML content from targets
 */
export async function generateTargetsXml(
  targets: SimpleTarget[],
  coordinateFormat: CoordinateFormat = 'sexagesimal',
  decimalPlaces: number = 2
): Promise<string> {
  if (isTauri()) {
    return invoke<string>('generate_targets_xml', {
      targets, coordinateFormat, decimalPlaces
    });
  }
  
  // Browser fallback
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<Targets>\n';
  for (const target of targets) {
    const ra = formatRa(target.coordinates, coordinateFormat, decimalPlaces);
    const dec = formatDec(target.coordinates, coordinateFormat, decimalPlaces);
    xml += `  <Target>\n`;
    xml += `    <Name>${escapeXml(target.targetName)}</Name>\n`;
    xml += `    <RA>${ra}</RA>\n`;
    xml += `    <Dec>${dec}</Dec>\n`;
    xml += `    <PositionAngle>${target.positionAngle.toFixed(1)}</PositionAngle>\n`;
    xml += `  </Target>\n`;
  }
  xml += '</Targets>\n';
  return xml;
}

/**
 * Export sequence to file (Tauri only)
 */
export async function exportSequenceToFile(
  sequence: SimpleSequence,
  path: string,
  options: ExportOptions
): Promise<void> {
  if (isTauri()) {
    return invoke<void>('export_sequence_to_file', { sequence, path, options });
  }
  
  throw new Error('File export requires desktop app');
}

/**
 * Export targets to file (Tauri only)
 */
export async function exportTargetsToFile(
  targets: SimpleTarget[],
  path: string,
  format: 'csv' | 'xml'
): Promise<void> {
  if (isTauri()) {
    return invoke<void>('export_targets_to_file', { targets, path, format });
  }
  
  throw new Error('File export requires desktop app');
}

/**
 * Format coordinates
 */
export async function formatCoordinates(
  raHours: number,
  raMinutes: number,
  raSeconds: number,
  decDegrees: number,
  decMinutes: number,
  decSeconds: number,
  negativeDec: boolean,
  format: CoordinateFormat = 'sexagesimal',
  decimalPlaces: number = 2
): Promise<{ ra: string; dec: string }> {
  if (isTauri()) {
    return invoke<[string, string]>('format_coordinates', {
      raHours, raMinutes, raSeconds,
      decDegrees, decMinutes, decSeconds, negativeDec,
      format, decimalPlaces
    }).then(([ra, dec]) => ({ ra, dec }));
  }
  
  const coords = {
    raHours, raMinutes, raSeconds,
    decDegrees, decMinutes, decSeconds, negativeDec,
  };
  
  return {
    ra: formatRa(coords, format, decimalPlaces),
    dec: formatDec(coords, format, decimalPlaces),
  };
}

/**
 * Get available export formats
 */
export async function getExportFormats(): Promise<FormatInfo[]> {
  if (isTauri()) {
    return invoke<Array<[string, string, string]>>('get_export_formats')
      .then(data => data.map(([id, name, description]) => ({ id, name, description })));
  }
  
  return [
    { id: 'csv', name: 'CSV', description: 'Comma-separated values' },
    { id: 'csv_telescopius', name: 'Telescopius CSV', description: 'Telescopius-compatible CSV' },
    { id: 'stellarium', name: 'Stellarium', description: 'Stellarium skylist format' },
    { id: 'json', name: 'JSON', description: 'Full sequence JSON' },
  ];
}

/**
 * Get available coordinate formats
 */
export async function getCoordinateFormats(): Promise<FormatInfo[]> {
  if (isTauri()) {
    return invoke<Array<[string, string, string]>>('get_coordinate_formats')
      .then(data => data.map(([id, name, description]) => ({ id, name, description })));
  }
  
  return [
    { id: 'sexagesimal', name: 'Sexagesimal', description: '00h 42m 44.3s / +41° 16\' 09.0"' },
    { id: 'colon', name: 'Colon-separated', description: '00:42:44.3 / +41:16:09.0' },
    { id: 'decimal', name: 'Decimal', description: '0.712 / 41.269 (hours/degrees)' },
    { id: 'degrees', name: 'Decimal Degrees', description: '10.68 / 41.269 (degrees)' },
  ];
}

/**
 * Download export content as file (browser)
 */
export function downloadAsFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Browser Fallback Implementation
// ============================================================================

interface CoordinatesLike {
  raHours: number;
  raMinutes: number;
  raSeconds: number;
  decDegrees: number;
  decMinutes: number;
  decSeconds: number;
  negativeDec: boolean;
}

function exportToCsvBrowser(
  sequence: SimpleSequence,
  options: ExportOptions
): ExportResult {
  const lines: string[] = [];
  
  // Header
  const headers = ['Name', 'RA', 'Dec', 'Position Angle'];
  if (options.includeExposures) {
    headers.push('Exposure Time', 'Filter', 'Binning', 'Gain', 'Offset', 'Count');
  }
  if (options.includeProgress) {
    headers.push('Progress');
  }
  lines.push(headers.join(','));
  
  // Data
  for (const target of sequence.targets) {
    const ra = formatRa(target.coordinates, options.coordinateFormat, options.decimalPlaces);
    const dec = formatDec(target.coordinates, options.coordinateFormat, options.decimalPlaces);
    
    if (options.includeExposures && target.exposures.length > 0) {
      for (const exp of target.exposures) {
        const row = [
          escapeCsv(target.targetName),
          ra,
          dec,
          target.positionAngle.toFixed(1),
          exp.exposureTime.toFixed(1),
          exp.filter?.name || '',
          `${exp.binning.x}x${exp.binning.y}`,
          exp.gain.toString(),
          exp.offset.toString(),
          exp.totalCount.toString(),
        ];
        if (options.includeProgress) {
          row.push(exp.progressCount.toString());
        }
        lines.push(row.join(','));
      }
    } else {
      const row = [
        escapeCsv(target.targetName),
        ra,
        dec,
        target.positionAngle.toFixed(1),
      ];
      if (options.includeExposures) {
        row.push('', '', '', '', '', '');
      }
      if (options.includeProgress) {
        row.push('');
      }
      lines.push(row.join(','));
    }
  }
  
  return {
    success: true,
    content: lines.join('\n'),
    format: 'CSV',
    targetCount: sequence.targets.length,
    errors: [],
  };
}

function exportToJsonBrowser(sequence: SimpleSequence): ExportResult {
  try {
    return {
      success: true,
      content: JSON.stringify(sequence, null, 2),
      format: 'JSON',
      targetCount: sequence.targets.length,
      errors: [],
    };
  } catch (e) {
    return {
      success: false,
      content: '',
      format: 'JSON',
      targetCount: 0,
      errors: [`Serialization error: ${e}`],
    };
  }
}

function formatRa(
  coords: CoordinatesLike,
  format: CoordinateFormat,
  decimalPlaces: number
): string {
  const { raHours, raMinutes, raSeconds } = coords;
  
  switch (format) {
    case 'sexagesimal':
      return `${raHours.toString().padStart(2, '0')}h ${raMinutes.toString().padStart(2, '0')}m ${raSeconds.toFixed(decimalPlaces).padStart(3 + decimalPlaces, '0')}s`;
    case 'colon':
      return `${raHours.toString().padStart(2, '0')}:${raMinutes.toString().padStart(2, '0')}:${raSeconds.toFixed(decimalPlaces).padStart(3 + decimalPlaces, '0')}`;
    case 'decimal':
      return (raHours + raMinutes / 60 + raSeconds / 3600).toFixed(decimalPlaces + 2);
    case 'degrees':
      return ((raHours + raMinutes / 60 + raSeconds / 3600) * 15).toFixed(decimalPlaces + 2);
  }
}

function formatDec(
  coords: CoordinatesLike,
  format: CoordinateFormat,
  decimalPlaces: number
): string {
  const { decDegrees, decMinutes, decSeconds, negativeDec } = coords;
  const sign = negativeDec ? '-' : '+';
  
  switch (format) {
    case 'sexagesimal':
      return `${sign}${decDegrees}° ${decMinutes.toString().padStart(2, '0')}' ${decSeconds.toFixed(decimalPlaces).padStart(3 + decimalPlaces, '0')}"`;
    case 'colon':
      return `${sign}${decDegrees}:${decMinutes.toString().padStart(2, '0')}:${decSeconds.toFixed(decimalPlaces).padStart(3 + decimalPlaces, '0')}`;
    case 'decimal':
    case 'degrees':
      const decimal = (negativeDec ? -1 : 1) * (decDegrees + decMinutes / 60 + decSeconds / 3600);
      return decimal.toFixed(decimalPlaces + 2);
  }
}

function escapeCsv(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
