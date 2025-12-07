//! Advanced astronomy calculation service
//!
//! Provides high-performance astronomical calculations including:
//! - Visibility windows
//! - Optimal observation times
//! - Sun/Moon positions
//! - Twilight calculations

use chrono::{DateTime, Datelike, Duration, NaiveDate, NaiveTime, Timelike, Utc};
use serde::{Deserialize, Serialize};
use std::f64::consts::PI;

use crate::models::Coordinates;

/// Observer location
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ObserverLocation {
    pub latitude: f64,
    pub longitude: f64,
    pub elevation: f64,       // meters
    pub timezone_offset: i32, // hours from UTC
}

impl Default for ObserverLocation {
    fn default() -> Self {
        Self {
            latitude: 0.0,
            longitude: 0.0,
            elevation: 0.0,
            timezone_offset: 0,
        }
    }
}

/// Visibility window for a target
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VisibilityWindow {
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub max_altitude: f64,
    pub max_altitude_time: DateTime<Utc>,
    pub duration_hours: f64,
    pub is_visible: bool,
}

/// Sun/Moon position
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CelestialPosition {
    pub altitude: f64,
    pub azimuth: f64,
    pub ra_hours: f64,
    pub dec_degrees: f64,
    pub distance_km: Option<f64>,
}

/// Twilight times
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TwilightTimes {
    pub date: String,
    pub sunrise: Option<DateTime<Utc>>,
    pub sunset: Option<DateTime<Utc>>,
    pub civil_dawn: Option<DateTime<Utc>>,
    pub civil_dusk: Option<DateTime<Utc>>,
    pub nautical_dawn: Option<DateTime<Utc>>,
    pub nautical_dusk: Option<DateTime<Utc>>,
    pub astronomical_dawn: Option<DateTime<Utc>>,
    pub astronomical_dusk: Option<DateTime<Utc>>,
    pub is_polar_day: bool,
    pub is_polar_night: bool,
}

/// Moon phase information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MoonPhaseInfo {
    pub phase: f64,        // 0-1
    pub illumination: f64, // percentage
    pub phase_name: String,
    pub age_days: f64,
    pub next_new_moon: DateTime<Utc>,
    pub next_full_moon: DateTime<Utc>,
}

/// Observation quality score
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ObservationQuality {
    pub score: f64, // 0-100
    pub altitude_score: f64,
    pub moon_score: f64,
    pub twilight_score: f64,
    pub recommendations: Vec<String>,
}

/// Batch coordinate result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchCoordinateResult {
    pub id: String,
    pub altitude: f64,
    pub azimuth: f64,
    pub hour_angle: f64,
    pub is_visible: bool,
    pub air_mass: Option<f64>,
}

// ============================================================================
// Constants
// ============================================================================

#[allow(dead_code)]
const DEG_TO_RAD: f64 = PI / 180.0;
#[allow(dead_code)]
const RAD_TO_DEG: f64 = 180.0 / PI;
const J2000: f64 = 2451545.0;
const SYNODIC_MONTH: f64 = 29.530588853;

// ============================================================================
// Julian Date Calculations
// ============================================================================

/// Convert DateTime to Julian Day
pub fn datetime_to_jd(dt: DateTime<Utc>) -> f64 {
    let year = dt.year();
    let month = dt.month() as i32;
    let day = dt.day() as f64;
    let hour = dt.hour() as f64;
    let minute = dt.minute() as f64;
    let second = dt.second() as f64;

    let day_fraction = day + (hour + minute / 60.0 + second / 3600.0) / 24.0;

    let (y, m) = if month <= 2 {
        (year - 1, month + 12)
    } else {
        (year, month)
    };

    let a = (y as f64 / 100.0).floor();
    let b = 2.0 - a + (a / 4.0).floor();

    (365.25 * (y as f64 + 4716.0)).floor() + (30.6001 * (m as f64 + 1.0)).floor() + day_fraction + b
        - 1524.5
}

