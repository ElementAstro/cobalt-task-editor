//! Tests for export service

#[cfg(test)]
mod tests {
    use super::super::export_service::*;
    use crate::models::{SimpleSequence, SimpleTarget, SimpleExposure, Coordinates};
    use crate::models::common::{SequenceEntityStatus, SequenceMode, ImageType, BinningMode};

    fn create_test_sequence() -> SimpleSequence {
        let mut seq = SimpleSequence::new("Test Sequence".to_string());
        seq.targets = vec![
            create_test_target("M31", 0, 42, 44.3, 41, 16, 9.0, false),
            create_test_target("M42", 5, 35, 16.0, 5, 23, 28.0, true),
        ];
        seq
    }

    fn create_test_target(
        name: &str,
        ra_h: i32, ra_m: i32, ra_s: f64,
        dec_d: i32, dec_m: i32, dec_s: f64,
        neg_dec: bool,
    ) -> SimpleTarget {
        SimpleTarget {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.to_string(),
            status: SequenceEntityStatus::Created,
            file_name: None,
            target_name: name.to_string(),
            coordinates: Coordinates::new(ra_h, ra_m, ra_s, dec_d, dec_m, dec_s, neg_dec),
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
            exposures: vec![create_test_exposure()],
            estimated_start_time: None,
            estimated_end_time: None,
            estimated_duration: None,
        }
    }

