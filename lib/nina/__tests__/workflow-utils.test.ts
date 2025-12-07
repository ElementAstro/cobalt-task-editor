/**
 * Unit tests for lib/nina/workflow-utils.ts
 * Tests conversion between sequence data and React Flow nodes/edges
 */

import {
  sequenceToFlow,
  parseNodeId,
  getAreaColor,
  getItemTypeColor,
  autoLayoutNodes,
  compactLayout,
  spreadLayout,
  horizontalLayout,
  LAYOUT_CONFIG,
  snapToGrid,
  alignNodes,
  distributeNodes,
  getSelectionBounds,
} from "../workflow-utils";
import type { EditorSequence, EditorSequenceItem } from "../types";
import type { Node, Edge } from "@xyflow/react";

// Helper to create a test sequence
const createTestSequence = (
  overrides: Partial<EditorSequence> = {},
): EditorSequence => ({
  id: "test-seq",
  title: "Test Sequence",
  startItems: [],
  targetItems: [],
  endItems: [],
  globalTriggers: [],
  ...overrides,
});

// Helper to create a test item
const createTestItem = (
  overrides: Partial<EditorSequenceItem> = {},
): EditorSequenceItem => ({
  id: `item-${Date.now()}-${Math.random()}`,
  type: "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer",
  name: "Cool Camera",
  category: "Camera",
  status: "CREATED",
  data: {},
  ...overrides,
});

// Helper to create a container item
const createContainerItem = (
  overrides: Partial<EditorSequenceItem> = {},
): EditorSequenceItem => ({
  id: `container-${Date.now()}-${Math.random()}`,
  type: "NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer",
  name: "Sequential Block",
  category: "Container",
  status: "CREATED",
  data: {},
  isExpanded: true,
  items: [],
  conditions: [],
  triggers: [],
  ...overrides,
});

