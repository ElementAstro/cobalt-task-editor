//! Serialization service for NINA sequences
//!
//! Handles conversion between different formats (JSON, CSV, XML)

use crate::models::*;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum SerializerError {
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("CSV error: {0}")]
    Csv(String),
    #[error("XML error: {0}")]
    Xml(String),
    #[error("Invalid format: {0}")]
    InvalidFormat(String),
}

pub type Result<T> = std::result::Result<T, SerializerError>;

/// Serialize simple sequence to JSON
pub fn serialize_simple_sequence_json(sequence: &SimpleSequence) -> Result<String> {
    Ok(serde_json::to_string_pretty(sequence)?)
}

/// Deserialize simple sequence from JSON
pub fn deserialize_simple_sequence_json(json: &str) -> Result<SimpleSequence> {
    Ok(serde_json::from_str(json)?)
}

/// Serialize editor sequence to JSON
pub fn serialize_editor_sequence_json(sequence: &EditorSequence) -> Result<String> {
    Ok(serde_json::to_string_pretty(sequence)?)
}

/// Deserialize editor sequence from JSON
pub fn deserialize_editor_sequence_json(json: &str) -> Result<EditorSequence> {
    Ok(serde_json::from_str(json)?)
}

/// Export simple sequence to CSV (Telescopius format)
/// Optimized: Pre-allocate string capacity based on target count
pub fn export_to_csv(sequence: &SimpleSequence) -> Result<String> {
    // Estimate ~100 bytes per target for CSV row
    let estimated_size = 50 + sequence.targets.len() * 100;
    let mut output = String::with_capacity(estimated_size);
    output.push_str("Pane,RA,Dec,Position Angle (East)\n");

    for target in &sequence.targets {
        let ra_str = format!(
            "{:02}h {:02}m {:.1}s",
            target.coordinates.ra_hours,
            target.coordinates.ra_minutes,
            target.coordinates.ra_seconds
        );
        let dec_sign = if target.coordinates.negative_dec {
            "-"
        } else {
            "+"
        };
        let dec_str = format!(
            "{}{}d {:02}m {:.1}s",
            dec_sign,
            target.coordinates.dec_degrees,
            target.coordinates.dec_minutes,
            target.coordinates.dec_seconds
        );

        output.push_str(&format!(
            "{},{},{},{:.1}\n",
            target.target_name, ra_str, dec_str, target.position_angle
        ));
    }

    Ok(output)
}

