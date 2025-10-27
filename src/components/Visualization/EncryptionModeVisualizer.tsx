"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { EncryptionMode } from "@/types/trace";

interface VisualizerProps {
  initialMode?: EncryptionMode;
  onModeChange?: (mode: EncryptionMode) => void;
  showLabels?: boolean;
  animate?: boolean;
}

interface EncryptionModeInfo {
  mode: EncryptionMode;
  title: string;
  color: string;
  bgColor: string;
  description: string;
  pros: string[];
  cons: string[];
  querySupport: string;
}

export const EncryptionModeVisualizer: React.FC<VisualizerProps> = ({
  initialMode = "qe",
  onModeChange,
  showLabels = true,
  animate = true
}) => {
  const [selectedMode, setSelectedMode] = useState<EncryptionMode>(initialMode);
  const [animationPlaying, setAnimationPlaying] = useState(false);
  const [plaintext, setPlaintext] = useState("Smith");
  const [ciphertext, setCiphertext] = useState("");
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // Define information about each encryption mode
  const encryptionModes: Record<EncryptionMode, EncryptionModeInfo> = {
    qe: {
      mode: "qe",
      title: "Queryable Encryption",
      color: "#00ED64",
      bgColor: "bg-primary/20",
      description: "Enables equality searches on encrypted data through secure index creation and query transformation.",
      pros: [
        "Data remains encrypted at rest, in transit, and in use",
        "Supports equality searches on encrypted fields",
        "No extra round trips for common queries",
        "Higher security than deterministic encryption"
      ],
      cons: [
        "Only supports equality queries (no range, sort, or text search)",
        "Slightly lower security than randomized encryption",
        "Requires specialized indexes"
      ],
      querySupport: "Equality searches (db.collection.find({ encrypted_field: 'value' }))"
    },
    det: {
      mode: "det",
      title: "Deterministic Encryption",
      color: "#FFD93D",
      bgColor: "bg-yellow-500/20",
      description: "Same input always produces same output, allowing exact matches but with reduced security.",
      pros: [
        "Supports equality queries",
        "Enables unique indexes on encrypted fields",
        "Compatible with most MongoDB drivers"
      ],
      cons: [
        "Vulnerable to frequency analysis",
        "Reveals patterns in your data",
        "Lower security than randomized or queryable encryption"
      ],
      querySupport: "Equality searches (db.collection.find({ encrypted_field: 'value' }))"
    },
    rand: {
      mode: "rand",
      title: "Randomized Encryption",
      color: "#FF6B6B",
      bgColor: "bg-red-500/20",
      description: "Maximum security with different ciphertext for the same plaintext. Cannot be directly queried.",
      pros: [
        "Highest security level",
        "Best for sensitive data like SSNs, credit cards",
        "Different ciphertext for same input prevents pattern analysis"
      ],
      cons: [
        "Cannot be queried directly",
        "Requires client-side filtering (performance impact)",
        "Must retrieve all documents to filter"
      ],
      querySupport: "None - requires client-side filtering after retrieving all documents"
    },
    none: {
      mode: "none",
      title: "No Encryption",
      color: "#6C757D",
      bgColor: "bg-neutral-500/20",
      description: "Plaintext data without encryption. Not recommended for sensitive information.",
      pros: [
        "Full query capabilities (range, sort, aggregation, text search)",
        "No performance impact",
        "Simplest implementation"
      ],
      cons: [
        "No security for data at rest",
        "Exposed to database administrators",
        "Vulnerable to data breaches",
        "May not meet compliance requirements"
      ],
      querySupport: "All MongoDB query operators and aggregation pipeline stages"
    }
  };

  // Simulate encryption based on the selected mode
  const encryptData = (text: string, mode: EncryptionMode): string => {
    if (mode === "none") {
      return text;
    }

    // Simple simulation of encryption
    const prefixes = {
      qe: "QE_",
      det: "DET_",
      rand: "RAND_"
    };

    // Base64-like encoding for visual effect
    const encoded = btoa(text).substring(0, 8);

    // Add randomness for randomized encryption
    const randomSuffix = mode === "rand" ? `_${Math.random().toString(36).substring(2, 5)}` : "";

    return `${prefixes[mode]}${encoded}${randomSuffix}`;
  };

  // Update ciphertext when mode or plaintext changes
  useEffect(() => {
    if (animate) {
      // For animation effect - show encryption in progress
      setAnimationPlaying(true);
      const scrambleTimeout = setTimeout(() => {
        setCiphertext(encryptData(plaintext, selectedMode));
        setAnimationPlaying(false);
      }, 800);

      return () => clearTimeout(scrambleTimeout);
    } else {
      setCiphertext(encryptData(plaintext, selectedMode));
    }
  }, [selectedMode, plaintext, animate]);

  // Handle mode changes
  const handleModeChange = (mode: EncryptionMode) => {
    setSelectedMode(mode);
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  // Get color for the current mode
  const getModeColor = (mode: EncryptionMode): string => {
    return encryptionModes[mode].color;
  };

  // Get scrambled text for animation effect
  const getScrambledText = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=_";
    let result = selectedMode === "none" ? plaintext : "";
    if (selectedMode !== "none") {
      const prefix = selectedMode === "qe" ? "QE_" : selectedMode === "det" ? "DET_" : "RAND_";
      result = prefix;
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (selectedMode === "rand") {
        result += "_" + Math.random().toString(36).substring(2, 5);
      }
    }
    return result;
  };

  return (
    <div className="bg-mongo-dark-800 rounded-lg border border-accent/20 overflow-hidden">
      {/* Title Bar */}
      <div className="border-b border-accent/20 p-3 flex justify-between items-center">
        <h2 className="text-primary font-medium">Encryption Mode Visualizer</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Mode:</span>
          <span className="text-sm font-medium" style={{ color: getModeColor(selectedMode) }}>
            {encryptionModes[selectedMode].title}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Mode Selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(encryptionModes).map((mode) => {
            const encMode = mode as EncryptionMode;
            const isSelected = selectedMode === encMode;
            return (
              <button
                key={mode}
                onClick={() => handleModeChange(encMode)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isSelected
                    ? `${encryptionModes[encMode].bgColor} border border-2`
                    : "bg-mongo-dark-700 hover:bg-mongo-dark-600"
                }`}
                style={{
                  borderColor: isSelected ? encryptionModes[encMode].color : "transparent",
                  color: isSelected ? encryptionModes[encMode].color : "#C1BEBC"
                }}
              >
                {showLabels ? encryptionModes[encMode].title : encMode.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Encryption Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Plaintext Input */}
          <div>
            <div className="text-xs text-neutral-500 mb-1">Plaintext Input</div>
            <input
              type="text"
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              className="w-full bg-mongo-dark-700 border border-accent/20 rounded p-2 text-neutral-200 text-sm font-mono"
              placeholder="Enter text to encrypt"
            />
          </div>

          {/* Encrypted Output */}
          <div>
            <div className="text-xs text-neutral-500 mb-1">Encrypted Output</div>
            <div
              className="w-full h-[38px] bg-mongo-dark-700 border border-accent/20 rounded p-2 text-sm font-mono overflow-hidden"
              style={{ color: getModeColor(selectedMode) }}
            >
              {animationPlaying ? getScrambledText() : ciphertext}
            </div>
          </div>
        </div>

        {/* Visual Representation */}
        <div className="bg-mongo-dark-900 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-neutral-400">Encryption Process</span>
            <motion.div
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: animationPlaying ? [0.3, 1, 0.3] : 0.3 }}
              transition={{ duration: 1, repeat: animationPlaying ? Infinity : 0 }}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-2">
            {/* Plaintext Side */}
            <div className="md:w-1/3 text-center">
              <div className="bg-mongo-dark-800 p-3 rounded border border-accent/20">
                <div className="text-xs text-neutral-400 mb-1">Client</div>
                <div className="text-sm text-neutral-200 font-mono">{plaintext}</div>
              </div>
            </div>

            {/* Encryption Process */}
            <div className="md:w-1/3 flex flex-col items-center">
              <motion.div
                className="bg-mongo-dark-700 px-4 py-2 rounded text-xs font-medium"
                style={{ color: getModeColor(selectedMode) }}
                animate={{
                  scale: animationPlaying ? [1, 1.05, 1] : 1,
                  boxShadow: animationPlaying ? [
                    `0 0 0px ${getModeColor(selectedMode)}00`,
                    `0 0 10px ${getModeColor(selectedMode)}40`,
                    `0 0 0px ${getModeColor(selectedMode)}00`
                  ] : `0 0 0px ${getModeColor(selectedMode)}00`
                }}
                transition={{ duration: 1, repeat: animationPlaying ? Infinity : 0 }}
              >
                {selectedMode.toUpperCase()} Encryption
              </motion.div>
              <div className="h-12 flex items-center">
                {animate && animationPlaying ? (
                  <motion.div
                    className="text-xs text-neutral-500"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    Encrypting...
                  </motion.div>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L12 20" stroke={getModeColor(selectedMode)} strokeWidth="2" strokeLinecap="round"/>
                    <path d="M18 14L12 20L6 14" stroke={getModeColor(selectedMode)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>

            {/* Ciphertext Side */}
            <div className="md:w-1/3 text-center">
              <div className="bg-mongo-dark-800 p-3 rounded border border-accent/20">
                <div className="text-xs text-neutral-400 mb-1">Database</div>
                <div className="text-sm font-mono" style={{ color: getModeColor(selectedMode) }}>
                  {animationPlaying ? getScrambledText() : ciphertext}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Detail Panel */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowDetailPanel(!showDetailPanel)}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-300"
          >
            {showDetailPanel ? "Hide" : "Show"} details
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d={showDetailPanel ? "M18 15L12 9L6 15" : "M18 9L12 15L6 9"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Detail Panel */}
        {showDetailPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="border-t border-accent/20 pt-4"
          >
            <div className="text-sm font-medium text-neutral-200 mb-2">
              {encryptionModes[selectedMode].title}
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              {encryptionModes[selectedMode].description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-green-400 mb-1">Pros</div>
                <ul className="list-disc pl-4 text-xs text-neutral-400 space-y-1">
                  {encryptionModes[selectedMode].pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs text-red-400 mb-1">Cons</div>
                <ul className="list-disc pl-4 text-xs text-neutral-400 space-y-1">
                  {encryptionModes[selectedMode].cons.map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-mongo-dark-900 p-3 rounded">
              <div className="text-xs text-neutral-300 mb-1">Query Support</div>
              <pre className="text-xs font-mono text-neutral-400 whitespace-pre-wrap">
                {encryptionModes[selectedMode].querySupport}
              </pre>
            </div>

            {selectedMode === "qe" && (
              <div className="mt-4 bg-primary/10 p-3 rounded border border-primary/30">
                <div className="text-xs text-primary mb-1">How Queryable Encryption Works</div>
                <p className="text-xs text-neutral-400">
                  MongoDB's Queryable Encryption creates secure indexes that allow searching encrypted data without
                  decrypting it first. It uses specialized cryptographic techniques to transform your query in a way that
                  can match against encrypted values while maintaining security.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EncryptionModeVisualizer;