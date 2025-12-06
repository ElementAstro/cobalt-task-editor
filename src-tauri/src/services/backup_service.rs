//! Backup and recovery service

use std::path::PathBuf;
use tokio::fs;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc, Duration};

use crate::models::SimpleSequence;
use crate::services::file_service;

/// Backup metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupMetadata {
    pub id: String,
    pub sequence_id: String,
    pub sequence_title: String,
    pub created_at: DateTime<Utc>,
    pub file_path: String,
    pub file_size: u64,
    pub backup_type: BackupType,
}

/// Backup type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum BackupType {
    Auto,
    Manual,
    BeforeSave,
    Crash,
}

/// Get backups directory
pub fn get_backups_directory() -> PathBuf {
    file_service::get_app_data_directory().join("backups")
}

/// Get crash recovery directory
pub fn get_crash_recovery_directory() -> PathBuf {
    file_service::get_app_data_directory().join("crash_recovery")
}

/// Ensure backup directories exist
pub async fn ensure_backup_directories() -> Result<(), String> {
    fs::create_dir_all(get_backups_directory())
        .await
        .map_err(|e| format!("Failed to create backups directory: {}", e))?;
    
    fs::create_dir_all(get_crash_recovery_directory())
        .await
        .map_err(|e| format!("Failed to create crash recovery directory: {}", e))?;
    
    Ok(())
}

/// Create backup of sequence
pub async fn create_backup(
    sequence: &SimpleSequence,
    backup_type: BackupType,
) -> Result<BackupMetadata, String> {
    ensure_backup_directories().await?;
    
    let id = uuid::Uuid::new_v4().to_string();
    let now = Utc::now();
    let filename = format!(
        "{}_{}.json",
        sequence.id,
        now.format("%Y%m%d_%H%M%S")
    );
    let path = get_backups_directory().join(&filename);
    
    let content = serde_json::to_string_pretty(sequence)
        .map_err(|e| format!("Failed to serialize sequence: {}", e))?;
    
    fs::write(&path, &content)
        .await
        .map_err(|e| format!("Failed to write backup: {}", e))?;
    
    let metadata = BackupMetadata {
        id,
        sequence_id: sequence.id.clone(),
        sequence_title: sequence.title.clone(),
        created_at: now,
        file_path: path.display().to_string(),
        file_size: content.len() as u64,
        backup_type,
    };
    
    // Save metadata
    let metadata_path = path.with_extension("meta.json");
    let metadata_content = serde_json::to_string_pretty(&metadata)
        .map_err(|e| format!("Failed to serialize metadata: {}", e))?;
    
    fs::write(&metadata_path, metadata_content)
        .await
        .map_err(|e| format!("Failed to write metadata: {}", e))?;
    
    Ok(metadata)
}

/// List backups for a sequence
pub async fn list_backups(sequence_id: Option<&str>) -> Result<Vec<BackupMetadata>, String> {
    let dir = get_backups_directory();
    
    if !dir.exists() {
        return Ok(Vec::new());
    }
    
    let mut backups = Vec::new();
    let mut entries = fs::read_dir(&dir)
        .await
        .map_err(|e| format!("Failed to read backups directory: {}", e))?;
    
    while let Some(entry) = entries.next_entry().await.map_err(|e| e.to_string())? {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("json") 
            && !path.to_string_lossy().contains(".meta.") 
        {
            let meta_path = path.with_extension("meta.json");
            if let Ok(content) = fs::read_to_string(&meta_path).await {
                if let Ok(metadata) = serde_json::from_str::<BackupMetadata>(&content) {
                    // Filter by sequence_id if provided
                    if sequence_id.is_none() || sequence_id == Some(&metadata.sequence_id) {
                        backups.push(metadata);
                    }
                }
            }
        }
    }
    
    // Sort by creation time (newest first)
    backups.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    
    Ok(backups)
}

