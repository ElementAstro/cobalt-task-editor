//! Import service for various file formats
//!
//! Supports importing targets from:
//! - CSV (Telescopius, custom formats)
//! - Stellarium skylist
//! - APT format
//! - Voyager format
//! - FITS headers

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::models::{Coordinates, SimpleTarget, SimpleExposure};
use crate::models::common::{SequenceEntityStatus, SequenceMode, ImageType, BinningMode};

/// Import result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportResult {
    pub success: bool,
    pub targets: Vec<SimpleTarget>,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
    pub source_format: String,
    pub total_rows: usize,
    pub imported_count: usize,
    pub skipped_count: usize,
}

/// CSV column mapping
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CsvColumnMapping {
    pub name_column: Option<String>,
    pub ra_column: Option<String>,
    pub dec_column: Option<String>,
    pub position_angle_column: Option<String>,
    pub notes_column: Option<String>,
    pub delimiter: Option<char>,
    pub has_header: bool,
}

impl Default for CsvColumnMapping {
    fn default() -> Self {
        Self {
            name_column: Some("name".to_string()),
            ra_column: Some("ra".to_string()),
            dec_column: Some("dec".to_string()),
            position_angle_column: None,
            notes_column: None,
            delimiter: Some(','),
            has_header: true,
        }
    }
}

/// Detected CSV format
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum DetectedCsvFormat {
    Telescopius,
    AstroPlanner,
    Stellarium,
    Generic,
    Unknown,
}

// ============================================================================
// CSV Import
// ============================================================================

/// Detect CSV format from headers
pub fn detect_csv_format(headers: &[String]) -> DetectedCsvFormat {
    let headers_lower: Vec<String> = headers.iter().map(|h| h.to_lowercase()).collect();
    
    // Telescopius format
    if headers_lower.contains(&"catalogue entry".to_string()) 
        || headers_lower.contains(&"familiar name".to_string()) {
        return DetectedCsvFormat::Telescopius;
    }
    
    // AstroPlanner format
    if headers_lower.contains(&"object".to_string()) 
        && headers_lower.contains(&"type".to_string()) {
        return DetectedCsvFormat::AstroPlanner;
    }
    
    // Stellarium format
    if headers_lower.contains(&"designation".to_string()) {
        return DetectedCsvFormat::Stellarium;
    }
    
    // Generic format with RA/Dec
    if (headers_lower.contains(&"ra".to_string()) || headers_lower.contains(&"right ascension".to_string()))
        && (headers_lower.contains(&"dec".to_string()) || headers_lower.contains(&"declination".to_string())) {
        return DetectedCsvFormat::Generic;
    }
    
    DetectedCsvFormat::Unknown
}

/// Parse CSV content with auto-detection
pub fn parse_csv_content(content: &str, mapping: Option<CsvColumnMapping>) -> ImportResult {
    let mapping = mapping.unwrap_or_default();
    let delimiter = mapping.delimiter.unwrap_or(',');
    
    let lines: Vec<&str> = content.lines().collect();
    if lines.is_empty() {
        return ImportResult {
            success: false,
            targets: vec![],
            errors: vec!["Empty CSV content".to_string()],
            warnings: vec![],
            source_format: "CSV".to_string(),
            total_rows: 0,
            imported_count: 0,
            skipped_count: 0,
        };
    }
    
    let mut targets = Vec::new();
    let errors: Vec<String> = Vec::new();
    let mut warnings = Vec::new();
    let mut skipped = 0;
    
    // Parse headers
    let headers: Vec<String> = if mapping.has_header {
        parse_csv_line(lines[0], delimiter)
            .iter()
            .map(|s| s.trim().to_lowercase())
            .collect()
    } else {
        vec![]
    };
    
    let format = if mapping.has_header {
        detect_csv_format(&headers)
    } else {
        DetectedCsvFormat::Generic
    };
    
    let start_row = if mapping.has_header { 1 } else { 0 };
    let total_rows = lines.len() - start_row;
    
    for (idx, line) in lines.iter().enumerate().skip(start_row) {
        if line.trim().is_empty() {
            continue;
        }
        
        let fields = parse_csv_line(line, delimiter);
        
        match parse_csv_row(&headers, &fields, &format, &mapping) {
            Ok(target) => targets.push(target),
            Err(e) => {
                warnings.push(format!("Row {}: {}", idx + 1, e));
                skipped += 1;
            }
        }
    }
    
    ImportResult {
        success: errors.is_empty(),
        targets,
        errors,
        warnings,
        source_format: format!("{:?}", format),
        total_rows,
        imported_count: total_rows - skipped,
        skipped_count: skipped,
    }
}