/// Convert Julian Day to DateTime
pub fn jd_to_datetime(jd: f64) -> DateTime<Utc> {
    let z = (jd + 0.5).floor();
    let f = jd + 0.5 - z;

    let a = if z < 2299161.0 {
        z
    } else {
        let alpha = ((z - 1867216.25) / 36524.25).floor();
        z + 1.0 + alpha - (alpha / 4.0).floor()
    };

    let b = a + 1524.0;
    let c = ((b - 122.1) / 365.25).floor();
    let d = (365.25 * c).floor();
    let e = ((b - d) / 30.6001).floor();

    let day = b - d - (30.6001 * e).floor();
    let month = if e < 14.0 { e - 1.0 } else { e - 13.0 };
    let year = if month > 2.0 { c - 4716.0 } else { c - 4715.0 };

    let day_frac = f * 24.0;
    let hour = day_frac.floor();
    let min_frac = (day_frac - hour) * 60.0;
    let minute = min_frac.floor();
    let second = (min_frac - minute) * 60.0;

    let naive_date = NaiveDate::from_ymd_opt(year as i32, month as u32, day as u32)
        .unwrap_or_else(|| NaiveDate::from_ymd_opt(2000, 1, 1).unwrap());
    let naive_time = NaiveTime::from_hms_opt(hour as u32, minute as u32, second as u32)
        .unwrap_or_else(|| NaiveTime::from_hms_opt(0, 0, 0).unwrap());

    DateTime::from_naive_utc_and_offset(naive_date.and_time(naive_time), Utc)
}

// ============================================================================
// Sidereal Time
// ============================================================================

/// Calculate Greenwich Mean Sidereal Time in degrees
pub fn gmst(jd: f64) -> f64 {
    let t = (jd - J2000) / 36525.0;
    let gmst = 280.46061837 + 360.98564736629 * (jd - J2000) + 0.000387933 * t * t
        - t * t * t / 38710000.0;
    gmst.rem_euclid(360.0)
}

/// Calculate Local Sidereal Time in degrees
pub fn lst(jd: f64, longitude: f64) -> f64 {
    (gmst(jd) + longitude).rem_euclid(360.0)
}

// ============================================================================
// Coordinate Transformations
// ============================================================================

/// Calculate altitude and azimuth from RA/Dec
pub fn ra_dec_to_alt_az(
    ra_hours: f64,
    dec_degrees: f64,
    latitude: f64,
    longitude: f64,
    jd: f64,
) -> (f64, f64) {
    let lst_deg = lst(jd, longitude);
    let ha = (lst_deg - ra_hours * 15.0).to_radians();
    let dec = dec_degrees.to_radians();
    let lat = latitude.to_radians();

    let sin_alt = lat.sin() * dec.sin() + lat.cos() * dec.cos() * ha.cos();
    let altitude = sin_alt.asin().to_degrees();

    let cos_az = (dec.sin() - lat.sin() * sin_alt) / (lat.cos() * sin_alt.acos().sin().max(0.0001));
    let mut azimuth = cos_az.clamp(-1.0, 1.0).acos().to_degrees();

    if ha.sin() > 0.0 {
        azimuth = 360.0 - azimuth;
    }

    (altitude, azimuth)
}

/// Calculate hour angle
pub fn hour_angle(ra_hours: f64, longitude: f64, jd: f64) -> f64 {
    let lst_deg = lst(jd, longitude);
    let ha = lst_deg - ra_hours * 15.0;
    if ha < -180.0 {
        ha + 360.0
    } else if ha > 180.0 {
        ha - 360.0
    } else {
        ha
    }
}

/// Calculate air mass (Kasten-Young formula)
pub fn air_mass(altitude: f64) -> Option<f64> {
    if altitude <= 0.0 {
        return None;
    }
    let zenith_angle = 90.0 - altitude;
    let z_rad = zenith_angle.to_radians();
    Some(1.0 / (z_rad.cos() + 0.50572 * (96.07995 - zenith_angle).powf(-1.6364)))
}

// ============================================================================
// Sun Position
// ============================================================================

