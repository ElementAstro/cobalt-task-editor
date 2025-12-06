//! Application settings service

use std::path::PathBuf;
use std::sync::Arc;
use parking_lot::RwLock;
use once_cell::sync::Lazy;
use tokio::fs;

use crate::models::AppSettings;
use crate::services::file_service;

/// Global settings instance
static SETTINGS: Lazy<Arc<RwLock<AppSettings>>> = Lazy::new(|| {
    Arc::new(RwLock::new(AppSettings::default()))
});

/// Get settings file path
fn get_settings_path() -> PathBuf {
    file_service::get_app_data_directory().join("settings.json")
}

/// Load settings from file
pub async fn load_settings() -> Result<AppSettings, String> {
    let path = get_settings_path();
    
    if !path.exists() {
        let settings = AppSettings::default();
        save_settings(&settings).await?;
        return Ok(settings);
    }
    
    let contents = fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to read settings: {}", e))?;
    
    let settings: AppSettings = serde_json::from_str(&contents)
        .map_err(|e| format!("Failed to parse settings: {}", e))?;
    
    // Update global instance
    *SETTINGS.write() = settings.clone();
    
    Ok(settings)
}

/// Save settings to file
pub async fn save_settings(settings: &AppSettings) -> Result<(), String> {
    let path = get_settings_path();
    
    // Create parent directory if it doesn't exist
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("Failed to create settings directory: {}", e))?;
    }
    
    let contents = serde_json::to_string_pretty(settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    
    fs::write(&path, contents)
        .await
        .map_err(|e| format!("Failed to write settings: {}", e))?;
    
    // Update global instance
    *SETTINGS.write() = settings.clone();
    
    Ok(())
}

/// Get current settings
pub fn get_settings() -> AppSettings {
    SETTINGS.read().clone()
}

/// Update settings
pub async fn update_settings<F>(updater: F) -> Result<AppSettings, String>
where
    F: FnOnce(&mut AppSettings),
{
    let mut settings = get_settings();
    updater(&mut settings);
    save_settings(&settings).await?;
    Ok(settings)
}

/// Add file to recent files list
pub async fn add_recent_file(path: &str) -> Result<(), String> {
    update_settings(|settings| {
        // Remove if already exists
        settings.recent_files.retain(|p| p != path);
        // Add to front
        settings.recent_files.insert(0, path.to_string());
        // Trim to max size
        settings.recent_files.truncate(settings.max_recent_files);
    }).await?;
    Ok(())
}

/// Remove file from recent files list
pub async fn remove_recent_file(path: &str) -> Result<(), String> {
    update_settings(|settings| {
        settings.recent_files.retain(|p| p != path);
    }).await?;
    Ok(())
}

/// Clear recent files list
pub async fn clear_recent_files() -> Result<(), String> {
    update_settings(|settings| {
        settings.recent_files.clear();
    }).await?;
    Ok(())
}

/// Get recent files
pub fn get_recent_files() -> Vec<String> {
    SETTINGS.read().recent_files.clone()
}

/// Update last directory
pub async fn set_last_directory(path: &str) -> Result<(), String> {
    update_settings(|settings| {
        settings.last_directory = Some(path.to_string());
    }).await?;
    Ok(())
}

/// Get last directory
pub fn get_last_directory() -> Option<String> {
    SETTINGS.read().last_directory.clone()
}

/// Update window state
pub async fn save_window_state(
    width: u32,
    height: u32,
    x: Option<i32>,
    y: Option<i32>,
    maximized: bool,
) -> Result<(), String> {
    update_settings(|settings| {
        settings.window_width = Some(width);
        settings.window_height = Some(height);
        settings.window_x = x;
        settings.window_y = y;
        settings.window_maximized = maximized;
    }).await?;
    Ok(())
}

/// Get window state
pub fn get_window_state() -> (Option<u32>, Option<u32>, Option<i32>, Option<i32>, bool) {
    let settings = SETTINGS.read();
    (
        settings.window_width,
        settings.window_height,
        settings.window_x,
        settings.window_y,
        settings.window_maximized,
    )
}

/// Update theme
pub async fn set_theme(theme: &str) -> Result<(), String> {
    update_settings(|settings| {
        settings.theme = theme.to_string();
    }).await?;
    Ok(())
}

/// Get theme
pub fn get_theme() -> String {
    SETTINGS.read().theme.clone()
}

/// Update language
pub async fn set_language(language: &str) -> Result<(), String> {
    update_settings(|settings| {
        settings.language = language.to_string();
    }).await?;
    Ok(())
}

/// Get language
pub fn get_language() -> String {
    SETTINGS.read().language.clone()
}

/// Update estimated download time
pub async fn set_estimated_download_time(seconds: f64) -> Result<(), String> {
    update_settings(|settings| {
        settings.estimated_download_time = seconds;
    }).await?;
    Ok(())
}

/// Get estimated download time
pub fn get_estimated_download_time() -> f64 {
    SETTINGS.read().estimated_download_time
}
