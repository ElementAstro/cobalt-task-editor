/**
 * Unit tests for lib/nina/utils.ts
 * Tests ID generation, item creation, coordinate utilities, tree operations, and validation
 */

import {
  generateId,
  generateNinaId,
  resetIdCounter,
  createSequenceItem,
  createCondition,
  createTrigger,
  createEmptyTarget,
  createTarget,
  raToDecimal,
  decToDecimal,
  decimalToRA,
  decimalToDec,
  formatRA,
  formatDec,
  formatDuration,
  parseDuration,
  formatTime,
  findItemById,
  findItemParent,
  removeItemById,
  updateItemById,
  insertItemAt,
  moveItem,
  deepClone,
  cloneSequenceItem,
  validateTarget,
  validateExposure,
  getShortTypeName,
  getTypeCategory,
} from "../utils";
import type { EditorSequenceItem, EditorTarget } from "../types";

describe("ID Generation", () => {
  beforeEach(() => {
    resetIdCounter();
  });

  describe("generateId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it("should generate string IDs", () => {
      const id = generateId();
      expect(typeof id).toBe("string");
    });

    it("should include timestamp component", () => {
      const id = generateId();
      const parts = id.split("-");
      expect(parts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("generateNinaId", () => {
    it("should generate sequential numeric string IDs", () => {
      resetIdCounter();
      const id1 = generateNinaId();
      const id2 = generateNinaId();
      expect(parseInt(id2)).toBe(parseInt(id1) + 1);
    });
  });

  describe("resetIdCounter", () => {
    it("should reset the counter", () => {
      generateNinaId();
      generateNinaId();
      resetIdCounter();
      const id = generateNinaId();
      expect(id).toBe("1");
    });
  });
});

describe("Item Creation", () => {
  describe("createSequenceItem", () => {
    it("should create a sequence item with default values", () => {
      const item = createSequenceItem(
        "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer",
      );

      expect(item.id).toBeTruthy();
      expect(item.type).toBe(
        "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer",
      );
      expect(item.status).toBe("CREATED");
    });

    it("should create a container item with items array", () => {
      const item = createSequenceItem(
        "NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer",
      );

      expect(item.items).toEqual([]);
      expect(item.conditions).toEqual([]);
      expect(item.triggers).toEqual([]);
      expect(item.isExpanded).toBe(true);
    });

    it("should apply overrides", () => {
      const item = createSequenceItem(
        "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer",
        {
          name: "Custom Name",
          status: "RUNNING",
        },
      );

      expect(item.name).toBe("Custom Name");
      expect(item.status).toBe("RUNNING");
    });
  });

  describe("createCondition", () => {
    it("should create a condition with default values", () => {
      const condition = createCondition(
        "NINA.Sequencer.Conditions.LoopCondition, NINA.Sequencer",
      );

      expect(condition.id).toBeTruthy();
      expect(condition.type).toBe(
        "NINA.Sequencer.Conditions.LoopCondition, NINA.Sequencer",
      );
    });

    it("should apply overrides", () => {
      const condition = createCondition(
        "NINA.Sequencer.Conditions.LoopCondition, NINA.Sequencer",
        {
          name: "Custom Loop",
          data: { Iterations: 5 },
        },
      );

      expect(condition.name).toBe("Custom Loop");
      expect(condition.data.Iterations).toBe(5);
    });
  });

  describe("createTrigger", () => {
    it("should create a trigger with default values", () => {
      const trigger = createTrigger(
        "NINA.Sequencer.Trigger.MeridianFlip.MeridianFlipTrigger, NINA.Sequencer",
      );

      expect(trigger.id).toBeTruthy();
      expect(trigger.type).toBe(
        "NINA.Sequencer.Trigger.MeridianFlip.MeridianFlipTrigger, NINA.Sequencer",
      );
      expect(trigger.triggerItems).toEqual([]);
    });

    it("should apply overrides", () => {
      const trigger = createTrigger(
        "NINA.Sequencer.Trigger.MeridianFlip.MeridianFlipTrigger, NINA.Sequencer",
        {
          name: "Custom Trigger",
        },
      );

      expect(trigger.name).toBe("Custom Trigger");
    });
  });
});

describe("Target Creation", () => {
  describe("createEmptyTarget", () => {
    it("should create an empty target", () => {
      const target = createEmptyTarget();

      expect(target.name).toBe("");
      expect(target.ra).toEqual({ hours: 0, minutes: 0, seconds: 0 });
      expect(target.dec).toEqual({
        degrees: 0,
        minutes: 0,
        seconds: 0,
        negative: false,
      });
      expect(target.rotation).toBe(0);
    });
  });

  describe("createTarget", () => {
    it("should create a target with specified values", () => {
      const target = createTarget(
        "M31",
        { hours: 0, minutes: 42, seconds: 44 },
        { degrees: 41, minutes: 16, seconds: 9 },
        45,
      );

      expect(target.name).toBe("M31");
      expect(target.ra).toEqual({ hours: 0, minutes: 42, seconds: 44 });
      expect(target.dec).toEqual({
        degrees: 41,
        minutes: 16,
        seconds: 9,
        negative: false,
      });
      expect(target.rotation).toBe(45);
    });

    it("should handle negative declination", () => {
      const target = createTarget(
        "NGC 253",
        { hours: 0, minutes: 47, seconds: 33 },
        { degrees: 25, minutes: 17, seconds: 18, negative: true },
      );

      expect(target.dec.negative).toBe(true);
    });
  });
});

describe("Coordinate Utilities", () => {
  describe("raToDecimal", () => {
    it("should convert RA to decimal hours", () => {
      expect(raToDecimal(0, 0, 0)).toBe(0);
      expect(raToDecimal(12, 0, 0)).toBe(12);
      expect(raToDecimal(6, 30, 0)).toBe(6.5);
      expect(raToDecimal(1, 0, 3600)).toBe(2);
    });
  });

  describe("decToDecimal", () => {
    it("should convert Dec to decimal degrees", () => {
      expect(decToDecimal(0, 0, 0, false)).toBe(0);
      expect(decToDecimal(45, 0, 0, false)).toBe(45);
      expect(decToDecimal(45, 30, 0, false)).toBe(45.5);
      expect(decToDecimal(45, 0, 0, true)).toBe(-45);
    });
  });

  describe("decimalToRA", () => {
    it("should convert decimal to RA components", () => {
      const ra = decimalToRA(6.5);
      expect(ra.hours).toBe(6);
      expect(ra.minutes).toBe(30);
      expect(ra.seconds).toBe(0);
    });

    it("should handle whole hours", () => {
      const ra = decimalToRA(12);
      expect(ra.hours).toBe(12);
      expect(ra.minutes).toBe(0);
      expect(ra.seconds).toBe(0);
    });
  });

  describe("decimalToDec", () => {
    it("should convert decimal to Dec components", () => {
      const dec = decimalToDec(45.5);
      expect(dec.degrees).toBe(45);
      expect(dec.minutes).toBe(30);
      expect(dec.seconds).toBe(0);
      expect(dec.negative).toBe(false);
    });

    it("should handle negative values", () => {
      const dec = decimalToDec(-45.5);
      expect(dec.degrees).toBe(45);
      expect(dec.minutes).toBe(30);
      expect(dec.negative).toBe(true);
    });
  });

  describe("formatRA", () => {
    it("should format RA correctly", () => {
      const formatted = formatRA({ hours: 6, minutes: 30, seconds: 15.5 });
      expect(formatted).toBe("06h 30m 15.5s");
    });

    it("should pad single digits", () => {
      const formatted = formatRA({ hours: 1, minutes: 2, seconds: 3.0 });
      expect(formatted).toBe("01h 02m 3.0s");
    });
  });

  describe("formatDec", () => {
    it("should format positive Dec correctly", () => {
      const formatted = formatDec({
        degrees: 45,
        minutes: 30,
        seconds: 15.5,
        negative: false,
      });
      expect(formatted).toBe("+45° 30' 15.5\"");
    });

    it("should format negative Dec correctly", () => {
      const formatted = formatDec({
        degrees: 45,
        minutes: 30,
        seconds: 15.5,
        negative: true,
      });
      expect(formatted).toBe("-45° 30' 15.5\"");
    });
  });
});

describe("Time Utilities", () => {
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
  });

  describe("parseDuration", () => {
    it("should parse seconds only", () => {
      expect(parseDuration("45s")).toBe(45);
    });

    it("should parse minutes and seconds", () => {
      expect(parseDuration("2m 5s")).toBe(125);
    });

    it("should parse hours, minutes, and seconds", () => {
      expect(parseDuration("1h 2m 5s")).toBe(3725);
    });

    it("should handle missing components", () => {
      expect(parseDuration("1h")).toBe(3600);
      expect(parseDuration("5m")).toBe(300);
    });
  });

  describe("formatTime", () => {
    it("should format time correctly", () => {
      expect(formatTime(1, 2, 3)).toBe("01:02:03");
    });

    it("should pad single digits", () => {
      expect(formatTime(12, 30, 45)).toBe("12:30:45");
    });
  });
});

