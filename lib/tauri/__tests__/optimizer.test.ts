/**
 * Tests for optimizer module
 */

import {
  optimizeTargetOrder,
  detectScheduleConflicts,
  calculateParallelEtas,
  getTargetScheduleInfo,
  applyOptimization,
  mergeMultipleSequences,
  splitSequenceByTarget,
  getOptimizationStrategies,
  batchCalculateVisibility,
  validateSequenceForDate,
  findBestObservationDate,
  estimateSessionTime,
} from "../optimizer";
import { createLocation } from "../astronomy";
import type {
  SimpleSequence,
  SimpleTarget,
} from "../../nina/simple-sequence-types";
import {
  SequenceEntityStatus,
  SequenceMode,
  ImageType,
  createDefaultStartOptions,
  createDefaultEndOptions,
} from "../../nina/simple-sequence-types";

// Mock isTauri to always return false for browser fallback testing
jest.mock("../platform", () => ({
  isTauri: () => false,
  invoke: jest.fn(),
}));

describe("Optimizer Module", () => {
  const createTestTarget = (
    name: string,
    raHours: number = 0,
  ): SimpleTarget => ({
    id: `target-${name}`,
    name,
    status: SequenceEntityStatus.CREATED,
    targetName: name,
    coordinates: {
      raHours,
      raMinutes: 42,
      raSeconds: 44.3,
      decDegrees: 41,
      decMinutes: 16,
      decSeconds: 9.0,
      negativeDec: false,
    },
    positionAngle: 0,
    rotation: 0,
    delay: 0,
    mode: SequenceMode.STANDARD,
    slewToTarget: true,
    centerTarget: true,
    rotateTarget: false,
    startGuiding: true,
    autoFocusOnStart: true,
    autoFocusOnFilterChange: false,
    autoFocusAfterSetTime: false,
    autoFocusSetTime: 30,
    autoFocusAfterSetExposures: false,
    autoFocusSetExposures: 10,
    autoFocusAfterTemperatureChange: false,
    autoFocusAfterTemperatureChangeAmount: 1,
    autoFocusAfterHFRChange: false,
    autoFocusAfterHFRChangeAmount: 15,
    exposures: [
      {
        id: "exp-1",
        enabled: true,
        status: SequenceEntityStatus.CREATED,
        exposureTime: 60,
        imageType: ImageType.LIGHT,
        filter: null,
        binning: { x: 1, y: 1 },
        gain: -1,
        offset: -1,
        totalCount: 10,
        progressCount: 0,
        dither: false,
        ditherEvery: 1,
      },
    ],
  });

  const createTestSequence = (): SimpleSequence => ({
    id: "seq-1",
    title: "Test Sequence",
    isDirty: false,
    targets: [
      createTestTarget("M31", 0),
      createTestTarget("M42", 5),
      createTestTarget("M45", 3),
    ],
    selectedTargetId: null,
    activeTargetId: null,
    isRunning: false,
    startOptions: createDefaultStartOptions(),
    endOptions: createDefaultEndOptions(),
    estimatedDownloadTime: 5,
  });

  const testLocation = createLocation(40.7128, -74.006, 10, -5);
  const testDate = "2024-10-15";

  describe("optimizeTargetOrder (browser fallback)", () => {
    it("should return optimization result", async () => {
      const sequence = createTestSequence();
      const result = await optimizeTargetOrder(
        sequence,
        testLocation,
        testDate,
      );

      expect(result.success).toBe(true);
      expect(result.originalOrder.length).toBe(3);
      expect(result.optimizedOrder.length).toBe(3);
    });

    it("should accept different strategies", async () => {
      const sequence = createTestSequence();

      const strategies = [
        "max_altitude",
        "transit_time",
        "visibility_start",
        "minimize_slew",
        "combined",
      ] as const;

      for (const strategy of strategies) {
        const result = await optimizeTargetOrder(
          sequence,
          testLocation,
          testDate,
          strategy,
        );
        expect(result.success).toBe(true);
      }
    });
  });

  describe("detectScheduleConflicts (browser fallback)", () => {
    it("should return conflict result", async () => {
      const sequence = createTestSequence();
      const result = await detectScheduleConflicts(
        sequence,
        testLocation,
        testDate,
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.conflicts)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe("calculateParallelEtas (browser fallback)", () => {
    it("should calculate ETAs for all targets", async () => {
      const sequence = createTestSequence();
      const results = await calculateParallelEtas(sequence);

      expect(results.length).toBe(3);
      expect(results[0].targetId).toBe("target-M31");
      expect(results[0].runtime).toBeGreaterThan(0);
    });

    it("should accept custom start time", async () => {
      const sequence = createTestSequence();
      const startTime = "2024-10-15T20:00:00Z";
      const results = await calculateParallelEtas(sequence, startTime);

      expect(results.length).toBe(3);
      expect(results[0].etaStart).toBeDefined();
    });
  });

  describe("getTargetScheduleInfo (browser fallback)", () => {
    it("should return schedule info for all targets", async () => {
      const sequence = createTestSequence();
      const info = await getTargetScheduleInfo(
        sequence,
        testLocation,
        testDate,
      );

      expect(info.length).toBe(3);
      expect(info[0].targetName).toBe("M31");
      expect(info[0].visibilityWindow).toBeDefined();
    });
  });

  describe("applyOptimization (browser fallback)", () => {
    it("should reorder targets", async () => {
      const sequence = createTestSequence();
      const newOrder = ["target-M45", "target-M31", "target-M42"];

      const result = await applyOptimization(sequence, newOrder);

      expect(result.targets[0].id).toBe("target-M45");
      expect(result.targets[1].id).toBe("target-M31");
      expect(result.targets[2].id).toBe("target-M42");
    });

    it("should handle partial order", async () => {
      const sequence = createTestSequence();
      const newOrder = ["target-M31"];

      const result = await applyOptimization(sequence, newOrder);

      expect(result.targets.length).toBe(1);
    });
  });

  describe("mergeMultipleSequences (browser fallback)", () => {
    it("should merge sequences", async () => {
      const seq1 = createTestSequence();
      const seq2 = createTestSequence();

      const merged = await mergeMultipleSequences([seq1, seq2], "Merged");

      expect(merged.title).toBe("Merged");
      expect(merged.targets.length).toBe(6);
    });

    it("should generate unique IDs", async () => {
      const seq1 = createTestSequence();
      const seq2 = createTestSequence();

      const merged = await mergeMultipleSequences([seq1, seq2]);

      const ids = merged.targets.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe("splitSequenceByTarget (browser fallback)", () => {
    it("should split into individual sequences", async () => {
      const sequence = createTestSequence();
      const split = await splitSequenceByTarget(sequence);

      expect(split.length).toBe(3);
      expect(split[0].targets.length).toBe(1);
      expect(split[0].title).toBe("M31");
    });
  });

  describe("getOptimizationStrategies (browser fallback)", () => {
    it("should return available strategies", async () => {
      const strategies = await getOptimizationStrategies();

      expect(strategies.length).toBeGreaterThan(0);
      expect(strategies.find((s) => s.id === "combined")).toBeDefined();
      expect(strategies.find((s) => s.id === "max_altitude")).toBeDefined();
    });
  });

  describe("batchCalculateVisibility (browser fallback)", () => {
    it("should calculate visibility for all targets", async () => {
      const sequence = createTestSequence();
      const results = await batchCalculateVisibility(
        sequence,
        testLocation,
        testDate,
      );

      expect(results.length).toBe(3);
      expect(results[0].visibility).toBeDefined();
    });
  });

  describe("validateSequenceForDate (browser fallback)", () => {
    it("should return validation report", async () => {
      const sequence = createTestSequence();
      const report = await validateSequenceForDate(
        sequence,
        testLocation,
        testDate,
      );

      expect(report.date).toBe(testDate);
      expect(report.totalTargets).toBe(3);
      expect(report.visibleTargets).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe("findBestObservationDate (browser fallback)", () => {
    it("should find best date in range", async () => {
      const sequence = createTestSequence();
      const result = await findBestObservationDate(
        sequence,
        testLocation,
        "2024-10-01",
        "2024-10-31",
      );

      expect(result.bestDate).toBeDefined();
      expect(result.bestScore).toBeGreaterThanOrEqual(0);
      expect(result.dateScores.length).toBeGreaterThan(0);
    });
  });

  describe("estimateSessionTime (browser fallback)", () => {
    it("should estimate session time", async () => {
      const sequence = createTestSequence();
      const estimate = await estimateSessionTime(
        sequence,
        testLocation,
        testDate,
      );

      expect(estimate.imagingTimeSeconds).toBeGreaterThan(0);
      expect(estimate.totalTimeSeconds).toBeGreaterThan(0);
      expect(typeof estimate.fitsInNight).toBe("boolean");
      expect(estimate.utilizationPercentage).toBeGreaterThanOrEqual(0);
    });

    it("should include slew time when requested", async () => {
      const sequence = createTestSequence();

      const withSlew = await estimateSessionTime(
        sequence,
        testLocation,
        testDate,
        true,
      );
      const withoutSlew = await estimateSessionTime(
        sequence,
        testLocation,
        testDate,
        false,
      );

      expect(withSlew.slewTimeSeconds).toBeGreaterThan(0);
      expect(withoutSlew.slewTimeSeconds).toBe(0);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty sequence", async () => {
      const sequence = { ...createTestSequence(), targets: [] };

      const result = await optimizeTargetOrder(
        sequence,
        testLocation,
        testDate,
      );
      expect(result.success).toBe(true);
      expect(result.optimizedOrder.length).toBe(0);
    });

    it("should handle single target", async () => {
      const sequence = {
        ...createTestSequence(),
        targets: [createTestTarget("M31")],
      };

      const result = await optimizeTargetOrder(
        sequence,
        testLocation,
        testDate,
      );
      expect(result.success).toBe(true);
      expect(result.optimizedOrder.length).toBe(1);
    });
  });
});
