//! Import commands
//!
//! Tauri commands for importing targets from various formats

use tauri::command;

use crate::models::SimpleTarget;
use crate::services::import_service::{
    ImportResult, CsvColumnMapping, FitsHeaderInfo,
    parse_csv_content, parse_stellarium_skylist, parse_apt_format,
    parse_voyager_format, parse_xml_content, parse_fits_header,
    create_target_from_fits, detect_csv_format,
};

/// Import targets from CSV content
#[command]
pub async fn import_csv_content(
    content: String,
    mapping: Option<CsvColumnMapping>,
) -> Result<ImportResult, String> {
    Ok(parse_csv_content(&content, mapping))
}

/// Import targets from Stellarium skylist content
#[command]
pub async fn import_stellarium_content(
    content: String,
) -> Result<ImportResult, String> {
    Ok(parse_stellarium_skylist(&content))
}

/// Import targets from APT format content
#[command]
pub async fn import_apt_content(
    content: String,
) -> Result<ImportResult, String> {
    Ok(parse_apt_format(&content))
}

/// Import targets from Voyager format content
#[command]
pub async fn import_voyager_content(
    content: String,
) -> Result<ImportResult, String> {
    Ok(parse_voyager_format(&content))
}

/// Import targets from XML content
#[command]
pub async fn import_xml_content(
    content: String,
) -> Result<ImportResult, String> {
    Ok(parse_xml_content(&content))
}

/// Auto-detect format and import
#[command]
pub async fn import_auto_detect(
    content: String,
    file_extension: Option<String>,
) -> Result<ImportResult, String> {
    let ext = file_extension.unwrap_or_default().to_lowercase();
    
    // Try to detect by extension first
    match ext.as_str() {
        "csv" => Ok(parse_csv_content(&content, None)),
        "skylist" | "sl" => Ok(parse_stellarium_skylist(&content)),
        "xml" => Ok(parse_xml_content(&content)),
        _ => {
            // Try to detect by content
            if content.trim().starts_with("<?xml") || content.trim().starts_with("<") {
                Ok(parse_xml_content(&content))
            } else if content.contains("[") && content.contains("RA=") {
                Ok(parse_voyager_format(&content))
            } else if content.starts_with("#") || content.contains("designation") {
                Ok(parse_stellarium_skylist(&content))
            } else {
                // Default to CSV
                Ok(parse_csv_content(&content, None))
            }
        }
    }
}

/// Detect CSV format from headers
#[command]
pub async fn detect_csv_format_from_headers(
    headers: Vec<String>,
) -> Result<String, String> {
    let format = detect_csv_format(&headers);
    Ok(format!("{:?}", format))
}

/// Parse FITS header from bytes
#[command]
pub async fn parse_fits_header_bytes(
    data: Vec<u8>,
) -> Result<FitsHeaderInfo, String> {
    parse_fits_header(&data)
}

/// Create target from FITS header info
#[command]
pub async fn create_target_from_fits_info(
    info: FitsHeaderInfo,
) -> Result<Option<SimpleTarget>, String> {
    Ok(create_target_from_fits(&info))
}

/// Import from CSV file
#[command]
pub async fn import_csv_file(
    path: String,
    mapping: Option<CsvColumnMapping>,
) -> Result<ImportResult, String> {
    let content = tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    Ok(parse_csv_content(&content, mapping))
}

/// Import from Stellarium file
#[command]
pub async fn import_stellarium_file(
    path: String,
) -> Result<ImportResult, String> {
    let content = tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    Ok(parse_stellarium_skylist(&content))
}

/// Import from XML file
#[command]
pub async fn import_xml_file(
    path: String,
) -> Result<ImportResult, String> {
    let content = tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    Ok(parse_xml_content(&content))
}

/// Import from FITS file (header only)
#[command]
pub async fn import_fits_file(
    path: String,
) -> Result<Option<SimpleTarget>, String> {
    let data = tokio::fs::read(&path)
        .await
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    let info = parse_fits_header(&data)?;
    Ok(create_target_from_fits(&info))
}

/// Batch import from multiple files
#[command]
pub async fn batch_import_files(
    paths: Vec<String>,
) -> Result<ImportResult, String> {
    let mut all_targets = Vec::new();
    let mut all_errors = Vec::new();
    let mut all_warnings = Vec::new();
    let mut total_rows = 0;
    
    for path in &paths {
        let ext = std::path::Path::new(path)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();
        
        let content = match tokio::fs::read_to_string(path).await {
            Ok(c) => c,
            Err(e) => {
                all_errors.push(format!("Failed to read {}: {}", path, e));
                continue;
            }
        };
        
        let result = match ext.as_str() {
            "csv" => parse_csv_content(&content, None),
            "skylist" | "sl" => parse_stellarium_skylist(&content),
            "xml" => parse_xml_content(&content),
            _ => parse_csv_content(&content, None),
        };
        
        all_targets.extend(result.targets);
        all_errors.extend(result.errors);
        all_warnings.extend(result.warnings);
        total_rows += result.total_rows;
    }
    
    Ok(ImportResult {
        success: all_errors.is_empty(),
        targets: all_targets.clone(),
        errors: all_errors,
        warnings: all_warnings,
        source_format: "Multiple".to_string(),
        total_rows,
        imported_count: all_targets.len(),
        skipped_count: total_rows - all_targets.len(),
    })
}

/// Validate import mapping
#[command]
pub async fn validate_csv_mapping(
    headers: Vec<String>,
    mapping: CsvColumnMapping,
) -> Result<Vec<String>, String> {
    let mut errors = Vec::new();
    let headers_lower: Vec<String> = headers.iter().map(|h| h.to_lowercase()).collect();
    
    // Check required columns
    if let Some(ref name_col) = mapping.name_column {
        if !headers_lower.contains(&name_col.to_lowercase()) {
            errors.push(format!("Name column '{}' not found in headers", name_col));
        }
    }
    
    if let Some(ref ra_col) = mapping.ra_column {
        if !headers_lower.contains(&ra_col.to_lowercase()) {
            errors.push(format!("RA column '{}' not found in headers", ra_col));
        }
    } else {
        errors.push("RA column is required".to_string());
    }
    
    if let Some(ref dec_col) = mapping.dec_column {
        if !headers_lower.contains(&dec_col.to_lowercase()) {
            errors.push(format!("Dec column '{}' not found in headers", dec_col));
        }
    } else {
        errors.push("Dec column is required".to_string());
    }
    
    Ok(errors)
}

/// Get CSV preview (first N rows)
#[command]
pub async fn preview_csv_content(
    content: String,
    max_rows: usize,
) -> Result<Vec<Vec<String>>, String> {
    let mut rows = Vec::new();
    
    for (idx, line) in content.lines().enumerate() {
        if idx >= max_rows {
            break;
        }
        
        let fields: Vec<String> = line.split(',')
            .map(|s| s.trim().trim_matches('"').to_string())
            .collect();
        rows.push(fields);
    }
    
    Ok(rows)
}
