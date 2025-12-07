//! Clipboard service for copy/paste operations

use once_cell::sync::Lazy;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::models::{EditorSequenceItem, SimpleExposure, SimpleTarget};

/// Clipboard content types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum ClipboardContent {
    /// Single target
    Target(SimpleTarget),
    /// Multiple targets
    Targets(Vec<SimpleTarget>),
    /// Single exposure
    Exposure(SimpleExposure),
    /// Multiple exposures
    Exposures(Vec<SimpleExposure>),
    /// Editor sequence item
    SequenceItem(EditorSequenceItem),
    /// Multiple editor sequence items
    SequenceItems(Vec<EditorSequenceItem>),
    /// Plain text
    Text(String),
    /// JSON data
    Json(String),
}

/// Internal clipboard storage
static CLIPBOARD: Lazy<Arc<RwLock<Option<ClipboardContent>>>> =
    Lazy::new(|| Arc::new(RwLock::new(None)));

/// Copy content to internal clipboard
pub fn copy_to_clipboard(content: ClipboardContent) {
    *CLIPBOARD.write() = Some(content);
}

/// Get content from internal clipboard
pub fn get_clipboard_content() -> Option<ClipboardContent> {
    CLIPBOARD.read().clone()
}

/// Clear internal clipboard
pub fn clear_clipboard() {
    *CLIPBOARD.write() = None;
}

/// Check if clipboard has content
pub fn has_clipboard_content() -> bool {
    CLIPBOARD.read().is_some()
}

/// Check if clipboard has specific content type
pub fn has_clipboard_content_type(content_type: &str) -> bool {
    if let Some(content) = CLIPBOARD.read().as_ref() {
        matches!(
            (content_type, content),
            ("target", ClipboardContent::Target(_))
                | ("targets", ClipboardContent::Targets(_))
                | ("exposure", ClipboardContent::Exposure(_))
                | ("exposures", ClipboardContent::Exposures(_))
                | ("sequence_item", ClipboardContent::SequenceItem(_))
                | ("sequence_items", ClipboardContent::SequenceItems(_))
                | ("text", ClipboardContent::Text(_))
                | ("json", ClipboardContent::Json(_))
        )
    } else {
        false
    }
}

/// Copy target to clipboard
pub fn copy_target(target: SimpleTarget) {
    copy_to_clipboard(ClipboardContent::Target(target));
}

/// Copy multiple targets to clipboard
pub fn copy_targets(targets: Vec<SimpleTarget>) {
    copy_to_clipboard(ClipboardContent::Targets(targets));
}

/// Copy exposure to clipboard
pub fn copy_exposure(exposure: SimpleExposure) {
    copy_to_clipboard(ClipboardContent::Exposure(exposure));
}

/// Copy multiple exposures to clipboard
pub fn copy_exposures(exposures: Vec<SimpleExposure>) {
    copy_to_clipboard(ClipboardContent::Exposures(exposures));
}

/// Paste target from clipboard
pub fn paste_target() -> Option<SimpleTarget> {
    match get_clipboard_content()? {
        ClipboardContent::Target(mut target) => {
            // Generate new ID for pasted target
            target.id = uuid::Uuid::new_v4().to_string();
            target.name = format!("{} (Copy)", target.name);
            target.target_name = format!("{} (Copy)", target.target_name);
            // Reset progress
            for exp in &mut target.exposures {
                exp.id = uuid::Uuid::new_v4().to_string();
                exp.progress_count = 0;
                exp.status = crate::models::SequenceEntityStatus::Created;
            }
            target.status = crate::models::SequenceEntityStatus::Created;
            Some(target)
        }
        _ => None,
    }
}

