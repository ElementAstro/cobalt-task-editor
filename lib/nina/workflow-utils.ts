// Workflow utilities - Convert between sequence data and React Flow nodes/edges

import type { Node, Edge } from "@xyflow/react";
import type {
  EditorSequenceItem,
  EditorCondition,
  EditorTrigger,
  EditorSequence,
} from "./types";
import { isContainerType } from "./constants";
import dagre from "dagre";

// Node types
export type WorkflowNodeType =
  | "sequenceItem"
  | "container"
  | "condition"
  | "trigger"
  | "areaStart"
  | "areaEnd";

// Custom node data types - with index signatures for React Flow compatibility
export interface SequenceItemNodeData {
  item: EditorSequenceItem;
  area: "start" | "target" | "end";
  parentId: string | null;
  index: number;
  depth: number;
  [key: string]: unknown;
}

export interface ContainerNodeData extends SequenceItemNodeData {
  isExpanded: boolean;
  childCount: number;
}

export interface ConditionNodeData {
  condition: EditorCondition;
  containerId: string;
  [key: string]: unknown;
}

export interface TriggerNodeData {
  trigger: EditorTrigger;
  containerId: string | null; // null for global triggers
  [key: string]: unknown;
}

export interface AreaMarkerData {
  area: "start" | "target" | "end";
  label: string;
  [key: string]: unknown;
}

// Layout configuration
export const LAYOUT_CONFIG = {
  nodeWidth: 240,
  nodeHeight: 60,
  containerNodeHeight: 80,
  conditionNodeHeight: 40,
  triggerNodeHeight: 40,
  horizontalGap: 60,
  verticalGap: 20,
  containerPadding: 20,
  areaGap: 100,
  startX: 50,
  startY: 50,
};

// Generate unique edge ID
function edgeId(
  source: string,
  target: string,
  sourceHandle?: string,
  targetHandle?: string,
): string {
  return `e-${source}-${target}${sourceHandle ? `-${sourceHandle}` : ""}${targetHandle ? `-${targetHandle}` : ""}`;
}

// Calculate node positions using a hierarchical layout
interface LayoutState {
  currentY: number;
  maxX: number;
}

