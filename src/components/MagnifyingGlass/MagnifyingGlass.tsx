"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TraceEvent } from "@/types/trace";
import { DataPreview } from "./DataPreview";
import { InfoPanel } from "./InfoPanel";

interface MagnifyingGlassProps {
  isActive: boolean;
  hoverEvent: TraceEvent | null;
  showCiphertext: boolean;
  position?: { x: number; y: number };
}

export const MagnifyingGlass = ({
  isActive,
  hoverEvent,
  showCiphertext,
  position = { x: 0, y: 0 }
}: MagnifyingGlassProps) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const magnifyingGlassRef = useRef<HTMLDivElement>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  // Update cursor position when mouse moves - using useLayoutEffect for synchronous DOM updates
  useLayoutEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Set exact cursor position without any offset
      setCursorPosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isActive]);

  // Show info panel when we have hover data
  useEffect(() => {
    if (hoverEvent) {
      // Small delay to prevent flickering on brief hovers
      const timer = setTimeout(() => {
        setShowInfoPanel(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Small delay before hiding to prevent flickering
      const timer = setTimeout(() => {
        setShowInfoPanel(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [hoverEvent]);

  if (!isActive) return null;

  return (
    <>
      {/* Info Panel */}
      <InfoPanel
        isVisible={isActive && showInfoPanel}
        event={hoverEvent}
        showCiphertext={showCiphertext}
        position={cursorPosition}
      />

      {/* Connection line between magnifying glass and panel */}
      {hoverEvent && showInfoPanel && (
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-30"
          style={{
            position: 'fixed',
            overflow: 'visible'
          }}
        >
          <motion.path
            d={`M${cursorPosition.x},${cursorPosition.y} Q${cursorPosition.x - 100},${cursorPosition.y} 160,${window.innerHeight / 2}`}
            fill="none"
            stroke="#00ED64"
            strokeWidth="2"
            strokeDasharray="5,5"
            strokeLinecap="round"
            strokeOpacity="0.8"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </svg>
      )}

      <AnimatePresence>
        {isActive && (
          <motion.div
            ref={magnifyingGlassRef}
            className="pointer-events-none z-50"
            style={{
              position: 'fixed',
              left: `${cursorPosition.x}px`,
              top: `${cursorPosition.y}px`,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              willChange: "transform, left, top" // Performance optimization
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            {/* Magnifying glass handle */}
            <div
              className="absolute"
              style={{
                width: 4,
                height: 40,
                backgroundColor: "#00ED64",
                bottom: -32,
                right: -28,
                transform: "rotate(-45deg)",
                boxShadow: "0 0 10px rgba(0, 237, 100, 0.5)",
                pointerEvents: "none",
                zIndex: -1 // Ensure handle is behind glass
              }}
            />

            {/* Magnifying glass frame */}
            <div
              className={`rounded-full border-4 flex items-center justify-center overflow-hidden bg-mongo-dark-800/80 transition-all duration-300 ${hoverEvent ? 'border-primary' : 'border-neutral-500'}`}
              style={{
                width: 120,
                height: 120,
                boxShadow: hoverEvent
                  ? "0 0 15px rgba(0, 237, 100, 0.5), inset 0 0 10px rgba(0, 237, 100, 0.3)"
                  : "0 0 10px rgba(100, 100, 100, 0.3), inset 0 0 10px rgba(100, 100, 100, 0.2)",
              }}
            >
              {/* Crosshair */}
              <div className={`absolute w-full h-[2px] ${hoverEvent ? 'bg-primary/20' : 'bg-neutral-500/20'}`} />
              <div className={`absolute w-[2px] h-full ${hoverEvent ? 'bg-primary/20' : 'bg-neutral-500/20'}`} />

              {/* Content display */}
              <div className="w-full h-full flex items-center justify-center p-2">
                {hoverEvent ? (
                  <DataPreview event={hoverEvent} isCiphertext={showCiphertext} />
                ) : (
                  <div className="text-center text-xs text-neutral-400">
                    <p>Hover over an edge</p>
                    <p>to inspect data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pulse animation when data is available */}
            {hoverEvent && (
              <motion.div
                className="absolute w-full h-full rounded-full border border-primary"
                initial={{ scale: 0.8, opacity: 0.7 }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.7, 0, 0.7],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MagnifyingGlass;