"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { TraceEvent } from "@/types/trace";
import { getActorColor } from "@/lib/colors";

interface MongoNodeData {
  label: string;
  actor: string;
  description: string;
  isActive: boolean;
  lastEvent?: TraceEvent;
  glowIntensity: number;
}

export const MongoNode = memo(({ data, selected }: NodeProps) => {
  const { label, description, isActive, lastEvent, glowIntensity } = (data as unknown as MongoNodeData) || {};
  const nodeColor = getActorColor("mongo");

  return (
    <motion.div
      className="relative"
      animate={{
        boxShadow: isActive
          ? `0 0 ${10 + glowIntensity * 5}px ${nodeColor}30`
          : "0 0 0px transparent",
      }}
      style={{
        willChange: "box-shadow, filter"
      }}
      transition={{ duration: 0.3 }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 bg-accent border-2 border-mongo-dark-900 transition-colors duration-300 ${isActive ? "w-3 h-3" : ""}`}
        style={{
          boxShadow: isActive ? "0 0 5px #45B7D1" : "none",
        }}
      />

      <div
        className={`px-6 py-4 rounded-2xl border-2 min-w-[200px] backdrop-blur-sm transition-colors duration-300 ${
          isActive
            ? "border-primary bg-primary/10"
            : "border-accent/20 bg-mongo-dark-700"
        }`}
      >
        {/* Node Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">
            🍃
          </div>
          <div>
            <h3 className="font-bold text-lg text-primary">
              {label}
            </h3>
            <p className="text-sm text-neutral-400">
              {description}
            </p>
          </div>
        </div>

        {/* Current Event Info */}
        {lastEvent && (
          <div className="space-y-2">
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
              Operation
            </div>
            <div className="text-sm text-neutral-200">
              <span className="font-mono">
                {lastEvent.verb.toUpperCase()} {lastEvent.dataset}
              </span>
            </div>
            <div className="text-xs text-neutral-400">
              {lastEvent.phase.replace(/_/g, " ")}
            </div>
          </div>
        )}

        {/* Database Status */}
        <div className="mt-3 space-y-1">
          <div className="text-xs text-neutral-500 uppercase tracking-wide">
            Database
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? "bg-primary" : "bg-neutral-500"}`} />
            <span className={`text-xs ${isActive ? "text-primary font-medium" : "text-neutral-300"}`}>
              {isActive ? "Processing" : "Ready"}
            </span>
          </div>
        </div>

        {/* Collection Info */}
        {lastEvent && lastEvent.meta && (
          <div className="mt-3 space-y-1">
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
              Collection
            </div>
            <div className="text-xs text-neutral-300 font-mono">
              {String(lastEvent.meta?.collection || "patients")}
            </div>
            <div className="text-xs text-neutral-400">
              {String(lastEvent.meta?.database || "securehealth")}
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 bg-primary border-2 border-mongo-dark-900 transition-colors duration-300 ${isActive ? "w-3 h-3" : ""}`}
        style={{
          boxShadow: isActive ? "0 0 5px #00ED64" : "none",
        }}
      />
    </motion.div>
  );
});

MongoNode.displayName = "MongoNode";