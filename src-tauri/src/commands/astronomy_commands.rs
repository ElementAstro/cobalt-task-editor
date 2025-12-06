//! Astronomy calculation commands
//!
//! Tauri commands for advanced astronomical calculations

use chrono::{DateTime, NaiveDate, Utc};
use tauri::command;

use crate::models::Coordinates;
use crate::services::astronomy::{
    ObserverLocation, VisibilityWindow, TwilightTimes, MoonPhaseInfo,
    ObservationQuality, BatchCoordinateResult, CelestialPosition,
    calculate_visibility_window, calculate_twilight, calculate_observation_quality,
    get_moon_phase_info, find_optimal_observation_time, batch_calculate_positions,
    sun_position, moon_position, datetime_to_jd, ra_dec_to_alt_az, moon_illumination,
};

/// Calculate visibility window for a target
#[command]
pub async fn calculate_target_visibility(
    coordinates: Coordinates,
    location: ObserverLocation,
    date: String,
    min_altitude: f64,
) -> Result<VisibilityWindow, String> {
    let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid date format: {}", e))?;
    
    Ok(calculate_visibility_window(&coordinates, &location, date, min_altitude))
}

/// Calculate twilight times for a location and date
#[command]
pub async fn calculate_twilight_times(
    location: ObserverLocation,
    date: String,
) -> Result<TwilightTimes, String> {
    let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid date format: {}", e))?;
    
    Ok(calculate_twilight(&location, date))
}

/// Get Moon phase information
#[command]
pub async fn get_moon_phase(
    datetime: Option<String>,
) -> Result<MoonPhaseInfo, String> {
    let dt = match datetime {
        Some(s) => DateTime::parse_from_rfc3339(&s)
            .map_err(|e| format!("Invalid datetime format: {}", e))?
            .with_timezone(&Utc),
        None => Utc::now(),
    };
    
    Ok(get_moon_phase_info(dt))
}

/// Calculate observation quality score
#[command]
pub async fn calculate_quality_score(
    coordinates: Coordinates,
    location: ObserverLocation,
    datetime: Option<String>,
) -> Result<ObservationQuality, String> {
    let dt = match datetime {
        Some(s) => DateTime::parse_from_rfc3339(&s)
            .map_err(|e| format!("Invalid datetime format: {}", e))?
            .with_timezone(&Utc),
        None => Utc::now(),
    };
    
    Ok(calculate_observation_quality(&coordinates, &location, dt))
}

/// Find optimal observation time for a target
#[command]
pub async fn find_optimal_time(
    coordinates: Coordinates,
    location: ObserverLocation,
    date: String,
    min_altitude: f64,
) -> Result<Option<String>, String> {
    let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid date format: {}", e))?;
    
    let result = find_optimal_observation_time(&coordinates, &location, date, min_altitude);
    Ok(result.map(|dt| dt.to_rfc3339()))
}

/// Batch calculate positions for multiple targets
#[command]
pub async fn batch_calculate_target_positions(
    targets: Vec<(String, Coordinates)>,
    location: ObserverLocation,
    datetime: Option<String>,
    min_altitude: f64,
) -> Result<Vec<BatchCoordinateResult>, String> {
    let dt = match datetime {
        Some(s) => DateTime::parse_from_rfc3339(&s)
            .map_err(|e| format!("Invalid datetime format: {}", e))?
            .with_timezone(&Utc),
        None => Utc::now(),
    };
    
    Ok(batch_calculate_positions(&targets, &location, dt, min_altitude))
}

/// Get Sun position
#[command]
pub async fn get_sun_position(
    location: ObserverLocation,
    datetime: Option<String>,
) -> Result<CelestialPosition, String> {
    let dt = match datetime {
        Some(s) => DateTime::parse_from_rfc3339(&s)
            .map_err(|e| format!("Invalid datetime format: {}", e))?
            .with_timezone(&Utc),
        None => Utc::now(),
    };
    
    let jd = datetime_to_jd(dt);
    let (ra, dec) = sun_position(jd);
    let (alt, az) = ra_dec_to_alt_az(ra, dec, location.latitude, location.longitude, jd);
    
    Ok(CelestialPosition {
        altitude: alt,
        azimuth: az,
        ra_hours: ra,
        dec_degrees: dec,
        distance_km: Some(149_597_870.7), // 1 AU in km
    })
}

/// Get Moon position
#[command]
pub async fn get_moon_position(
    location: ObserverLocation,
    datetime: Option<String>,
) -> Result<CelestialPosition, String> {
    let dt = match datetime {
        Some(s) => DateTime::parse_from_rfc3339(&s)
            .map_err(|e| format!("Invalid datetime format: {}", e))?
            .with_timezone(&Utc),
        None => Utc::now(),
    };
    
    let jd = datetime_to_jd(dt);
    let (ra, dec, distance) = moon_position(jd);
    let (alt, az) = ra_dec_to_alt_az(ra, dec, location.latitude, location.longitude, jd);
    
    Ok(CelestialPosition {
        altitude: alt,
        azimuth: az,
        ra_hours: ra,
        dec_degrees: dec,
        distance_km: Some(distance),
    })
}

