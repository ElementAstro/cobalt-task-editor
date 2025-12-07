//! Validation service for sequences and targets

use crate::models::*;

/// Validate a simple sequence
pub fn validate_simple_sequence(sequence: &SimpleSequence) -> ValidationResult {
    let errors = sequence.validate();
    ValidationResult::with_errors(errors)
}

/// Validate an editor sequence
pub fn validate_editor_sequence(sequence: &EditorSequence) -> ValidationResult {
    let errors = sequence.validate();
    ValidationResult::with_errors(errors)
}

/// Validate coordinates
pub fn validate_coordinates(coords: &Coordinates) -> ValidationResult {
    let errors = coords.validate();
    ValidationResult::with_errors(errors)
}

/// Validate a simple target
pub fn validate_simple_target(target: &SimpleTarget) -> ValidationResult {
    let errors = target.validate();
    ValidationResult::with_errors(errors)
}

/// Validate a simple exposure
pub fn validate_simple_exposure(exposure: &SimpleExposure) -> ValidationResult {
    let errors = exposure.validate();
    ValidationResult::with_errors(errors)
}

/// Validate JSON string as NINA sequence
pub fn validate_nina_json(json: &str) -> ValidationResult {
    match serde_json::from_str::<serde_json::Value>(json) {
        Ok(value) => {
            let mut errors = Vec::new();
            let mut warnings = Vec::new();

            // Check for $type field
            if value.get("$type").is_none() {
                errors.push("Missing $type field".to_string());
            } else {
                let type_str = value["$type"].as_str().unwrap_or("");
                if !type_str.contains("Container") {
                    errors.push("Root element must be a container type".to_string());
                }
            }

            // Check for Items structure
            if let Some(items) = value.get("Items") {
                if items.get("$values").is_none() {
                    errors.push("Items collection missing $values array".to_string());
                }
            }

            // Check for common issues
            if value.get("Name").is_none() && value.get("SequenceTitle").is_none() {
                warnings.push("Sequence has no name or title".to_string());
            }

            ValidationResult {
                valid: errors.is_empty(),
                errors,
                warnings,
            }
        }
        Err(e) => ValidationResult::error(format!("Invalid JSON: {}", e)),
    }
}

/// Check if a type string represents a container
pub fn is_container_type(type_str: &str) -> bool {
    type_str.contains("Container")
        || type_str.contains("SmartExposure")
        || type_str.contains("InstructionSet")
}

/// Get short type name from full NINA type string
pub fn get_short_type_name(full_type: &str) -> String {
    // Extract class name from "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer"
    // First, get the part before the comma (the full type path)
    let type_path = full_type.split(',').next().unwrap_or(full_type);

    // Then get the last part after the final dot
    if let Some(pos) = type_path.rfind('.') {
        return type_path[pos + 1..].to_string();
    }
    type_path.to_string()
}

/// Get category from NINA type string
pub fn get_type_category(full_type: &str) -> String {
    // Extract category from "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer"
    // First, get the part before the comma
    let type_path = full_type.split(',').next().unwrap_or(full_type);

    let parts: Vec<&str> = type_path.split('.').collect();
    if parts.len() >= 2 {
        // Category is second to last part
        return parts[parts.len() - 2].to_string();
    }
    "Unknown".to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_short_type_name() {
        assert_eq!(
            get_short_type_name("NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer"),
            "CoolCamera"
        );
    }

    #[test]
    fn test_get_type_category() {
        assert_eq!(
            get_type_category("NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer"),
            "Camera"
        );
    }

    #[test]
    fn test_is_container_type() {
        assert!(is_container_type(
            "NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer"
        ));
        assert!(!is_container_type(
            "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer"
        ));
    }
}