function layoutItems(
  items: EditorSequenceItem[],
  area: "start" | "target" | "end",
  parentId: string | null,
  depth: number,
  startX: number,
  layoutState: LayoutState,
  nodes: Node[],
  edges: Edge[],
  prevNodeId: string | null,
): string | null {
  let lastNodeId = prevNodeId;

  items.forEach((item, index) => {
    const isContainer = isContainerType(item.type);
    const nodeId = `node-${item.id}`;
    const x =
      startX + depth * (LAYOUT_CONFIG.nodeWidth + LAYOUT_CONFIG.horizontalGap);
    const y = layoutState.currentY;

    // Create node
    const nodeData: SequenceItemNodeData = {
      item,
      area,
      parentId,
      index,
      depth,
    };

    if (isContainer) {
      const containerData: ContainerNodeData = {
        ...nodeData,
        isExpanded: item.isExpanded ?? true,
        childCount: item.items?.length ?? 0,
      };

      nodes.push({
        id: nodeId,
        type: "container",
        position: { x, y },
        data: containerData,
        style: {
          width: LAYOUT_CONFIG.nodeWidth,
        },
      });

      layoutState.currentY +=
        LAYOUT_CONFIG.containerNodeHeight + LAYOUT_CONFIG.verticalGap;

      // Add edge from previous node
      if (lastNodeId) {
        edges.push({
          id: edgeId(lastNodeId, nodeId),
          source: lastNodeId,
          target: nodeId,
          type: "bezier",
          animated: false,
          style: { stroke: "#64748b", strokeWidth: 2 },
        });
      }

      // Layout conditions
      if (item.conditions && item.conditions.length > 0) {
        item.conditions.forEach((condition, condIndex) => {
          const condNodeId = `cond-${condition.id}`;
          const condX = x + LAYOUT_CONFIG.nodeWidth + 40;
          const condY = y + condIndex * (LAYOUT_CONFIG.conditionNodeHeight + 8);

          nodes.push({
            id: condNodeId,
            type: "condition",
            position: { x: condX, y: condY },
            data: { condition, containerId: item.id } as ConditionNodeData,
          });

          edges.push({
            id: edgeId(nodeId, condNodeId, "condition"),
            source: nodeId,
            sourceHandle: "condition",
            target: condNodeId,
            type: "smoothstep",
            style: {
              stroke: "#eab308",
              strokeWidth: 1.5,
              strokeDasharray: "5,5",
            },
          });

          layoutState.maxX = Math.max(layoutState.maxX, condX + 150);
        });
      }

      // Layout triggers
      if (item.triggers && item.triggers.length > 0) {
        item.triggers.forEach((trigger, trigIndex) => {
          const trigNodeId = `trig-${trigger.id}`;
          const trigX = x + LAYOUT_CONFIG.nodeWidth + 40;
          const condOffset =
            (item.conditions?.length ?? 0) *
            (LAYOUT_CONFIG.conditionNodeHeight + 8);
          const trigY =
            y + condOffset + trigIndex * (LAYOUT_CONFIG.triggerNodeHeight + 8);

          nodes.push({
            id: trigNodeId,
            type: "trigger",
            position: { x: trigX, y: trigY },
            data: { trigger, containerId: item.id } as TriggerNodeData,
          });

          edges.push({
            id: edgeId(nodeId, trigNodeId, "trigger"),
            source: nodeId,
            sourceHandle: "trigger",
            target: trigNodeId,
            type: "smoothstep",
            style: {
              stroke: "#a855f7",
              strokeWidth: 1.5,
              strokeDasharray: "5,5",
            },
          });

          layoutState.maxX = Math.max(layoutState.maxX, trigX + 150);
        });
      }

      // Layout children if expanded
      if (item.isExpanded && item.items && item.items.length > 0) {
        layoutItems(
          item.items,
          area,
          item.id,
          depth + 1,
          startX,
          layoutState,
          nodes,
          edges,
          nodeId,
        );
      }

      lastNodeId = nodeId;
    } else {
      // Regular sequence item
      nodes.push({
        id: nodeId,
        type: "sequenceItem",
        position: { x, y },
        data: nodeData,
        style: {
          width: LAYOUT_CONFIG.nodeWidth,
        },
      });

      layoutState.currentY +=
        LAYOUT_CONFIG.nodeHeight + LAYOUT_CONFIG.verticalGap;
      layoutState.maxX = Math.max(
        layoutState.maxX,
        x + LAYOUT_CONFIG.nodeWidth,
      );

      // Add edge from previous node
      if (lastNodeId) {
        edges.push({
          id: edgeId(lastNodeId, nodeId),
          source: lastNodeId,
          target: nodeId,
          type: "bezier",
          animated: false,
          style: { stroke: "#64748b", strokeWidth: 2 },
        });
      }

      lastNodeId = nodeId;
    }
  });

  return lastNodeId;
}