/// Restore backup
pub async fn restore_backup(backup_id: &str) -> Result<SimpleSequence, String> {
    let backups = list_backups(None).await?;
    
    let backup = backups
        .iter()
        .find(|b| b.id == backup_id)
        .ok_or_else(|| "Backup not found".to_string())?;
    
    let content = fs::read_to_string(&backup.file_path)
        .await
        .map_err(|e| format!("Failed to read backup: {}", e))?;
    
    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse backup: {}", e))
}

/// Delete backup
pub async fn delete_backup(backup_id: &str) -> Result<(), String> {
    let backups = list_backups(None).await?;
    
    let backup = backups
        .iter()
        .find(|b| b.id == backup_id)
        .ok_or_else(|| "Backup not found".to_string())?;
    
    let path = PathBuf::from(&backup.file_path);
    let meta_path = path.with_extension("meta.json");
    
    if path.exists() {
        fs::remove_file(&path)
            .await
            .map_err(|e| format!("Failed to delete backup: {}", e))?;
    }
    
    if meta_path.exists() {
        fs::remove_file(&meta_path)
            .await
            .map_err(|e| format!("Failed to delete metadata: {}", e))?;
    }
    
    Ok(())
}

/// Clean old backups (keep only recent ones)
pub async fn clean_old_backups(
    max_age_days: i64,
    max_count: usize,
) -> Result<usize, String> {
    let backups = list_backups(None).await?;
    let cutoff = Utc::now() - Duration::days(max_age_days);
    
    let mut deleted = 0;
    
    // Delete old backups
    for backup in &backups {
        if backup.created_at < cutoff {
            if let Err(e) = delete_backup(&backup.id).await {
                log::warn!("Failed to delete old backup {}: {}", backup.id, e);
            } else {
                deleted += 1;
            }
        }
    }
    
    // If still too many, delete oldest
    let remaining = list_backups(None).await?;
    if remaining.len() > max_count {
        let to_delete = remaining.len() - max_count;
        for backup in remaining.iter().rev().take(to_delete) {
            if let Err(e) = delete_backup(&backup.id).await {
                log::warn!("Failed to delete excess backup {}: {}", backup.id, e);
            } else {
                deleted += 1;
            }
        }
    }
    
    Ok(deleted)
}

/// Save crash recovery data
pub async fn save_crash_recovery(sequence: &SimpleSequence) -> Result<String, String> {
    ensure_backup_directories().await?;
    
    let path = get_crash_recovery_directory().join(format!("{}.json", sequence.id));
    
    let content = serde_json::to_string_pretty(sequence)
        .map_err(|e| format!("Failed to serialize sequence: {}", e))?;
    
    fs::write(&path, content)
        .await
        .map_err(|e| format!("Failed to write crash recovery: {}", e))?;
    
    Ok(path.display().to_string())
}

/// Load crash recovery data
pub async fn load_crash_recovery(sequence_id: &str) -> Result<Option<SimpleSequence>, String> {
    let path = get_crash_recovery_directory().join(format!("{}.json", sequence_id));
    
    if !path.exists() {
        return Ok(None);
    }
    
    let content = fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to read crash recovery: {}", e))?;
    
    let sequence = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse crash recovery: {}", e))?;
    
    Ok(Some(sequence))
}

/// Clear crash recovery data
pub async fn clear_crash_recovery(sequence_id: &str) -> Result<(), String> {
    let path = get_crash_recovery_directory().join(format!("{}.json", sequence_id));
    
    if path.exists() {
        fs::remove_file(&path)
            .await
            .map_err(|e| format!("Failed to delete crash recovery: {}", e))?;
    }
    
    Ok(())
}

/// List all crash recovery files
pub async fn list_crash_recovery() -> Result<Vec<String>, String> {
    let dir = get_crash_recovery_directory();
    
    if !dir.exists() {
        return Ok(Vec::new());
    }
    
    let mut ids = Vec::new();
    let mut entries = fs::read_dir(&dir)
        .await
        .map_err(|e| format!("Failed to read crash recovery directory: {}", e))?;
    
    while let Some(entry) = entries.next_entry().await.map_err(|e| e.to_string())? {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("json") {
            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                ids.push(stem.to_string());
            }
        }
    }
    
    Ok(ids)
}
