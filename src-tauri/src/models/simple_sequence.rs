//! Simple Sequence types (Target Set)
//! 
//! These types represent the simplified NINA sequence format
//! used for basic target and exposure management.

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use super::common::{BinningMode, FilterInfo, ImageType, SequenceEntityStatus, SequenceMode};
use super::coordinates::Coordinates;

/// Simple exposure settings
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimpleExposure {
    pub id: String,
    pub enabled: bool,
    pub status: SequenceEntityStatus,
    
    // Exposure settings
    pub exposure_time: f64,
    pub image_type: ImageType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filter: Option<FilterInfo>,
    pub binning: BinningMode,
    pub gain: i32,
    pub offset: i32,
    
    // Progress
    pub total_count: i32,
    pub progress_count: i32,
    
    // Dithering
    pub dither: bool,
    pub dither_every: i32,
}

impl Default for SimpleExposure {
    fn default() -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            enabled: true,
            status: SequenceEntityStatus::Created,
            exposure_time: 60.0,
            image_type: ImageType::Light,
            filter: None,
            binning: BinningMode::default(),
            gain: -1,
            offset: -1,
            total_count: 10,
            progress_count: 0,
            dither: false,
            dither_every: 1,
        }
    }
}

impl SimpleExposure {
    /// Calculate remaining exposures
    pub fn remaining(&self) -> i32 {
        (self.total_count - self.progress_count).max(0)
    }

    /// Calculate runtime in seconds
    pub fn runtime(&self, download_time: f64) -> f64 {
        if !self.enabled {
            return 0.0;
        }
        let remaining = self.remaining() as f64;
        remaining * (self.exposure_time + download_time)
    }

    /// Validate the exposure
    pub fn validate(&self) -> Vec<String> {
        let mut errors = Vec::new();

        if self.exposure_time <= 0.0 {
            errors.push("Exposure time must be positive".to_string());
        }
        if self.total_count < 0 {
            errors.push("Total count cannot be negative".to_string());
        }
        if self.progress_count < 0 {
            errors.push("Progress count cannot be negative".to_string());
        }
        if self.dither_every < 1 {
            errors.push("Dither every must be at least 1".to_string());
        }

        errors
    }
}

/// Simple target (DSO container)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimpleTarget {
    pub id: String,
    pub name: String,
    pub status: SequenceEntityStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file_name: Option<String>,
    
    // Target info
    pub target_name: String,
    pub coordinates: Coordinates,
    pub position_angle: f64,
    pub rotation: f64,
    
    // Target options
    pub delay: i32,
    pub mode: SequenceMode,
    pub slew_to_target: bool,
    pub center_target: bool,
    pub rotate_target: bool,
    pub start_guiding: bool,
    
    // Autofocus options
    pub auto_focus_on_start: bool,
    pub auto_focus_on_filter_change: bool,
    pub auto_focus_after_set_time: bool,
    pub auto_focus_set_time: i32,
    pub auto_focus_after_set_exposures: bool,
    pub auto_focus_set_exposures: i32,
    pub auto_focus_after_temperature_change: bool,
    pub auto_focus_after_temperature_change_amount: f64,
    pub auto_focus_after_hfr_change: bool,
    pub auto_focus_after_hfr_change_amount: f64,
    
    // Exposures
    pub exposures: Vec<SimpleExposure>,
    
    // ETA
    #[serde(skip_serializing_if = "Option::is_none")]
    pub estimated_start_time: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub estimated_end_time: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub estimated_duration: Option<f64>,
}

