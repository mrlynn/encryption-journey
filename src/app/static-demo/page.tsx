import { TraceSession } from "@/types/trace";

// This is a static page that doesn't use any client-side JavaScript
export default function StaticDemoPage() {
  // Simulate the data that would come from the API
  const session: TraceSession = {
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
      }
    ]
  };

  return (
    <div className="min-h-screen bg-mongo-dark-900 p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Encryption Journey Visualizer</h1>
      
      <div className="bg-mongo-dark-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold text-neutral-200 mb-4">Session Data</h2>
        <p className="text-neutral-300 mb-2">Session ID: {session.sessionId}</p>
        <p className="text-neutral-300 mb-2">Events: {session.events.length}</p>
        <p className="text-neutral-300 mb-4">Description: {session.description}</p>
      </div>
      
      <div className="bg-mongo-dark-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-neutral-200 mb-4">Events:</h3>
        <div className="space-y-4">
          {session.events.map((event, index) => (
            <div key={event.id} className="bg-mongo-dark-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-primary">
                  {index + 1}. {event.phase.replace(/_/g, " ")}
                </h4>
                <span className="text-sm text-neutral-400">
                  {new Date(event.ts).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-neutral-300 mb-2">
                {event.actor} {event.verb} {event.dataset}
              </p>
              <div className="flex flex-wrap gap-2">
                {event.fields.map((field, fieldIndex) => (
                  <span
                    key={fieldIndex}
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
          ))}
        </div>
      </div>
    </div>
  );
}
