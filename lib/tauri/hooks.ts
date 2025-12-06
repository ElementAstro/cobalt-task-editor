/**
 * React hooks for Tauri integration
 */

import { useState, useEffect, useCallback } from 'react';
import { isTauri, getPlatform, PlatformType } from './platform';
import * as fileApi from './file';
import * as dialogApi from './dialog';
import * as settingsApi from './settings';
import type { SimpleSequence } from '../nina/simple-sequence-types';
import type { AppSettings } from './settings';

/**
 * Hook to check if running in Tauri environment
 * Uses useSyncExternalStore pattern for SSR compatibility
 */
export function useIsTauri(): boolean {
  // Use lazy initialization to avoid hydration mismatch
  const [isTauriEnv] = useState(() => {
    if (typeof window === 'undefined') return false;
    return isTauri();
  });

  return isTauriEnv;
}

/**
 * Hook to get current platform
 * Uses useSyncExternalStore pattern for SSR compatibility
 */
export function usePlatform(): PlatformType {
  // Use lazy initialization to avoid hydration mismatch
  const [platform] = useState<PlatformType>(() => {
    return getPlatform();
  });

  return platform;
}

/**
 * Hook for file operations
 */
export function useFileOperations() {
  const isTauriEnv = useIsTauri();

  const openFile = useCallback(async (options?: dialogApi.OpenDialogOptions) => {
    const paths = await dialogApi.showOpenDialog(options);
    if (!paths || paths.length === 0) return null;
    
    if (isTauriEnv) {
      return fileApi.loadSimpleSequenceFile(paths[0]);
    }
    return null;
  }, [isTauriEnv]);

  const saveFile = useCallback(async (
    sequence: SimpleSequence,
    options?: dialogApi.SaveDialogOptions
  ) => {
    if (isTauriEnv) {
      const path = await dialogApi.showSaveDialog(options);
      if (!path) return false;
      await fileApi.saveSimpleSequenceFile(path, sequence);
      return true;
    }
    
    // Browser fallback - download file
    const json = JSON.stringify(sequence, null, 2);
    const filename = options?.defaultName || `${sequence.title || 'sequence'}.json`;
    fileApi.downloadFile(json, filename, 'application/json');
    return true;
  }, [isTauriEnv]);

  const exportCsv = useCallback(async (sequence: SimpleSequence, filename?: string) => {
    if (isTauriEnv) {
      const csv = await fileApi.exportSequenceCsv(sequence);
      const path = await dialogApi.showSaveDialog({
        defaultName: filename || `${sequence.title || 'targets'}.csv`,
        filters: [{ name: 'CSV Files', extensions: ['csv'] }],
      });
      if (path) {
        await fileApi.writeFileContents(path, csv);
        return true;
      }
      return false;
    }
    
    // Browser fallback
    try {
      const csv = await fileApi.exportSequenceCsv(sequence);
      fileApi.downloadFile(csv, filename || `${sequence.title || 'targets'}.csv`, 'text/csv');
      return true;
    } catch {
      // Fallback to simple CSV generation
      return false;
    }
  }, [isTauriEnv]);

  const exportXml = useCallback(async (sequence: SimpleSequence, filename?: string) => {
    if (isTauriEnv) {
      const xml = await fileApi.exportSequenceXml(sequence);
      const path = await dialogApi.showSaveDialog({
        defaultName: filename || `${sequence.title || 'targets'}.ninaTargetSet`,
        filters: [{ name: 'NINA Target Set', extensions: ['ninaTargetSet', 'xml'] }],
      });
      if (path) {
        await fileApi.writeFileContents(path, xml);
        return true;
      }
      return false;
    }
    
    // Browser fallback
    try {
      const xml = await fileApi.exportSequenceXml(sequence);
      fileApi.downloadFile(xml, filename || `${sequence.title || 'targets'}.xml`, 'application/xml');
      return true;
    } catch {
      return false;
    }
  }, [isTauriEnv]);

  const importCsv = useCallback(async () => {
    if (isTauriEnv) {
      const paths = await dialogApi.showOpenDialog({
        filters: [{ name: 'CSV Files', extensions: ['csv'] }],
      });
      if (!paths || paths.length === 0) return null;
      return fileApi.importTargetsCsv(paths[0]);
    }
    
    // Browser fallback - use file input
    return new Promise<SimpleSequence['targets'] | null>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv';
      input.onchange = async () => {
        if (input.files && input.files.length > 0) {
          try {
            const content = await fileApi.readFileFromInput(input.files[0]);
            const targets = await fileApi.importTargetsCsvContent(content);
            resolve(targets);
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  }, [isTauriEnv]);

  return {
    isTauriEnv,
    openFile,
    saveFile,
    exportCsv,
    exportXml,
    importCsv,
  };
}

/**
 * Hook for settings management
 */
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    settingsApi.loadSettings()
      .then(setSettings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    if (!settings) return;
    const newSettings = { ...settings, ...updates };
    await settingsApi.saveSettings(newSettings);
    setSettings(newSettings);
  }, [settings]);

  const setTheme = useCallback(async (theme: string) => {
    await settingsApi.setTheme(theme);
    if (settings) {
      setSettings({ ...settings, theme });
    }
  }, [settings]);

  const setLanguage = useCallback(async (language: string) => {
    await settingsApi.setLanguage(language);
    if (settings) {
      setSettings({ ...settings, language });
    }
  }, [settings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    setTheme,
    setLanguage,
  };
}

/**
 * Hook for recent files
 */
export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsApi.getRecentFiles()
      .then(setRecentFiles)
      .finally(() => setLoading(false));
  }, []);

  const addRecentFile = useCallback(async (path: string) => {
    await settingsApi.addRecentFile(path);
    const updated = await settingsApi.getRecentFiles();
    setRecentFiles(updated);
  }, []);

  const removeRecentFile = useCallback(async (path: string) => {
    await settingsApi.removeRecentFile(path);
    const updated = await settingsApi.getRecentFiles();
    setRecentFiles(updated);
  }, []);

  const clearRecentFiles = useCallback(async () => {
    await settingsApi.clearRecentFiles();
    setRecentFiles([]);
  }, []);

  return {
    recentFiles,
    loading,
    addRecentFile,
    removeRecentFile,
    clearRecentFiles,
  };
}

/**
 * Hook for auto-save functionality
 */
export function useAutoSave(
  sequence: SimpleSequence | null,
  enabled: boolean = true,
  intervalMs: number = 60000
) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!enabled || !sequence) return;

    const save = async () => {
      if (!sequence.isDirty) return;
      
      setSaving(true);
      try {
        await fileApi.autoSaveSequence(sequence);
        setLastSaved(new Date());
      } catch (e) {
        console.error('Auto-save failed:', e);
      } finally {
        setSaving(false);
      }
    };

    const interval = setInterval(save, intervalMs);
    return () => clearInterval(interval);
  }, [sequence, enabled, intervalMs]);

  const loadAutoSave = useCallback(async (sequenceId: string) => {
    return fileApi.loadAutoSave(sequenceId);
  }, []);

  const clearAutoSave = useCallback(async (sequenceId: string) => {
    await fileApi.clearAutoSave(sequenceId);
    setLastSaved(null);
  }, []);

  return {
    lastSaved,
    saving,
    loadAutoSave,
    clearAutoSave,
  };
}
