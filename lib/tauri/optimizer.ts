/**
 * Sequence optimization with Tauri/browser fallback
 */

import { isTauri, invoke } from "./platform";
import type { SimpleSequence } from "../nina/simple-sequence-types";
import type { ObserverLocation, VisibilityWindow } from "./astronomy";

export type OptimizationStrategy =
  | "max_altitude"
  | "transit_time"
  | "visibility_start"
  | "visibility_duration"
  | "minimize_slew"
  | "moon_avoidance"
  | "combined";

export interface OptimizationResult {
  success: boolean;
  originalOrder: string[];
  optimizedOrder: string[];
  improvements: string[];
  warnings: string[];
  estimatedTotalRuntime: number;
  estimatedSlewTime: number;
}

export interface ConflictResult {
  hasConflicts: boolean;
  conflicts: ScheduleConflict[];
  suggestions: string[];
}

export interface ScheduleConflict {
  target1Id: string;
  target1Name: string;
  target2Id: string;
  target2Name: string;
  conflictType:
    | "TimeOverlap"
    | "InsufficientTime"
    | "VisibilityGap"
    | "MeridianFlip";
  description: string;
}

export interface TargetScheduleInfo {
  targetId: string;
  targetName: string;
  visibilityWindow: VisibilityWindow;
  optimalStartTime: string | null;
  optimalEndTime: string | null;
  qualityScore: number;
  conflicts: string[];
}

export interface BatchCalculationResult {
  targetId: string;
  runtime: number;
  etaStart: string | null;
  etaEnd: string | null;
}

export interface ValidationReport {
  date: string;
  totalTargets: number;
  visibleTargets: number;
  hasConflicts: boolean;
  conflictCount: number;
  totalVisibilityHours: number;
  averageQualityScore: number;
  recommendations: string[];
}

export interface BestDateResult {
  bestDate: string;
  bestScore: number;
  dateScores: Array<[string, number]>;
}

export interface SessionTimeEstimate {
  imagingTimeSeconds: number;
  slewTimeSeconds: number;
  autofocusTimeSeconds: number;
  centeringTimeSeconds: number;
  totalTimeSeconds: number;
  availableDarkTimeSeconds: number;
  fitsInNight: boolean;
  utilizationPercentage: number;
}

export interface StrategyInfo {
  id: string;
  name: string;
  description: string;
}

/**
 * Optimize target order in sequence
 */
export async function optimizeTargetOrder(
  sequence: SimpleSequence,
  location: ObserverLocation,
  date: string,
  strategy: OptimizationStrategy = "combined",
): Promise<OptimizationResult> {
  if (isTauri()) {
    return invoke<OptimizationResult>("optimize_target_order", {
      sequence,
      location,
      date,
      strategy,
    });
  }

  // Browser fallback - return original order
  return {
    success: true,
    originalOrder: sequence.targets.map((t) => t.id),
    optimizedOrder: sequence.targets.map((t) => t.id),
    improvements: ["Optimization requires desktop app for accurate results"],
    warnings: [],
    estimatedTotalRuntime: calculateTotalRuntime(sequence),
    estimatedSlewTime: 0,
  };
}

/**
 * Detect scheduling conflicts
 */
export async function detectScheduleConflicts(
  sequence: SimpleSequence,
  location: ObserverLocation,
  date: string,
): Promise<ConflictResult> {
  if (isTauri()) {
    return invoke<ConflictResult>("detect_schedule_conflicts", {
      sequence,
      location,
      date,
    });
  }

  // Browser fallback
  return {
    hasConflicts: false,
    conflicts: [],
    suggestions: ["Use desktop app for accurate conflict detection"],
  };
}

/**
 * Calculate ETAs for all targets (parallel)
 */
export async function calculateParallelEtas(
  sequence: SimpleSequence,
  startTime?: string,
): Promise<BatchCalculationResult[]> {
  if (isTauri()) {
    return invoke<BatchCalculationResult[]>("calculate_parallel_etas", {
      sequence,
      startTime,
    });
  }

  // Browser fallback
  const results: BatchCalculationResult[] = [];
  let currentTime = startTime ? new Date(startTime) : new Date();

  for (const target of sequence.targets) {
    const runtime = calculateTargetRuntime(
      target,
      sequence.estimatedDownloadTime,
    );
    const etaStart = currentTime.toISOString();
    currentTime = new Date(currentTime.getTime() + runtime * 1000);
    const etaEnd = currentTime.toISOString();

    results.push({
      targetId: target.id,
      runtime,
      etaStart,
      etaEnd,
    });
  }

  return results;
}

