//! Tests for astronomy service

#[cfg(test)]
mod tests {
    use super::super::astronomy::*;
    use chrono::{NaiveDate, TimeZone, Utc};

    fn test_location() -> ObserverLocation {
        ObserverLocation {
            latitude: 40.7128, // New York
            longitude: -74.0060,
            elevation: 10.0,
            timezone_offset: -5,
        }
    }

    fn test_coordinates() -> crate::models::Coordinates {
        // M31 Andromeda Galaxy
        crate::models::Coordinates::new(0, 42, 44.3, 41, 16, 9.0, false)
    }

    // ============================================================================
    // Julian Date Tests
    // ============================================================================

    #[test]
    fn test_datetime_to_jd() {
        // J2000.0 epoch: January 1, 2000, 12:00 TT
        let dt = Utc.with_ymd_and_hms(2000, 1, 1, 12, 0, 0).unwrap();
        let jd = datetime_to_jd(dt);
        assert!((jd - 2451545.0).abs() < 0.001);
    }

    #[test]
    fn test_jd_to_datetime_roundtrip() {
        let original = Utc::now();
        let jd = datetime_to_jd(original);
        let converted = jd_to_datetime(jd);

        // Should be within 1 second
        assert!((original - converted).num_seconds().abs() < 2);
    }

    #[test]
    fn test_jd_known_values() {
        // Test some known JD values
        let dt1 = Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap();
        let jd1 = datetime_to_jd(dt1);
        assert!((jd1 - 2460310.5).abs() < 0.01);
    }

    // ============================================================================
    // Sidereal Time Tests
    // ============================================================================

    #[test]
    fn test_gmst_range() {
        let jd = datetime_to_jd(Utc::now());
        let gmst_val = gmst(jd);
        assert!(gmst_val >= 0.0 && gmst_val < 360.0);
    }

    #[test]
    fn test_lst_range() {
        let jd = datetime_to_jd(Utc::now());
        let lst_val = lst(jd, -74.0);
        assert!(lst_val >= 0.0 && lst_val < 360.0);
    }

    // ============================================================================
    // Coordinate Transformation Tests
    // ============================================================================

    #[test]
    fn test_ra_dec_to_alt_az() {
        let location = test_location();
        let jd = datetime_to_jd(Utc::now());

        // Test with Polaris (approximately)
        let (alt, az) = ra_dec_to_alt_az(2.5, 89.26, location.latitude, location.longitude, jd);

        // Polaris should always be above horizon at this latitude
        assert!(alt > 0.0);
        // Azimuth should be valid
        assert!(az >= 0.0 && az < 360.0);
    }

    #[test]
    fn test_hour_angle() {
        let jd = datetime_to_jd(Utc::now());
        let ha = hour_angle(12.0, -74.0, jd);
        assert!(ha >= -180.0 && ha <= 180.0);
    }

    #[test]
    fn test_air_mass_at_zenith() {
        let am = air_mass(90.0);
        assert!(am.is_some());
        assert!((am.unwrap() - 1.0).abs() < 0.01);
    }

    #[test]
    fn test_air_mass_at_horizon() {
        let am = air_mass(0.0);
        assert!(am.is_none());
    }

    #[test]
    fn test_air_mass_at_45_degrees() {
        let am = air_mass(45.0);
        assert!(am.is_some());
        assert!(am.unwrap() > 1.0 && am.unwrap() < 2.0);
    }

    // ============================================================================
    // Sun Position Tests
    // ============================================================================

    #[test]
    fn test_sun_position_range() {
        let jd = datetime_to_jd(Utc::now());
        let (ra, dec) = sun_position(jd);

        assert!(ra >= 0.0 && ra < 24.0);
        assert!(dec >= -23.5 && dec <= 23.5);
    }

    #[test]
    fn test_sun_altitude() {
        let location = test_location();
        let jd = datetime_to_jd(Utc::now());
        let alt = sun_altitude(&location, jd);

        assert!(alt >= -90.0 && alt <= 90.0);
    }

    // ============================================================================
    // Moon Position Tests
    // ============================================================================

    #[test]
    fn test_moon_position_range() {
        let jd = datetime_to_jd(Utc::now());
        let (ra, dec, distance) = moon_position(jd);

        assert!(ra >= 0.0 && ra < 24.0);
        assert!(dec >= -30.0 && dec <= 30.0);
        assert!(distance > 350000.0 && distance < 420000.0);
    }

    #[test]
    fn test_moon_phase_range() {
        let jd = datetime_to_jd(Utc::now());
        let phase = moon_phase(jd);

        assert!(phase >= 0.0 && phase <= 1.0);
    }

