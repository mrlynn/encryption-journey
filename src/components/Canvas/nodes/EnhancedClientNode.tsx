"use client";

import { memo, useState } from "react";
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

export const EnhancedClientNode = memo(({ data, selected }: NodeProps) => {
  const { label, description, isActive, lastEvent, glowIntensity } = (data as unknown as ClientNodeData) || {};
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const nodeColor = getActorColor("client");
  const stateColor = getNodeStateColor(isActive);

  // Show data transformation panel based on phase
  const showTransformation =
    isActive &&
    lastEvent &&
    (lastEvent.phase === "CLIENT_ENCRYPT" || lastEvent.phase === "CLIENT_DECRYPT");

  // Handle code snippet copying
  const handleCopyCode = () => {
    if (lastEvent) {
      const codeSnippet = getCodeSnippet(lastEvent);
      navigator.clipboard.writeText(codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate appropriate code snippet based on event phase
  const getCodeSnippet = (event: TraceEvent): string => {
    const isEncryption = event.phase === "CLIENT_ENCRYPT";

    if (isEncryption) {
      return `// MongoDB Queryable Encryption client setup
const clientEncryption = new ClientEncryption(mongoClient, {
  keyVaultNamespace: 'encryption.__keyVault',
  kmsProviders: {
    local: { key: masterKey }
  }
});

// Create encrypted fields configuration
const patientSchema = {
  properties: {
${event.fields.map(field => {
  const encType = field.encryption === "qe" ?
    "    algorithm: 'QUERYABLE',\n    keyId: patientKeyId,\n    queryType: 'equality'" :
    field.encryption === "det" ?
    "    algorithm: 'DETERMINISTIC',\n    keyId: patientKeyId" :
    field.encryption === "rand" ?
    "    algorithm: 'RANDOMIZED',\n    keyId: patientKeyId" :
    "    algorithm: 'NONE'";

  return `    ${field.name.split('.').pop()}: {
      encrypt: {
${encType}
      }
    }`;
}).join(',\n')}
  }
};

// Apply encryption when inserting document
const encryptedPatient = await clientEncryption.encrypt(
  patientData,
  patientSchema
);`;
    } else {
      return `// MongoDB Queryable Encryption client setup
const clientEncryption = new ClientEncryption(mongoClient, {
  keyVaultNamespace: 'encryption.__keyVault',
  kmsProviders: {
    local: { key: masterKey }
  }
});

// Decrypt the document returned from MongoDB
const decryptedPatient = await clientEncryption.decrypt(
  encryptedPatientDocument
);

// The decrypted document now contains plaintext values
console.log(decryptedPatient);`;
    }
  };

  return (
    <motion.div
      className="relative"
      animate={{
        scale: isActive ? 1.05 : 1,
        boxShadow: isActive
          ? `0 0 ${20 + glowIntensity * 10}px ${nodeColor}50`
          : "0 0 0px transparent",
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Code Tab Button */}
      {isActive && (
        <div className="absolute -top-10 right-0 z-10">
          <button
            onClick={() => setShowCode(!showCode)}
            className={`bg-neutral-700 hover:bg-neutral-600 text-neutral-200 px-3 py-1 rounded-t-lg text-xs font-mono flex items-center gap-1 transition-colors ${showCode ? 'bg-primary/90 text-mongo-dark-900' : ''}`}
          >
            <span>&lt;/&gt;</span> View Code
          </button>
        </div>
      )}

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

      {/* Code Panel */}
      {isActive && showCode && lastEvent && (
        <div className="absolute top-full left-0 right-0 mt-2 z-20 p-3 bg-mongo-dark-800 rounded-lg border border-accent/30 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-neutral-400">client.js</span>
            <button
              onClick={handleCopyCode}
              className="text-xs text-neutral-300 hover:text-primary"
            >
              {copied ? "Copied! ✓" : "Copy"}
            </button>
          </div>
          <pre className="text-xs font-mono bg-mongo-dark-900 p-3 rounded overflow-auto max-h-60 text-neutral-300">
            {getCodeSnippet(lastEvent)}
          </pre>
        </div>
      )}

      {/* Data Transformation Panel */}
      {showTransformation && lastEvent && (
        <motion.div
          className="absolute -bottom-36 left-0 right-0 mt-2 z-20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex">
            <div className="bg-mongo-dark-800 border border-accent/20 rounded-lg p-3 flex-1">
              <h4 className="text-xs text-neutral-400 mb-2">
                {lastEvent.phase === "CLIENT_ENCRYPT" ? "Original Data" : "Encrypted Data"}
              </h4>
              <pre className="text-xs font-mono text-neutral-200 overflow-auto max-h-24">
                {JSON.stringify(
                  Object.fromEntries(
                    lastEvent.fields.map(field => [
                      field.name.split('.').pop(),
                      lastEvent.phase === "CLIENT_ENCRYPT"
                        ? field.visibleSample
                        : `Encrypted_${field.encryption}_${Math.random().toString(16).substring(2, 8)}`
                    ])
                  ),
                  null,
                  2
                )}
              </pre>
            </div>
            <div className="flex items-center px-3">
              <span className="text-lg text-primary">→</span>
            </div>
            <div className="bg-mongo-dark-800 border border-primary/40 rounded-lg p-3 flex-1">
              <h4 className="text-xs text-neutral-400 mb-2">
                {lastEvent.phase === "CLIENT_ENCRYPT" ? "Encrypted Data" : "Decrypted Data"}
              </h4>
              <pre className="text-xs font-mono text-neutral-200 overflow-auto max-h-24">
                {JSON.stringify(
                  Object.fromEntries(
                    lastEvent.fields.map(field => [
                      field.name.split('.').pop(),
                      lastEvent.phase === "CLIENT_ENCRYPT"
                        ? field.encryption === "none"
                          ? field.visibleSample
                          : `Encrypted_${field.encryption}_${Math.random().toString(16).substring(2, 8)}`
                        : field.visibleSample
                    ])
                  ),
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});

EnhancedClientNode.displayName = "EnhancedClientNode";