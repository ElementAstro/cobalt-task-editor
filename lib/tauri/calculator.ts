/**
 * Calculator operations with Tauri/browser fallback
 */

import { isTauri, invoke } from './platform';
import type { SimpleSequence, Coordinates } from '../nina/simple-sequence-types';

export interface RaResult {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface DecResult {
  degrees: number;
  minutes: number;
  seconds: number;
  negative: boolean;
}

/**
 * Calculate sequence runtime
 */
export async function calculateSequenceRuntime(sequence: SimpleSequence): Promise<number> {
  if (isTauri()) {
    return invoke<number>('calculate_sequence_runtime', { sequence });
  }
  
  // Browser fallback
  let total = 0;
  for (const target of sequence.targets) {
    total += target.delay;
    for (const exp of target.exposures) {
      if (exp.enabled) {
        const remaining = Math.max(0, exp.totalCount - exp.progressCount);
        total += remaining * (exp.exposureTime + sequence.estimatedDownloadTime);
      }
    }
  }
  return total;
}

/**
 * Calculate sequence ETAs
 */
export async function calculateSequenceEtas(sequence: SimpleSequence): Promise<SimpleSequence> {
  if (isTauri()) {
    return invoke<SimpleSequence>('calculate_sequence_etas', { sequence });
  }
  
  // Browser fallback
  const result = { ...sequence };
  const downloadTime = sequence.estimatedDownloadTime;
  let currentTime = new Date();
  let totalDuration = 0;
  
  result.targets = sequence.targets.map(target => {
    const newTarget = { ...target };
    let targetDuration = target.delay;
    
    for (const exp of target.exposures) {
      if (exp.enabled) {
        const remaining = Math.max(0, exp.totalCount - exp.progressCount);
        targetDuration += remaining * (exp.exposureTime + downloadTime);
      }
    }
    
    newTarget.estimatedStartTime = new Date(currentTime);
    newTarget.estimatedDuration = targetDuration;
    currentTime = new Date(currentTime.getTime() + targetDuration * 1000);
    newTarget.estimatedEndTime = new Date(currentTime);
    totalDuration += targetDuration;
    
    return newTarget;
  });
  
  result.overallStartTime = new Date();
  result.overallEndTime = new Date(Date.now() + totalDuration * 1000);
  result.overallDuration = totalDuration;
  
  return result;
}

/**
 * Format duration
 */
export async function formatDuration(seconds: number): Promise<string> {
  if (isTauri()) {
    return invoke<string>('format_duration', { seconds });
  }
  
  // Browser fallback
  if (seconds < 0) return '0s';
  
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

/**
 * Calculate angular separation
 */
export async function calculateAngularSeparation(
  coord1: Coordinates,
  coord2: Coordinates
): Promise<number> {
  if (isTauri()) {
    return invoke<number>('calculate_angular_separation', { coord1, coord2 });
  }
  
  // Browser fallback
  const ra1 = (coord1.raHours + coord1.raMinutes / 60 + coord1.raSeconds / 3600) * 15 * Math.PI / 180;
  const dec1 = (coord1.decDegrees + coord1.decMinutes / 60 + coord1.decSeconds / 3600) * (coord1.negativeDec ? -1 : 1) * Math.PI / 180;
  const ra2 = (coord2.raHours + coord2.raMinutes / 60 + coord2.raSeconds / 3600) * 15 * Math.PI / 180;
  const dec2 = (coord2.decDegrees + coord2.decMinutes / 60 + coord2.decSeconds / 3600) * (coord2.negativeDec ? -1 : 1) * Math.PI / 180;
  
  const deltaRa = ra2 - ra1;
  const cosSep = Math.sin(dec1) * Math.sin(dec2) + Math.cos(dec1) * Math.cos(dec2) * Math.cos(deltaRa);
  
  return Math.acos(Math.min(1, Math.max(-1, cosSep))) * 180 / Math.PI;
}

/**
 * Convert RA to decimal
 */
export async function raToDecimal(hours: number, minutes: number, seconds: number): Promise<number> {
  if (isTauri()) {
    return invoke<number>('ra_to_decimal', { hours, minutes, seconds });
  }
  return hours + minutes / 60 + seconds / 3600;
}

/**
 * Convert decimal to RA
 */
export async function decimalToRa(decimal: number): Promise<RaResult> {
  if (isTauri()) {
    return invoke<RaResult>('decimal_to_ra', { decimal });
  }
  
  const hours = Math.floor(decimal);
  const minutesDecimal = (decimal - hours) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60 * 100) / 100;
  
  return { hours, minutes, seconds };
}

/**
 * Convert Dec to decimal
 */
export async function decToDecimal(
  degrees: number,
  minutes: number,
  seconds: number,
  negative: boolean
): Promise<number> {
  if (isTauri()) {
    return invoke<number>('dec_to_decimal', { degrees, minutes, seconds, negative });
  }
  
  const value = Math.abs(degrees) + minutes / 60 + seconds / 3600;
  return negative ? -value : value;
}

/**
 * Convert decimal to Dec
 */
export async function decimalToDec(decimal: number): Promise<DecResult> {
  if (isTauri()) {
    return invoke<DecResult>('decimal_to_dec', { decimal });
  }
  
  const negative = decimal < 0;
  const absDecimal = Math.abs(decimal);
  const degrees = Math.floor(absDecimal);
  const minutesDecimal = (absDecimal - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60 * 100) / 100;
  
  return { degrees, minutes, seconds, negative };
}

/**
 * Calculate altitude
 */
export async function calculateAltitude(
  raHours: number,
  decDegrees: number,
  latitude: number,
  longitude: number,
  datetime?: string
): Promise<number> {
  if (isTauri()) {
    return invoke<number>('calculate_altitude', { raHours, decDegrees, latitude, longitude, datetime });
  }
  
  // Browser fallback - simplified calculation
  // Note: This is a rough approximation assuming object is at meridian
  // For accurate calculations, use the Tauri backend
  void longitude; // unused in simplified calculation
  const altitude = 90 - Math.abs(latitude - decDegrees);
  return Math.max(-90, Math.min(90, altitude));
}

/**
 * Check if object is above horizon
 */
export async function isAboveHorizon(
  raHours: number,
  decDegrees: number,
  latitude: number,
  longitude: number,
  minAltitude: number,
  datetime?: string
): Promise<boolean> {
  const altitude = await calculateAltitude(raHours, decDegrees, latitude, longitude, datetime);
  return altitude >= minAltitude;
}

/**
 * Calculate moon phase
 */
export async function calculateMoonPhase(datetime?: string): Promise<number> {
  if (isTauri()) {
    return invoke<number>('calculate_moon_phase', { datetime });
  }
  
  // Browser fallback - simplified calculation
  const date = datetime ? new Date(datetime) : new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Simplified moon phase calculation
  const c = Math.floor(365.25 * year);
  const e = Math.floor(30.6 * month);
  const jd = c + e + day - 694039.09;
  const phase = jd / 29.530588853;
  
  return phase - Math.floor(phase);
}

/**
 * Calculate moon illumination
 */
export async function calculateMoonIllumination(datetime?: string): Promise<number> {
  if (isTauri()) {
    return invoke<number>('calculate_moon_illumination', { datetime });
  }
  
  const phase = await calculateMoonPhase(datetime);
  const angle = phase * 2 * Math.PI;
  return (1 - Math.cos(angle)) / 2 * 100;
}

/**
 * Parse RA string
 */
export async function parseRa(raString: string): Promise<RaResult | null> {
  if (isTauri()) {
    try {
      return await invoke<RaResult>('parse_ra', { raString });
    } catch {
      return null;
    }
  }
  
  // Browser fallback
  const match = raString.match(/(\d+)[h:\s]+(\d+)[m:\s]+(\d+\.?\d*)/);
  if (!match) return null;
  
  return {
    hours: parseInt(match[1], 10),
    minutes: parseInt(match[2], 10),
    seconds: parseFloat(match[3]),
  };
}

/**
 * Parse Dec string
 */
export async function parseDec(decString: string): Promise<DecResult | null> {
  if (isTauri()) {
    try {
      return await invoke<DecResult>('parse_dec', { decString });
    } catch {
      return null;
    }
  }
  
  // Browser fallback
  const match = decString.match(/([+-]?)(\d+)[°:\s]+(\d+)[':\s]+(\d+\.?\d*)/);
  if (!match) return null;
  
  return {
    negative: match[1] === '-',
    degrees: parseInt(match[2], 10),
    minutes: parseInt(match[3], 10),
    seconds: parseFloat(match[4]),
  };
}

/**
 * Format RA
 */
export async function formatRa(hours: number, minutes: number, seconds: number): Promise<string> {
  if (isTauri()) {
    return invoke<string>('format_ra', { hours, minutes, seconds });
  }
  
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toFixed(1)}s`;
}

/**
 * Format Dec
 */
export async function formatDec(
  degrees: number,
  minutes: number,
  seconds: number,
  negative: boolean
): Promise<string> {
  if (isTauri()) {
    return invoke<string>('format_dec', { degrees, minutes, seconds, negative });
  }
  
  const sign = negative ? '-' : '+';
  return `${sign}${degrees}° ${minutes.toString().padStart(2, '0')}' ${seconds.toFixed(1)}"`;
}
