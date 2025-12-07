//! Backup and recovery commands

use tauri::command;

use crate::models::SimpleSequence;
use crate::services::backup_service::{self, BackupMetadata, BackupType};

/// Create backup
#[command]
pub async fn create_backup(
    sequence: SimpleSequence,
    backup_type: String,
) -> Result<BackupMetadata, String> {
    let backup_type = match backup_type.as_str() {
        "auto" => BackupType::Auto,
        "manual" => BackupType::Manual,
        "before_save" => BackupType::BeforeSave,
        "crash" => BackupType::Crash,
        _ => BackupType::Manual,
    };

    backup_service::create_backup(&sequence, backup_type).await
}

/// List backups
#[command]
pub async fn list_backups(sequence_id: Option<String>) -> Result<Vec<BackupMetadata>, String> {
    backup_service::list_backups(sequence_id.as_deref()).await
}

/// Restore backup
#[command]
pub async fn restore_backup(backup_id: String) -> Result<SimpleSequence, String> {
    backup_service::restore_backup(&backup_id).await
}

/// Delete backup
#[command]
pub async fn delete_backup(backup_id: String) -> Result<(), String> {
    backup_service::delete_backup(&backup_id).await
}

/// Clean old backups
#[command]
pub async fn clean_old_backups(max_age_days: i64, max_count: usize) -> Result<usize, String> {
    backup_service::clean_old_backups(max_age_days, max_count).await
}

/// Save crash recovery data
#[command]
pub async fn save_crash_recovery(sequence: SimpleSequence) -> Result<String, String> {
    backup_service::save_crash_recovery(&sequence).await
}

/// Load crash recovery data
#[command]
pub async fn load_crash_recovery(sequence_id: String) -> Result<Option<SimpleSequence>, String> {
    backup_service::load_crash_recovery(&sequence_id).await
}

/// Clear crash recovery data
#[command]
pub async fn clear_crash_recovery(sequence_id: String) -> Result<(), String> {
    backup_service::clear_crash_recovery(&sequence_id).await
}

/// List crash recovery files
#[command]
pub async fn list_crash_recovery() -> Result<Vec<String>, String> {
    backup_service::list_crash_recovery().await
}

/// Check if crash recovery exists
#[command]
pub async fn has_crash_recovery(sequence_id: String) -> Result<bool, String> {
    let path = backup_service::get_crash_recovery_directory().join(format!("{}.json", sequence_id));
    Ok(path.exists())
}
