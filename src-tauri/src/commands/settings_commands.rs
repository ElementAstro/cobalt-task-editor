//! Settings commands

use tauri::command;

use crate::models::AppSettings;
use crate::services::settings_service;

/// Load settings
#[command]
pub async fn load_settings() -> Result<AppSettings, String> {
    settings_service::load_settings().await
}

/// Save settings
#[command]
pub async fn save_settings(settings: AppSettings) -> Result<(), String> {
    settings_service::save_settings(&settings).await
}

/// Get current settings
#[command]
pub fn get_settings() -> AppSettings {
    settings_service::get_settings()
}

/// Get recent files
#[command]
pub fn get_recent_files() -> Vec<String> {
    settings_service::get_recent_files()
}

/// Add recent file
#[command]
pub async fn add_recent_file(path: String) -> Result<(), String> {
    settings_service::add_recent_file(&path).await
}

/// Remove recent file
#[command]
pub async fn remove_recent_file(path: String) -> Result<(), String> {
    settings_service::remove_recent_file(&path).await
}

/// Clear recent files
#[command]
pub async fn clear_recent_files() -> Result<(), String> {
    settings_service::clear_recent_files().await
}

/// Get last directory
#[command]
pub fn get_last_directory() -> Option<String> {
    settings_service::get_last_directory()
}

/// Set last directory
#[command]
pub async fn set_last_directory(path: String) -> Result<(), String> {
    settings_service::set_last_directory(&path).await
}

/// Save window state
#[command]
pub async fn save_window_state(
    width: u32,
    height: u32,
    x: Option<i32>,
    y: Option<i32>,
    maximized: bool,
) -> Result<(), String> {
    settings_service::save_window_state(width, height, x, y, maximized).await
}

/// Get window state
#[command]
pub fn get_window_state() -> WindowState {
    let (width, height, x, y, maximized) = settings_service::get_window_state();
    WindowState {
        width,
        height,
        x,
        y,
        maximized,
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowState {
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub x: Option<i32>,
    pub y: Option<i32>,
    pub maximized: bool,
}

/// Set theme
#[command]
pub async fn set_theme(theme: String) -> Result<(), String> {
    settings_service::set_theme(&theme).await
}

/// Get theme
#[command]
pub fn get_theme() -> String {
    settings_service::get_theme()
}

/// Set language
#[command]
pub async fn set_language(language: String) -> Result<(), String> {
    settings_service::set_language(&language).await
}

/// Get language
#[command]
pub fn get_language() -> String {
    settings_service::get_language()
}

/// Set estimated download time
#[command]
pub async fn set_estimated_download_time(seconds: f64) -> Result<(), String> {
    settings_service::set_estimated_download_time(seconds).await
}

/// Get estimated download time
#[command]
pub fn get_estimated_download_time() -> f64 {
    settings_service::get_estimated_download_time()
}
