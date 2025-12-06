/**
 * Import operations with Tauri/browser fallback
 */

import { isTauri, invoke } from './platform';
import type { SimpleTarget } from '../nina/simple-sequence-types';
import { SequenceEntityStatus, SequenceMode } from '../nina/simple-sequence-types';

export interface ImportResult {
  success: boolean;
  targets: SimpleTarget[];
  errors: string[];
  warnings: string[];
  sourceFormat: string;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
}

export interface CsvColumnMapping {
  nameColumn?: string;
  raColumn?: string;
  decColumn?: string;
  positionAngleColumn?: string;
  notesColumn?: string;
  delimiter?: string;
  hasHeader: boolean;
}

export interface FitsHeaderInfo {
  objectName: string | null;
  ra: number | null;
  dec: number | null;
  exposureTime: number | null;
  filter: string | null;
  gain: number | null;
  offset: number | null;
  binningX: number | null;
  binningY: number | null;
  dateObs: string | null;
  telescope: string | null;
  instrument: string | null;
}

/**
 * Import targets from CSV content
 */
export async function importCsvContent(
  content: string,
  mapping?: CsvColumnMapping
): Promise<ImportResult> {
  if (isTauri()) {
    return invoke<ImportResult>('import_csv_content', { content, mapping });
  }
  
  // Browser fallback - basic CSV parsing
  return parseCsvInBrowser(content, mapping);
}

/**
 * Import targets from Stellarium skylist content
 */
export async function importStellariumContent(content: string): Promise<ImportResult> {
  if (isTauri()) {
    return invoke<ImportResult>('import_stellarium_content', { content });
  }
  
  // Browser fallback
  return {
    success: false,
    targets: [],
    errors: ['Stellarium import requires desktop app'],
    warnings: [],
    sourceFormat: 'Stellarium',
    totalRows: 0,
    importedCount: 0,
    skippedCount: 0,
  };
}

/**
 * Import targets from APT format content
 */
export async function importAptContent(content: string): Promise<ImportResult> {
  if (isTauri()) {
    return invoke<ImportResult>('import_apt_content', { content });
  }
  
  return {
    success: false,
    targets: [],
    errors: ['APT import requires desktop app'],
    warnings: [],
    sourceFormat: 'APT',
    totalRows: 0,
    importedCount: 0,
    skippedCount: 0,
  };
}

/**
 * Import targets from Voyager format content
 */
export async function importVoyagerContent(content: string): Promise<ImportResult> {
  if (isTauri()) {
    return invoke<ImportResult>('import_voyager_content', { content });
  }
  
  return {
    success: false,
    targets: [],
    errors: ['Voyager import requires desktop app'],
    warnings: [],
    sourceFormat: 'Voyager',
    totalRows: 0,
    importedCount: 0,
    skippedCount: 0,
  };
}

/**
 * Import targets from XML content
 */
export async function importXmlContent(content: string): Promise<ImportResult> {
  if (isTauri()) {
    return invoke<ImportResult>('import_xml_content', { content });
  }
  
  return {
    success: false,
    targets: [],
    errors: ['XML import requires desktop app'],
    warnings: [],
    sourceFormat: 'XML',
    totalRows: 0,
    importedCount: 0,
    skippedCount: 0,
  };
}

/**
 * Auto-detect format and import
 */
export async function importAutoDetect(
  content: string,
  fileExtension?: string
): Promise<ImportResult> {
  if (isTauri()) {
    return invoke<ImportResult>('import_auto_detect', { content, fileExtension });
  }
  
  // Browser fallback - try CSV
  const ext = fileExtension?.toLowerCase() || '';
  if (ext === 'csv' || !ext) {
    return parseCsvInBrowser(content);
  }
  
  return {
    success: false,
    targets: [],
    errors: [`Format '${ext}' requires desktop app`],
    warnings: [],
    sourceFormat: 'Unknown',
    totalRows: 0,
    importedCount: 0,
    skippedCount: 0,
  };
}

/**
 * Detect CSV format from headers
 */
export async function detectCsvFormat(headers: string[]): Promise<string> {
  if (isTauri()) {
    return invoke<string>('detect_csv_format_from_headers', { headers });
  }
  
  // Browser fallback
  const headersLower = headers.map(h => h.toLowerCase());
  if (headersLower.includes('catalogue entry') || headersLower.includes('familiar name')) {
    return 'Telescopius';
  }
  if (headersLower.includes('ra') && headersLower.includes('dec')) {
    return 'Generic';
  }
  return 'Unknown';
}

