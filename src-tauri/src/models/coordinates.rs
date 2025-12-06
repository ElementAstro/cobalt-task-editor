//! Astronomical coordinate types and utilities

use serde::{Deserialize, Serialize};

/// Right Ascension and Declination coordinates
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Coordinates {
    pub ra_hours: i32,
    pub ra_minutes: i32,
    pub ra_seconds: f64,
    pub dec_degrees: i32,
    pub dec_minutes: i32,
    pub dec_seconds: f64,
    pub negative_dec: bool,
}

impl Coordinates {
    /// Create new coordinates
    pub fn new(
        ra_hours: i32,
        ra_minutes: i32,
        ra_seconds: f64,
        dec_degrees: i32,
        dec_minutes: i32,
        dec_seconds: f64,
        negative_dec: bool,
    ) -> Self {
        Self {
            ra_hours,
            ra_minutes,
            ra_seconds,
            dec_degrees,
            dec_minutes,
            dec_seconds,
            negative_dec,
        }
    }

    /// Convert RA to decimal hours
    pub fn ra_to_decimal(&self) -> f64 {
        self.ra_hours as f64 + self.ra_minutes as f64 / 60.0 + self.ra_seconds / 3600.0
    }

    /// Convert RA to decimal degrees
    pub fn ra_to_degrees(&self) -> f64 {
        self.ra_to_decimal() * 15.0
    }

    /// Convert Dec to decimal degrees
    pub fn dec_to_decimal(&self) -> f64 {
        let value = self.dec_degrees.abs() as f64
            + self.dec_minutes as f64 / 60.0
            + self.dec_seconds / 3600.0;
        if self.negative_dec {
            -value
        } else {
            value
        }
    }

    /// Create coordinates from decimal RA (hours) and Dec (degrees)
    pub fn from_decimal(ra_hours: f64, dec_degrees: f64) -> Self {
        let ra_h = ra_hours.floor() as i32;
        let ra_m_decimal = (ra_hours - ra_h as f64) * 60.0;
        let ra_m = ra_m_decimal.floor() as i32;
        let ra_s = (ra_m_decimal - ra_m as f64) * 60.0;

        let negative_dec = dec_degrees < 0.0;
        let dec_abs = dec_degrees.abs();
        let dec_d = dec_abs.floor() as i32;
        let dec_m_decimal = (dec_abs - dec_d as f64) * 60.0;
        let dec_m = dec_m_decimal.floor() as i32;
        let dec_s = (dec_m_decimal - dec_m as f64) * 60.0;

        Self {
            ra_hours: ra_h,
            ra_minutes: ra_m,
            ra_seconds: (ra_s * 100.0).round() / 100.0,
            dec_degrees: dec_d,
            dec_minutes: dec_m,
            dec_seconds: (dec_s * 100.0).round() / 100.0,
            negative_dec,
        }
    }

    /// Format RA as string (e.g., "00h 42m 44.3s")
    pub fn format_ra(&self) -> String {
        format!(
            "{:02}h {:02}m {:.1}s",
            self.ra_hours, self.ra_minutes, self.ra_seconds
        )
    }

    /// Format Dec as string (e.g., "+41° 16' 9.0\"")
    pub fn format_dec(&self) -> String {
        let sign = if self.negative_dec { "-" } else { "+" };
        format!(
            "{}{}° {:02}' {:.1}\"",
            sign, self.dec_degrees, self.dec_minutes, self.dec_seconds
        )
    }

    /// Parse RA from string (e.g., "00h 42m 44.3s" or "00:42:44.3")
    pub fn parse_ra(s: &str) -> Option<(i32, i32, f64)> {
        // Try format "00h 42m 44.3s"
        let re_hms = regex_lite::Regex::new(r"(\d+)[h:\s]+(\d+)[m:\s]+(\d+\.?\d*)").ok()?;
        if let Some(caps) = re_hms.captures(s) {
            let hours: i32 = caps.get(1)?.as_str().parse().ok()?;
            let minutes: i32 = caps.get(2)?.as_str().parse().ok()?;
            let seconds: f64 = caps.get(3)?.as_str().parse().ok()?;
            return Some((hours, minutes, seconds));
        }
        None
    }

