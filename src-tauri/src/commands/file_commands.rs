//! File operation commands

use std::path::PathBuf;
use tauri::command;

use crate::models::*;
use crate::services::{file_service, serializer, settings_service};

/// Open file dialog and return selected path
#[command]
pub async fn show_open_dialog(
    _title: Option<String>,
    _filters: Option<Vec<FileFilter>>,
    _default_path: Option<String>,
    _multiple: Option<bool>,
) -> Result<Option<Vec<String>>, String> {
    // This will be handled by tauri-plugin-dialog on the frontend
    // This command is for additional processing if needed
    Ok(None)
}

/// Save file dialog and return selected path
#[command]
pub async fn show_save_dialog(
    _title: Option<String>,
    _filters: Option<Vec<FileFilter>>,
    _default_path: Option<String>,
    _default_name: Option<String>,
) -> Result<Option<String>, String> {
    // This will be handled by tauri-plugin-dialog on the frontend
    Ok(None)
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileFilter {
    pub name: String,
    pub extensions: Vec<String>,
}

/// Read file contents
#[command]
pub async fn read_file_contents(path: String) -> Result<String, String> {
    let path = PathBuf::from(&path);
    file_service::read_file(&path)
        .await
        .map_err(|e| e.to_string())
}

/// Write file contents
#[command]
pub async fn write_file_contents(path: String, contents: String) -> Result<(), String> {
    let path = PathBuf::from(&path);
    file_service::write_file(&path, &contents)
        .await
        .map_err(|e| e.to_string())
}

/// Load simple sequence from file
#[command]
pub async fn load_simple_sequence_file(path: String) -> Result<SimpleSequence, String> {
    let path = PathBuf::from(&path);
    let sequence = file_service::load_simple_sequence(&path)
        .await
        .map_err(|e| e.to_string())?;

    // Add to recent files
    settings_service::add_recent_file(&path.display().to_string()).await?;

    // Update last directory
    if let Some(parent) = path.parent() {
        settings_service::set_last_directory(&parent.display().to_string()).await?;
    }

    Ok(sequence)
}

/// Save simple sequence to file
#[command]
pub async fn save_simple_sequence_file(
    path: String,
    sequence: SimpleSequence,
) -> Result<(), String> {
    let path = PathBuf::from(&path);
    file_service::save_simple_sequence(&path, &sequence)
        .await
        .map_err(|e| e.to_string())?;

    // Add to recent files
    settings_service::add_recent_file(&path.display().to_string()).await?;

    // Update last directory
    if let Some(parent) = path.parent() {
        settings_service::set_last_directory(&parent.display().to_string()).await?;
    }

    Ok(())
}

/// Load editor sequence from file
#[command]
pub async fn load_editor_sequence_file(path: String) -> Result<EditorSequence, String> {
    let path = PathBuf::from(&path);
    let sequence = file_service::load_editor_sequence(&path)
        .await
        .map_err(|e| e.to_string())?;

    // Add to recent files
    settings_service::add_recent_file(&path.display().to_string()).await?;

    Ok(sequence)
}

/// Save editor sequence to file
#[command]
pub async fn save_editor_sequence_file(
    path: String,
    sequence: EditorSequence,
) -> Result<(), String> {
    let path = PathBuf::from(&path);
    file_service::save_editor_sequence(&path, &sequence)
        .await
        .map_err(|e| e.to_string())?;

    // Add to recent files
    settings_service::add_recent_file(&path.display().to_string()).await?;

    Ok(())
}

/// Import targets from CSV
#[command]
pub async fn import_targets_csv(path: String) -> Result<Vec<SimpleTarget>, String> {
    let path = PathBuf::from(&path);
    file_service::import_targets_from_csv(&path)
        .await
        .map_err(|e| e.to_string())
}

/// Import targets from CSV content
#[command]
pub async fn import_targets_csv_content(content: String) -> Result<Vec<SimpleTarget>, String> {
    serializer::import_from_csv(&content).map_err(|e| e.to_string())
}

/// Export simple sequence to CSV
#[command]
pub fn export_sequence_csv(sequence: SimpleSequence) -> Result<String, String> {
    serializer::export_to_csv(&sequence).map_err(|e| e.to_string())
}

/// Export simple sequence to XML
#[command]
pub fn export_sequence_xml(sequence: SimpleSequence) -> Result<String, String> {
    serializer::export_to_xml(&sequence).map_err(|e| e.to_string())
}

/// Export simple sequence to NINA target set format
#[command]
pub fn export_sequence_target_set(sequence: SimpleSequence) -> Result<String, String> {
    serializer::export_to_target_set(&sequence).map_err(|e| e.to_string())
}

/// Get file info
#[command]
pub async fn get_file_info(path: String) -> Result<file_service::FileInfo, String> {
    let path = PathBuf::from(&path);
    file_service::get_file_info(&path)
        .await
        .map_err(|e| e.to_string())
}

/// List directory contents
#[command]
pub async fn list_directory(
    path: String,
    extensions: Option<Vec<String>>,
) -> Result<Vec<file_service::FileInfo>, String> {
    let path = PathBuf::from(&path);
    let ext_refs: Option<Vec<&str>> = extensions
        .as_ref()
        .map(|v| v.iter().map(|s| s.as_str()).collect());

    file_service::list_directory(&path, ext_refs.as_deref())
        .await
        .map_err(|e| e.to_string())
}

/// Check if file exists
#[command]
pub async fn file_exists(path: String) -> Result<bool, String> {
    let path = PathBuf::from(&path);
    Ok(file_service::file_exists(&path).await)
}

/// Delete file
#[command]
pub async fn delete_file(path: String) -> Result<(), String> {
    let path = PathBuf::from(&path);
    file_service::delete_file(&path)
        .await
        .map_err(|e| e.to_string())
}

/// Copy file
#[command]
pub async fn copy_file(from: String, to: String) -> Result<(), String> {
    let from = PathBuf::from(&from);
    let to = PathBuf::from(&to);
    file_service::copy_file(&from, &to)
        .await
        .map_err(|e| e.to_string())
}

/// Get default save directory
#[command]
pub fn get_default_save_directory() -> String {
    file_service::get_default_save_directory()
        .display()
        .to_string()
}

/// Get app data directory
#[command]
pub fn get_app_data_directory() -> String {
    file_service::get_app_data_directory().display().to_string()
}

/// Auto-save sequence
#[command]
pub async fn auto_save_sequence(sequence: SimpleSequence) -> Result<String, String> {
    let path = file_service::create_auto_save_path(&sequence.id);

    // Ensure directory exists
    if let Some(parent) = path.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|e| e.to_string())?;
    }

    let contents =
        serializer::serialize_simple_sequence_json(&sequence).map_err(|e| e.to_string())?;

    file_service::write_file(&path, &contents)
        .await
        .map_err(|e| e.to_string())?;

    Ok(path.display().to_string())
}

/// Load auto-saved sequence
#[command]
pub async fn load_auto_save(sequence_id: String) -> Result<Option<SimpleSequence>, String> {
    let path = file_service::create_auto_save_path(&sequence_id);

    if !file_service::file_exists(&path).await {
        return Ok(None);
    }

    let sequence = file_service::load_simple_sequence(&path)
        .await
        .map_err(|e| e.to_string())?;

    Ok(Some(sequence))
}

/// Clear auto-save
#[command]
pub async fn clear_auto_save(sequence_id: String) -> Result<(), String> {
    let path = file_service::create_auto_save_path(&sequence_id);

    if file_service::file_exists(&path).await {
        file_service::delete_file(&path)
            .await
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}
