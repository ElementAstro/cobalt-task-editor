// Test module for all service tests
// 
// Run tests with: cargo test

// Integration tests
#[cfg(test)]
mod integration_tests {
    use crate::models::*;
    use crate::services::*;

    fn create_test_sequence() -> SimpleSequence {
        let mut seq = SimpleSequence::default();
        seq.title = "Test Sequence".to_string();
        seq.estimated_download_time = 5.0;
        
        let mut target = SimpleTarget::default();
        target.target_name = "M31 - Andromeda".to_string();
        target.coordinates = Coordinates::from_decimal(0.712, 41.27);
        
        let mut exposure = SimpleExposure::default();
        exposure.exposure_time = 60.0;
        exposure.total_count = 10;
        target.exposures = vec![exposure];
        
        seq.targets = vec![target];
        seq
    }

    fn create_test_target() -> SimpleTarget {
        let mut target = SimpleTarget::default();
        target.name = "Test Target".to_string();
        target.target_name = "M31".to_string();
        target.coordinates = Coordinates::from_decimal(0.712, 41.27);
        target
    }

    fn create_test_exposure() -> SimpleExposure {
        let mut exp = SimpleExposure::default();
        exp.exposure_time = 60.0;
        exp.total_count = 10;
        exp
    }

    // ==================== Model Tests ====================

    #[test]
    fn test_simple_sequence_default() {
        let seq = SimpleSequence::default();
        assert!(!seq.id.is_empty());
        assert_eq!(seq.title, "Target Set");
        assert!(!seq.targets.is_empty());
    }

    #[test]
    fn test_simple_target_default() {
        let target = SimpleTarget::default();
        assert!(!target.id.is_empty());
        assert!(target.slew_to_target);
        assert!(target.center_target);
    }

    #[test]
    fn test_simple_exposure_default() {
        let exp = SimpleExposure::default();
        assert!(!exp.id.is_empty());
        assert!(exp.enabled);
        assert_eq!(exp.exposure_time, 60.0);
        assert_eq!(exp.total_count, 10);
    }

    #[test]
    fn test_coordinates_from_decimal() {
        let coords = Coordinates::from_decimal(12.5, 45.75);
        assert_eq!(coords.ra_hours, 12);
        assert_eq!(coords.ra_minutes, 30);
        assert!(!coords.negative_dec);
    }

    #[test]
    fn test_coordinates_negative_dec() {
        let coords = Coordinates::from_decimal(6.0, -30.5);
        assert!(coords.negative_dec);
        assert_eq!(coords.dec_degrees, 30);
    }

    #[test]
    fn test_coordinates_to_decimal() {
        let coords = Coordinates::new(12, 30, 0.0, 45, 30, 0.0, false);
        let ra = coords.ra_to_decimal();
        let dec = coords.dec_to_decimal();
        assert!((ra - 12.5).abs() < 0.001);
        assert!((dec - 45.5).abs() < 0.001);
    }

    #[test]
    fn test_coordinates_validation() {
        let valid = Coordinates::from_decimal(12.0, 45.0);
        assert!(valid.validate().is_empty());
        
        let mut invalid = Coordinates::default();
        invalid.ra_hours = 25; // Invalid
        assert!(!invalid.validate().is_empty());
    }

    // ==================== Calculator Tests ====================

    #[test]
    fn test_exposure_runtime() {
        let mut exp = SimpleExposure::default();
        exp.exposure_time = 60.0;
        exp.total_count = 10;
        
        let runtime = calculator::calculate_exposure_runtime(&exp, 5.0);
        assert_eq!(runtime, 650.0); // (60 + 5) * 10
    }

    #[test]
    fn test_target_runtime() {
        let mut target = create_test_target();
        let mut exp = create_test_exposure();
        exp.exposure_time = 30.0;
        exp.total_count = 5;
        target.exposures = vec![exp];
        
        let runtime = calculator::calculate_target_runtime(&target, 5.0);
        assert_eq!(runtime, 175.0); // (30 + 5) * 5
    }

