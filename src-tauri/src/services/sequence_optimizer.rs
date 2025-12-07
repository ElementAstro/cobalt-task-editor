//! Sequence optimization service
//!
//! Provides intelligent sequence optimization including:
//! - Target ordering by altitude/visibility
//! - Conflict detection
//! - Runtime optimization
//! - Parallel processing

use chrono::{DateTime, Duration, NaiveDate, Utc};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::{Coordinates, SimpleSequence, SimpleTarget};
use crate::services::astronomy::{
    calculate_observation_quality, calculate_visibility_window, ObserverLocation, VisibilityWindow,
};

/// Optimization strategy
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum OptimizationStrategy {
    /// Order by maximum altitude (highest first)
    MaxAltitude,
    /// Order by transit time
    TransitTime,
    /// Order by visibility window start
    VisibilityStart,
    /// Order by visibility duration (longest first)
    VisibilityDuration,
    /// Minimize slew time between targets
    MinimizeSlew,
    /// Optimize for moon avoidance
    MoonAvoidance,
    /// Combined optimization score
    Combined,
}

/// Optimization result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OptimizationResult {
    pub success: bool,
    pub original_order: Vec<String>,
    pub optimized_order: Vec<String>,
    pub improvements: Vec<String>,
    pub warnings: Vec<String>,
    pub estimated_total_runtime: f64,
    pub estimated_slew_time: f64,
}

/// Target scheduling info
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TargetScheduleInfo {
    pub target_id: String,
    pub target_name: String,
    pub visibility_window: VisibilityWindow,
    pub optimal_start_time: Option<DateTime<Utc>>,
    pub optimal_end_time: Option<DateTime<Utc>>,
    pub quality_score: f64,
    pub conflicts: Vec<String>,
}

/// Conflict detection result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConflictResult {
    pub has_conflicts: bool,
    pub conflicts: Vec<ScheduleConflict>,
    pub suggestions: Vec<String>,
}

/// Schedule conflict
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScheduleConflict {
    pub target1_id: String,
    pub target1_name: String,
    pub target2_id: String,
    pub target2_name: String,
    pub conflict_type: ConflictType,
    pub description: String,
}

/// Conflict type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ConflictType {
    TimeOverlap,
    InsufficientTime,
    VisibilityGap,
    MeridianFlip,
}

/// Batch calculation result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchCalculationResult {
    pub target_id: String,
    pub runtime: f64,
    pub eta_start: Option<DateTime<Utc>>,
    pub eta_end: Option<DateTime<Utc>>,
}

// ============================================================================
// Sequence Optimization
// ============================================================================

/// Optimize target order in sequence
pub fn optimize_sequence(
    sequence: &SimpleSequence,
    location: &ObserverLocation,
    date: NaiveDate,
    strategy: OptimizationStrategy,
) -> OptimizationResult {
    let original_order: Vec<String> = sequence.targets.iter().map(|t| t.id.clone()).collect();
    let mut improvements = Vec::new();
    let mut warnings = Vec::new();

    // Calculate visibility for all targets
    let mut target_info: Vec<(String, &SimpleTarget, VisibilityWindow, f64)> = sequence
        .targets
        .iter()
        .map(|target| {
            let window = calculate_visibility_window(
                &target.coordinates,
                location,
                date,
                20.0, // minimum altitude
            );
            let quality = if window.is_visible {
                calculate_observation_quality(
                    &target.coordinates,
                    location,
                    window.max_altitude_time,
                )
                .score
            } else {
                0.0
            };
            (target.id.clone(), target, window, quality)
        })
        .collect();

    // Sort based on strategy
    match strategy {
        OptimizationStrategy::MaxAltitude => {
            target_info.sort_by(|a, b| b.2.max_altitude.partial_cmp(&a.2.max_altitude).unwrap());
            improvements.push("Ordered by maximum altitude".to_string());
        }
        OptimizationStrategy::TransitTime => {
            target_info.sort_by(|a, b| a.2.max_altitude_time.cmp(&b.2.max_altitude_time));
            improvements.push("Ordered by transit time".to_string());
        }
        OptimizationStrategy::VisibilityStart => {
            target_info.sort_by(|a, b| a.2.start_time.cmp(&b.2.start_time));
            improvements.push("Ordered by visibility window start".to_string());
        }
        OptimizationStrategy::VisibilityDuration => {
            target_info
                .sort_by(|a, b| b.2.duration_hours.partial_cmp(&a.2.duration_hours).unwrap());
            improvements.push("Ordered by visibility duration".to_string());
        }
        OptimizationStrategy::MinimizeSlew => {
            target_info = optimize_slew_order(target_info, location, date);
            improvements.push("Optimized to minimize slew time".to_string());
        }
        OptimizationStrategy::MoonAvoidance => {
            target_info.sort_by(|a, b| b.3.partial_cmp(&a.3).unwrap());
            improvements.push("Ordered by moon avoidance score".to_string());
        }
        OptimizationStrategy::Combined => {
            // Combined score: altitude + quality + visibility
            target_info.sort_by(|a, b| {
                let score_a =
                    a.2.max_altitude / 90.0 * 30.0 + a.3 * 0.5 + a.2.duration_hours / 12.0 * 20.0;
                let score_b =
                    b.2.max_altitude / 90.0 * 30.0 + b.3 * 0.5 + b.2.duration_hours / 12.0 * 20.0;
                score_b.partial_cmp(&score_a).unwrap()
            });
            improvements.push("Combined optimization applied".to_string());
        }
    }

    // Check for targets with no visibility
    for (_id, target, window, _) in &target_info {
        if !window.is_visible {
            warnings.push(format!(
                "Target '{}' is not visible on this date",
                target.target_name
            ));
        }
    }

    let optimized_order: Vec<String> = target_info.iter().map(|(id, _, _, _)| id.clone()).collect();

    // Calculate estimated times
    let estimated_total_runtime = calculate_total_runtime(sequence);
    let estimated_slew_time = estimate_slew_time(&target_info, location, date);

    OptimizationResult {
        success: true,
        original_order,
        optimized_order,
        improvements,
        warnings,
        estimated_total_runtime,
        estimated_slew_time,
    }
}

