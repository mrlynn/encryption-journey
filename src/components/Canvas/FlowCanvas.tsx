"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeTypes,
  EdgeTypes,
  ConnectionMode,
  BackgroundVariant,
  MiniMap,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AnimatePresence } from "framer-motion";

import { TraceSession, TraceEvent, PlaybackState, NodeState } from "@/types/trace";
import { createDefaultNodes, createDefaultEdges } from "@/lib/layout";
import { ClientNode } from "./nodes/ClientNode";
import { ApiNode } from "./nodes/ApiNode";
import { DriverNode } from "./nodes/DriverNode";
import { MongoNode } from "./nodes/MongoNode";
import { AnimatedEdge } from "./edges/AnimatedEdge";
import { MagnifyingGlass } from "@/components/MagnifyingGlass/MagnifyingGlass";

// Define custom data types
interface NodeData {
  label: string;
  actor: string;
  description: string;
  isActive: boolean;
  lastEvent?: TraceEvent;
  glowIntensity: number;
}

interface EdgeData {
  label?: string;
  isActive: boolean;
  lastEvent?: TraceEvent;
  animationProgress: number;
}

// Custom node types
const nodeTypes: NodeTypes = {
  client: ClientNode,
  api: ApiNode,
  driver: DriverNode,
  mongo: MongoNode,
};

// Custom edge types
const edgeTypes: EdgeTypes = {
  animated: AnimatedEdge,
};

interface FlowCanvasProps {
  session: TraceSession;
  playbackState: PlaybackState;
  selectedEvent: TraceEvent | null;
  onEventSelect: (event: TraceEvent, index: number) => void;
}

