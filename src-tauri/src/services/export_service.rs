//! Export service for various file formats
//!
//! Supports exporting sequences to:
//! - CSV (various formats)
//! - XML
//! - Stellarium skylist
//! - APT format
//! - Voyager format
//! - NINA Target Set

use serde::{Deserialize, Serialize};
use chrono::Utc;

use crate::models::{SimpleSequence, SimpleTarget, Coordinates};
use crate::models::simple_sequence::TargetSetExport;

/// Export options
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportOptions {
    pub format: ExportFormat,
    pub include_exposures: bool,
    pub include_settings: bool,
    pub include_progress: bool,
    pub decimal_places: usize,
    pub coordinate_format: CoordinateFormat,
}

impl Default for ExportOptions {
    fn default() -> Self {
        Self {
            format: ExportFormat::Csv,
            include_exposures: true,
            include_settings: true,
            include_progress: false,
            decimal_places: 2,
            coordinate_format: CoordinateFormat::Sexagesimal,
        }
    }
}

/// Export format
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ExportFormat {
    Csv,
    CsvTelescopius,
    Xml,
    XmlApt,
    Stellarium,
    Voyager,
    NinaTargetSet,
    Json,
}

/// Coordinate format for export
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum CoordinateFormat {
    Sexagesimal,      // 00h 42m 44.3s
    SexagesimalColon, // 00:42:44.3
    Decimal,          // 0.712 (hours for RA, degrees for Dec)
    DecimalDegrees,   // 10.68 (degrees for both)
}

/// Export result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportResult {
    pub success: bool,
    pub content: String,
    pub format: String,
    pub target_count: usize,
    pub errors: Vec<String>,
}

// ============================================================================
// CSV Export
// ============================================================================

/// Export sequence to CSV
pub fn export_to_csv(sequence: &SimpleSequence, options: &ExportOptions) -> ExportResult {
    let mut lines = Vec::new();
    let errors: Vec<String> = Vec::new();
    
    // Header
    let mut headers = vec!["Name", "RA", "Dec", "Position Angle"];
    if options.include_exposures {
        headers.extend(&["Exposure Time", "Filter", "Binning", "Gain", "Offset", "Count"]);
    }
    if options.include_progress {
        headers.push("Progress");
    }
    lines.push(headers.join(","));
    
    // Data rows
    for target in &sequence.targets {
        let ra = format_ra(&target.coordinates, options.coordinate_format, options.decimal_places);
        let dec = format_dec(&target.coordinates, options.coordinate_format, options.decimal_places);
        
        if options.include_exposures && !target.exposures.is_empty() {
            for exp in &target.exposures {
                let mut row = vec![
                    escape_csv(&target.target_name),
                    ra.clone(),
                    dec.clone(),
                    format!("{:.1}", target.position_angle),
                    format!("{:.1}", exp.exposure_time),
                    exp.filter.as_ref().map(|f| f.name.clone()).unwrap_or_default(),
                    format!("{}x{}", exp.binning.x, exp.binning.y),
                    exp.gain.to_string(),
                    exp.offset.to_string(),
                    exp.total_count.to_string(),
                ];
                if options.include_progress {
                    row.push(exp.progress_count.to_string());
                }
                lines.push(row.join(","));
            }
        } else {
            let mut row = vec![
                escape_csv(&target.target_name),
                ra,
                dec,
                format!("{:.1}", target.position_angle),
            ];
            if options.include_exposures {
                row.extend(vec!["".to_string(), "".to_string(), "".to_string(), "".to_string(), "".to_string(), "".to_string()]);
            }
            if options.include_progress {
                row.push("".to_string());
            }
            lines.push(row.join(","));
        }
    }
    
    ExportResult {
        success: errors.is_empty(),
        content: lines.join("\n"),
        format: "CSV".to_string(),
        target_count: sequence.targets.len(),
        errors,
    }
}

