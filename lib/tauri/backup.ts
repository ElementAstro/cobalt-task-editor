/**
 * Backup and recovery with Tauri/browser fallback
 */

import { isTauri, invoke } from "./platform";
import type { SimpleSequence } from "../nina/simple-sequence-types";

export interface BackupMetadata {
  id: string;
  sequenceId: string;
  sequenceTitle: string;
  createdAt: string;
  filePath: string;
  fileSize: number;
  backupType: "auto" | "manual" | "before_save" | "crash";
}

const BACKUPS_KEY = "cobalt-backups";
const CRASH_RECOVERY_KEY = "cobalt-crash-recovery";

/**
 * Create backup
 */
export async function createBackup(
  sequence: SimpleSequence,
  backupType: "auto" | "manual" | "before_save" | "crash" = "manual",
): Promise<BackupMetadata> {
  if (isTauri()) {
    return invoke<BackupMetadata>("create_backup", { sequence, backupType });
  }

  // Browser fallback - use localStorage
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const content = JSON.stringify(sequence);

  const metadata: BackupMetadata = {
    id,
    sequenceId: sequence.id,
    sequenceTitle: sequence.title,
    createdAt: now,
    filePath: `localStorage:${id}`,
    fileSize: content.length,
    backupType,
  };

  // Save backup content
  localStorage.setItem(`${BACKUPS_KEY}-${id}`, content);

  // Save metadata
  const backups = getLocalBackups();
  backups.push(metadata);
  localStorage.setItem(BACKUPS_KEY, JSON.stringify(backups));

  return metadata;
}

/**
 * Get local backups from localStorage
 */
function getLocalBackups(): BackupMetadata[] {
  const data = localStorage.getItem(BACKUPS_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * List backups
 */
export async function listBackups(
  sequenceId?: string,
): Promise<BackupMetadata[]> {
  if (isTauri()) {
    return invoke<BackupMetadata[]>("list_backups", { sequenceId });
  }

  let backups = getLocalBackups();
  if (sequenceId) {
    backups = backups.filter((b) => b.sequenceId === sequenceId);
  }

  // Sort by creation time (newest first)
  backups.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return backups;
}

/**
 * Restore backup
 */
export async function restoreBackup(
  backupId: string,
): Promise<SimpleSequence | null> {
  if (isTauri()) {
    try {
      return await invoke<SimpleSequence>("restore_backup", { backupId });
    } catch {
      return null;
    }
  }

  const content = localStorage.getItem(`${BACKUPS_KEY}-${backupId}`);
  if (!content) return null;

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Delete backup
 */
export async function deleteBackup(backupId: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>("delete_backup", { backupId });
  }

  localStorage.removeItem(`${BACKUPS_KEY}-${backupId}`);

  const backups = getLocalBackups().filter((b) => b.id !== backupId);
  localStorage.setItem(BACKUPS_KEY, JSON.stringify(backups));
}

/**
 * Clean old backups
 */
export async function cleanOldBackups(
  maxAgeDays: number = 30,
  maxCount: number = 50,
): Promise<number> {
  if (isTauri()) {
    return invoke<number>("clean_old_backups", { maxAgeDays, maxCount });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxAgeDays);

  let backups = getLocalBackups();
  const initialCount = backups.length;

  // Remove old backups
  backups = backups.filter((b) => new Date(b.createdAt) >= cutoff);

  // Remove excess backups (keep newest)
  if (backups.length > maxCount) {
    backups.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const toRemove = backups.slice(maxCount);
    backups = backups.slice(0, maxCount);

    for (const backup of toRemove) {
      localStorage.removeItem(`${BACKUPS_KEY}-${backup.id}`);
    }
  }

  localStorage.setItem(BACKUPS_KEY, JSON.stringify(backups));

  return initialCount - backups.length;
}

/**
 * Save crash recovery data
 */
export async function saveCrashRecovery(
  sequence: SimpleSequence,
): Promise<string> {
  if (isTauri()) {
    return invoke<string>("save_crash_recovery", { sequence });
  }

  const key = `${CRASH_RECOVERY_KEY}-${sequence.id}`;
  localStorage.setItem(key, JSON.stringify(sequence));
  return key;
}

/**
 * Load crash recovery data
 */
export async function loadCrashRecovery(
  sequenceId: string,
): Promise<SimpleSequence | null> {
  if (isTauri()) {
    return invoke<SimpleSequence | null>("load_crash_recovery", { sequenceId });
  }

  const key = `${CRASH_RECOVERY_KEY}-${sequenceId}`;
  const content = localStorage.getItem(key);
  if (!content) return null;

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Clear crash recovery data
 */
export async function clearCrashRecovery(sequenceId: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>("clear_crash_recovery", { sequenceId });
  }

  const key = `${CRASH_RECOVERY_KEY}-${sequenceId}`;
  localStorage.removeItem(key);
}

/**
 * List crash recovery files
 */
export async function listCrashRecovery(): Promise<string[]> {
  if (isTauri()) {
    return invoke<string[]>("list_crash_recovery");
  }

  const ids: string[] = [];
  const prefix = `${CRASH_RECOVERY_KEY}-`;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      ids.push(key.substring(prefix.length));
    }
  }

  return ids;
}

/**
 * Check if crash recovery exists
 */
export async function hasCrashRecovery(sequenceId: string): Promise<boolean> {
  if (isTauri()) {
    return invoke<boolean>("has_crash_recovery", { sequenceId });
  }

  const key = `${CRASH_RECOVERY_KEY}-${sequenceId}`;
  return localStorage.getItem(key) !== null;
}
