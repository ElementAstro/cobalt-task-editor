"use client";

import { useCallback, useMemo, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type NodeTypes,
  type OnConnect,
  type Node,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  useSequenceEditorStore,
  selectCanUndo,
  selectCanRedo,
} from "@/lib/nina/store";
import { useI18n } from "@/lib/i18n";
import {
  sequenceToFlow,
  parseNodeId,
  autoLayoutNodes,
  compactLayout,
  spreadLayout,
  horizontalLayout,
  smartLayout,
  snapToGrid,
  alignNodes,
  distributeNodes,
  type AlignmentType,
  type DistributeType,
} from "@/lib/nina/workflow-utils";
import {
  createSequenceItem,
  createCondition,
  createTrigger,
} from "@/lib/nina/utils";
import { isContainerType } from "@/lib/nina/constants";
import {
  SequenceItemNode,
  ContainerNode,
  ConditionNode,
  TriggerNode,
  AreaStartNode,
  AreaEndNode,
} from "./workflow";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Copy,
  Trash2,
  LayoutGrid,
  ArrowDownUp,
  ArrowLeftRight,
  Minimize2,
  Maximize,
  Sparkles,
  RefreshCw,
  Undo2,
  Redo2,
  Grid3X3,
  Map,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  GalleryHorizontal,
  GalleryVertical,
  Settings2,
  Eye,
  EyeOff,
  Keyboard,
  Power,
  MoveRight,
  Scissors,
  ClipboardPaste,
} from "lucide-react";
import { BackgroundVariant, SelectionMode } from "@xyflow/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

// Define node types
const nodeTypes: NodeTypes = {
  sequenceItem: SequenceItemNode,
  container: ContainerNode,
  condition: ConditionNode,
  trigger: TriggerNode,
  areaStart: AreaStartNode,
  areaEnd: AreaEndNode,
};

