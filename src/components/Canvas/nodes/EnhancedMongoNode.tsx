"use client";

import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { TraceEvent } from "@/types/trace";
import { getActorColor, getNodeStateColor } from "@/lib/colors";

interface EnhancedMongoNodeData {
  label: string;
  actor: string;
  description: string;
  isActive: boolean;
  lastEvent?: TraceEvent;
  glowIntensity: number;
}

interface QueryExample {
  name: string;
  description: string;
  syntax: string;
}

export const EnhancedMongoNode = memo(({ data, selected }: NodeProps) => {
  const { label, description, isActive, lastEvent, glowIntensity } = (data as unknown as EnhancedMongoNodeData) || {};
  const [activeTab, setActiveTab] = useState<"console" | "explain" | "encryption">("console");
  const [queryInput, setQueryInput] = useState("");
  const [queryResult, setQueryResult] = useState<null | { success: boolean; result: any }>(null);
  const [expanded, setExpanded] = useState(false);

  const nodeColor = getActorColor("mongo");

  // Query examples for demonstration
  const queryExamples: QueryExample[] = [
    {
      name: "Equality Search (QE)",
      description: "Search patients by lastName (QE encrypted)",
      syntax: `db.patients.find({
  "lastName": "Smith"
})`
    },
    {
      name: "Deterministic Search",
      description: "Search by dateOfBirth (DET encrypted)",
      syntax: `db.patients.find({
  "dateOfBirth": "1990-05-15"
})`
    },
    {
      name: "Combined Search",
      description: "Search by both QE and DET fields",
      syntax: `db.patients.find({
  "lastName": "Smith",
  "dateOfBirth": "1990-05-15"
})`
    }
  ];

  // Handle query execution
  const handleQueryExecution = () => {
    // Simulate query execution
    const input = queryInput.trim();
    let success = true;
    let result: any;

    try {
      // Simple check for valid MongoDB query structure
      if (!input.includes("find(") && !input.includes("aggregate(")) {
        throw new Error("Query must use find() or aggregate()");
      }

      // Simulate query result based on query content
      if (input.includes("lastName")) {
        result = [{
          _id: "ObjectId('6513a94e2b5d7a6e3c34d8f1')",
          firstName: input.includes("firstName") ? "Jane" : "QE_ENCRYPTED",
          lastName: "Smith", // QE allows this to be visible
          ssn: "RAND_ENCRYPTED_92a8c1",
          dateOfBirth: input.includes("dateOfBirth") ? "1990-05-15" : "DET_ENCRYPTED_12345",
          medicalNotes: "RAND_ENCRYPTED_3c9d72"
        }];
      } else {
        result = [];
      }

      setQueryResult({ success, result });
    } catch (error) {
      success = false;
      result = { error: String(error) };
      setQueryResult({ success, result });
    }
  };

  // Apply a query example to the input
  const applyQueryExample = (example: QueryExample) => {
    setQueryInput(example.syntax);
  };

  // Get code snippet based on event phase
  const getQuerySnippet = (): string => {
    if (!lastEvent) return "";

    if (lastEvent.phase === "MONGO_MATCH_QE") {
      return `// MongoDB server-side processing of Queryable Encryption
// Collection with encrypted fields schema
{
  "bsonType": "object",
  "encryptMetadata": {
    "keyId": UUID("8dc3327e-aa3d-4858-8af8-ae7c59c7f4b2"),
    "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512"
  },
  "properties": {
    "lastName": {
      "encrypt": {
        "keyId": UUID("8dc3327e-aa3d-4858-8af8-ae7c59c7f4b2"),
        "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512",
        "bsonType": "string",
        "queryType": "equality"
      }
    }
  }
}

// Execution plan with Queryable Encryption
{
  "stage": "ENCRYPTED_FLE2_INDEX_SCAN",
  "indexName": "qe_lastName_v1",
  "encryptionMeta": {
    "keyId": UUID("8dc3327e-aa3d-4858-8af8-ae7c59c7f4b2"),
    "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512",
    "queryType": "equality"
  }
}`;
    } else if (lastEvent.phase === "MONGO_READ" || lastEvent.phase === "MONGO_STORE") {
      return `// MongoDB query execution with encrypted fields
db.${lastEvent.meta?.collection || "patients"}.${lastEvent.verb === "query" || lastEvent.verb === "read" ? "find" : "insertOne"}(
  ${lastEvent.verb === "query" || lastEvent.verb === "read" ?
    `{
    "lastName": BinData(6, "Sk3Cb1xaZmhaWJwfnN33dv8gJlOwuDLBDlQTo...")
  }` :
    `{
    "firstName": ${lastEvent.fields?.find(f => f.name === "firstName")?.encryption === "none" ?
      `"${lastEvent.fields?.find(f => f.name === "firstName")?.visibleSample || "Jane"}"` :
      `BinData(6, "J2Ia3b1xaZmhaVXwfnN1xDv5gJUQwdDBDlQToR...")`},
    "lastName": BinData(6, "Sk3Cb1xaZmhaWJwfnN33dv8gJlOwuDLBDlQTo..."),
    "ssn": BinData(6, "Ix98QwpnVmFoYupReWqScRbTlKxCxSqbBpLmiU..."),
    "dateOfBirth": BinData(6, "KwUiPoqnVmFoYupReWqScRbTlKxCcTqbBLm..."),
    "medicalNotes": BinData(6, "OqSiYwKopVmNhYzrReQwuScRbTlixCxSbBzL...")
  }`
  }
)`;
    } else {
      return `// MongoDB operations with Queryable Encryption enabled
// Setting up the MongoDB collection with encryption
db.createCollection("patients", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      encryptMetadata: {
        keyId: [UUID("8dc3327e-aa3d-4858-8af8-ae7c59c7f4b2")],
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512"
      },
      properties: {
        lastName: {
          encrypt: {
            bsonType: "string",
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512",
            keyId: [UUID("8dc3327e-aa3d-4858-8af8-ae7c59c7f4b2")],
            queryType: "equality"
          }
        },
        ssn: {
          encrypt: {
            bsonType: "string",
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512",
            keyId: [UUID("8dc3327e-aa3d-4858-8af8-ae7c59c7f4b2")]
          }
        }
      }
    }
  }
})`;
    }
  };

  // Get encryption information based on current event
  const getEncryptionInfo = () => {
    if (!lastEvent) return null;

    // Check if event involves encrypted fields
    const hasEncryptedFields = lastEvent.fields?.some(f => f.encryption !== "none");

    if (!hasEncryptedFields) return null;

    // Group fields by encryption type
    const encryptionGroups = {
      qe: lastEvent.fields?.filter(f => f.encryption === "qe") || [],
      det: lastEvent.fields?.filter(f => f.encryption === "det") || [],
      rand: lastEvent.fields?.filter(f => f.encryption === "rand") || [],
    };

    return {
      hasEncryptedFields,
      encryptionGroups,
      totalEncrypted: lastEvent.fields?.filter(f => f.encryption !== "none").length || 0,
      queryable: encryptionGroups.qe.length > 0,
    };
  };

  return (
    <div className="relative">
      {/* Source handle - right side */}
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 bg-primary border-2 border-mongo-dark-900 transition-all duration-300 ${isActive ? "w-4 h-4" : ""}`}
        style={{
          boxShadow: isActive ? "0 0 5px #00ED64" : "none",
          zIndex: 10
        }}
      />

      {/* Source handle animation */}
      {isActive && (
        <motion.div
          className="absolute top-1/2 -mt-2 right-0 w-4 h-4 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,237,100,0.3) 0%, rgba(0,237,100,0) 70%)",
            zIndex: 5
          }}
          animate={{
            scale: [1, 3, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}

      {/* Target handle - left side */}
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 bg-accent border-2 border-mongo-dark-900 transition-all duration-300 ${isActive ? "w-4 h-4" : ""}`}
        style={{
          boxShadow: isActive ? "0 0 5px #45B7D1" : "none",
          zIndex: 10
        }}
      />

      {/* Target handle animation */}
      {isActive && (
        <motion.div
          className="absolute top-1/2 -mt-2 left-0 w-4 h-4 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(69,183,209,0.3) 0%, rgba(69,183,209,0) 70%)",
            zIndex: 5
          }}
          animate={{
            scale: [1, 3, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}

      {/* Main node content */}
      <motion.div
        className="relative"
        // Remove layout prop to prevent interference with dragging
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: isActive ? 1.05 : 1,
          boxShadow: isActive
            ? `0 0 ${10 + glowIntensity * 5}px ${nodeColor}40`
            : "0 0 0px transparent",
        }}
        transition={{
          duration: 0.5,
          // Reduce stiffness for smoother transitions during drag
          scale: { duration: 0.4, type: "spring", stiffness: 100, damping: 20 }
        }}
      >
        {/* Glow effect background for active nodes */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-primary/5"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 0.4
            }}
            // Simpler animation that won't interfere with dragging
            transition={{
              duration: 0.3
            }}
            style={{
              boxShadow: `0 0 15px ${nodeColor}30`,
              filter: "blur(10px)",
            }}
          />
        )}

        <motion.div
          className={`px-6 py-4 rounded-2xl border-2 min-w-[220px] backdrop-blur-sm ${
            isActive
              ? "border-primary bg-primary/10"
              : "border-accent/20 bg-mongo-dark-700"
          }`}
          style={{
            boxShadow: isActive
              ? `0 0 ${10 + glowIntensity * 5}px ${nodeColor}30`
              : undefined,
          }}
          initial={{ boxShadow: "0 0 0px transparent" }}
          // Simplify animation to avoid interference during drag
          animate={{
            boxShadow: isActive
              ? `0 0 ${10 + glowIntensity * 5}px ${nodeColor}30`
              : "0 0 0px transparent"
          }}
          transition={{
            duration: 0.3
          }}
        >
          {/* Node Header with Expand Button */}
          <div className="flex items-center justify-between mb-2">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <motion.div
                className="text-2xl"
                animate={isActive ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 3 }}
              >
                🍃
              </motion.div>
              <div>
                <motion.h3
                  className="font-bold text-lg text-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {label}
                </motion.h3>
              </div>
            </motion.div>
            <motion.button
              onClick={() => setExpanded(!expanded)}
              className={`p-1 rounded-full ${isActive ? "bg-primary/20" : "bg-accent/10"} hover:bg-primary/30 transition-colors`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={expanded ? "Collapse node" : "Expand node"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                className={`text-neutral-200 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              >
                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
              </svg>
            </motion.button>
          </div>

          <motion.p
            className="text-sm text-neutral-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {description}
          </motion.p>

          {/* Current Event Info */}
          {lastEvent && (
            <motion.div
              className="space-y-2 mt-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-xs text-neutral-500 uppercase tracking-wide">
                Operation
              </div>
              <motion.div
                className="text-sm text-neutral-200"
                initial={{ color: "#4B5563" }}
                animate={{ color: isActive ? "#F3F4F6" : "#E5E7EB" }}
                transition={{ duration: 0.5 }}
              >
                <span className="font-mono">
                  {lastEvent.verb.toUpperCase()} {lastEvent.dataset}
                </span>
              </motion.div>
              <div className="text-xs text-neutral-400">
                {lastEvent.phase.replace(/_/g, " ")}
              </div>
            </motion.div>
          )}

          {/* Queryable Encryption Status */}
          {lastEvent && lastEvent.phase.includes("QE") && (
            <motion.div
              className="mt-3 space-y-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-xs text-neutral-500 uppercase tracking-wide">
                Q/E Status
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{
                    scale: [1, 1.5, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(0, 237, 100, 0)",
                      "0 0 0 4px rgba(0, 237, 100, 0.3)",
                      "0 0 0 0 rgba(0, 237, 100, 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.span
                  className="text-xs text-primary font-semibold"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Queryable Encryption Active
                </motion.span>
              </div>
            </motion.div>
          )}

          {/* Expandable Content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 border-t border-accent/20 pt-3"
              >
                {/* Tab Navigation */}
                <div className="flex border-b border-accent/20 bg-mongo-dark-700/50 rounded-t-md overflow-hidden mb-3">
                  <button
                    onClick={() => setActiveTab("console")}
                    className={`px-3 py-1.5 text-xs ${
                      activeTab === "console"
                        ? "bg-mongo-dark-900 text-primary border-b border-primary"
                        : "text-neutral-400 hover:bg-mongo-dark-800/50"
                    }`}
                  >
                    Query Console
                  </button>
                  <button
                    onClick={() => setActiveTab("explain")}
                    className={`px-3 py-1.5 text-xs ${
                      activeTab === "explain"
                        ? "bg-mongo-dark-900 text-primary border-b border-primary"
                        : "text-neutral-400 hover:bg-mongo-dark-800/50"
                    }`}
                  >
                    Server Code
                  </button>
                  <button
                    onClick={() => setActiveTab("encryption")}
                    className={`px-3 py-1.5 text-xs ${
                      activeTab === "encryption"
                        ? "bg-mongo-dark-900 text-primary border-b border-primary"
                        : "text-neutral-400 hover:bg-mongo-dark-800/50"
                    }`}
                  >
                    Encryption
                  </button>
                </div>

                {/* Console Tab */}
                {activeTab === "console" && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-neutral-400">MongoDB Query</label>
                        <div className="text-xs text-neutral-500">securehealth.patients</div>
                      </div>
                      <textarea
                        value={queryInput}
                        onChange={(e) => setQueryInput(e.target.value)}
                        className="w-full h-20 bg-mongo-dark-900 border border-accent/30 rounded p-2 text-neutral-200 text-xs font-mono"
                        placeholder="db.patients.find({ ... })"
                      />
                      <div className="flex justify-between mt-1">
                        <div className="flex gap-1 overflow-x-auto pb-1 max-w-[70%]">
                          {queryExamples.map((example, index) => (
                            <button
                              key={index}
                              onClick={() => applyQueryExample(example)}
                              className="bg-mongo-dark-700 px-2 py-1 rounded text-xs text-neutral-300 hover:bg-mongo-dark-600 transition-colors whitespace-nowrap flex-shrink-0"
                              title={example.description}
                            >
                              {example.name}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={handleQueryExecution}
                          className="bg-primary text-mongo-dark-900 px-3 py-1 rounded text-xs font-medium hover:bg-primary/90 transition-colors"
                        >
                          Run
                        </button>
                      </div>
                    </div>

                    {/* Query Results */}
                    {queryResult && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs text-neutral-400">Results</label>
                          <div className={`text-xs ${queryResult.success ? "text-green-400" : "text-red-400"}`}>
                            {queryResult.success ? "Query successful" : "Query error"}
                          </div>
                        </div>
                        <pre className="w-full bg-mongo-dark-900 border border-accent/30 rounded p-2 text-neutral-200 text-xs font-mono h-28 overflow-auto">
                          {JSON.stringify(queryResult.result, null, 2)}
                        </pre>
                        <div className="mt-2 text-xs text-neutral-500">
                          {queryResult.success && queryResult.result.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <span className="text-green-400">✓</span> Found {queryResult.result.length} documents
                            </div>
                          ) : queryResult.success ? (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400">!</span> No documents match this query
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-red-400">✗</span> Error executing query
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Server Code Tab */}
                {activeTab === "explain" && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-neutral-400">MongoDB Server Code</span>
                    </div>
                    <pre className="text-xs font-mono bg-mongo-dark-900 p-3 rounded overflow-auto max-h-60 text-neutral-300">
                      {getQuerySnippet()}
                    </pre>
                    <div className="mt-2 text-xs text-neutral-500 italic">
                      MongoDB Queryable Encryption automatically handles encrypted index creation and query transformation.
                    </div>
                  </div>
                )}

                {/* Encryption Tab */}
                {activeTab === "encryption" && (
                  <div>
                    {lastEvent?.fields ? (
                      <>
                        <h4 className="text-xs font-medium text-neutral-300 mb-2">Encryption Details</h4>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {lastEvent.fields.map((field, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded text-xs ${
                                field.encryption === "qe" ? "bg-primary/10 border border-primary/30" :
                                field.encryption === "det" ? "bg-yellow-500/10 border border-yellow-500/30" :
                                field.encryption === "rand" ? "bg-red-500/10 border border-red-500/30" :
                                "bg-mongo-dark-700 border border-accent/10"
                              }`}
                            >
                              <div className="font-mono mb-1 flex items-center justify-between">
                                <span>{field.name}</span>
                                <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                                  field.encryption === "qe" ? "bg-primary/20 text-primary" :
                                  field.encryption === "det" ? "bg-yellow-500/20 text-yellow-400" :
                                  field.encryption === "rand" ? "bg-red-500/20 text-red-400" :
                                  "bg-neutral-600/20 text-neutral-400"
                                }`}>
                                  {field.encryption === "none" ? "PLAIN" : field.encryption.toUpperCase()}
                                </span>
                              </div>

                              <div className={`${
                                field.encryption !== "none" ? "font-mono" : ""
                              } text-[10px] truncate`}>
                                {field.encryption !== "none" ?
                                  "🔒 [Encrypted]" :
                                  field.visibleSample}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 bg-mongo-dark-900 rounded p-2">
                          <h4 className="text-xs font-medium text-neutral-300 mb-1">Queryable Encryption Summary</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-mongo-dark-800 p-1.5 rounded">
                              <span className="text-neutral-500">QE Fields:</span>{" "}
                              <span className="text-primary">{lastEvent.fields.filter(f => f.encryption === "qe").length}</span>
                            </div>
                            <div className="bg-mongo-dark-800 p-1.5 rounded">
                              <span className="text-neutral-500">DET Fields:</span>{" "}
                              <span className="text-yellow-400">{lastEvent.fields.filter(f => f.encryption === "det").length}</span>
                            </div>
                            <div className="bg-mongo-dark-800 p-1.5 rounded">
                              <span className="text-neutral-500">RAND Fields:</span>{" "}
                              <span className="text-red-400">{lastEvent.fields.filter(f => f.encryption === "rand").length}</span>
                            </div>
                            <div className="bg-mongo-dark-800 p-1.5 rounded">
                              <span className="text-neutral-500">Total Encrypted:</span>{" "}
                              <span className="text-neutral-300">{lastEvent.fields.filter(f => f.encryption !== "none").length}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-neutral-500 italic">
                        No encryption details available for this event.
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
});

EnhancedMongoNode.displayName = "EnhancedMongoNode";