/// Calculate altitude and azimuth for coordinates
#[command]
pub async fn calculate_alt_az(
    coordinates: Coordinates,
    location: ObserverLocation,
    datetime: Option<String>,
) -> Result<(f64, f64), String> {
    let dt = match datetime {
        Some(s) => DateTime::parse_from_rfc3339(&s)
            .map_err(|e| format!("Invalid datetime format: {}", e))?
            .with_timezone(&Utc),
        None => Utc::now(),
    };
    
    let jd = datetime_to_jd(dt);
    let ra = coordinates.ra_to_decimal();
    let dec = coordinates.dec_to_decimal();
    
    Ok(ra_dec_to_alt_az(ra, dec, location.latitude, location.longitude, jd))
}

/// Get current Moon illumination percentage
#[command]
pub async fn get_moon_illumination_now() -> Result<f64, String> {
    let jd = datetime_to_jd(Utc::now());
    Ok(moon_illumination(jd))
}

/// Calculate multiple visibility windows for a date range
#[command]
pub async fn calculate_visibility_range(
    coordinates: Coordinates,
    location: ObserverLocation,
    start_date: String,
    end_date: String,
    min_altitude: f64,
) -> Result<Vec<VisibilityWindow>, String> {
    let start = NaiveDate::parse_from_str(&start_date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid start date: {}", e))?;
    let end = NaiveDate::parse_from_str(&end_date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid end date: {}", e))?;
    
    if end < start {
        return Err("End date must be after start date".to_string());
    }
    
    let mut results = Vec::new();
    let mut current = start;
    
    while current <= end {
        results.push(calculate_visibility_window(&coordinates, &location, current, min_altitude));
        current = current.succ_opt().unwrap_or(current);
    }
    
    Ok(results)
}

/// Calculate twilight times for a date range
#[command]
pub async fn calculate_twilight_range(
    location: ObserverLocation,
    start_date: String,
    end_date: String,
) -> Result<Vec<TwilightTimes>, String> {
    let start = NaiveDate::parse_from_str(&start_date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid start date: {}", e))?;
    let end = NaiveDate::parse_from_str(&end_date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid end date: {}", e))?;
    
    if end < start {
        return Err("End date must be after start date".to_string());
    }
    
    let mut results = Vec::new();
    let mut current = start;
    
    while current <= end {
        results.push(calculate_twilight(&location, current));
        current = current.succ_opt().unwrap_or(current);
    }
    
    Ok(results)
}

/// Convert RA/Dec to Alt/Az for a time range (for plotting)
#[command]
pub async fn calculate_altitude_curve(
    coordinates: Coordinates,
    location: ObserverLocation,
    date: String,
    interval_minutes: i32,
) -> Result<Vec<(String, f64, f64)>, String> {
    let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid date format: {}", e))?;
    
    let ra = coordinates.ra_to_decimal();
    let dec = coordinates.dec_to_decimal();
    
    let start = DateTime::from_naive_utc_and_offset(
        date.and_hms_opt(0, 0, 0).unwrap(),
        Utc,
    );
    
    let mut results = Vec::new();
    let interval = interval_minutes.max(1) as i64;
    
    for i in 0..(24 * 60 / interval) {
        let dt = start + chrono::Duration::minutes(i * interval);
        let jd = datetime_to_jd(dt);
        let (alt, az) = ra_dec_to_alt_az(ra, dec, location.latitude, location.longitude, jd);
        results.push((dt.to_rfc3339(), alt, az));
    }
    
    Ok(results)
}

/// Check if target is currently above horizon
#[command]
pub async fn is_target_visible(
    coordinates: Coordinates,
    location: ObserverLocation,
    min_altitude: f64,
) -> Result<bool, String> {
    let jd = datetime_to_jd(Utc::now());
    let ra = coordinates.ra_to_decimal();
    let dec = coordinates.dec_to_decimal();
    let (alt, _) = ra_dec_to_alt_az(ra, dec, location.latitude, location.longitude, jd);
    
    Ok(alt >= min_altitude)
}

/// Get air mass for current position
#[command]
pub async fn calculate_air_mass(
    coordinates: Coordinates,
    location: ObserverLocation,
    datetime: Option<String>,
) -> Result<Option<f64>, String> {
    let dt = match datetime {
        Some(s) => DateTime::parse_from_rfc3339(&s)
            .map_err(|e| format!("Invalid datetime format: {}", e))?
            .with_timezone(&Utc),
        None => Utc::now(),
    };
    
    let jd = datetime_to_jd(dt);
    let ra = coordinates.ra_to_decimal();
    let dec = coordinates.dec_to_decimal();
    let (alt, _) = ra_dec_to_alt_az(ra, dec, location.latitude, location.longitude, jd);
    
    Ok(crate::services::astronomy::air_mass(alt))
}