/// Parse a single CSV line
fn parse_csv_line(line: &str, delimiter: char) -> Vec<String> {
    let mut fields = Vec::new();
    let mut current = String::new();
    let mut in_quotes = false;
    let mut chars = line.chars().peekable();
    
    while let Some(c) = chars.next() {
        match c {
            '"' => {
                if in_quotes {
                    if chars.peek() == Some(&'"') {
                        current.push('"');
                        chars.next();
                    } else {
                        in_quotes = false;
                    }
                } else {
                    in_quotes = true;
                }
            }
            c if c == delimiter && !in_quotes => {
                fields.push(current.trim().to_string());
                current = String::new();
            }
            _ => current.push(c),
        }
    }
    fields.push(current.trim().to_string());
    
    fields
}

/// Parse a CSV row into a target
fn parse_csv_row(
    headers: &[String],
    fields: &[String],
    format: &DetectedCsvFormat,
    mapping: &CsvColumnMapping,
) -> Result<SimpleTarget, String> {
    let get_field = |name: &str| -> Option<String> {
        if headers.is_empty() {
            return None;
        }
        headers.iter().position(|h| h.contains(name))
            .and_then(|i| fields.get(i).cloned())
            .filter(|s| !s.is_empty())
    };
    
    // Get name
    let name = match format {
        DetectedCsvFormat::Telescopius => {
            get_field("familiar name")
                .or_else(|| get_field("catalogue entry"))
                .unwrap_or_else(|| "Unknown".to_string())
        }
        DetectedCsvFormat::AstroPlanner => {
            get_field("object").unwrap_or_else(|| "Unknown".to_string())
        }
        DetectedCsvFormat::Stellarium => {
            get_field("designation").unwrap_or_else(|| "Unknown".to_string())
        }
        _ => {
            mapping.name_column.as_ref()
                .and_then(|col| get_field(&col.to_lowercase()))
                .or_else(|| get_field("name"))
                .or_else(|| get_field("target"))
                .or_else(|| get_field("object"))
                .unwrap_or_else(|| "Unknown".to_string())
        }
    };
    
    // Get RA
    let ra_str = mapping.ra_column.as_ref()
        .and_then(|col| get_field(&col.to_lowercase()))
        .or_else(|| get_field("ra"))
        .or_else(|| get_field("right ascension"))
        .ok_or("Missing RA column")?;
    
    // Get Dec
    let dec_str = mapping.dec_column.as_ref()
        .and_then(|col| get_field(&col.to_lowercase()))
        .or_else(|| get_field("dec"))
        .or_else(|| get_field("declination"))
        .ok_or("Missing Dec column")?;
    
    // Parse coordinates
    let coords = parse_coordinates(&ra_str, &dec_str)?;
    
    // Get position angle
    let position_angle = mapping.position_angle_column.as_ref()
        .and_then(|col| get_field(&col.to_lowercase()))
        .or_else(|| get_field("position angle"))
        .or_else(|| get_field("pa"))
        .and_then(|s| s.parse::<f64>().ok())
        .unwrap_or(0.0);
    
    Ok(SimpleTarget {
        id: uuid::Uuid::new_v4().to_string(),
        name: name.clone(),
        status: SequenceEntityStatus::Created,
        file_name: None,
        target_name: name,
        coordinates: coords,
        position_angle,
        rotation: position_angle,
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
        exposures: vec![create_default_exposure()],
        estimated_start_time: None,
        estimated_end_time: None,
        estimated_duration: None,
    })
}

/// Parse coordinate strings
fn parse_coordinates(ra_str: &str, dec_str: &str) -> Result<Coordinates, String> {
    let ra = parse_ra(ra_str)?;
    let dec = parse_dec(dec_str)?;
    
    Ok(Coordinates {
        ra_hours: ra.0,
        ra_minutes: ra.1,
        ra_seconds: ra.2,
        dec_degrees: dec.0,
        dec_minutes: dec.1,
        dec_seconds: dec.2,
        negative_dec: dec.3,
    })
}