// Convert sequence to React Flow nodes and edges
export function sequenceToFlow(sequence: EditorSequence): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const layoutState: LayoutState = {
    currentY: LAYOUT_CONFIG.startY,
    maxX: LAYOUT_CONFIG.startX,
  };

  // Create area start markers and layout items for each area
  const areas: Array<{
    key: "start" | "target" | "end";
    items: EditorSequenceItem[];
    label: string;
  }> = [
    { key: "start", items: sequence.startItems, label: "Start" },
    { key: "target", items: sequence.targetItems, label: "Target" },
    { key: "end", items: sequence.endItems, label: "End" },
  ];

  let prevAreaEndNodeId: string | null = null;

  areas.forEach(({ key, items, label }) => {
    // Area start marker
    const areaStartId = `area-start-${key}`;
    nodes.push({
      id: areaStartId,
      type: "areaStart",
      position: { x: LAYOUT_CONFIG.startX, y: layoutState.currentY },
      data: { area: key, label } as AreaMarkerData,
      draggable: false,
    });

    // Connect from previous area
    if (prevAreaEndNodeId) {
      edges.push({
        id: edgeId(prevAreaEndNodeId, areaStartId),
        source: prevAreaEndNodeId,
        target: areaStartId,
        type: "bezier",
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 2, strokeDasharray: "10,5" },
      });
    }

    layoutState.currentY += 60;

    // Layout items in this area
    const lastItemNodeId = layoutItems(
      items,
      key,
      null,
      0,
      LAYOUT_CONFIG.startX,
      layoutState,
      nodes,
      edges,
      areaStartId,
    );

    // Area end marker
    const areaEndId = `area-end-${key}`;
    nodes.push({
      id: areaEndId,
      type: "areaEnd",
      position: { x: LAYOUT_CONFIG.startX, y: layoutState.currentY },
      data: { area: key, label: `${label} End` } as AreaMarkerData,
      draggable: false,
    });

    if (lastItemNodeId) {
      edges.push({
        id: edgeId(lastItemNodeId, areaEndId),
        source: lastItemNodeId,
        target: areaEndId,
        type: "straight",
        style: { stroke: "#64748b", strokeWidth: 2 },
      });
    } else {
      // Empty area - connect start to end
      edges.push({
        id: edgeId(areaStartId, areaEndId),
        source: areaStartId,
        target: areaEndId,
        type: "straight",
        style: { stroke: "#64748b", strokeWidth: 2, strokeDasharray: "5,5" },
      });
    }

    layoutState.currentY += LAYOUT_CONFIG.areaGap;
    prevAreaEndNodeId = areaEndId;
  });

  // Layout global triggers
  if (sequence.globalTriggers.length > 0) {
    const globalTriggerX = layoutState.maxX + LAYOUT_CONFIG.horizontalGap;
    sequence.globalTriggers.forEach((trigger, index) => {
      const trigNodeId = `global-trig-${trigger.id}`;
      nodes.push({
        id: trigNodeId,
        type: "trigger",
        position: {
          x: globalTriggerX,
          y:
            LAYOUT_CONFIG.startY +
            index * (LAYOUT_CONFIG.triggerNodeHeight + 15),
        },
        data: { trigger, containerId: null } as TriggerNodeData,
      });
    });
  }

  return { nodes, edges };
}

// Find item info from node ID
export function parseNodeId(
  nodeId: string,
): { type: "item" | "condition" | "trigger" | "area"; id: string } | null {
  if (nodeId.startsWith("node-")) {
    return { type: "item", id: nodeId.replace("node-", "") };
  }
  if (nodeId.startsWith("cond-")) {
    return { type: "condition", id: nodeId.replace("cond-", "") };
  }
  if (nodeId.startsWith("trig-") || nodeId.startsWith("global-trig-")) {
    const id = nodeId.replace("global-trig-", "").replace("trig-", "");
    return { type: "trigger", id };
  }
  if (nodeId.startsWith("area-")) {
    return { type: "area", id: nodeId };
  }
  return null;
}

// Get area color
export function getAreaColor(area: "start" | "target" | "end"): string {
  switch (area) {
    case "start":
      return "#22c55e"; // green
    case "target":
      return "#3b82f6"; // blue
    case "end":
      return "#f97316"; // orange
    default:
      return "#64748b";
  }
}

// Get item type color based on type string
export function getItemTypeColor(type: string): string {
  if (type.includes("DeepSkyObject")) return "#eab308"; // yellow
  if (type.includes("Sequential")) return "#3b82f6"; // blue
  if (type.includes("Parallel")) return "#a855f7"; // purple
  if (type.includes("Cool") || type.includes("Warm")) return "#f97316"; // orange
  if (type.includes("Exposure")) return "#22c55e"; // green
  if (type.includes("Slew") || type.includes("Park")) return "#06b6d4"; // cyan
  if (type.includes("Focuser") || type.includes("Autofocus")) return "#6366f1"; // indigo
  if (type.includes("Filter")) return "#ec4899"; // pink
  if (type.includes("Guider") || type.includes("Dither")) return "#ef4444"; // red
  if (type.includes("Rotator")) return "#14b8a6"; // teal
  if (type.includes("Dome")) return "#f59e0b"; // amber
  if (type.includes("Wait")) return "#f97316"; // orange
  return "#64748b"; // slate
}

