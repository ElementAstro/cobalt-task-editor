//! Business logic services
//!
//! This module contains all the business logic for sequence processing,
//! serialization, validation, and file operations.

pub mod astronomy;
pub mod backup_service;
pub mod calculator;
pub mod clipboard_service;
pub mod export_service;
pub mod file_service;
pub mod import_service;
pub mod log_service;
pub mod nina_serializer;
pub mod sequence_optimizer;
pub mod serializer;
pub mod settings_service;
pub mod template_service;
pub mod validator;

#[cfg(test)]
mod astronomy_tests;
#[cfg(test)]
mod export_tests;
#[cfg(test)]
mod import_tests;
#[cfg(test)]
mod optimizer_tests;

// Re-export specific items to avoid ambiguity
pub use calculator::{
    angular_separation, calculate_altitude, calculate_end_time, calculate_exposure_runtime,
    calculate_moon_illumination, calculate_moon_phase, calculate_sequence_etas,
    calculate_sequence_runtime, calculate_target_runtime, dec_to_decimal, decimal_to_dec,
    decimal_to_ra, format_duration, format_time, is_above_horizon, ra_to_decimal,
};
pub use file_service::{
    copy_file, create_auto_save_path, delete_file, file_exists, get_app_data_directory,
    get_auto_save_directory, get_default_save_directory, get_file_info, import_targets_from_csv,
    list_directory, load_editor_sequence, load_simple_sequence, read_file, save_editor_sequence,
    save_simple_sequence, write_file, FileError, FileInfo,
};
pub use serializer::{
    deserialize_editor_sequence_json, deserialize_simple_sequence_json, export_to_csv,
    export_to_target_set, export_to_xml, import_from_csv, serialize_editor_sequence_json,
    serialize_simple_sequence_json, SerializerError,
};
pub use settings_service::{
    add_recent_file, clear_recent_files, get_estimated_download_time, get_language,
    get_last_directory, get_recent_files, get_settings, get_theme, get_window_state, load_settings,
    remove_recent_file, save_settings, save_window_state, set_estimated_download_time,
    set_language, set_last_directory, set_theme, update_settings,
};
pub use validator::{
    get_short_type_name, get_type_category, is_container_type, validate_coordinates,
    validate_editor_sequence, validate_nina_json, validate_simple_exposure,
    validate_simple_sequence, validate_simple_target,
};
