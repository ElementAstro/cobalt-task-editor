//! Logging service for operation tracking

use std::path::PathBuf;
use std::sync::Arc;
use parking_lot::RwLock;
use once_cell::sync::Lazy;
use tokio::fs;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::services::file_service;

/// Log entry
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LogEntry {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub level: LogLevel,
    pub category: String,
    pub message: String,
    pub details: Option<serde_json::Value>,
}

/// Log level
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LogLevel {
    Debug,
    Info,
    Warning,
    Error,
}

/// In-memory log buffer
static LOG_BUFFER: Lazy<Arc<RwLock<Vec<LogEntry>>>> = Lazy::new(|| {
    Arc::new(RwLock::new(Vec::new()))
});

const MAX_BUFFER_SIZE: usize = 1000;

/// Get logs directory
pub fn get_logs_directory() -> PathBuf {
    file_service::get_app_data_directory().join("logs")
}

/// Get current log file path
pub fn get_current_log_path() -> PathBuf {
    let date = Utc::now().format("%Y-%m-%d").to_string();
    get_logs_directory().join(format!("{}.log", date))
}

/// Ensure logs directory exists
pub async fn ensure_logs_directory() -> Result<(), String> {
    fs::create_dir_all(get_logs_directory())
        .await
        .map_err(|e| format!("Failed to create logs directory: {}", e))
}

/// Add log entry
pub fn log_entry(level: LogLevel, category: &str, message: &str, details: Option<serde_json::Value>) {
    let entry = LogEntry {
        id: uuid::Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
        level,
        category: category.to_string(),
        message: message.to_string(),
        details,
    };
    
    let mut buffer = LOG_BUFFER.write();
    buffer.push(entry.clone());
    
    // Trim buffer if too large
    if buffer.len() > MAX_BUFFER_SIZE {
        let drain_count = buffer.len() - MAX_BUFFER_SIZE;
        buffer.drain(0..drain_count);
    }
    
    // Also log to standard log
    match level {
        LogLevel::Debug => log::debug!("[{}] {}", category, message),
        LogLevel::Info => log::info!("[{}] {}", category, message),
        LogLevel::Warning => log::warn!("[{}] {}", category, message),
        LogLevel::Error => log::error!("[{}] {}", category, message),
    }
}

/// Log debug message
pub fn log_debug(category: &str, message: &str) {
    log_entry(LogLevel::Debug, category, message, None);
}

/// Log info message
pub fn log_info(category: &str, message: &str) {
    log_entry(LogLevel::Info, category, message, None);
}

/// Log warning message
pub fn log_warning(category: &str, message: &str) {
    log_entry(LogLevel::Warning, category, message, None);
}

/// Log error message
pub fn log_error(category: &str, message: &str) {
    log_entry(LogLevel::Error, category, message, None);
}

/// Log with details
pub fn log_with_details(level: LogLevel, category: &str, message: &str, details: serde_json::Value) {
    log_entry(level, category, message, Some(details));
}

/// Get recent logs from buffer
pub fn get_recent_logs(count: usize, level_filter: Option<LogLevel>) -> Vec<LogEntry> {
    let buffer = LOG_BUFFER.read();
    
    buffer
        .iter()
        .rev()
        .filter(|entry| {
            if let Some(level) = level_filter {
                entry.level == level
            } else {
                true
            }
        })
        .take(count)
        .cloned()
        .collect()
}

/// Get logs by category
pub fn get_logs_by_category(category: &str, count: usize) -> Vec<LogEntry> {
    let buffer = LOG_BUFFER.read();
    
    buffer
        .iter()
        .rev()
        .filter(|entry| entry.category == category)
        .take(count)
        .cloned()
        .collect()
}

/// Clear log buffer
pub fn clear_log_buffer() {
    LOG_BUFFER.write().clear();
}

/// Flush logs to file
pub async fn flush_logs_to_file() -> Result<usize, String> {
    ensure_logs_directory().await?;
    
    let entries: Vec<LogEntry> = {
        let buffer = LOG_BUFFER.read();
        buffer.clone()
    };
    
    if entries.is_empty() {
        return Ok(0);
    }
    
    let path = get_current_log_path();
    let mut content = String::new();
    
    // Read existing content if file exists
    if path.exists() {
        if let Ok(existing) = fs::read_to_string(&path).await {
            content = existing;
        }
    }
    
    // Append new entries
    for entry in &entries {
        let line = format!(
            "[{}] [{}] [{}] {}{}\n",
            entry.timestamp.format("%Y-%m-%d %H:%M:%S%.3f"),
            format!("{:?}", entry.level).to_uppercase(),
            entry.category,
            entry.message,
            entry.details.as_ref().map(|d| format!(" | {}", d)).unwrap_or_default()
        );
        content.push_str(&line);
    }
    
    fs::write(&path, content)
        .await
        .map_err(|e| format!("Failed to write logs: {}", e))?;
    
    Ok(entries.len())
}

/// Read log file
pub async fn read_log_file(date: &str) -> Result<String, String> {
    let path = get_logs_directory().join(format!("{}.log", date));
    
    if !path.exists() {
        return Ok(String::new());
    }
    
    fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to read log file: {}", e))
}

/// List available log files
pub async fn list_log_files() -> Result<Vec<String>, String> {
    let dir = get_logs_directory();
    
    if !dir.exists() {
        return Ok(Vec::new());
    }
    
    let mut files = Vec::new();
    let mut entries = fs::read_dir(&dir)
        .await
        .map_err(|e| format!("Failed to read logs directory: {}", e))?;
    
    while let Some(entry) = entries.next_entry().await.map_err(|e| e.to_string())? {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("log") {
            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                files.push(stem.to_string());
            }
        }
    }
    
    // Sort by date (newest first)
    files.sort_by(|a, b| b.cmp(a));
    
    Ok(files)
}

/// Clean old log files
pub async fn clean_old_logs(max_age_days: i64) -> Result<usize, String> {
    let dir = get_logs_directory();
    
    if !dir.exists() {
        return Ok(0);
    }
    
    let cutoff = Utc::now() - chrono::Duration::days(max_age_days);
    let cutoff_str = cutoff.format("%Y-%m-%d").to_string();
    
    let mut deleted = 0;
    let mut entries = fs::read_dir(&dir)
        .await
        .map_err(|e| format!("Failed to read logs directory: {}", e))?;
    
    while let Some(entry) = entries.next_entry().await.map_err(|e| e.to_string())? {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("log") {
            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                if stem < cutoff_str.as_str() {
                    if let Err(e) = fs::remove_file(&path).await {
                        log::warn!("Failed to delete old log file {:?}: {}", path, e);
                    } else {
                        deleted += 1;
                    }
                }
            }
        }
    }
    
    Ok(deleted)
}

/// Log operation for tracking user actions
pub fn log_operation(operation: &str, target: &str, success: bool, error: Option<&str>) {
    let level = if success { LogLevel::Info } else { LogLevel::Error };
    let message = if success {
        format!("{} completed: {}", operation, target)
    } else {
        format!("{} failed: {} - {}", operation, target, error.unwrap_or("Unknown error"))
    };
    
    log_entry(level, "operation", &message, Some(serde_json::json!({
        "operation": operation,
        "target": target,
        "success": success,
        "error": error,
    })));
}