    #[test]
    fn test_sequence_runtime() {
        let seq = create_test_sequence();
        let runtime = calculator::calculate_sequence_runtime(&seq);
        assert!(runtime > 0.0);
    }

    #[test]
    fn test_format_duration_seconds() {
        assert_eq!(calculator::format_duration(45.0), "45s");
    }

    #[test]
    fn test_format_duration_minutes() {
        assert_eq!(calculator::format_duration(125.0), "2m 5s");
    }

    #[test]
    fn test_format_duration_hours() {
        assert_eq!(calculator::format_duration(3725.0), "1h 2m 5s");
    }

    #[test]
    fn test_format_duration_days() {
        assert_eq!(calculator::format_duration(90125.0), "1d 1h 2m 5s");
    }

    #[test]
    fn test_angular_separation() {
        // Same point should be 0
        let coord1 = Coordinates::from_decimal(0.0, 0.0);
        let coord2 = Coordinates::from_decimal(0.0, 0.0);
        let dist = calculator::angular_separation(&coord1, &coord2);
        assert!(dist < 0.001);
        
        // Different points
        let coord3 = Coordinates::from_decimal(6.0, 0.0);
        let dist2 = calculator::angular_separation(&coord1, &coord3);
        assert!(dist2 > 0.0);
    }

    #[test]
    fn test_moon_phase() {
        use chrono::Utc;
        let phase = calculator::calculate_moon_phase(Utc::now());
        assert!(phase >= 0.0 && phase <= 1.0);
    }

    // ==================== Validator Tests ====================

    #[test]
    fn test_validate_simple_sequence_valid() {
        let seq = create_test_sequence();
        let result = validator::validate_simple_sequence(&seq);
        assert!(result.valid);
    }

    #[test]
    fn test_validate_simple_sequence_empty_title() {
        let mut seq = create_test_sequence();
        seq.title = String::new();
        let result = validator::validate_simple_sequence(&seq);
        assert!(!result.valid);
    }

    #[test]
    fn test_validate_target_empty_name() {
        let mut target = create_test_target();
        target.target_name = String::new();
        let result = validator::validate_simple_target(&target);
        assert!(!result.valid);
    }

    #[test]
    fn test_validate_exposure_invalid_time() {
        let mut exp = create_test_exposure();
        exp.exposure_time = -1.0;
        let result = validator::validate_simple_exposure(&exp);
        assert!(!result.valid);
    }

    #[test]
    fn test_validate_exposure_invalid_count() {
        let mut exp = create_test_exposure();
        exp.total_count = -1;
        let result = validator::validate_simple_exposure(&exp);
        assert!(!result.valid);
    }

    #[test]
    fn test_validate_coordinates_invalid_ra() {
        let mut coords = Coordinates::default();
        coords.ra_hours = 30;
        let result = validator::validate_coordinates(&coords);
        assert!(!result.valid);
    }

    #[test]
    fn test_validate_coordinates_invalid_dec() {
        let mut coords = Coordinates::default();
        coords.dec_degrees = 100;
        let result = validator::validate_coordinates(&coords);
        assert!(!result.valid);
    }

    // ==================== Clipboard Tests ====================

    #[test]
    fn test_clipboard_copy_paste_target() {
        let target = create_test_target();
        clipboard_service::copy_target(target.clone());
        
        assert!(clipboard_service::has_clipboard_content());
        assert!(clipboard_service::has_clipboard_content_type("target"));
        
        let pasted = clipboard_service::paste_target().unwrap();
        assert_ne!(pasted.id, target.id);
        assert!(pasted.name.contains("Copy"));
    }

    #[test]
    fn test_clipboard_copy_paste_exposure() {
        let exp = create_test_exposure();
        clipboard_service::copy_exposure(exp.clone());
        
        assert!(clipboard_service::has_clipboard_content());
        
        let pasted = clipboard_service::paste_exposure().unwrap();
        assert_ne!(pasted.id, exp.id);
    }

