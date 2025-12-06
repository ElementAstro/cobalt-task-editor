/**
 * File operations with Tauri/browser fallback
 */

import { isTauri, invoke } from './platform';
import type { SimpleSequence, SimpleTarget } from '../nina/simple-sequence-types';

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  isDirectory: boolean;
  modified?: string;
}

export interface FileFilter {
  name: string;
  extensions: string[];
}

/**
 * Read file contents
 */
export async function readFileContents(path: string): Promise<string> {
  if (isTauri()) {
    return invoke<string>('read_file_contents', { path });
  }
  throw new Error('File reading not supported in browser mode');
}

/**
 * Write file contents
 */
export async function writeFileContents(path: string, contents: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>('write_file_contents', { path, contents });
  }
  throw new Error('File writing not supported in browser mode');
}

/**
 * Load simple sequence from file
 */
export async function loadSimpleSequenceFile(path: string): Promise<SimpleSequence> {
  if (isTauri()) {
    return invoke<SimpleSequence>('load_simple_sequence_file', { path });
  }
  throw new Error('File loading not supported in browser mode');
}

/**
 * Save simple sequence to file
 */
export async function saveSimpleSequenceFile(path: string, sequence: SimpleSequence): Promise<void> {
  if (isTauri()) {
    return invoke<void>('save_simple_sequence_file', { path, sequence });
  }
  throw new Error('File saving not supported in browser mode');
}

/**
 * Import targets from CSV file
 */
export async function importTargetsCsv(path: string): Promise<SimpleTarget[]> {
  if (isTauri()) {
    return invoke<SimpleTarget[]>('import_targets_csv', { path });
  }
  throw new Error('CSV import not supported in browser mode');
}

/**
 * Import targets from CSV content
 */
export async function importTargetsCsvContent(content: string): Promise<SimpleTarget[]> {
  if (isTauri()) {
    return invoke<SimpleTarget[]>('import_targets_csv_content', { content });
  }
  // Browser fallback - parse CSV locally
  throw new Error('CSV import not implemented in browser mode');
}

/**
 * Export sequence to CSV
 */
export async function exportSequenceCsv(sequence: SimpleSequence): Promise<string> {
  if (isTauri()) {
    return invoke<string>('export_sequence_csv', { sequence });
  }
  // Browser fallback - generate CSV locally
  throw new Error('CSV export not implemented in browser mode');
}

/**
 * Export sequence to XML
 */
export async function exportSequenceXml(sequence: SimpleSequence): Promise<string> {
  if (isTauri()) {
    return invoke<string>('export_sequence_xml', { sequence });
  }
  throw new Error('XML export not implemented in browser mode');
}

/**
 * Export sequence to NINA target set format
 */
export async function exportSequenceTargetSet(sequence: SimpleSequence): Promise<string> {
  if (isTauri()) {
    return invoke<string>('export_sequence_target_set', { sequence });
  }
  throw new Error('Target set export not implemented in browser mode');
}

/**
 * Get file info
 */
export async function getFileInfo(path: string): Promise<FileInfo> {
  if (isTauri()) {
    return invoke<FileInfo>('get_file_info', { path });
  }
  throw new Error('File info not supported in browser mode');
}

/**
 * List directory contents
 */
export async function listDirectory(path: string, extensions?: string[]): Promise<FileInfo[]> {
  if (isTauri()) {
    return invoke<FileInfo[]>('list_directory', { path, extensions });
  }
  throw new Error('Directory listing not supported in browser mode');
}

/**
 * Check if file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  if (isTauri()) {
    return invoke<boolean>('file_exists', { path });
  }
  return false;
}

/**
 * Delete file
 */
export async function deleteFile(path: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>('delete_file', { path });
  }
  throw new Error('File deletion not supported in browser mode');
}

/**
 * Copy file
 */
export async function copyFile(from: string, to: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>('copy_file', { from, to });
  }
  throw new Error('File copying not supported in browser mode');
}

/**
 * Get default save directory
 */
export async function getDefaultSaveDirectory(): Promise<string> {
  if (isTauri()) {
    return invoke<string>('get_default_save_directory');
  }
  return '';
}

/**
 * Get app data directory
 */
export async function getAppDataDirectory(): Promise<string> {
  if (isTauri()) {
    return invoke<string>('get_app_data_directory');
  }
  return '';
}

/**
 * Auto-save sequence
 */
export async function autoSaveSequence(sequence: SimpleSequence): Promise<string> {
  if (isTauri()) {
    return invoke<string>('auto_save_sequence', { sequence });
  }
  // Browser fallback - use localStorage
  const key = `autosave-${sequence.id}`;
  localStorage.setItem(key, JSON.stringify(sequence));
  return key;
}

/**
 * Load auto-saved sequence
 */
export async function loadAutoSave(sequenceId: string): Promise<SimpleSequence | null> {
  if (isTauri()) {
    return invoke<SimpleSequence | null>('load_auto_save', { sequenceId });
  }
  // Browser fallback - use localStorage
  const key = `autosave-${sequenceId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Clear auto-save
 */
export async function clearAutoSave(sequenceId: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>('clear_auto_save', { sequenceId });
  }
  // Browser fallback - use localStorage
  const key = `autosave-${sequenceId}`;
  localStorage.removeItem(key);
}

/**
 * Download file in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'application/octet-stream'): void {
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

/**
 * Read file from input element
 */
export function readFileFromInput(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