impl Default for SimpleTarget {
    fn default() -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name: "Target".to_string(),
            status: SequenceEntityStatus::Created,
            file_name: None,
            target_name: "Target".to_string(),
            coordinates: Coordinates::default(),
            position_angle: 0.0,
            rotation: 0.0,
            delay: 0,
            mode: SequenceMode::Standard,
            slew_to_target: true,
            center_target: true,
            rotate_target: false,
            start_guiding: true,
            auto_focus_on_start: true,
            auto_focus_on_filter_change: false,
            auto_focus_after_set_time: false,
            auto_focus_set_time: 30,
            auto_focus_after_set_exposures: false,
            auto_focus_set_exposures: 10,
            auto_focus_after_temperature_change: false,
            auto_focus_after_temperature_change_amount: 1.0,
            auto_focus_after_hfr_change: false,
            auto_focus_after_hfr_change_amount: 15.0,
            exposures: vec![SimpleExposure::default()],
            estimated_start_time: None,
            estimated_end_time: None,
            estimated_duration: None,
        }
    }
}

impl SimpleTarget {
    /// Calculate total runtime in seconds
    pub fn runtime(&self, download_time: f64) -> f64 {
        let mut total = self.delay as f64;
        for exposure in &self.exposures {
            total += exposure.runtime(download_time);
        }
        total
    }

    /// Get total exposure count
    pub fn total_exposure_count(&self) -> i32 {
        self.exposures.iter().map(|e| e.total_count).sum()
    }

    /// Get remaining exposure count
    pub fn remaining_exposure_count(&self) -> i32 {
        self.exposures.iter().map(|e| e.remaining()).sum()
    }

    /// Validate the target
    pub fn validate(&self) -> Vec<String> {
        let mut errors = Vec::new();

        if self.target_name.is_empty() {
            errors.push("Target name is required".to_string());
        }

        errors.extend(self.coordinates.validate());

        for exposure in &self.exposures {
            errors.extend(exposure.validate());
        }

        errors
    }
}

/// Start options for sequence
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartOptions {
    pub cool_camera_at_sequence_start: bool,
    pub cool_camera_temperature: f64,
    pub cool_camera_duration: i32,
    pub unpark_mount_at_sequence_start: bool,
    pub do_meridian_flip: bool,
}

impl Default for StartOptions {
    fn default() -> Self {
        Self {
            cool_camera_at_sequence_start: true,
            cool_camera_temperature: -10.0,
            cool_camera_duration: 600,
            unpark_mount_at_sequence_start: true,
            do_meridian_flip: true,
        }
    }
}

/// End options for sequence
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EndOptions {
    pub warm_cam_at_sequence_end: bool,
    pub warm_camera_duration: i32,
    pub park_mount_at_sequence_end: bool,
}

impl Default for EndOptions {
    fn default() -> Self {
        Self {
            warm_cam_at_sequence_end: true,
            warm_camera_duration: 600,
            park_mount_at_sequence_end: true,
        }
    }
}

/// Simple sequence (Target Set)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimpleSequence {
    pub id: String,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub save_path: Option<String>,
    pub is_dirty: bool,
    
    // Start/End options
    pub start_options: StartOptions,
    pub end_options: EndOptions,
    
    // Targets
    pub targets: Vec<SimpleTarget>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub selected_target_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub active_target_id: Option<String>,
    
    // Status
    pub is_running: bool,
    
    // ETA
    #[serde(skip_serializing_if = "Option::is_none")]
    pub overall_start_time: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub overall_end_time: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub overall_duration: Option<f64>,
    
    // Download time estimation
    pub estimated_download_time: f64,
}

impl Default for SimpleSequence {
    fn default() -> Self {
        let first_target = SimpleTarget::default();
        let first_target_id = first_target.id.clone();
        
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            title: "Target Set".to_string(),
            save_path: None,
            is_dirty: false,
            start_options: StartOptions::default(),
            end_options: EndOptions::default(),
            targets: vec![first_target],
            selected_target_id: Some(first_target_id.clone()),
            active_target_id: Some(first_target_id),
            is_running: false,
            overall_start_time: None,
            overall_end_time: None,
            overall_duration: None,
            estimated_download_time: 5.0,
        }
    }
}

impl SimpleSequence {
    /// Create a new empty sequence
    pub fn new(title: impl Into<String>) -> Self {
        Self {
            title: title.into(),
            ..Default::default()
        }
    }

