//! Logging commands

use tauri::command;

use crate::services::log_service::{self, LogEntry, LogLevel};

/// Log debug message
#[command]
pub fn log_debug(category: String, message: String) {
    log_service::log_debug(&category, &message);
}

/// Log info message
#[command]
pub fn log_info(category: String, message: String) {
    log_service::log_info(&category, &message);
}

/// Log warning message
#[command]
pub fn log_warning(category: String, message: String) {
    log_service::log_warning(&category, &message);
}

/// Log error message
#[command]
pub fn log_error(category: String, message: String) {
    log_service::log_error(&category, &message);
}

/// Log with details
#[command]
pub fn log_with_details(
    level: String,
    category: String,
    message: String,
    details: serde_json::Value,
) {
    let level = match level.as_str() {
        "debug" => LogLevel::Debug,
        "info" => LogLevel::Info,
        "warning" => LogLevel::Warning,
        "error" => LogLevel::Error,
        _ => LogLevel::Info,
    };
    
    log_service::log_with_details(level, &category, &message, details);
}

/// Log operation
#[command]
pub fn log_operation(
    operation: String,
    target: String,
    success: bool,
    error: Option<String>,
) {
    log_service::log_operation(&operation, &target, success, error.as_deref());
}

/// Get recent logs
#[command]
pub fn get_recent_logs(count: usize, level_filter: Option<String>) -> Vec<LogEntry> {
    let level = level_filter.and_then(|l| match l.as_str() {
        "debug" => Some(LogLevel::Debug),
        "info" => Some(LogLevel::Info),
        "warning" => Some(LogLevel::Warning),
        "error" => Some(LogLevel::Error),
        _ => None,
    });
    
    log_service::get_recent_logs(count, level)
}

/// Get logs by category
#[command]
pub fn get_logs_by_category(category: String, count: usize) -> Vec<LogEntry> {
    log_service::get_logs_by_category(&category, count)
}

/// Clear log buffer
#[command]
pub fn clear_log_buffer() {
    log_service::clear_log_buffer();
}

/// Flush logs to file
#[command]
pub async fn flush_logs() -> Result<usize, String> {
    log_service::flush_logs_to_file().await
}

/// Read log file
#[command]
pub async fn read_log_file(date: String) -> Result<String, String> {
    log_service::read_log_file(&date).await
}

/// List log files
#[command]
pub async fn list_log_files() -> Result<Vec<String>, String> {
    log_service::list_log_files().await
}

/// Clean old logs
#[command]
pub async fn clean_old_logs(max_age_days: i64) -> Result<usize, String> {
    log_service::clean_old_logs(max_age_days).await
}
