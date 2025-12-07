//! Clipboard commands

use tauri::command;

use crate::models::{EditorSequenceItem, SimpleExposure, SimpleTarget};
use crate::services::clipboard_service::{self, ClipboardContent};

/// Copy target to clipboard
#[command]
pub fn copy_target(target: SimpleTarget) {
    clipboard_service::copy_target(target);
}

/// Copy multiple targets to clipboard
#[command]
pub fn copy_targets(targets: Vec<SimpleTarget>) {
    clipboard_service::copy_targets(targets);
}

/// Copy exposure to clipboard
#[command]
pub fn copy_exposure(exposure: SimpleExposure) {
    clipboard_service::copy_exposure(exposure);
}

/// Copy multiple exposures to clipboard
#[command]
pub fn copy_exposures(exposures: Vec<SimpleExposure>) {
    clipboard_service::copy_exposures(exposures);
}

/// Paste target from clipboard
#[command]
pub fn paste_target() -> Option<SimpleTarget> {
    clipboard_service::paste_target()
}

/// Paste targets from clipboard
#[command]
pub fn paste_targets() -> Option<Vec<SimpleTarget>> {
    clipboard_service::paste_targets()
}

/// Paste exposure from clipboard
#[command]
pub fn paste_exposure() -> Option<SimpleExposure> {
    clipboard_service::paste_exposure()
}

/// Paste exposures from clipboard
#[command]
pub fn paste_exposures() -> Option<Vec<SimpleExposure>> {
    clipboard_service::paste_exposures()
}

/// Check if clipboard has content
#[command]
pub fn has_clipboard_content() -> bool {
    clipboard_service::has_clipboard_content()
}

/// Check if clipboard has specific content type
#[command]
pub fn has_clipboard_content_type(content_type: String) -> bool {
    clipboard_service::has_clipboard_content_type(&content_type)
}

/// Clear clipboard
#[command]
pub fn clear_clipboard() {
    clipboard_service::clear_clipboard();
}

/// Get clipboard content as JSON (for system clipboard sync)
#[command]
pub fn get_clipboard_json() -> Option<String> {
    clipboard_service::serialize_clipboard_content()
}

/// Set clipboard content from JSON (for system clipboard sync)
#[command]
pub fn set_clipboard_json(json: String) -> bool {
    if let Some(content) = clipboard_service::deserialize_clipboard_content(&json) {
        clipboard_service::copy_to_clipboard(content);
        true
    } else {
        false
    }
}

/// Copy sequence item to clipboard
#[command]
pub fn copy_sequence_item(item: EditorSequenceItem) {
    clipboard_service::copy_to_clipboard(ClipboardContent::SequenceItem(item));
}

/// Copy multiple sequence items to clipboard
#[command]
pub fn copy_sequence_items(items: Vec<EditorSequenceItem>) {
    clipboard_service::copy_to_clipboard(ClipboardContent::SequenceItems(items));
}

/// Paste sequence item from clipboard
#[command]
pub fn paste_sequence_item() -> Option<EditorSequenceItem> {
    match clipboard_service::get_clipboard_content()? {
        ClipboardContent::SequenceItem(mut item) => {
            // Generate new IDs
            regenerate_item_ids(&mut item);
            Some(item)
        }
        _ => None,
    }
}

/// Paste sequence items from clipboard
#[command]
pub fn paste_sequence_items() -> Option<Vec<EditorSequenceItem>> {
    match clipboard_service::get_clipboard_content()? {
        ClipboardContent::SequenceItems(items) => Some(
            items
                .into_iter()
                .map(|mut item| {
                    regenerate_item_ids(&mut item);
                    item
                })
                .collect(),
        ),
        ClipboardContent::SequenceItem(mut item) => {
            regenerate_item_ids(&mut item);
            Some(vec![item])
        }
        _ => None,
    }
}

/// Regenerate IDs for sequence item and nested items
fn regenerate_item_ids(item: &mut EditorSequenceItem) {
    item.id = uuid::Uuid::new_v4().to_string();
    item.status = crate::models::SequenceEntityStatus::Created;

    if let Some(items) = &mut item.items {
        for nested in items {
            regenerate_item_ids(nested);
        }
    }

    if let Some(conditions) = &mut item.conditions {
        for condition in conditions {
            condition.id = uuid::Uuid::new_v4().to_string();
        }
    }

    if let Some(triggers) = &mut item.triggers {
        for trigger in triggers {
            trigger.id = uuid::Uuid::new_v4().to_string();
            if let Some(trigger_items) = &mut trigger.trigger_items {
                for trigger_item in trigger_items {
                    regenerate_item_ids(trigger_item);
                }
            }
        }
    }
}
