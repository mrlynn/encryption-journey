"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { TraceEvent } from "@/types/trace";
import { getActorColor, getNodeStateColor } from "@/lib/colors";

interface DriverNodeData {
  label: string;
  actor: string;
  description: string;
  isActive: boolean;
  lastEvent?: TraceEvent;
  glowIntensity: number;
}

export const DriverNode = memo(({ data, selected }: NodeProps) => {
  const { label, description, isActive, lastEvent, glowIntensity } = (data as unknown as DriverNodeData) || {};

  const nodeColor = getActorColor("driver");
  const stateColor = getNodeStateColor(isActive);

  return (
    <motion.div
      className="relative"
      animate={{
        boxShadow: isActive
          ? `0 0 ${20 + glowIntensity * 10}px ${nodeColor}50`
          : "0 0 0px transparent",
      }}
      style={{
        willChange: "box-shadow, filter"
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
          <div className="text-2xl">🔌</div>
          <div>
            <h3 className="font-bold text-lg text-primary">{label}</h3>
            <p className="text-sm text-neutral-400">{description}</p>
          </div>
        </div>

        {/* Current Event Info */}
        {lastEvent && (
          <div className="space-y-2">
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
              Operation
            </div>
            <div className="text-sm text-neutral-200">
              {lastEvent.verb.toUpperCase()} {lastEvent.dataset}
            </div>
            <div className="text-xs text-neutral-400">
              {lastEvent.phase.replace(/_/g, " ")}
            </div>
          </div>
        )}

        {/* Driver Status */}
        <div className="mt-3 space-y-1">
          <div className="text-xs text-neutral-500 uppercase tracking-wide">
            Connection
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isActive ? "bg-primary animate-pulse" : "bg-neutral-500"
              }`}
            />
            <span className="text-xs text-neutral-300">
              {isActive ? "Active" : "Standby"}
            </span>
          </div>
        </div>

        {/* Protocol Info */}
        {lastEvent && lastEvent.meta && (
          <div className="mt-3 space-y-1">
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
              Protocol
            </div>
            <div className="text-xs text-neutral-300 font-mono">
              {String(lastEvent.meta?.driver || "mongodb-php-driver")}
            </div>
            <div className="text-xs text-neutral-400">
              v{String(lastEvent.meta?.version || "1.0.0")}
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

DriverNode.displayName = "DriverNode";