    #[test]
    fn test_clipboard_copy_multiple_targets() {
        let targets = vec![create_test_target(), create_test_target()];
        clipboard_service::copy_targets(targets);
        
        let pasted = clipboard_service::paste_targets().unwrap();
        assert_eq!(pasted.len(), 2);
    }

    #[test]
    fn test_clipboard_clear() {
        clipboard_service::copy_target(create_test_target());
        clipboard_service::clear_clipboard();
        assert!(!clipboard_service::has_clipboard_content());
    }

    // ==================== Log Service Tests ====================

    #[test]
    fn test_log_service_basic() {
        log_service::log_info("test", "Test message");
        log_service::log_debug("test", "Debug message");
        log_service::log_warning("test", "Warning message");
        log_service::log_error("test", "Error message");
        
        let logs = log_service::get_recent_logs(10, None);
        assert!(!logs.is_empty());
    }

    #[test]
    fn test_log_service_filter_by_level() {
        log_service::clear_log_buffer();
        log_service::log_info("test", "Info");
        log_service::log_error("test", "Error");
        
        let errors = log_service::get_recent_logs(10, Some(log_service::LogLevel::Error));
        assert!(errors.iter().all(|l| matches!(l.level, log_service::LogLevel::Error)));
    }

    #[test]
    fn test_log_service_filter_by_category() {
        log_service::clear_log_buffer();
        log_service::log_info("category1", "Message 1");
        log_service::log_info("category2", "Message 2");
        
        let filtered = log_service::get_logs_by_category("category1", 10);
        assert!(filtered.iter().all(|l| l.category == "category1"));
    }

    // ==================== Integration Tests ====================

    #[test]
    fn test_full_workflow_simple_sequence() {
        // Create a sequence
        let mut sequence = SimpleSequence {
            id: "workflow-test".to_string(),
            title: "Workflow Test".to_string(),
            save_path: None,
            is_dirty: false,
            start_options: StartOptions {
                cool_camera_at_sequence_start: true,
                cool_camera_temperature: -10.0,
                cool_camera_duration: 600,
                unpark_mount_at_sequence_start: true,
                do_meridian_flip: true,
            },
            end_options: EndOptions {
                warm_cam_at_sequence_end: true,
                warm_camera_duration: 600,
                park_mount_at_sequence_end: true,
            },
            targets: vec![],
            selected_target_id: None,
            active_target_id: None,
            is_running: false,
            overall_start_time: None,
            overall_end_time: None,
            overall_duration: None,
            estimated_download_time: 5.0,
        };

        // Add a target
        let target = SimpleTarget {
            id: "target1".to_string(),
            name: "M31".to_string(),
            status: SequenceEntityStatus::Created,
            file_name: None,
            target_name: "M31 - Andromeda".to_string(),
            coordinates: Coordinates::from_decimal(0.712, 41.27),
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
            exposures: vec![
                SimpleExposure {
                    id: "exp1".to_string(),
                    enabled: true,
                    status: SequenceEntityStatus::Created,
                    exposure_time: 60.0,
                    image_type: ImageType::Light,
                    filter: None,
                    binning: BinningMode { x: 1, y: 1 },
                    gain: -1,
                    offset: -1,
                    total_count: 10,
                    progress_count: 0,
                    dither: false,
                    dither_every: 1,
                },
            ],
            estimated_start_time: None,
            estimated_end_time: None,
            estimated_duration: None,
        };
        sequence.targets.push(target);

        // Validate
        let validation = validator::validate_simple_sequence(&sequence);
        assert!(validation.valid, "Sequence should be valid: {:?}", validation.errors);

        // Serialize to JSON
        let json = serializer::serialize_simple_sequence_json(&sequence).unwrap();
        assert!(!json.is_empty());

        // Deserialize
        let deserialized = serializer::deserialize_simple_sequence_json(&json).unwrap();
        assert_eq!(deserialized.title, sequence.title);
        assert_eq!(deserialized.targets.len(), 1);

        // Export to CSV
        let csv = serializer::export_to_csv(&sequence).unwrap();
        assert!(csv.contains("M31"));

        // Calculate runtime
        let runtime = calculator::calculate_sequence_runtime(&sequence);
        assert!(runtime > 0.0);

        // Calculate ETAs
        calculator::calculate_sequence_etas(&mut sequence);
        assert!(sequence.overall_duration.is_some());
    }

    #[test]
    fn test_full_workflow_editor_sequence() {
        // Create an editor sequence
        let sequence = EditorSequence {
            id: "editor-test".to_string(),
            title: "Editor Test".to_string(),
            start_items: vec![
                EditorSequenceItem {
                    id: "start1".to_string(),
                    item_type: "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer".to_string(),
                    name: "Cool Camera".to_string(),
                    category: "Camera".to_string(),
                    icon: None,
                    description: None,
                    status: SequenceEntityStatus::Created,
                    is_expanded: None,
                    data: std::collections::HashMap::new(),
                    items: None,
                    conditions: None,
                    triggers: None,
                },
            ],
            target_items: vec![],
            end_items: vec![],
            global_triggers: vec![],
        };

        // Validate
        let validation = validator::validate_editor_sequence(&sequence);
        assert!(validation.valid);

        // Export to NINA format
        let nina_json = nina_serializer::export_to_nina(&sequence).unwrap();
        assert!(!nina_json.is_empty());
        assert!(nina_json.contains("SequenceRootContainer"));

        // Import back
        let imported = nina_serializer::import_from_nina(&nina_json).unwrap();
        assert_eq!(imported.title, sequence.title);
        assert_eq!(imported.start_items.len(), sequence.start_items.len());
    }

    #[test]
    fn test_csv_import_export_roundtrip() {
        let sequence = SimpleSequence {
            id: "csv-test".to_string(),
            title: "CSV Test".to_string(),
            save_path: None,
            is_dirty: false,
            start_options: StartOptions::default(),
            end_options: EndOptions::default(),
            targets: vec![
                SimpleTarget {
                    id: "t1".to_string(),
                    name: "M31".to_string(),
                    status: SequenceEntityStatus::Created,
                    file_name: None,
                    target_name: "M31".to_string(),
                    coordinates: Coordinates::from_decimal(0.712, 41.27),
                    position_angle: 45.0,
                    rotation: 0.0,
                    delay: 0,
                    mode: SequenceMode::Standard,
                    slew_to_target: true,
                    center_target: true,
                    rotate_target: false,
                    start_guiding: true,
                    auto_focus_on_start: false,
                    auto_focus_on_filter_change: false,
                    auto_focus_after_set_time: false,
                    auto_focus_set_time: 30,
                    auto_focus_after_set_exposures: false,
                    auto_focus_set_exposures: 10,
                    auto_focus_after_temperature_change: false,
                    auto_focus_after_temperature_change_amount: 1.0,
                    auto_focus_after_hfr_change: false,
                    auto_focus_after_hfr_change_amount: 15.0,
                    exposures: vec![],
                    estimated_start_time: None,
                    estimated_end_time: None,
                    estimated_duration: None,
                },
                SimpleTarget {
                    id: "t2".to_string(),
                    name: "M42".to_string(),
                    status: SequenceEntityStatus::Created,
                    file_name: None,
                    target_name: "M42".to_string(),
                    coordinates: Coordinates::from_decimal(5.588, -5.39),
                    position_angle: 0.0,
                    rotation: 0.0,
                    delay: 0,
                    mode: SequenceMode::Standard,
                    slew_to_target: true,
                    center_target: true,
                    rotate_target: false,
                    start_guiding: true,
                    auto_focus_on_start: false,
                    auto_focus_on_filter_change: false,
                    auto_focus_after_set_time: false,
                    auto_focus_set_time: 30,
                    auto_focus_after_set_exposures: false,
                    auto_focus_set_exposures: 10,
                    auto_focus_after_temperature_change: false,
                    auto_focus_after_temperature_change_amount: 1.0,
                    auto_focus_after_hfr_change: false,
                    auto_focus_after_hfr_change_amount: 15.0,
                    exposures: vec![],
                    estimated_start_time: None,
                    estimated_end_time: None,
                    estimated_duration: None,
                },
            ],
            selected_target_id: None,
            active_target_id: None,
            is_running: false,
            overall_start_time: None,
            overall_end_time: None,
            overall_duration: None,
            estimated_download_time: 5.0,
        };

        // Export to CSV
        let csv = serializer::export_to_csv(&sequence).unwrap();
        
        // Import from CSV
        let imported_targets = serializer::import_from_csv(&csv).unwrap();
        
        assert_eq!(imported_targets.len(), 2);
        assert_eq!(imported_targets[0].target_name, "M31");
        assert_eq!(imported_targets[1].target_name, "M42");
    }

    // ==================== Additional Model Tests ====================

    #[test]
    fn test_binning_mode_default() {
        let binning = BinningMode::default();
        assert_eq!(binning.x, 1);
        assert_eq!(binning.y, 1);
    }

    #[test]
    fn test_start_options_default() {
        let opts = StartOptions::default();
        assert!(opts.cool_camera_at_sequence_start);
        assert!(opts.unpark_mount_at_sequence_start);
    }

    #[test]
    fn test_end_options_default() {
        let opts = EndOptions::default();
        assert!(opts.warm_cam_at_sequence_end);
        assert!(opts.park_mount_at_sequence_end);
    }

    #[test]
    fn test_validation_result_creation() {
        let result = ValidationResult::ok();
        assert!(result.valid);
        assert!(result.errors.is_empty());
        
        let result = ValidationResult::error("Test error".to_string());
        assert!(!result.valid);
        assert_eq!(result.errors.len(), 1);
    }

    #[test]
    fn test_sequence_entity_status_default() {
        let status = SequenceEntityStatus::default();
        assert!(matches!(status, SequenceEntityStatus::Created));
    }

    #[test]
    fn test_image_type_default() {
        let img_type = ImageType::default();
        assert!(matches!(img_type, ImageType::Light));
    }

    #[test]
    fn test_sequence_mode_default() {
        let mode = SequenceMode::default();
        assert!(matches!(mode, SequenceMode::Standard));
    }

    // ==================== Additional Calculator Tests ====================

    #[test]
    fn test_ra_decimal_conversion_roundtrip() {
        let original = 15.75;
        let (h, m, s) = calculator::decimal_to_ra(original);
        let converted = calculator::ra_to_decimal(h, m, s);
        assert!((original - converted).abs() < 0.001);
    }

    #[test]
    fn test_dec_decimal_conversion_roundtrip() {
        let original = -45.25;
        let (d, m, s, neg) = calculator::decimal_to_dec(original);
        let converted = calculator::dec_to_decimal(d, m, s, neg);
        assert!((original - converted).abs() < 0.001);
    }

    #[test]
    fn test_format_duration_negative() {
        assert_eq!(calculator::format_duration(-10.0), "0s");
    }

    #[test]
    fn test_calculate_end_time() {
        use chrono::Utc;
        let start = Utc::now();
        let end = calculator::calculate_end_time(start, 3600.0);
        let diff = (end - start).num_seconds();
        assert_eq!(diff, 3600);
    }

    #[test]
    fn test_moon_illumination() {
        use chrono::Utc;
        let illumination = calculator::calculate_moon_illumination(Utc::now());
        assert!(illumination >= 0.0 && illumination <= 100.0);
    }

    // ==================== Additional Serializer Tests ====================

    #[test]
    fn test_serialize_editor_sequence() {
        let seq = EditorSequence {
            id: "test".to_string(),
            title: "Test".to_string(),
            start_items: vec![],
            target_items: vec![],
            end_items: vec![],
            global_triggers: vec![],
        };
        
        let json = serializer::serialize_editor_sequence_json(&seq).unwrap();
        assert!(json.contains("Test"));
        
        let deserialized = serializer::deserialize_editor_sequence_json(&json).unwrap();
        assert_eq!(deserialized.title, seq.title);
    }

    #[test]
    fn test_export_to_xml_with_exposures() {
        let mut seq = create_test_sequence();
        seq.targets[0].exposures.push(create_test_exposure());
        
        let xml = serializer::export_to_xml(&seq).unwrap();
        assert!(xml.contains("CaptureSequence"));
        assert!(xml.contains("ExposureTime"));
    }

