"use client";

import { memo } from "react";
import { EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { motion } from "framer-motion";
import { TraceEvent } from "@/types/trace";
import { getEdgeColor } from "@/lib/colors";

interface AnimatedEdgeData {
  label: string;
  isActive: boolean;
  lastEvent?: TraceEvent;
  animationProgress: number;
}

export const AnimatedEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps) => {
  // Use a larger border radius for smoother curves
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 30, // Increased border radius for smoother corners
  });

  const edgeData = (data as unknown as AnimatedEdgeData) || {};
  const { isActive = false, lastEvent, animationProgress = 0 } = edgeData;
  const hasEncryptedFields = lastEvent?.fields?.some(field => field.encryption !== "none") || false;
  
  const edgeColor = getEdgeColor(hasEncryptedFields, isActive);
  const strokeDasharray = hasEncryptedFields ? "5,5" : "none";

  return (
    <>
      {/* Main animated edge path */}
      <motion.path
        id={id}
        d={edgePath}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: isActive ? 3 : 2,
          strokeDasharray,
          fill: 'none', // Explicitly prevent any fill to avoid shading issues
        }}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{
          pathLength: 1, // Always animate to full path length for better connection
          opacity: isActive ? 1 : 0.6,
          strokeWidth: isActive ? 3 : 2,
        }}
        transition={{
          pathLength: { duration: 0.6, ease: "easeInOut" },
          opacity: { duration: 0.3 },
          strokeWidth: { duration: 0.2 }
        }}
      />

      {/* Animated data packet moving along the edge */}
      {isActive && (
        <>
          <motion.circle
            r="5"
            fill={edgeColor}
            filter="drop-shadow(0 0 2px rgba(255,255,255,0.5))"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration: 2,
              times: [0, 0.1, 0.9, 1],
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={edgePath}
            />
          </motion.circle>
          <motion.circle
            r="3"
            fill="white"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              duration: 2,
              times: [0, 0.1, 0.9, 1],
              repeat: Infinity,
              ease: "linear",
              delay: 0.5
            }}
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={edgePath}
              begin="0.5s"
            />
          </motion.circle>
        </>
      )}


      {markerEnd}
    </>
  );
});

AnimatedEdge.displayName = "AnimatedEdge";