// Auto-layout nodes using dagre algorithm
export interface AutoLayoutOptions {
  direction?: "TB" | "LR" | "BT" | "RL";
  nodeSpacing?: number;
  rankSpacing?: number;
  edgeSpacing?: number;
  marginX?: number;
  marginY?: number;
}

export function autoLayoutNodes(
  nodes: Node[],
  edges: Edge[],
  options: AutoLayoutOptions = {},
): Node[] {
  const {
    direction = "TB",
    nodeSpacing = 60,
    rankSpacing = 100,
    edgeSpacing = 20,
    marginX = 50,
    marginY = 50,
  } = options;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    edgesep: edgeSpacing,
    marginx: marginX,
    marginy: marginY,
    acyclicer: "greedy",
    ranker: "network-simplex",
  });

  // Get node dimensions based on type
  const getNodeDimensions = (node: Node) => {
    switch (node.type) {
      case "condition":
        return { width: 140, height: LAYOUT_CONFIG.conditionNodeHeight };
      case "trigger":
        return { width: 140, height: LAYOUT_CONFIG.triggerNodeHeight };
      case "container":
        return {
          width: LAYOUT_CONFIG.nodeWidth,
          height: LAYOUT_CONFIG.containerNodeHeight,
        };
      case "areaStart":
      case "areaEnd":
        return { width: 180, height: 40 };
      default:
        return {
          width: LAYOUT_CONFIG.nodeWidth,
          height: LAYOUT_CONFIG.nodeHeight,
        };
    }
  };

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    const { width, height } = getNodeDimensions(node);
    dagreGraph.setNode(node.id, { width, height });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run layout algorithm
  dagre.layout(dagreGraph);

  // Apply positions back to nodes
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const { width, height } = getNodeDimensions(node);

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });
}

// Compact layout - groups related nodes closer together
export function compactLayout(nodes: Node[], edges: Edge[]): Node[] {
  return autoLayoutNodes(nodes, edges, {
    direction: "TB",
    nodeSpacing: 40,
    rankSpacing: 70,
    edgeSpacing: 15,
    marginX: 30,
    marginY: 30,
  });
}

// Spread layout - gives more space between nodes
export function spreadLayout(nodes: Node[], edges: Edge[]): Node[] {
  return autoLayoutNodes(nodes, edges, {
    direction: "TB",
    nodeSpacing: 80,
    rankSpacing: 120,
    edgeSpacing: 30,
    marginX: 60,
    marginY: 60,
  });
}

// Horizontal layout
export function horizontalLayout(nodes: Node[], edges: Edge[]): Node[] {
  return autoLayoutNodes(nodes, edges, {
    direction: "LR",
    nodeSpacing: 50,
    rankSpacing: 100,
    edgeSpacing: 20,
    marginX: 50,
    marginY: 50,
  });
}

// Snap position to grid
export function snapToGrid(
  position: { x: number; y: number },
  gridSize: number,
): { x: number; y: number } {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}

// Align selected nodes
export type AlignmentType =
  | "left"
  | "center"
  | "right"
  | "top"
  | "middle"
  | "bottom";

