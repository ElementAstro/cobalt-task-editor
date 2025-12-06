/**
 * Clipboard operations with Tauri/browser fallback
 */

import { isTauri, invoke } from './platform';
import type { SimpleTarget, SimpleExposure } from '../nina/simple-sequence-types';

/**
 * Copy target to internal clipboard
 */
export async function copyTarget(target: SimpleTarget): Promise<void> {
  if (isTauri()) {
    return invoke<void>('copy_target', { target });
  }
  // Browser fallback - use localStorage
  localStorage.setItem('clipboard-target', JSON.stringify(target));
}

/**
 * Copy multiple targets to internal clipboard
 */
export async function copyTargets(targets: SimpleTarget[]): Promise<void> {
  if (isTauri()) {
    return invoke<void>('copy_targets', { targets });
  }
  localStorage.setItem('clipboard-targets', JSON.stringify(targets));
}

/**
 * Copy exposure to internal clipboard
 */
export async function copyExposure(exposure: SimpleExposure): Promise<void> {
  if (isTauri()) {
    return invoke<void>('copy_exposure', { exposure });
  }
  localStorage.setItem('clipboard-exposure', JSON.stringify(exposure));
}

/**
 * Copy multiple exposures to internal clipboard
 */
export async function copyExposures(exposures: SimpleExposure[]): Promise<void> {
  if (isTauri()) {
    return invoke<void>('copy_exposures', { exposures });
  }
  localStorage.setItem('clipboard-exposures', JSON.stringify(exposures));
}

/**
 * Paste target from internal clipboard
 */
export async function pasteTarget(): Promise<SimpleTarget | null> {
  if (isTauri()) {
    return invoke<SimpleTarget | null>('paste_target');
  }
  
  const data = localStorage.getItem('clipboard-target');
  if (!data) return null;
  
  try {
    const target = JSON.parse(data) as SimpleTarget;
    // Generate new ID
    target.id = crypto.randomUUID();
    target.name = `${target.name} (Copy)`;
    target.targetName = `${target.targetName} (Copy)`;
    return target;
  } catch {
    return null;
  }
}

/**
 * Paste targets from internal clipboard
 */
export async function pasteTargets(): Promise<SimpleTarget[] | null> {
  if (isTauri()) {
    return invoke<SimpleTarget[] | null>('paste_targets');
  }
  
  const data = localStorage.getItem('clipboard-targets') || localStorage.getItem('clipboard-target');
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data);
    const targets = Array.isArray(parsed) ? parsed : [parsed];
    return targets.map((t: SimpleTarget) => ({
      ...t,
      id: crypto.randomUUID(),
      name: `${t.name} (Copy)`,
      targetName: `${t.targetName} (Copy)`,
    }));
  } catch {
    return null;
  }
}

/**
 * Paste exposure from internal clipboard
 */
export async function pasteExposure(): Promise<SimpleExposure | null> {
  if (isTauri()) {
    return invoke<SimpleExposure | null>('paste_exposure');
  }
  
  const data = localStorage.getItem('clipboard-exposure');
  if (!data) return null;
  
  try {
    const exposure = JSON.parse(data) as SimpleExposure;
    exposure.id = crypto.randomUUID();
    exposure.progressCount = 0;
    return exposure;
  } catch {
    return null;
  }
}

/**
 * Paste exposures from internal clipboard
 */
export async function pasteExposures(): Promise<SimpleExposure[] | null> {
  if (isTauri()) {
    return invoke<SimpleExposure[] | null>('paste_exposures');
  }
  
  const data = localStorage.getItem('clipboard-exposures') || localStorage.getItem('clipboard-exposure');
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data);
    const exposures = Array.isArray(parsed) ? parsed : [parsed];
    return exposures.map((e: SimpleExposure) => ({
      ...e,
      id: crypto.randomUUID(),
      progressCount: 0,
    }));
  } catch {
    return null;
  }
}

/**
 * Check if clipboard has content
 */
export async function hasClipboardContent(): Promise<boolean> {
  if (isTauri()) {
    return invoke<boolean>('has_clipboard_content');
  }
  return !!(
    localStorage.getItem('clipboard-target') ||
    localStorage.getItem('clipboard-targets') ||
    localStorage.getItem('clipboard-exposure') ||
    localStorage.getItem('clipboard-exposures')
  );
}

/**
 * Check if clipboard has specific content type
 */
export async function hasClipboardContentType(contentType: string): Promise<boolean> {
  if (isTauri()) {
    return invoke<boolean>('has_clipboard_content_type', { contentType });
  }
  return !!localStorage.getItem(`clipboard-${contentType}`);
}

/**
 * Clear clipboard
 */
export async function clearClipboard(): Promise<void> {
  if (isTauri()) {
    return invoke<void>('clear_clipboard');
  }
  localStorage.removeItem('clipboard-target');
  localStorage.removeItem('clipboard-targets');
  localStorage.removeItem('clipboard-exposure');
  localStorage.removeItem('clipboard-exposures');
}

/**
 * Copy to system clipboard as text
 */
export async function copyToSystemClipboard(text: string): Promise<void> {
  if (isTauri()) {
    try {
      const clipboard = await import('@tauri-apps/plugin-clipboard-manager');
      await clipboard.writeText(text);
      return;
    } catch (e) {
      console.error('Failed to copy to system clipboard:', e);
    }
  }
  
  // Browser fallback
  await navigator.clipboard.writeText(text);
}

/**
 * Read from system clipboard
 */
export async function readFromSystemClipboard(): Promise<string | null> {
  if (isTauri()) {
    try {
      const clipboard = await import('@tauri-apps/plugin-clipboard-manager');
      return await clipboard.readText();
    } catch (e) {
      console.error('Failed to read from system clipboard:', e);
      return null;
    }
  }
  
  // Browser fallback
  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}
