//! Calculation services for astronomy and sequence timing

use crate::models::*;
use chrono::{DateTime, Utc, Duration};

/// Calculate total runtime for a simple sequence
pub fn calculate_sequence_runtime(sequence: &SimpleSequence) -> f64 {
    sequence.total_runtime()
}

/// Calculate ETA for all targets in a sequence
pub fn calculate_sequence_etas(sequence: &mut SimpleSequence) {
    sequence.calculate_etas();
}

/// Calculate exposure runtime
pub fn calculate_exposure_runtime(exposure: &SimpleExposure, download_time: f64) -> f64 {
    exposure.runtime(download_time)
}

/// Calculate target runtime
pub fn calculate_target_runtime(target: &SimpleTarget, download_time: f64) -> f64 {
    target.runtime(download_time)
}

/// Format duration in human-readable format
pub fn format_duration(seconds: f64) -> String {
    if seconds < 0.0 {
        return "0s".to_string();
    }
    
    let total_seconds = seconds as i64;
    let days = total_seconds / 86400;
    let hours = (total_seconds % 86400) / 3600;
    let minutes = (total_seconds % 3600) / 60;
    let secs = total_seconds % 60;
    
    if days > 0 {
        format!("{}d {}h {}m {}s", days, hours, minutes, secs)
    } else if hours > 0 {
        format!("{}h {}m {}s", hours, minutes, secs)
    } else if minutes > 0 {
        format!("{}m {}s", minutes, secs)
    } else {
        format!("{}s", secs)
    }
}

/// Format time as HH:MM:SS
pub fn format_time(datetime: DateTime<Utc>) -> String {
    datetime.format("%H:%M:%S").to_string()
}

/// Calculate end time from start time and duration
pub fn calculate_end_time(start: DateTime<Utc>, duration_seconds: f64) -> DateTime<Utc> {
    start + Duration::seconds(duration_seconds as i64)
}

/// Angular separation between two coordinates in degrees
pub fn angular_separation(coord1: &Coordinates, coord2: &Coordinates) -> f64 {
    coordinates::angular_separation(coord1, coord2)
}

/// Convert RA from HMS to decimal hours
pub fn ra_to_decimal(hours: i32, minutes: i32, seconds: f64) -> f64 {
    hours as f64 + minutes as f64 / 60.0 + seconds / 3600.0
}

/// Convert RA from decimal hours to HMS
pub fn decimal_to_ra(decimal: f64) -> (i32, i32, f64) {
    let hours = decimal.floor() as i32;
    let minutes_decimal = (decimal - hours as f64) * 60.0;
    let minutes = minutes_decimal.floor() as i32;
    let seconds = (minutes_decimal - minutes as f64) * 60.0;
    (hours, minutes, (seconds * 100.0).round() / 100.0)
}

/// Convert Dec from DMS to decimal degrees
pub fn dec_to_decimal(degrees: i32, minutes: i32, seconds: f64, negative: bool) -> f64 {
    let value = degrees.abs() as f64 + minutes as f64 / 60.0 + seconds / 3600.0;
    if negative { -value } else { value }
}

/// Convert Dec from decimal degrees to DMS
pub fn decimal_to_dec(decimal: f64) -> (i32, i32, f64, bool) {
    let negative = decimal < 0.0;
    let abs_decimal = decimal.abs();
    let degrees = abs_decimal.floor() as i32;
    let minutes_decimal = (abs_decimal - degrees as f64) * 60.0;
    let minutes = minutes_decimal.floor() as i32;
    let seconds = (minutes_decimal - minutes as f64) * 60.0;
    (degrees, minutes, (seconds * 100.0).round() / 100.0, negative)
}

