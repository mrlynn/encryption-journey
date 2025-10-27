"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { TraceEvent } from "@/types/trace";
import { getActorColor, getNodeStateColor } from "@/lib/colors";

interface ApiNodeData {
  label: string;
  actor: string;
  description: string;
  isActive: boolean;
  lastEvent?: TraceEvent;
  glowIntensity: number;
}

export const ApiNode = memo(({ data, selected }: NodeProps) => {
  const { label, description, isActive, lastEvent, glowIntensity } = (data as unknown as ApiNodeData) || {};

  const nodeColor = getActorColor("api");
  const stateColor = getNodeStateColor(isActive);

  return (
    <motion.div
      className="relative"
      animate={{
        scale: isActive ? 1.05 : 1,
        boxShadow: isActive
          ? `0 0 ${20 + glowIntensity * 10}px ${nodeColor}50`
          : "0 0 0px transparent",
      }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`px-6 py-4 rounded-2xl border-2 min-w-[200px] ${
          isActive
            ? "border-primary bg-primary/10"
            : "border-accent/20 bg-mongo-dark-700"
        }`}
        style={{
          boxShadow: isActive
            ? `0 0 ${20 + glowIntensity * 10}px ${nodeColor}50`
            : undefined,
        }}
      >
        {/* Node Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">⚙️</div>
          <div>
            <h3 className="font-bold text-lg text-primary">{label}</h3>
            <p className="text-sm text-neutral-400">{description}</p>
          </div>
        </div>

        {/* Current Event Info */}
        {lastEvent && (
          <div className="space-y-2">
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
              Processing
            </div>
            <div className="text-sm text-neutral-200">
              {lastEvent.verb.toUpperCase()} /{lastEvent.dataset}
            </div>
            <div className="text-xs text-neutral-400">
              {lastEvent.phase.replace(/_/g, " ")}
            </div>
          </div>
        )}

        {/* API Status */}
        <div className="mt-3 space-y-1">
          <div className="text-xs text-neutral-500 uppercase tracking-wide">
            Status
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isActive ? "bg-primary animate-pulse" : "bg-neutral-500"
              }`}
            />
            <span className="text-xs text-neutral-300">
              {isActive ? "Processing" : "Idle"}
            </span>
          </div>
        </div>

        {/* Payload Size */}
        {lastEvent && lastEvent.payloadSizeBytes && (
          <div className="mt-3 space-y-1">
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
              Payload
            </div>
            <div className="text-xs text-neutral-300 font-mono">
              {formatBytes(lastEvent.payloadSizeBytes)}
            </div>
          </div>
        )}

        {/* Handles */}
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-primary border-2 border-mongo-dark-900"
        />
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-accent border-2 border-mongo-dark-900"
        />
      </div>
    </motion.div>
  );
});

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

ApiNode.displayName = "ApiNode";
