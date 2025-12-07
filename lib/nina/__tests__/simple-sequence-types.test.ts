/**
 * Unit tests for simple-sequence-types.ts
 * Tests enums, interfaces, and helper functions
 */

import {
  SequenceMode,
  ImageType,
  SequenceEntityStatus,
  DEFAULT_BINNING_OPTIONS,
  DEFAULT_FILTERS,
  createDefaultCoordinates,
  formatRA,
  formatDec,
  parseHMS,
  parseDMS,
  createDefaultExposure,
  createDefaultTarget,
  createDefaultStartOptions,
  createDefaultEndOptions,
  createDefaultSimpleSequence,
  calculateExposureRuntime,
  calculateTargetRuntime,
  formatDuration,
  formatTime,
} from "../simple-sequence-types";

describe("simple-sequence-types", () => {
  describe("Enums", () => {
    it("should have SequenceMode values", () => {
      expect(SequenceMode.STANDARD).toBe("STANDARD");
      expect(SequenceMode.ROTATE).toBe("ROTATE");
    });

    it("should have ImageType values", () => {
      expect(ImageType.LIGHT).toBe("LIGHT");
      expect(ImageType.DARK).toBe("DARK");
      expect(ImageType.BIAS).toBe("BIAS");
      expect(ImageType.FLAT).toBe("FLAT");
      expect(ImageType.SNAPSHOT).toBe("SNAPSHOT");
    });

    it("should have SequenceEntityStatus values", () => {
      expect(SequenceEntityStatus.CREATED).toBe("CREATED");
      expect(SequenceEntityStatus.RUNNING).toBe("RUNNING");
      expect(SequenceEntityStatus.FINISHED).toBe("FINISHED");
      expect(SequenceEntityStatus.FAILED).toBe("FAILED");
      expect(SequenceEntityStatus.SKIPPED).toBe("SKIPPED");
      expect(SequenceEntityStatus.DISABLED).toBe("DISABLED");
    });
  });

  describe("Default Constants", () => {
    it("should have default binning options", () => {
      expect(DEFAULT_BINNING_OPTIONS).toHaveLength(4);
      expect(DEFAULT_BINNING_OPTIONS[0]).toEqual({ x: 1, y: 1 });
      expect(DEFAULT_BINNING_OPTIONS[1]).toEqual({ x: 2, y: 2 });
    });

    it("should have default filters", () => {
      expect(DEFAULT_FILTERS.length).toBeGreaterThan(0);
      expect(DEFAULT_FILTERS[0]).toHaveProperty("name");
      expect(DEFAULT_FILTERS[0]).toHaveProperty("position");
    });
  });

  describe("Coordinates Functions", () => {
    it("should create default coordinates", () => {
      const coords = createDefaultCoordinates();
      expect(coords.raHours).toBe(0);
      expect(coords.raMinutes).toBe(0);
      expect(coords.raSeconds).toBe(0);
      expect(coords.decDegrees).toBe(0);
      expect(coords.decMinutes).toBe(0);
      expect(coords.decSeconds).toBe(0);
      expect(coords.negativeDec).toBe(false);
    });

    it("should format RA correctly", () => {
      const coords = createDefaultCoordinates();
      coords.raHours = 12;
      coords.raMinutes = 30;
      coords.raSeconds = 45.5;
      const formatted = formatRA(coords);
      expect(formatted).toContain("12h");
      expect(formatted).toContain("30m");
      expect(formatted).toContain("45.5s");
    });

    it("should format Dec correctly with positive value", () => {
      const coords = createDefaultCoordinates();
      coords.decDegrees = 45;
      coords.decMinutes = 15;
      coords.decSeconds = 30.0;
      coords.negativeDec = false;
      const formatted = formatDec(coords);
      expect(formatted).toContain("+");
      expect(formatted).toContain("45");
    });

    it("should format Dec correctly with negative value", () => {
      const coords = createDefaultCoordinates();
      coords.decDegrees = 45;
      coords.decMinutes = 15;
      coords.decSeconds = 30.0;
      coords.negativeDec = true;
      const formatted = formatDec(coords);
      expect(formatted).toContain("-");
    });
  });

  describe("parseHMS", () => {
    it("should parse HMS format with h m s", () => {
      const result = parseHMS("12h 30m 45.5s");
      expect(result).not.toBeNull();
      expect(result?.hours).toBe(12);
      expect(result?.minutes).toBe(30);
      expect(result?.seconds).toBeCloseTo(45.5);
    });

    it("should parse HMS format with colons", () => {
      const result = parseHMS("12:30:45.5");
      expect(result).not.toBeNull();
      expect(result?.hours).toBe(12);
      expect(result?.minutes).toBe(30);
    });

    it("should return null for invalid format", () => {
      const result = parseHMS("invalid");
      expect(result).toBeNull();
    });
  });

  describe("parseDMS", () => {
    it("should parse DMS format with positive sign", () => {
      const result = parseDMS("+45° 30' 15.5\"");
      expect(result).not.toBeNull();
      expect(result?.negative).toBe(false);
      expect(result?.degrees).toBe(45);
      expect(result?.minutes).toBe(30);
    });

    it("should parse DMS format with negative sign", () => {
      const result = parseDMS("-45° 30' 15.5\"");
      expect(result).not.toBeNull();
      expect(result?.negative).toBe(true);
      expect(result?.degrees).toBe(45);
    });

    it("should return null for invalid format", () => {
      const result = parseDMS("invalid");
      expect(result).toBeNull();
    });
  });

  describe("createDefaultExposure", () => {
    it("should create exposure with default values", () => {
      const exposure = createDefaultExposure();
      expect(exposure.id).toBeDefined();
      expect(exposure.enabled).toBe(true);
      expect(exposure.status).toBe(SequenceEntityStatus.CREATED);
      expect(exposure.exposureTime).toBe(60);
      expect(exposure.imageType).toBe(ImageType.LIGHT);
      expect(exposure.totalCount).toBe(10);
      expect(exposure.progressCount).toBe(0);
    });

    it("should create unique IDs", () => {
      const exp1 = createDefaultExposure();
      const exp2 = createDefaultExposure();
      expect(exp1.id).not.toBe(exp2.id);
    });
  });

  describe("createDefaultTarget", () => {
    it("should create target with default values", () => {
      const target = createDefaultTarget();
      expect(target.id).toBeDefined();
      expect(target.name).toBe("Target");
      expect(target.status).toBe(SequenceEntityStatus.CREATED);
      expect(target.coordinates).toBeDefined();
      expect(target.mode).toBe(SequenceMode.STANDARD);
      expect(target.slewToTarget).toBe(true);
      expect(target.centerTarget).toBe(true);
    });

    it("should include default exposure", () => {
      const target = createDefaultTarget();
      expect(target.exposures).toHaveLength(1);
      expect(target.exposures[0].imageType).toBe(ImageType.LIGHT);
    });
  });

  describe("createDefaultStartOptions", () => {
    it("should create start options with default values", () => {
      const options = createDefaultStartOptions();
      expect(options.coolCameraAtSequenceStart).toBe(true);
      expect(options.coolCameraTemperature).toBe(-10);
      expect(options.coolCameraDuration).toBe(600);
      expect(options.unparkMountAtSequenceStart).toBe(true);
      expect(options.doMeridianFlip).toBe(true);
    });
  });

  describe("createDefaultEndOptions", () => {
    it("should create end options with default values", () => {
      const options = createDefaultEndOptions();
      expect(options.warmCamAtSequenceEnd).toBe(true);
      expect(options.warmCameraDuration).toBe(600);
      expect(options.parkMountAtSequenceEnd).toBe(true);
    });
  });

  describe("createDefaultSimpleSequence", () => {
    it("should create sequence with default values", () => {
      const sequence = createDefaultSimpleSequence();
      expect(sequence.id).toBeDefined();
      expect(sequence.title).toBe("Target Set");
      expect(sequence.isDirty).toBe(false);
      expect(sequence.isRunning).toBe(false);
      expect(sequence.targets).toHaveLength(1);
      expect(sequence.startOptions).toBeDefined();
      expect(sequence.endOptions).toBeDefined();
    });

    it("should select first target by default", () => {
      const sequence = createDefaultSimpleSequence();
      expect(sequence.selectedTargetId).toBe(sequence.targets[0].id);
      expect(sequence.activeTargetId).toBe(sequence.targets[0].id);
    });
  });

  describe("calculateExposureRuntime", () => {
    it("should calculate runtime for enabled exposure", () => {
      const exposure = createDefaultExposure();
      exposure.exposureTime = 60;
      exposure.totalCount = 10;
      exposure.progressCount = 0;
      const runtime = calculateExposureRuntime(exposure, 5);
      expect(runtime).toBe(10 * (60 + 5)); // 10 exposures * (60s + 5s download)
    });

    it("should return 0 for disabled exposure", () => {
      const exposure = createDefaultExposure();
      exposure.enabled = false;
      const runtime = calculateExposureRuntime(exposure, 5);
      expect(runtime).toBe(0);
    });

    it("should account for progress", () => {
      const exposure = createDefaultExposure();
      exposure.exposureTime = 60;
      exposure.totalCount = 10;
      exposure.progressCount = 5;
      const runtime = calculateExposureRuntime(exposure, 5);
      expect(runtime).toBe(5 * (60 + 5)); // 5 remaining * (60s + 5s)
    });
  });

  describe("calculateTargetRuntime", () => {
    it("should calculate total runtime for target", () => {
      const target = createDefaultTarget();
      target.delay = 10;
      target.exposures = [createDefaultExposure()];
      target.exposures[0].exposureTime = 60;
      target.exposures[0].totalCount = 5;
      target.exposures[0].progressCount = 0;
      const runtime = calculateTargetRuntime(target, 5);
      expect(runtime).toBe(10 + 5 * (60 + 5)); // delay + exposures
    });
  });

  describe("formatDuration", () => {
    it("should format seconds only", () => {
      expect(formatDuration(45)).toBe("45s");
    });

    it("should format minutes and seconds", () => {
      expect(formatDuration(125)).toBe("2m 5s");
    });

    it("should format hours, minutes, and seconds", () => {
      expect(formatDuration(3725)).toBe("1h 2m 5s");
    });

    it("should format days", () => {
      expect(formatDuration(90061)).toContain("1d");
    });

    it("should handle negative values", () => {
      expect(formatDuration(-10)).toBe("0s");
    });
  });

  describe("formatTime", () => {
    it("should format time correctly", () => {
      const date = new Date("2024-01-15T14:30:45");
      const formatted = formatTime(date);
      expect(formatted).toContain("14");
      expect(formatted).toContain("30");
      expect(formatted).toContain("45");
    });
  });
});