/// Calculate altitude of an object at a given time
/// This is a simplified calculation - for accurate results, use a proper astronomy library
pub fn calculate_altitude(
    ra_hours: f64,
    dec_degrees: f64,
    latitude: f64,
    longitude: f64,
    datetime: DateTime<Utc>,
) -> f64 {
    // Convert to radians
    let lat_rad = latitude.to_radians();
    let dec_rad = dec_degrees.to_radians();
    
    // Calculate Local Sidereal Time (simplified)
    let jd = datetime_to_julian_day(datetime);
    let lst = calculate_lst(jd, longitude);
    
    // Calculate Hour Angle
    let ha = (lst - ra_hours * 15.0).to_radians();
    
    // Calculate altitude
    let sin_alt = lat_rad.sin() * dec_rad.sin() + lat_rad.cos() * dec_rad.cos() * ha.cos();
    sin_alt.asin().to_degrees()
}

/// Convert DateTime to Julian Day
fn datetime_to_julian_day(datetime: DateTime<Utc>) -> f64 {
    let year = datetime.format("%Y").to_string().parse::<i32>().unwrap();
    let month = datetime.format("%m").to_string().parse::<i32>().unwrap();
    let day = datetime.format("%d").to_string().parse::<f64>().unwrap();
    let hour = datetime.format("%H").to_string().parse::<f64>().unwrap();
    let minute = datetime.format("%M").to_string().parse::<f64>().unwrap();
    let second = datetime.format("%S").to_string().parse::<f64>().unwrap();
    
    let day_fraction = day + (hour + minute / 60.0 + second / 3600.0) / 24.0;
    
    let (y, m) = if month <= 2 {
        (year - 1, month + 12)
    } else {
        (year, month)
    };
    
    let a = (y as f64 / 100.0).floor();
    let b = 2.0 - a + (a / 4.0).floor();
    
    (365.25 * (y as f64 + 4716.0)).floor() 
        + (30.6001 * (m as f64 + 1.0)).floor() 
        + day_fraction + b - 1524.5
}

/// Calculate Local Sidereal Time in degrees
fn calculate_lst(jd: f64, longitude: f64) -> f64 {
    let t = (jd - 2451545.0) / 36525.0;
    let gmst = 280.46061837 
        + 360.98564736629 * (jd - 2451545.0) 
        + 0.000387933 * t * t 
        - t * t * t / 38710000.0;
    
    let lst = gmst + longitude;
    lst.rem_euclid(360.0)
}

/// Estimate if an object is above horizon
pub fn is_above_horizon(
    ra_hours: f64,
    dec_degrees: f64,
    latitude: f64,
    longitude: f64,
    datetime: DateTime<Utc>,
    min_altitude: f64,
) -> bool {
    calculate_altitude(ra_hours, dec_degrees, latitude, longitude, datetime) >= min_altitude
}

/// Calculate moon phase (0 = new, 0.5 = full, 1 = new)
pub fn calculate_moon_phase(datetime: DateTime<Utc>) -> f64 {
    let jd = datetime_to_julian_day(datetime);
    let days_since_new = (jd - 2451550.1) % 29.530588853;
    days_since_new / 29.530588853
}

/// Calculate moon illumination percentage
pub fn calculate_moon_illumination(datetime: DateTime<Utc>) -> f64 {
    let phase = calculate_moon_phase(datetime);
    let angle = phase * 2.0 * std::f64::consts::PI;
    (1.0 - angle.cos()) / 2.0 * 100.0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_duration() {
        assert_eq!(format_duration(30.0), "30s");
        assert_eq!(format_duration(90.0), "1m 30s");
        assert_eq!(format_duration(3661.0), "1h 1m 1s");
        assert_eq!(format_duration(90061.0), "1d 1h 1m 1s");
    }

    #[test]
    fn test_ra_conversion() {
        let (h, m, s) = decimal_to_ra(12.5);
        assert_eq!(h, 12);
        assert_eq!(m, 30);
        assert!((s - 0.0).abs() < 0.01);
        
        let decimal = ra_to_decimal(12, 30, 0.0);
        assert!((decimal - 12.5).abs() < 0.001);
    }

    #[test]
    fn test_dec_conversion() {
        let (d, m, s, neg) = decimal_to_dec(-45.5);
        assert_eq!(d, 45);
        assert_eq!(m, 30);
        assert!((s - 0.0).abs() < 0.01);
        assert!(neg);
        
        let decimal = dec_to_decimal(45, 30, 0.0, true);
        assert!((decimal + 45.5).abs() < 0.001);
    }
}
