/**
 * Dialog operations with Tauri/browser fallback
 */

import { isTauri } from './platform';
import type { FileFilter } from './file';

export interface OpenDialogOptions {
  title?: string;
  filters?: FileFilter[];
  defaultPath?: string;
  multiple?: boolean;
  directory?: boolean;
}

export interface SaveDialogOptions {
  title?: string;
  filters?: FileFilter[];
  defaultPath?: string;
  defaultName?: string;
}

/**
 * Show open file dialog
 */
export async function showOpenDialog(options: OpenDialogOptions = {}): Promise<string[] | null> {
  if (isTauri()) {
    try {
      const dialog = await import('@tauri-apps/plugin-dialog');
      const result = await dialog.open({
        title: options.title,
        filters: options.filters,
        defaultPath: options.defaultPath,
        multiple: options.multiple,
        directory: options.directory,
      });
      
      if (result === null) return null;
      return Array.isArray(result) ? result : [result];
    } catch (e) {
      console.error('Failed to open dialog:', e);
      return null;
    }
  }
  
  // Browser fallback - use file input
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = options.multiple ?? false;
    
    if (options.filters && options.filters.length > 0) {
      const extensions = options.filters.flatMap(f => f.extensions.map(e => `.${e}`));
      input.accept = extensions.join(',');
    }
    
    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        const files = Array.from(input.files).map(f => f.name);
        resolve(files);
      } else {
        resolve(null);
      }
    };
    
    input.oncancel = () => resolve(null);
    input.click();
  });
}

/**
 * Show save file dialog
 */
export async function showSaveDialog(options: SaveDialogOptions = {}): Promise<string | null> {
  if (isTauri()) {
    try {
      const dialog = await import('@tauri-apps/plugin-dialog');
      const result = await dialog.save({
        title: options.title,
        filters: options.filters,
        defaultPath: options.defaultPath,
      });
      return result;
    } catch (e) {
      console.error('Failed to open save dialog:', e);
      return null;
    }
  }
  
  // Browser doesn't have a native save dialog
  // Return the default name for download
  return options.defaultName || 'untitled';
}

/**
 * Show message dialog
 */
export async function showMessage(
  message: string,
  options: { title?: string; type?: 'info' | 'warning' | 'error' } = {}
): Promise<void> {
  if (isTauri()) {
    try {
      const dialog = await import('@tauri-apps/plugin-dialog');
      await dialog.message(message, {
        title: options.title,
        kind: options.type,
      });
      return;
    } catch (e) {
      console.error('Failed to show message:', e);
    }
  }
  
  // Browser fallback
  alert(message);
}

/**
 * Show confirmation dialog
 */
export async function showConfirm(
  message: string,
  options: { title?: string; okLabel?: string; cancelLabel?: string } = {}
): Promise<boolean> {
  if (isTauri()) {
    try {
      const dialog = await import('@tauri-apps/plugin-dialog');
      return await dialog.confirm(message, {
        title: options.title,
        okLabel: options.okLabel,
        cancelLabel: options.cancelLabel,
      });
    } catch (e) {
      console.error('Failed to show confirm:', e);
    }
  }
  
  // Browser fallback
  return confirm(message);
}

/**
 * Show ask dialog (yes/no)
 */
export async function showAsk(
  message: string,
  options: { title?: string; yesLabel?: string; noLabel?: string } = {}
): Promise<boolean> {
  if (isTauri()) {
    try {
      const dialog = await import('@tauri-apps/plugin-dialog');
      return await dialog.ask(message, {
        title: options.title,
      });
    } catch (e) {
      console.error('Failed to show ask dialog:', e);
    }
  }
  
  // Browser fallback
  return confirm(message);
}
