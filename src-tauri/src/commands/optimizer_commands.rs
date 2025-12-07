//! Sequence optimizer commands
//!
//! Tauri commands for sequence optimization and scheduling

use chrono::{DateTime, NaiveDate, Utc};
use tauri::command;

use crate::models::SimpleSequence;
use crate::services::astronomy::ObserverLocation;
use crate::services::sequence_optimizer::{
    apply_optimized_order, calculate_etas_parallel, calculate_visibility_parallel,
    detect_conflicts, get_schedule_info, merge_sequences, optimize_sequence, split_sequence,
    BatchCalculationResult, ConflictResult, OptimizationResult, OptimizationStrategy,
    TargetScheduleInfo,
};

/// Optimize sequence target order
#[command]
pub async fn optimize_target_order(
    sequence: SimpleSequence,
    location: ObserverLocation,
    date: String,
    strategy: String,
) -> Result<OptimizationResult, String> {
    let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid date format: {}", e))?;

    let strategy = match strategy.to_lowercase().as_str() {
        "max_altitude" | "maxaltitude" => OptimizationStrategy::MaxAltitude,
        "transit_time" | "transittime" => OptimizationStrategy::TransitTime,
        "visibility_start" | "visibilitystart" => OptimizationStrategy::VisibilityStart,
        "visibility_duration" | "visibilityduration" => OptimizationStrategy::VisibilityDuration,
        "minimize_slew" | "minimizeslew" => OptimizationStrategy::MinimizeSlew,
        "moon_avoidance" | "moonavoidance" => OptimizationStrategy::MoonAvoidance,
        _ => OptimizationStrategy::Combined,
    };

    Ok(optimize_sequence(&sequence, &location, date, strategy))
}

/// Detect scheduling conflicts
#[command]
pub async fn detect_schedule_conflicts(
    sequence: SimpleSequence,
    location: ObserverLocation,
    date: String,
) -> Result<ConflictResult, String> {
    let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid date format: {}", e))?;

    Ok(detect_conflicts(&sequence, &location, date))
}

/// Calculate ETAs for all targets (parallel)
#[command]
pub async fn calculate_parallel_etas(
    sequence: SimpleSequence,
    start_time: Option<String>,
) -> Result<Vec<BatchCalculationResult>, String> {
    let start = match start_time {
        Some(s) => DateTime::parse_from_rfc3339(&s)
            .map_err(|e| format!("Invalid datetime format: {}", e))?
            .with_timezone(&Utc),
        None => Utc::now(),
    };

    Ok(calculate_etas_parallel(&sequence, start))
}

/// Get scheduling info for all targets
#[command]
pub async fn get_target_schedule_info(
    sequence: SimpleSequence,
    location: ObserverLocation,
    date: String,
) -> Result<Vec<TargetScheduleInfo>, String> {
    let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid date format: {}", e))?;

    Ok(get_schedule_info(&sequence, &location, date))
}

/// Apply optimized order to sequence
#[command]
pub async fn apply_optimization(
    mut sequence: SimpleSequence,
    order: Vec<String>,
) -> Result<SimpleSequence, String> {
    apply_optimized_order(&mut sequence, &order);
    Ok(sequence)
}

/// Merge multiple sequences
#[command]
pub async fn merge_multiple_sequences(
    sequences: Vec<SimpleSequence>,
    title: Option<String>,
) -> Result<SimpleSequence, String> {
    Ok(merge_sequences(&sequences, title))
}

/// Split sequence by target
#[command]
pub async fn split_sequence_by_target(
    sequence: SimpleSequence,
) -> Result<Vec<SimpleSequence>, String> {
    Ok(split_sequence(&sequence))
}

/// Get available optimization strategies
#[command]
pub async fn get_optimization_strategies() -> Result<Vec<(String, String, String)>, String> {
    Ok(vec![
        (
            "max_altitude".to_string(),
            "Maximum Altitude".to_string(),
            "Order targets by their maximum altitude (highest first)".to_string(),
        ),
        (
            "transit_time".to_string(),
            "Transit Time".to_string(),
            "Order targets by when they cross the meridian".to_string(),
        ),
        (
            "visibility_start".to_string(),
            "Visibility Start".to_string(),
            "Order targets by when they become visible".to_string(),
        ),
        (
            "visibility_duration".to_string(),
            "Visibility Duration".to_string(),
            "Order targets by how long they're visible (longest first)".to_string(),
        ),
        (
            "minimize_slew".to_string(),
            "Minimize Slew".to_string(),
            "Order targets to minimize telescope movement".to_string(),
        ),
        (
            "moon_avoidance".to_string(),
            "Moon Avoidance".to_string(),
            "Order targets by distance from the Moon".to_string(),
        ),
        (
            "combined".to_string(),
            "Combined".to_string(),
            "Use a combined optimization score".to_string(),
        ),
    ])
}

/// Calculate visibility for all targets in parallel
#[command]
pub async fn batch_calculate_visibility(
    sequence: SimpleSequence,
    location: ObserverLocation,
    date: String,
    min_altitude: f64,
) -> Result<Vec<(String, crate::services::astronomy::VisibilityWindow)>, String> {
    let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid date format: {}", e))?;

    Ok(calculate_visibility_parallel(
        &sequence.targets,
        &location,
        date,
        min_altitude,
    ))
}