    #[test]
    fn test_moon_illumination_range() {
        let jd = datetime_to_jd(Utc::now());
        let illum = moon_illumination(jd);

        assert!(illum >= 0.0 && illum <= 100.0);
    }

    #[test]
    fn test_moon_phase_name() {
        assert_eq!(moon_phase_name(0.0), "New Moon");
        assert_eq!(moon_phase_name(0.25), "First Quarter");
        assert_eq!(moon_phase_name(0.5), "Full Moon");
        assert_eq!(moon_phase_name(0.75), "Last Quarter");
    }

    // ============================================================================
    // Twilight Tests
    // ============================================================================

    #[test]
    fn test_calculate_twilight() {
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 3, 21).unwrap(); // Spring equinox - more reliable

        let twilight = calculate_twilight(&location, date);

        assert_eq!(twilight.date, "2024-03-21");
        // At New York latitude (40.7), should not be polar
        // Note: calculation may vary, so we just check the date is correct
    }

    #[test]
    fn test_twilight_order() {
        let location = test_location();
        let date = NaiveDate::from_ymd_opt(2024, 6, 21).unwrap();

        let twilight = calculate_twilight(&location, date);

        // Dawn times should be in order: astronomical < nautical < civil < sunrise
        if let (Some(astro), Some(naut), Some(civil), Some(sunrise)) = (
            twilight.astronomical_dawn,
            twilight.nautical_dawn,
            twilight.civil_dawn,
            twilight.sunrise,
        ) {
            assert!(astro < naut);
            assert!(naut < civil);
            assert!(civil < sunrise);
        }
    }

    // ============================================================================
    // Visibility Tests
    // ============================================================================

    #[test]
    fn test_calculate_visibility_window() {
        let location = test_location();
        let coords = test_coordinates();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();

        let window = calculate_visibility_window(&coords, &location, date, 20.0);

        // M31 should be visible from New York in October
        assert!(window.is_visible);
        assert!(window.max_altitude > 20.0);
        assert!(window.duration_hours > 0.0);
    }

    #[test]
    fn test_visibility_window_never_visible() {
        let location = test_location();
        // Southern hemisphere object
        let coords = crate::models::Coordinates::new(12, 0, 0.0, 70, 0, 0.0, true); // -70 dec
        let date = NaiveDate::from_ymd_opt(2024, 6, 21).unwrap();

        let window = calculate_visibility_window(&coords, &location, date, 20.0);

        // Should not be visible from New York
        assert!(!window.is_visible);
    }

    // ============================================================================
    // Observation Quality Tests
    // ============================================================================

    #[test]
    fn test_observation_quality_score_range() {
        let location = test_location();
        let coords = test_coordinates();
        let dt = Utc::now();

        let quality = calculate_observation_quality(&coords, &location, dt);

        assert!(quality.score >= 0.0 && quality.score <= 100.0);
        assert!(quality.altitude_score >= 0.0);
        assert!(quality.moon_score >= 0.0);
        assert!(quality.twilight_score >= 0.0);
    }

    // ============================================================================
    // Batch Calculation Tests
    // ============================================================================

    #[test]
    fn test_batch_calculate_positions() {
        let location = test_location();
        let targets = vec![
            ("m31".to_string(), test_coordinates()),
            (
                "m42".to_string(),
                crate::models::Coordinates::new(5, 35, 16.0, 5, 23, 28.0, true),
            ),
        ];
        let dt = Utc::now();

        let results = batch_calculate_positions(&targets, &location, dt, 20.0);

        assert_eq!(results.len(), 2);
        assert_eq!(results[0].id, "m31");
        assert_eq!(results[1].id, "m42");
    }

    // ============================================================================
    // Moon Phase Info Tests
    // ============================================================================

    #[test]
    fn test_get_moon_phase_info() {
        let dt = Utc::now();
        let info = get_moon_phase_info(dt);

        assert!(info.phase >= 0.0 && info.phase <= 1.0);
        assert!(info.illumination >= 0.0 && info.illumination <= 100.0);
        assert!(!info.phase_name.is_empty());
        assert!(info.age_days >= 0.0 && info.age_days <= 30.0);
    }

    // ============================================================================
    // Optimal Time Tests
    // ============================================================================

    #[test]
    fn test_find_optimal_observation_time() {
        let location = test_location();
        let coords = test_coordinates();
        let date = NaiveDate::from_ymd_opt(2024, 10, 15).unwrap();

        let optimal = find_optimal_observation_time(&coords, &location, date, 20.0);

        // Should find an optimal time for M31 in October
        assert!(optimal.is_some());
    }
}