/// Calculate Sun position
pub fn sun_position(jd: f64) -> (f64, f64) {
    let n = jd - J2000;
    let l = (280.460 + 0.9856474 * n).rem_euclid(360.0);
    let g = (357.528 + 0.9856003 * n).rem_euclid(360.0).to_radians();

    let lambda = l + 1.915 * g.sin() + 0.020 * (2.0 * g).sin();
    let epsilon = 23.439 - 0.0000004 * n;

    let lambda_rad = lambda.to_radians();
    let epsilon_rad = epsilon.to_radians();

    let ra = (epsilon_rad.cos() * lambda_rad.sin()).atan2(lambda_rad.cos());
    let dec = (epsilon_rad.sin() * lambda_rad.sin()).asin();

    // Normalize RA to 0-24 hours
    let ra_hours = (ra.to_degrees() / 15.0).rem_euclid(24.0);
    (ra_hours, dec.to_degrees())
}

/// Calculate Sun altitude at given location and time
pub fn sun_altitude(location: &ObserverLocation, jd: f64) -> f64 {
    let (ra, dec) = sun_position(jd);
    let (alt, _) = ra_dec_to_alt_az(ra, dec, location.latitude, location.longitude, jd);
    alt
}

// ============================================================================
// Moon Position
// ============================================================================

/// Calculate Moon position (simplified)
pub fn moon_position(jd: f64) -> (f64, f64, f64) {
    let t = (jd - J2000) / 36525.0;

    // Mean longitude
    let l0 = (218.3164477 + 481267.88123421 * t).rem_euclid(360.0);
    // Mean anomaly
    let m = (134.9633964 + 477198.8675055 * t)
        .rem_euclid(360.0)
        .to_radians();
    // Mean elongation
    let d = (297.8501921 + 445267.1114034 * t)
        .rem_euclid(360.0)
        .to_radians();
    // Argument of latitude
    let f = (93.272095 + 483202.0175233 * t)
        .rem_euclid(360.0)
        .to_radians();

    // Longitude correction
    let dl = 6.289 * m.sin()
        + 1.274 * (2.0 * d - m).sin()
        + 0.658 * (2.0 * d).sin()
        + 0.214 * (2.0 * m).sin()
        - 0.186 * (d).sin();

    // Latitude
    let b = 5.128 * f.sin();

    let lambda = (l0 + dl).to_radians();
    let beta = b.to_radians();
    let epsilon = 23.439_f64.to_radians();

    // Convert to RA/Dec
    let ra = (epsilon.cos() * lambda.sin() * beta.cos() - epsilon.sin() * beta.sin())
        .atan2(lambda.cos() * beta.cos());
    let dec = (epsilon.sin() * lambda.sin() * beta.cos() + epsilon.cos() * beta.sin()).asin();

    // Distance in km (simplified)
    let distance = 385001.0 - 20905.0 * m.cos();

    // Normalize RA to 0-24 hours
    let ra_hours = (ra.to_degrees() / 15.0).rem_euclid(24.0);
    (ra_hours, dec.to_degrees(), distance)
}

/// Calculate Moon phase
pub fn moon_phase(jd: f64) -> f64 {
    let days_since_new = (jd - 2451550.1).rem_euclid(SYNODIC_MONTH);
    days_since_new / SYNODIC_MONTH
}

/// Calculate Moon illumination percentage
pub fn moon_illumination(jd: f64) -> f64 {
    let phase = moon_phase(jd);
    let angle = phase * 2.0 * PI;
    (1.0 - angle.cos()) / 2.0 * 100.0
}

/// Get Moon phase name
pub fn moon_phase_name(phase: f64) -> String {
    match (phase * 8.0).round() as i32 % 8 {
        0 => "New Moon".to_string(),
        1 => "Waxing Crescent".to_string(),
        2 => "First Quarter".to_string(),
        3 => "Waxing Gibbous".to_string(),
        4 => "Full Moon".to_string(),
        5 => "Waning Gibbous".to_string(),
        6 => "Last Quarter".to_string(),
        7 => "Waning Crescent".to_string(),
        _ => "Unknown".to_string(),
    }
}

// ============================================================================
// Twilight Calculations
// ============================================================================