/// Optimize order to minimize slew time (greedy nearest neighbor)
fn optimize_slew_order<'a>(
    mut targets: Vec<(String, &'a SimpleTarget, VisibilityWindow, f64)>,
    _location: &ObserverLocation,
    _date: NaiveDate,
) -> Vec<(String, &'a SimpleTarget, VisibilityWindow, f64)> {
    if targets.len() <= 2 {
        return targets;
    }

    let mut result = Vec::with_capacity(targets.len());

    // Start with the first visible target
    let first_idx = targets
        .iter()
        .position(|(_, _, w, _)| w.is_visible)
        .unwrap_or(0);
    result.push(targets.remove(first_idx));

    while !targets.is_empty() {
        let last = result.last().unwrap();
        let last_coords = &last.1.coordinates;

        // Find nearest target
        let mut min_dist = f64::MAX;
        let mut min_idx = 0;

        for (idx, (_, target, _, _)) in targets.iter().enumerate() {
            let dist = angular_distance(last_coords, &target.coordinates);
            if dist < min_dist {
                min_dist = dist;
                min_idx = idx;
            }
        }

        result.push(targets.remove(min_idx));
    }

    result
}

/// Calculate angular distance between two coordinates
fn angular_distance(c1: &Coordinates, c2: &Coordinates) -> f64 {
    crate::models::coordinates::angular_separation(c1, c2)
}

/// Estimate total slew time
fn estimate_slew_time(
    targets: &[(String, &SimpleTarget, VisibilityWindow, f64)],
    _location: &ObserverLocation,
    _date: NaiveDate,
) -> f64 {
    if targets.len() < 2 {
        return 0.0;
    }

    let slew_speed = 3.0; // degrees per second (typical)
    let settle_time = 5.0; // seconds

    let mut total_slew = 0.0;

    for i in 1..targets.len() {
        let dist = angular_distance(&targets[i - 1].1.coordinates, &targets[i].1.coordinates);
        total_slew += dist / slew_speed + settle_time;
    }

    total_slew
}

// ============================================================================
// Conflict Detection
// ============================================================================

