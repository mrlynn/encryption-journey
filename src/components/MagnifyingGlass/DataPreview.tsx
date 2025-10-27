"use client";

import { motion } from "framer-motion";
import { TraceEvent, TraceField } from "@/types/trace";

interface DataPreviewProps {
  event: TraceEvent | null | undefined;
  isCiphertext?: boolean;
}

export const DataPreview = ({ event, isCiphertext = false }: DataPreviewProps) => {
  if (!event || !event.fields || event.fields.length === 0) {
    return (
      <div className="text-center text-xs text-neutral-400 p-1">
        <p>No data available</p>
      </div>
    );
  }

  const getFieldDisplay = (field: TraceField) => {
    const isEncrypted = field.encryption !== "none";

    // Show actual field data
    if (isCiphertext && isEncrypted) {
      // Show encrypted representation
      return field.encryption === "qe"
        ? "0x62f3a55c9..."
        : field.encryption === "det"
          ? "0x8a4b3c2d1..."
          : "0xfe7d8c9a3...";
    } else if (!isCiphertext && field.visibleSample) {
      // Show plaintext or sample
      return field.visibleSample;
    } else {
      return field.name.split(".").pop();
    }
  };

  const getEncryptionBadge = (encryptionType: string) => {
    switch (encryptionType) {
      case "qe":
        return <span className="bg-primary/30 text-primary text-[8px] px-1 rounded">QE</span>;
      case "det":
        return <span className="bg-yellow-500/30 text-yellow-400 text-[8px] px-1 rounded">DET</span>;
      case "rand":
        return <span className="bg-red-500/30 text-red-400 text-[8px] px-1 rounded">RAND</span>;
      default:
        return <span className="bg-neutral-500/30 text-neutral-400 text-[8px] px-1 rounded">NONE</span>;
    }
  };

  return (
    <div className="text-xs max-h-[100px] overflow-y-auto p-1">
      <div className="space-y-1">
        {event.fields.map((field, idx) => (
          <motion.div
            key={`${field.name}-${idx}`}
            className={`flex items-center justify-between gap-1 p-1 rounded ${
              field.encryption !== "none" ? "bg-mongo-dark-700/70" : "bg-mongo-dark-600/40"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="flex items-center gap-1">
              {getEncryptionBadge(field.encryption)}
              <span className="text-neutral-300 font-mono text-[9px]">{field.name.split(".").pop()}</span>
            </div>
            <span className={`font-mono text-[9px] ${
              field.encryption !== "none" && isCiphertext
                ? "text-primary"
                : field.encryption !== "none"
                  ? "text-neutral-300"
                  : "text-neutral-400"
            }`}>
              {getFieldDisplay(field)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DataPreview;