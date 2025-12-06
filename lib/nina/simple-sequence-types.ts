// NINA Simple Sequence Editor - Type Definitions
// Based on N.I.N.A. SimpleSequenceVM and related classes

// ============================================================================
// Enums
// ============================================================================

export enum SequenceMode {
  STANDARD = "STANDARD",
  ROTATE = "ROTATE",
}

export enum ImageType {
  LIGHT = "LIGHT",
  DARK = "DARK",
  BIAS = "BIAS",
  FLAT = "FLAT",
  SNAPSHOT = "SNAPSHOT",
}

export enum SequenceEntityStatus {
  CREATED = "CREATED",
  RUNNING = "RUNNING",
  FINISHED = "FINISHED",
  FAILED = "FAILED",
  SKIPPED = "SKIPPED",
  DISABLED = "DISABLED",
}

// ============================================================================
// Binning Mode
// ============================================================================

export interface BinningMode {
  x: number;
  y: number;
}

export const DEFAULT_BINNING_OPTIONS: BinningMode[] = [
  { x: 1, y: 1 },
  { x: 2, y: 2 },
  { x: 3, y: 3 },
  { x: 4, y: 4 },
];

// ============================================================================
// Filter Info
// ============================================================================

export interface FilterInfo {
  name: string;
  position: number;
  focusOffset?: number;
  autoFocusExposureTime?: number;
}

export const DEFAULT_FILTERS: FilterInfo[] = [
  { name: "L", position: 0 },
  { name: "R", position: 1 },
  { name: "G", position: 2 },
  { name: "B", position: 3 },
  { name: "Ha", position: 4 },
  { name: "OIII", position: 5 },
  { name: "SII", position: 6 },
];

// ============================================================================
// Coordinates
// ============================================================================

export interface Coordinates {
  raHours: number;
  raMinutes: number;
  raSeconds: number;
  decDegrees: number;
  decMinutes: number;
  decSeconds: number;
  negativeDec: boolean;
}

export function createDefaultCoordinates(): Coordinates {
  return {
    raHours: 0,
    raMinutes: 0,
    raSeconds: 0,
    decDegrees: 0,
    decMinutes: 0,
    decSeconds: 0,
    negativeDec: false,
  };
}

export function formatRA(coords: Coordinates): string {
  return `${coords.raHours.toString().padStart(2, "0")}h ${coords.raMinutes.toString().padStart(2, "0")}m ${coords.raSeconds.toFixed(1)}s`;
}

export function formatDec(coords: Coordinates): string {
  const sign = coords.negativeDec ? "-" : "+";
  return `${sign}${Math.abs(coords.decDegrees).toString().padStart(2, "0")}° ${coords.decMinutes.toString().padStart(2, "0")}' ${coords.decSeconds.toFixed(1)}"`;
}

export function parseHMS(
  hms: string,
): { hours: number; minutes: number; seconds: number } | null {
  // Parse formats like "00h 42m 44.3s" or "00:42:44.3"
  const match = hms.match(/(\d+)[h:\s]+(\d+)[m:\s]+(\d+\.?\d*)/);
  if (!match) return null;
  return {
    hours: parseInt(match[1], 10),
    minutes: parseInt(match[2], 10),
    seconds: parseFloat(match[3]),
  };
}

