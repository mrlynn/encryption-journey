"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TraceEvent, TraceField, EncryptionMode } from "@/types/trace";

interface InfoPanelProps {
  isVisible: boolean;
  event: TraceEvent | null;
  showCiphertext: boolean;
  position: { x: number; y: number };
}

export const InfoPanel = ({
  isVisible,
  event,
  showCiphertext,
  position
}: InfoPanelProps) => {
  if (!isVisible || !event) return null;

  const getEncryptionDescription = (mode: EncryptionMode) => {
    switch (mode) {
      case "qe":
        return {
          name: "Queryable Encryption",
          description: "Encrypted data that can still be queried without decryption.",
          technical: "Uses AEAD-AES-256-CBC-HMAC-SHA-512 with indexing structures.",
          color: "#00ED64",
        };
      case "det":
        return {
          name: "Deterministic Encryption",
          description: "Same input always produces the same output.",
          technical: "Uses AEAD-AES-256-CBC-HMAC-SHA-512 in deterministic mode.",
          color: "#FFD93D",
        };
      case "rand":
        return {
          name: "Randomized Encryption",
          description: "Same input produces different ciphertext each time.",
          technical: "Uses AEAD-AES-256-CBC-HMAC-SHA-512 with random IVs.",
          color: "#FF6B6B",
        };
      case "none":
      default:
        return {
          name: "No Encryption",
          description: "Data is stored as plaintext.",
          technical: "No cryptographic protection applied.",
          color: "#6C757D",
        };
    }
  };

  // Get a sample field to analyze in detail
  const focusField = event.fields.find(f => f.encryption !== "none") || event.fields[0];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed left-4 top-1/2 w-80 bg-mongo-dark-800/95 border border-accent/30 rounded-lg shadow-2xl overflow-hidden z-40 transform -translate-y-1/2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="bg-mongo-dark-700/80 p-3 border-b border-accent/20">
            <h3 className="text-sm font-semibold text-primary">Data Inspector</h3>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs font-mono bg-accent/20 text-accent px-1 py-0.5 rounded">
                {event.phase}
              </span>
              <span className="text-xs text-neutral-400">
                in <span className="text-neutral-300">{event.actor}</span>
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-4">
            {/* Phase Description */}
            <div>
              <h4 className="text-xs uppercase tracking-wide text-neutral-400 mb-1">
                Current Phase
              </h4>
              <p className="text-sm text-neutral-300">
                {event.phase === "CLIENT_ENCRYPT" && "Client-side encryption of sensitive fields before sending."}
                {event.phase === "API_RECEIVE" && "API receives the encrypted data from client."}
                {event.phase === "DRIVER_SEND" && "MongoDB driver prepares to send data to database."}
                {event.phase === "MONGO_MATCH_QE" && "MongoDB performs Queryable Encryption matching."}
                {event.phase === "MONGO_STORE" && "Data is stored securely in MongoDB."}
                {event.phase === "MONGO_READ" && "Encrypted data is retrieved from MongoDB."}
                {event.phase === "DRIVER_RECEIVE" && "Driver receives data from MongoDB."}
                {event.phase === "API_RESPOND" && "API prepares encrypted response."}
                {event.phase === "CLIENT_DECRYPT" && "Client decrypts data for display."}
              </p>
            </div>

            {/* Detailed Field Analysis */}
            {focusField && (
              <div className="border-t border-accent/10 pt-3">
                <h4 className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
                  Field Analysis
                </h4>
                <div className="bg-mongo-dark-900/60 rounded p-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-neutral-300">
                      {focusField.name}
                    </span>
                    <div
                      className="text-xs px-2 py-0.5 rounded font-medium"
                      style={{
                        backgroundColor: getEncryptionDescription(focusField.encryption).color + "30",
                        color: getEncryptionDescription(focusField.encryption).color
                      }}
                    >
                      {getEncryptionDescription(focusField.encryption).name}
                    </div>
                  </div>

                  {/* Before/After Comparison */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="text-xs p-2 bg-mongo-dark-900 rounded border border-accent/10">
                      <div className="text-neutral-500 mb-1">Original</div>
                      <div className="font-mono text-neutral-300">
                        {focusField.visibleSample || "[Redacted]"}
                      </div>
                    </div>
                    <div className="text-xs p-2 bg-mongo-dark-900 rounded border border-accent/10">
                      <div className="text-neutral-500 mb-1">
                        {showCiphertext ? "Encrypted" : "As Viewed"}
                      </div>
                      <div className="font-mono" style={{ color: getEncryptionDescription(focusField.encryption).color }}>
                        {showCiphertext && focusField.encryption !== "none"
                          ? (focusField.encryption === "qe"
                              ? "0x62f3a55c9..."
                              : focusField.encryption === "det"
                                ? "0x8a4b3c2d1..."
                                : "0xfe7d8c9a3...")
                          : (focusField.visibleSample || "[Redacted]")}
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="text-xs text-neutral-400 mt-2">
                    <p>
                      <span className="text-neutral-500">Method: </span>
                      {getEncryptionDescription(focusField.encryption).technical}
                    </p>
                    <p className="mt-1">
                      <span className="text-neutral-500">Description: </span>
                      {getEncryptionDescription(focusField.encryption).description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Journey Context */}
            <div className="border-t border-accent/10 pt-3">
              <h4 className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
                Data Journey
              </h4>
              <div className="flex items-center text-xs">
                <div className={`flex-1 ${event.phase === "CLIENT_ENCRYPT" || event.phase === "CLIENT_DECRYPT" ? "text-primary" : "text-neutral-500"}`}>
                  Client
                </div>
                <div className="w-4 h-px bg-accent/30"></div>
                <div className={`flex-1 text-center ${event.phase === "API_RECEIVE" || event.phase === "API_RESPOND" ? "text-primary" : "text-neutral-500"}`}>
                  API
                </div>
                <div className="w-4 h-px bg-accent/30"></div>
                <div className={`flex-1 text-center ${event.phase === "DRIVER_SEND" || event.phase === "DRIVER_RECEIVE" ? "text-primary" : "text-neutral-500"}`}>
                  Driver
                </div>
                <div className="w-4 h-px bg-accent/30"></div>
                <div className={`flex-1 text-right ${event.phase === "MONGO_MATCH_QE" || event.phase === "MONGO_STORE" || event.phase === "MONGO_READ" ? "text-primary" : "text-neutral-500"}`}>
                  MongoDB
                </div>
              </div>
              <div className="h-1 bg-mongo-dark-700 rounded-full mt-1 relative">
                <div
                  className="absolute h-1 bg-primary rounded-full"
                  style={{
                    width: `${event.phase === "CLIENT_ENCRYPT" ? "10%" :
                      event.phase === "API_RECEIVE" ? "30%" :
                      event.phase === "DRIVER_SEND" ? "40%" :
                      event.phase === "MONGO_MATCH_QE" || event.phase === "MONGO_STORE" ? "60%" :
                      event.phase === "MONGO_READ" ? "70%" :
                      event.phase === "DRIVER_RECEIVE" ? "80%" :
                      event.phase === "API_RESPOND" ? "90%" : "100%"}`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoPanel;