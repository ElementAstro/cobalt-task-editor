//! Sequence operation commands

use tauri::command;

use crate::models::*;
use crate::services::{serializer, validator};

/// Validate simple sequence
#[command]
pub fn validate_simple_sequence(sequence: SimpleSequence) -> ValidationResult {
    validator::validate_simple_sequence(&sequence)
}

/// Validate editor sequence
#[command]
pub fn validate_editor_sequence(sequence: EditorSequence) -> ValidationResult {
    validator::validate_editor_sequence(&sequence)
}

/// Validate NINA JSON
#[command]
pub fn validate_nina_json(json: String) -> ValidationResult {
    validator::validate_nina_json(&json)
}

/// Validate coordinates
#[command]
pub fn validate_coordinates(coordinates: Coordinates) -> ValidationResult {
    validator::validate_coordinates(&coordinates)
}

/// Serialize simple sequence to JSON
#[command]
pub fn serialize_simple_sequence(sequence: SimpleSequence) -> Result<String, String> {
    serializer::serialize_simple_sequence_json(&sequence).map_err(|e| e.to_string())
}

/// Deserialize simple sequence from JSON
#[command]
pub fn deserialize_simple_sequence(json: String) -> Result<SimpleSequence, String> {
    serializer::deserialize_simple_sequence_json(&json).map_err(|e| e.to_string())
}

/// Serialize editor sequence to JSON
#[command]
pub fn serialize_editor_sequence(sequence: EditorSequence) -> Result<String, String> {
    serializer::serialize_editor_sequence_json(&sequence).map_err(|e| e.to_string())
}

/// Deserialize editor sequence from JSON
#[command]
pub fn deserialize_editor_sequence(json: String) -> Result<EditorSequence, String> {
    serializer::deserialize_editor_sequence_json(&json).map_err(|e| e.to_string())
}

/// Create new simple sequence
#[command]
pub fn create_simple_sequence(title: Option<String>) -> SimpleSequence {
    SimpleSequence::new(title.unwrap_or_else(|| "Target Set".to_string()))
}

/// Create new editor sequence
#[command]
pub fn create_editor_sequence(title: Option<String>) -> EditorSequence {
    EditorSequence::new(title.unwrap_or_else(|| "New Sequence".to_string()))
}

/// Create new target
#[command]
pub fn create_target(name: Option<String>) -> SimpleTarget {
    let mut target = SimpleTarget::default();
    if let Some(n) = name {
        target.name = n.clone();
        target.target_name = n;
    }
    target
}

/// Create new exposure
#[command]
pub fn create_exposure() -> SimpleExposure {
    SimpleExposure::default()
}

/// Duplicate target
#[command]
pub fn duplicate_target(target: SimpleTarget) -> SimpleTarget {
    let mut new_target = target.clone();
    new_target.id = uuid::Uuid::new_v4().to_string();
    new_target.name = format!("{} (Copy)", new_target.name);
    new_target.target_name = format!("{} (Copy)", new_target.target_name);
    
    // Reset progress
    for exposure in &mut new_target.exposures {
        exposure.id = uuid::Uuid::new_v4().to_string();
        exposure.progress_count = 0;
        exposure.status = SequenceEntityStatus::Created;
    }
    new_target.status = SequenceEntityStatus::Created;
    
    new_target
}

/// Duplicate exposure
#[command]
pub fn duplicate_exposure(exposure: SimpleExposure) -> SimpleExposure {
    let mut new_exposure = exposure.clone();
    new_exposure.id = uuid::Uuid::new_v4().to_string();
    new_exposure.progress_count = 0;
    new_exposure.status = SequenceEntityStatus::Created;
    new_exposure
}

/// Copy exposures to all targets
#[command]
pub fn copy_exposures_to_all_targets(
    mut sequence: SimpleSequence,
    source_target_id: String,
) -> Result<SimpleSequence, String> {
    let source_exposures = sequence
        .targets
        .iter()
        .find(|t| t.id == source_target_id)
        .map(|t| t.exposures.clone())
        .ok_or_else(|| "Source target not found".to_string())?;
    
    for target in &mut sequence.targets {
        if target.id != source_target_id {
            target.exposures = source_exposures
                .iter()
                .map(|e| {
                    let mut new_exp = e.clone();
                    new_exp.id = uuid::Uuid::new_v4().to_string();
                    new_exp.progress_count = 0;
                    new_exp.status = SequenceEntityStatus::Created;
                    new_exp
                })
                .collect();
        }
    }
    
    sequence.is_dirty = true;
    Ok(sequence)
}

/// Reset target progress
#[command]
pub fn reset_target_progress(mut target: SimpleTarget) -> SimpleTarget {
    target.status = SequenceEntityStatus::Created;
    for exposure in &mut target.exposures {
        exposure.progress_count = 0;
        exposure.status = SequenceEntityStatus::Created;
    }
    target
}

/// Reset all progress in sequence
#[command]
pub fn reset_sequence_progress(mut sequence: SimpleSequence) -> SimpleSequence {
    for target in &mut sequence.targets {
        target.status = SequenceEntityStatus::Created;
        for exposure in &mut target.exposures {
            exposure.progress_count = 0;
            exposure.status = SequenceEntityStatus::Created;
        }
    }
    sequence.is_dirty = true;
    sequence
}

/// Get sequence statistics
#[command]
pub fn get_sequence_statistics(sequence: SimpleSequence) -> SequenceStatistics {
    let total_targets = sequence.targets.len();
    let total_exposures: i32 = sequence.targets.iter().map(|t| t.total_exposure_count()).sum();
    let remaining_exposures: i32 = sequence.targets.iter().map(|t| t.remaining_exposure_count()).sum();
    let completed_exposures = total_exposures - remaining_exposures;
    let total_runtime = sequence.total_runtime();
    
    let completed_runtime: f64 = sequence
        .targets
        .iter()
        .map(|t| {
            t.exposures
                .iter()
                .map(|e| {
                    if e.enabled {
                        e.progress_count as f64 * (e.exposure_time + sequence.estimated_download_time)
                    } else {
                        0.0
                    }
                })
                .sum::<f64>()
        })
        .sum();
    
    let remaining_runtime = total_runtime - completed_runtime;
    let progress_percentage = if total_exposures > 0 {
        (completed_exposures as f64 / total_exposures as f64) * 100.0
    } else {
        0.0
    };
    
    SequenceStatistics {
        total_targets,
        total_exposures,
        completed_exposures,
        remaining_exposures,
        total_runtime,
        completed_runtime,
        remaining_runtime,
        progress_percentage,
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SequenceStatistics {
    pub total_targets: usize,
    pub total_exposures: i32,
    pub completed_exposures: i32,
    pub remaining_exposures: i32,
    pub total_runtime: f64,
    pub completed_runtime: f64,
    pub remaining_runtime: f64,
    pub progress_percentage: f64,
}

/// Check if type is a container
#[command]
pub fn is_container_type(type_str: String) -> bool {
    validator::is_container_type(&type_str)
}

/// Get short type name
#[command]
pub fn get_short_type_name(full_type: String) -> String {
    validator::get_short_type_name(&full_type)
}

/// Get type category
#[command]
pub fn get_type_category(full_type: String) -> String {
    validator::get_type_category(&full_type)
}

/// Generate new UUID
#[command]
pub fn generate_id() -> String {
    uuid::Uuid::new_v4().to_string()
}
