/**
 * Astronomy calculations with Tauri/browser fallback
 */

import { isTauri, invoke } from './platform';
import type { Coordinates } from '../nina/simple-sequence-types';

export interface ObserverLocation {
  latitude: number;
  longitude: number;
  elevation: number;
  timezoneOffset: number;
}

export interface VisibilityWindow {
  startTime: string;
  endTime: string;
  maxAltitude: number;
  maxAltitudeTime: string;
  durationHours: number;
  isVisible: boolean;
}

export interface TwilightTimes {
  date: string;
  sunrise: string | null;
  sunset: string | null;
  civilDawn: string | null;
  civilDusk: string | null;
  nauticalDawn: string | null;
  nauticalDusk: string | null;
  astronomicalDawn: string | null;
  astronomicalDusk: string | null;
  isPolarDay: boolean;
  isPolarNight: boolean;
}

export interface MoonPhaseInfo {
  phase: number;
  illumination: number;
  phaseName: string;
  ageDays: number;
  nextNewMoon: string;
  nextFullMoon: string;
}

export interface ObservationQuality {
  score: number;
  altitudeScore: number;
  moonScore: number;
  twilightScore: number;
  recommendations: string[];
}

export interface CelestialPosition {
  altitude: number;
  azimuth: number;
  raHours: number;
  decDegrees: number;
  distanceKm: number | null;
}

export interface BatchCoordinateResult {
  id: string;
  altitude: number;
  azimuth: number;
  hourAngle: number;
  isVisible: boolean;
  airMass: number | null;
}

// Default observer location (can be customized)
const DEFAULT_LOCATION: ObserverLocation = {
  latitude: 0,
  longitude: 0,
  elevation: 0,
  timezoneOffset: 0,
};

/**
 * Calculate visibility window for a target
 */
export async function calculateTargetVisibility(
  coordinates: Coordinates,
  location: ObserverLocation,
  date: string,
  minAltitude: number = 20
): Promise<VisibilityWindow> {
  if (isTauri()) {
    return invoke<VisibilityWindow>('calculate_target_visibility', {
      coordinates, location, date, minAltitude
    });
  }
  
  // Browser fallback - simplified calculation
  const dec = (coordinates.negativeDec ? -1 : 1) * (
    coordinates.decDegrees + coordinates.decMinutes / 60 + coordinates.decSeconds / 3600
  );
  
  // Very simplified visibility estimate
  const maxAlt = 90 - Math.abs(location.latitude - dec);
  const isVisible = maxAlt >= minAltitude;
  
  return {
    startTime: `${date}T18:00:00Z`,
    endTime: `${date}T06:00:00Z`,
    maxAltitude: maxAlt,
    maxAltitudeTime: `${date}T00:00:00Z`,
    durationHours: isVisible ? 8 : 0,
    isVisible,
  };
}

/**
 * Calculate twilight times
 */
export async function calculateTwilightTimes(
  location: ObserverLocation,
  date: string
): Promise<TwilightTimes> {
  if (isTauri()) {
    return invoke<TwilightTimes>('calculate_twilight_times', { location, date });
  }
  
  // Browser fallback - approximate times
  return {
    date,
    sunrise: `${date}T06:00:00Z`,
    sunset: `${date}T18:00:00Z`,
    civilDawn: `${date}T05:30:00Z`,
    civilDusk: `${date}T18:30:00Z`,
    nauticalDawn: `${date}T05:00:00Z`,
    nauticalDusk: `${date}T19:00:00Z`,
    astronomicalDawn: `${date}T04:30:00Z`,
    astronomicalDusk: `${date}T19:30:00Z`,
    isPolarDay: false,
    isPolarNight: false,
  };
}

/**
 * Get Moon phase information
 */
export async function getMoonPhase(datetime?: string): Promise<MoonPhaseInfo> {
  if (isTauri()) {
    return invoke<MoonPhaseInfo>('get_moon_phase', { datetime });
  }
  
  // Browser fallback - simplified calculation
  const now = datetime ? new Date(datetime) : new Date();
  const synodicMonth = 29.530588853;
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const daysSinceNew = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = (daysSinceNew % synodicMonth) / synodicMonth;
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100;
  
  const phaseNames = [
    'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
    'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'
  ];
  const phaseName = phaseNames[Math.round(phase * 8) % 8];
  
  return {
    phase,
    illumination,
    phaseName,
    ageDays: phase * synodicMonth,
    nextNewMoon: new Date(now.getTime() + (1 - phase) * synodicMonth * 24 * 60 * 60 * 1000).toISOString(),
    nextFullMoon: new Date(now.getTime() + ((phase < 0.5 ? 0.5 - phase : 1.5 - phase) * synodicMonth * 24 * 60 * 60 * 1000)).toISOString(),
  };
}

/**
 * Calculate observation quality score
 */
export async function calculateQualityScore(
  coordinates: Coordinates,
  location: ObserverLocation,
  datetime?: string
): Promise<ObservationQuality> {
  if (isTauri()) {
    return invoke<ObservationQuality>('calculate_quality_score', {
      coordinates, location, datetime
    });
  }
  
  // Browser fallback
  const moonInfo = await getMoonPhase(datetime);
  const moonScore = 30 - (moonInfo.illumination / 100) * 20;
  
  return {
    score: 50 + moonScore,
    altitudeScore: 30,
    moonScore,
    twilightScore: 20,
    recommendations: ['Use Tauri desktop app for accurate calculations'],
  };
}

/**
 * Find optimal observation time
 */