/// Parse RA string
fn parse_ra(s: &str) -> Result<(i32, i32, f64), String> {
    let s = s.trim();
    
    // Try decimal hours
    if let Ok(hours) = s.parse::<f64>() {
        if hours >= 0.0 && hours < 24.0 {
            let h = hours.floor() as i32;
            let m_dec = (hours - h as f64) * 60.0;
            let m = m_dec.floor() as i32;
            let sec = (m_dec - m as f64) * 60.0;
            return Ok((h, m, sec));
        }
    }
    
    // Try HMS format: "00h 42m 44.3s" or "00:42:44.3"
    let re = regex_lite::Regex::new(r"(\d+)[h:\s]+(\d+)[m:\s]+(\d+\.?\d*)")
        .map_err(|_| "Invalid regex")?;
    
    if let Some(caps) = re.captures(s) {
        let h: i32 = caps.get(1).unwrap().as_str().parse().map_err(|_| "Invalid hours")?;
        let m: i32 = caps.get(2).unwrap().as_str().parse().map_err(|_| "Invalid minutes")?;
        let sec: f64 = caps.get(3).unwrap().as_str().parse().map_err(|_| "Invalid seconds")?;
        
        if h >= 0 && h < 24 && m >= 0 && m < 60 && sec >= 0.0 && sec < 60.0 {
            return Ok((h, m, sec));
        }
    }
    
    // Try decimal degrees (convert to hours)
    if let Ok(deg) = s.parse::<f64>() {
        if deg >= 0.0 && deg < 360.0 {
            let hours = deg / 15.0;
            let h = hours.floor() as i32;
            let m_dec = (hours - h as f64) * 60.0;
            let m = m_dec.floor() as i32;
            let sec = (m_dec - m as f64) * 60.0;
            return Ok((h, m, sec));
        }
    }
    
    Err(format!("Cannot parse RA: {}", s))
}

