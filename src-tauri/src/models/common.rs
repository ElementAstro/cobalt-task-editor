//! Common types and enums used across the application

use serde::{Deserialize, Serialize};

/// Status of a sequence entity
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SequenceEntityStatus {
    #[default]
    Created,
    Running,
    Finished,
    Failed,
    Skipped,
    Disabled,
}

/// Error behavior for instructions
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum InstructionErrorBehavior {
    #[default]
    ContinueOnError,
    AbortOnError,
    SkipInstructionSetOnError,
    SkipToSequenceEndInstructions,
}

/// Execution strategy type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum ExecutionStrategyType {
    #[default]
    Sequential,
    Parallel,
}

/// Image type for exposures
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ImageType {
    #[default]
    Light,
    Dark,
    Bias,
    Flat,
    Snapshot,
}

impl std::fmt::Display for ImageType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ImageType::Light => write!(f, "LIGHT"),
            ImageType::Dark => write!(f, "DARK"),
            ImageType::Bias => write!(f, "BIAS"),
            ImageType::Flat => write!(f, "FLAT"),
            ImageType::Snapshot => write!(f, "SNAPSHOT"),
        }
    }
}

/// Sequence mode
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SequenceMode {
    #[default]
    Standard,
    Rotate,
}

/// Binning mode for camera
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct BinningMode {
    pub x: i32,
    pub y: i32,
}

impl Default for BinningMode {
    fn default() -> Self {
        Self { x: 1, y: 1 }
    }
}

/// Filter information
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FilterInfo {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub position: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub focus_offset: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auto_focus_exposure_time: Option<f64>,
}

/// Application settings
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    /// Last opened directory
    pub last_directory: Option<String>,
    /// Recent files list
    pub recent_files: Vec<String>,
    /// Maximum recent files to keep
    pub max_recent_files: usize,
    /// Auto-save enabled
    pub auto_save_enabled: bool,
    /// Auto-save interval in seconds
    pub auto_save_interval: u32,
    /// Window width
    pub window_width: Option<u32>,
    /// Window height
    pub window_height: Option<u32>,
    /// Window x position
    pub window_x: Option<i32>,
    /// Window y position
    pub window_y: Option<i32>,
    /// Window maximized state
    pub window_maximized: bool,
    /// Theme preference
    pub theme: String,
    /// Language preference
    pub language: String,
    /// Estimated download time in seconds
    pub estimated_download_time: f64,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            last_directory: None,
            recent_files: Vec::new(),
            max_recent_files: 10,
            auto_save_enabled: true,
            auto_save_interval: 300,
            window_width: Some(1280),
            window_height: Some(800),
            window_x: None,
            window_y: None,
            window_maximized: false,
            theme: "system".to_string(),
            language: "en".to_string(),
            estimated_download_time: 5.0,
        }
    }
}

/// File format types supported
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum FileFormat {
    Json,
    Csv,
    Xml,
    NinaJson,
    NinaTargetSet,
}

impl FileFormat {
    pub fn extension(&self) -> &'static str {
        match self {
            FileFormat::Json => "json",
            FileFormat::Csv => "csv",
            FileFormat::Xml => "xml",
            FileFormat::NinaJson => "json",
            FileFormat::NinaTargetSet => "ninaTargetSet",
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            FileFormat::Json => "JSON Files",
            FileFormat::Csv => "CSV Files",
            FileFormat::Xml => "XML Files",
            FileFormat::NinaJson => "NINA Sequence Files",
            FileFormat::NinaTargetSet => "NINA Target Set Files",
        }
    }
}

/// Result of a validation operation
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationResult {
    pub valid: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

impl ValidationResult {
    pub fn ok() -> Self {
        Self {
            valid: true,
            errors: Vec::new(),
            warnings: Vec::new(),
        }
    }

    pub fn error(message: impl Into<String>) -> Self {
        Self {
            valid: false,
            errors: vec![message.into()],
            warnings: Vec::new(),
        }
    }

    pub fn with_errors(errors: Vec<String>) -> Self {
        Self {
            valid: errors.is_empty(),
            errors,
            warnings: Vec::new(),
        }
    }
}
