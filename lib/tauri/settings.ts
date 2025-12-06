/**
 * Settings operations with Tauri/browser fallback
 */

import { isTauri, invoke } from './platform';

export interface AppSettings {
  lastDirectory?: string;
  recentFiles: string[];
  maxRecentFiles: number;
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  windowWidth?: number;
  windowHeight?: number;
  windowX?: number;
  windowY?: number;
  windowMaximized: boolean;
  theme: string;
  language: string;
  estimatedDownloadTime: number;
}

export interface WindowState {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  maximized: boolean;
}

const SETTINGS_KEY = 'cobalt-task-editor-settings';

/**
 * Get default settings
 */
function getDefaultSettings(): AppSettings {
  return {
    recentFiles: [],
    maxRecentFiles: 10,
    autoSaveEnabled: true,
    autoSaveInterval: 300,
    windowWidth: 1280,
    windowHeight: 800,
    windowMaximized: false,
    theme: 'system',
    language: 'en',
    estimatedDownloadTime: 5,
  };
}

/**
 * Load settings
 */
export async function loadSettings(): Promise<AppSettings> {
  if (isTauri()) {
    return invoke<AppSettings>('load_settings');
  }
  
  // Browser fallback - use localStorage
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    try {
      return { ...getDefaultSettings(), ...JSON.parse(stored) };
    } catch {
      return getDefaultSettings();
    }
  }
  return getDefaultSettings();
}

/**
 * Save settings
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  if (isTauri()) {
    return invoke<void>('save_settings', { settings });
  }
  
  // Browser fallback
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Get current settings
 */
export async function getSettings(): Promise<AppSettings> {
  if (isTauri()) {
    return invoke<AppSettings>('get_settings');
  }
  return loadSettings();
}

/**
 * Get recent files
 */
export async function getRecentFiles(): Promise<string[]> {
  if (isTauri()) {
    return invoke<string[]>('get_recent_files');
  }
  
  const settings = await loadSettings();
  return settings.recentFiles;
}

/**
 * Add recent file
 */
export async function addRecentFile(path: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>('add_recent_file', { path });
  }
  
  const settings = await loadSettings();
  settings.recentFiles = settings.recentFiles.filter(p => p !== path);
  settings.recentFiles.unshift(path);
  settings.recentFiles = settings.recentFiles.slice(0, settings.maxRecentFiles);
  await saveSettings(settings);
}

/**
 * Remove recent file
 */
export async function removeRecentFile(path: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>('remove_recent_file', { path });
  }
  
  const settings = await loadSettings();
  settings.recentFiles = settings.recentFiles.filter(p => p !== path);
  await saveSettings(settings);
}

/**
 * Clear recent files
 */
export async function clearRecentFiles(): Promise<void> {
  if (isTauri()) {
    return invoke<void>('clear_recent_files');
  }
  
  const settings = await loadSettings();
  settings.recentFiles = [];
  await saveSettings(settings);
}

/**
 * Get last directory
 */
export async function getLastDirectory(): Promise<string | null> {
  if (isTauri()) {
    return invoke<string | null>('get_last_directory');
  }
  
  const settings = await loadSettings();
  return settings.lastDirectory || null;
}

/**
 * Set last directory
 */
export async function setLastDirectory(path: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>('set_last_directory', { path });
  }
  
  const settings = await loadSettings();
  settings.lastDirectory = path;
  await saveSettings(settings);
}

/**
 * Save window state
 */
export async function saveWindowState(
  width: number,
  height: number,
  x?: number,
  y?: number,
  maximized: boolean = false
): Promise<void> {
  if (isTauri()) {
    return invoke<void>('save_window_state', { width, height, x, y, maximized });
  }
  
  const settings = await loadSettings();
  settings.windowWidth = width;
  settings.windowHeight = height;
  settings.windowX = x;
  settings.windowY = y;
  settings.windowMaximized = maximized;
  await saveSettings(settings);
}

/**
 * Get window state
 */
export async function getWindowState(): Promise<WindowState> {
  if (isTauri()) {
    return invoke<WindowState>('get_window_state');
  }
  
  const settings = await loadSettings();
  return {
    width: settings.windowWidth,
    height: settings.windowHeight,
    x: settings.windowX,
    y: settings.windowY,
    maximized: settings.windowMaximized,
  };
}

/**
 * Set theme
 */
export async function setTheme(theme: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>('set_theme', { theme });
  }
  
  const settings = await loadSettings();
  settings.theme = theme;
  await saveSettings(settings);
}

/**
 * Get theme
 */
export async function getTheme(): Promise<string> {
  if (isTauri()) {
    return invoke<string>('get_theme');
  }
  
  const settings = await loadSettings();
  return settings.theme;
}

/**
 * Set language
 */
export async function setLanguage(language: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>('set_language', { language });
  }
  
  const settings = await loadSettings();
  settings.language = language;
  await saveSettings(settings);
}

/**
 * Get language
 */
export async function getLanguage(): Promise<string> {
  if (isTauri()) {
    return invoke<string>('get_language');
  }
  
  const settings = await loadSettings();
  return settings.language;
}

/**
 * Set estimated download time
 */
export async function setEstimatedDownloadTime(seconds: number): Promise<void> {
  if (isTauri()) {
    return invoke<void>('set_estimated_download_time', { seconds });
  }
  
  const settings = await loadSettings();
  settings.estimatedDownloadTime = seconds;
  await saveSettings(settings);
}

/**
 * Get estimated download time
 */
export async function getEstimatedDownloadTime(): Promise<number> {
  if (isTauri()) {
    return invoke<number>('get_estimated_download_time');
  }
  
  const settings = await loadSettings();
  return settings.estimatedDownloadTime;
}
