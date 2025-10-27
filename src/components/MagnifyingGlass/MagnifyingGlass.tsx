"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TraceEvent } from "@/types/trace";
import { DataPreview } from "./DataPreview";

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

  // Update cursor position when mouse moves
  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          ref={magnifyingGlassRef}
          className="pointer-events-none absolute z-50"
          style={{
            left: cursorPosition.x,
            top: cursorPosition.y,
            transform: "translate(-50%, -50%)",
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
              width: 5,
              height: 60,
              backgroundColor: "#00ED64",
              bottom: -50,
              right: -20,
              transform: "rotate(-45deg)",
              boxShadow: "0 0 10px rgba(0, 237, 100, 0.5)",
            }}
          />

          {/* Magnifying glass frame */}
          <div
            className="rounded-full border-4 border-primary flex items-center justify-center overflow-hidden bg-mongo-dark-800/80"
            style={{
              width: 120,
              height: 120,
              boxShadow: "0 0 15px rgba(0, 237, 100, 0.5), inset 0 0 10px rgba(0, 237, 100, 0.3)",
            }}
          >
            {/* Crosshair */}
            <div className="absolute w-full h-[2px] bg-primary/20" />
            <div className="absolute w-[2px] h-full bg-primary/20" />

            {/* Content display */}
            <div className="w-full h-full flex items-center justify-center p-2">
              {hoverEvent ? (
                <DataPreview event={hoverEvent} isCiphertext={showCiphertext} />
              ) : (
                <div className="text-center text-xs text-primary/70">
                  <p>Hover over an edge</p>
                  <p>to inspect data</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MagnifyingGlass;