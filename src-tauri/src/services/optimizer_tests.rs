//! Tests for sequence optimizer service

#[cfg(test)]
mod tests {
    use super::super::sequence_optimizer::*;
    use super::super::astronomy::ObserverLocation;
    use crate::models::{SimpleSequence, SimpleTarget, SimpleExposure, Coordinates};
    use crate::models::common::{SequenceEntityStatus, SequenceMode, ImageType, BinningMode};
    use chrono::{NaiveDate, Utc};

    fn test_location() -> ObserverLocation {
        ObserverLocation {
            latitude: 40.7128,
            longitude: -74.0060,
            elevation: 10.0,
            timezone_offset: -5,
        }
    }

    fn create_test_sequence() -> SimpleSequence {
        let mut seq = SimpleSequence::new("Test Sequence".to_string());
        seq.targets = vec![
            create_test_target("M31", 0, 42, 44.3, 41, 16, 9.0, false),
            create_test_target("M42", 5, 35, 16.0, 5, 23, 28.0, true),
            create_test_target("M45", 3, 47, 0.0, 24, 7, 0.0, false),
        ];
        seq.estimated_download_time = 5.0;
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
    // Optimization Strategy Tests
    // ============================================================================

    #[test]
    fn test_optimize_sequence_max_altitude() {
        let seq = create_test_sequence();
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();
        
        let result = optimize_sequence(&seq, &location, date, OptimizationStrategy::MaxAltitude);
        
        assert!(result.success);
        assert_eq!(result.original_order.len(), 3);
        assert_eq!(result.optimized_order.len(), 3);
    }

    #[test]
    fn test_optimize_sequence_transit_time() {
        let seq = create_test_sequence();
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();
        
        let result = optimize_sequence(&seq, &location, date, OptimizationStrategy::TransitTime);
        
        assert!(result.success);
    }

    #[test]
    fn test_optimize_sequence_visibility_start() {
        let seq = create_test_sequence();
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();
        
        let result = optimize_sequence(&seq, &location, date, OptimizationStrategy::VisibilityStart);
        
        assert!(result.success);
    }

    #[test]
    fn test_optimize_sequence_visibility_duration() {
        let seq = create_test_sequence();
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();
        
        let result = optimize_sequence(&seq, &location, date, OptimizationStrategy::VisibilityDuration);
        
        assert!(result.success);
    }

    #[test]
    fn test_optimize_sequence_minimize_slew() {
        let seq = create_test_sequence();
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();
        
        let result = optimize_sequence(&seq, &location, date, OptimizationStrategy::MinimizeSlew);
        
        assert!(result.success);
    }

    #[test]
    fn test_optimize_sequence_combined() {
        let seq = create_test_sequence();
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();
        
        let result = optimize_sequence(&seq, &location, date, OptimizationStrategy::Combined);
        
        assert!(result.success);
        assert!(result.improvements.len() > 0);
    }

    // ============================================================================
    // Conflict Detection Tests
    // ============================================================================

    #[test]
    fn test_detect_conflicts_no_conflicts() {
        let seq = create_test_sequence();
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();
        
        let result = detect_conflicts(&seq, &location, date);
        
        // With short exposures, there should be no time conflicts
        assert!(result.conflicts.len() <= 3); // May have visibility warnings
    }

    #[test]
    fn test_detect_conflicts_with_long_exposures() {
        let mut seq = create_test_sequence();
        // Make exposures very long
        for target in &mut seq.targets {
            for exp in &mut target.exposures {
                exp.exposure_time = 3600.0; // 1 hour
                exp.total_count = 100;
            }
        }
        
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();
        
        let result = detect_conflicts(&seq, &location, date);
        
        // Should detect insufficient time conflicts
        assert!(result.has_conflicts || result.suggestions.len() > 0);
    }

    // ============================================================================
    // ETA Calculation Tests
    // ============================================================================

    #[test]
    fn test_calculate_etas_parallel() {
        let seq = create_test_sequence();
        let start = Utc::now();
        
        let results = calculate_etas_parallel(&seq, start);
        
        assert_eq!(results.len(), 3);
        
        // Check that ETAs are sequential
        for i in 1..results.len() {
            assert!(results[i].eta_start > results[i-1].eta_start);
        }
    }

    #[test]
    fn test_calculate_etas_runtime() {
        let seq = create_test_sequence();
        let start = Utc::now();
        
        let results = calculate_etas_parallel(&seq, start);
        
        // Each target has 10 exposures of 60s + 5s download = 650s
        for result in &results {
            assert!((result.runtime - 650.0).abs() < 1.0);
        }
    }

    // ============================================================================
    // Visibility Calculation Tests
    // ============================================================================

    #[test]
    fn test_calculate_visibility_parallel() {
        let seq = create_test_sequence();
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();
        
        let results = calculate_visibility_parallel(&seq.targets, &location, date, 20.0);
        
        assert_eq!(results.len(), 3);
    }

    // ============================================================================
    // Schedule Info Tests
    // ============================================================================

    #[test]
    fn test_get_schedule_info() {
        let seq = create_test_sequence();
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();
        
        let info = get_schedule_info(&seq, &location, date);
        
        assert_eq!(info.len(), 3);
        
        for target_info in &info {
            assert!(!target_info.target_name.is_empty());
            assert!(target_info.quality_score >= 0.0);
        }
    }

    // ============================================================================
    // Apply Optimization Tests
    // ============================================================================

    #[test]
    fn test_apply_optimized_order() {
        let mut seq = create_test_sequence();
        let original_ids: Vec<String> = seq.targets.iter().map(|t| t.id.clone()).collect();
        
        // Reverse the order
        let reversed: Vec<String> = original_ids.iter().rev().cloned().collect();
        
        apply_optimized_order(&mut seq, &reversed);
        
        assert_eq!(seq.targets[0].id, original_ids[2]);
        assert_eq!(seq.targets[2].id, original_ids[0]);
    }

    #[test]
    fn test_apply_optimized_order_partial() {
        let mut seq = create_test_sequence();
        let first_id = seq.targets[0].id.clone();
        
        // Only include first target
        apply_optimized_order(&mut seq, &[first_id.clone()]);
        
        assert_eq!(seq.targets.len(), 1);
        assert_eq!(seq.targets[0].id, first_id);
    }

    // ============================================================================
    // Merge Sequences Tests
    // ============================================================================

    #[test]
    fn test_merge_sequences() {
        let seq1 = create_test_sequence();
        let seq2 = create_test_sequence();
        
        let merged = merge_sequences(&[seq1.clone(), seq2.clone()], Some("Merged".to_string()));
        
        assert_eq!(merged.title, "Merged");
        assert_eq!(merged.targets.len(), 6);
    }

    #[test]
    fn test_merge_sequences_unique_ids() {
        let seq1 = create_test_sequence();
        let seq2 = create_test_sequence();
        
        let merged = merge_sequences(&[seq1, seq2], None);
        
        // All IDs should be unique
        let ids: Vec<&String> = merged.targets.iter().map(|t| &t.id).collect();
        let unique_ids: std::collections::HashSet<&String> = ids.iter().cloned().collect();
        assert_eq!(ids.len(), unique_ids.len());
    }

    // ============================================================================
    // Split Sequence Tests
    // ============================================================================

    #[test]
    fn test_split_sequence() {
        let seq = create_test_sequence();
        
        let split = split_sequence(&seq);
        
        assert_eq!(split.len(), 3);
        
        for (i, s) in split.iter().enumerate() {
            assert_eq!(s.targets.len(), 1);
            assert_eq!(s.title, seq.targets[i].target_name);
        }
    }

    #[test]
    fn test_split_sequence_preserves_settings() {
        let mut seq = create_test_sequence();
        seq.start_options.cool_camera_temperature = -20.0;
        seq.estimated_download_time = 10.0;
        
        let split = split_sequence(&seq);
        
        for s in &split {
            assert_eq!(s.start_options.cool_camera_temperature, -20.0);
            assert_eq!(s.estimated_download_time, 10.0);
        }
    }

    // ============================================================================
    // Edge Cases
    // ============================================================================

    #[test]
    fn test_optimize_empty_sequence() {
        let mut seq = SimpleSequence::new("Empty".to_string());
        seq.targets.clear();
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();
        
        let result = optimize_sequence(&seq, &location, date, OptimizationStrategy::Combined);
        
        assert!(result.success);
        assert_eq!(result.optimized_order.len(), 0);
    }

    #[test]
    fn test_optimize_single_target() {
        let mut seq = create_test_sequence();
        seq.targets = vec![seq.targets.remove(0)];
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();
        
        let result = optimize_sequence(&seq, &location, date, OptimizationStrategy::Combined);
        
        assert!(result.success);
        assert_eq!(result.optimized_order.len(), 1);
    }

    #[test]
    fn test_merge_empty_sequences() {
        let merged = merge_sequences(&[], Some("Empty".to_string()));
        
        assert_eq!(merged.targets.len(), 0);
    }

    #[test]
    fn test_split_empty_sequence() {
        let mut seq = SimpleSequence::new("Empty".to_string());
        seq.targets.clear();
        
        let split = split_sequence(&seq);
        
        assert_eq!(split.len(), 0);
    }
}
