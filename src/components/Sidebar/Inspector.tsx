"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { TraceEvent } from "@/types/trace";
import { getPhaseColor, getActorColor } from "@/lib/colors";

interface InspectorProps {
  event: TraceEvent | null;
  showCiphertext: boolean;
  activeRole: string | null;
}

export const Inspector = memo(({ event, showCiphertext, activeRole }: InspectorProps) => {
  if (!event) {
    return (
      <div className="h-full bg-mongo-dark-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-neutral-500 mb-2">🔍</div>
          <p className="text-neutral-400">Select an event to inspect</p>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      time: date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 3,
      }),
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
  };

  const getEncryptionModeInfo = (mode: string) => {
    const modes: Record<string, { name: string; description: string; color: string }> = {
      qe: {
        name: "Queryable Encryption",
        description: "MongoDB's field-level encryption with query support",
        color: "text-primary",
      },
      det: {
        name: "Deterministic",
        description: "Same input always produces same ciphertext",
        color: "text-yellow-400",
      },
      rand: {
        name: "Randomized",
        description: "Same input produces different ciphertext each time",
        color: "text-red-400",
      },
      none: {
        name: "No Encryption",
        description: "Stored as plaintext",
        color: "text-neutral-400",
      },
    };
    return modes[mode] || { name: mode, description: "Unknown", color: "text-neutral-400" };
  };

  const { time, date } = formatTimestamp(event.ts);
  const phaseColor = getPhaseColor(event.phase);
  const actorColor = getActorColor(event.actor);

  return (
    <div className="h-full bg-mongo-dark-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-accent/20">
        <h3 className="text-lg font-semibold text-primary">Event Inspector</h3>
        <p className="text-sm text-neutral-400">Detailed event information</p>
      </div>

      {/* Event Details */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Basic Info */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
            Event Information
          </h4>

          <div className="space-y-1.5 bg-mongo-dark-700 rounded-lg p-2 border border-accent/10">
            <div className="flex justify-between">
              <span className="text-xs text-neutral-400">ID:</span>
              <span className="text-xs text-neutral-200 font-mono">{event.id.slice(0, 8)}...</span>
            </div>

            <div className="flex justify-between">
              <span className="text-xs text-neutral-400">Phase:</span>
              <span className="text-xs font-semibold" style={{ color: phaseColor }}>
                {event.phase.replace(/_/g, " ")}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-xs text-neutral-400">Actor:</span>
              <span className="text-xs font-semibold" style={{ color: actorColor }}>
                {event.actor.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-xs text-neutral-400">Action:</span>
              <span className="text-xs text-neutral-200">
                {event.verb.toUpperCase()} {event.dataset}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-xs text-neutral-400">Timestamp:</span>
              <div className="text-right">
                <div className="text-xs text-neutral-200">{time}</div>
                <div className="text-xs text-neutral-400">{date}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fields */}
        {event.fields && event.fields.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
              Fields ({event.fields.length})
            </h4>

            <div className="space-y-1.5">
              {event.fields.map((field, index) => {
                const modeInfo = getEncryptionModeInfo(field.encryption);

                return (
                  <motion.div
                    key={index}
                    className="bg-mongo-dark-700 rounded-lg p-2 border border-accent/10"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-neutral-200">
                        {field.name}
                      </span>
                      <span className={`text-xs font-semibold ${modeInfo.color}`}>
                        {modeInfo.name}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-400 mb-1">
                      {modeInfo.description}
                    </div>

                    {field.visibleSample && (
                      <div className="bg-mongo-dark-800 rounded p-1.5">
                        <div className="text-xs text-neutral-500 mb-0.5">Sample:</div>
                        <div className="text-xs font-mono text-neutral-300 truncate">
                          {showCiphertext ? "🔒 [ENCRYPTED]" : field.visibleSample}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Metadata */}
        {event.meta && Object.keys(event.meta).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
              Metadata
            </h4>

            <div className="bg-mongo-dark-700 rounded-lg p-2 border border-accent/10">
              <pre className="text-xs text-neutral-300 font-mono whitespace-pre-wrap overflow-auto max-h-20">
                {JSON.stringify(event.meta, null, 1)}
              </pre>
            </div>
          </div>
        )}

        {/* Key Reference */}
        {event.keyRef && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
              Key Reference
            </h4>

            <div className="bg-mongo-dark-700 rounded-lg p-2 border border-accent/10">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-400">Alias:</span>
                  <span className="text-xs text-neutral-200 font-mono">
                    {event.keyRef.alias}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-400">Version:</span>
                  <span className="text-xs text-neutral-200">
                    {event.keyRef.version}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payload Size */}
        {event.payloadSizeBytes && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
              Payload
            </h4>

            <div className="bg-mongo-dark-700 rounded-lg p-2 border border-accent/10">
              <div className="flex justify-between">
                <span className="text-xs text-neutral-400">Size:</span>
                <span className="text-xs text-neutral-200 font-mono">
                  {formatBytes(event.payloadSizeBytes)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Signature */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
            Security
          </h4>

          <div className="bg-mongo-dark-700 rounded-lg p-2 border border-accent/10">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span className="text-xs text-green-400 font-semibold">
                Signature Verified
              </span>
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              {event.signature.slice(0, 12)}...
            </div>
          </div>
        </div>
      </div>
    </div>
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

Inspector.displayName = "Inspector";
