//! Cobalt Task Editor - NINA Sequence Editor
//!
//! A cross-platform desktop application for editing NINA astronomy sequences.

pub mod models;
pub mod services;
pub mod commands;

#[cfg(test)]
mod tests;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Register plugins
        .plugin(tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        // Register commands
        .invoke_handler(tauri::generate_handler![
            // File commands
            read_file_contents,
            write_file_contents,
            load_simple_sequence_file,
            save_simple_sequence_file,
            load_editor_sequence_file,
            save_editor_sequence_file,
            import_targets_csv,
            import_targets_csv_content,
            export_sequence_csv,
            export_sequence_xml,
            export_sequence_target_set,
            get_file_info,
            list_directory,
            file_exists,
            delete_file,
            copy_file,
            get_default_save_directory,
            get_app_data_directory,
            auto_save_sequence,
            load_auto_save,
            clear_auto_save,
            // Sequence commands
            validate_simple_sequence,
            validate_editor_sequence,
            validate_nina_json,
            validate_coordinates,
            serialize_simple_sequence,
            deserialize_simple_sequence,
            serialize_editor_sequence,
            deserialize_editor_sequence,
            create_simple_sequence,
            create_editor_sequence,
            create_target,
            create_exposure,
            duplicate_target,
            duplicate_exposure,
            copy_exposures_to_all_targets,
            reset_target_progress,
            reset_sequence_progress,
            get_sequence_statistics,
            is_container_type,
            get_short_type_name,
            get_type_category,
            generate_id,
            // Settings commands
            load_settings,
            save_settings,
            get_settings,
            get_recent_files,
            add_recent_file,
            remove_recent_file,
            clear_recent_files,
            get_last_directory,
            set_last_directory,
            save_window_state,
            get_window_state,
            set_theme,
            get_theme,
            set_language,
            get_language,
            set_estimated_download_time,
            get_estimated_download_time,
            // Calculator commands
            calculate_sequence_runtime,
            calculate_sequence_etas,
            calculate_exposure_runtime,
            calculate_target_runtime,
            format_duration,
            format_time,
            calculate_end_time,
            calculate_angular_separation,
            ra_to_decimal,
            decimal_to_ra,
            dec_to_decimal,
            decimal_to_dec,
            calculate_altitude,
            is_above_horizon,
            calculate_moon_phase,
            calculate_moon_illumination,
            parse_ra,
            parse_dec,
            format_ra,
            format_dec,
            // Clipboard commands
            copy_target,
            copy_targets,
            copy_exposure,
            copy_exposures,
            paste_target,
            paste_targets,
            paste_exposure,
            paste_exposures,
            has_clipboard_content,
            has_clipboard_content_type,
            clear_clipboard,
            get_clipboard_json,
            set_clipboard_json,
            copy_sequence_item,
            copy_sequence_items,
            paste_sequence_item,
            paste_sequence_items,
            // Template commands
            save_sequence_template,
            load_sequence_template,
            list_sequence_templates,
            delete_sequence_template,
            save_target_template,
            load_target_template,
            list_target_templates,
            save_exposure_template,
            load_exposure_template,
            list_exposure_templates,
            apply_target_template,
            apply_exposure_template,
            // Backup commands
            create_backup,
            list_backups,
            restore_backup,
            delete_backup,
            clean_old_backups,
            save_crash_recovery,
            load_crash_recovery,
            clear_crash_recovery,
            list_crash_recovery,
            has_crash_recovery,
            // Log commands
            log_debug,
            log_info,
            log_warning,
            log_error,
            log_with_details,
            log_operation,
            get_recent_logs,
            get_logs_by_category,
            clear_log_buffer,
            flush_logs,
            read_log_file,
            list_log_files,
            clean_old_logs,
            // NINA format commands
            export_to_nina_json,
            import_from_nina_json,
            validate_nina_format,
            save_nina_sequence_file,
            load_nina_sequence_file,
            export_template_to_nina,
            get_nina_type_short_name,
            get_nina_type_category,
            is_nina_container_type,
            get_nina_categories,
            // Astronomy commands
            calculate_target_visibility,
            calculate_twilight_times,
            get_moon_phase,
            calculate_quality_score,
            find_optimal_time,
            batch_calculate_target_positions,
            get_sun_position,
            get_moon_position,
            calculate_alt_az,
            get_moon_illumination_now,
            calculate_visibility_range,
            calculate_twilight_range,
            calculate_altitude_curve,
            is_target_visible,
            calculate_air_mass,
            // Import commands
            import_csv_content,
            import_stellarium_content,
            import_apt_content,
            import_voyager_content,
            import_xml_content,
            import_auto_detect,
            detect_csv_format_from_headers,
            parse_fits_header_bytes,
            create_target_from_fits_info,
            import_csv_file,
            import_stellarium_file,
            import_xml_file,
            import_fits_file,
            batch_import_files,
            validate_csv_mapping,
            preview_csv_content,
            // Export commands
            export_sequence_with_options,
            export_to_csv_format,
            export_to_telescopius_format,
            export_to_xml_format,
            export_to_apt_format,
            export_to_stellarium_format,
            export_to_voyager_format,
            export_to_nina_target_set_format,
            export_to_json_format,
            generate_targets_csv,
            generate_targets_xml,
            export_sequence_to_file,
            export_targets_to_file,
            format_coordinates,
            get_export_formats,
            get_coordinate_formats,
            // Optimizer commands
            optimize_target_order,
            detect_schedule_conflicts,
            calculate_parallel_etas,
            get_target_schedule_info,
            apply_optimization,
            merge_multiple_sequences,
            split_sequence_by_target,
            get_optimization_strategies,
            batch_calculate_visibility,
            validate_sequence_for_date,
            find_best_observation_date,
            estimate_session_time,
        ])
        .setup(|app| {
            // Initialize settings on startup
            let _handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = services::settings_service::load_settings().await {
                    log::warn!("Failed to load settings: {}", e);
                }
            });

            log::info!("Cobalt Task Editor started");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