/// Find time when Sun reaches a specific altitude
fn find_sun_altitude_time(
    location: &ObserverLocation,
    date: NaiveDate,
    target_altitude: f64,
    rising: bool,
) -> Option<DateTime<Utc>> {
    let jd_noon = datetime_to_jd(DateTime::from_naive_utc_and_offset(
        date.and_hms_opt(12, 0, 0).unwrap(),
        Utc,
    ));

    // Binary search for the time
    let (mut low, mut high) = if rising {
        (jd_noon - 0.5, jd_noon)
    } else {
        (jd_noon, jd_noon + 0.5)
    };

    // Check if Sun ever reaches target altitude
    let alt_low = sun_altitude(location, low);
    let alt_high = sun_altitude(location, high);

    if rising {
        if alt_low > target_altitude || alt_high < target_altitude {
            return None;
        }
    } else if alt_low < target_altitude || alt_high > target_altitude {
        return None;
    }

    for _ in 0..50 {
        let mid = (low + high) / 2.0;
        let alt = sun_altitude(location, mid);

        if (alt - target_altitude).abs() < 0.001 {
            return Some(jd_to_datetime(mid));
        }

        if rising {
            if alt < target_altitude {
                low = mid;
            } else {
                high = mid;
            }
        } else if alt > target_altitude {
            low = mid;
        } else {
            high = mid;
        }
    }

    Some(jd_to_datetime((low + high) / 2.0))
}

/// Calculate twilight times for a date
pub fn calculate_twilight(location: &ObserverLocation, date: NaiveDate) -> TwilightTimes {
    let sunrise = find_sun_altitude_time(location, date, -0.833, true);
    let sunset = find_sun_altitude_time(location, date, -0.833, false);
    let civil_dawn = find_sun_altitude_time(location, date, -6.0, true);
    let civil_dusk = find_sun_altitude_time(location, date, -6.0, false);
    let nautical_dawn = find_sun_altitude_time(location, date, -12.0, true);
    let nautical_dusk = find_sun_altitude_time(location, date, -12.0, false);
    let astronomical_dawn = find_sun_altitude_time(location, date, -18.0, true);
    let astronomical_dusk = find_sun_altitude_time(location, date, -18.0, false);

    // Check for polar day/night
    let jd_noon = datetime_to_jd(DateTime::from_naive_utc_and_offset(
        date.and_hms_opt(12, 0, 0).unwrap(),
        Utc,
    ));
    let noon_alt = sun_altitude(location, jd_noon);
    let midnight_alt = sun_altitude(location, jd_noon - 0.5);

    let is_polar_day = midnight_alt > -0.833;
    let is_polar_night = noon_alt < -0.833;

    TwilightTimes {
        date: date.format("%Y-%m-%d").to_string(),
        sunrise,
        sunset,
        civil_dawn,
        civil_dusk,
        nautical_dawn,
        nautical_dusk,
        astronomical_dawn,
        astronomical_dusk,
        is_polar_day,
        is_polar_night,
    }
}

// ============================================================================
// Visibility Calculations
// ============================================================================