    /// Parse Dec from string (e.g., "+41° 16' 9.0\"", "41:16:09.0", or "+41d 16m 9.0s")
    pub fn parse_dec(s: &str) -> Option<(i32, i32, f64, bool)> {
        // Support formats: +41° 16' 9.0", 41:16:09.0, +41d 16m 9.0s
        let re_dms = regex_lite::Regex::new(r#"([+-]?)(\d+)[°d:\s]+(\d+)['m:\s]+(\d+\.?\d*)["s]?"#).ok()?;
        if let Some(caps) = re_dms.captures(s) {
            let negative = caps.get(1).map(|m| m.as_str()) == Some("-");
            let degrees: i32 = caps.get(2)?.as_str().parse().ok()?;
            let minutes: i32 = caps.get(3)?.as_str().parse().ok()?;
            let seconds: f64 = caps.get(4)?.as_str().parse().ok()?;
            return Some((degrees, minutes, seconds, negative));
        }
        None
    }

    /// Validate coordinates
    pub fn validate(&self) -> Vec<String> {
        let mut errors = Vec::new();

        if self.ra_hours < 0 || self.ra_hours >= 24 {
            errors.push("RA hours must be between 0 and 23".to_string());
        }
        if self.ra_minutes < 0 || self.ra_minutes >= 60 {
            errors.push("RA minutes must be between 0 and 59".to_string());
        }
        if self.ra_seconds < 0.0 || self.ra_seconds >= 60.0 {
            errors.push("RA seconds must be between 0 and 59.99".to_string());
        }
        if self.dec_degrees < 0 || self.dec_degrees > 90 {
            errors.push("Dec degrees must be between 0 and 90".to_string());
        }
        if self.dec_minutes < 0 || self.dec_minutes >= 60 {
            errors.push("Dec minutes must be between 0 and 59".to_string());
        }
        if self.dec_seconds < 0.0 || self.dec_seconds >= 60.0 {
            errors.push("Dec seconds must be between 0 and 59.99".to_string());
        }

        errors
    }
}

/// NINA format coordinates for serialization
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct NinaInputCoordinates {
    #[serde(rename = "$id")]
    pub id: String,
    #[serde(rename = "$type")]
    pub type_name: String,
    #[serde(rename = "RAHours")]
    pub ra_hours: i32,
    #[serde(rename = "RAMinutes")]
    pub ra_minutes: i32,
    #[serde(rename = "RASeconds")]
    pub ra_seconds: f64,
    pub dec_degrees: i32,
    pub dec_minutes: i32,
    pub dec_seconds: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub negative_dec: Option<bool>,
}

impl From<&Coordinates> for NinaInputCoordinates {
    fn from(coords: &Coordinates) -> Self {
        Self {
            id: String::new(),
            type_name: "NINA.Astrometry.InputCoordinates, NINA.Astrometry".to_string(),
            ra_hours: coords.ra_hours,
            ra_minutes: coords.ra_minutes,
            ra_seconds: coords.ra_seconds,
            dec_degrees: coords.dec_degrees,
            dec_minutes: coords.dec_minutes,
            dec_seconds: coords.dec_seconds,
            negative_dec: Some(coords.negative_dec),
        }
    }
}

impl From<&NinaInputCoordinates> for Coordinates {
    fn from(nina: &NinaInputCoordinates) -> Self {
        Self {
            ra_hours: nina.ra_hours,
            ra_minutes: nina.ra_minutes,
            ra_seconds: nina.ra_seconds,
            dec_degrees: nina.dec_degrees,
            dec_minutes: nina.dec_minutes,
            dec_seconds: nina.dec_seconds,
            negative_dec: nina.negative_dec.unwrap_or(false),
        }
    }
}

/// Angular separation calculation between two coordinates
pub fn angular_separation(coord1: &Coordinates, coord2: &Coordinates) -> f64 {
    let ra1 = coord1.ra_to_degrees().to_radians();
    let dec1 = coord1.dec_to_decimal().to_radians();
    let ra2 = coord2.ra_to_degrees().to_radians();
    let dec2 = coord2.dec_to_decimal().to_radians();

    let delta_ra = ra2 - ra1;
    let cos_sep = dec1.sin() * dec2.sin() + dec1.cos() * dec2.cos() * delta_ra.cos();

    cos_sep.acos().to_degrees()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ra_to_decimal() {
        let coords = Coordinates::new(12, 30, 0.0, 45, 0, 0.0, false);
        assert!((coords.ra_to_decimal() - 12.5).abs() < 0.001);
    }

    #[test]
    fn test_dec_to_decimal() {
        let coords = Coordinates::new(0, 0, 0.0, 45, 30, 0.0, false);
        assert!((coords.dec_to_decimal() - 45.5).abs() < 0.001);

        let coords_neg = Coordinates::new(0, 0, 0.0, 45, 30, 0.0, true);
        assert!((coords_neg.dec_to_decimal() + 45.5).abs() < 0.001);
    }

    #[test]
    fn test_from_decimal() {
        let coords = Coordinates::from_decimal(12.5, -45.5);
        assert_eq!(coords.ra_hours, 12);
        assert_eq!(coords.ra_minutes, 30);
        assert!(coords.negative_dec);
        assert_eq!(coords.dec_degrees, 45);
        assert_eq!(coords.dec_minutes, 30);
    }
}