/// Import targets from CSV
pub fn import_from_csv(csv_content: &str) -> Result<Vec<SimpleTarget>> {
    let lines: Vec<&str> = csv_content.lines().collect();
    if lines.len() < 2 {
        return Err(SerializerError::Csv(
            "CSV file is empty or has no data rows".into(),
        ));
    }

    let header = lines[0].to_lowercase();
    let headers: Vec<&str> = header.split(',').map(|h| h.trim()).collect();

    let is_telescopius = headers.contains(&"pane") || headers.contains(&"familiar name");
    let mut targets = Vec::new();

    for line in lines.iter().skip(1) {
        let values: Vec<&str> = line
            .split(',')
            .map(|v| v.trim().trim_matches('"'))
            .collect();
        if values.len() < headers.len() {
            continue;
        }

        let get_value = |key: &str| -> Option<&str> {
            headers
                .iter()
                .position(|h| *h == key)
                .and_then(|i| values.get(i).copied())
        };

        let (name, ra_str, dec_str, pa) = if is_telescopius {
            let name = get_value("pane")
                .or_else(|| get_value("familiar name"))
                .or_else(|| get_value("catalogue entry"))
                .unwrap_or("");
            let ra = get_value("ra")
                .or_else(|| get_value("right ascension"))
                .or_else(|| get_value("right ascension (j2000)"))
                .unwrap_or("");
            let dec = get_value("dec")
                .or_else(|| get_value("declination"))
                .or_else(|| get_value("declination (j2000)"))
                .unwrap_or("");
            let pa = get_value("position angle (east)")
                .and_then(|v| v.parse::<f64>().ok())
                .unwrap_or(0.0);
            (name, ra, dec, pa)
        } else {
            let name = get_value("name")
                .or_else(|| get_value("target"))
                .or_else(|| get_value("object"))
                .unwrap_or("");
            let ra = get_value("ra")
                .or_else(|| get_value("right ascension"))
                .unwrap_or("");
            let dec = get_value("dec")
                .or_else(|| get_value("declination"))
                .unwrap_or("");
            let pa = get_value("pa")
                .or_else(|| get_value("position angle"))
                .and_then(|v| v.parse::<f64>().ok())
                .unwrap_or(0.0);
            (name, ra, dec, pa)
        };

        if name.is_empty() || ra_str.is_empty() || dec_str.is_empty() {
            continue;
        }

        let ra_parsed = Coordinates::parse_ra(ra_str);
        let dec_parsed = Coordinates::parse_dec(dec_str);

        if let (Some((ra_h, ra_m, ra_s)), Some((dec_d, dec_m, dec_s, neg))) =
            (ra_parsed, dec_parsed)
        {
            let target = SimpleTarget {
                name: name.to_string(),
                target_name: name.to_string(),
                coordinates: Coordinates::new(ra_h, ra_m, ra_s, dec_d, dec_m, dec_s, neg),
                position_angle: pa % 360.0,
                ..Default::default()
            };
            targets.push(target);
        }
    }

    if targets.is_empty() {
        return Err(SerializerError::Csv(
            "No valid targets found in CSV file".into(),
        ));
    }

    Ok(targets)
}