/// Parse Dec string
fn parse_dec(s: &str) -> Result<(i32, i32, f64, bool), String> {
    let s = s.trim();
    
    // Try decimal degrees
    if let Ok(deg) = s.parse::<f64>() {
        if deg >= -90.0 && deg <= 90.0 {
            let negative = deg < 0.0;
            let abs_deg = deg.abs();
            let d = abs_deg.floor() as i32;
            let m_dec = (abs_deg - d as f64) * 60.0;
            let m = m_dec.floor() as i32;
            let sec = (m_dec - m as f64) * 60.0;
            return Ok((d, m, sec, negative));
        }
    }
    
    // Try DMS format: "+41° 16' 9.0\"" or "41:16:09.0"
    let re = regex_lite::Regex::new(r#"([+-]?)(\d+)[°d:\s]+(\d+)['m:\s]+(\d+\.?\d*)["s]?"#)
        .map_err(|_| "Invalid regex")?;
    
    if let Some(caps) = re.captures(s) {
        let negative = caps.get(1).map(|m| m.as_str()) == Some("-");
        let d: i32 = caps.get(2).unwrap().as_str().parse().map_err(|_| "Invalid degrees")?;
        let m: i32 = caps.get(3).unwrap().as_str().parse().map_err(|_| "Invalid minutes")?;
        let sec: f64 = caps.get(4).unwrap().as_str().parse().map_err(|_| "Invalid seconds")?;
        
        if d >= 0 && d <= 90 && m >= 0 && m < 60 && sec >= 0.0 && sec < 60.0 {
            return Ok((d, m, sec, negative));
        }
    }
    
    Err(format!("Cannot parse Dec: {}", s))
}

// ============================================================================
// Stellarium Skylist Import
// ============================================================================

/// Parse Stellarium skylist format
pub fn parse_stellarium_skylist(content: &str) -> ImportResult {
    let mut targets = Vec::new();
    let errors: Vec<String> = Vec::new();
    let mut warnings = Vec::new();
    
    for (idx, line) in content.lines().enumerate() {
        let line = line.trim();
        
        // Skip comments and empty lines
        if line.is_empty() || line.starts_with('#') || line.starts_with("//") {
            continue;
        }
        
        // Stellarium format: "Name RA Dec" or JSON-like format
        if line.starts_with('{') {
            // JSON format
            match serde_json::from_str::<serde_json::Value>(line) {
                Ok(obj) => {
                    if let Some(target) = parse_stellarium_json(&obj) {
                        targets.push(target);
                    } else {
                        warnings.push(format!("Line {}: Could not parse JSON object", idx + 1));
                    }
                }
                Err(e) => {
                    warnings.push(format!("Line {}: Invalid JSON - {}", idx + 1, e));
                }
            }
        } else {
            // Simple format: "Name RA Dec"
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 3 {
                let name = parts[0].to_string();
                let ra_str = parts[1];
                let dec_str = parts[2];
                
                match parse_coordinates(ra_str, dec_str) {
                    Ok(coords) => {
                        targets.push(create_target_from_coords(name, coords, 0.0));
                    }
                    Err(e) => {
                        warnings.push(format!("Line {}: {}", idx + 1, e));
                    }
                }
            }
        }
    }
    
    let imported_count = targets.len();
    let total_rows = content.lines().count();
    
    ImportResult {
        success: errors.is_empty(),
        targets,
        errors,
        warnings,
        source_format: "Stellarium".to_string(),
        total_rows,
        imported_count,
        skipped_count: total_rows - imported_count,
    }
}

fn parse_stellarium_json(obj: &serde_json::Value) -> Option<SimpleTarget> {
    let name = obj.get("name")?.as_str()?.to_string();
    let ra = obj.get("ra")?.as_f64()?;
    let dec = obj.get("dec")?.as_f64()?;
    
    let coords = Coordinates::from_decimal(ra / 15.0, dec);
    Some(create_target_from_coords(name, coords, 0.0))
}

// ============================================================================
// APT Format Import
// ============================================================================

/// Parse APT (Astro Photography Tool) format
pub fn parse_apt_format(content: &str) -> ImportResult {
    // APT uses XML format
    parse_xml_targets(content, "APT")
}

// ============================================================================
// Voyager Format Import
// ============================================================================

/// Parse Voyager format
pub fn parse_voyager_format(content: &str) -> ImportResult {
    // Voyager uses a custom format similar to INI
    let mut targets = Vec::new();
    let errors: Vec<String> = Vec::new();
    let mut warnings = Vec::new();
    let mut current_target: Option<HashMap<String, String>> = None;
    
    for line in content.lines() {
        let line = line.trim();
        
        if line.starts_with('[') && line.ends_with(']') {
            // Save previous target
            if let Some(data) = current_target.take() {
                match create_target_from_map(&data) {
                    Ok(target) => targets.push(target),
                    Err(e) => warnings.push(e),
                }
            }
            
            // Start new target
            let name = line[1..line.len()-1].to_string();
            let mut map = HashMap::new();
            map.insert("name".to_string(), name);
            current_target = Some(map);
        } else if let Some(ref mut data) = current_target {
            if let Some((key, value)) = line.split_once('=') {
                data.insert(key.trim().to_lowercase(), value.trim().to_string());
            }
        }
    }
    
    // Save last target
    if let Some(data) = current_target {
        match create_target_from_map(&data) {
            Ok(target) => targets.push(target),
            Err(e) => warnings.push(e),
        }
    }
    
    let imported_count = targets.len();
    let total_rows = content.lines().count();
    
    ImportResult {
        success: errors.is_empty(),
        targets,
        errors,
        warnings,
        source_format: "Voyager".to_string(),
        total_rows,
        imported_count,
        skipped_count: 0,
    }
}

fn create_target_from_map(data: &HashMap<String, String>) -> Result<SimpleTarget, String> {
    let name = data.get("name").cloned().unwrap_or_else(|| "Unknown".to_string());
    
    let ra_str = data.get("ra")
        .or_else(|| data.get("rightascension"))
        .ok_or("Missing RA")?;
    
    let dec_str = data.get("dec")
        .or_else(|| data.get("declination"))
        .ok_or("Missing Dec")?;
    
    let coords = parse_coordinates(ra_str, dec_str)?;
    
    let position_angle = data.get("pa")
        .or_else(|| data.get("positionangle"))
        .and_then(|s| s.parse::<f64>().ok())
        .unwrap_or(0.0);
    
    Ok(create_target_from_coords(name, coords, position_angle))
}

// ============================================================================
// XML Import
// ============================================================================

/// Parse XML targets (generic)
pub fn parse_xml_targets(content: &str, format_name: &str) -> ImportResult {
    let mut targets = Vec::new();
    let errors: Vec<String> = Vec::new();
    let mut warnings = Vec::new();
    
    // Simple XML parsing without external dependencies
    let target_regex = regex_lite::Regex::new(
        r"<(?:Target|Object|DSO)[^>]*>([\s\S]*?)</(?:Target|Object|DSO)>"
    ).unwrap();
    
    let name_regex = regex_lite::Regex::new(r"<(?:Name|TargetName)>([^<]+)</").unwrap();
    let ra_regex = regex_lite::Regex::new(r"<(?:RA|RightAscension)>([^<]+)</").unwrap();
    let dec_regex = regex_lite::Regex::new(r"<(?:Dec|Declination)>([^<]+)</").unwrap();
    let pa_regex = regex_lite::Regex::new(r"<(?:PA|PositionAngle)>([^<]+)</").unwrap();
    
    for cap in target_regex.captures_iter(content) {
        let target_xml = &cap[1];
        
        let name = name_regex.captures(target_xml)
            .map(|c| c[1].to_string())
            .unwrap_or_else(|| "Unknown".to_string());
        
        let ra_str = match ra_regex.captures(target_xml) {
            Some(c) => c[1].to_string(),
            None => {
                warnings.push(format!("Target '{}': Missing RA", name));
                continue;
            }
        };
        
        let dec_str = match dec_regex.captures(target_xml) {
            Some(c) => c[1].to_string(),
            None => {
                warnings.push(format!("Target '{}': Missing Dec", name));
                continue;
            }
        };
        
        let position_angle = pa_regex.captures(target_xml)
            .and_then(|c| c[1].parse::<f64>().ok())
            .unwrap_or(0.0);
        
        match parse_coordinates(&ra_str, &dec_str) {
            Ok(coords) => {
                targets.push(create_target_from_coords(name, coords, position_angle));
            }
            Err(e) => {
                warnings.push(format!("Target '{}': {}", name, e));
            }
        }
    }
    
    let imported_count = targets.len();
    let total_rows = target_regex.captures_iter(content).count();
    
    ImportResult {
        success: errors.is_empty(),
        targets,
        errors,
        warnings,
        source_format: format_name.to_string(),
        total_rows,
        imported_count,
        skipped_count: 0,
    }
}

/// Parse XML content string
pub fn parse_xml_content(content: &str) -> ImportResult {
    // Detect format from XML
    if content.contains("<APT") || content.contains("<AstroPhotographyTool") {
        parse_apt_format(content)
    } else if content.contains("<Voyager") {
        parse_voyager_format(content)
    } else if content.contains("<NINA") || content.contains("<Sequence") {
        parse_xml_targets(content, "NINA XML")
    } else {
        parse_xml_targets(content, "Generic XML")
    }
}

// ============================================================================
// FITS Header Import
// ============================================================================

/// FITS header info
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FitsHeaderInfo {
    pub object_name: Option<String>,
    pub ra: Option<f64>,
    pub dec: Option<f64>,
    pub exposure_time: Option<f64>,
    pub filter: Option<String>,
    pub gain: Option<i32>,
    pub offset: Option<i32>,
    pub binning_x: Option<i32>,
    pub binning_y: Option<i32>,
    pub date_obs: Option<String>,
    pub telescope: Option<String>,
    pub instrument: Option<String>,
}

/// Parse FITS header from content (simplified - header only)
pub fn parse_fits_header(content: &[u8]) -> Result<FitsHeaderInfo, String> {
    // FITS headers are 80 characters per line, ASCII
    if content.len() < 2880 {
        return Err("File too small to be a valid FITS file".to_string());
    }
    
    let header_str = String::from_utf8_lossy(&content[..2880.min(content.len())]);
    let mut info = FitsHeaderInfo {
        object_name: None,
        ra: None,
        dec: None,
        exposure_time: None,
        filter: None,
        gain: None,
        offset: None,
        binning_x: None,
        binning_y: None,
        date_obs: None,
        telescope: None,
        instrument: None,
    };
    
    for i in 0..(header_str.len() / 80) {
        let line = &header_str[i*80..(i+1)*80];
        let key = line[..8].trim();
        
        if line.len() > 10 && &line[8..10] == "= " {
            let value = line[10..].trim();
            let value = value.split('/').next().unwrap_or(value).trim();
            let value = value.trim_matches('\'').trim();
            
            match key {
                "OBJECT" => info.object_name = Some(value.to_string()),
                "RA" | "OBJCTRA" => info.ra = value.parse().ok(),
                "DEC" | "OBJCTDEC" => info.dec = value.parse().ok(),
                "EXPTIME" | "EXPOSURE" => info.exposure_time = value.parse().ok(),
                "FILTER" => info.filter = Some(value.to_string()),
                "GAIN" => info.gain = value.parse().ok(),
                "OFFSET" => info.offset = value.parse().ok(),
                "XBINNING" => info.binning_x = value.parse().ok(),
                "YBINNING" => info.binning_y = value.parse().ok(),
                "DATE-OBS" => info.date_obs = Some(value.to_string()),
                "TELESCOP" => info.telescope = Some(value.to_string()),
                "INSTRUME" => info.instrument = Some(value.to_string()),
                _ => {}
            }
        }
        
        if key == "END" {
            break;
        }
    }
    
    Ok(info)
}

/// Create target from FITS header
pub fn create_target_from_fits(info: &FitsHeaderInfo) -> Option<SimpleTarget> {
    let name = info.object_name.clone()?;
    let ra = info.ra?;
    let dec = info.dec?;
    
    let coords = Coordinates::from_decimal(ra / 15.0, dec);
    let mut target = create_target_from_coords(name, coords, 0.0);
    
    // Add exposure if we have exposure info
    if let Some(exp_time) = info.exposure_time {
        let mut exposure = create_default_exposure();
        exposure.exposure_time = exp_time;
        
        if let Some(ref filter_name) = info.filter {
            exposure.filter = Some(crate::models::common::FilterInfo {
                name: filter_name.clone(),
                position: 0,
                focus_offset: None,
                auto_focus_exposure_time: None,
            });
        }
        
        if let Some(gain) = info.gain {
            exposure.gain = gain;
        }
        
        if let Some(offset) = info.offset {
            exposure.offset = offset;
        }
        
        if let (Some(x), Some(y)) = (info.binning_x, info.binning_y) {
            exposure.binning = BinningMode { x, y };
        }
        
        target.exposures = vec![exposure];
    }
    
    Some(target)
}

// ============================================================================
// Helper Functions
// ============================================================================

fn create_target_from_coords(name: String, coords: Coordinates, position_angle: f64) -> SimpleTarget {
    SimpleTarget {
        id: uuid::Uuid::new_v4().to_string(),
        name: name.clone(),
        status: SequenceEntityStatus::Created,
        file_name: None,
        target_name: name,
        coordinates: coords,
        position_angle,
        rotation: position_angle,
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
        exposures: vec![create_default_exposure()],
        estimated_start_time: None,
        estimated_end_time: None,
        estimated_duration: None,
    }
}

fn create_default_exposure() -> SimpleExposure {
    SimpleExposure {
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_ra() {
        assert!(parse_ra("12.5").is_ok());
        assert!(parse_ra("12h 30m 00s").is_ok());
        assert!(parse_ra("12:30:00").is_ok());
    }

    #[test]
    fn test_parse_dec() {
        assert!(parse_dec("45.5").is_ok());
        assert!(parse_dec("+45° 30' 00\"").is_ok());
        assert!(parse_dec("-45:30:00").is_ok());
    }

    #[test]
    fn test_parse_csv() {
        let csv = "name,ra,dec\nM31,00:42:44,+41:16:09\nM42,05:35:16,-05:23:28";
        let result = parse_csv_content(csv, None);
        assert_eq!(result.targets.len(), 2);
        assert_eq!(result.targets[0].target_name, "M31");
    }

    #[test]
    fn test_detect_csv_format() {
        let telescopius = vec!["Catalogue Entry".to_string(), "RA".to_string()];
        assert!(matches!(detect_csv_format(&telescopius), DetectedCsvFormat::Telescopius));
        
        let generic = vec!["name".to_string(), "ra".to_string(), "dec".to_string()];
        assert!(matches!(detect_csv_format(&generic), DetectedCsvFormat::Generic));
    }
}