/// Export to Telescopius CSV format
pub fn export_to_telescopius_csv(sequence: &SimpleSequence, _options: &ExportOptions) -> ExportResult {
    let mut lines = Vec::new();
    
    // Telescopius header
    lines.push("Pane,Familiar Name,Catalogue Entry,RA,Dec,Position Angle".to_string());
    
    for (idx, target) in sequence.targets.iter().enumerate() {
        let ra = format_ra(&target.coordinates, CoordinateFormat::SexagesimalColon, 2);
        let dec = format_dec(&target.coordinates, CoordinateFormat::SexagesimalColon, 2);
        
        let row = vec![
            (idx + 1).to_string(),
            escape_csv(&target.target_name),
            escape_csv(&target.name),
            ra,
            dec,
            format!("{:.1}", target.position_angle),
        ];
        lines.push(row.join(","));
    }
    
    ExportResult {
        success: true,
        content: lines.join("\n"),
        format: "Telescopius CSV".to_string(),
        target_count: sequence.targets.len(),
        errors: vec![],
    }
}

fn escape_csv(s: &str) -> String {
    if s.contains(',') || s.contains('"') || s.contains('\n') {
        format!("\"{}\"", s.replace('"', "\"\""))
    } else {
        s.to_string()
    }
}

// ============================================================================
// XML Export
// ============================================================================