    fn create_test_exposure() -> SimpleExposure {
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

    // ============================================================================
    // CSV Export Tests
    // ============================================================================

    #[test]
    fn test_export_to_csv_basic() {
        let seq = create_test_sequence();
        let options = ExportOptions::default();
        
        let result = export_to_csv(&seq, &options);
        
        assert!(result.success);
        assert!(result.content.contains("Name,RA,Dec"));
        assert!(result.content.contains("M31"));
        assert!(result.content.contains("M42"));
        assert_eq!(result.target_count, 2);
    }

    #[test]
    fn test_export_to_csv_with_exposures() {
        let seq = create_test_sequence();
        let options = ExportOptions {
            include_exposures: true,
            ..Default::default()
        };
        
        let result = export_to_csv(&seq, &options);
        
        assert!(result.success);
        assert!(result.content.contains("Exposure Time"));
        assert!(result.content.contains("60.0"));
    }

    #[test]
    fn test_export_to_csv_without_exposures() {
        let seq = create_test_sequence();
        let options = ExportOptions {
            include_exposures: false,
            ..Default::default()
        };
        
        let result = export_to_csv(&seq, &options);
        
        assert!(result.success);
        assert!(!result.content.contains("Exposure Time"));
    }

    #[test]
    fn test_export_to_telescopius_csv() {
        let seq = create_test_sequence();
        let options = ExportOptions::default();
        
        let result = export_to_telescopius_csv(&seq, &options);
        
        assert!(result.success);
        assert!(result.content.contains("Pane,Familiar Name,Catalogue Entry"));
        assert!(result.content.contains("M31"));
    }

    // ============================================================================
    // XML Export Tests
    // ============================================================================

    #[test]
    fn test_export_to_xml_basic() {
        let seq = create_test_sequence();
        let options = ExportOptions::default();
        
        let result = export_to_xml(&seq, &options);
        
        assert!(result.success);
        assert!(result.content.contains("<?xml"));
        assert!(result.content.contains("<Sequence>"));
        assert!(result.content.contains("<Target>"));
        assert!(result.content.contains("<Name>M31</Name>"));
    }

    #[test]
    fn test_export_to_xml_with_settings() {
        let seq = create_test_sequence();
        let options = ExportOptions {
            include_settings: true,
            ..Default::default()
        };
        
        let result = export_to_xml(&seq, &options);
        
        assert!(result.success);
        assert!(result.content.contains("<SlewToTarget>"));
        assert!(result.content.contains("<CenterTarget>"));
    }

    #[test]
    fn test_export_to_apt_xml() {
        let seq = create_test_sequence();
        let options = ExportOptions::default();
        
        let result = export_to_apt_xml(&seq, &options);
        
        assert!(result.success);
        assert!(result.content.contains("<AstroPhotographyTool"));
        assert!(result.content.contains("<ObjectList>"));
    }

    // ============================================================================
    // Stellarium Export Tests
    // ============================================================================

    #[test]
    fn test_export_to_stellarium() {
        let seq = create_test_sequence();
        let options = ExportOptions::default();
        
        let result = export_to_stellarium(&seq, &options);
        
        assert!(result.success);
        assert!(result.content.contains("# Stellarium Skylist"));
        assert!(result.content.contains("M31"));
    }

    // ============================================================================
    // Voyager Export Tests
    // ============================================================================

    #[test]
    fn test_export_to_voyager() {
        let seq = create_test_sequence();
        let options = ExportOptions::default();
        
        let result = export_to_voyager(&seq, &options);
        
        assert!(result.success);
        assert!(result.content.contains("[M31]"));
        assert!(result.content.contains("RA="));
        assert!(result.content.contains("Dec="));
    }

    // ============================================================================
    // JSON Export Tests
    // ============================================================================

    #[test]
    fn test_export_to_json() {
        let seq = create_test_sequence();
        
        let result = export_to_json(&seq);
        
        assert!(result.success);
        assert!(result.content.contains("\"title\""));
        assert!(result.content.contains("\"targets\""));
        
        // Should be valid JSON
        let parsed: Result<serde_json::Value, _> = serde_json::from_str(&result.content);
        assert!(parsed.is_ok());
    }

    // ============================================================================
    // NINA Target Set Export Tests
    // ============================================================================

    #[test]
    fn test_export_to_nina_target_set() {
        let seq = create_test_sequence();
        
        let result = export_to_nina_target_set(&seq);
        
        assert!(result.success);
        
        // Should be valid JSON
        let parsed: Result<serde_json::Value, _> = serde_json::from_str(&result.content);
        assert!(parsed.is_ok());
    }

    // ============================================================================
    // Coordinate Formatting Tests
    // ============================================================================

    #[test]
    fn test_format_ra_sexagesimal() {
        let coords = Coordinates::new(12, 30, 45.5, 0, 0, 0.0, false);
        let formatted = format_ra(&coords, CoordinateFormat::Sexagesimal, 1);
        
        assert!(formatted.contains("12h"));
        assert!(formatted.contains("30m"));
        assert!(formatted.contains("45.5s"));
    }

    #[test]
    fn test_format_ra_colon() {
        let coords = Coordinates::new(12, 30, 45.5, 0, 0, 0.0, false);
        let formatted = format_ra(&coords, CoordinateFormat::SexagesimalColon, 1);
        
        assert!(formatted.contains("12:30:"));
    }

    #[test]
    fn test_format_ra_decimal() {
        let coords = Coordinates::new(12, 30, 0.0, 0, 0, 0.0, false);
        let formatted = format_ra(&coords, CoordinateFormat::Decimal, 2);
        
        let value: f64 = formatted.parse().unwrap();
        assert!((value - 12.5).abs() < 0.01);
    }

    #[test]
    fn test_format_dec_positive() {
        let coords = Coordinates::new(0, 0, 0.0, 45, 30, 0.0, false);
        let formatted = format_dec(&coords, CoordinateFormat::Sexagesimal, 1);
        
        assert!(formatted.starts_with('+'));
        assert!(formatted.contains("45°"));
    }

    #[test]
    fn test_format_dec_negative() {
        let coords = Coordinates::new(0, 0, 0.0, 45, 30, 0.0, true);
        let formatted = format_dec(&coords, CoordinateFormat::Sexagesimal, 1);
        
        assert!(formatted.starts_with('-'));
    }

    // ============================================================================
    // Export Sequence Function Tests
    // ============================================================================

    #[test]
    fn test_export_sequence_csv() {
        let seq = create_test_sequence();
        let options = ExportOptions {
            format: ExportFormat::Csv,
            ..Default::default()
        };
        
        let result = export_sequence(&seq, &options);
        
        assert!(result.success);
        assert_eq!(result.format, "CSV");
    }

    #[test]
    fn test_export_sequence_xml() {
        let seq = create_test_sequence();
        let options = ExportOptions {
            format: ExportFormat::Xml,
            ..Default::default()
        };
        
        let result = export_sequence(&seq, &options);
        
        assert!(result.success);
        assert_eq!(result.format, "XML");
    }

    #[test]
    fn test_export_sequence_json() {
        let seq = create_test_sequence();
        let options = ExportOptions {
            format: ExportFormat::Json,
            ..Default::default()
        };
        
        let result = export_sequence(&seq, &options);
        
        assert!(result.success);
        assert_eq!(result.format, "JSON");
    }

    // ============================================================================
    // Generate Content Tests
    // ============================================================================

    #[test]
    fn test_generate_csv_content() {
        let seq = create_test_sequence();
        let options = ExportOptions::default();
        
        let content = generate_csv_content(&seq.targets, &options);
        
        assert!(content.contains("Name,RA,Dec"));
        assert!(content.contains("M31"));
    }

    #[test]
    fn test_generate_xml_content() {
        let seq = create_test_sequence();
        let options = ExportOptions::default();
        
        let content = generate_xml_content(&seq.targets, &options);
        
        assert!(content.contains("<?xml"));
        assert!(content.contains("<Targets>"));
    }

    // ============================================================================
    // Edge Cases
    // ============================================================================

    #[test]
    fn test_export_empty_sequence() {
        let mut seq = SimpleSequence::new("Empty".to_string());
        seq.targets.clear();
        let options = ExportOptions::default();
        
        let result = export_to_csv(&seq, &options);
        
        assert!(result.success);
        assert_eq!(result.target_count, 0);
    }

    #[test]
    fn test_export_special_characters() {
        let mut seq = create_test_sequence();
        seq.targets[0].target_name = "Test, \"with\" special".to_string();
        let options = ExportOptions::default();
        
        let result = export_to_csv(&seq, &options);
        
        assert!(result.success);
        // Should be properly escaped
        assert!(result.content.contains("\"Test, \"\"with\"\" special\""));
    }
}