describe("Tree Utilities", () => {
  const createTestTree = (): EditorSequenceItem[] => [
    {
      id: "item1",
      type: "test",
      name: "Item 1",
      category: "test",
      status: "CREATED",
      data: {},
      items: [
        {
          id: "item1-1",
          type: "test",
          name: "Item 1-1",
          category: "test",
          status: "CREATED",
          data: {},
        },
        {
          id: "item1-2",
          type: "test",
          name: "Item 1-2",
          category: "test",
          status: "CREATED",
          data: {},
        },
      ],
    },
    {
      id: "item2",
      type: "test",
      name: "Item 2",
      category: "test",
      status: "CREATED",
      data: {},
    },
  ];

  describe("findItemById", () => {
    it("should find item at root level", () => {
      const tree = createTestTree();
      const item = findItemById(tree, "item2");
      expect(item?.name).toBe("Item 2");
    });

    it("should find nested item", () => {
      const tree = createTestTree();
      const item = findItemById(tree, "item1-1");
      expect(item?.name).toBe("Item 1-1");
    });

    it("should return null for non-existent item", () => {
      const tree = createTestTree();
      const item = findItemById(tree, "non-existent");
      expect(item).toBeNull();
    });
  });

  describe("findItemParent", () => {
    it("should return null for root level item", () => {
      const tree = createTestTree();
      const parent = findItemParent(tree, "item1");
      expect(parent).toBeNull();
    });

    it("should find parent of nested item", () => {
      const tree = createTestTree();
      const parent = findItemParent(tree, "item1-1");
      expect(parent?.id).toBe("item1");
    });

    it("should return null for non-existent item", () => {
      const tree = createTestTree();
      const parent = findItemParent(tree, "non-existent");
      expect(parent).toBeNull();
    });
  });

  describe("removeItemById", () => {
    it("should remove item at root level", () => {
      const tree = createTestTree();
      const result = removeItemById(tree, "item2");
      expect(result.length).toBe(1);
      expect(findItemById(result, "item2")).toBeNull();
    });

    it("should remove nested item", () => {
      const tree = createTestTree();
      const result = removeItemById(tree, "item1-1");
      expect(result[0].items?.length).toBe(1);
      expect(findItemById(result, "item1-1")).toBeNull();
    });
  });

  describe("updateItemById", () => {
    it("should update item at root level", () => {
      const tree = createTestTree();
      const result = updateItemById(tree, "item2", { name: "Updated Item 2" });
      expect(findItemById(result, "item2")?.name).toBe("Updated Item 2");
    });

    it("should update nested item", () => {
      const tree = createTestTree();
      const result = updateItemById(tree, "item1-1", {
        name: "Updated Item 1-1",
      });
      expect(findItemById(result, "item1-1")?.name).toBe("Updated Item 1-1");
    });
  });

  describe("insertItemAt", () => {
    it("should insert item at root level", () => {
      const tree = createTestTree();
      const newItem: EditorSequenceItem = {
        id: "new-item",
        type: "test",
        name: "New Item",
        category: "test",
        status: "CREATED",
        data: {},
      };
      const result = insertItemAt(tree, null, 1, newItem);
      expect(result.length).toBe(3);
      expect(result[1].id).toBe("new-item");
    });

    it("should insert item into container", () => {
      const tree = createTestTree();
      const newItem: EditorSequenceItem = {
        id: "new-item",
        type: "test",
        name: "New Item",
        category: "test",
        status: "CREATED",
        data: {},
      };
      const result = insertItemAt(tree, "item1", 1, newItem);
      expect(result[0].items?.length).toBe(3);
      expect(result[0].items?.[1].id).toBe("new-item");
    });
  });

  describe("moveItem", () => {
    it("should move item within root level", () => {
      const tree = createTestTree();
      const result = moveItem(tree, "item2", null, 0);
      expect(result[0].id).toBe("item2");
    });

    it("should move item into container", () => {
      const tree = createTestTree();
      const result = moveItem(tree, "item2", "item1", 0);
      expect(result.length).toBe(1);
      expect(result[0].items?.length).toBe(3);
      expect(result[0].items?.[0].id).toBe("item2");
    });
  });
});