    /// Calculate total runtime
    pub fn total_runtime(&self) -> f64 {
        self.targets
            .iter()
            .map(|t| t.runtime(self.estimated_download_time))
            .sum()
    }

    /// Get total exposure count
    pub fn total_exposure_count(&self) -> i32 {
        self.targets.iter().map(|t| t.total_exposure_count()).sum()
    }

    /// Get remaining exposure count
    pub fn remaining_exposure_count(&self) -> i32 {
        self.targets
            .iter()
            .map(|t| t.remaining_exposure_count())
            .sum()
    }

    /// Find target by ID
    pub fn find_target(&self, id: &str) -> Option<&SimpleTarget> {
        self.targets.iter().find(|t| t.id == id)
    }

    /// Find target by ID mutably
    pub fn find_target_mut(&mut self, id: &str) -> Option<&mut SimpleTarget> {
        self.targets.iter_mut().find(|t| t.id == id)
    }

    /// Calculate ETAs for all targets
    pub fn calculate_etas(&mut self) {
        let download_time = self.estimated_download_time;
        let mut current_time = Utc::now();
        let mut total_duration = 0.0;

        for target in &mut self.targets {
            let target_duration = target.runtime(download_time);
            target.estimated_start_time = Some(current_time);
            target.estimated_duration = Some(target_duration);
            current_time = current_time + chrono::Duration::seconds(target_duration as i64);
            target.estimated_end_time = Some(current_time);
            total_duration += target_duration;
        }

        self.overall_start_time = Some(Utc::now());
        self.overall_end_time = Some(Utc::now() + chrono::Duration::seconds(total_duration as i64));
        self.overall_duration = Some(total_duration);
    }

    /// Validate the sequence
    pub fn validate(&self) -> Vec<String> {
        let mut errors = Vec::new();

        if self.title.is_empty() {
            errors.push("Sequence title is required".to_string());
        }

        if self.targets.is_empty() {
            errors.push("At least one target is required".to_string());
        }

        for target in &self.targets {
            errors.extend(target.validate());
        }

        errors
    }
}