/// Detect scheduling conflicts
pub fn detect_conflicts(
    sequence: &SimpleSequence,
    location: &ObserverLocation,
    date: NaiveDate,
) -> ConflictResult {
    let mut conflicts = Vec::new();
    let mut suggestions = Vec::new();

    let download_time = sequence.estimated_download_time;

    // Calculate visibility and runtime for each target
    let target_info: Vec<(String, String, VisibilityWindow, f64)> = sequence
        .targets
        .iter()
        .map(|target| {
            let window = calculate_visibility_window(&target.coordinates, location, date, 20.0);
            let runtime = target.runtime(download_time);
            (
                target.id.clone(),
                target.target_name.clone(),
                window,
                runtime,
            )
        })
        .collect();

    // Check for visibility conflicts
    for (i, (id1, name1, window1, runtime1)) in target_info.iter().enumerate() {
        if !window1.is_visible {
            conflicts.push(ScheduleConflict {
                target1_id: id1.clone(),
                target1_name: name1.clone(),
                target2_id: String::new(),
                target2_name: String::new(),
                conflict_type: ConflictType::VisibilityGap,
                description: format!("Target '{}' is not visible on this date", name1),
            });
            continue;
        }

        // Check if runtime exceeds visibility window
        if *runtime1 > window1.duration_hours * 3600.0 {
            conflicts.push(ScheduleConflict {
                target1_id: id1.clone(),
                target1_name: name1.clone(),
                target2_id: String::new(),
                target2_name: String::new(),
                conflict_type: ConflictType::InsufficientTime,
                description: format!(
                    "Target '{}' requires {:.1}h but visibility window is only {:.1}h",
                    name1,
                    runtime1 / 3600.0,
                    window1.duration_hours
                ),
            });
        }

        // Check for overlaps with other targets
        for (id2, name2, window2, runtime2) in target_info.iter().skip(i + 1) {
            if !window2.is_visible {
                continue;
            }

            // Check if windows overlap and combined runtime exceeds overlap
            let overlap_start = window1.start_time.max(window2.start_time);
            let overlap_end = window1.end_time.min(window2.end_time);

            if overlap_start < overlap_end {
                let overlap_duration = (overlap_end - overlap_start).num_seconds() as f64;
                let combined_runtime = runtime1 + runtime2;

                if combined_runtime > overlap_duration {
                    conflicts.push(ScheduleConflict {
                        target1_id: id1.clone(),
                        target1_name: name1.clone(),
                        target2_id: id2.clone(),
                        target2_name: name2.clone(),
                        conflict_type: ConflictType::TimeOverlap,
                        description: format!(
                            "Targets '{}' and '{}' have overlapping visibility with insufficient time",
                            name1, name2
                        ),
                    });
                }
            }
        }
    }

    // Generate suggestions
    if !conflicts.is_empty() {
        suggestions.push("Consider splitting the session across multiple nights".to_string());
        suggestions.push("Prioritize targets with shorter visibility windows".to_string());
        suggestions.push("Reduce exposure counts for conflicting targets".to_string());
    }

    ConflictResult {
        has_conflicts: !conflicts.is_empty(),
        conflicts,
        suggestions,
    }
}

// ============================================================================
// Parallel Calculations
// ============================================================================

/// Calculate ETAs for all targets in parallel
pub fn calculate_etas_parallel(
    sequence: &SimpleSequence,
    start_time: DateTime<Utc>,
) -> Vec<BatchCalculationResult> {
    let download_time = sequence.estimated_download_time;

    // Use parallel iterator for large sequences
    if sequence.targets.len() > 10 {
        let results: Vec<_> = sequence
            .targets
            .par_iter()
            .enumerate()
            .map(|(idx, target)| {
                let runtime = target.runtime(download_time);
                let offset: i64 = sequence.targets[..idx]
                    .iter()
                    .map(|t| t.runtime(download_time) as i64)
                    .sum();

                let eta_start = start_time + Duration::seconds(offset);
                let eta_end = eta_start + Duration::seconds(runtime as i64);

                BatchCalculationResult {
                    target_id: target.id.clone(),
                    runtime,
                    eta_start: Some(eta_start),
                    eta_end: Some(eta_end),
                }
            })
            .collect();

        results
    } else {
        // Sequential for small sequences
        let mut results = Vec::new();
        let mut current_time = start_time;

        for target in &sequence.targets {
            let runtime = target.runtime(download_time);
            let eta_end = current_time + Duration::seconds(runtime as i64);

            results.push(BatchCalculationResult {
                target_id: target.id.clone(),
                runtime,
                eta_start: Some(current_time),
                eta_end: Some(eta_end),
            });

            current_time = eta_end;
        }

        results
    }
}

/// Calculate visibility windows for all targets in parallel
pub fn calculate_visibility_parallel(
    targets: &[SimpleTarget],
    location: &ObserverLocation,
    date: NaiveDate,
    min_altitude: f64,
) -> Vec<(String, VisibilityWindow)> {
    targets
        .par_iter()
        .map(|target| {
            let window =
                calculate_visibility_window(&target.coordinates, location, date, min_altitude);
            (target.id.clone(), window)
        })
        .collect()
}