describe("Deep Clone", () => {
  describe("deepClone", () => {
    it("should create a deep copy of an object", () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
    });

    it("should clone arrays", () => {
      const original = [1, 2, { a: 3 }];
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });
  });

  describe("cloneSequenceItem", () => {
    it("should clone item with new IDs", () => {
      const original: EditorSequenceItem = {
        id: "original-id",
        type: "test",
        name: "Test Item",
        category: "test",
        status: "CREATED",
        data: {},
        items: [
          {
            id: "child-id",
            type: "test",
            name: "Child Item",
            category: "test",
            status: "CREATED",
            data: {},
          },
        ],
      };

      const cloned = cloneSequenceItem(original);

      expect(cloned.name).toBe(original.name);
      expect(cloned.id).not.toBe(original.id);
      expect(cloned.items?.[0].id).not.toBe(original.items?.[0].id);
    });
  });
});

describe("Validation", () => {
  describe("validateTarget", () => {
    it("should return no errors for valid target", () => {
      const target: EditorTarget = {
        name: "M31",
        ra: { hours: 0, minutes: 42, seconds: 44 },
        dec: { degrees: 41, minutes: 16, seconds: 9, negative: false },
        rotation: 0,
      };

      const errors = validateTarget(target);
      expect(errors.length).toBe(0);
    });

    it("should return error for empty name", () => {
      const target: EditorTarget = {
        name: "",
        ra: { hours: 0, minutes: 0, seconds: 0 },
        dec: { degrees: 0, minutes: 0, seconds: 0, negative: false },
        rotation: 0,
      };

      const errors = validateTarget(target);
      expect(errors).toContain("Target name is required");
    });

    it("should return error for invalid RA hours", () => {
      const target: EditorTarget = {
        name: "Test",
        ra: { hours: 25, minutes: 0, seconds: 0 },
        dec: { degrees: 0, minutes: 0, seconds: 0, negative: false },
        rotation: 0,
      };

      const errors = validateTarget(target);
      expect(errors).toContain("RA hours must be between 0 and 23");
    });

    it("should return error for invalid Dec degrees", () => {
      const target: EditorTarget = {
        name: "Test",
        ra: { hours: 0, minutes: 0, seconds: 0 },
        dec: { degrees: 100, minutes: 0, seconds: 0, negative: false },
        rotation: 0,
      };

      const errors = validateTarget(target);
      expect(errors).toContain("Dec degrees must be between -90 and 90");
    });
  });

  describe("validateExposure", () => {
    it("should return no errors for valid exposure", () => {
      const data = { ExposureTime: 300, Gain: 100 };
      const errors = validateExposure(data);
      expect(errors.length).toBe(0);
    });

    it("should return error for zero exposure time", () => {
      const data = { ExposureTime: 0 };
      const errors = validateExposure(data);
      expect(errors).toContain("Exposure time must be positive");
    });

    it("should return error for negative gain", () => {
      const data = { Gain: -2 };
      const errors = validateExposure(data);
      expect(errors).toContain("Gain must be -1 (default) or a positive value");
    });

    it("should allow -1 gain (default)", () => {
      const data = { Gain: -1 };
      const errors = validateExposure(data);
      expect(errors.length).toBe(0);
    });
  });
});

describe("Type Name Utilities", () => {
  describe("getShortTypeName", () => {
    it("should extract short type name", () => {
      expect(
        getShortTypeName(
          "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer",
        ),
      ).toBe("CoolCamera");
    });

    it("should handle container types", () => {
      expect(
        getShortTypeName(
          "NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer",
        ),
      ).toBe("SequentialContainer");
    });

    it("should return original if no match", () => {
      expect(getShortTypeName("InvalidType")).toBe("InvalidType");
    });
  });

  describe("getTypeCategory", () => {
    it("should extract category from type", () => {
      // The function extracts the second-to-last part before the comma
      expect(
        getTypeCategory(
          "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer",
        ),
      ).toBe("CoolCamera");
    });

    it("should handle container types", () => {
      expect(
        getTypeCategory(
          "NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer",
        ),
      ).toBe("SequentialContainer");
    });

    it("should return Unknown for invalid types", () => {
      expect(getTypeCategory("Invalid")).toBe("Unknown");
    });
  });
});