// Inner component that uses React Flow hooks
function WorkflowViewInner() {
  const { t } = useI18n();
  const reactFlowInstance = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
    nodeType: "item" | "condition" | "trigger" | null;
  } | null>(null);

  const {
    sequence,
    activeArea,
    addItem,
    addCondition,
    addTrigger,
    selectItem,
    selectCondition,
    selectTrigger,
    selectedItemId,
    selectedConditionId,
    selectedTriggerId,
    selectedItemIds,
    toggleItemSelection,
    selectMultipleItems,
    clearMultiSelection,
    deleteSelectedItems,
    duplicateSelectedItems,
    deleteItem,
    deleteCondition,
    deleteTrigger,
    duplicateItem,
    autoLayoutEnabled,
    setAutoLayoutEnabled,
    gridSnapEnabled,
    setGridSnapEnabled,
    gridSize,
    showMinimap,
    setShowMinimap,
    showAreaBackgrounds,
    setShowAreaBackgrounds,
    toggleItemEnabled,
    moveItemToArea,
    undo,
    redo,
    copySelectedItems,
    cutSelectedItems,
    pasteItems,
    selectAllItems,
    hasClipboard,
  } = useSequenceEditorStore();

  const canUndo = useSequenceEditorStore(selectCanUndo);
  const canRedo = useSequenceEditorStore(selectCanRedo);

  // Keyboard shortcuts help dialog
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Zoom level state - updated via onMove callback
  const [zoomLevel, setZoomLevel] = useState(100);

  // Convert sequence to flow data
  const { initialNodes, initialEdges } = useMemo(() => {
    const { nodes, edges } = sequenceToFlow(sequence);
    return { initialNodes: nodes, initialEdges: edges };
  }, [sequence]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when sequence changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = sequenceToFlow(sequence);

    // Apply auto-layout if enabled
    if (autoLayoutEnabled && newNodes.length > 0) {
      const layoutedNodes = smartLayout(newNodes, newEdges, {
        direction: "TB",
        nodeSpacing: 50,
        rankSpacing: 80,
      });
      setNodes(layoutedNodes);
    } else {
      setNodes(newNodes);
    }
    setEdges(newEdges);
  }, [sequence, autoLayoutEnabled, setNodes, setEdges]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete selected item
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedItemId) {
          event.preventDefault();
          deleteItem(selectedItemId);
        } else if (selectedConditionId) {
          event.preventDefault();
          // Find container for the condition
          const findContainerId = (
            items: typeof sequence.startItems,
          ): string | null => {
            for (const item of items) {
              if (item.conditions?.some((c) => c.id === selectedConditionId)) {
                return item.id;
              }
              if (item.items) {
                const found = findContainerId(item.items);
                if (found) return found;
              }
            }
            return null;
          };
          const containerId =
            findContainerId(sequence.startItems) ||
            findContainerId(sequence.targetItems) ||
            findContainerId(sequence.endItems);
          if (containerId) {
            deleteCondition(containerId, selectedConditionId);
          }
        } else if (selectedTriggerId) {
          event.preventDefault();
          // Find container for the trigger
          const findContainerId = (
            items: typeof sequence.startItems,
          ): string | null => {
            for (const item of items) {
              if (item.triggers?.some((t) => t.id === selectedTriggerId)) {
                return item.id;
              }
              if (item.items) {
                const found = findContainerId(item.items);
                if (found) return found;
              }
            }
            return null;
          };
          const containerId =
            findContainerId(sequence.startItems) ||
            findContainerId(sequence.targetItems) ||
            findContainerId(sequence.endItems);
          if (containerId) {
            deleteTrigger(containerId, selectedTriggerId);
          }
        }
      }

      // Duplicate selected item (Ctrl+D)
      if ((event.ctrlKey || event.metaKey) && event.key === "d") {
        if (selectedItemId) {
          event.preventDefault();
          duplicateItem(selectedItemId);
        }
      }

      // Copy (Ctrl+C)
      if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        if (selectedItemIds.length > 0 || selectedItemId) {
          event.preventDefault();
          copySelectedItems();
        }
      }

      // Cut (Ctrl+X)
      if ((event.ctrlKey || event.metaKey) && event.key === "x") {
        if (selectedItemIds.length > 0 || selectedItemId) {
          event.preventDefault();
          cutSelectedItems();
        }
      }

      // Paste (Ctrl+V)
      if ((event.ctrlKey || event.metaKey) && event.key === "v") {
        if (hasClipboard()) {
          event.preventDefault();
          pasteItems();
        }
      }

      // Select All (Ctrl+A)
      if ((event.ctrlKey || event.metaKey) && event.key === "a") {
        event.preventDefault();
        selectAllItems();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedItemId,
    selectedItemIds,
    selectedConditionId,
    selectedTriggerId,
    deleteItem,
    deleteCondition,
    deleteTrigger,
    duplicateItem,
    sequence,
    copySelectedItems,
    cutSelectedItems,
    pasteItems,
    hasClipboard,
    selectAllItems,
  ]);

  // Handle connection
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, type: "smoothstep" }, eds));
    },
    [setEdges],
  );

  // Handle node click with multi-select support
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const parsed = parseNodeId(node.id);
      if (!parsed) return;

      switch (parsed.type) {
        case "item":
          if (event.ctrlKey || event.metaKey) {
            // Multi-select with Ctrl/Cmd
            toggleItemSelection(parsed.id);
          } else if (event.shiftKey && selectedItemIds.length > 0) {
            // Range select with Shift (simplified - just add to selection)
            toggleItemSelection(parsed.id);
          } else {
            selectItem(parsed.id);
          }
          break;
        case "condition":
          selectCondition(parsed.id);
          break;
        case "trigger":
          selectTrigger(parsed.id);
          break;
      }
    },
    [
      selectItem,
      selectCondition,
      selectTrigger,
      toggleItemSelection,
      selectedItemIds,
    ],
  );

  // Handle selection box (marquee select)
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      const itemIds = selectedNodes
        .map((n) => parseNodeId(n.id))
        .filter((p) => p?.type === "item")
        .map((p) => p!.id);
      if (itemIds.length > 0) {
        selectMultipleItems(itemIds);
      }
    },
    [selectMultipleItems],
  );

  // Handle drop from toolbox
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      try {
        // Try to get drag data
        const dataStr = event.dataTransfer.getData("application/json");
        if (!dataStr) {
          return;
        }

        const data = JSON.parse(dataStr);
        if (!data.item) {
          return;
        }

        // Get the container bounds for position calculation
        const reactFlowBounds = containerRef.current?.getBoundingClientRect();
        if (!reactFlowBounds) {
          return;
        }

        // Convert screen coordinates to flow coordinates
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        // Determine target area by finding which area section the drop is in
        // We look at the Y position relative to area markers
        let targetArea: "start" | "target" | "end" = activeArea;

        // Sort area start markers by Y position
        const startMarkers = nodes
          .filter((n) => n.type === "areaStart")
          .sort((a, b) => a.position.y - b.position.y);

        // Find the appropriate area based on drop Y position
        for (let i = startMarkers.length - 1; i >= 0; i--) {
          const marker = startMarkers[i];
          if (position.y >= marker.position.y) {
            const markerData = marker.data as {
              area?: "start" | "target" | "end";
            };
            if (markerData.area) {
              targetArea = markerData.area;
              break;
            }
          }
        }

        // Check if dropped on a container node
        let targetParentId: string | null = null;

        // Find container nodes that contain the drop position
        const containerNodes = nodes.filter((node) => {
          if (node.type !== "container" && node.type !== "sequenceItem")
            return false;

          const nodeX = node.position.x;
          const nodeY = node.position.y;
          const nodeWidth = 240;
          const nodeHeight = node.type === "container" ? 80 : 60;

          const isInBounds =
            position.x >= nodeX &&
            position.x <= nodeX + nodeWidth &&
            position.y >= nodeY &&
            position.y <= nodeY + nodeHeight;

          return isInBounds;
        });

        // If dropped on a container, use it as parent
        if (containerNodes.length > 0) {
          const targetNode = containerNodes[0];
          const parsed = parseNodeId(targetNode.id);

          if (parsed?.type === "item") {
            const item = useSequenceEditorStore
              .getState()
              .getItemById(parsed.id);
            if (item && isContainerType(item.type)) {
              targetParentId = parsed.id;
            }

            // Also get the area from the target node
            const nodeData = targetNode.data as {
              area?: "start" | "target" | "end";
            };
            if (nodeData.area) {
              targetArea = nodeData.area;
            }
          }
        }

        // Create and add the item based on type
        if (data.type === "item") {
          const newItem = createSequenceItem(data.item.type);
          addItem(targetArea, newItem, targetParentId);
        } else if (data.type === "condition") {
          if (targetParentId) {
            const newCondition = createCondition(data.item.type);
            addCondition(targetParentId, newCondition);
          }
        } else if (data.type === "trigger") {
          const newTrigger = createTrigger(data.item.type);
          if (targetParentId) {
            addTrigger(targetParentId, newTrigger);
          } else {
            // Add as global trigger
            useSequenceEditorStore.getState().addGlobalTrigger(newTrigger);
          }
        }
      } catch (err) {
        console.error("Drop error:", err);
      }
    },
    [nodes, activeArea, addItem, addCondition, addTrigger, reactFlowInstance],
  );

  // Handle context menu on node right-click
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      const parsed = parseNodeId(node.id);
      if (!parsed || parsed.type === "area") return;

      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: parsed.id,
        nodeType: parsed.type,
      });

      // Also select the node
      if (parsed.type === "item") {
        selectItem(parsed.id);
      } else if (parsed.type === "condition") {
        selectCondition(parsed.id);
      } else if (parsed.type === "trigger") {
        selectTrigger(parsed.id);
      }
    },
    [selectItem, selectCondition, selectTrigger],
  );

  // Close context menu and clear selection
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Handle pane click - close menu and optionally clear selection
  const handlePaneClick = useCallback(() => {
    closeContextMenu();
    // Clear multi-selection when clicking on empty space
    if (selectedItemIds.length > 1) {
      clearMultiSelection();
    }
  }, [closeContextMenu, selectedItemIds.length, clearMultiSelection]);

  // Context menu actions
  const handleContextMenuDelete = useCallback(() => {
    if (!contextMenu) return;

    if (contextMenu.nodeType === "item") {
      deleteItem(contextMenu.nodeId);
    } else if (contextMenu.nodeType === "condition") {
      // Find container for the condition
      const findContainerId = (
        items: typeof sequence.startItems,
      ): string | null => {
        for (const item of items) {
          if (item.conditions?.some((c) => c.id === contextMenu.nodeId)) {
            return item.id;
          }
          if (item.items) {
            const found = findContainerId(item.items);
            if (found) return found;
          }
        }
        return null;
      };
      const containerId =
        findContainerId(sequence.startItems) ||
        findContainerId(sequence.targetItems) ||
        findContainerId(sequence.endItems);
      if (containerId) {
        deleteCondition(containerId, contextMenu.nodeId);
      }
    } else if (contextMenu.nodeType === "trigger") {
      // Find container for the trigger
      const findContainerId = (
        items: typeof sequence.startItems,
      ): string | null => {
        for (const item of items) {
          if (item.triggers?.some((t) => t.id === contextMenu.nodeId)) {
            return item.id;
          }
          if (item.items) {
            const found = findContainerId(item.items);
            if (found) return found;
          }
        }
        return null;
      };
      const containerId =
        findContainerId(sequence.startItems) ||
        findContainerId(sequence.targetItems) ||
        findContainerId(sequence.endItems);
      if (containerId) {
        deleteTrigger(containerId, contextMenu.nodeId);
      }
    }
    closeContextMenu();
  }, [
    contextMenu,
    deleteItem,
    deleteCondition,
    deleteTrigger,
    sequence,
    closeContextMenu,
  ]);

  const handleContextMenuDuplicate = useCallback(() => {
    if (!contextMenu || contextMenu.nodeType !== "item") return;
    duplicateItem(contextMenu.nodeId);
    closeContextMenu();
  }, [contextMenu, duplicateItem, closeContextMenu]);

  // Toggle enabled/disabled
  const handleContextMenuToggleEnabled = useCallback(() => {
    if (!contextMenu || contextMenu.nodeType !== "item") return;
    toggleItemEnabled(contextMenu.nodeId);
    closeContextMenu();
  }, [contextMenu, toggleItemEnabled, closeContextMenu]);

  // Move to area
  const handleMoveToArea = useCallback(
    (area: "start" | "target" | "end") => {
      if (!contextMenu || contextMenu.nodeType !== "item") return;
      moveItemToArea(contextMenu.nodeId, area);
      closeContextMenu();
    },
    [contextMenu, moveItemToArea, closeContextMenu],
  );

  // Alignment handlers
  const handleAlign = useCallback(
    (alignment: AlignmentType) => {
      if (selectedItemIds.length < 2) return;
      const nodeIds = selectedItemIds.map((id) => `node-${id}`);
      const alignedNodes = alignNodes(nodes, nodeIds, alignment);
      setNodes(alignedNodes);
    },
    [selectedItemIds, nodes, setNodes],
  );

  const handleDistribute = useCallback(
    (direction: DistributeType) => {
      if (selectedItemIds.length < 3) return;
      const nodeIds = selectedItemIds.map((id) => `node-${id}`);
      const distributedNodes = distributeNodes(nodes, nodeIds, direction);
      setNodes(distributedNodes);
    },
    [selectedItemIds, nodes, setNodes],
  );

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut();
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2 });
  }, [reactFlowInstance]);

  const handleResetView = useCallback(() => {
    reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
  }, [reactFlowInstance]);

  // Auto-layout handlers
  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = autoLayoutNodes(nodes, edges, {
      direction: "TB",
      nodeSpacing: 50,
      rankSpacing: 80,
    });
    setNodes(layoutedNodes);
    setTimeout(() => reactFlowInstance.fitView({ padding: 0.2 }), 50);
  }, [nodes, edges, setNodes, reactFlowInstance]);

  const handleCompactLayout = useCallback(() => {
    const layoutedNodes = compactLayout(nodes, edges);
    setNodes(layoutedNodes);
    setTimeout(() => reactFlowInstance.fitView({ padding: 0.2 }), 50);
  }, [nodes, edges, setNodes, reactFlowInstance]);

  const handleSpreadLayout = useCallback(() => {
    const layoutedNodes = spreadLayout(nodes, edges);
    setNodes(layoutedNodes);
    setTimeout(() => reactFlowInstance.fitView({ padding: 0.2 }), 50);
  }, [nodes, edges, setNodes, reactFlowInstance]);

  const handleHorizontalLayout = useCallback(() => {
    const layoutedNodes = horizontalLayout(nodes, edges);
    setNodes(layoutedNodes);
    setTimeout(() => reactFlowInstance.fitView({ padding: 0.2 }), 50);
  }, [nodes, edges, setNodes, reactFlowInstance]);

  const handleSmartLayout = useCallback(() => {
    const layoutedNodes = smartLayout(nodes, edges, {
      direction: "TB",
      nodeSpacing: 50,
      rankSpacing: 80,
    });
    setNodes(layoutedNodes);
    setTimeout(() => reactFlowInstance.fitView({ padding: 0.2 }), 50);
  }, [nodes, edges, setNodes, reactFlowInstance]);

  // Handle node drag with grid snap
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (gridSnapEnabled) {
        const snappedPosition = snapToGrid(node.position, gridSize);
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id ? { ...n, position: snappedPosition } : n,
          ),
        );
      }
    },
    [gridSnapEnabled, gridSize, setNodes],
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={handlePaneClick}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        onMove={(_, viewport) => setZoomLevel(Math.round(viewport.zoom * 100))}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Control"
        snapToGrid={gridSnapEnabled}
        snapGrid={[gridSize, gridSize] as [number, number]}
        defaultEdgeOptions={{
          type: "bezier",
          style: { stroke: "#64748b", strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-background"
      >
        <Background
          color={showAreaBackgrounds ? "#334155" : "#1e293b"}
          gap={gridSnapEnabled ? gridSize : 20}
          size={1}
          variant={
            gridSnapEnabled ? BackgroundVariant.Dots : BackgroundVariant.Lines
          }
        />

        <Controls
          showZoom={false}
          showFitView={false}
          showInteractive={false}
          className="hidden"
        />

        {showMinimap && (
          <MiniMap
            nodeColor={(node) => {
              if (node.type === "container") return "#3b82f6";
              if (node.type === "condition") return "#eab308";
              if (node.type === "trigger") return "#a855f7";
              if (node.type === "areaStart" || node.type === "areaEnd")
                return "#22c55e";
              return "#64748b";
            }}
            maskColor="rgba(0, 0, 0, 0.7)"
            className="bg-card! border! border-border! rounded-lg!"
            pannable
            zoomable
          />
        )}

        {/* Custom Controls Panel */}
        <TooltipProvider delayDuration={300}>
          <Panel
            position="bottom-left"
            className="flex gap-1 bg-card/90 backdrop-blur-sm p-1 rounded-lg border border-border shadow-lg"
          >
            {/* Undo/Redo */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  disabled={!canUndo}
                  className="h-8 w-8 p-0"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t.editor.undo} (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={redo}
                  disabled={!canRedo}
                  className="h-8 w-8 p-0"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t.editor.redo} (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-6 mx-0.5" />
            {/* Zoom controls */}
            {/* Clipboard Actions */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copySelectedItems}
                  disabled={selectedItemIds.length === 0 && !selectedItemId}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t.shortcuts?.copy || "Copy"} (Ctrl+C)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cutSelectedItems}
                  disabled={selectedItemIds.length === 0 && !selectedItemId}
                  className="h-8 w-8 p-0"
                >
                  <Scissors className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t.shortcuts?.cut || "Cut"} (Ctrl+X)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => pasteItems()}
                  disabled={!hasClipboard()}
                  className="h-8 w-8 p-0"
                >
                  <ClipboardPaste className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t.shortcuts?.paste || "Paste"} (Ctrl+V)</p>
              </TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-6 mx-0.5" />

            {/* Zoom Controls */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t.workflow?.zoomIn || "Zoom In"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Zoom Level Display */}
            <span className="text-xs text-muted-foreground tabular-nums min-w-[40px] text-center">
              {zoomLevel}%
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="h-8 w-8 p-0"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t.workflow?.zoomOut || "Zoom Out"}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFitView}
                  className="h-8 w-8 p-0"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t.workflow?.fitView || "Fit View"}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetView}
                  className="h-8 w-8 p-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t.workflow?.resetView || "Reset View"}</p>
              </TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-6 mx-0.5" />
            {/* Layout dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuLabel className="text-xs">
                  {t.workflow?.autoLayout || "Layout Options"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSmartLayout}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>{t.workflow?.layoutSmart || "Smart"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAutoLayout}>
                  <ArrowDownUp className="w-4 h-4 mr-2" />
                  <span>{t.workflow?.layoutStandard || "Standard"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCompactLayout}>
                  <Minimize2 className="w-4 h-4 mr-2" />
                  <span>{t.workflow?.layoutCompact || "Compact"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSpreadLayout}>
                  <Maximize className="w-4 h-4 mr-2" />
                  <span>{t.workflow?.layoutSpread || "Spread"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleHorizontalLayout}>
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  <span>{t.workflow?.layoutHorizontal || "Horizontal"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    <Label
                      htmlFor="auto-layout"
                      className="text-sm cursor-pointer"
                    >
                      {t.workflow?.autoRefresh || "Auto Refresh"}
                    </Label>
                  </div>
                  <Switch
                    id="auto-layout"
                    checked={autoLayoutEnabled}
                    onCheckedChange={setAutoLayoutEnabled}
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Alignment dropdown (only when multi-selected) */}
            {selectedItemIds.length >= 2 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <AlignCenterVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel className="text-xs">
                    {t.workflow?.align || "Align"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleAlign("left")}>
                    <AlignStartVertical className="w-4 h-4 mr-2" />
                    <span>{t.workflow?.alignLeft || "Left"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAlign("center")}>
                    <AlignCenterVertical className="w-4 h-4 mr-2" />
                    <span>{t.workflow?.alignCenter || "Center"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAlign("right")}>
                    <AlignEndVertical className="w-4 h-4 mr-2" />
                    <span>{t.workflow?.alignRight || "Right"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleAlign("top")}>
                    <AlignStartHorizontal className="w-4 h-4 mr-2" />
                    <span>{t.workflow?.alignTop || "Top"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAlign("middle")}>
                    <AlignCenterHorizontal className="w-4 h-4 mr-2" />
                    <span>{t.workflow?.alignMiddle || "Middle"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAlign("bottom")}>
                    <AlignEndHorizontal className="w-4 h-4 mr-2" />
                    <span>{t.workflow?.alignBottom || "Bottom"}</span>
                  </DropdownMenuItem>
                  {selectedItemIds.length >= 3 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs">
                        {t.workflow?.distribute || "Distribute"}
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleDistribute("horizontal")}
                      >
                        <GalleryHorizontal className="w-4 h-4 mr-2" />
                        <span>{t.workflow?.distributeH || "Horizontal"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDistribute("vertical")}
                      >
                        <GalleryVertical className="w-4 h-4 mr-2" />
                        <span>{t.workflow?.distributeV || "Vertical"}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Separator orientation="vertical" className="h-6 mx-0.5" />

            {/* Settings dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings2 className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuLabel className="text-xs">
                  {t.workflow?.viewSettings || "View Settings"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                    <Label
                      htmlFor="grid-snap"
                      className="text-sm cursor-pointer"
                    >
                      {t.workflow?.gridSnap || "Grid Snap"}
                    </Label>
                  </div>
                  <Switch
                    id="grid-snap"
                    checked={gridSnapEnabled}
                    onCheckedChange={setGridSnapEnabled}
                  />
                </div>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4 text-muted-foreground" />
                    <Label
                      htmlFor="show-minimap"
                      className="text-sm cursor-pointer"
                    >
                      {t.workflow?.showMinimap || "Minimap"}
                    </Label>
                  </div>
                  <Switch
                    id="show-minimap"
                    checked={showMinimap}
                    onCheckedChange={setShowMinimap}
                  />
                </div>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    {showAreaBackgrounds ? (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <Label htmlFor="area-bg" className="text-sm cursor-pointer">
                      {t.workflow?.areaBackgrounds || "Area Colors"}
                    </Label>
                  </div>
                  <Switch
                    id="area-bg"
                    checked={showAreaBackgrounds}
                    onCheckedChange={setShowAreaBackgrounds}
                  />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowShortcuts(true)}>
                  <Keyboard className="w-4 h-4 mr-2" />
                  <span>{t.workflow?.shortcuts || "Shortcuts"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Selection info */}
            {selectedItemIds.length > 1 && (
              <div className="flex items-center gap-1 px-2 text-xs text-muted-foreground">
                <span>
                  {selectedItemIds.length} {t.workflow?.selected || "selected"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteSelectedItems}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={duplicateSelectedItems}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            )}
          </Panel>
        </TooltipProvider>

        {/* Info Panel */}
        <Panel
          position="top-right"
          className="bg-card/90 backdrop-blur-sm p-2 rounded-lg border border-border shadow-lg"
        >
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span>{t.editor.startInstructions}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>{t.editor.targetInstructions}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span>{t.editor.endInstructions}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span>{t.toolbox.conditions}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span>{t.toolbox.triggers}</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* Custom Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 min-w-[180px] bg-popover text-popover-foreground border rounded-md shadow-lg p-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.nodeType === "item" && (
            <>
              <button
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                onClick={handleContextMenuDuplicate}
              >
                <Copy className="w-4 h-4" />
                {t.common.duplicate}
                <span className="ml-auto text-xs text-muted-foreground">
                  Ctrl+D
                </span>
              </button>
              <button
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                onClick={handleContextMenuToggleEnabled}
              >
                <Power className="w-4 h-4" />
                {t.workflow.toggleEnabled}
              </button>
              <div className="h-px bg-border my-1" />
              <div className="px-2 py-1 text-xs text-muted-foreground">
                {t.workflow.moveToStart}
              </div>
              <button
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleMoveToArea("start")}
              >
                <MoveRight className="w-4 h-4" />
                {t.editor.startInstructions}
              </button>
              <button
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleMoveToArea("target")}
              >
                <MoveRight className="w-4 h-4" />
                {t.editor.targetInstructions}
              </button>
              <button
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleMoveToArea("end")}
              >
                <MoveRight className="w-4 h-4" />
                {t.editor.endInstructions}
              </button>
              <div className="h-px bg-border my-1" />
            </>
          )}
          <button
            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-destructive/10 text-destructive"
            onClick={handleContextMenuDelete}
          >
            <Trash2 className="w-4 h-4" />
            {t.common.delete}
            <span className="ml-auto text-xs text-muted-foreground">Del</span>
          </button>
        </div>
      )}

      {/* Keyboard Shortcuts Dialog */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-card border rounded-lg shadow-xl p-4 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3">{t.shortcuts.title}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t.shortcuts.undo}</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">
                  Ctrl+Z
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>{t.shortcuts.redo}</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">
                  Ctrl+Y
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>{t.shortcuts.delete}</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">
                  Delete
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>{t.shortcuts.duplicate}</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">
                  Ctrl+D
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Multi-select</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">
                  Ctrl+Click
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Box select</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Drag</kbd>
              </div>
            </div>
            <button
              className="mt-4 w-full py-2 bg-primary text-primary-foreground rounded-md text-sm"
              onClick={() => setShowShortcuts(false)}
            >
              {t.common.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Main component with provider
export function WorkflowView() {
  return (
    <ReactFlowProvider>
      <WorkflowViewInner />
    </ReactFlowProvider>
  );
}
