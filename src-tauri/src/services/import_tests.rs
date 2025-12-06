//! Tests for import service

#[cfg(test)]
mod tests {
    use super::super::import_service::*;

    // ============================================================================
    // CSV Parsing Tests
    // ============================================================================

    #[test]
    fn test_parse_csv_basic() {
        let csv = "name,ra,dec\nM31,00:42:44,+41:16:09\nM42,05:35:16,-05:23:28";
        let result = parse_csv_content(csv, None);
        
        assert!(result.success);
        assert_eq!(result.targets.len(), 2);
        assert_eq!(result.targets[0].target_name, "M31");
        assert_eq!(result.targets[1].target_name, "M42");
    }

    #[test]
    fn test_parse_csv_with_quotes() {
        let csv = r#"name,ra,dec
"Andromeda Galaxy",00:42:44,+41:16:09
"Orion Nebula",05:35:16,-05:23:28"#;
        let result = parse_csv_content(csv, None);
        
        assert!(result.success);
        assert_eq!(result.targets.len(), 2);
        assert_eq!(result.targets[0].target_name, "Andromeda Galaxy");
    }

    #[test]
    fn test_parse_csv_decimal_coords() {
        let csv = "name,ra,dec\nTest,12.5,45.5";
        let result = parse_csv_content(csv, None);
        
        assert!(result.success);
        assert_eq!(result.targets.len(), 1);
        assert_eq!(result.targets[0].coordinates.ra_hours, 12);
    }

    #[test]
    fn test_parse_csv_empty() {
        let csv = "";
        let result = parse_csv_content(csv, None);
        
        assert!(!result.success);
        assert!(result.errors.len() > 0);
    }

    #[test]
    fn test_parse_csv_missing_columns() {
        let csv = "name,other\nM31,test";
        let result = parse_csv_content(csv, None);
        
        // Should fail due to missing RA/Dec
        assert_eq!(result.targets.len(), 0);
    }

    #[test]
    fn test_parse_csv_with_mapping() {
        let csv = "object,right_ascension,declination\nM31,00:42:44,+41:16:09";
        let mapping = CsvColumnMapping {
            name_column: Some("object".to_string()),
            ra_column: Some("right_ascension".to_string()),
            dec_column: Some("declination".to_string()),
            position_angle_column: None,
            notes_column: None,
            delimiter: Some(','),
            has_header: true,
        };
        
        let result = parse_csv_content(csv, Some(mapping));
        
        assert!(result.success);
        assert_eq!(result.targets.len(), 1);
        assert_eq!(result.targets[0].target_name, "M31");
    }

    #[test]
    fn test_parse_csv_semicolon_delimiter() {
        let csv = "name;ra;dec\nM31;00:42:44;+41:16:09";
        let mapping = CsvColumnMapping {
            delimiter: Some(';'),
            has_header: true,
            ..Default::default()
        };
        
        let result = parse_csv_content(csv, Some(mapping));
        
        assert!(result.success);
        assert_eq!(result.targets.len(), 1);
    }

    // ============================================================================
    // CSV Format Detection Tests
    // ============================================================================

    #[test]
    fn test_detect_csv_format_telescopius() {
        let headers = vec!["Catalogue Entry".to_string(), "Familiar Name".to_string(), "RA".to_string()];
        let format = detect_csv_format(&headers);
        assert!(matches!(format, DetectedCsvFormat::Telescopius));
    }

    #[test]
    fn test_detect_csv_format_generic() {
        let headers = vec!["name".to_string(), "ra".to_string(), "dec".to_string()];
        let format = detect_csv_format(&headers);
        assert!(matches!(format, DetectedCsvFormat::Generic));
    }

    #[test]
    fn test_detect_csv_format_unknown() {
        let headers = vec!["foo".to_string(), "bar".to_string()];
        let format = detect_csv_format(&headers);
        assert!(matches!(format, DetectedCsvFormat::Unknown));
    }

    // ============================================================================
    // Coordinate Parsing Tests
    // ============================================================================

    #[test]
    fn test_parse_ra_hms() {
        // Test various RA formats
        let test_cases = vec![
            ("12h 30m 45s", true),
            ("12:30:45", true),
            ("12.5", true),
            ("invalid", false),
        ];
        
        for (input, should_succeed) in test_cases {
            let result = parse_csv_content(&format!("name,ra,dec\nTest,{},+45:00:00", input), None);
            if should_succeed {
                assert_eq!(result.targets.len(), 1, "Failed for input: {}", input);
            }
        }
    }

