"use client";

import { useState } from "react";
import { TraceEvent } from "@/types/trace";

interface QueryExample {
  name: string;
  description: string;
  syntax: string;
  tags: string[];
}

interface QueryResult {
  success: boolean;
  result: any;
  executionTime?: number;
  affectedFields?: string[];
}

interface QueryConsoleProps {
  initialQuery?: string;
  onExecute?: (query: string) => void;
  currentEvent?: TraceEvent;
  collectionName?: string;
  databaseName?: string;
}

export const QueryConsole: React.FC<QueryConsoleProps> = ({
  initialQuery = "",
  onExecute,
  currentEvent,
  collectionName = "patients",
  databaseName = "securehealth"
}) => {
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [activeTab, setActiveTab] = useState<"console" | "explain">("console");
  const [selectedExampleTag, setSelectedExampleTag] = useState<string | null>(null);

  // Query examples for different encryption scenarios
  const queryExamples: QueryExample[] = [
    {
      name: "Equality Search (QE)",
      description: "Search patients by lastName with Queryable Encryption",
      syntax: `db.patients.find({
  "lastName": "Smith"
})`,
      tags: ["qe", "find"]
    },
    {
      name: "Deterministic Search",
      description: "Search by exact dateOfBirth match with deterministic encryption",
      syntax: `db.patients.find({
  "dateOfBirth": "1990-05-15"
})`,
      tags: ["det", "find"]
    },
    {
      name: "Randomized Field",
      description: "Attempt to query randomized field (will not work)",
      syntax: `db.patients.find({
  "ssn": "123-45-6789"
})`,
      tags: ["rand", "find", "error"]
    },
    {
      name: "Combined Fields",
      description: "Search by both QE and deterministic fields",
      syntax: `db.patients.find({
  "lastName": "Smith",
  "dateOfBirth": "1990-05-15"
})`,
      tags: ["qe", "det", "combined"]
    },
    {
      name: "Projection",
      description: "Retrieve only specific fields",
      syntax: `db.patients.find(
  { "lastName": "Smith" },
  { "firstName": 1, "lastName": 1 }
)`,
      tags: ["qe", "projection"]
    }
  ];

  // Filter examples based on selected tag
  const filteredExamples = selectedExampleTag
    ? queryExamples.filter(example => example.tags.includes(selectedExampleTag))
    : queryExamples;

  // All unique tags
  const allTags = Array.from(
    new Set(queryExamples.flatMap(example => example.tags))
  ).sort();

  // Handle query execution
  const handleQueryExecution = () => {
    // Simulate query execution
    const input = queryInput.trim();

    if (onExecute) {
      onExecute(input);
    }

    let success = true;
    let result;
    let executionTime = Math.floor(Math.random() * 20) + 5; // 5-25ms execution time

    try {
      // Simple check for valid MongoDB query structure
      if (!input.includes("find(") && !input.includes("aggregate(") && !input.includes("insertOne(")) {
        throw new Error("Query must use find(), aggregate(), or insertOne()");
      }

      // Simulate query result based on query content
      if (input.includes("lastName") && input.includes("Smith")) {
        let docs = [{
          _id: "ObjectId('6513a94e2b5d7a6e3c34d8f1')",
          firstName: input.includes("firstName") ? "Jane" : undefined,
          lastName: "Smith", // QE allows this to be visible
          ssn: input.includes("ssn") ? "RAND_ENCRYPTED_92a8c1" : undefined,
          dateOfBirth: input.includes("dateOfBirth") ? "1990-05-15" : undefined,
          medicalNotes: input.includes("medicalNotes") ? "RAND_ENCRYPTED_3c9d72" : undefined
        }];

        // Filter undefined fields
        docs = docs.map(doc => {
          const filtered: any = {};
          Object.entries(doc).forEach(([key, value]) => {
            if (value !== undefined) {
              filtered[key] = value;
            }
          });
          return filtered;
        });

        result = docs;
      } else if (input.includes("ssn")) {
        success = false;
        result = {
          error: "Cannot query on encrypted field 'ssn' using equality. Field is encrypted using AEAD_AES_256_CBC_HMAC_SHA_512 without queryType specification."
        };
        executionTime = 0;
      } else {
        result = [];
      }

      setQueryResult({
        success,
        result,
        executionTime,
        affectedFields: input.includes("lastName") ? ["lastName"] :
                        input.includes("dateOfBirth") ? ["dateOfBirth"] : []
      });
    } catch (error) {
      success = false;
      result = { error: String(error) };
      setQueryResult({ success, result, executionTime: 0 });
    }
  };

  // Apply a query example
  const applyQueryExample = (example: QueryExample) => {
    setQueryInput(example.syntax);
  };

  // Generate explain output based on query
  const getExplainOutput = (): string => {
    if (!queryInput.trim()) {
      return "// Run a query to see the explain output";
    }

    const isQEQuery = queryInput.includes("lastName");
    const isDetQuery = queryInput.includes("dateOfBirth");
    const isRandQuery = queryInput.includes("ssn") || queryInput.includes("medicalNotes");

    if (isRandQuery) {
      return `// Explain output for query on randomized field
{
  "ok": 0,
  "errmsg": "Cannot query on encrypted field 'ssn' using equality. Field is encrypted using AEAD_AES_256_CBC_HMAC_SHA_512 without queryType specification.",
  "code": 6371202,
  "codeName": "EncryptionInvalidOperation"
}`;
    }

    if (isQEQuery) {
      return `// Explain output for query using Queryable Encryption
{
  "queryPlanner": {
    "plannerVersion": 1,
    "namespace": "${databaseName}.${collectionName}",
    "winningPlan": {
      "stage": "FETCH",
      "inputStage": {
        "stage": "IXSCAN",
        "keyPattern": {
          "__safeContent__.encryptedFields.lastName.value": 1
        },
        "indexName": "qe_lastName_v1",
        "isMultiKey": false,
        "direction": "forward",
        "indexBounds": {
          "__safeContent__.encryptedFields.lastName.value": [
            "[BinData(6, \\"ZncyZWRzajA1kSMksGNAslPXGtyQHcr9x\\"), BinData(6, \\"ZncyZWRzajA1kSMksGNAslPXGtyQHcr9x\\")]"
          ]
        }
      }
    },
    "rejectedPlans": []
  },
  "executionStats": {
    "executionSuccess": true,
    "nReturned": 1,
    "executionTimeMillis": 12,
    "totalKeysExamined": 1,
    "totalDocsExamined": 1
  },
  "serverInfo": {
    "host": "mongodb.securehealth.example",
    "port": 27017,
    "version": "7.0.0",
    "gitVersion": "20234b40238-qe-enabled"
  }
}`;
    }

    if (isDetQuery) {
      return `// Explain output for query using deterministic encryption
{
  "queryPlanner": {
    "plannerVersion": 1,
    "namespace": "${databaseName}.${collectionName}",
    "winningPlan": {
      "stage": "FETCH",
      "inputStage": {
        "stage": "IXSCAN",
        "keyPattern": {
          "dateOfBirth": 1
        },
        "indexName": "dateOfBirth_1",
        "isMultiKey": false,
        "direction": "forward",
        "indexBounds": {
          "dateOfBirth": [
            "[BinData(0, \\"KwUiPoqnVmFoYupReWqScRbTlKxCcTqbBLm\\"), BinData(0, \\"KwUiPoqnVmFoYupReWqScRbTlKxCcTqbBLm\\")]"
          ]
        }
      }
    },
    "rejectedPlans": []
  },
  "executionStats": {
    "executionSuccess": true,
    "nReturned": 1,
    "executionTimeMillis": 8,
    "totalKeysExamined": 1,
    "totalDocsExamined": 1
  },
  "serverInfo": {
    "host": "mongodb.securehealth.example",
    "port": 27017,
    "version": "7.0.0",
    "gitVersion": "20234b40238-qe-enabled"
  }
}`;
    }

    return `// Run a specific query to see the explain output
{
  "queryPlanner": {
    "plannerVersion": 1,
    "namespace": "${databaseName}.${collectionName}",
    "winningPlan": {
      "stage": "COLLSCAN",
      "direction": "forward"
    }
  },
  "executionStats": {
    "executionSuccess": true,
    "nReturned": 0,
    "executionTimeMillis": 5,
    "totalKeysExamined": 0,
    "totalDocsExamined": 0
  }
}`;
  };

  return (
    <div className="bg-mongo-dark-800 rounded-lg border border-accent/20 shadow-lg">
      {/* Console Header */}
      <div className="bg-mongo-dark-700 px-3 py-2 rounded-t-lg border-b border-accent/20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-200">MongoDB Query Console</span>
          <span className="text-xs bg-neutral-600 px-2 py-0.5 rounded text-neutral-300">{databaseName}.{collectionName}</span>
        </div>
      </div>

      {/* Console Tabs */}
      <div className="flex border-b border-accent/20">
        <button
          onClick={() => setActiveTab("console")}
          className={`px-4 py-2 text-xs font-medium ${
            activeTab === "console" ? "bg-mongo-dark-700 text-primary border-b-2 border-primary" : "text-neutral-300"
          }`}
        >
          Query Editor
        </button>
        <button
          onClick={() => setActiveTab("explain")}
          className={`px-4 py-2 text-xs font-medium ${
            activeTab === "explain" ? "bg-mongo-dark-700 text-primary border-b-2 border-primary" : "text-neutral-300"
          }`}
        >
          Explain
        </button>
      </div>

      {/* Query Editor Tab */}
      {activeTab === "console" && (
        <div className="p-3">
          {/* Query Input */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-neutral-400">MongoDB Query</label>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="text-xs text-neutral-500">Connected</div>
              </div>
            </div>
            <textarea
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className="w-full h-24 bg-mongo-dark-900 border border-accent/30 rounded p-2 text-neutral-200 text-xs font-mono"
              placeholder="db.patients.find({ ... })"
            />
            <div className="flex justify-between mt-1">
              <div className="flex items-center gap-1">
                <span className="text-xs text-neutral-500">Examples:</span>
                <div className="flex gap-1">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedExampleTag(selectedExampleTag === tag ? null : tag)}
                      className={`px-2 py-0.5 rounded text-xs ${
                        selectedExampleTag === tag
                          ? "bg-primary/20 text-primary"
                          : "bg-mongo-dark-700 text-neutral-300 hover:bg-mongo-dark-600"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleQueryExecution}
                className="bg-primary text-mongo-dark-900 px-3 py-1 rounded text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                Run
              </button>
            </div>
          </div>

          {/* Example Queries */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {filteredExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => applyQueryExample(example)}
                  className="bg-mongo-dark-700 px-2 py-1 rounded text-xs text-neutral-300 hover:bg-mongo-dark-600 transition-colors flex items-center gap-1"
                  title={example.description}
                >
                  {example.name}
                  {example.tags.includes("qe") && (
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  )}
                  {example.tags.includes("det") && (
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  )}
                  {example.tags.includes("rand") && (
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Query Results */}
          {queryResult && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-neutral-400">Results</label>
                <div className="flex items-center gap-2">
                  <div className={`text-xs ${queryResult.success ? "text-green-400" : "text-red-400"}`}>
                    {queryResult.success ? "Query successful" : "Query error"}
                  </div>
                  {queryResult.executionTime !== undefined && queryResult.executionTime > 0 && (
                    <div className="text-xs text-neutral-500">
                      {queryResult.executionTime}ms
                    </div>
                  )}
                </div>
              </div>
              <pre className="w-full bg-mongo-dark-900 border border-accent/30 rounded p-2 text-neutral-200 text-xs font-mono h-32 overflow-auto">
                {JSON.stringify(queryResult.result, null, 2)}
              </pre>
              <div className="mt-2 text-xs text-neutral-500">
                {queryResult.success && Array.isArray(queryResult.result) && queryResult.result.length > 0 ? (
                  <div className="flex items-center gap-1">
                    <span className="text-green-400">✓</span> Found {queryResult.result.length} document(s)
                    {queryResult.affectedFields && queryResult.affectedFields.length > 0 && (
                      <span className="ml-2">
                        Using fields: {queryResult.affectedFields.join(", ")}
                      </span>
                    )}
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

      {/* Explain Tab */}
      {activeTab === "explain" && (
        <div className="p-3">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-neutral-400">Query Explain Output</label>
            {queryResult && (
              <div className="text-xs text-neutral-500">
                {queryResult.success ? "Query used " : "Query would have used "}
                {queryInput.includes("lastName") ? "Queryable Encryption index" :
                  queryInput.includes("dateOfBirth") ? "Deterministic encryption" : "Collection scan"}
              </div>
            )}
          </div>
          <pre className="w-full bg-mongo-dark-900 border border-accent/30 rounded p-2 text-neutral-200 text-xs font-mono h-64 overflow-auto">
            {getExplainOutput()}
          </pre>
          <div className="mt-2 text-xs text-neutral-500 italic">
            MongoDB Queryable Encryption automatically transforms queries to work with encrypted indexes.
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryConsole;