"use client";

import { useState } from "react";
import { TraceSession, TraceEvent } from "@/types/trace";

// Static data that would normally come from the API
const demoSession: TraceSession = {
  sessionId: "demo",
  id: "demo",
  name: "Patient Record Creation and Retrieval",
  createdAt: "2024-01-15T10:00:00.000Z",
  description: "Complete workflow showing patient record encryption, storage, and retrieval using MongoDB Queryable Encryption",
  events: [
    {
      id: "event-1",
      sessionId: "demo",
      ts: "2024-01-15T10:00:00Z",
      phase: "CLIENT_ENCRYPT",
      actor: "client",
      verb: "create",
      dataset: "patients",
      fields: [
        { name: "lastName", encryption: "qe", visibleSample: "Smith" },
        { name: "ssn", encryption: "qe", visibleSample: "123-45-6789" },
        { name: "diagnosis", encryption: "rand", visibleSample: "Hypertension" }
      ],
      payloadSizeBytes: 1024,
      meta: { browser: "Chrome 120", version: "1.0.0" },
      keyRef: { alias: "patient-key", version: 1 },
      signature: "abc123def456",
      verified: true
    },
    {
      id: "event-2",
      sessionId: "demo",
      ts: "2024-01-15T10:00:01Z",
      phase: "API_RECEIVE",
      actor: "api",
      verb: "create",
      dataset: "patients",
      fields: [
        { name: "lastName", encryption: "qe", visibleSample: "Smith" },
        { name: "ssn", encryption: "qe", visibleSample: "123-45-6789" },
        { name: "diagnosis", encryption: "rand", visibleSample: "Hypertension" }
      ],
      payloadSizeBytes: 1024,
      meta: { endpoint: "/api/patients", method: "POST" },
      keyRef: { alias: "patient-key", version: 1 },
      signature: "def456ghi789",
      verified: true
    },
    {
      id: "event-3",
      sessionId: "demo",
      ts: "2024-01-15T10:00:02Z",
      phase: "DRIVER_SEND",
      actor: "driver",
      verb: "create",
      dataset: "patients",
      fields: [
        { name: "lastName", encryption: "qe", visibleSample: "Smith" },
        { name: "ssn", encryption: "qe", visibleSample: "123-45-6789" },
        { name: "diagnosis", encryption: "rand", visibleSample: "Hypertension" }
      ],
      payloadSizeBytes: 1024,
      meta: { driver: "mongodb-php-driver", version: "1.15.0" },
      keyRef: { alias: "patient-key", version: 1 },
      signature: "ghi789jkl012",
      verified: true
    },
    {
      id: "event-4",
      sessionId: "demo",
      ts: "2024-01-15T10:00:03Z",
      phase: "MONGO_STORE",
      actor: "mongo",
      verb: "create",
      dataset: "patients",
      fields: [
        { name: "lastName", encryption: "qe", visibleSample: "Smith" },
        { name: "ssn", encryption: "qe", visibleSample: "123-45-6789" },
        { name: "diagnosis", encryption: "rand", visibleSample: "Hypertension" }
      ],
      payloadSizeBytes: 1024,
      meta: { collection: "patients", database: "securehealth", index: "qe_lastName_v1" },
      keyRef: { alias: "patient-key", version: 1 },
      signature: "jkl012mno345",
      verified: true
    },
    {
      id: "event-5",
      sessionId: "demo",
      ts: "2024-01-15T10:00:04Z",
      phase: "MONGO_READ",
      actor: "mongo",
      verb: "read",
      dataset: "patients",
      fields: [
        { name: "lastName", encryption: "qe", visibleSample: "Smith" },
        { name: "ssn", encryption: "qe", visibleSample: "123-45-6789" },
        { name: "diagnosis", encryption: "rand", visibleSample: "Hypertension" }
      ],
      payloadSizeBytes: 1024,
      meta: { collection: "patients", database: "securehealth", query: "lastName: 'Smith'" },
      keyRef: { alias: "patient-key", version: 1 },
      signature: "mno345pqr678",
      verified: true
    },
    {
      id: "event-6",
      sessionId: "demo",
      ts: "2024-01-15T10:00:05Z",
      phase: "DRIVER_RECEIVE",
      actor: "driver",
      verb: "read",
      dataset: "patients",
      fields: [
        { name: "lastName", encryption: "qe", visibleSample: "Smith" },
        { name: "ssn", encryption: "qe", visibleSample: "123-45-6789" },
        { name: "diagnosis", encryption: "rand", visibleSample: "Hypertension" }
      ],
      payloadSizeBytes: 1024,
      meta: { driver: "mongodb-php-driver", version: "1.15.0" },
      keyRef: { alias: "patient-key", version: 1 },
      signature: "pqr678stu901",
      verified: true
    },
    {
      id: "event-7",
      sessionId: "demo",
      ts: "2024-01-15T10:00:06Z",
      phase: "API_RESPOND",
      actor: "api",
      verb: "read",
      dataset: "patients",
      fields: [
        { name: "lastName", encryption: "qe", visibleSample: "Smith" },
        { name: "ssn", encryption: "qe", visibleSample: "123-45-6789" },
        { name: "diagnosis", encryption: "rand", visibleSample: "Hypertension" }
      ],
      payloadSizeBytes: 1024,
      meta: { endpoint: "/api/patients", method: "GET" },
      keyRef: { alias: "patient-key", version: 1 },
      signature: "stu901vwx234",
      verified: true
    },
    {
      id: "event-8",
      sessionId: "demo",
      ts: "2024-01-15T10:00:07Z",
      phase: "CLIENT_DECRYPT",
      actor: "client",
      verb: "read",
      dataset: "patients",
      fields: [
        { name: "lastName", encryption: "qe", visibleSample: "Smith" },
        { name: "ssn", encryption: "qe", visibleSample: "123-45-6789" },
        { name: "diagnosis", encryption: "rand", visibleSample: "Hypertension" }
      ],
      payloadSizeBytes: 1024,
      meta: { browser: "Chrome 120", version: "1.0.0" },
      keyRef: { alias: "patient-key", version: 1 },
      signature: "vwx234yza567",
      verified: true
    }
  ]
};

