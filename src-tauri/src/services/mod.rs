//! Business logic services
//! 
//! This module contains all the business logic for sequence processing,
//! serialization, validation, and file operations.

pub mod serializer;
pub mod validator;
pub mod file_service;
pub mod settings_service;
pub mod calculator;
pub mod clipboard_service;
pub mod template_service;
pub mod backup_service;
pub mod log_service;
pub mod nina_serializer;
pub mod astronomy;
pub mod import_service;
pub mod export_service;
pub mod sequence_optimizer;

#[cfg(test)]
mod astronomy_tests;
#[cfg(test)]
mod import_tests;
#[cfg(test)]
mod export_tests;
#[cfg(test)]
mod optimizer_tests;

// Re-export specific items to avoid ambiguity
pub use serializer::{
    SerializerError, serialize_simple_sequence_json, deserialize_simple_sequence_json,
    serialize_editor_sequence_json, deserialize_editor_sequence_json,
    export_to_csv, import_from_csv, export_to_xml, export_to_target_set,
};
pub use validator::{
    validate_simple_sequence, validate_editor_sequence, validate_coordinates,
    validate_simple_target, validate_simple_exposure, validate_nina_json,
    is_container_type, get_short_type_name, get_type_category,
};
pub use file_service::{
    FileError, FileInfo, read_file, write_file,
    load_simple_sequence, save_simple_sequence,
    load_editor_sequence, save_editor_sequence,
    import_targets_from_csv, get_file_info, list_directory,
    file_exists, delete_file, copy_file,
    get_default_save_directory, get_app_data_directory,
    get_auto_save_directory, create_auto_save_path,
};
pub use settings_service::{
    load_settings, save_settings, get_settings, update_settings,
    add_recent_file, remove_recent_file, clear_recent_files, get_recent_files,
    get_last_directory, set_last_directory,
    save_window_state, get_window_state,
    set_theme, get_theme, set_language, get_language,
    set_estimated_download_time, get_estimated_download_time,
};
pub use calculator::{
    calculate_sequence_runtime, calculate_sequence_etas,
    calculate_exposure_runtime, calculate_target_runtime,
    format_duration, format_time, calculate_end_time,
    angular_separation, ra_to_decimal, decimal_to_ra,
    dec_to_decimal, decimal_to_dec, calculate_altitude,
    is_above_horizon, calculate_moon_phase, calculate_moon_illumination,
};
