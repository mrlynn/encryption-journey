import { Node, Edge, Position } from "@xyflow/react";

// Node positions for the encryption journey flow - Increased spacing for better visibility
export const NODE_POSITIONS = {
  client: { x: 150, y: 250 },
  api: { x: 550, y: 250 },
  driver: { x: 950, y: 250 },
  mongo: { x: 1350, y: 250 },
} as const;

// Node types
export const NODE_TYPES = {
  client: "client",
  api: "api", 
  driver: "driver",
  mongo: "mongo",
} as const;

// Edge types
export const EDGE_TYPES = {
  default: "default",
  animated: "animated",
} as const;

// Default node configuration
export function createDefaultNodes(): Node[] {
  return [
    {
      id: "client",
      type: NODE_TYPES.client,
      position: NODE_POSITIONS.client,
      data: {
        label: "Client",
        actor: "client",
        description: "Browser/Frontend",
        isActive: false,
      },
    },
    {
      id: "api",
      type: NODE_TYPES.api,
      position: NODE_POSITIONS.api,
      data: {
        label: "API",
        actor: "api",
        description: "Symfony Backend",
        isActive: false,
      },
    },
    {
      id: "driver",
      type: NODE_TYPES.driver,
      position: NODE_POSITIONS.driver,
      data: {
        label: "Driver",
        actor: "driver",
        description: "MongoDB PHP Driver",
        isActive: false,
      },
    },
    {
      id: "mongo",
      type: NODE_TYPES.mongo,
      position: NODE_POSITIONS.mongo,
      data: {
        label: "MongoDB",
        actor: "mongo",
        description: "Database",
        isActive: false,
      },
    },
  ];
}

// Default edge configuration
export function createDefaultEdges(): Edge[] {
  return [
    {
      id: "client-api",
      source: "client",
      target: "api",
      type: EDGE_TYPES.animated,
      data: {
        label: "HTTPS Request",
        isActive: false,
      },
    },
    {
      id: "api-driver",
      source: "api",
      target: "driver",
      type: EDGE_TYPES.animated,
      data: {
        label: "Driver Call",
        isActive: false,
      },
    },
    {
      id: "driver-mongo",
      source: "driver",
      target: "mongo",
      type: EDGE_TYPES.animated,
      data: {
        label: "MongoDB Protocol",
        isActive: false,
      },
    },
  ];
}

// Calculate edge path for animation
export function calculateEdgePath(source: Position, target: Position): string {
  const dx = (target as any).x - (source as any).x;
  const dy = (target as any).y - (source as any).y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Create a smooth curve
  const controlPointOffset = distance * 0.3;
  const controlPoint1 = {
    x: (source as any).x + controlPointOffset,
    y: (source as any).y,
  };
  const controlPoint2 = {
    x: (target as any).x - controlPointOffset,
    y: (target as any).y,
  };
  
  return `M ${(source as any).x} ${(source as any).y} C ${controlPoint1.x} ${controlPoint1.y} ${controlPoint2.x} ${controlPoint2.y} ${(target as any).x} ${(target as any).y}`;
}

// Get node position by actor
export function getNodePositionByActor(actor: string): Position {
  switch (actor) {
    case "client":
      return NODE_POSITIONS.client as unknown as Position;
    case "api":
      return NODE_POSITIONS.api as unknown as Position;
    case "driver":
      return NODE_POSITIONS.driver as unknown as Position;
    case "mongo":
      return NODE_POSITIONS.mongo as unknown as Position;
    default:
      return { x: 0, y: 0 } as unknown as Position;
  }
}

// Calculate viewport dimensions for responsive layout
export function calculateViewportDimensions(containerWidth: number, containerHeight: number) {
  const padding = 50;
  const nodeWidth = 200;
  const nodeHeight = 100;
  
  return {
    width: Math.max(containerWidth - padding * 2, 1200),
    height: Math.max(containerHeight - padding * 2, 400),
    minZoom: 0.5,
    maxZoom: 2,
    defaultZoom: 1,
  };
}

// Auto-layout using simple horizontal arrangement
export function autoLayoutNodes(nodes: Node[]): Node[] {
  const nodeWidth = 200;
  const nodeHeight = 100;
  const spacing = 400; // Increased spacing to match NODE_POSITIONS
  const startX = 150;
  const y = 250;
  
  return nodes.map((node, index) => ({
    ...node,
    position: {
      x: startX + index * spacing,
      y,
    },
  }));
}

// Calculate edge animation progress
export function calculateAnimationProgress(
  startTime: number,
  duration: number,
  currentTime: number
): number {
  const elapsed = currentTime - startTime;
  return Math.min(elapsed / duration, 1);
}

// Get edge direction for animation
export function getEdgeDirection(source: string, target: string): "forward" | "backward" {
  const order = ["client", "api", "driver", "mongo"];
  const sourceIndex = order.indexOf(source);
  const targetIndex = order.indexOf(target);
  
  return sourceIndex < targetIndex ? "forward" : "backward";
}
