/**
 * Unit tests for StartEndOptions component
 * Tests start/end sequence options store functions
 */

import { useSimpleSequenceStore } from "@/lib/nina/simple-sequence-store";

describe("Start/End Options Store", () => {
  describe("Start Options", () => {
    it("should have default start options", () => {
      const store = useSimpleSequenceStore.getState();

      expect(store.sequence.startOptions).toBeDefined();
      expect(typeof store.sequence.startOptions.coolCameraAtSequenceStart).toBe(
        "boolean",
      );
      expect(typeof store.sequence.startOptions.coolCameraTemperature).toBe(
        "number",
      );
    });

    it("should have updateStartOptions function", () => {
      const store = useSimpleSequenceStore.getState();
      expect(typeof store.updateStartOptions).toBe("function");
    });
  });

  describe("End Options", () => {
    it("should have default end options", () => {
      const store = useSimpleSequenceStore.getState();

      expect(store.sequence.endOptions).toBeDefined();
      expect(typeof store.sequence.endOptions.warmCamAtSequenceEnd).toBe(
        "boolean",
      );
      expect(typeof store.sequence.endOptions.parkMountAtSequenceEnd).toBe(
        "boolean",
      );
    });

    it("should have updateEndOptions function", () => {
      const store = useSimpleSequenceStore.getState();
      expect(typeof store.updateEndOptions).toBe("function");
    });
  });

  describe("Options Structure", () => {
    it("should have coolCameraDuration in start options", () => {
      const store = useSimpleSequenceStore.getState();
      expect(typeof store.sequence.startOptions.coolCameraDuration).toBe(
        "number",
      );
    });

    it("should have warmCameraDuration in end options", () => {
      const store = useSimpleSequenceStore.getState();
      expect(typeof store.sequence.endOptions.warmCameraDuration).toBe(
        "number",
      );
    });
  });
});
