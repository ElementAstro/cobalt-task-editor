/**
 * Sequence operations with Tauri/browser fallback
 */

import { isTauri, invoke } from "./platform";
import {
  SequenceEntityStatus,
  SequenceMode,
  ImageType,
} from "../nina/simple-sequence-types";
import type {
  SimpleSequence,
  SimpleTarget,
  SimpleExposure,
} from "../nina/simple-sequence-types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SequenceStatistics {
  totalTargets: number;
  totalExposures: number;
  completedExposures: number;
  remainingExposures: number;
  totalRuntime: number;
  completedRuntime: number;
  remainingRuntime: number;
  progressPercentage: number;
}

/**
 * Validate simple sequence
 */
export async function validateSimpleSequence(
  sequence: SimpleSequence,
): Promise<ValidationResult> {
  if (isTauri()) {
    return invoke<ValidationResult>("validate_simple_sequence", { sequence });
  }

  // Browser fallback - basic validation
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!sequence.title) {
    errors.push("Sequence title is required");
  }

  if (sequence.targets.length === 0) {
    errors.push("At least one target is required");
  }

  for (const target of sequence.targets) {
    if (!target.targetName) {
      errors.push(`Target ${target.id} has no name`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate NINA JSON
 */
export async function validateNinaJson(
  json: string,
): Promise<ValidationResult> {
  if (isTauri()) {
    return invoke<ValidationResult>("validate_nina_json", { json });
  }

  // Browser fallback
  try {
    const data = JSON.parse(json);
    const errors: string[] = [];

    if (!data.$type) {
      errors.push("Missing $type field");
    } else if (!data.$type.includes("Container")) {
      errors.push("Root element must be a container type");
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  } catch (e) {
    return { valid: false, errors: [`Invalid JSON: ${e}`], warnings: [] };
  }
}

/**
 * Create new simple sequence
 */
export async function createSimpleSequence(
  title?: string,
): Promise<SimpleSequence> {
  if (isTauri()) {
    return invoke<SimpleSequence>("create_simple_sequence", { title });
  }

  // Browser fallback - create locally
  const id = crypto.randomUUID();
  const target: SimpleTarget = {
    id: crypto.randomUUID(),
    name: "Target",
    status: SequenceEntityStatus.CREATED,
    targetName: "Target",
    coordinates: {
      raHours: 0,
      raMinutes: 0,
      raSeconds: 0,
      decDegrees: 0,
      decMinutes: 0,
      decSeconds: 0,
      negativeDec: false,
    },
    positionAngle: 0,
    rotation: 0,
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

  return {
    id,
    title: title || "Target Set",
    isDirty: false,
    startOptions: {
      coolCameraAtSequenceStart: true,
      coolCameraTemperature: -10,
      coolCameraDuration: 600,
      unparkMountAtSequenceStart: true,
      doMeridianFlip: true,
    },
    endOptions: {
      warmCamAtSequenceEnd: true,
      warmCameraDuration: 600,
      parkMountAtSequenceEnd: true,
    },
    targets: [target],
    selectedTargetId: target.id,
    activeTargetId: target.id,
    isRunning: false,
    estimatedDownloadTime: 5,
  };
}

/**
 * Create new target
 */
export async function createTarget(name?: string): Promise<SimpleTarget> {
  if (isTauri()) {
    return invoke<SimpleTarget>("create_target", { name });
  }

  // Browser fallback
  return {
    id: crypto.randomUUID(),
    name: name || "Target",
    status: SequenceEntityStatus.CREATED,
    targetName: name || "Target",
    coordinates: {
      raHours: 0,
      raMinutes: 0,
      raSeconds: 0,
      decDegrees: 0,
      decMinutes: 0,
      decSeconds: 0,
      negativeDec: false,
    },
    positionAngle: 0,
    rotation: 0,
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

/**
 * Create new exposure
 */
export async function createExposure(): Promise<SimpleExposure> {
  if (isTauri()) {
    return invoke<SimpleExposure>("create_exposure");
  }

  // Browser fallback
  return {
    id: crypto.randomUUID(),
    enabled: true,
    status: SequenceEntityStatus.CREATED,
    exposureTime: 60,
    imageType: ImageType.LIGHT,
    filter: null,
    binning: { x: 1, y: 1 },
    gain: -1,
    offset: -1,
    totalCount: 10,
    progressCount: 0,
    dither: false,
    ditherEvery: 1,
  };
}

/**
 * Duplicate target
 */
export async function duplicateTarget(
  target: SimpleTarget,
): Promise<SimpleTarget> {
  if (isTauri()) {
    return invoke<SimpleTarget>("duplicate_target", { target });
  }

  // Browser fallback
  const newTarget = JSON.parse(JSON.stringify(target));
  newTarget.id = crypto.randomUUID();
  newTarget.name = `${target.name} (Copy)`;
  newTarget.targetName = `${target.targetName} (Copy)`;
  newTarget.status = "CREATED";

  for (const exp of newTarget.exposures) {
    exp.id = crypto.randomUUID();
    exp.progressCount = 0;
    exp.status = "CREATED";
  }

  return newTarget;
}

/**
 * Get sequence statistics
 */
export async function getSequenceStatistics(
  sequence: SimpleSequence,
): Promise<SequenceStatistics> {
  if (isTauri()) {
    return invoke<SequenceStatistics>("get_sequence_statistics", { sequence });
  }

  // Browser fallback
  let totalExposures = 0;
  let completedExposures = 0;
  let totalRuntime = 0;
  let completedRuntime = 0;

  for (const target of sequence.targets) {
    for (const exp of target.exposures) {
      totalExposures += exp.totalCount;
      completedExposures += exp.progressCount;

      const expTime = exp.exposureTime + sequence.estimatedDownloadTime;
      totalRuntime += exp.totalCount * expTime;
      completedRuntime += exp.progressCount * expTime;
    }
  }

  const remainingExposures = totalExposures - completedExposures;
  const remainingRuntime = totalRuntime - completedRuntime;
  const progressPercentage =
    totalExposures > 0 ? (completedExposures / totalExposures) * 100 : 0;

  return {
    totalTargets: sequence.targets.length,
    totalExposures,
    completedExposures,
    remainingExposures,
    totalRuntime,
    completedRuntime,
    remainingRuntime,
    progressPercentage,
  };
}

/**
 * Generate unique ID
 */
export async function generateId(): Promise<string> {
  if (isTauri()) {
    return invoke<string>("generate_id");
  }
  return crypto.randomUUID();
}

/**
 * Check if type is a container
 */
export async function isContainerType(typeStr: string): Promise<boolean> {
  if (isTauri()) {
    return invoke<boolean>("is_container_type", { typeStr });
  }
  return typeStr.includes("Container") || typeStr.includes("SmartExposure");
}

/**
 * Get short type name
 */
export async function getShortTypeName(fullType: string): Promise<string> {
  if (isTauri()) {
    return invoke<string>("get_short_type_name", { fullType });
  }

  // Browser fallback
  const match = fullType.match(/\.(\w+),/);
  return match ? match[1] : fullType;
}