/// Export format for NINA target set
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct TargetSetExport {
    pub title: String,
    pub start_options: StartOptionsExport,
    pub end_options: EndOptionsExport,
    pub targets: Vec<CaptureSequenceExport>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct StartOptionsExport {
    pub cool_camera_at_sequence_start: bool,
    pub cool_camera_temperature: f64,
    pub cool_camera_duration: i32,
    pub unpark_mount_at_sequence_start: bool,
    pub do_meridian_flip: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct EndOptionsExport {
    pub warm_cam_at_sequence_end: bool,
    pub warm_camera_duration: i32,
    pub park_mount_at_sequence_end: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct CaptureSequenceExport {
    pub target_name: String,
    pub coordinates: CoordinatesExport,
    pub position_angle: f64,
    pub delay: i32,
    pub mode: String,
    pub slew_to_target: bool,
    pub center_target: bool,
    pub rotate_target: bool,
    pub start_guiding: bool,
    pub auto_focus_on_start: bool,
    pub auto_focus_on_filter_change: bool,
    pub auto_focus_after_set_time: bool,
    pub auto_focus_set_time: i32,
    pub auto_focus_after_set_exposures: bool,
    pub auto_focus_set_exposures: i32,
    pub auto_focus_after_temperature_change: bool,
    pub auto_focus_after_temperature_change_amount: f64,
    #[serde(rename = "AutoFocusAfterHFRChange")]
    pub auto_focus_after_hfr_change: bool,
    #[serde(rename = "AutoFocusAfterHFRChangeAmount")]
    pub auto_focus_after_hfr_change_amount: f64,
    pub items: Vec<CaptureSequenceItemExport>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct CoordinatesExport {
    #[serde(rename = "RAHours")]
    pub ra_hours: i32,
    #[serde(rename = "RAMinutes")]
    pub ra_minutes: i32,
    #[serde(rename = "RASeconds")]
    pub ra_seconds: f64,
    pub dec_degrees: i32,
    pub dec_minutes: i32,
    pub dec_seconds: f64,
    pub negative_dec: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct CaptureSequenceItemExport {
    pub enabled: bool,
    pub exposure_time: f64,
    pub image_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filter_type: Option<FilterTypeExport>,
    pub binning: BinningExport,
    pub gain: i32,
    pub offset: i32,
    pub total_exposure_count: i32,
    pub progress_exposure_count: i32,
    pub dither: bool,
    pub dither_amount: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct FilterTypeExport {
    pub name: String,
    pub position: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct BinningExport {
    pub x: i32,
    pub y: i32,
}

impl From<&SimpleSequence> for TargetSetExport {
    fn from(seq: &SimpleSequence) -> Self {
        Self {
            title: seq.title.clone(),
            start_options: StartOptionsExport {
                cool_camera_at_sequence_start: seq.start_options.cool_camera_at_sequence_start,
                cool_camera_temperature: seq.start_options.cool_camera_temperature,
                cool_camera_duration: seq.start_options.cool_camera_duration,
                unpark_mount_at_sequence_start: seq.start_options.unpark_mount_at_sequence_start,
                do_meridian_flip: seq.start_options.do_meridian_flip,
            },
            end_options: EndOptionsExport {
                warm_cam_at_sequence_end: seq.end_options.warm_cam_at_sequence_end,
                warm_camera_duration: seq.end_options.warm_camera_duration,
                park_mount_at_sequence_end: seq.end_options.park_mount_at_sequence_end,
            },
            targets: seq.targets.iter().map(|t| t.into()).collect(),
        }
    }
}

impl From<&SimpleTarget> for CaptureSequenceExport {
    fn from(target: &SimpleTarget) -> Self {
        Self {
            target_name: target.target_name.clone(),
            coordinates: CoordinatesExport {
                ra_hours: target.coordinates.ra_hours,
                ra_minutes: target.coordinates.ra_minutes,
                ra_seconds: target.coordinates.ra_seconds,
                dec_degrees: target.coordinates.dec_degrees,
                dec_minutes: target.coordinates.dec_minutes,
                dec_seconds: target.coordinates.dec_seconds,
                negative_dec: target.coordinates.negative_dec,
            },
            position_angle: target.position_angle,
            delay: target.delay,
            mode: format!("{:?}", target.mode).to_uppercase(),
            slew_to_target: target.slew_to_target,
            center_target: target.center_target,
            rotate_target: target.rotate_target,
            start_guiding: target.start_guiding,
            auto_focus_on_start: target.auto_focus_on_start,
            auto_focus_on_filter_change: target.auto_focus_on_filter_change,
            auto_focus_after_set_time: target.auto_focus_after_set_time,
            auto_focus_set_time: target.auto_focus_set_time,
            auto_focus_after_set_exposures: target.auto_focus_after_set_exposures,
            auto_focus_set_exposures: target.auto_focus_set_exposures,
            auto_focus_after_temperature_change: target.auto_focus_after_temperature_change,
            auto_focus_after_temperature_change_amount: target.auto_focus_after_temperature_change_amount,
            auto_focus_after_hfr_change: target.auto_focus_after_hfr_change,
            auto_focus_after_hfr_change_amount: target.auto_focus_after_hfr_change_amount,
            items: target.exposures.iter().map(|e| e.into()).collect(),
        }
    }
}

impl From<&SimpleExposure> for CaptureSequenceItemExport {
    fn from(exp: &SimpleExposure) -> Self {
        Self {
            enabled: exp.enabled,
            exposure_time: exp.exposure_time,
            image_type: exp.image_type.to_string(),
            filter_type: exp.filter.as_ref().map(|f| FilterTypeExport {
                name: f.name.clone(),
                position: f.position,
            }),
            binning: BinningExport {
                x: exp.binning.x,
                y: exp.binning.y,
            },
            gain: exp.gain,
            offset: exp.offset,
            total_exposure_count: exp.total_count,
            progress_exposure_count: exp.progress_count,
            dither: exp.dither,
            dither_amount: exp.dither_every,
        }
    }
}