/**
 * Get scheduling info for all targets
 */
export async function getTargetScheduleInfo(
  sequence: SimpleSequence,
  location: ObserverLocation,
  date: string,
): Promise<TargetScheduleInfo[]> {
  if (isTauri()) {
    return invoke<TargetScheduleInfo[]>("get_target_schedule_info", {
      sequence,
      location,
      date,
    });
  }

  // Browser fallback
  return sequence.targets.map((target) => ({
    targetId: target.id,
    targetName: target.targetName,
    visibilityWindow: {
      startTime: `${date}T18:00:00Z`,
      endTime: `${date}T06:00:00Z`,
      maxAltitude: 60,
      maxAltitudeTime: `${date}T00:00:00Z`,
      durationHours: 8,
      isVisible: true,
    },
    optimalStartTime: `${date}T22:00:00Z`,
    optimalEndTime: null,
    qualityScore: 50,
    conflicts: [],
  }));
}

/**
 * Apply optimized order to sequence
 */
export async function applyOptimization(
  sequence: SimpleSequence,
  order: string[],
): Promise<SimpleSequence> {
  if (isTauri()) {
    return invoke<SimpleSequence>("apply_optimization", { sequence, order });
  }

  // Browser fallback
  const newTargets = order
    .map((id) => sequence.targets.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => t !== undefined);

  return {
    ...sequence,
    targets: newTargets,
  };
}

/**
 * Merge multiple sequences
 */
export async function mergeMultipleSequences(
  sequences: SimpleSequence[],
  title?: string,
): Promise<SimpleSequence> {
  if (isTauri()) {
    return invoke<SimpleSequence>("merge_multiple_sequences", {
      sequences,
      title,
    });
  }

  // Browser fallback
  const mergedTargets = sequences.flatMap((seq) =>
    seq.targets.map((t) => ({
      ...t,
      id: crypto.randomUUID(),
    })),
  );

  return {
    ...sequences[0],
    id: crypto.randomUUID(),
    title: title || "Merged Sequence",
    targets: mergedTargets,
    selectedTargetId: mergedTargets[0]?.id,
    activeTargetId: mergedTargets[0]?.id,
  };
}

/**
 * Split sequence by target
 */
export async function splitSequenceByTarget(
  sequence: SimpleSequence,
): Promise<SimpleSequence[]> {
  if (isTauri()) {
    return invoke<SimpleSequence[]>("split_sequence_by_target", { sequence });
  }

  // Browser fallback
  return sequence.targets.map((target) => ({
    ...sequence,
    id: crypto.randomUUID(),
    title: target.targetName,
    targets: [target],
    selectedTargetId: target.id,
    activeTargetId: target.id,
  }));
}

/**
 * Get available optimization strategies
 */
export async function getOptimizationStrategies(): Promise<StrategyInfo[]> {
  if (isTauri()) {
    return invoke<Array<[string, string, string]>>(
      "get_optimization_strategies",
    ).then((data) =>
      data.map(([id, name, description]) => ({ id, name, description })),
    );
  }

  return [
    {
      id: "max_altitude",
      name: "Maximum Altitude",
      description: "Order targets by their maximum altitude (highest first)",
    },
    {
      id: "transit_time",
      name: "Transit Time",
      description: "Order targets by when they cross the meridian",
    },
    {
      id: "visibility_start",
      name: "Visibility Start",
      description: "Order targets by when they become visible",
    },
    {
      id: "visibility_duration",
      name: "Visibility Duration",
      description: "Order targets by how long they're visible (longest first)",
    },
    {
      id: "minimize_slew",
      name: "Minimize Slew",
      description: "Order targets to minimize telescope movement",
    },
    {
      id: "moon_avoidance",
      name: "Moon Avoidance",
      description: "Order targets by distance from the Moon",
    },
    {
      id: "combined",
      name: "Combined",
      description: "Use a combined optimization score",
    },
  ];
}