export default function WorkingDemoPage() {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [showCiphertext, setShowCiphertext] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentEvent = demoSession.events[currentEventIndex];

  const handleNext = () => {
    if (currentEventIndex < demoSession.events.length - 1) {
      setCurrentEventIndex(currentEventIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentEventIndex > 0) {
      setCurrentEventIndex(currentEventIndex - 1);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleEventClick = (index: number) => {
    setCurrentEventIndex(index);
  };

  return (
    <div className="min-h-screen bg-mongo-dark-900 flex flex-col">
      {/* Header */}
      <header className="bg-mongo-dark-800 border-b border-accent/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Encryption Journey Visualizer</h1>
            <p className="text-neutral-400 text-sm">Session: {demoSession.sessionId}</p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="bg-primary hover:bg-primary/90 text-mongo-dark-900 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {isPlaying ? "⏸️ Pause" : "▶️ Play"}
            </button>
            
            <button
              onClick={handlePrevious}
              disabled={currentEventIndex === 0}
              className="bg-accent hover:bg-accent/90 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors"
            >
              ⏮️
            </button>
            
            <button
              onClick={handleNext}
              disabled={currentEventIndex >= demoSession.events.length - 1}
              className="bg-accent hover:bg-accent/90 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors"
            >
              ⏭️
            </button>
            
            <button
              onClick={() => setShowCiphertext(!showCiphertext)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showCiphertext 
                  ? "bg-primary text-mongo-dark-900" 
                  : "bg-mongo-dark-700 text-neutral-300 hover:bg-mongo-dark-600"
              }`}
            >
              {showCiphertext ? "🔓 Show Plaintext" : "🔒 Show Ciphertext"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas Area */}
        <div className="flex-1 p-8">
          <div className="bg-mongo-dark-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-neutral-200 mb-4">Current Event</h2>
            <div className="bg-mongo-dark-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-primary">
                  {currentEventIndex + 1}. {currentEvent.phase.replace(/_/g, " ")}
                </h3>
                <span className="text-sm text-neutral-400">
                  {new Date(currentEvent.ts).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-neutral-300 mb-2">
                {currentEvent.actor} {currentEvent.verb} {currentEvent.dataset}
              </p>
              <div className="flex flex-wrap gap-2">
                {currentEvent.fields.map((field, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      field.encryption === "none"
                        ? "bg-neutral-600 text-neutral-300"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {field.name}: {field.encryption.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Simple Flow Diagram */}
          <div className="bg-mongo-dark-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-neutral-200 mb-4">Encryption Flow</h2>
            <div className="flex items-center justify-between">
              {["client", "api", "driver", "mongo"].map((actor, index) => {
                const isActive = currentEvent.actor === actor;
                return (
                  <div key={actor} className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-mongo-dark-900 shadow-lg shadow-primary/50"
                          : "bg-mongo-dark-700 text-neutral-300"
                      }`}
                    >
                      {actor.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-neutral-400 mt-2 capitalize">{actor}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-1 animate-pulse"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-mongo-dark-800 border-l border-accent/20 flex flex-col">
          {/* Timeline */}
          <div className="p-4 border-b border-accent/20">
            <h2 className="text-lg font-semibold text-primary mb-4">Event Timeline</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {demoSession.events.map((event, index) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    index === currentEventIndex
                      ? "bg-primary/20 border border-primary text-primary shadow-md"
                      : "bg-mongo-dark-700 hover:bg-mongo-dark-600 border border-transparent text-neutral-200"
                  }`}
                  onClick={() => handleEventClick(index)}
                >
                  <div className="font-semibold text-sm">
                    {index + 1}. {event.phase.replace(/_/g, " ")}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {event.actor} {event.verb} {event.dataset}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inspector */}
          <div className="p-4 flex-1">
            <h2 className="text-lg font-semibold text-primary mb-4">Event Inspector</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Session ID:</span>
                <span className="font-mono text-neutral-200 text-xs">{currentEvent.sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Timestamp:</span>
                <span className="font-mono text-neutral-200 text-xs">{new Date(currentEvent.ts).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Phase:</span>
                <span className="font-semibold text-primary">{currentEvent.phase.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Actor:</span>
                <span className="font-semibold text-neutral-200">{currentEvent.actor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Action:</span>
                <span className="font-semibold text-neutral-200">{currentEvent.verb} {currentEvent.dataset}</span>
              </div>

              {currentEvent.payloadSizeBytes && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Payload Size:</span>
                  <span className="font-mono text-neutral-200">{currentEvent.payloadSizeBytes} bytes</span>
                </div>
              )}

              {currentEvent.keyRef && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Key Reference:</span>
                  <span className="font-mono text-neutral-200 text-xs">
                    {currentEvent.keyRef.alias} (v{currentEvent.keyRef.version})
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-neutral-400 mt-4 mb-2 border-t border-neutral-700 pt-3">Fields:</h3>
                <div className="space-y-2">
                  {currentEvent.fields.map((field, index) => (
                    <div key={index} className="flex flex-col p-2 bg-mongo-dark-700 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-neutral-200 text-sm">{field.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            field.encryption === "none"
                              ? "bg-neutral-600 text-neutral-300"
                              : "bg-primary/20 text-primary"
                          }`}
                        >
                          {field.encryption.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        Value:{" "}
                        <span className="font-mono text-neutral-300">
                          {showCiphertext && field.encryption !== "none"
                            ? `🔒 [${field.visibleSample?.length || 0} bytes encrypted]`
                            : field.visibleSample || "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
