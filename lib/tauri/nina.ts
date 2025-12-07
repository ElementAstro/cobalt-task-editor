/**
 * NINA format operations with Tauri/browser fallback
 */

import { isTauri, invoke } from "./platform";
import type { EditorSequence, EditorSequenceItem } from "../nina/types";

/**
 * Export editor sequence to NINA JSON format
 */
export async function exportToNinaJson(
  sequence: EditorSequence,
): Promise<string> {
  if (isTauri()) {
    return invoke<string>("export_to_nina_json", { sequence });
  }

  // Browser fallback - use frontend serializer
  const { exportToNINA } = await import("../nina/serializer");
  return exportToNINA(sequence);
}

/**
 * Import NINA JSON to editor sequence
 */
export async function importFromNinaJson(
  json: string,
): Promise<EditorSequence> {
  if (isTauri()) {
    return invoke<EditorSequence>("import_from_nina_json", { json });
  }

  // Browser fallback - use frontend serializer
  const { importFromNINA } = await import("../nina/serializer");
  return importFromNINA(json);
}

/**
 * Validate NINA JSON format
 */
export async function validateNinaFormat(
  json: string,
): Promise<{ valid: boolean; errors: string[] }> {
  if (isTauri()) {
    try {
      await invoke<void>("validate_nina_format", { json });
      return { valid: true, errors: [] };
    } catch (e) {
      const errors = Array.isArray(e) ? e : [String(e)];
      return { valid: false, errors };
    }
  }

  // Browser fallback - basic validation
  try {
    const data = JSON.parse(json);
    const errors: string[] = [];

    if (!data.$type) {
      errors.push("Missing $type field");
    } else if (!data.$type.includes("Container")) {
      errors.push("Root element must be a container type");
    }

    return { valid: errors.length === 0, errors };
  } catch (e) {
    return { valid: false, errors: [`Invalid JSON: ${e}`] };
  }
}

/**
 * Save editor sequence to NINA JSON file
 */
export async function saveNinaSequenceFile(
  path: string,
  sequence: EditorSequence,
): Promise<void> {
  if (isTauri()) {
    return invoke<void>("save_nina_sequence_file", { path, sequence });
  }
  throw new Error("File saving not supported in browser mode");
}

/**
 * Load editor sequence from NINA JSON file
 */
export async function loadNinaSequenceFile(
  path: string,
): Promise<EditorSequence> {
  if (isTauri()) {
    return invoke<EditorSequence>("load_nina_sequence_file", { path });
  }
  throw new Error("File loading not supported in browser mode");
}

/**
 * Export template to NINA format
 */
export async function exportTemplateToNina(
  items: EditorSequenceItem[],
  name: string,
): Promise<string> {
  if (isTauri()) {
    return invoke<string>("export_template_to_nina", { items, name });
  }

  // Browser fallback
  const sequence: EditorSequence = {
    id: crypto.randomUUID(),
    title: name,
    startItems: [],
    targetItems: items,
    endItems: [],
    globalTriggers: [],
  };

  return exportToNinaJson(sequence);
}

/**
 * Get NINA type short name
 */
export async function getNinaTypeShortName(fullType: string): Promise<string> {
  if (isTauri()) {
    return invoke<string>("get_nina_type_short_name", { fullType });
  }

  // Browser fallback
  const match = fullType.match(/\.(\w+),/);
  return match ? match[1] : fullType;
}

/**
 * Get NINA type category
 */
export async function getNinaTypeCategory(fullType: string): Promise<string> {
  if (isTauri()) {
    return invoke<string>("get_nina_type_category", { fullType });
  }

  // Browser fallback
  const parts = fullType.split(".");
  if (parts.length >= 4) {
    const category = parts[parts.length - 2];
    const commaPos = category.indexOf(",");
    return commaPos >= 0 ? category.substring(0, commaPos) : category;
  }
  return "Unknown";
}

/**
 * Check if NINA type is a container
 */
export async function isNinaContainerType(typeStr: string): Promise<boolean> {
  if (isTauri()) {
    return invoke<boolean>("is_nina_container_type", { typeStr });
  }

  return (
    typeStr.includes("Container") ||
    typeStr.includes("SmartExposure") ||
    typeStr.includes("InstructionSet") ||
    typeStr.includes("DeepSkyObject")
  );
}

/**
 * Get all NINA type categories
 */
export async function getNinaCategories(): Promise<string[]> {
  if (isTauri()) {
    return invoke<string[]>("get_nina_categories");
  }

  return [
    "Camera",
    "Dome",
    "FilterWheel",
    "Focuser",
    "Guider",
    "Imaging",
    "Mount",
    "Platesolving",
    "Rotator",
    "SafetyMonitor",
    "Switch",
    "Telescope",
    "Utility",
    "Weather",
    "Container",
    "Condition",
    "Trigger",
  ];
}
