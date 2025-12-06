//! Calculator commands for astronomy and timing

use tauri::command;
use chrono::{DateTime, Utc};

use crate::models::*;
use crate::services::calculator;

/// Calculate sequence runtime
#[command]
pub fn calculate_sequence_runtime(sequence: SimpleSequence) -> f64 {
    calculator::calculate_sequence_runtime(&sequence)
}

/// Calculate sequence ETAs
#[command]
pub fn calculate_sequence_etas(mut sequence: SimpleSequence) -> SimpleSequence {
    calculator::calculate_sequence_etas(&mut sequence);
    sequence
}

/// Calculate exposure runtime
#[command]
pub fn calculate_exposure_runtime(exposure: SimpleExposure, download_time: f64) -> f64 {
    calculator::calculate_exposure_runtime(&exposure, download_time)
}

/// Calculate target runtime
#[command]
pub fn calculate_target_runtime(target: SimpleTarget, download_time: f64) -> f64 {
    calculator::calculate_target_runtime(&target, download_time)
}

/// Format duration
#[command]
pub fn format_duration(seconds: f64) -> String {
    calculator::format_duration(seconds)
}

/// Format time
#[command]
pub fn format_time(datetime: String) -> Result<String, String> {
    let dt: DateTime<Utc> = datetime.parse().map_err(|e| format!("Invalid datetime: {}", e))?;
    Ok(calculator::format_time(dt))
}

/// Calculate end time
#[command]
pub fn calculate_end_time(start: String, duration_seconds: f64) -> Result<String, String> {
    let start_dt: DateTime<Utc> = start.parse().map_err(|e| format!("Invalid datetime: {}", e))?;
    let end_dt = calculator::calculate_end_time(start_dt, duration_seconds);
    Ok(end_dt.to_rfc3339())
}

/// Calculate angular separation
#[command]
pub fn calculate_angular_separation(coord1: Coordinates, coord2: Coordinates) -> f64 {
    calculator::angular_separation(&coord1, &coord2)
}

/// Convert RA to decimal
#[command]
pub fn ra_to_decimal(hours: i32, minutes: i32, seconds: f64) -> f64 {
    calculator::ra_to_decimal(hours, minutes, seconds)
}

/// Convert decimal to RA
#[command]
pub fn decimal_to_ra(decimal: f64) -> RaResult {
    let (hours, minutes, seconds) = calculator::decimal_to_ra(decimal);
    RaResult { hours, minutes, seconds }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct RaResult {
    pub hours: i32,
    pub minutes: i32,
    pub seconds: f64,
}

/// Convert Dec to decimal
#[command]
pub fn dec_to_decimal(degrees: i32, minutes: i32, seconds: f64, negative: bool) -> f64 {
    calculator::dec_to_decimal(degrees, minutes, seconds, negative)
}

/// Convert decimal to Dec
#[command]
pub fn decimal_to_dec(decimal: f64) -> DecResult {
    let (degrees, minutes, seconds, negative) = calculator::decimal_to_dec(decimal);
    DecResult { degrees, minutes, seconds, negative }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DecResult {
    pub degrees: i32,
    pub minutes: i32,
    pub seconds: f64,
    pub negative: bool,
}

/// Calculate altitude
#[command]
pub fn calculate_altitude(
    ra_hours: f64,
    dec_degrees: f64,
    latitude: f64,
    longitude: f64,
    datetime: Option<String>,
) -> Result<f64, String> {
    let dt = if let Some(dt_str) = datetime {
        dt_str.parse().map_err(|e| format!("Invalid datetime: {}", e))?
    } else {
        Utc::now()
    };
    
    Ok(calculator::calculate_altitude(ra_hours, dec_degrees, latitude, longitude, dt))
}

/// Check if object is above horizon
#[command]
pub fn is_above_horizon(
    ra_hours: f64,
    dec_degrees: f64,
    latitude: f64,
    longitude: f64,
    min_altitude: f64,
    datetime: Option<String>,
) -> Result<bool, String> {
    let dt = if let Some(dt_str) = datetime {
        dt_str.parse().map_err(|e| format!("Invalid datetime: {}", e))?
    } else {
        Utc::now()
    };
    
    Ok(calculator::is_above_horizon(ra_hours, dec_degrees, latitude, longitude, dt, min_altitude))
}

/// Calculate moon phase
#[command]
pub fn calculate_moon_phase(datetime: Option<String>) -> Result<f64, String> {
    let dt = if let Some(dt_str) = datetime {
        dt_str.parse().map_err(|e| format!("Invalid datetime: {}", e))?
    } else {
        Utc::now()
    };
    
    Ok(calculator::calculate_moon_phase(dt))
}

/// Calculate moon illumination
#[command]
pub fn calculate_moon_illumination(datetime: Option<String>) -> Result<f64, String> {
    let dt = if let Some(dt_str) = datetime {
        dt_str.parse().map_err(|e| format!("Invalid datetime: {}", e))?
    } else {
        Utc::now()
    };
    
    Ok(calculator::calculate_moon_illumination(dt))
}

/// Parse RA string
#[command]
pub fn parse_ra(ra_string: String) -> Result<RaResult, String> {
    Coordinates::parse_ra(&ra_string)
        .map(|(hours, minutes, seconds)| RaResult { hours, minutes, seconds })
        .ok_or_else(|| "Invalid RA format".to_string())
}

/// Parse Dec string
#[command]
pub fn parse_dec(dec_string: String) -> Result<DecResult, String> {
    Coordinates::parse_dec(&dec_string)
        .map(|(degrees, minutes, seconds, negative)| DecResult { degrees, minutes, seconds, negative })
        .ok_or_else(|| "Invalid Dec format".to_string())
}

/// Format RA
#[command]
pub fn format_ra(hours: i32, minutes: i32, seconds: f64) -> String {
    format!("{:02}h {:02}m {:.1}s", hours, minutes, seconds)
}

/// Format Dec
#[command]
pub fn format_dec(degrees: i32, minutes: i32, seconds: f64, negative: bool) -> String {
    let sign = if negative { "-" } else { "+" };
    format!("{}{}° {:02}' {:.1}\"", sign, degrees, minutes, seconds)
}