/// Paste targets from clipboard
pub fn paste_targets() -> Option<Vec<SimpleTarget>> {
    match get_clipboard_content()? {
        ClipboardContent::Targets(targets) => Some(
            targets
                .into_iter()
                .map(|mut target| {
                    target.id = uuid::Uuid::new_v4().to_string();
                    target.name = format!("{} (Copy)", target.name);
                    target.target_name = format!("{} (Copy)", target.target_name);
                    for exp in &mut target.exposures {
                        exp.id = uuid::Uuid::new_v4().to_string();
                        exp.progress_count = 0;
                        exp.status = crate::models::SequenceEntityStatus::Created;
                    }
                    target.status = crate::models::SequenceEntityStatus::Created;
                    target
                })
                .collect(),
        ),
        ClipboardContent::Target(mut target) => {
            target.id = uuid::Uuid::new_v4().to_string();
            target.name = format!("{} (Copy)", target.name);
            target.target_name = format!("{} (Copy)", target.target_name);
            for exp in &mut target.exposures {
                exp.id = uuid::Uuid::new_v4().to_string();
                exp.progress_count = 0;
                exp.status = crate::models::SequenceEntityStatus::Created;
            }
            target.status = crate::models::SequenceEntityStatus::Created;
            Some(vec![target])
        }
        _ => None,
    }
}

/// Paste exposure from clipboard
pub fn paste_exposure() -> Option<SimpleExposure> {
    match get_clipboard_content()? {
        ClipboardContent::Exposure(mut exposure) => {
            exposure.id = uuid::Uuid::new_v4().to_string();
            exposure.progress_count = 0;
            exposure.status = crate::models::SequenceEntityStatus::Created;
            Some(exposure)
        }
        _ => None,
    }
}

/// Paste exposures from clipboard
pub fn paste_exposures() -> Option<Vec<SimpleExposure>> {
    match get_clipboard_content()? {
        ClipboardContent::Exposures(exposures) => Some(
            exposures
                .into_iter()
                .map(|mut exp| {
                    exp.id = uuid::Uuid::new_v4().to_string();
                    exp.progress_count = 0;
                    exp.status = crate::models::SequenceEntityStatus::Created;
                    exp
                })
                .collect(),
        ),
        ClipboardContent::Exposure(mut exposure) => {
            exposure.id = uuid::Uuid::new_v4().to_string();
            exposure.progress_count = 0;
            exposure.status = crate::models::SequenceEntityStatus::Created;
            Some(vec![exposure])
        }
        _ => None,
    }
}

/// Serialize clipboard content to JSON for system clipboard
pub fn serialize_clipboard_content() -> Option<String> {
    let content = get_clipboard_content()?;
    serde_json::to_string(&content).ok()
}

/// Deserialize clipboard content from JSON
pub fn deserialize_clipboard_content(json: &str) -> Option<ClipboardContent> {
    serde_json::from_str(json).ok()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::*;

    fn create_test_target() -> SimpleTarget {
        let mut target = SimpleTarget::default();
        target.name = "Test Target".to_string();
        target.target_name = "M31".to_string();
        target
    }

    fn create_test_exposure() -> SimpleExposure {
        let mut exp = SimpleExposure::default();
        exp.exposure_time = 60.0;
        exp.total_count = 10;
        exp
    }

    #[test]
    fn test_copy_paste_target() {
        let target = create_test_target();
        let original_id = target.id.clone();

        copy_target(target);
        assert!(has_clipboard_content());
        assert!(has_clipboard_content_type("target"));

        let pasted = paste_target().unwrap();
        assert_ne!(pasted.id, original_id);
        assert!(pasted.name.contains("Copy"));
    }

    #[test]
    fn test_copy_paste_exposure() {
        let exposure = create_test_exposure();
        let original_id = exposure.id.clone();

        copy_exposure(exposure);
        assert!(has_clipboard_content());

        let pasted = paste_exposure().unwrap();
        assert_ne!(pasted.id, original_id);
        assert_eq!(pasted.progress_count, 0);
    }

    #[test]
    fn test_clear_clipboard() {
        copy_target(create_test_target());
        assert!(has_clipboard_content());

        clear_clipboard();
        assert!(!has_clipboard_content());
    }

    #[test]
    fn test_serialize_deserialize() {
        copy_target(create_test_target());

        let json = serialize_clipboard_content().unwrap();
        clear_clipboard();

        let content = deserialize_clipboard_content(&json).unwrap();
        copy_to_clipboard(content);

        assert!(has_clipboard_content());
    }
}
