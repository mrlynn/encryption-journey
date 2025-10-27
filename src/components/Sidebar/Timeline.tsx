"use client";

import { memo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { TraceEvent } from "@/types/trace";
import { getPhaseColor, getActorColor } from "@/lib/colors";

interface TimelineProps {
  events: TraceEvent[];
  currentEventIndex: number;
  onEventSelect: (event: TraceEvent, index: number) => void;
}

export const Timeline = memo(({ events, currentEventIndex, onEventSelect }: TimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current event
  useEffect(() => {
    if (timelineRef.current) {
      const currentElement = timelineRef.current.querySelector(`[data-event-index="${currentEventIndex}"]`);
      if (currentElement) {
        currentElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [currentEventIndex]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  const getPhaseIcon = (phase: string) => {
    const phaseIcons: Record<string, string> = {
      CLIENT_ENCRYPT: "🔐",
      API_RECEIVE: "📥",
      DRIVER_SEND: "📤",
      MONGO_MATCH_QE: "🔍",
      MONGO_STORE: "💾",
      MONGO_READ: "📖",
      DRIVER_RECEIVE: "📥",
      API_RESPOND: "📤",
      CLIENT_DECRYPT: "🔓",
    };
    return phaseIcons[phase] || "⚡";
  };

  const getPhaseDescription = (phase: string) => {
    const descriptions: Record<string, string> = {
      CLIENT_ENCRYPT: "Client encrypts sensitive fields",
      API_RECEIVE: "API receives encrypted request",
      DRIVER_SEND: "Driver sends to MongoDB",
      MONGO_MATCH_QE: "MongoDB Queryable Encryption matching",
      MONGO_STORE: "Data stored in MongoDB",
      MONGO_READ: "Data read from MongoDB",
      DRIVER_RECEIVE: "Driver receives response",
      API_RESPOND: "API sends response",
      CLIENT_DECRYPT: "Client decrypts response",
    };
    return descriptions[phase] || "Unknown phase";
  };

  return (
    <div className="h-full bg-mongo-dark-800 border-b border-accent/20 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-accent/20 flex-shrink-0">
        <h3 className="text-lg font-semibold text-primary">Timeline</h3>
        <p className="text-sm text-neutral-400">
          {events.length} events • Step {currentEventIndex + 1} of {events.length}
        </p>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto" ref={timelineRef}>
        <div className="p-2 space-y-1">
          {events.map((event, index) => {
            const isActive = index === currentEventIndex;
            const isPast = index < currentEventIndex;
            const phaseColor = getPhaseColor(event.phase);
            const actorColor = getActorColor(event.actor);

            return (
              <motion.div
                key={event.id}
                data-event-index={index}
                className={`relative cursor-pointer rounded-lg p-2 transition-all duration-200 ${
                  isActive
                    ? "bg-primary/20 border border-primary"
                    : isPast
                    ? "bg-accent/10 border border-accent/20"
                    : "bg-mongo-dark-700 border border-accent/10 hover:bg-mongo-dark-600"
                }`}
                onClick={() => onEventSelect(event, index)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Event content */}
                <div className="flex items-center gap-2">
                  {/* Phase icon */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? "bg-primary text-mongo-dark-900"
                        : isPast
                        ? "bg-accent text-white"
                        : "bg-neutral-600 text-neutral-300"
                    }`}
                    style={{
                      backgroundColor: isActive ? phaseColor : undefined,
                    }}
                  >
                    {getPhaseIcon(event.phase)}
                  </div>

                  {/* Event details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-semibold uppercase tracking-wide truncate"
                        style={{ color: actorColor }}
                      >
                        {event.actor}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatTimestamp(event.ts)}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-neutral-200 truncate">
                      {event.verb.toUpperCase()} {event.dataset}
                    </div>

                    {/* Field encryption summary - only show if active */}
                    {isActive && event.fields && event.fields.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {event.fields.slice(0, 2).map((field, fieldIndex) => (
                          <span
                            key={fieldIndex}
                            className={`px-1.5 py-0.5 rounded text-xs font-mono ${
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
                        {event.fields.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-neutral-500/20 text-neutral-400">
                            +{event.fields.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="w-2 h-2 bg-primary rounded-full flex-shrink-0"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
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

Timeline.displayName = "Timeline";
