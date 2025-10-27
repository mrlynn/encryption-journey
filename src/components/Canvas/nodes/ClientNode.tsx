"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { TraceEvent } from "@/types/trace";
import { getActorColor, getNodeStateColor } from "@/lib/colors";

interface ClientNodeData {
  label: string;
  actor: string;
  description: string;
  isActive: boolean;
  lastEvent?: TraceEvent;
  glowIntensity: number;
}

export const ClientNode = memo(({ data, selected }: NodeProps) => {
  const { label, description, isActive, lastEvent, glowIntensity } = (data as unknown as ClientNodeData) || {};

  const nodeColor = getActorColor("client");
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
          <div className="text-2xl">🌐</div>
          <div>
            <h3 className="font-bold text-lg text-primary">{label}</h3>
            <p className="text-sm text-neutral-400">{description}</p>
          </div>
        </div>

        {/* Current Event Info */}
        {lastEvent && (
          <div className="space-y-2">
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
              Current Action
            </div>
            <div className="text-sm text-neutral-200">
              {lastEvent.verb} {lastEvent.dataset}
            </div>
            <div className="text-xs text-neutral-400">
              {lastEvent.phase.replace(/_/g, " ")}
            </div>
          </div>
        )}

        {/* Field Encryption Status */}
        {lastEvent && lastEvent.fields && (
          <div className="mt-3 space-y-1">
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
              Fields
            </div>
            <div className="flex flex-wrap gap-1">
              {lastEvent.fields.slice(0, 3).map((field, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded text-xs font-mono ${
                    field.encryption === "qe"
                      ? "bg-primary/20 text-primary"
                      : field.encryption === "det"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : field.encryption === "rand"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-neutral-500/20 text-neutral-400"
                  }`}
                >
                  {field.encryption.toUpperCase()}
                </span>
              ))}
              {lastEvent.fields.length > 3 && (
                <span className="px-2 py-1 rounded text-xs bg-neutral-500/20 text-neutral-400">
                  +{lastEvent.fields.length - 3}
                </span>
              )}
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

ClientNode.displayName = "ClientNode";