/// Export to generic XML
pub fn export_to_xml(sequence: &SimpleSequence, options: &ExportOptions) -> ExportResult {
    let mut xml = String::new();
    
    xml.push_str("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    xml.push_str("<Sequence>\n");
    xml.push_str(&format!("  <Title>{}</Title>\n", escape_xml(&sequence.title)));
    xml.push_str("  <Targets>\n");
    
    for target in &sequence.targets {
        xml.push_str("    <Target>\n");
        xml.push_str(&format!("      <Name>{}</Name>\n", escape_xml(&target.target_name)));
        xml.push_str(&format!("      <RA>{}</RA>\n", 
            format_ra(&target.coordinates, options.coordinate_format, options.decimal_places)));
        xml.push_str(&format!("      <Dec>{}</Dec>\n", 
            format_dec(&target.coordinates, options.coordinate_format, options.decimal_places)));
        xml.push_str(&format!("      <PositionAngle>{:.1}</PositionAngle>\n", target.position_angle));
        
        if options.include_settings {
            xml.push_str(&format!("      <SlewToTarget>{}</SlewToTarget>\n", target.slew_to_target));
            xml.push_str(&format!("      <CenterTarget>{}</CenterTarget>\n", target.center_target));
            xml.push_str(&format!("      <StartGuiding>{}</StartGuiding>\n", target.start_guiding));
        }
        
        if options.include_exposures && !target.exposures.is_empty() {
            xml.push_str("      <Exposures>\n");
            for exp in &target.exposures {
                xml.push_str("        <Exposure>\n");
                xml.push_str(&format!("          <ExposureTime>{:.1}</ExposureTime>\n", exp.exposure_time));
                xml.push_str(&format!("          <ImageType>{:?}</ImageType>\n", exp.image_type));
                if let Some(ref filter) = exp.filter {
                    xml.push_str(&format!("          <Filter>{}</Filter>\n", escape_xml(&filter.name)));
                }
                xml.push_str(&format!("          <Binning>{}x{}</Binning>\n", exp.binning.x, exp.binning.y));
                xml.push_str(&format!("          <Gain>{}</Gain>\n", exp.gain));
                xml.push_str(&format!("          <Offset>{}</Offset>\n", exp.offset));
                xml.push_str(&format!("          <Count>{}</Count>\n", exp.total_count));
                if options.include_progress {
                    xml.push_str(&format!("          <Progress>{}</Progress>\n", exp.progress_count));
                }
                xml.push_str("        </Exposure>\n");
            }
            xml.push_str("      </Exposures>\n");
        }
        
        xml.push_str("    </Target>\n");
    }
    
    xml.push_str("  </Targets>\n");
    xml.push_str("</Sequence>\n");
    
    ExportResult {
        success: true,
        content: xml,
        format: "XML".to_string(),
        target_count: sequence.targets.len(),
        errors: vec![],
    }
}

/// Export to APT XML format
pub fn export_to_apt_xml(sequence: &SimpleSequence, _options: &ExportOptions) -> ExportResult {
    let mut xml = String::new();
    
    xml.push_str("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    xml.push_str("<AstroPhotographyTool version=\"3.0\">\n");
    xml.push_str("  <ObjectList>\n");
    
    for target in &sequence.targets {
        xml.push_str("    <Object>\n");
        xml.push_str(&format!("      <Name>{}</Name>\n", escape_xml(&target.target_name)));
        xml.push_str(&format!("      <RA>{}</RA>\n", target.coordinates.ra_to_decimal()));
        xml.push_str(&format!("      <Dec>{}</Dec>\n", target.coordinates.dec_to_decimal()));
        xml.push_str(&format!("      <PA>{:.1}</PA>\n", target.position_angle));
        xml.push_str("    </Object>\n");
    }
    
    xml.push_str("  </ObjectList>\n");
    xml.push_str("</AstroPhotographyTool>\n");
    
    ExportResult {
        success: true,
        content: xml,
        format: "APT XML".to_string(),
        target_count: sequence.targets.len(),
        errors: vec![],
    }
}

fn escape_xml(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

// ============================================================================
// Stellarium Export
// ============================================================================

/// Export to Stellarium skylist format
pub fn export_to_stellarium(sequence: &SimpleSequence, _options: &ExportOptions) -> ExportResult {
    let mut content = String::new();
    
    content.push_str("# Stellarium Skylist\n");
    content.push_str(&format!("# Exported from: {}\n", sequence.title));
    content.push_str(&format!("# Date: {}\n\n", Utc::now().format("%Y-%m-%d %H:%M:%S UTC")));
    
    for target in &sequence.targets {
        let ra_decimal = target.coordinates.ra_to_decimal();
        let dec_decimal = target.coordinates.dec_to_decimal();
        
        // Stellarium format: name RA Dec (decimal)
        content.push_str(&format!("{} {} {}\n", 
            target.target_name.replace(' ', "_"),
            ra_decimal,
            dec_decimal
        ));
    }
    
    ExportResult {
        success: true,
        content,
        format: "Stellarium".to_string(),
        target_count: sequence.targets.len(),
        errors: vec![],
    }
}

// ============================================================================
// Voyager Export
// ============================================================================

/// Export to Voyager format
pub fn export_to_voyager(sequence: &SimpleSequence, options: &ExportOptions) -> ExportResult {
    let mut content = String::new();
    
    content.push_str("; Voyager Target List\n");
    content.push_str(&format!("; Title: {}\n", sequence.title));
    content.push_str(&format!("; Exported: {}\n\n", Utc::now().format("%Y-%m-%d %H:%M:%S")));
    
    for target in &sequence.targets {
        content.push_str(&format!("[{}]\n", target.target_name));
        content.push_str(&format!("RA={}\n", 
            format_ra(&target.coordinates, CoordinateFormat::SexagesimalColon, 2)));
        content.push_str(&format!("Dec={}\n", 
            format_dec(&target.coordinates, CoordinateFormat::SexagesimalColon, 2)));
        content.push_str(&format!("PA={:.1}\n", target.position_angle));
        
        if options.include_settings {
            content.push_str(&format!("Slew={}\n", target.slew_to_target));
            content.push_str(&format!("Center={}\n", target.center_target));
            content.push_str(&format!("Guide={}\n", target.start_guiding));
        }
        
        if options.include_exposures && !target.exposures.is_empty() {
            for (idx, exp) in target.exposures.iter().enumerate() {
                content.push_str(&format!("Exposure{}Time={:.1}\n", idx + 1, exp.exposure_time));
                content.push_str(&format!("Exposure{}Count={}\n", idx + 1, exp.total_count));
                if let Some(ref filter) = exp.filter {
                    content.push_str(&format!("Exposure{}Filter={}\n", idx + 1, filter.name));
                }
            }
        }
        
        content.push('\n');
    }
    
    ExportResult {
        success: true,
        content,
        format: "Voyager".to_string(),
        target_count: sequence.targets.len(),
        errors: vec![],
    }
}

// ============================================================================
// NINA Target Set Export
// ============================================================================

/// Export to NINA Target Set format
pub fn export_to_nina_target_set(sequence: &SimpleSequence) -> ExportResult {
    let export: TargetSetExport = sequence.into();
    
    match serde_json::to_string_pretty(&export) {
        Ok(content) => ExportResult {
            success: true,
            content,
            format: "NINA Target Set".to_string(),
            target_count: sequence.targets.len(),
            errors: vec![],
        },
        Err(e) => ExportResult {
            success: false,
            content: String::new(),
            format: "NINA Target Set".to_string(),
            target_count: 0,
            errors: vec![format!("Serialization error: {}", e)],
        },
    }
}

// ============================================================================
// JSON Export
// ============================================================================

/// Export to JSON
pub fn export_to_json(sequence: &SimpleSequence) -> ExportResult {
    match serde_json::to_string_pretty(sequence) {
        Ok(content) => ExportResult {
            success: true,
            content,
            format: "JSON".to_string(),
            target_count: sequence.targets.len(),
            errors: vec![],
        },
        Err(e) => ExportResult {
            success: false,
            content: String::new(),
            format: "JSON".to_string(),
            target_count: 0,
            errors: vec![format!("Serialization error: {}", e)],
        },
    }
}

// ============================================================================
// Unified Export Function
// ============================================================================

/// Export sequence to specified format
pub fn export_sequence(sequence: &SimpleSequence, options: &ExportOptions) -> ExportResult {
    match options.format {
        ExportFormat::Csv => export_to_csv(sequence, options),
        ExportFormat::CsvTelescopius => export_to_telescopius_csv(sequence, options),
        ExportFormat::Xml => export_to_xml(sequence, options),
        ExportFormat::XmlApt => export_to_apt_xml(sequence, options),
        ExportFormat::Stellarium => export_to_stellarium(sequence, options),
        ExportFormat::Voyager => export_to_voyager(sequence, options),
        ExportFormat::NinaTargetSet => export_to_nina_target_set(sequence),
        ExportFormat::Json => export_to_json(sequence),
    }
}

/// Generate CSV content from targets only
pub fn generate_csv_content(targets: &[SimpleTarget], options: &ExportOptions) -> String {
    let mut lines = Vec::new();
    
    // Header
    lines.push("Name,RA,Dec,Position Angle".to_string());
    
    for target in targets {
        let ra = format_ra(&target.coordinates, options.coordinate_format, options.decimal_places);
        let dec = format_dec(&target.coordinates, options.coordinate_format, options.decimal_places);
        
        lines.push(format!("{},{},{},{:.1}",
            escape_csv(&target.target_name),
            ra,
            dec,
            target.position_angle
        ));
    }
    
    lines.join("\n")
}

/// Generate XML content from targets only
pub fn generate_xml_content(targets: &[SimpleTarget], options: &ExportOptions) -> String {
    let mut xml = String::new();
    
    xml.push_str("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    xml.push_str("<Targets>\n");
    
    for target in targets {
        xml.push_str("  <Target>\n");
        xml.push_str(&format!("    <Name>{}</Name>\n", escape_xml(&target.target_name)));
        xml.push_str(&format!("    <RA>{}</RA>\n", 
            format_ra(&target.coordinates, options.coordinate_format, options.decimal_places)));
        xml.push_str(&format!("    <Dec>{}</Dec>\n", 
            format_dec(&target.coordinates, options.coordinate_format, options.decimal_places)));
        xml.push_str(&format!("    <PositionAngle>{:.1}</PositionAngle>\n", target.position_angle));
        xml.push_str("  </Target>\n");
    }
    
    xml.push_str("</Targets>\n");
    xml
}

// ============================================================================
// Coordinate Formatting
// ============================================================================

/// Format RA according to specified format
pub fn format_ra(coords: &Coordinates, format: CoordinateFormat, decimal_places: usize) -> String {
    match format {
        CoordinateFormat::Sexagesimal => {
            format!("{:02}h {:02}m {:0width$.prec$}s",
                coords.ra_hours,
                coords.ra_minutes,
                coords.ra_seconds,
                width = 3 + decimal_places,
                prec = decimal_places
            )
        }
        CoordinateFormat::SexagesimalColon => {
            format!("{:02}:{:02}:{:0width$.prec$}",
                coords.ra_hours,
                coords.ra_minutes,
                coords.ra_seconds,
                width = 3 + decimal_places,
                prec = decimal_places
            )
        }
        CoordinateFormat::Decimal => {
            format!("{:.prec$}", coords.ra_to_decimal(), prec = decimal_places + 2)
        }
        CoordinateFormat::DecimalDegrees => {
            format!("{:.prec$}", coords.ra_to_degrees(), prec = decimal_places + 2)
        }
    }
}

/// Format Dec according to specified format
pub fn format_dec(coords: &Coordinates, format: CoordinateFormat, decimal_places: usize) -> String {
    let sign = if coords.negative_dec { "-" } else { "+" };
    
    match format {
        CoordinateFormat::Sexagesimal => {
            format!("{}{}° {:02}' {:0width$.prec$}\"",
                sign,
                coords.dec_degrees,
                coords.dec_minutes,
                coords.dec_seconds,
                width = 3 + decimal_places,
                prec = decimal_places
            )
        }
        CoordinateFormat::SexagesimalColon => {
            format!("{}{}:{:02}:{:0width$.prec$}",
                sign,
                coords.dec_degrees,
                coords.dec_minutes,
                coords.dec_seconds,
                width = 3 + decimal_places,
                prec = decimal_places
            )
        }
        CoordinateFormat::Decimal | CoordinateFormat::DecimalDegrees => {
            format!("{:.prec$}", coords.dec_to_decimal(), prec = decimal_places + 2)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::simple_sequence::SimpleSequence;

    fn test_sequence() -> SimpleSequence {
        SimpleSequence::default()
    }

    #[test]
    fn test_export_csv() {
        let seq = test_sequence();
        let options = ExportOptions::default();
        let result = export_to_csv(&seq, &options);
        assert!(result.success);
        assert!(result.content.contains("Name,RA,Dec"));
    }

    #[test]
    fn test_export_xml() {
        let seq = test_sequence();
        let options = ExportOptions::default();
        let result = export_to_xml(&seq, &options);
        assert!(result.success);
        assert!(result.content.contains("<?xml"));
    }

    #[test]
    fn test_format_ra() {
        let coords = Coordinates::new(12, 30, 45.5, 45, 30, 0.0, false);
        
        let sexagesimal = format_ra(&coords, CoordinateFormat::Sexagesimal, 1);
        assert!(sexagesimal.contains("12h"));
        
        let decimal = format_ra(&coords, CoordinateFormat::Decimal, 2);
        assert!(decimal.parse::<f64>().is_ok());
    }

    #[test]
    fn test_format_dec() {
        let coords = Coordinates::new(0, 0, 0.0, 45, 30, 0.0, true);
        
        let sexagesimal = format_dec(&coords, CoordinateFormat::Sexagesimal, 1);
        assert!(sexagesimal.starts_with('-'));
        
        let decimal = format_dec(&coords, CoordinateFormat::Decimal, 2);
        assert!(decimal.starts_with('-'));
    }
}
