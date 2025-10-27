"use client";

import { useState } from "react";
import Link from "next/link";
import QueryConsole from "@/components/Console/QueryConsole";
import { TraceEvent, TraceField, EncryptionMode } from "@/types/trace";

interface QueryState {
  query: string;
  result: any;
  executionTime: number;
}

interface EncryptionExample {
  name: string;
  description: string;
  fieldName: string;
  encryptionType: EncryptionMode;
  color: string;
  canQuery: boolean;
  queryExample?: string;
  exampleResult?: any;
}

export default function QueryConsolePage() {
  const [queryHistory, setQueryHistory] = useState<QueryState[]>([]);
  const [activeEncryption, setActiveEncryption] = useState<EncryptionMode>("qe");

  // Sample field definitions
  const encryptionExamples: EncryptionExample[] = [
    {
      name: "Queryable Encryption",
      description: "Enables equality searches while keeping data encrypted at rest, in use, and in motion",
      fieldName: "lastName",
      encryptionType: "qe",
      color: "bg-primary/20 text-primary border-primary/30",
      canQuery: true,
      queryExample: 'db.patients.find({"lastName": "Smith"})'
    },
    {
      name: "Deterministic Encryption",
      description: "Same input always produces same ciphertext. Enables exact matches but vulnerable to frequency analysis",
      fieldName: "dateOfBirth",
      encryptionType: "det",
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      canQuery: true,
      queryExample: 'db.patients.find({"dateOfBirth": "1990-05-15"})'
    },
    {
      name: "Randomized Encryption",
      description: "Maximum security with different ciphertext each time, even for same input. Cannot be queried directly",
      fieldName: "ssn",
      encryptionType: "rand",
      color: "bg-red-500/20 text-red-400 border-red-500/30",
      canQuery: false,
      queryExample: 'db.patients.find({"ssn": "123-45-6789"}) // Will error'
    },
    {
      name: "No Encryption",
      description: "Plaintext storage without encryption. Not recommended for sensitive data",
      fieldName: "address",
      encryptionType: "none",
      color: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
      canQuery: true,
      queryExample: 'db.patients.find({"address.city": "Boston"})'
    }
  ];

  // Create mock event for the console
  const createMockEvent = (encryption: EncryptionMode): TraceEvent => {
    const fields: TraceField[] = [
      { name: "lastName", encryption: "qe", visibleSample: "Smith" },
      { name: "dateOfBirth", encryption: "det", visibleSample: "1990-05-15" },
      { name: "ssn", encryption: "rand", visibleSample: "123-45-6789" },
      { name: "medicalNotes", encryption: "rand", visibleSample: "Patient has hypertension..." },
      { name: "address.city", encryption: "none", visibleSample: "Boston" }
    ];

    return {
      id: `event-${Date.now()}`,
      sessionId: "query-console-demo",
      ts: new Date().toISOString(),
      phase: "MONGO_MATCH_QE",
      actor: "mongo",
      verb: "query",
      dataset: "patient",
      fields,
      payloadSizeBytes: 1024,
      meta: {
        collection: "patients",
        database: "securehealth",
        index: encryption === "qe" ? "qe_lastName_v1" : undefined,
      },
      signature: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
      verified: true
    };
  };

  const handleExecuteQuery = (query: string) => {
    // Add query to history
    const executionTime = Math.floor(Math.random() * 15) + 5;
    let result;

    if (query.includes("lastName") && query.includes("Smith")) {
      result = [{
        _id: "ObjectId('6513a94e2b5d7a6e3c34d8f1')",
        firstName: "Jane",
        lastName: "Smith",
        dateOfBirth: "1990-05-15",
        ssn: "RAND_ENCRYPTED_92a8c1",
        medicalNotes: "RAND_ENCRYPTED_3c9d72"
      }];
    } else if (query.includes("ssn")) {
      result = {
        error: "Cannot query on encrypted field 'ssn' using equality"
      };
    } else {
      result = [];
    }

    setQueryHistory(prev => [
      { query, result, executionTime },
      ...prev.slice(0, 4) // Keep last 5 queries
    ]);
  };

  const selectedExample = encryptionExamples.find(ex => ex.encryptionType === activeEncryption);

  return (
    <div className="min-h-screen bg-mongo-dark-900 flex flex-col">
      {/* Header */}
      <header className="bg-mongo-dark-800 border-b border-accent/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">MongoDB Query Console</h1>
            <p className="text-neutral-400 text-sm">Experiment with queries on encrypted data</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded hover:bg-neutral-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Query Console */}
          <div className="lg:col-span-2">
            <QueryConsole
              initialQuery={selectedExample?.queryExample || ""}
              onExecute={handleExecuteQuery}
              currentEvent={createMockEvent(activeEncryption)}
            />

            {/* Query History */}
            {queryHistory.length > 0 && (
              <div className="mt-6 bg-mongo-dark-800 rounded-lg border border-accent/20 p-4">
                <h2 className="text-sm font-medium text-neutral-200 mb-3">Query History</h2>
                <div className="space-y-3">
                  {queryHistory.map((item, index) => (
                    <div key={index} className="bg-mongo-dark-700 rounded p-3 border border-accent/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-xs text-neutral-300">{item.query.substring(0, 40)}{item.query.length > 40 ? "..." : ""}</span>
                        <span className="text-xs text-neutral-500">{item.executionTime}ms</span>
                      </div>
                      <pre className="text-xs font-mono bg-mongo-dark-900 p-2 rounded overflow-auto max-h-20 text-neutral-300">
                        {JSON.stringify(item.result, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Encryption Info */}
          <div>
            <div className="bg-mongo-dark-800 rounded-lg border border-accent/20 p-4">
              <h2 className="text-sm font-medium text-neutral-200 mb-3">Encryption Types</h2>
              <div className="space-y-2">
                {encryptionExamples.map((example) => (
                  <button
                    key={example.encryptionType}
                    onClick={() => setActiveEncryption(example.encryptionType)}
                    className={`w-full text-left p-3 rounded border ${
                      activeEncryption === example.encryptionType
                        ? "bg-mongo-dark-700 border-primary/30"
                        : "bg-mongo-dark-900 border-accent/10 hover:bg-mongo-dark-800"
                    } transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-neutral-200">{example.name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-mono border ${example.color}`}>
                        {example.encryptionType.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{example.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-neutral-500">Field example:</span>
                      <span className="text-xs font-mono text-neutral-300">{example.fieldName}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${
                        example.canQuery ? "bg-green-400" : "bg-red-400"
                      }`}></span>
                      <span className="text-xs text-neutral-400">
                        {example.canQuery ? "Can be queried directly" : "Cannot be queried directly"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Technical Notes */}
            <div className="mt-6 bg-mongo-dark-800 rounded-lg border border-accent/20 p-4">
              <h2 className="text-sm font-medium text-neutral-200 mb-3">Technical Notes</h2>
              <div className="space-y-3 text-xs text-neutral-400">
                <p>
                  <span className="text-primary font-medium">Queryable Encryption</span> enables
                  equality searches on encrypted data using secure, indexed data transformations.
                </p>
                <p>
                  <span className="text-yellow-400 font-medium">Deterministic Encryption</span> produces
                  the same ciphertext for the same plaintext, allowing direct equality matches but with
                  reduced security compared to randomized encryption.
                </p>
                <p>
                  <span className="text-red-400 font-medium">Randomized Encryption</span> provides
                  maximum security by producing different ciphertext even for the same input value,
                  but doesn't support direct querying.
                </p>
                <div className="bg-mongo-dark-700 p-3 rounded mt-4 border border-accent/10">
                  <p className="font-medium text-neutral-300">Security Best Practices:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>Use randomized encryption for highly sensitive data like SSNs</li>
                    <li>Use queryable encryption for fields that need to be searchable</li>
                    <li>Store encryption keys separately from data using a KMS</li>
                    <li>Implement role-based access controls to limit data visibility</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}