    #[test]
    fn test_parse_dec_dms() {
        // Test various Dec formats
        let test_cases = vec![
            ("+45° 30' 00\"", true),
            ("-45:30:00", true),
            ("45.5", true),
            ("+45 30 00", true),
        ];
        
        for (input, should_succeed) in test_cases {
            let result = parse_csv_content(&format!("name,ra,dec\nTest,12:00:00,{}", input), None);
            if should_succeed {
                assert_eq!(result.targets.len(), 1, "Failed for input: {}", input);
            }
        }
    }

    #[test]
    fn test_parse_negative_dec() {
        let csv = "name,ra,dec\nTest,12:00:00,-45:30:00";
        let result = parse_csv_content(csv, None);
        
        assert!(result.success);
        assert!(result.targets[0].coordinates.negative_dec);
    }

    // ============================================================================
    // Stellarium Import Tests
    // ============================================================================

    #[test]
    fn test_parse_stellarium_simple() {
        let content = "# Stellarium skylist\nM31 0.712 41.27\nM42 5.588 -5.39";
        let result = parse_stellarium_skylist(content);
        
        assert!(result.success);
        assert_eq!(result.targets.len(), 2);
    }

    #[test]
    fn test_parse_stellarium_with_comments() {
        let content = "# Comment line\n// Another comment\nM31 0.712 41.27";
        let result = parse_stellarium_skylist(content);
        
        assert!(result.success);
        assert_eq!(result.targets.len(), 1);
    }

    #[test]
    fn test_parse_stellarium_json() {
        let content = r#"{"name": "M31", "ra": 10.68, "dec": 41.27}"#;
        let result = parse_stellarium_skylist(content);
        
        assert!(result.success);
        assert_eq!(result.targets.len(), 1);
    }

    // ============================================================================
    // Voyager Import Tests
    // ============================================================================

    #[test]
    fn test_parse_voyager_format() {
        let content = r#"[M31]
RA=00:42:44
Dec=+41:16:09
PA=0

[M42]
RA=05:35:16
Dec=-05:23:28"#;
        
        let result = parse_voyager_format(content);
        
        assert!(result.success);
        assert_eq!(result.targets.len(), 2);
        assert_eq!(result.targets[0].target_name, "M31");
    }

    // ============================================================================
    // XML Import Tests
    // ============================================================================

    #[test]
    fn test_parse_xml_targets() {
        let xml = r#"<?xml version="1.0"?>
<Targets>
    <Target>
        <Name>M31</Name>
        <RA>00:42:44</RA>
        <Dec>+41:16:09</Dec>
    </Target>
</Targets>"#;
        
        let result = parse_xml_targets(xml, "Test");
        
        assert!(result.success);
        assert_eq!(result.targets.len(), 1);
        assert_eq!(result.targets[0].target_name, "M31");
    }

    #[test]
    fn test_parse_xml_with_position_angle() {
        let xml = r#"<Target>
    <Name>Test</Name>
    <RA>12:00:00</RA>
    <Dec>+45:00:00</Dec>
    <PA>45.0</PA>
</Target>"#;
        
        let result = parse_xml_targets(xml, "Test");
        
        assert!(result.success);
        assert_eq!(result.targets.len(), 1);
        assert!((result.targets[0].position_angle - 45.0).abs() < 0.1);
    }

    // ============================================================================
    // FITS Header Tests
    // ============================================================================

    #[test]
    fn test_parse_fits_header_too_small() {
        let data = vec![0u8; 100];
        let result = parse_fits_header(&data);
        
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_fits_header_basic() {
        // Create a minimal FITS header
        let mut header = vec![b' '; 2880];
        let object_line = b"OBJECT  = 'M31'                                                                 ";
        header[..80].copy_from_slice(object_line);
        let end_line = b"END                                                                             ";
        header[80..160].copy_from_slice(end_line);
        
        let result = parse_fits_header(&header);
        
        assert!(result.is_ok());
        let info = result.unwrap();
        assert_eq!(info.object_name, Some("M31".to_string()));
    }

    // ============================================================================
    // Import Result Tests
    // ============================================================================

    #[test]
    fn test_import_result_statistics() {
        let csv = "name,ra,dec\nM31,00:42:44,+41:16:09\nBad,invalid,data\nM42,05:35:16,-05:23:28";
        let result = parse_csv_content(csv, None);
        
        assert_eq!(result.total_rows, 3);
        assert_eq!(result.imported_count, 2);
        assert_eq!(result.skipped_count, 1);
    }

    // ============================================================================
    // Auto-Detection Tests
    // ============================================================================

    #[test]
    fn test_parse_xml_content_auto_detect() {
        let xml = r#"<?xml version="1.0"?><Target><Name>Test</Name><RA>12:00:00</RA><Dec>+45:00:00</Dec></Target>"#;
        let result = parse_xml_content(xml);
        
        assert!(result.success);
    }
}
