//! NINA format commands

use std::path::PathBuf;
use tauri::command;

use crate::models::EditorSequence;
use crate::services::{file_service, nina_serializer};

/// Export editor sequence to NINA JSON format
#[command]
pub fn export_to_nina_json(sequence: EditorSequence) -> Result<String, String> {
    nina_serializer::export_to_nina(&sequence)
}

/// Import NINA JSON to editor sequence
#[command]
pub fn import_from_nina_json(json: String) -> Result<EditorSequence, String> {
    nina_serializer::import_from_nina(&json)
}

/// Validate NINA JSON format
#[command]
pub fn validate_nina_format(json: String) -> Result<(), Vec<String>> {
    nina_serializer::validate_nina_json(&json)
}

/// Save editor sequence to NINA JSON file
#[command]
pub async fn save_nina_sequence_file(path: String, sequence: EditorSequence) -> Result<(), String> {
    let json = nina_serializer::export_to_nina(&sequence)?;
    let path = PathBuf::from(&path);
    file_service::write_file(&path, &json)
        .await
        .map_err(|e| e.to_string())
}

/// Load editor sequence from NINA JSON file
#[command]
pub async fn load_nina_sequence_file(path: String) -> Result<EditorSequence, String> {
    let path = PathBuf::from(&path);
    let content = file_service::read_file(&path)
        .await
        .map_err(|e| e.to_string())?;
    nina_serializer::import_from_nina(&content)
}

/// Export template to NINA format
#[command]
pub fn export_template_to_nina(
    items: Vec<crate::models::EditorSequenceItem>,
    name: String,
) -> Result<String, String> {
    // Create a temporary sequence with just target items
    let sequence = EditorSequence {
        id: uuid::Uuid::new_v4().to_string(),
        title: name,
        start_items: Vec::new(),
        target_items: items,
        end_items: Vec::new(),
        global_triggers: Vec::new(),
    };

    nina_serializer::export_to_nina(&sequence)
}

/// Get NINA type short name
#[command]
pub fn get_nina_type_short_name(full_type: String) -> String {
    // Extract from "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer"
    if let Some(pos) = full_type.rfind('.') {
        let after_dot = &full_type[pos + 1..];
        if let Some(comma_pos) = after_dot.find(',') {
            return after_dot[..comma_pos].to_string();
        }
        return after_dot.to_string();
    }
    full_type
}

/// Get NINA type category
#[command]
pub fn get_nina_type_category(full_type: String) -> String {
    // Extract from "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer"
    let parts: Vec<&str> = full_type.split('.').collect();
    if parts.len() >= 4 {
        let category = parts[parts.len() - 2];
        if let Some(comma_pos) = category.find(',') {
            return category[..comma_pos].to_string();
        }
        return category.to_string();
    }
    "Unknown".to_string()
}

/// Check if NINA type is a container
#[command]
pub fn is_nina_container_type(type_str: String) -> bool {
    type_str.contains("Container")
        || type_str.contains("SmartExposure")
        || type_str.contains("InstructionSet")
        || type_str.contains("DeepSkyObject")
}

/// Get all NINA type categories
#[command]
pub fn get_nina_categories() -> Vec<String> {
    vec![
        "Camera".to_string(),
        "Dome".to_string(),
        "FilterWheel".to_string(),
        "Focuser".to_string(),
        "Guider".to_string(),
        "Imaging".to_string(),
        "Mount".to_string(),
        "Platesolving".to_string(),
        "Rotator".to_string(),
        "SafetyMonitor".to_string(),
        "Switch".to_string(),
        "Telescope".to_string(),
        "Utility".to_string(),
        "Weather".to_string(),
        "Container".to_string(),
        "Condition".to_string(),
        "Trigger".to_string(),
    ]
}