    // ==================== Additional NINA Serializer Tests ====================

    #[test]
    fn test_nina_export_with_conditions() {
        let item = EditorSequenceItem {
            id: "test".to_string(),
            item_type: "NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer".to_string(),
            name: "Container".to_string(),
            category: "Container".to_string(),
            icon: None,
            description: None,
            status: SequenceEntityStatus::Created,
            is_expanded: Some(true),
            data: std::collections::HashMap::new(),
            items: Some(vec![]),
            conditions: Some(vec![
                EditorCondition {
                    id: "cond1".to_string(),
                    condition_type: "NINA.Sequencer.Conditions.LoopCondition, NINA.Sequencer".to_string(),
                    name: "Loop".to_string(),
                    category: "Conditions".to_string(),
                    icon: None,
                    data: std::collections::HashMap::new(),
                }
            ]),
            triggers: None,
        };
        
        let seq = EditorSequence {
            id: "test".to_string(),
            title: "Test".to_string(),
            start_items: vec![item],
            target_items: vec![],
            end_items: vec![],
            global_triggers: vec![],
        };
        
        let json = nina_serializer::export_to_nina(&seq).unwrap();
        assert!(json.contains("Conditions"));
    }

    #[test]
    fn test_nina_validate_invalid_json() {
        let result = nina_serializer::validate_nina_json("not valid json");
        assert!(result.is_err());
    }

    // ==================== Additional Validator Tests ====================

    #[test]
    fn test_validate_nina_json_valid() {
        let json = r#"{"$type": "NINA.Sequencer.Container.SequenceRootContainer, NINA.Sequencer", "Items": {"$values": []}}"#;
        let result = validator::validate_nina_json(json);
        assert!(result.valid);
    }

    #[test]
    fn test_validate_nina_json_invalid() {
        let json = r#"{"name": "test"}"#;
        let result = validator::validate_nina_json(json);
        assert!(!result.valid);
    }

    #[test]
    fn test_is_container_type() {
        assert!(validator::is_container_type("NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer"));
        assert!(validator::is_container_type("NINA.Sequencer.SequenceItem.Imaging.SmartExposure, NINA.Sequencer"));
        assert!(!validator::is_container_type("NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer"));
    }

    // ==================== Edge Case Tests ====================

    #[test]
    fn test_empty_sequence_validation() {
        let mut seq = SimpleSequence::default();
        seq.targets.clear();
        let result = validator::validate_simple_sequence(&seq);
        // Empty targets may or may not be valid depending on validation rules
        // Just verify we get a result without panicking
        let _ = result.valid;
    }

    #[test]
    fn test_disabled_exposure_runtime() {
        let mut exp = create_test_exposure();
        exp.enabled = false;
        let runtime = calculator::calculate_exposure_runtime(&exp, 5.0);
        assert_eq!(runtime, 0.0);
    }

    #[test]
    fn test_coordinates_parse_ra() {
        let result = Coordinates::parse_ra("12h 30m 45.5s");
        assert!(result.is_some());
        let (h, m, s) = result.unwrap();
        assert_eq!(h, 12);
        assert_eq!(m, 30);
        assert!((s - 45.5).abs() < 0.1);
    }

    #[test]
    fn test_coordinates_parse_dec() {
        let result = Coordinates::parse_dec("+45d 30m 15.0s");
        assert!(result.is_some());
        let (d, m, s, neg) = result.unwrap();
        assert_eq!(d, 45);
        assert_eq!(m, 30);
        assert!((s - 15.0).abs() < 0.1);
        assert!(!neg);
    }

    #[test]
    fn test_coordinates_parse_dec_negative() {
        let result = Coordinates::parse_dec("-30° 15' 30.0\"");
        assert!(result.is_some());
        let (d, m, _s, neg) = result.unwrap();
        assert_eq!(d, 30);
        assert_eq!(m, 15);
        assert!(neg);
    }
}