/// Calculate visibility window for a target
pub fn calculate_visibility_window(
    coords: &Coordinates,
    location: &ObserverLocation,
    date: NaiveDate,
    min_altitude: f64,
) -> VisibilityWindow {
    let ra = coords.ra_to_decimal();
    let dec = coords.dec_to_decimal();

    let jd_start = datetime_to_jd(DateTime::from_naive_utc_and_offset(
        date.and_hms_opt(0, 0, 0).unwrap(),
        Utc,
    ));

    let mut start_time: Option<DateTime<Utc>> = None;
    let mut end_time: Option<DateTime<Utc>> = None;
    let mut max_altitude = -90.0;
    let mut max_altitude_time = jd_to_datetime(jd_start);
    let mut was_visible = false;

    // Sample every 10 minutes
    for i in 0..=144 {
        let jd = jd_start + (i as f64) / 144.0;
        let (alt, _) = ra_dec_to_alt_az(ra, dec, location.latitude, location.longitude, jd);
        let is_visible = alt >= min_altitude;

        if alt > max_altitude {
            max_altitude = alt;
            max_altitude_time = jd_to_datetime(jd);
        }

        if is_visible && !was_visible && start_time.is_none() {
            start_time = Some(jd_to_datetime(jd));
        }

        if !is_visible && was_visible && end_time.is_none() {
            end_time = Some(jd_to_datetime(jd));
        }

        was_visible = is_visible;
    }

    // Handle case where target is visible at end of day
    if was_visible && end_time.is_none() {
        end_time = Some(jd_to_datetime(jd_start + 1.0));
    }

    let duration_hours = match (&start_time, &end_time) {
        (Some(s), Some(e)) => (*e - *s).num_minutes() as f64 / 60.0,
        _ => 0.0,
    };

    VisibilityWindow {
        start_time: start_time.unwrap_or_else(|| jd_to_datetime(jd_start)),
        end_time: end_time.unwrap_or_else(|| jd_to_datetime(jd_start)),
        max_altitude,
        max_altitude_time,
        duration_hours,
        is_visible: start_time.is_some(),
    }
}

/// Calculate observation quality score
pub fn calculate_observation_quality(
    coords: &Coordinates,
    location: &ObserverLocation,
    datetime: DateTime<Utc>,
) -> ObservationQuality {
    let jd = datetime_to_jd(datetime);
    let ra = coords.ra_to_decimal();
    let dec = coords.dec_to_decimal();

    let (target_alt, _) = ra_dec_to_alt_az(ra, dec, location.latitude, location.longitude, jd);
    let sun_alt = sun_altitude(location, jd);
    let (moon_ra, moon_dec, _) = moon_position(jd);
    let moon_illum = moon_illumination(jd);

    // Calculate angular separation from Moon
    let moon_coords = Coordinates::from_decimal(moon_ra, moon_dec);
    let moon_sep = crate::models::coordinates::angular_separation(coords, &moon_coords);

    let mut recommendations = Vec::new();

    // Altitude score (0-40 points)
    let altitude_score = if target_alt < 0.0 {
        0.0
    } else if target_alt < 30.0 {
        target_alt / 30.0 * 20.0
    } else if target_alt < 60.0 {
        20.0 + (target_alt - 30.0) / 30.0 * 20.0
    } else {
        40.0
    };

    if target_alt < 30.0 {
        recommendations
            .push("Target altitude is low, consider waiting for higher altitude".to_string());
    }

    // Twilight score (0-30 points)
    let twilight_score = if sun_alt > 0.0 {
        0.0
    } else if sun_alt > -6.0 {
        5.0
    } else if sun_alt > -12.0 {
        15.0
    } else if sun_alt > -18.0 {
        25.0
    } else {
        30.0
    };

    if sun_alt > -18.0 {
        recommendations.push("Not fully dark yet, wait for astronomical twilight".to_string());
    }

    // Moon score (0-30 points)
    let moon_score = if moon_illum < 10.0 {
        30.0
    } else if moon_sep > 90.0 {
        25.0
    } else if moon_sep > 60.0 {
        20.0 - moon_illum / 100.0 * 5.0
    } else if moon_sep > 30.0 {
        15.0 - moon_illum / 100.0 * 10.0
    } else {
        5.0 - moon_illum / 100.0 * 5.0
    };

    if moon_illum > 50.0 && moon_sep < 60.0 {
        recommendations.push("Bright Moon nearby, consider imaging narrowband".to_string());
    }

    let score = altitude_score + twilight_score + moon_score;

    ObservationQuality {
        score,
        altitude_score,
        moon_score,
        twilight_score,
        recommendations,
    }
}