export function alignNodes(
  nodes: Node[],
  selectedIds: string[],
  alignment: AlignmentType,
): Node[] {
  const selectedNodes = nodes.filter((n) => selectedIds.includes(n.id));
  if (selectedNodes.length < 2) return nodes;

  let targetValue: number;

  switch (alignment) {
    case "left":
      targetValue = Math.min(...selectedNodes.map((n) => n.position.x));
      break;
    case "center":
      const minX = Math.min(...selectedNodes.map((n) => n.position.x));
      const maxX = Math.max(
        ...selectedNodes.map((n) => n.position.x + LAYOUT_CONFIG.nodeWidth),
      );
      targetValue = (minX + maxX) / 2;
      break;
    case "right":
      targetValue = Math.max(
        ...selectedNodes.map((n) => n.position.x + LAYOUT_CONFIG.nodeWidth),
      );
      break;
    case "top":
      targetValue = Math.min(...selectedNodes.map((n) => n.position.y));
      break;
    case "middle":
      const minY = Math.min(...selectedNodes.map((n) => n.position.y));
      const maxY = Math.max(
        ...selectedNodes.map((n) => n.position.y + LAYOUT_CONFIG.nodeHeight),
      );
      targetValue = (minY + maxY) / 2;
      break;
    case "bottom":
      targetValue = Math.max(
        ...selectedNodes.map((n) => n.position.y + LAYOUT_CONFIG.nodeHeight),
      );
      break;
  }

  return nodes.map((node) => {
    if (!selectedIds.includes(node.id)) return node;

    const newPosition = { ...node.position };

    switch (alignment) {
      case "left":
        newPosition.x = targetValue;
        break;
      case "center":
        newPosition.x = targetValue - LAYOUT_CONFIG.nodeWidth / 2;
        break;
      case "right":
        newPosition.x = targetValue - LAYOUT_CONFIG.nodeWidth;
        break;
      case "top":
        newPosition.y = targetValue;
        break;
      case "middle":
        newPosition.y = targetValue - LAYOUT_CONFIG.nodeHeight / 2;
        break;
      case "bottom":
        newPosition.y = targetValue - LAYOUT_CONFIG.nodeHeight;
        break;
    }

    return { ...node, position: newPosition };
  });
}

// Distribute nodes evenly
export type DistributeType = "horizontal" | "vertical";

export function distributeNodes(
  nodes: Node[],
  selectedIds: string[],
  direction: DistributeType,
): Node[] {
  const selectedNodes = nodes.filter((n) => selectedIds.includes(n.id));
  if (selectedNodes.length < 3) return nodes;

  const sortedNodes = [...selectedNodes].sort((a, b) =>
    direction === "horizontal"
      ? a.position.x - b.position.x
      : a.position.y - b.position.y,
  );

  const first = sortedNodes[0];
  const last = sortedNodes[sortedNodes.length - 1];

  const totalSpace =
    direction === "horizontal"
      ? last.position.x - first.position.x
      : last.position.y - first.position.y;

  const spacing = totalSpace / (sortedNodes.length - 1);

  const newPositions = new Map<string, { x: number; y: number }>();

  sortedNodes.forEach((node, index) => {
    const newPos = { ...node.position };
    if (direction === "horizontal") {
      newPos.x = first.position.x + spacing * index;
    } else {
      newPos.y = first.position.y + spacing * index;
    }
    newPositions.set(node.id, newPos);
  });

  return nodes.map((node) => {
    const newPos = newPositions.get(node.id);
    if (newPos) {
      return { ...node, position: newPos };
    }
    return node;
  });
}

// Get bounding box of selected nodes
export function getSelectionBounds(
  nodes: Node[],
  selectedIds: string[],
): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} | null {
  const selectedNodes = nodes.filter((n) => selectedIds.includes(n.id));
  if (selectedNodes.length === 0) return null;

  const minX = Math.min(...selectedNodes.map((n) => n.position.x));
  const minY = Math.min(...selectedNodes.map((n) => n.position.y));
  const maxX = Math.max(
    ...selectedNodes.map((n) => n.position.x + LAYOUT_CONFIG.nodeWidth),
  );
  const maxY = Math.max(
    ...selectedNodes.map((n) => n.position.y + LAYOUT_CONFIG.nodeHeight),
  );

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// Smart layout that positions area markers correctly
export function smartLayout(
  nodes: Node[],
  edges: Edge[],
  options: AutoLayoutOptions = {},
): Node[] {
  const { direction = "TB", nodeSpacing = 60, rankSpacing = 100 } = options;

  // Separate area markers from regular nodes
  const areaStartNodes = nodes.filter((n) => n.type === "areaStart");
  const areaEndNodes = nodes.filter((n) => n.type === "areaEnd");
  const contentNodes = nodes.filter(
    (n) => n.type !== "areaStart" && n.type !== "areaEnd",
  );

  // Group content nodes by area
  const nodesByArea: Record<string, Node[]> = {
    start: [],
    target: [],
    end: [],
  };

  contentNodes.forEach((node) => {
    const area = (node.data as { area?: string })?.area;
    if (area && nodesByArea[area]) {
      nodesByArea[area].push(node);
    }
  });

  // Layout each area separately
  const layoutedNodes: Node[] = [];
  let currentY = 50;
  const centerX = 300;

  const areas: ("start" | "target" | "end")[] = ["start", "target", "end"];

  areas.forEach((area) => {
    const areaNodes = nodesByArea[area];
    const areaStart = areaStartNodes.find((n) => n.id === `area-start-${area}`);
    const areaEnd = areaEndNodes.find((n) => n.id === `area-end-${area}`);

    // Position area start marker
    if (areaStart) {
      layoutedNodes.push({
        ...areaStart,
        position: { x: centerX - 90, y: currentY },
      });
      currentY += 60;
    }

    // Layout content nodes for this area
    if (areaNodes.length > 0) {
      // Filter edges that belong to this area's nodes
      const areaNodeIds = new Set(areaNodes.map((n) => n.id));
      const areaEdges = edges.filter(
        (e) => areaNodeIds.has(e.source) || areaNodeIds.has(e.target),
      );

      // Use dagre for area content
      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));
      dagreGraph.setGraph({
        rankdir: direction,
        nodesep: nodeSpacing,
        ranksep: rankSpacing,
      });

      areaNodes.forEach((node) => {
        const width =
          node.type === "condition" || node.type === "trigger"
            ? 140
            : LAYOUT_CONFIG.nodeWidth;
        const height =
          node.type === "container"
            ? LAYOUT_CONFIG.containerNodeHeight
            : LAYOUT_CONFIG.nodeHeight;
        dagreGraph.setNode(node.id, { width, height });
      });

      areaEdges.forEach((edge) => {
        if (
          dagreGraph.hasNode(edge.source) &&
          dagreGraph.hasNode(edge.target)
        ) {
          dagreGraph.setEdge(edge.source, edge.target);
        }
      });

      dagre.layout(dagreGraph);

      // Find bounds and center offset
      let minX = Infinity,
        maxX = -Infinity;
      areaNodes.forEach((node) => {
        const pos = dagreGraph.node(node.id);
        if (pos) {
          minX = Math.min(minX, pos.x);
          maxX = Math.max(maxX, pos.x);
        }
      });

      const areaWidth = maxX - minX;
      const offsetX = centerX - (minX + areaWidth / 2);

      areaNodes.forEach((node) => {
        const pos = dagreGraph.node(node.id);
        if (pos) {
          const width =
            node.type === "condition" || node.type === "trigger"
              ? 140
              : LAYOUT_CONFIG.nodeWidth;
          const height =
            node.type === "container"
              ? LAYOUT_CONFIG.containerNodeHeight
              : LAYOUT_CONFIG.nodeHeight;

          layoutedNodes.push({
            ...node,
            position: {
              x: pos.x - width / 2 + offsetX,
              y: pos.y - height / 2 + currentY,
            },
          });
        }
      });

      // Update currentY based on layouted nodes
      const maxNodeY = Math.max(
        ...areaNodes.map((n) => {
          const pos = dagreGraph.node(n.id);
          return pos ? pos.y : 0;
        }),
      );
      currentY += maxNodeY + 80;
    } else {
      currentY += 40; // Empty area gap
    }

    // Position area end marker
    if (areaEnd) {
      layoutedNodes.push({
        ...areaEnd,
        position: { x: centerX - 90, y: currentY },
      });
      currentY += 100; // Gap between areas
    }
  });

  return layoutedNodes;
}
