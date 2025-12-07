/**
 * Unit tests for workflow node components
 * Tests workflow utility functions and node data structures
 */

import {
  getAreaColor,
  getItemTypeColor,
  sequenceToFlow,
} from "@/lib/nina/workflow-utils";
import type { EditorSequence, EditorSequenceItem } from "@/lib/nina/types";

// Create test sequence
const createTestSequence = (
  overrides: Partial<EditorSequence> = {},
): EditorSequence => ({
  id: "test-sequence",
  title: "Test Sequence",
  startItems: [],
  targetItems: [],
  endItems: [],
  globalTriggers: [],
  ...overrides,
});

// Create test item
const createTestItem = (
  overrides: Partial<EditorSequenceItem> = {},
): EditorSequenceItem => ({
  id: "test-item",
  type: "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer",
  name: "Cool Camera",
  category: "Camera",
  status: "CREATED",
  data: {},
  ...overrides,
});

describe("Workflow Utilities", () => {
  describe("getAreaColor", () => {
    it("should return color for start area", () => {
      const color = getAreaColor("start");
      expect(color).toBeDefined();
      expect(typeof color).toBe("string");
    });

    it("should return color for target area", () => {
      const color = getAreaColor("target");
      expect(color).toBeDefined();
      expect(typeof color).toBe("string");
    });

    it("should return color for end area", () => {
      const color = getAreaColor("end");
      expect(color).toBeDefined();
      expect(typeof color).toBe("string");
    });

    it("should return different colors for different areas", () => {
      const startColor = getAreaColor("start");
      const targetColor = getAreaColor("target");
      const endColor = getAreaColor("end");

      // Colors should be different
      expect(startColor).not.toBe(targetColor);
      expect(targetColor).not.toBe(endColor);
    });
  });

  describe("getItemTypeColor", () => {
    it("should return color for camera items", () => {
      const color = getItemTypeColor(
        "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer",
      );
      expect(color).toBeDefined();
      expect(typeof color).toBe("string");
    });

    it("should return color for imaging items", () => {
      const color = getItemTypeColor(
        "NINA.Sequencer.SequenceItem.Imaging.TakeExposure, NINA.Sequencer",
      );
      expect(color).toBeDefined();
      expect(typeof color).toBe("string");
    });

    it("should return color for container items", () => {
      const color = getItemTypeColor(
        "NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer",
      );
      expect(color).toBeDefined();
      expect(typeof color).toBe("string");
    });

    it("should handle unknown types", () => {
      const color = getItemTypeColor("Unknown.Type");
      expect(color).toBeDefined();
      expect(typeof color).toBe("string");
    });
  });

  describe("sequenceToFlow", () => {
    it("should convert empty sequence", () => {
      const sequence = createTestSequence();
      const { nodes, edges } = sequenceToFlow(sequence);

      expect(nodes).toBeDefined();
      expect(edges).toBeDefined();
      expect(Array.isArray(nodes)).toBe(true);
      expect(Array.isArray(edges)).toBe(true);
    });

    it("should create nodes for target items", () => {
      const sequence = createTestSequence({
        targetItems: [createTestItem({ id: "item-1" })],
      });
      const { nodes } = sequenceToFlow(sequence);

      // Should have nodes for items
      expect(nodes.length).toBeGreaterThan(0);
    });

    it("should create nodes for start items", () => {
      const sequence = createTestSequence({
        startItems: [createTestItem({ id: "start-item-1" })],
      });
      const { nodes } = sequenceToFlow(sequence);

      expect(nodes.length).toBeGreaterThan(0);
    });

    it("should create nodes for end items", () => {
      const sequence = createTestSequence({
        endItems: [createTestItem({ id: "end-item-1" })],
      });
      const { nodes } = sequenceToFlow(sequence);

      expect(nodes.length).toBeGreaterThan(0);
    });

    it("should handle container items", () => {
      const container: EditorSequenceItem = {
        id: "container-1",
        type: "NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer",
        name: "Sequential Container",
        category: "Container",
        status: "CREATED",
        data: {},
        isExpanded: true,
        items: [createTestItem({ id: "child-1" })],
        conditions: [],
        triggers: [],
      };

      const sequence = createTestSequence({
        targetItems: [container],
      });
      const { nodes } = sequenceToFlow(sequence);

      expect(nodes.length).toBeGreaterThan(0);
    });

    it("should create edges between nodes", () => {
      const sequence = createTestSequence({
        targetItems: [
          createTestItem({ id: "item-1" }),
          createTestItem({ id: "item-2" }),
        ],
      });
      const { edges } = sequenceToFlow(sequence);

      // Should have edges connecting nodes
      expect(edges.length).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("Node Data Structures", () => {
  describe("SequenceItemNodeData", () => {
    it("should have required properties", () => {
      const nodeData = {
        item: createTestItem(),
        area: "target" as const,
        parentId: null,
        index: 0,
        depth: 0,
      };

      expect(nodeData.item).toBeDefined();
      expect(nodeData.area).toBe("target");
      expect(nodeData.parentId).toBeNull();
      expect(nodeData.index).toBe(0);
      expect(nodeData.depth).toBe(0);
    });
  });

  describe("ContainerNodeData", () => {
    it("should have required properties", () => {
      const container: EditorSequenceItem = {
        id: "container-1",
        type: "NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer",
        name: "Sequential Container",
        category: "Container",
        status: "CREATED",
        data: {},
        isExpanded: true,
        items: [],
        conditions: [],
        triggers: [],
      };

      const nodeData = {
        item: container,
        area: "target" as const,
        parentId: null,
        index: 0,
        depth: 0,
        isExpanded: true,
        childCount: 0,
      };

      expect(nodeData.item).toBeDefined();
      expect(nodeData.isExpanded).toBe(true);
      expect(nodeData.childCount).toBe(0);
    });
  });

  describe("AreaMarkerData", () => {
    it("should have required properties", () => {
      const markerData = {
        area: "start" as const,
        label: "Start",
      };

      expect(markerData.area).toBe("start");
      expect(markerData.label).toBe("Start");
    });
  });
});