/**
 * Import from CSV file (Tauri only)
 */
export async function importCsvFile(
  path: string,
  mapping?: CsvColumnMapping
): Promise<ImportResult> {
  if (isTauri()) {
    return invoke<ImportResult>('import_csv_file', { path, mapping });
  }
  
  throw new Error('File import requires desktop app');
}

/**
 * Import from Stellarium file (Tauri only)
 */
export async function importStellariumFile(path: string): Promise<ImportResult> {
  if (isTauri()) {
    return invoke<ImportResult>('import_stellarium_file', { path });
  }
  
  throw new Error('File import requires desktop app');
}

/**
 * Import from XML file (Tauri only)
 */
export async function importXmlFile(path: string): Promise<ImportResult> {
  if (isTauri()) {
    return invoke<ImportResult>('import_xml_file', { path });
  }
  
  throw new Error('File import requires desktop app');
}

/**
 * Import from FITS file (Tauri only)
 */
export async function importFitsFile(path: string): Promise<SimpleTarget | null> {
  if (isTauri()) {
    return invoke<SimpleTarget | null>('import_fits_file', { path });
  }
  
  throw new Error('FITS import requires desktop app');
}

/**
 * Batch import from multiple files (Tauri only)
 */
export async function batchImportFiles(paths: string[]): Promise<ImportResult> {
  if (isTauri()) {
    return invoke<ImportResult>('batch_import_files', { paths });
  }
  
  throw new Error('Batch import requires desktop app');
}

/**
 * Validate CSV mapping
 */
export async function validateCsvMapping(
  headers: string[],
  mapping: CsvColumnMapping
): Promise<string[]> {
  if (isTauri()) {
    return invoke<string[]>('validate_csv_mapping', { headers, mapping });
  }
  
  // Browser fallback
  const errors: string[] = [];
  const headersLower = headers.map(h => h.toLowerCase());
  
  if (mapping.raColumn && !headersLower.includes(mapping.raColumn.toLowerCase())) {
    errors.push(`RA column '${mapping.raColumn}' not found`);
  }
  if (mapping.decColumn && !headersLower.includes(mapping.decColumn.toLowerCase())) {
    errors.push(`Dec column '${mapping.decColumn}' not found`);
  }
  
  return errors;
}

/**
 * Preview CSV content
 */
export async function previewCsvContent(
  content: string,
  maxRows: number = 10
): Promise<string[][]> {
  if (isTauri()) {
    return invoke<string[][]>('preview_csv_content', { content, maxRows });
  }
  
  // Browser fallback
  const lines = content.split('\n').slice(0, maxRows);
  return lines.map(line => 
    line.split(',').map(field => field.trim().replace(/^"|"$/g, ''))
  );
}

/**
 * Import from browser file input
 */
export async function importFromFile(file: File): Promise<ImportResult> {
  const content = await file.text();
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  
  return importAutoDetect(content, ext);
}

// ============================================================================
// Browser Fallback Implementation
// ============================================================================