export function parseDMS(dms: string): {
  degrees: number;
  minutes: number;
  seconds: number;
  negative: boolean;
} | null {
  // Parse formats like "+41° 16' 9.0"" or "41:16:09.0"
  const match = dms.match(/([+-]?)(\d+)[°:\s]+(\d+)[':\s]+(\d+\.?\d*)/);
  if (!match) return null;
  return {
    negative: match[1] === "-",
    degrees: parseInt(match[2], 10),
    minutes: parseInt(match[3], 10),
    seconds: parseFloat(match[4]),
  };
}

// ============================================================================
// Simple Exposure
// ============================================================================

export interface SimpleExposure {
  id: string;
  enabled: boolean;
  status: SequenceEntityStatus;

  // Exposure settings
  exposureTime: number; // seconds
  imageType: ImageType;
  filter: FilterInfo | null;
  binning: BinningMode;
  gain: number; // -1 = camera default
  offset: number; // -1 = camera default

  // Progress
  totalCount: number;
  progressCount: number;

  // Dithering
  dither: boolean;
  ditherEvery: number;
}

export function createDefaultExposure(): SimpleExposure {
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

// ============================================================================
// Target (Simple DSO Container)
// ============================================================================

export interface SimpleTarget {
  id: string;
  name: string;
  status: SequenceEntityStatus;
  fileName?: string;

  // Target info
  targetName: string;
  coordinates: Coordinates;
  positionAngle: number;
  rotation: number;

  // Target options
  delay: number; // seconds before starting
  mode: SequenceMode;
  slewToTarget: boolean;
  centerTarget: boolean;
  rotateTarget: boolean;
  startGuiding: boolean;

  // Autofocus options
  autoFocusOnStart: boolean;
  autoFocusOnFilterChange: boolean;
  autoFocusAfterSetTime: boolean;
  autoFocusSetTime: number; // minutes
  autoFocusAfterSetExposures: boolean;
  autoFocusSetExposures: number;
  autoFocusAfterTemperatureChange: boolean;
  autoFocusAfterTemperatureChangeAmount: number; // degrees
  autoFocusAfterHFRChange: boolean;
  autoFocusAfterHFRChangeAmount: number; // percentage

  // Exposures
  exposures: SimpleExposure[];

  // ETA
  estimatedStartTime?: Date;
  estimatedEndTime?: Date;
  estimatedDuration?: number; // seconds
}

export function createDefaultTarget(): SimpleTarget {
  return {
    id: crypto.randomUUID(),
    name: "Target",
    status: SequenceEntityStatus.CREATED,
    targetName: "Target",
    coordinates: createDefaultCoordinates(),
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
    exposures: [createDefaultExposure()],
  };
}

// ============================================================================
// Start Options
// ============================================================================

export interface StartOptions {
  coolCameraAtSequenceStart: boolean;
  coolCameraTemperature: number;
  coolCameraDuration: number; // seconds
  unparkMountAtSequenceStart: boolean;
  doMeridianFlip: boolean;
}

export function createDefaultStartOptions(): StartOptions {
  return {
    coolCameraAtSequenceStart: true,
    coolCameraTemperature: -10,
    coolCameraDuration: 600,
    unparkMountAtSequenceStart: true,
    doMeridianFlip: true,
  };
}

// ============================================================================
// End Options
// ============================================================================

export interface EndOptions {
  warmCamAtSequenceEnd: boolean;
  warmCameraDuration: number; // seconds
  parkMountAtSequenceEnd: boolean;
}

export function createDefaultEndOptions(): EndOptions {
  return {
    warmCamAtSequenceEnd: true,
    warmCameraDuration: 600,
    parkMountAtSequenceEnd: true,
  };
}

// ============================================================================
// Simple Sequence (Target Set)
// ============================================================================

export interface SimpleSequence {
  id: string;
  title: string;
  savePath?: string;
  isDirty: boolean;

  // Start/End options
  startOptions: StartOptions;
  endOptions: EndOptions;

  // Targets
  targets: SimpleTarget[];
  selectedTargetId: string | null;
  activeTargetId: string | null;

  // Status
  isRunning: boolean;

  // ETA
  overallStartTime?: Date;
  overallEndTime?: Date;
  overallDuration?: number; // seconds

  // Download time estimation
  estimatedDownloadTime: number; // seconds
}

export function createDefaultSimpleSequence(): SimpleSequence {
  const firstTarget = createDefaultTarget();
  return {
    id: crypto.randomUUID(),
    title: "Target Set",
    isDirty: false,
    startOptions: createDefaultStartOptions(),
    endOptions: createDefaultEndOptions(),
    targets: [firstTarget],
    selectedTargetId: firstTarget.id,
    activeTargetId: firstTarget.id,
    isRunning: false,
    estimatedDownloadTime: 5,
  };
}

// ============================================================================
// CSV Import Types (Telescopius format)
// ============================================================================

export interface TelescopiusTarget {
  pane?: string;
  familiarName?: string;
  catalogueEntry?: string;
  ra: string;
  dec: string;
  positionAngle?: number;
}

// ============================================================================
// ETA Calculation
// ============================================================================

export function calculateExposureRuntime(
  exposure: SimpleExposure,
  downloadTime: number,
): number {
  if (!exposure.enabled) return 0;
  const remaining = exposure.totalCount - exposure.progressCount;
  if (remaining <= 0) return 0;
  return remaining * (exposure.exposureTime + downloadTime);
}

export function calculateTargetRuntime(
  target: SimpleTarget,
  downloadTime: number,
): number {
  let total = target.delay;
  for (const exposure of target.exposures) {
    total += calculateExposureRuntime(exposure, downloadTime);
  }
  return total;
}

export function formatDuration(seconds: number): string {
  if (seconds < 0) return "0s";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// ============================================================================
// Export Types
// ============================================================================

export interface CaptureSequenceExport {
  TargetName: string;
  Coordinates: {
    RAHours: number;
    RAMinutes: number;
    RASeconds: number;
    DecDegrees: number;
    DecMinutes: number;
    DecSeconds: number;
    NegativeDec: boolean;
  };
  PositionAngle: number;
  Delay: number;
  Mode: string;
  SlewToTarget: boolean;
  CenterTarget: boolean;
  RotateTarget: boolean;
  StartGuiding: boolean;
  AutoFocusOnStart: boolean;
  AutoFocusOnFilterChange: boolean;
  AutoFocusAfterSetTime: boolean;
  AutoFocusSetTime: number;
  AutoFocusAfterSetExposures: boolean;
  AutoFocusSetExposures: number;
  AutoFocusAfterTemperatureChange: boolean;
  AutoFocusAfterTemperatureChangeAmount: number;
  AutoFocusAfterHFRChange: boolean;
  AutoFocusAfterHFRChangeAmount: number;
  Items: CaptureSequenceItemExport[];
}

export interface CaptureSequenceItemExport {
  Enabled: boolean;
  ExposureTime: number;
  ImageType: string;
  FilterType: { Name: string; Position: number } | null;
  Binning: { X: number; Y: number };
  Gain: number;
  Offset: number;
  TotalExposureCount: number;
  ProgressExposureCount: number;
  Dither: boolean;
  DitherAmount: number;
}

export interface TargetSetExport {
  Title: string;
  StartOptions: {
    CoolCameraAtSequenceStart: boolean;
    CoolCameraTemperature: number;
    CoolCameraDuration: number;
    UnparkMountAtSequenceStart: boolean;
    DoMeridianFlip: boolean;
  };
  EndOptions: {
    WarmCamAtSequenceEnd: boolean;
    WarmCameraDuration: number;
    ParkMountAtSequenceEnd: boolean;
  };
  Targets: CaptureSequenceExport[];
}
