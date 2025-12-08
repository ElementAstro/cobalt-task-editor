//! File system operations service

use std::path::{Path, PathBuf};
use thiserror::Error;
use tokio::fs;

use crate::models::*;
use crate::services::serializer;

#[derive(Error, Debug)]
pub enum FileError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Serialization error: {0}")]
    Serialization(#[from] serializer::SerializerError),
    #[error("File not found: {0}")]
    NotFound(String),
    #[error("Invalid file format: {0}")]
    InvalidFormat(String),
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
}

pub type Result<T> = std::result::Result<T, FileError>;

/// Read file contents as string
pub async fn read_file(path: &Path) -> Result<String> {
    if !path.exists() {
        return Err(FileError::NotFound(path.display().to_string()));
    }
    Ok(fs::read_to_string(path).await?)
}

/// Write string contents to file
pub async fn write_file(path: &Path, contents: &str) -> Result<()> {
    // Create parent directories if they don't exist
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).await?;
    }
    Ok(fs::write(path, contents).await?)
}

/// Load simple sequence from file
pub async fn load_simple_sequence(path: &Path) -> Result<SimpleSequence> {
    let contents = read_file(path).await?;
    let extension = path.extension().and_then(|e| e.to_str()).unwrap_or("");

    match extension.to_lowercase().as_str() {
        "json" => {
            let mut sequence = serializer::deserialize_simple_sequence_json(&contents)?;
            sequence.save_path = Some(path.display().to_string());
            sequence.is_dirty = false;
            Ok(sequence)
        }
        _ => Err(FileError::InvalidFormat(format!(
            "Unsupported file format: {}",
            extension
        ))),
    }
}

/// Save simple sequence to file
pub async fn save_simple_sequence(path: &Path, sequence: &SimpleSequence) -> Result<()> {
    let extension = path.extension().and_then(|e| e.to_str()).unwrap_or("");

    let contents = match extension.to_lowercase().as_str() {
        "json" => serializer::serialize_simple_sequence_json(sequence)?,
        "csv" => serializer::export_to_csv(sequence)?,
        "xml" | "ninatargetset" => serializer::export_to_xml(sequence)?,
        _ => {
            return Err(FileError::InvalidFormat(format!(
                "Unsupported file format: {}",
                extension
            )))
        }
    };

    write_file(path, &contents).await
}

/// Load editor sequence from file
pub async fn load_editor_sequence(path: &Path) -> Result<EditorSequence> {
    let contents = read_file(path).await?;
    let sequence = serializer::deserialize_editor_sequence_json(&contents)?;
    Ok(sequence)
}

/// Save editor sequence to file
pub async fn save_editor_sequence(path: &Path, sequence: &EditorSequence) -> Result<()> {
    let contents = serializer::serialize_editor_sequence_json(sequence)?;
    write_file(path, &contents).await
}

/// Import targets from CSV file
pub async fn import_targets_from_csv(path: &Path) -> Result<Vec<SimpleTarget>> {
    let contents = read_file(path).await?;
    let targets = serializer::import_from_csv(&contents)?;
    Ok(targets)
}

/// Get file info
pub async fn get_file_info(path: &Path) -> Result<FileInfo> {
    let metadata = fs::metadata(path).await?;

    Ok(FileInfo {
        path: path.display().to_string(),
        name: path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string(),
        extension: path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_string(),
        size: metadata.len(),
        is_directory: metadata.is_dir(),
        modified: metadata
            .modified()
            .ok()
            .map(chrono::DateTime::<chrono::Utc>::from),
    })
}

/// File information
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileInfo {
    pub path: String,
    pub name: String,
    pub extension: String,
    pub size: u64,
    pub is_directory: bool,
    pub modified: Option<chrono::DateTime<chrono::Utc>>,
}

/// List files in directory
/// Optimized: Collect paths first, then process in parallel using tokio::spawn
pub async fn list_directory(path: &Path, extensions: Option<&[&str]>) -> Result<Vec<FileInfo>> {
    let mut entries = fs::read_dir(path).await?;
    let mut paths = Vec::new();

    // Collect all paths first
    while let Some(entry) = entries.next_entry().await? {
        let entry_path = entry.path();

        // Filter by extension if specified
        if let Some(exts) = extensions {
            if let Some(ext) = entry_path.extension().and_then(|e| e.to_str()) {
                if !exts.iter().any(|e| e.eq_ignore_ascii_case(ext)) {
                    continue;
                }
            } else if !entry_path.is_dir() {
                continue;
            }
        }

        paths.push(entry_path);
    }

    // Process paths concurrently using join_all
    let futures: Vec<_> = paths
        .into_iter()
        .map(|p| async move { get_file_info(&p).await.ok() })
        .collect();

    let results = futures::future::join_all(futures).await;
    let mut files: Vec<FileInfo> = results.into_iter().flatten().collect();

    // Sort: directories first, then by name
    files.sort_unstable_by(|a, b| match (a.is_directory, b.is_directory) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });

    Ok(files)
}

/// Check if file exists
pub async fn file_exists(path: &Path) -> bool {
    fs::metadata(path).await.is_ok()
}

/// Delete file
pub async fn delete_file(path: &Path) -> Result<()> {
    Ok(fs::remove_file(path).await?)
}

/// Copy file
pub async fn copy_file(from: &Path, to: &Path) -> Result<()> {
    // Create parent directories if they don't exist
    if let Some(parent) = to.parent() {
        fs::create_dir_all(parent).await?;
    }
    fs::copy(from, to).await?;
    Ok(())
}

/// Get default save directory
pub fn get_default_save_directory() -> PathBuf {
    directories::UserDirs::new()
        .and_then(|dirs| dirs.document_dir().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."))
        .join("NINA")
        .join("Sequences")
}

/// Get app data directory
pub fn get_app_data_directory() -> PathBuf {
    directories::ProjectDirs::from("com", "elementastro", "cobalt-task-editor")
        .map(|dirs| dirs.data_dir().to_path_buf())
        .unwrap_or_else(|| PathBuf::from("."))
}

/// Get auto-save directory
pub fn get_auto_save_directory() -> PathBuf {
    get_app_data_directory().join("autosave")
}

/// Create auto-save file path
pub fn create_auto_save_path(sequence_id: &str) -> PathBuf {
    get_auto_save_directory().join(format!("{}.autosave.json", sequence_id))
}