export async function findOptimalTime(
  coordinates: Coordinates,
  location: ObserverLocation,
  date: string,
  minAltitude: number = 20
): Promise<string | null> {
  if (isTauri()) {
    return invoke<string | null>('find_optimal_time', {
      coordinates, location, date, minAltitude
    });
  }
  
  // Browser fallback - return midnight
  return `${date}T00:00:00Z`;
}

/**
 * Batch calculate positions for multiple targets
 */
export async function batchCalculatePositions(
  targets: Array<{ id: string; coordinates: Coordinates }>,
  location: ObserverLocation,
  datetime?: string,
  minAltitude: number = 20
): Promise<BatchCoordinateResult[]> {
  if (isTauri()) {
    const targetTuples = targets.map(t => [t.id, t.coordinates] as [string, Coordinates]);
    return invoke<BatchCoordinateResult[]>('batch_calculate_target_positions', {
      targets: targetTuples, location, datetime, minAltitude
    });
  }
  
  // Browser fallback
  return targets.map(t => ({
    id: t.id,
    altitude: 45,
    azimuth: 180,
    hourAngle: 0,
    isVisible: true,
    airMass: 1.4,
  }));
}

/**
 * Get Sun position
 */
export async function getSunPosition(
  location: ObserverLocation,
  datetime?: string
): Promise<CelestialPosition> {
  if (isTauri()) {
    return invoke<CelestialPosition>('get_sun_position', { location, datetime });
  }
  
  // Browser fallback
  return {
    altitude: -10,
    azimuth: 270,
    raHours: 12,
    decDegrees: 0,
    distanceKm: 149597870.7,
  };
}

/**
 * Get Moon position
 */
export async function getMoonPosition(
  location: ObserverLocation,
  datetime?: string
): Promise<CelestialPosition> {
  if (isTauri()) {
    return invoke<CelestialPosition>('get_moon_position', { location, datetime });
  }
  
  // Browser fallback
  return {
    altitude: 30,
    azimuth: 90,
    raHours: 6,
    decDegrees: 20,
    distanceKm: 384400,
  };
}

/**
 * Calculate altitude and azimuth
 */
export async function calculateAltAz(
  coordinates: Coordinates,
  location: ObserverLocation,
  datetime?: string
): Promise<{ altitude: number; azimuth: number }> {
  if (isTauri()) {
    return invoke<[number, number]>('calculate_alt_az', {
      coordinates, location, datetime
    }).then(([altitude, azimuth]) => ({ altitude, azimuth }));
  }
  
  // Browser fallback
  return { altitude: 45, azimuth: 180 };
}

/**
 * Get current Moon illumination
 */
export async function getMoonIlluminationNow(): Promise<number> {
  if (isTauri()) {
    return invoke<number>('get_moon_illumination_now');
  }
  
  const moonInfo = await getMoonPhase();
  return moonInfo.illumination;
}

/**
 * Calculate visibility for date range
 */
export async function calculateVisibilityRange(
  coordinates: Coordinates,
  location: ObserverLocation,
  startDate: string,
  endDate: string,
  minAltitude: number = 20
): Promise<VisibilityWindow[]> {
  if (isTauri()) {
    return invoke<VisibilityWindow[]>('calculate_visibility_range', {
      coordinates, location, startDate, endDate, minAltitude
    });
  }
  
  // Browser fallback - generate for each day
  const results: VisibilityWindow[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    results.push(await calculateTargetVisibility(coordinates, location, dateStr, minAltitude));
  }
  
  return results;
}

/**
 * Calculate altitude curve for plotting
 */
export async function calculateAltitudeCurve(
  coordinates: Coordinates,
  location: ObserverLocation,
  date: string,
  intervalMinutes: number = 15
): Promise<Array<{ time: string; altitude: number; azimuth: number }>> {
  if (isTauri()) {
    return invoke<Array<[string, number, number]>>('calculate_altitude_curve', {
      coordinates, location, date, intervalMinutes
    }).then(data => data.map(([time, altitude, azimuth]) => ({ time, altitude, azimuth })));
  }
  
  // Browser fallback - generate sine curve
  const results: Array<{ time: string; altitude: number; azimuth: number }> = [];
  for (let i = 0; i < 24 * 60; i += intervalMinutes) {
    const hour = Math.floor(i / 60);
    const minute = i % 60;
    const time = `${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00Z`;
    const altitude = 45 * Math.sin((i / (24 * 60)) * 2 * Math.PI - Math.PI / 2);
    const azimuth = (i / (24 * 60)) * 360;
    results.push({ time, altitude, azimuth });
  }
  return results;
}

/**
 * Check if target is currently visible
 */
export async function isTargetVisible(
  coordinates: Coordinates,
  location: ObserverLocation,
  minAltitude: number = 20
): Promise<boolean> {
  if (isTauri()) {
    return invoke<boolean>('is_target_visible', { coordinates, location, minAltitude });
  }
  
  // Browser fallback
  return true;
}

/**
 * Calculate air mass
 */
export async function calculateAirMass(
  coordinates: Coordinates,
  location: ObserverLocation,
  datetime?: string
): Promise<number | null> {
  if (isTauri()) {
    return invoke<number | null>('calculate_air_mass', { coordinates, location, datetime });
  }
  
  // Browser fallback
  return 1.5;
}

/**
 * Get default observer location
 */
export function getDefaultLocation(): ObserverLocation {
  return { ...DEFAULT_LOCATION };
}

/**
 * Create observer location
 */
export function createLocation(
  latitude: number,
  longitude: number,
  elevation: number = 0,
  timezoneOffset: number = 0
): ObserverLocation {
  return { latitude, longitude, elevation, timezoneOffset };
}
