"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LegendProps {
  explainMode: boolean;
}

export const Legend = memo(({ explainMode }: LegendProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const nodeTypes = [
    {
      icon: "🌐",
      name: "Client",
      description: "Browser/Frontend application",
      color: "#4ECDC4",
      details: "Handles client-side encryption and decryption of sensitive fields before sending to the API.",
    },
    {
      icon: "⚙️",
      name: "API",
      description: "Symfony Backend",
      color: "#45B7D1",
      details: "Processes requests, validates data, and coordinates with the MongoDB driver.",
    },
    {
      icon: "🔌",
      name: "Driver",
      description: "MongoDB PHP Driver",
      color: "#96CEB4",
      details: "Handles communication with MongoDB using the MongoDB PHP driver.",
    },
    {
      icon: "🍃",
      name: "MongoDB",
      description: "Database",
      color: "#FECA57",
      details: "Stores encrypted data and performs Queryable Encryption operations.",
    },
  ];

  const encryptionModes = [
    {
      name: "QE",
      fullName: "Queryable Encryption",
      description: "MongoDB's field-level encryption with query support",
      color: "#00ED64",
      details: "Allows encrypted fields to be queried without decryption. Same input always produces same ciphertext for equality queries.",
    },
    {
      name: "DET",
      fullName: "Deterministic",
      description: "Same input = same ciphertext",
      color: "#FFD93D",
      details: "Useful for equality queries but less secure than randomized encryption.",
    },
    {
      name: "RAND",
      fullName: "Randomized",
      description: "Same input = different ciphertext",
      color: "#FF6B6B",
      details: "Most secure encryption mode. Same input produces different ciphertext each time.",
    },
    {
      name: "NONE",
      fullName: "No Encryption",
      description: "Stored as plaintext",
      color: "#6C757D",
      details: "Non-sensitive fields that don't require encryption.",
    },
  ];

  const phases = [
    {
      name: "CLIENT_ENCRYPT",
      description: "Client encrypts sensitive fields",
      color: "#00ED64",
    },
    {
      name: "API_RECEIVE",
      description: "API receives encrypted request",
      color: "#45B7D1",
    },
    {
      name: "DRIVER_SEND",
      description: "Driver sends to MongoDB",
      color: "#96CEB4",
    },
    {
      name: "MONGO_MATCH_QE",
      description: "MongoDB Queryable Encryption matching",
      color: "#FECA57",
    },
    {
      name: "MONGO_STORE",
      description: "Data stored in MongoDB",
      color: "#FECA57",
    },
    {
      name: "MONGO_READ",
      description: "Data read from MongoDB",
      color: "#FECA57",
    },
    {
      name: "DRIVER_RECEIVE",
      description: "Driver receives response",
      color: "#96CEB4",
    },
    {
      name: "API_RESPOND",
      description: "API sends response",
      color: "#45B7D1",
    },
    {
      name: "CLIENT_DECRYPT",
      description: "Client decrypts response",
      color: "#00ED64",
    },
  ];

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      {/* Toggle Button */}
      <motion.button
        className="bg-mongo-dark-800 hover:bg-mongo-dark-700 border border-accent/20 text-neutral-200 px-4 py-2 rounded-lg shadow-lg transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <span className="font-semibold">Legend</span>
        </div>
      </motion.button>

      {/* Legend Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-14 right-0 w-80 bg-mongo-dark-800 border border-accent/20 rounded-lg shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 border-b border-accent/20">
              <h3 className="text-lg font-semibold text-primary">Legend</h3>
              <p className="text-sm text-neutral-400">
                Understanding the encryption journey
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {/* Node Types */}
              <div className="p-4 border-b border-accent/10">
                <h4 className="text-sm font-semibold text-neutral-300 mb-3 uppercase tracking-wide">
                  System Components
                </h4>
                <div className="space-y-2">
                  {nodeTypes.map((node, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="text-lg">{node.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-neutral-200">
                            {node.name}
                          </span>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: node.color }}
                          />
                        </div>
                        <p className="text-xs text-neutral-400">{node.description}</p>
                        {explainMode && (
                          <p className="text-xs text-neutral-500 mt-1">{node.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Encryption Modes */}
              <div className="p-4 border-b border-accent/10">
                <h4 className="text-sm font-semibold text-neutral-300 mb-3 uppercase tracking-wide">
                  Encryption Modes
                </h4>
                <div className="space-y-2">
                  {encryptionModes.map((mode, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: mode.color }}
                      >
                        {mode.name}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-neutral-200">
                          {mode.fullName}
                        </div>
                        <p className="text-xs text-neutral-400">{mode.description}</p>
                        {explainMode && (
                          <p className="text-xs text-neutral-500 mt-1">{mode.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phases */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-neutral-300 mb-3 uppercase tracking-wide">
                  Journey Phases
                </h4>
                <div className="space-y-1">
                  {phases.map((phase, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: phase.color }}
                      />
                      <div className="flex-1">
                        <div className="text-xs font-mono text-neutral-200">
                          {phase.name}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {phase.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Legend.displayName = "Legend";