/// Validate sequence for a specific date
#[command]
pub async fn validate_sequence_for_date(
    sequence: SimpleSequence,
    location: ObserverLocation,
    date: String,
) -> Result<ValidationReport, String> {
    let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid date format: {}", e))?;

    let conflicts = detect_conflicts(&sequence, &location, date);
    let schedule_info = get_schedule_info(&sequence, &location, date);

    let visible_count = schedule_info
        .iter()
        .filter(|i| i.visibility_window.is_visible)
        .count();

    let total_runtime: f64 = schedule_info
        .iter()
        .filter(|i| i.visibility_window.is_visible)
        .map(|i| i.visibility_window.duration_hours)
        .sum();

    let avg_quality: f64 = if visible_count > 0 {
        schedule_info
            .iter()
            .filter(|i| i.visibility_window.is_visible)
            .map(|i| i.quality_score)
            .sum::<f64>()
            / visible_count as f64
    } else {
        0.0
    };

    Ok(ValidationReport {
        date: date.format("%Y-%m-%d").to_string(),
        total_targets: sequence.targets.len(),
        visible_targets: visible_count,
        has_conflicts: conflicts.has_conflicts,
        conflict_count: conflicts.conflicts.len(),
        total_visibility_hours: total_runtime,
        average_quality_score: avg_quality,
        recommendations: conflicts.suggestions,
    })
}

/// Validation report
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationReport {
    pub date: String,
    pub total_targets: usize,
    pub visible_targets: usize,
    pub has_conflicts: bool,
    pub conflict_count: usize,
    pub total_visibility_hours: f64,
    pub average_quality_score: f64,
    pub recommendations: Vec<String>,
}

/// Find best observation date in a range
#[command]
pub async fn find_best_observation_date(
    sequence: SimpleSequence,
    location: ObserverLocation,
    start_date: String,
    end_date: String,
) -> Result<BestDateResult, String> {
    let start = NaiveDate::parse_from_str(&start_date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid start date: {}", e))?;
    let end = NaiveDate::parse_from_str(&end_date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid end date: {}", e))?;

    if end < start {
        return Err("End date must be after start date".to_string());
    }

    let mut best_date = start;
    let mut best_score = 0.0;
    let mut date_scores = Vec::new();

    let mut current = start;
    while current <= end {
        let schedule_info = get_schedule_info(&sequence, &location, current);

        let score: f64 = schedule_info
            .iter()
            .filter(|i| i.visibility_window.is_visible)
            .map(|i| i.quality_score + i.visibility_window.duration_hours * 5.0)
            .sum();

        date_scores.push((current.format("%Y-%m-%d").to_string(), score));

        if score > best_score {
            best_score = score;
            best_date = current;
        }

        current = current.succ_opt().unwrap_or(current);
        if current == end && current != start {
            break;
        }
    }

    Ok(BestDateResult {
        best_date: best_date.format("%Y-%m-%d").to_string(),
        best_score,
        date_scores,
    })
}

/// Best date result
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BestDateResult {
    pub best_date: String,
    pub best_score: f64,
    pub date_scores: Vec<(String, f64)>,
}

/// Estimate total session time
#[command]
pub async fn estimate_session_time(
    sequence: SimpleSequence,
    location: ObserverLocation,
    date: String,
    include_slew_time: bool,
) -> Result<SessionTimeEstimate, String> {
    let date = NaiveDate::parse_from_str(&date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid date format: {}", e))?;

    let download_time = sequence.estimated_download_time;

    // Calculate imaging time
    let imaging_time: f64 = sequence
        .targets
        .iter()
        .map(|t| t.runtime(download_time))
        .sum();

    // Estimate slew time
    let slew_time = if include_slew_time && sequence.targets.len() > 1 {
        let slew_speed = 3.0; // degrees per second
        let settle_time = 5.0;

        let mut total_slew = 0.0;
        for i in 1..sequence.targets.len() {
            let dist = crate::models::coordinates::angular_separation(
                &sequence.targets[i - 1].coordinates,
                &sequence.targets[i].coordinates,
            );
            total_slew += dist / slew_speed + settle_time;
        }
        total_slew
    } else {
        0.0
    };

    // Estimate autofocus time
    let autofocus_time: f64 = sequence
        .targets
        .iter()
        .filter(|t| t.auto_focus_on_start)
        .count() as f64
        * 120.0; // 2 minutes per autofocus

    // Estimate centering time
    let centering_time: f64 =
        sequence.targets.iter().filter(|t| t.center_target).count() as f64 * 60.0; // 1 minute per center

    let total_time = imaging_time + slew_time + autofocus_time + centering_time;

    // Get twilight info
    let twilight = crate::services::astronomy::calculate_twilight(&location, date);
    let available_time = match (twilight.astronomical_dusk, twilight.astronomical_dawn) {
        (Some(dusk), Some(dawn)) => {
            let dawn_next = dawn + chrono::Duration::days(1);
            (dawn_next - dusk).num_seconds() as f64
        }
        _ => 0.0,
    };

    Ok(SessionTimeEstimate {
        imaging_time_seconds: imaging_time,
        slew_time_seconds: slew_time,
        autofocus_time_seconds: autofocus_time,
        centering_time_seconds: centering_time,
        total_time_seconds: total_time,
        available_dark_time_seconds: available_time,
        fits_in_night: total_time <= available_time,
        utilization_percentage: if available_time > 0.0 {
            (total_time / available_time * 100.0).min(100.0)
        } else {
            0.0
        },
    })
}

/// Session time estimate
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionTimeEstimate {
    pub imaging_time_seconds: f64,
    pub slew_time_seconds: f64,
    pub autofocus_time_seconds: f64,
    pub centering_time_seconds: f64,
    pub total_time_seconds: f64,
    pub available_dark_time_seconds: f64,
    pub fits_in_night: bool,
    pub utilization_percentage: f64,
}