/**
 * Calculate visibility for all targets in parallel
 */
export async function batchCalculateVisibility(
  sequence: SimpleSequence,
  location: ObserverLocation,
  date: string,
  minAltitude: number = 20,
): Promise<Array<{ id: string; visibility: VisibilityWindow }>> {
  if (isTauri()) {
    return invoke<Array<[string, VisibilityWindow]>>(
      "batch_calculate_visibility",
      {
        sequence,
        location,
        date,
        minAltitude,
      },
    ).then((data) => data.map(([id, visibility]) => ({ id, visibility })));
  }

  // Browser fallback
  return sequence.targets.map((target) => ({
    id: target.id,
    visibility: {
      startTime: `${date}T18:00:00Z`,
      endTime: `${date}T06:00:00Z`,
      maxAltitude: 60,
      maxAltitudeTime: `${date}T00:00:00Z`,
      durationHours: 8,
      isVisible: true,
    },
  }));
}

/**
 * Validate sequence for a specific date
 */
export async function validateSequenceForDate(
  sequence: SimpleSequence,
  location: ObserverLocation,
  date: string,
): Promise<ValidationReport> {
  if (isTauri()) {
    return invoke<ValidationReport>("validate_sequence_for_date", {
      sequence,
      location,
      date,
    });
  }

  // Browser fallback
  return {
    date,
    totalTargets: sequence.targets.length,
    visibleTargets: sequence.targets.length,
    hasConflicts: false,
    conflictCount: 0,
    totalVisibilityHours: 8 * sequence.targets.length,
    averageQualityScore: 50,
    recommendations: ["Use desktop app for accurate validation"],
  };
}

/**
 * Find best observation date in a range
 */
export async function findBestObservationDate(
  sequence: SimpleSequence,
  location: ObserverLocation,
  startDate: string,
  endDate: string,
): Promise<BestDateResult> {
  if (isTauri()) {
    return invoke<BestDateResult>("find_best_observation_date", {
      sequence,
      location,
      startDate,
      endDate,
    });
  }

  // Browser fallback - return middle date
  const start = new Date(startDate);
  const end = new Date(endDate);
  const mid = new Date((start.getTime() + end.getTime()) / 2);

  return {
    bestDate: mid.toISOString().split("T")[0],
    bestScore: 50,
    dateScores: [[mid.toISOString().split("T")[0], 50]],
  };
}

/**
 * Estimate total session time
 */
export async function estimateSessionTime(
  sequence: SimpleSequence,
  location: ObserverLocation,
  date: string,
  includeSlewTime: boolean = true,
): Promise<SessionTimeEstimate> {
  if (isTauri()) {
    return invoke<SessionTimeEstimate>("estimate_session_time", {
      sequence,
      location,
      date,
      includeSlewTime,
    });
  }

  // Browser fallback
  const imagingTime = calculateTotalRuntime(sequence);
  const autofocusTime =
    sequence.targets.filter((t) => t.autoFocusOnStart).length * 120;
  const centeringTime =
    sequence.targets.filter((t) => t.centerTarget).length * 60;
  const slewTime = includeSlewTime ? sequence.targets.length * 30 : 0;
  const totalTime = imagingTime + autofocusTime + centeringTime + slewTime;
  const availableDarkTime = 8 * 3600; // Approximate 8 hours

  return {
    imagingTimeSeconds: imagingTime,
    slewTimeSeconds: slewTime,
    autofocusTimeSeconds: autofocusTime,
    centeringTimeSeconds: centeringTime,
    totalTimeSeconds: totalTime,
    availableDarkTimeSeconds: availableDarkTime,
    fitsInNight: totalTime <= availableDarkTime,
    utilizationPercentage: Math.min(100, (totalTime / availableDarkTime) * 100),
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateTotalRuntime(sequence: SimpleSequence): number {
  return sequence.targets.reduce(
    (total, target) =>
      total + calculateTargetRuntime(target, sequence.estimatedDownloadTime),
    0,
  );
}

function calculateTargetRuntime(
  target: { exposures: Array<{ exposureTime: number; totalCount: number }> },
  downloadTime: number,
): number {
  return target.exposures.reduce(
    (total, exp) => total + (exp.exposureTime + downloadTime) * exp.totalCount,
    0,
  );
}
