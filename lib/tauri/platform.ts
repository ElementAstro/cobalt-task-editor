/**
 * Platform detection and Tauri availability check
 */

/**
 * Check if running in Tauri desktop environment
 */
export function isTauri(): boolean {
  if (typeof window === "undefined") return false;
  return "__TAURI__" in window || "__TAURI_INTERNALS__" in window;
}

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && !isTauri();
}

/**
 * Check if running on server (SSR)
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

/**
 * Get platform type
 */
export type PlatformType = "tauri" | "browser" | "server";

export function getPlatform(): PlatformType {
  if (isServer()) return "server";
  if (isTauri()) return "tauri";
  return "browser";
}

/**
 * Dynamic import of Tauri API
 * Returns null if not in Tauri environment
 */
export async function getTauriCore() {
  if (!isTauri()) return null;
  try {
    return await import("@tauri-apps/api/core");
  } catch {
    return null;
  }
}

/**
 * Invoke a Tauri command with fallback
 */
export async function invoke<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const tauri = await getTauriCore();
  if (!tauri) {
    throw new Error(`Tauri not available. Cannot invoke command: ${command}`);
  }
  return tauri.invoke<T>(command, args);
}

/**
 * Try to invoke a Tauri command, return null if not available
 */
export async function tryInvoke<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T | null> {
  try {
    return await invoke<T>(command, args);
  } catch {
    return null;
  }
}

/**
 * Get OS information
 */
export async function getOsInfo(): Promise<{
  platform: string;
  version: string;
  arch: string;
  locale: string;
} | null> {
  if (!isTauri()) return null;

  try {
    const os = await import("@tauri-apps/plugin-os");
    return {
      platform: os.platform(),
      version: await os.version(),
      arch: os.arch(),
      locale: (await os.locale()) || "en",
    };
  } catch {
    return null;
  }
}
