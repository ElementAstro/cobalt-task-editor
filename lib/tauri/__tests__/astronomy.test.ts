/**
 * Tests for astronomy module
 */

import {
  getDefaultLocation,
  createLocation,
  getMoonPhase,
  calculateQualityScore,
  batchCalculatePositions,
  calculateAltitudeCurve,
} from "../astronomy";
import type { Coordinates } from "../../nina/simple-sequence-types";

// Mock isTauri to always return false for browser fallback testing
jest.mock("../platform", () => ({
  isTauri: () => false,
  invoke: jest.fn(),
}));

describe("Astronomy Module", () => {
  const testCoordinates: Coordinates = {
    raHours: 0,
    raMinutes: 42,
    raSeconds: 44.3,
    decDegrees: 41,
    decMinutes: 16,
    decSeconds: 9.0,
    negativeDec: false,
  };

  describe("getDefaultLocation", () => {
    it("should return default location with zero values", () => {
      const location = getDefaultLocation();

      expect(location.latitude).toBe(0);
      expect(location.longitude).toBe(0);
      expect(location.elevation).toBe(0);
      expect(location.timezoneOffset).toBe(0);
    });
  });

  describe("createLocation", () => {
    it("should create location with specified values", () => {
      const location = createLocation(40.7128, -74.006, 10, -5);

      expect(location.latitude).toBe(40.7128);
      expect(location.longitude).toBe(-74.006);
      expect(location.elevation).toBe(10);
      expect(location.timezoneOffset).toBe(-5);
    });

    it("should use default values for optional parameters", () => {
      const location = createLocation(40.7128, -74.006);

      expect(location.elevation).toBe(0);
      expect(location.timezoneOffset).toBe(0);
    });
  });

  describe("getMoonPhase (browser fallback)", () => {
    it("should return moon phase info", async () => {
      const info = await getMoonPhase();

      expect(info.phase).toBeGreaterThanOrEqual(0);
      expect(info.phase).toBeLessThanOrEqual(1);
      expect(info.illumination).toBeGreaterThanOrEqual(0);
      expect(info.illumination).toBeLessThanOrEqual(100);
      expect(info.phaseName).toBeTruthy();
      expect(info.ageDays).toBeGreaterThanOrEqual(0);
    });

    it("should accept datetime parameter", async () => {
      const info = await getMoonPhase("2024-01-01T00:00:00Z");

      expect(info.phase).toBeGreaterThanOrEqual(0);
      expect(info.phase).toBeLessThanOrEqual(1);
    });
  });

  describe("calculateQualityScore (browser fallback)", () => {
    it("should return quality score", async () => {
      const location = createLocation(40.7128, -74.006);
      const quality = await calculateQualityScore(testCoordinates, location);

      expect(quality.score).toBeGreaterThan(0);
      expect(quality.altitudeScore).toBeDefined();
      expect(quality.moonScore).toBeDefined();
      expect(quality.twilightScore).toBeDefined();
      expect(Array.isArray(quality.recommendations)).toBe(true);
    });
  });

  describe("batchCalculatePositions (browser fallback)", () => {
    it("should calculate positions for multiple targets", async () => {
      const location = createLocation(40.7128, -74.006);
      const targets = [
        { id: "m31", coordinates: testCoordinates },
        { id: "m42", coordinates: { ...testCoordinates, raHours: 5 } },
      ];

      const results = await batchCalculatePositions(targets, location);

      expect(results.length).toBe(2);
      expect(results[0].id).toBe("m31");
      expect(results[1].id).toBe("m42");
      expect(results[0].altitude).toBeDefined();
      expect(results[0].azimuth).toBeDefined();
    });
  });

  describe("calculateAltitudeCurve (browser fallback)", () => {
    it("should return altitude curve data", async () => {
      const location = createLocation(40.7128, -74.006);
      const curve = await calculateAltitudeCurve(
        testCoordinates,
        location,
        "2024-10-15",
        60, // 1 hour intervals
      );

      expect(curve.length).toBeGreaterThan(0);
      expect(curve[0].time).toBeDefined();
      expect(curve[0].altitude).toBeDefined();
      expect(curve[0].azimuth).toBeDefined();
    });
  });
});
