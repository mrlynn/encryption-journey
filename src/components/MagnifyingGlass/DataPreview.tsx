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
      // Show different encrypted representations based on encryption type
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

  // Get count of encrypted fields
  const encryptedFieldCount = event.fields.filter(f => f.encryption !== "none").length;
  const totalFieldCount = event.fields.length;

  // Show a limited number of fields in the magnifying glass view to keep it concise
  const displayFields = event.fields.slice(0, 3);
  const hiddenFieldCount = event.fields.length - displayFields.length;

  return (
    <div className="text-xs w-full h-full flex flex-col justify-between">
      {/* Event summary at the top */}
      <div className="text-center mb-1 py-1 border-b border-accent/10">
        <div className="text-[9px] text-primary/80 font-semibold">
          {event.phase.replace(/_/g, " ")}
        </div>
        <div className="text-[7px] text-neutral-400">
          {encryptedFieldCount} of {totalFieldCount} fields encrypted
        </div>
      </div>

      {/* Field list in the middle */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {displayFields.map((field, idx) => (
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

          {/* Show count of hidden fields if any */}
          {hiddenFieldCount > 0 && (
            <div className="text-center text-[8px] text-neutral-500 p-1 mt-1">
              + {hiddenFieldCount} more fields
            </div>
          )}
        </div>
      </div>

      {/* See details hint at the bottom */}
      <motion.div
        className="text-center text-[8px] text-primary/70 pt-1 border-t border-accent/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        See detailed info panel →
      </motion.div>
    </div>
  );
};

export default DataPreview;