export function FlowCanvas({
  session,
  playbackState,
  selectedEvent,
  onEventSelect,
  onReactFlowInstanceChange,
}: FlowCanvasProps & {
  onReactFlowInstanceChange?: (instance: any) => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(createDefaultNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(createDefaultEdges());

  // Visualization control states
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots);
  const [secondaryBackground, setSecondaryBackground] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showSettingsPanel, setShowSettingsPanel] = useState<boolean>(false);

  // Magnifying glass states
  const [magnifyingGlassActive, setMagnifyingGlassActive] = useState<boolean>(false);
  const [hoverEdge, setHoverEdge] = useState<Edge | null>(null);
  const [hoverEvent, setHoverEvent] = useState<TraceEvent | null>(null);

  // Check if an edge should be active based on the current event
  const isEdgeActive = useCallback((edge: Edge, event: TraceEvent): boolean => {
    const { source, target } = edge;
    const { actor, phase } = event;

    // Map actors to node IDs
    const actorToNodeId: Record<string, string> = {
      client: "client",
      api: "api",
      driver: "driver",
      mongo: "mongo",
    };

    const eventNodeId = actorToNodeId[actor];
    if (!eventNodeId) return false;

    // Check if the edge is part of the current flow
    switch (phase) {
      case "CLIENT_ENCRYPT":
        return source === "client" && target === "api";
      case "API_RECEIVE":
        return source === "client" && target === "api";
      case "DRIVER_SEND":
        return source === "api" && target === "driver";
      case "MONGO_MATCH_QE":
      case "MONGO_STORE":
      case "MONGO_READ":
        return source === "driver" && target === "mongo";
      case "DRIVER_RECEIVE":
        return source === "driver" && target === "mongo";
      case "API_RESPOND":
        return source === "api" && target === "driver";
      case "CLIENT_DECRYPT":
        return source === "client" && target === "api";
      default:
        return false;
    }
  }, []);

  // Update node states based on current event
  useEffect(() => {
    if (!selectedEvent) return;

    setNodes((nds) =>
      nds.map((node) => {
        // Use type assertion after spreading to avoid direct assignment issues
        const nodeData = node.data as Record<string, unknown>;
        const isActive = nodeData.actor === selectedEvent.actor;
        // Only update if the state has changed to prevent infinite loops
        if (nodeData.isActive === isActive && (nodeData.lastEvent as TraceEvent | undefined)?.id === selectedEvent.id) {
          return node;
        }
        return {
          ...node,
          data: {
            ...nodeData,
            isActive,
            lastEvent: isActive ? selectedEvent : nodeData.lastEvent,
            glowIntensity: isActive ? 1 : 0,
          },
        };
      })
    );
  }, [selectedEvent?.id, selectedEvent?.actor, setNodes]);

  // Update edge states based on current event
  useEffect(() => {
    if (!selectedEvent) return;

    setEdges((eds) =>
      eds.map((edge) => {
        const isActive = isEdgeActive(edge, selectedEvent);
        const edgeData = (edge.data || {}) as Record<string, unknown>;
        // Only update if the state has changed to prevent infinite loops
        if (edgeData.isActive === isActive && (edgeData.lastEvent as TraceEvent | undefined)?.id === selectedEvent.id) {
          return edge;
        }
        return {
          ...edge,
          data: {
            ...edgeData,
            isActive,
            lastEvent: isActive ? selectedEvent : edgeData.lastEvent,
            animationProgress: isActive ? 1 : 0,
          },
        };
      })
    );
  }, [selectedEvent?.id, selectedEvent?.actor, selectedEvent?.phase, setEdges, isEdgeActive]);

  // Handle node click
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const nodeData = node.data as Record<string, unknown>;
      // Find the most recent event for this actor
      const actorEvents = session.events.filter(
        (e) => e.actor === nodeData.actor
      );
      if (actorEvents.length > 0) {
        const latestEvent = actorEvents[actorEvents.length - 1];
        const eventIndex = session.events.indexOf(latestEvent);
        onEventSelect(latestEvent, eventIndex);
      }
    },
    [session.events, onEventSelect]
  );

  // Handle edge click
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      // Find events that involve this edge
      const edgeEvents = session.events.filter((e) =>
        isEdgeActive(edge, e)
      );
      if (edgeEvents.length > 0) {
        const latestEvent = edgeEvents[edgeEvents.length - 1];
        const eventIndex = session.events.indexOf(latestEvent);
        onEventSelect(latestEvent, eventIndex);
      }
    },
    [session.events, isEdgeActive, onEventSelect]
  );

  // Handle viewport change to track zoom
  const handleViewportChange = useCallback((viewport: { zoom: number }) => {
    setZoomLevel(viewport.zoom);
  }, []);

  // Handle edge hover to show data in magnifying glass
  const onEdgeMouseEnter = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      if (!magnifyingGlassActive) return;

      setHoverEdge(edge);

      // Get the event data associated with this edge
      const edgeData = (edge.data || {}) as Record<string, unknown>;
      const eventData = edgeData.lastEvent as TraceEvent | undefined;

      if (eventData) {
        setHoverEvent(eventData);
      }
    },
    [magnifyingGlassActive]
  );

  // Handle edge mouse leave
  const onEdgeMouseLeave = useCallback(() => {
    setHoverEdge(null);
    setHoverEvent(null);
  }, []);

  return (
    <div
      className="w-full h-full bg-mongo-dark-900 relative overflow-hidden"
      style={{ contain: "layout style paint" }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-mongo-dark-900 via-transparent to-accent/10 pointer-events-none"></div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        minZoom={0.5}
        maxZoom={2}
        attributionPosition="bottom-left"
        onViewportChange={handleViewportChange}
        onInit={onReactFlowInstanceChange}
        fitView={false}
        preventScrolling={true}
        zoomOnScroll={false}
        nodesDraggable={false}
      >
        {/* Background patterns */}
        {showGrid && (
          <>
            <Background
              variant={backgroundVariant || BackgroundVariant.Dots}
              gap={typeof backgroundVariant === 'undefined' || backgroundVariant === BackgroundVariant.Dots ? 20 : 80}
              size={typeof backgroundVariant === 'undefined' || backgroundVariant === BackgroundVariant.Dots ? 1 : 0.5}
              color="#00684A"
              className="opacity-20"
            />
            {secondaryBackground && (
              <Background
                variant={BackgroundVariant.Lines}
                gap={80}
                size={0.5}
                color="#00ED64"
                className="opacity-10"
              />
            )}
          </>
        )}

        {/* Controls */}
        {showControls && (
          <Controls
            className="bg-mongo-dark-800 border border-accent/20"
            showInteractive={false}
          />
        )}

        {/* Mini Map */}
        {showMiniMap && (
          <MiniMap
            nodeStrokeColor={(node) => {
              const actor = node.data?.actor;
              if (actor === 'client') return '#4ECDC4';
              if (actor === 'api') return '#45B7D1';
              if (actor === 'driver') return '#96CEB4';
              if (actor === 'mongo') return '#FECA57';
              return '#00ED64';
            }}
            nodeColor={(node) => {
              const isActive = node.data?.isActive;
              const actor = node.data?.actor;
              if (isActive) return '#00ED64';
              if (actor === 'client') return '#4ECDC433';
              if (actor === 'api') return '#45B7D133';
              if (actor === 'driver') return '#96CEB433';
              if (actor === 'mongo') return '#FECA5733';
              return '#00684A33';
            }}
            maskStrokeColor="#00684A"
            maskColor="#001E2B80"
            className="bg-mongo-dark-800 border border-accent/20 rounded"
          />
        )}

        {/* Settings Button - Top Right */}
        <Panel position="top-right" className="mr-2 mt-2">
          <button
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            className="bg-mongo-dark-800 hover:bg-mongo-dark-700 border border-accent/20 text-neutral-300 rounded p-2 text-xs shadow-md transition-colors"
            title="Visualization Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
            </svg>
          </button>
        </Panel>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettingsPanel && (
            <Panel position="top-right" className="mr-2 mt-12 w-64 bg-mongo-dark-800 border border-accent/20 rounded-lg shadow-xl p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-neutral-200">Settings</h3>
                  <button
                    onClick={() => setShowSettingsPanel(false)}
                    className="text-neutral-400 hover:text-neutral-200 text-xs"
                  >
                    ×
                  </button>
                </div>

                {/* Toggle MiniMap */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-neutral-400">Mini Map</label>
                  <button
                    onClick={() => setShowMiniMap(!showMiniMap)}
                    className={`w-10 h-5 rounded-full ${showMiniMap ? 'bg-primary' : 'bg-neutral-600'} relative transition-colors`}
                  >
                    <span className={`absolute w-4 h-4 rounded-full bg-white top-0.5 transition-transform ${showMiniMap ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Toggle Grid */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-neutral-400">Grid</label>
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`w-10 h-5 rounded-full ${showGrid ? 'bg-primary' : 'bg-neutral-600'} relative transition-colors`}
                  >
                    <span className={`absolute w-4 h-4 rounded-full bg-white top-0.5 transition-transform ${showGrid ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Toggle Controls */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-neutral-400">Nav Controls</label>
                  <button
                    onClick={() => setShowControls(!showControls)}
                    className={`w-10 h-5 rounded-full ${showControls ? 'bg-primary' : 'bg-neutral-600'} relative transition-colors`}
                  >
                    <span className={`absolute w-4 h-4 rounded-full bg-white top-0.5 transition-transform ${showControls ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Toggle Magnifying Glass */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-neutral-400">Magnifying Glass</label>
                  <button
                    onClick={() => setMagnifyingGlassActive(!magnifyingGlassActive)}
                    className={`w-10 h-5 rounded-full ${magnifyingGlassActive ? 'bg-primary' : 'bg-neutral-600'} relative transition-colors`}
                  >
                    <span className={`absolute w-4 h-4 rounded-full bg-white top-0.5 transition-transform ${magnifyingGlassActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </Panel>
          )}
        </AnimatePresence>
      </ReactFlow>

      {/* Magnifying glass overlay */}
      <MagnifyingGlass
        isActive={magnifyingGlassActive}
        hoverEvent={hoverEvent}
        showCiphertext={playbackState.showCiphertext}
      />
    </div>
  );
}
