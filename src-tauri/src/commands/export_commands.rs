//! Export commands
//!
//! Tauri commands for exporting sequences to various formats

use tauri::command;

use crate::models::{SimpleSequence, SimpleTarget};
use crate::services::export_service::{
    export_sequence, export_to_apt_xml, export_to_csv, export_to_json, export_to_nina_target_set,
    export_to_stellarium, export_to_telescopius_csv, export_to_voyager, export_to_xml, format_dec,
    format_ra, generate_csv_content, generate_xml_content, CoordinateFormat, ExportFormat,
    ExportOptions, ExportResult,
};

/// Export sequence with options
#[command]
pub async fn export_sequence_with_options(
    sequence: SimpleSequence,
    options: ExportOptions,
) -> Result<ExportResult, String> {
    Ok(export_sequence(&sequence, &options))
}

/// Export sequence to CSV
#[command]
pub async fn export_to_csv_format(
    sequence: SimpleSequence,
    include_exposures: bool,
    include_progress: bool,
) -> Result<ExportResult, String> {
    let options = ExportOptions {
        format: ExportFormat::Csv,
        include_exposures,
        include_settings: true,
        include_progress,
        decimal_places: 2,
        coordinate_format: CoordinateFormat::Sexagesimal,
    };
    Ok(export_to_csv(&sequence, &options))
}

/// Export sequence to Telescopius CSV format
#[command]
pub async fn export_to_telescopius_format(
    sequence: SimpleSequence,
) -> Result<ExportResult, String> {
    let options = ExportOptions::default();
    Ok(export_to_telescopius_csv(&sequence, &options))
}

/// Export sequence to XML
#[command]
pub async fn export_to_xml_format(
    sequence: SimpleSequence,
    include_exposures: bool,
    include_settings: bool,
) -> Result<ExportResult, String> {
    let options = ExportOptions {
        format: ExportFormat::Xml,
        include_exposures,
        include_settings,
        include_progress: false,
        decimal_places: 2,
        coordinate_format: CoordinateFormat::Sexagesimal,
    };
    Ok(export_to_xml(&sequence, &options))
}

/// Export sequence to APT XML format
#[command]
pub async fn export_to_apt_format(sequence: SimpleSequence) -> Result<ExportResult, String> {
    let options = ExportOptions::default();
    Ok(export_to_apt_xml(&sequence, &options))
}

/// Export sequence to Stellarium skylist
#[command]
pub async fn export_to_stellarium_format(sequence: SimpleSequence) -> Result<ExportResult, String> {
    let options = ExportOptions::default();
    Ok(export_to_stellarium(&sequence, &options))
}

/// Export sequence to Voyager format
#[command]
pub async fn export_to_voyager_format(
    sequence: SimpleSequence,
    include_exposures: bool,
) -> Result<ExportResult, String> {
    let options = ExportOptions {
        format: ExportFormat::Voyager,
        include_exposures,
        include_settings: true,
        include_progress: false,
        decimal_places: 2,
        coordinate_format: CoordinateFormat::SexagesimalColon,
    };
    Ok(export_to_voyager(&sequence, &options))
}

/// Export sequence to NINA Target Set format
#[command]
pub async fn export_to_nina_target_set_format(
    sequence: SimpleSequence,
) -> Result<ExportResult, String> {
    Ok(export_to_nina_target_set(&sequence))
}

/// Export sequence to JSON
#[command]
pub async fn export_to_json_format(sequence: SimpleSequence) -> Result<ExportResult, String> {
    Ok(export_to_json(&sequence))
}

/// Generate CSV content from targets
#[command]
pub async fn generate_targets_csv(
    targets: Vec<SimpleTarget>,
    coordinate_format: String,
    decimal_places: usize,
) -> Result<String, String> {
    let coord_format = match coordinate_format.to_lowercase().as_str() {
        "decimal" => CoordinateFormat::Decimal,
        "degrees" => CoordinateFormat::DecimalDegrees,
        "colon" => CoordinateFormat::SexagesimalColon,
        _ => CoordinateFormat::Sexagesimal,
    };

    let options = ExportOptions {
        format: ExportFormat::Csv,
        include_exposures: false,
        include_settings: false,
        include_progress: false,
        decimal_places,
        coordinate_format: coord_format,
    };

    Ok(generate_csv_content(&targets, &options))
}