/// Export simple sequence to XML (NINA target set format)
/// Optimized: Pre-allocate string capacity based on target and exposure count
pub fn export_to_xml(sequence: &SimpleSequence) -> Result<String> {
    // Estimate ~500 bytes per target + ~300 bytes per exposure
    let exposure_count: usize = sequence.targets.iter().map(|t| t.exposures.len()).sum();
    let estimated_size = 500 + sequence.targets.len() * 500 + exposure_count * 300;
    let mut xml = String::with_capacity(estimated_size);
    xml.push_str(r#"<?xml version="1.0" encoding="utf-8"?>"#);
    xml.push('\n');
    xml.push_str(r#"<ArrayOfCaptureSequenceList xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">"#);

    for target in &sequence.targets {
        let ra_degrees = (target.coordinates.ra_hours as f64
            + target.coordinates.ra_minutes as f64 / 60.0
            + target.coordinates.ra_seconds / 3600.0)
            * 15.0;
        let dec_degrees = (target.coordinates.dec_degrees as f64
            + target.coordinates.dec_minutes as f64 / 60.0
            + target.coordinates.dec_seconds / 3600.0)
            * if target.coordinates.negative_dec {
                -1.0
            } else {
                1.0
            };

        xml.push_str(&format!(
            r#"
  <CaptureSequenceList TargetName="{}" Mode="{:?}" Delay="{}" SlewToTarget="{}" CenterTarget="{}" RotateTarget="{}" StartGuiding="{}" AutoFocusOnStart="{}" AutoFocusOnFilterChange="{}">
    <Coordinates>
      <RA>{}</RA>
      <Dec>{}</Dec>
      <Epoch>J2000</Epoch>
    </Coordinates>
    <PositionAngle>{}</PositionAngle>
    <Items>"#,
            escape_xml(&target.target_name),
            target.mode,
            target.delay,
            target.slew_to_target,
            target.center_target,
            target.rotate_target,
            target.start_guiding,
            target.auto_focus_on_start,
            target.auto_focus_on_filter_change,
            ra_degrees,
            dec_degrees,
            target.position_angle
        ));

        for exp in &target.exposures {
            let filter_xml = if let Some(f) = &exp.filter {
                format!(
                    "<Name>{}</Name><Position>{}</Position>",
                    escape_xml(&f.name),
                    f.position
                )
            } else {
                String::new()
            };

            xml.push_str(&format!(
                r#"
      <CaptureSequence>
        <Enabled>{}</Enabled>
        <ExposureTime>{}</ExposureTime>
        <ImageType>{}</ImageType>
        <FilterType{}>{}</FilterType>
        <Binning><X>{}</X><Y>{}</Y></Binning>
        <Gain>{}</Gain>
        <Offset>{}</Offset>
        <TotalExposureCount>{}</TotalExposureCount>
        <ProgressExposureCount>{}</ProgressExposureCount>
        <Dither>{}</Dither>
        <DitherAmount>{}</DitherAmount>
      </CaptureSequence>"#,
                exp.enabled,
                exp.exposure_time,
                exp.image_type,
                if exp.filter.is_none() {
                    r#" xsi:nil="true""#
                } else {
                    ""
                },
                filter_xml,
                exp.binning.x,
                exp.binning.y,
                exp.gain,
                exp.offset,
                exp.total_count,
                exp.progress_count,
                exp.dither,
                exp.dither_every
            ));
        }

        xml.push_str(
            r#"
    </Items>
  </CaptureSequenceList>"#,
        );
    }

    xml.push_str("\n</ArrayOfCaptureSequenceList>");
    Ok(xml)
}

/// Export to NINA target set format
pub fn export_to_target_set(sequence: &SimpleSequence) -> Result<String> {
    let export: TargetSetExport = sequence.into();
    Ok(serde_json::to_string_pretty(&export)?)
}

fn escape_xml(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_sequence() -> SimpleSequence {
        let mut seq = SimpleSequence::default();
        seq.title = "Test Sequence".to_string();

        let mut target = SimpleTarget::default();
        target.target_name = "M31".to_string();
        target.coordinates = Coordinates::from_decimal(0.712, 41.27);
        target.position_angle = 45.0;

        let mut exposure = SimpleExposure::default();
        exposure.exposure_time = 60.0;
        exposure.total_count = 10;
        target.exposures = vec![exposure];

        seq.targets = vec![target];
        seq
    }

    #[test]
    fn test_serialize_deserialize_json() {
        let sequence = create_test_sequence();

        let json = serialize_simple_sequence_json(&sequence).unwrap();
        assert!(!json.is_empty());
        assert!(json.contains("Test Sequence"));

        let deserialized = deserialize_simple_sequence_json(&json).unwrap();
        assert_eq!(deserialized.title, sequence.title);
        assert_eq!(deserialized.targets.len(), 1);
    }

    #[test]
    fn test_export_to_csv() {
        let sequence = create_test_sequence();

        let csv = export_to_csv(&sequence).unwrap();
        assert!(csv.contains("Pane"));
        assert!(csv.contains("RA"));
        assert!(csv.contains("M31"));
    }

    #[test]
    fn test_import_from_csv() {
        let csv = "Pane,RA,Dec,Position Angle (East)\nM31,00h 42m 44.3s,+41° 16' 9.0\",45\n";

        let targets = import_from_csv(csv).unwrap();
        assert_eq!(targets.len(), 1);
        assert_eq!(targets[0].target_name, "M31");
    }

    #[test]
    fn test_export_to_xml() {
        let sequence = create_test_sequence();

        let xml = export_to_xml(&sequence).unwrap();
        assert!(xml.contains("<?xml"));
        assert!(xml.contains("CaptureSequenceList"));
        assert!(xml.contains("M31"));
    }

    #[test]
    fn test_export_to_target_set() {
        let sequence = create_test_sequence();

        let json = export_to_target_set(&sequence).unwrap();
        assert!(json.contains("Title"));
        assert!(json.contains("StartOptions"));
    }

    #[test]
    fn test_escape_xml() {
        assert_eq!(escape_xml("<test>"), "&lt;test&gt;");
        assert_eq!(escape_xml("a & b"), "a &amp; b");
    }
}