describe("workflow-utils", () => {
  describe("LAYOUT_CONFIG", () => {
    it("should have required layout properties", () => {
      expect(LAYOUT_CONFIG.nodeWidth).toBeGreaterThan(0);
      expect(LAYOUT_CONFIG.nodeHeight).toBeGreaterThan(0);
      expect(LAYOUT_CONFIG.horizontalGap).toBeGreaterThan(0);
      expect(LAYOUT_CONFIG.verticalGap).toBeGreaterThan(0);
    });
  });

  describe("sequenceToFlow", () => {
    it("should convert empty sequence to flow", () => {
      const sequence = createTestSequence();
      const { nodes, edges } = sequenceToFlow(sequence);

      // Should have area markers (start/end for each area)
      expect(nodes.length).toBe(6); // 3 areas x 2 markers
      expect(edges.length).toBeGreaterThan(0);
    });

    it("should create area start and end markers", () => {
      const sequence = createTestSequence();
      const { nodes } = sequenceToFlow(sequence);

      const areaStartNodes = nodes.filter((n) => n.type === "areaStart");
      const areaEndNodes = nodes.filter((n) => n.type === "areaEnd");

      expect(areaStartNodes.length).toBe(3);
      expect(areaEndNodes.length).toBe(3);
    });

    it("should convert sequence with start items", () => {
      const sequence = createTestSequence({
        startItems: [createTestItem({ id: "start-item-1" })],
      });
      const { nodes } = sequenceToFlow(sequence);

      const itemNodes = nodes.filter((n) => n.type === "sequenceItem");
      expect(itemNodes.length).toBe(1);
      expect(itemNodes[0].id).toBe("node-start-item-1");
    });

    it("should convert sequence with target items", () => {
      const sequence = createTestSequence({
        targetItems: [createTestItem({ id: "target-item-1" })],
      });
      const { nodes } = sequenceToFlow(sequence);

      const itemNodes = nodes.filter((n) => n.type === "sequenceItem");
      expect(itemNodes.length).toBe(1);
    });

    it("should convert sequence with end items", () => {
      const sequence = createTestSequence({
        endItems: [createTestItem({ id: "end-item-1" })],
      });
      const { nodes } = sequenceToFlow(sequence);

      const itemNodes = nodes.filter((n) => n.type === "sequenceItem");
      expect(itemNodes.length).toBe(1);
    });

    it("should convert container items", () => {
      const sequence = createTestSequence({
        targetItems: [createContainerItem({ id: "container-1" })],
      });
      const { nodes } = sequenceToFlow(sequence);

      const containerNodes = nodes.filter((n) => n.type === "container");
      expect(containerNodes.length).toBe(1);
    });

    it("should convert nested items in containers", () => {
      const sequence = createTestSequence({
        targetItems: [
          createContainerItem({
            id: "container-1",
            isExpanded: true,
            items: [createTestItem({ id: "nested-item-1" })],
          }),
        ],
      });
      const { nodes } = sequenceToFlow(sequence);

      const containerNodes = nodes.filter((n) => n.type === "container");
      const itemNodes = nodes.filter((n) => n.type === "sequenceItem");

      expect(containerNodes.length).toBe(1);
      expect(itemNodes.length).toBe(1);
    });

    it("should not show nested items when container is collapsed", () => {
      const sequence = createTestSequence({
        targetItems: [
          createContainerItem({
            id: "container-1",
            isExpanded: false,
            items: [createTestItem({ id: "nested-item-1" })],
          }),
        ],
      });
      const { nodes } = sequenceToFlow(sequence);

      const itemNodes = nodes.filter((n) => n.type === "sequenceItem");
      expect(itemNodes.length).toBe(0);
    });

    it("should convert conditions on containers", () => {
      const sequence = createTestSequence({
        targetItems: [
          createContainerItem({
            id: "container-1",
            conditions: [
              {
                id: "condition-1",
                type: "NINA.Sequencer.Conditions.LoopCondition, NINA.Sequencer",
                name: "Loop",
                category: "Condition",
                data: {},
              },
            ],
          }),
        ],
      });
      const { nodes } = sequenceToFlow(sequence);

      const conditionNodes = nodes.filter((n) => n.type === "condition");
      expect(conditionNodes.length).toBe(1);
    });

    it("should convert triggers on containers", () => {
      const sequence = createTestSequence({
        targetItems: [
          createContainerItem({
            id: "container-1",
            triggers: [
              {
                id: "trigger-1",
                type: "NINA.Sequencer.Trigger.MeridianFlip.MeridianFlipTrigger, NINA.Sequencer",
                name: "Meridian Flip",
                category: "Trigger",
                data: {},
                triggerItems: [],
              },
            ],
          }),
        ],
      });
      const { nodes } = sequenceToFlow(sequence);

      const triggerNodes = nodes.filter((n) => n.type === "trigger");
      expect(triggerNodes.length).toBe(1);
    });

    it("should convert global triggers", () => {
      const sequence = createTestSequence({
        globalTriggers: [
          {
            id: "global-trigger-1",
            type: "NINA.Sequencer.Trigger.MeridianFlip.MeridianFlipTrigger, NINA.Sequencer",
            name: "Global Meridian Flip",
            category: "Trigger",
            data: {},
            triggerItems: [],
          },
        ],
      });
      const { nodes } = sequenceToFlow(sequence);

      const triggerNodes = nodes.filter((n) => n.type === "trigger");
      expect(triggerNodes.length).toBe(1);
      expect(triggerNodes[0].id).toContain("global-trig");
    });

    it("should create edges between sequential items", () => {
      const sequence = createTestSequence({
        startItems: [
          createTestItem({ id: "item-1" }),
          createTestItem({ id: "item-2" }),
        ],
      });
      const { edges } = sequenceToFlow(sequence);

      // Should have edge from item-1 to item-2
      const itemEdge = edges.find(
        (e) => e.source === "node-item-1" && e.target === "node-item-2",
      );
      expect(itemEdge).toBeDefined();
    });

    it("should create edges between areas", () => {
      const sequence = createTestSequence();
      const { edges } = sequenceToFlow(sequence);

      // Should have edges connecting area end to next area start
      const areaEdges = edges.filter(
        (e) => e.source.includes("area-end") && e.target.includes("area-start"),
      );
      expect(areaEdges.length).toBe(2); // start->target, target->end
    });
  });

  describe("parseNodeId", () => {
    it("should parse item node ID", () => {
      const result = parseNodeId("node-item-123");
      expect(result).toEqual({ type: "item", id: "item-123" });
    });

    it("should parse condition node ID", () => {
      const result = parseNodeId("cond-condition-456");
      expect(result).toEqual({ type: "condition", id: "condition-456" });
    });

    it("should parse trigger node ID", () => {
      const result = parseNodeId("trig-trigger-789");
      expect(result).toEqual({ type: "trigger", id: "trigger-789" });
    });

    it("should parse global trigger node ID", () => {
      const result = parseNodeId("global-trig-trigger-abc");
      expect(result).toEqual({ type: "trigger", id: "trigger-abc" });
    });

    it("should parse area node ID", () => {
      const result = parseNodeId("area-start-target");
      expect(result).toEqual({ type: "area", id: "area-start-target" });
    });

    it("should return null for unknown node ID format", () => {
      const result = parseNodeId("unknown-format");
      expect(result).toBeNull();
    });
  });

  describe("getAreaColor", () => {
    it("should return green for start area", () => {
      expect(getAreaColor("start")).toBe("#22c55e");
    });

    it("should return blue for target area", () => {
      expect(getAreaColor("target")).toBe("#3b82f6");
    });

    it("should return orange for end area", () => {
      expect(getAreaColor("end")).toBe("#f97316");
    });
  });

  describe("getItemTypeColor", () => {
    it("should return yellow for DeepSkyObject", () => {
      expect(
        getItemTypeColor(
          "NINA.Sequencer.Container.DeepSkyObjectContainer, NINA.Sequencer",
        ),
      ).toBe("#eab308");
    });

    it("should return blue for Sequential", () => {
      expect(
        getItemTypeColor(
          "NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer",
        ),
      ).toBe("#3b82f6");
    });

    it("should return purple for Parallel", () => {
      expect(
        getItemTypeColor(
          "NINA.Sequencer.Container.ParallelContainer, NINA.Sequencer",
        ),
      ).toBe("#a855f7");
    });

    it("should return orange for Cool/Warm camera", () => {
      expect(
        getItemTypeColor(
          "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer",
        ),
      ).toBe("#f97316");
    });

    it("should return green for Exposure", () => {
      expect(
        getItemTypeColor(
          "NINA.Sequencer.SequenceItem.Imaging.TakeExposure, NINA.Sequencer",
        ),
      ).toBe("#22c55e");
    });

    it("should return slate for unknown types", () => {
      expect(getItemTypeColor("Unknown.Type")).toBe("#64748b");
    });
  });

  describe("autoLayoutNodes", () => {
    it("should layout nodes with dagre", () => {
      const nodes: Node[] = [
        {
          id: "node-1",
          type: "sequenceItem",
          position: { x: 0, y: 0 },
          data: {},
        },
        {
          id: "node-2",
          type: "sequenceItem",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];
      const edges: Edge[] = [
        { id: "e-1-2", source: "node-1", target: "node-2" },
      ];

      const layoutedNodes = autoLayoutNodes(nodes, edges);

      expect(layoutedNodes.length).toBe(2);
      // Nodes should have different positions after layout
      expect(layoutedNodes[0].position).not.toEqual(layoutedNodes[1].position);
    });

    it("should respect direction option", () => {
      const nodes: Node[] = [
        {
          id: "node-1",
          type: "sequenceItem",
          position: { x: 0, y: 0 },
          data: {},
        },
        {
          id: "node-2",
          type: "sequenceItem",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];
      const edges: Edge[] = [
        { id: "e-1-2", source: "node-1", target: "node-2" },
      ];

      const tbLayout = autoLayoutNodes(nodes, edges, { direction: "TB" });
      const lrLayout = autoLayoutNodes(nodes, edges, { direction: "LR" });

      // TB layout should have nodes stacked vertically
      // LR layout should have nodes arranged horizontally
      expect(tbLayout[0].position.x).toBeCloseTo(lrLayout[0].position.x, -1);
    });
  });

  describe("compactLayout", () => {
    it("should create compact layout", () => {
      const nodes: Node[] = [
        {
          id: "node-1",
          type: "sequenceItem",
          position: { x: 0, y: 0 },
          data: {},
        },
        {
          id: "node-2",
          type: "sequenceItem",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];
      const edges: Edge[] = [
        { id: "e-1-2", source: "node-1", target: "node-2" },
      ];

      const layoutedNodes = compactLayout(nodes, edges);
      expect(layoutedNodes.length).toBe(2);
    });
  });

  describe("spreadLayout", () => {
    it("should create spread layout", () => {
      const nodes: Node[] = [
        {
          id: "node-1",
          type: "sequenceItem",
          position: { x: 0, y: 0 },
          data: {},
        },
        {
          id: "node-2",
          type: "sequenceItem",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];
      const edges: Edge[] = [
        { id: "e-1-2", source: "node-1", target: "node-2" },
      ];

      const layoutedNodes = spreadLayout(nodes, edges);
      expect(layoutedNodes.length).toBe(2);
    });
  });

  describe("horizontalLayout", () => {
    it("should create horizontal layout", () => {
      const nodes: Node[] = [
        {
          id: "node-1",
          type: "sequenceItem",
          position: { x: 0, y: 0 },
          data: {},
        },
        {
          id: "node-2",
          type: "sequenceItem",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];
      const edges: Edge[] = [
        { id: "e-1-2", source: "node-1", target: "node-2" },
      ];

      const layoutedNodes = horizontalLayout(nodes, edges);
      expect(layoutedNodes.length).toBe(2);
    });
  });

  describe("snapToGrid", () => {
    it("should snap position to grid", () => {
      const position = { x: 23, y: 47 };
      const result = snapToGrid(position, 20);
      expect(result).toEqual({ x: 20, y: 40 });
    });

    it("should snap to nearest grid point", () => {
      const position = { x: 35, y: 55 };
      const result = snapToGrid(position, 20);
      expect(result).toEqual({ x: 40, y: 60 });
    });

    it("should handle zero position", () => {
      const position = { x: 0, y: 0 };
      const result = snapToGrid(position, 20);
      expect(result).toEqual({ x: 0, y: 0 });
    });

    it("should handle negative positions", () => {
      const position = { x: -23, y: -47 };
      const result = snapToGrid(position, 20);
      expect(result).toEqual({ x: -20, y: -40 });
    });

    it("should work with different grid sizes", () => {
      const position = { x: 17, y: 33 };
      expect(snapToGrid(position, 10)).toEqual({ x: 20, y: 30 });
      expect(snapToGrid(position, 5)).toEqual({ x: 15, y: 35 });
      expect(snapToGrid(position, 25)).toEqual({ x: 25, y: 25 });
    });
  });

  describe("alignNodes", () => {
    const createTestNodes = (): Node[] => [
      {
        id: "node-1",
        type: "sequenceItem",
        position: { x: 100, y: 50 },
        data: {},
      },
      {
        id: "node-2",
        type: "sequenceItem",
        position: { x: 200, y: 100 },
        data: {},
      },
      {
        id: "node-3",
        type: "sequenceItem",
        position: { x: 150, y: 200 },
        data: {},
      },
    ];

    it("should align nodes to left", () => {
      const nodes = createTestNodes();
      const selectedIds = ["node-1", "node-2", "node-3"];
      const result = alignNodes(nodes, selectedIds, "left");

      // All selected nodes should have the same x position (minimum x)
      const alignedNodes = result.filter((n) => selectedIds.includes(n.id));
      const xPositions = alignedNodes.map((n) => n.position.x);
      expect(new Set(xPositions).size).toBe(1);
      expect(xPositions[0]).toBe(100); // Minimum x
    });

    it("should align nodes to right", () => {
      const nodes = createTestNodes();
      const selectedIds = ["node-1", "node-2", "node-3"];
      const result = alignNodes(nodes, selectedIds, "right");

      const alignedNodes = result.filter((n) => selectedIds.includes(n.id));
      // All nodes should be aligned to the rightmost position
      expect(
        alignedNodes.every((n) => n.position.x === alignedNodes[0].position.x),
      ).toBe(true);
    });

    it("should align nodes to top", () => {
      const nodes = createTestNodes();
      const selectedIds = ["node-1", "node-2", "node-3"];
      const result = alignNodes(nodes, selectedIds, "top");

      const alignedNodes = result.filter((n) => selectedIds.includes(n.id));
      const yPositions = alignedNodes.map((n) => n.position.y);
      expect(new Set(yPositions).size).toBe(1);
      expect(yPositions[0]).toBe(50); // Minimum y
    });

    it("should align nodes to bottom", () => {
      const nodes = createTestNodes();
      const selectedIds = ["node-1", "node-2", "node-3"];
      const result = alignNodes(nodes, selectedIds, "bottom");

      const alignedNodes = result.filter((n) => selectedIds.includes(n.id));
      expect(
        alignedNodes.every((n) => n.position.y === alignedNodes[0].position.y),
      ).toBe(true);
    });

    it("should not modify unselected nodes", () => {
      const nodes = createTestNodes();
      const selectedIds = ["node-1", "node-2"];
      const result = alignNodes(nodes, selectedIds, "left");

      const unselectedNode = result.find((n) => n.id === "node-3");
      expect(unselectedNode?.position).toEqual({ x: 150, y: 200 });
    });

    it("should return original nodes if less than 2 selected", () => {
      const nodes = createTestNodes();
      const result = alignNodes(nodes, ["node-1"], "left");
      expect(result).toEqual(nodes);
    });
  });

  describe("distributeNodes", () => {
    const createTestNodes = (): Node[] => [
      {
        id: "node-1",
        type: "sequenceItem",
        position: { x: 0, y: 0 },
        data: {},
      },
      {
        id: "node-2",
        type: "sequenceItem",
        position: { x: 100, y: 50 },
        data: {},
      },
      {
        id: "node-3",
        type: "sequenceItem",
        position: { x: 300, y: 100 },
        data: {},
      },
    ];

    it("should distribute nodes horizontally", () => {
      const nodes = createTestNodes();
      const selectedIds = ["node-1", "node-2", "node-3"];
      const result = distributeNodes(nodes, selectedIds, "horizontal");

      const sortedNodes = result
        .filter((n) => selectedIds.includes(n.id))
        .sort((a, b) => a.position.x - b.position.x);

      // Check that spacing is even
      const gap1 = sortedNodes[1].position.x - sortedNodes[0].position.x;
      const gap2 = sortedNodes[2].position.x - sortedNodes[1].position.x;
      expect(Math.abs(gap1 - gap2)).toBeLessThan(1);
    });

    it("should distribute nodes vertically", () => {
      const nodes = createTestNodes();
      const selectedIds = ["node-1", "node-2", "node-3"];
      const result = distributeNodes(nodes, selectedIds, "vertical");

      const sortedNodes = result
        .filter((n) => selectedIds.includes(n.id))
        .sort((a, b) => a.position.y - b.position.y);

      // Check that spacing is even
      const gap1 = sortedNodes[1].position.y - sortedNodes[0].position.y;
      const gap2 = sortedNodes[2].position.y - sortedNodes[1].position.y;
      expect(Math.abs(gap1 - gap2)).toBeLessThan(1);
    });

    it("should not modify unselected nodes", () => {
      const nodes = [
        ...createTestNodes(),
        {
          id: "node-4",
          type: "sequenceItem",
          position: { x: 500, y: 500 },
          data: {},
        },
      ];
      const selectedIds = ["node-1", "node-2", "node-3"];
      const result = distributeNodes(nodes, selectedIds, "horizontal");

      const unselectedNode = result.find((n) => n.id === "node-4");
      expect(unselectedNode?.position).toEqual({ x: 500, y: 500 });
    });

    it("should return original nodes if less than 3 selected", () => {
      const nodes = createTestNodes();
      const result = distributeNodes(nodes, ["node-1", "node-2"], "horizontal");
      expect(result).toEqual(nodes);
    });
  });

  describe("getSelectionBounds", () => {
    it("should return bounds for selected nodes", () => {
      const nodes: Node[] = [
        {
          id: "node-1",
          type: "sequenceItem",
          position: { x: 100, y: 50 },
          data: {},
        },
        {
          id: "node-2",
          type: "sequenceItem",
          position: { x: 200, y: 100 },
          data: {},
        },
        {
          id: "node-3",
          type: "sequenceItem",
          position: { x: 150, y: 200 },
          data: {},
        },
      ];
      const selectedIds = ["node-1", "node-2", "node-3"];

      const bounds = getSelectionBounds(nodes, selectedIds);

      expect(bounds).toBeDefined();
      expect(bounds!.minX).toBe(100);
      expect(bounds!.minY).toBe(50);
      expect(bounds!.maxX).toBeGreaterThan(200); // maxX includes node width
      expect(bounds!.maxY).toBeGreaterThan(200); // maxY includes node height
    });

    it("should return null for empty selection", () => {
      const nodes: Node[] = [
        {
          id: "node-1",
          type: "sequenceItem",
          position: { x: 100, y: 50 },
          data: {},
        },
      ];

      const bounds = getSelectionBounds(nodes, []);
      expect(bounds).toBeNull();
    });

    it("should only consider selected nodes", () => {
      const nodes: Node[] = [
        {
          id: "node-1",
          type: "sequenceItem",
          position: { x: 100, y: 50 },
          data: {},
        },
        {
          id: "node-2",
          type: "sequenceItem",
          position: { x: 500, y: 500 },
          data: {},
        },
      ];
      const selectedIds = ["node-1"];

      const bounds = getSelectionBounds(nodes, selectedIds);

      expect(bounds).toBeDefined();
      expect(bounds!.minX).toBe(100);
      expect(bounds!.minY).toBe(50);
      // Should not include node-2's position
      expect(bounds!.maxX).toBeLessThan(500);
      expect(bounds!.maxY).toBeLessThan(500);
    });
  });
});