/// Generate XML content from targets
#[command]
pub async fn generate_targets_xml(
    targets: Vec<SimpleTarget>,
    coordinate_format: String,
    decimal_places: usize,
) -> Result<String, String> {
    let coord_format = match coordinate_format.to_lowercase().as_str() {
        "decimal" => CoordinateFormat::Decimal,
        "degrees" => CoordinateFormat::DecimalDegrees,
        "colon" => CoordinateFormat::SexagesimalColon,
        _ => CoordinateFormat::Sexagesimal,
    };

    let options = ExportOptions {
        format: ExportFormat::Xml,
        include_exposures: false,
        include_settings: false,
        include_progress: false,
        decimal_places,
        coordinate_format: coord_format,
    };

    Ok(generate_xml_content(&targets, &options))
}

/// Export sequence to file
#[command]
pub async fn export_sequence_to_file(
    sequence: SimpleSequence,
    path: String,
    options: ExportOptions,
) -> Result<(), String> {
    let result = export_sequence(&sequence, &options);

    if !result.success {
        return Err(result.errors.join(", "));
    }

    tokio::fs::write(&path, result.content)
        .await
        .map_err(|e| format!("Failed to write file: {}", e))
}

/// Export targets to file
#[command]
pub async fn export_targets_to_file(
    targets: Vec<SimpleTarget>,
    path: String,
    format: String,
) -> Result<(), String> {
    let content = match format.to_lowercase().as_str() {
        "csv" => {
            let options = ExportOptions::default();
            generate_csv_content(&targets, &options)
        }
        "xml" => {
            let options = ExportOptions::default();
            generate_xml_content(&targets, &options)
        }
        _ => return Err(format!("Unsupported format: {}", format)),
    };

    tokio::fs::write(&path, content)
        .await
        .map_err(|e| format!("Failed to write file: {}", e))
}

/// Format coordinates for display
#[command]
#[allow(clippy::too_many_arguments)]
pub async fn format_coordinates(
    ra_hours: i32,
    ra_minutes: i32,
    ra_seconds: f64,
    dec_degrees: i32,
    dec_minutes: i32,
    dec_seconds: f64,
    negative_dec: bool,
    format: String,
    decimal_places: usize,
) -> Result<(String, String), String> {
    let coords = crate::models::Coordinates {
        ra_hours,
        ra_minutes,
        ra_seconds,
        dec_degrees,
        dec_minutes,
        dec_seconds,
        negative_dec,
    };

    let coord_format = match format.to_lowercase().as_str() {
        "decimal" => CoordinateFormat::Decimal,
        "degrees" => CoordinateFormat::DecimalDegrees,
        "colon" => CoordinateFormat::SexagesimalColon,
        _ => CoordinateFormat::Sexagesimal,
    };

    Ok((
        format_ra(&coords, coord_format, decimal_places),
        format_dec(&coords, coord_format, decimal_places),
    ))
}

/// Get available export formats
#[command]
pub async fn get_export_formats() -> Result<Vec<(String, String, String)>, String> {
    Ok(vec![
        (
            "csv".to_string(),
            "CSV".to_string(),
            "Comma-separated values".to_string(),
        ),
        (
            "csv_telescopius".to_string(),
            "Telescopius CSV".to_string(),
            "Telescopius-compatible CSV".to_string(),
        ),
        (
            "xml".to_string(),
            "XML".to_string(),
            "Generic XML format".to_string(),
        ),
        (
            "xml_apt".to_string(),
            "APT XML".to_string(),
            "Astro Photography Tool format".to_string(),
        ),
        (
            "stellarium".to_string(),
            "Stellarium".to_string(),
            "Stellarium skylist format".to_string(),
        ),
        (
            "voyager".to_string(),
            "Voyager".to_string(),
            "Voyager sequence format".to_string(),
        ),
        (
            "nina_target_set".to_string(),
            "NINA Target Set".to_string(),
            "NINA Target Set JSON".to_string(),
        ),
        (
            "json".to_string(),
            "JSON".to_string(),
            "Full sequence JSON".to_string(),
        ),
    ])
}

/// Get available coordinate formats
#[command]
pub async fn get_coordinate_formats() -> Result<Vec<(String, String, String)>, String> {
    Ok(vec![
        (
            "sexagesimal".to_string(),
            "Sexagesimal".to_string(),
            "00h 42m 44.3s / +41° 16' 09.0\"".to_string(),
        ),
        (
            "colon".to_string(),
            "Colon-separated".to_string(),
            "00:42:44.3 / +41:16:09.0".to_string(),
        ),
        (
            "decimal".to_string(),
            "Decimal".to_string(),
            "0.712 / 41.269 (hours/degrees)".to_string(),
        ),
        (
            "degrees".to_string(),
            "Decimal Degrees".to_string(),
            "10.68 / 41.269 (degrees)".to_string(),
        ),
    ])
}
