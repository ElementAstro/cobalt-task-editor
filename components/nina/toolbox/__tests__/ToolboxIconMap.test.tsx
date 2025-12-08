/**
 * Unit tests for ToolboxIconMap
 */

import { iconMap, getIcon } from "../ToolboxIconMap";
import { Box } from "lucide-react";

describe("ToolboxIconMap", () => {
  describe("iconMap", () => {
    it("should contain camera icon", () => {
      expect(iconMap["camera"]).toBeDefined();
    });

    it("should contain focus icon", () => {
      expect(iconMap["focus"]).toBeDefined();
    });

    it("should contain thermometer icon", () => {
      expect(iconMap["thermometer"]).toBeDefined();
    });

    it("should contain disc icon", () => {
      expect(iconMap["disc"]).toBeDefined();
    });

    it("should contain crosshair icon", () => {
      expect(iconMap["crosshair"]).toBeDefined();
    });

    it("should contain clock icon", () => {
      expect(iconMap["clock"]).toBeDefined();
    });

    it("should contain repeat icon for conditions", () => {
      expect(iconMap["repeat"]).toBeDefined();
    });

    it("should contain zap icon for triggers", () => {
      expect(iconMap["zap"]).toBeDefined();
    });
  });

  describe("getIcon", () => {
    it("should return Box for undefined icon name", () => {
      const icon = getIcon(undefined);
      expect(icon).toBe(Box);
    });

    it("should return Box for unknown icon name", () => {
      const icon = getIcon("unknown-icon");
      expect(icon).toBe(Box);
    });

    it("should return correct icon for known name", () => {
      const icon = getIcon("camera");
      expect(icon).toBe(iconMap["camera"]);
    });

    it("should return correct icon for thermometer", () => {
      const icon = getIcon("thermometer");
      expect(icon).toBe(iconMap["thermometer"]);
    });

    it("should return correct icon for focus", () => {
      const icon = getIcon("focus");
      expect(icon).toBe(iconMap["focus"]);
    });
  });

  describe("Icon Categories", () => {
    it("should have container icons", () => {
      expect(iconMap["list-ordered"]).toBeDefined();
      expect(iconMap["git-branch"]).toBeDefined();
      expect(iconMap["star"]).toBeDefined();
    });

    it("should have camera icons", () => {
      expect(iconMap["thermometer-snowflake"]).toBeDefined();
      expect(iconMap["thermometer-sun"]).toBeDefined();
      expect(iconMap["camera"]).toBeDefined();
    });

    it("should have telescope icons", () => {
      expect(iconMap["compass"]).toBeDefined();
      expect(iconMap["square-parking"]).toBeDefined();
      expect(iconMap["home"]).toBeDefined();
      expect(iconMap["target"]).toBeDefined();
    });

    it("should have utility icons", () => {
      expect(iconMap["message-square"]).toBeDefined();
      expect(iconMap["terminal"]).toBeDefined();
      expect(iconMap["clock"]).toBeDefined();
      expect(iconMap["timer"]).toBeDefined();
    });
  });
});