/// Get scheduling info for all targets
pub fn get_schedule_info(
    sequence: &SimpleSequence,
    location: &ObserverLocation,
    date: NaiveDate,
) -> Vec<TargetScheduleInfo> {
    sequence
        .targets
        .par_iter()
        .map(|target| {
            let window = calculate_visibility_window(&target.coordinates, location, date, 20.0);
            let quality = if window.is_visible {
                calculate_observation_quality(
                    &target.coordinates,
                    location,
                    window.max_altitude_time,
                )
            } else {
                crate::services::astronomy::ObservationQuality {
                    score: 0.0,
                    altitude_score: 0.0,
                    moon_score: 0.0,
                    twilight_score: 0.0,
                    recommendations: vec!["Target not visible".to_string()],
                }
            };

            let runtime = target.runtime(sequence.estimated_download_time);
            let optimal_start = if window.is_visible {
                // Start 30 minutes before max altitude
                Some(window.max_altitude_time - Duration::minutes((runtime / 60.0 / 2.0) as i64))
            } else {
                None
            };
            let optimal_end = optimal_start.map(|s| s + Duration::seconds(runtime as i64));

            TargetScheduleInfo {
                target_id: target.id.clone(),
                target_name: target.target_name.clone(),
                visibility_window: window,
                optimal_start_time: optimal_start,
                optimal_end_time: optimal_end,
                quality_score: quality.score,
                conflicts: vec![],
            }
        })
        .collect()
}

// ============================================================================
// Helper Functions
// ============================================================================

/// Calculate total runtime for sequence
fn calculate_total_runtime(sequence: &SimpleSequence) -> f64 {
    sequence
        .targets
        .iter()
        .map(|t| t.runtime(sequence.estimated_download_time))
        .sum()
}

/// Apply optimized order to sequence
pub fn apply_optimized_order(sequence: &mut SimpleSequence, order: &[String]) {
    let mut new_targets = Vec::with_capacity(sequence.targets.len());

    for id in order {
        if let Some(target) = sequence.targets.iter().find(|t| &t.id == id) {
            new_targets.push(target.clone());
        }
    }

    sequence.targets = new_targets;
}

/// Merge multiple sequences
pub fn merge_sequences(sequences: &[SimpleSequence], title: Option<String>) -> SimpleSequence {
    let mut merged = SimpleSequence::new(title.unwrap_or_else(|| "Merged Sequence".to_string()));
    merged.targets.clear();

    for seq in sequences {
        for target in &seq.targets {
            let mut new_target = target.clone();
            new_target.id = uuid::Uuid::new_v4().to_string();
            merged.targets.push(new_target);
        }
    }

    if let Some(first) = merged.targets.first() {
        merged.selected_target_id = Some(first.id.clone());
        merged.active_target_id = Some(first.id.clone());
    }

    merged
}

/// Split sequence by target
pub fn split_sequence(sequence: &SimpleSequence) -> Vec<SimpleSequence> {
    sequence
        .targets
        .iter()
        .map(|target| {
            let mut new_seq = SimpleSequence::new(&target.target_name);
            new_seq.targets = vec![target.clone()];
            new_seq.selected_target_id = Some(target.id.clone());
            new_seq.active_target_id = Some(target.id.clone());
            new_seq.start_options = sequence.start_options.clone();
            new_seq.end_options = sequence.end_options.clone();
            new_seq.estimated_download_time = sequence.estimated_download_time;
            new_seq
        })
        .collect()
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
    fn test_optimize_sequence() {
        let seq = SimpleSequence::default();
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();

        let result = optimize_sequence(&seq, &location, date, OptimizationStrategy::MaxAltitude);
        assert!(result.success);
    }

    #[test]
    fn test_detect_conflicts() {
        let seq = SimpleSequence::default();
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();

        let result = detect_conflicts(&seq, &location, date);
        // Default sequence should have minimal conflicts
        assert!(result.conflicts.len() <= 1);
    }

    #[test]
    fn test_calculate_etas_parallel() {
        let seq = SimpleSequence::default();
        let start = Utc::now();

        let results = calculate_etas_parallel(&seq, start);
        assert_eq!(results.len(), seq.targets.len());
    }

    #[test]
    fn test_merge_sequences() {
        let seq1 = SimpleSequence::default();
        let seq2 = SimpleSequence::default();

        let merged = merge_sequences(&[seq1.clone(), seq2.clone()], None);
        assert_eq!(
            merged.targets.len(),
            seq1.targets.len() + seq2.targets.len()
        );
    }

    #[test]
    fn test_split_sequence() {
        let mut seq = SimpleSequence::default();
        seq.targets.push(crate::models::SimpleTarget::default());

        let split = split_sequence(&seq);
        assert_eq!(split.len(), seq.targets.len());
    }
}