/// Batch calculate coordinates
pub fn batch_calculate_positions(
    targets: &[(String, Coordinates)],
    location: &ObserverLocation,
    datetime: DateTime<Utc>,
    min_altitude: f64,
) -> Vec<BatchCoordinateResult> {
    let jd = datetime_to_jd(datetime);

    targets
        .iter()
        .map(|(id, coords)| {
            let ra = coords.ra_to_decimal();
            let dec = coords.dec_to_decimal();
            let (alt, az) = ra_dec_to_alt_az(ra, dec, location.latitude, location.longitude, jd);
            let ha = hour_angle(ra, location.longitude, jd);

            BatchCoordinateResult {
                id: id.clone(),
                altitude: alt,
                azimuth: az,
                hour_angle: ha,
                is_visible: alt >= min_altitude,
                air_mass: air_mass(alt),
            }
        })
        .collect()
}

/// Find optimal observation time for a target
pub fn find_optimal_observation_time(
    coords: &Coordinates,
    location: &ObserverLocation,
    date: NaiveDate,
    min_altitude: f64,
) -> Option<DateTime<Utc>> {
    let twilight = calculate_twilight(location, date);

    // Get astronomical darkness window
    let dark_start = twilight.astronomical_dusk?;
    let dark_end = twilight.astronomical_dawn.map(|d| d + Duration::days(1))?;

    let ra = coords.ra_to_decimal();
    let dec = coords.dec_to_decimal();

    let mut best_time: Option<DateTime<Utc>> = None;
    let mut best_score = -1.0;

    // Sample every 15 minutes during darkness
    let mut current = dark_start;
    while current < dark_end {
        let jd = datetime_to_jd(current);
        let (alt, _) = ra_dec_to_alt_az(ra, dec, location.latitude, location.longitude, jd);

        if alt >= min_altitude {
            let quality = calculate_observation_quality(coords, location, current);
            if quality.score > best_score {
                best_score = quality.score;
                best_time = Some(current);
            }
        }

        current += Duration::minutes(15);
    }

    best_time
}

/// Get Moon phase info
pub fn get_moon_phase_info(datetime: DateTime<Utc>) -> MoonPhaseInfo {
    let jd = datetime_to_jd(datetime);
    let phase = moon_phase(jd);
    let illumination = moon_illumination(jd);
    let phase_name = moon_phase_name(phase);
    let age_days = phase * SYNODIC_MONTH;

    // Calculate next new and full moon
    let days_to_new = (1.0 - phase) * SYNODIC_MONTH;
    let days_to_full = if phase < 0.5 {
        (0.5 - phase) * SYNODIC_MONTH
    } else {
        (1.5 - phase) * SYNODIC_MONTH
    };

    let next_new_moon = datetime + Duration::days(days_to_new as i64);
    let next_full_moon = datetime + Duration::days(days_to_full as i64);

    MoonPhaseInfo {
        phase,
        illumination,
        phase_name,
        age_days,
        next_new_moon,
        next_full_moon,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_location() -> ObserverLocation {
        ObserverLocation {
            latitude: 40.0,
            longitude: -74.0,
            elevation: 0.0,
            timezone_offset: -5,
        }
    }

    #[test]
    fn test_jd_conversion() {
        let dt = Utc::now();
        let jd = datetime_to_jd(dt);
        let dt2 = jd_to_datetime(jd);
        assert!((dt - dt2).num_seconds().abs() < 2);
    }

    #[test]
    fn test_sun_position() {
        let jd = datetime_to_jd(Utc::now());
        let (ra, dec) = sun_position(jd);
        assert!(ra >= 0.0 && ra < 24.0);
        assert!(dec >= -23.5 && dec <= 23.5);
    }

    #[test]
    fn test_moon_phase() {
        let jd = datetime_to_jd(Utc::now());
        let phase = moon_phase(jd);
        assert!(phase >= 0.0 && phase <= 1.0);
    }

    #[test]
    fn test_twilight() {
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 3, 21).unwrap(); // Equinox for reliable results
        let twilight = calculate_twilight(&location, date);
        // Just verify the function runs without panic
        assert_eq!(twilight.date, "2024-03-21");
    }

    #[test]
    fn test_visibility_window() {
        let location = test_location();
        let coords = Coordinates::from_decimal(0.712, 41.27); // M31
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();
        let window = calculate_visibility_window(&coords, &location, date, 20.0);
        assert!(window.max_altitude > 0.0);
    }
}