function parseCsvInBrowser(
  content: string,
  mapping?: CsvColumnMapping
): ImportResult {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    return {
      success: false,
      targets: [],
      errors: ['Empty CSV content'],
      warnings: [],
      sourceFormat: 'CSV',
      totalRows: 0,
      importedCount: 0,
      skippedCount: 0,
    };
  }
  
  const hasHeader = mapping?.hasHeader ?? true;
  const delimiter = mapping?.delimiter || ',';
  
  const headers = hasHeader 
    ? lines[0].split(delimiter).map(h => h.trim().toLowerCase())
    : [];
  
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const targets: SimpleTarget[] = [];
  const warnings: string[] = [];
  
  // Find column indices
  const nameIdx = findColumnIndex(headers, mapping?.nameColumn || 'name', ['name', 'target', 'object']);
  const raIdx = findColumnIndex(headers, mapping?.raColumn || 'ra', ['ra', 'right ascension']);
  const decIdx = findColumnIndex(headers, mapping?.decColumn || 'dec', ['dec', 'declination']);
  const paIdx = findColumnIndex(headers, mapping?.positionAngleColumn, ['pa', 'position angle']);
  
  if (raIdx === -1 || decIdx === -1) {
    return {
      success: false,
      targets: [],
      errors: ['Could not find RA and Dec columns'],
      warnings: [],
      sourceFormat: 'CSV',
      totalRows: dataLines.length,
      importedCount: 0,
      skippedCount: dataLines.length,
    };
  }
  
  for (let i = 0; i < dataLines.length; i++) {
    const fields = parseCsvLine(dataLines[i], delimiter);
    
    try {
      const name = nameIdx >= 0 ? fields[nameIdx] : `Target ${i + 1}`;
      const raStr = fields[raIdx];
      const decStr = fields[decIdx];
      const pa = paIdx >= 0 ? parseFloat(fields[paIdx]) || 0 : 0;
      
      const coords = parseCoordinates(raStr, decStr);
      if (!coords) {
        warnings.push(`Row ${i + 1}: Could not parse coordinates`);
        continue;
      }
      
      targets.push(createTarget(name, coords, pa));
    } catch (e) {
      warnings.push(`Row ${i + 1}: ${e}`);
    }
  }
  
  return {
    success: true,
    targets,
    errors: [],
    warnings,
    sourceFormat: 'CSV',
    totalRows: dataLines.length,
    importedCount: targets.length,
    skippedCount: dataLines.length - targets.length,
  };
}

function findColumnIndex(
  headers: string[],
  preferred: string | undefined,
  alternatives: string[]
): number {
  if (preferred) {
    const idx = headers.indexOf(preferred.toLowerCase());
    if (idx >= 0) return idx;
  }
  
  for (const alt of alternatives) {
    const idx = headers.findIndex(h => h.includes(alt));
    if (idx >= 0) return idx;
  }
  
  return -1;
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  
  return fields;
}

function parseCoordinates(raStr: string, decStr: string): {
  raHours: number;
  raMinutes: number;
  raSeconds: number;
  decDegrees: number;
  decMinutes: number;
  decSeconds: number;
  negativeDec: boolean;
} | null {
  try {
    // Try parsing RA
    let raH = 0, raM = 0, raS = 0;
    const raMatch = raStr.match(/(\d+)[h:\s]+(\d+)[m:\s]+(\d+\.?\d*)/);
    if (raMatch) {
      raH = parseInt(raMatch[1]);
      raM = parseInt(raMatch[2]);
      raS = parseFloat(raMatch[3]);
    } else {
      const raDecimal = parseFloat(raStr);
      if (!isNaN(raDecimal)) {
        raH = Math.floor(raDecimal);
        const raMinDec = (raDecimal - raH) * 60;
        raM = Math.floor(raMinDec);
        raS = (raMinDec - raM) * 60;
      } else {
        return null;
      }
    }
    
    // Try parsing Dec
    let decD = 0, decM = 0, decS = 0, negative = false;
    const decMatch = decStr.match(/([+-]?)(\d+)[°d:\s]+(\d+)['m:\s]+(\d+\.?\d*)/);
    if (decMatch) {
      negative = decMatch[1] === '-';
      decD = parseInt(decMatch[2]);
      decM = parseInt(decMatch[3]);
      decS = parseFloat(decMatch[4]);
    } else {
      const decDecimal = parseFloat(decStr);
      if (!isNaN(decDecimal)) {
        negative = decDecimal < 0;
        const absDec = Math.abs(decDecimal);
        decD = Math.floor(absDec);
        const decMinDec = (absDec - decD) * 60;
        decM = Math.floor(decMinDec);
        decS = (decMinDec - decM) * 60;
      } else {
        return null;
      }
    }
    
    return {
      raHours: raH,
      raMinutes: raM,
      raSeconds: raS,
      decDegrees: decD,
      decMinutes: decM,
      decSeconds: decS,
      negativeDec: negative,
    };
  } catch {
    return null;
  }
}

function createTarget(
  name: string,
  coords: ReturnType<typeof parseCoordinates>,
  positionAngle: number
): SimpleTarget {
  return {
    id: crypto.randomUUID(),
    name,
    status: SequenceEntityStatus.CREATED,
    targetName: name,
    coordinates: coords!,
    positionAngle,
    rotation: positionAngle,
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
    exposures: [],
  };
}
