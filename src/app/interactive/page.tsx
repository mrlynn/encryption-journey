"use client";

import { useState } from "react";
import { PatientDataForm, PatientFormData } from "@/components/Forms/PatientDataForm";
import Link from "next/link";
import { TraceEvent } from "@/types/trace";

export default function InteractivePage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [patientData, setPatientData] = useState<PatientFormData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleFormSubmit = async (data: PatientFormData) => {
    setPatientData(data);

    // In a real application, we would send this data to an API
    // For now, we'll just generate a mock session ID
    const mockSessionId = `interactive-${Date.now()}`;
    setSessionId(mockSessionId);
    setFormSubmitted(true);
  };

  // Function to simulate encryption
  const simulateEncryption = (value: string, mode: "none" | "qe" | "det" | "rand"): string => {
    if (mode === "none") return value;

    // Simple mock encryption for demo purposes
    const prefixes = {
      "qe": "QE_",
      "det": "DET_",
      "rand": "RAND_"
    };

    // For "rand", add some randomness
    const randomSuffix = mode === "rand" ? `_${Math.random().toString(36).substring(2, 7)}` : "";
    return `${prefixes[mode]}${Buffer.from(value).toString('base64').substring(0, 10)}${randomSuffix}`;
  };

  const generateEvents = (data: PatientFormData): TraceEvent[] => {
    const now = new Date();
    const baseTimestamp = now.toISOString();
    const mockSignature = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
    const mockSessionId = sessionId || "interactive-session";

    // Generate encrypted values
    const encryptedValues = {
      firstName: simulateEncryption(data.firstName, data.encryptionSettings.firstName),
      lastName: simulateEncryption(data.lastName, data.encryptionSettings.lastName),
      ssn: simulateEncryption(data.ssn, data.encryptionSettings.ssn),
      dateOfBirth: simulateEncryption(data.dateOfBirth, data.encryptionSettings.dateOfBirth),
      medicalNotes: simulateEncryption(data.medicalNotes, data.encryptionSettings.medicalNotes),
    };

    // Create trace events for the encryption journey
    return [
      {
        id: `event-1-${Date.now()}`,
        sessionId: mockSessionId,
        ts: baseTimestamp,
        phase: "CLIENT_ENCRYPT",
        actor: "client",
        verb: "create",
        dataset: "patient",
        fields: [
          {
            name: "firstName",
            encryption: data.encryptionSettings.firstName,
            visibleSample: data.firstName
          },
          {
            name: "lastName",
            encryption: data.encryptionSettings.lastName,
            visibleSample: data.lastName
          },
          {
            name: "ssn",
            encryption: data.encryptionSettings.ssn,
            visibleSample: data.ssn
          },
          {
            name: "dateOfBirth",
            encryption: data.encryptionSettings.dateOfBirth,
            visibleSample: data.dateOfBirth
          },
          {
            name: "medicalNotes",
            encryption: data.encryptionSettings.medicalNotes,
            visibleSample: data.medicalNotes
          }
        ],
        payloadSizeBytes: 1024,
        meta: {
          encryptionLibrary: "mongodb-client-side-encryption",
          keyProvider: "aws-kms",
          browser: "Chrome 120.0"
        },
        keyRef: {
          alias: "securehealth/patient",
          version: 3
        },
        signature: mockSignature,
        verified: true
      },
      // Additional events would be generated in a real implementation
    ];
  };

  return (
    <div className="min-h-screen bg-mongo-dark-900 flex flex-col">
      {/* Header */}
      <header className="bg-mongo-dark-800 border-b border-accent/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Interactive Encryption Journey</h1>
            <p className="text-neutral-400 text-sm">Create a patient record with custom encryption settings</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {!formSubmitted ? (
          <PatientDataForm onSubmit={handleFormSubmit} />
        ) : (
          <div className="space-y-6">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-green-400 text-xl">✓</div>
                <div>
                  <h3 className="text-green-400 font-semibold text-lg">Patient Record Created Successfully</h3>
                  <p className="text-neutral-300 mt-1">
                    Your patient record has been created with the encryption settings you specified.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-mongo-dark-800 rounded-lg border border-accent/20 p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Encrypted Patient Data</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-300 uppercase tracking-wide mb-3">Original Data</h4>
                  <pre className="bg-mongo-dark-700 p-3 rounded-lg text-sm font-mono text-neutral-300 overflow-auto max-h-80">
                    {patientData ? JSON.stringify({
                      firstName: patientData.firstName,
                      lastName: patientData.lastName,
                      ssn: patientData.ssn,
                      dateOfBirth: patientData.dateOfBirth,
                      medicalNotes: patientData.medicalNotes
                    }, null, 2) : "No data"}
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-300 uppercase tracking-wide mb-3">Encrypted Data</h4>
                  <pre className="bg-mongo-dark-700 p-3 rounded-lg text-sm font-mono text-neutral-300 overflow-auto max-h-80">
                    {patientData ? JSON.stringify({
                      firstName: patientData.encryptionSettings.firstName === "none"
                        ? patientData.firstName
                        : simulateEncryption(patientData.firstName, patientData.encryptionSettings.firstName),
                      lastName: patientData.encryptionSettings.lastName === "none"
                        ? patientData.lastName
                        : simulateEncryption(patientData.lastName, patientData.encryptionSettings.lastName),
                      ssn: patientData.encryptionSettings.ssn === "none"
                        ? patientData.ssn
                        : simulateEncryption(patientData.ssn, patientData.encryptionSettings.ssn),
                      dateOfBirth: patientData.encryptionSettings.dateOfBirth === "none"
                        ? patientData.dateOfBirth
                        : simulateEncryption(patientData.dateOfBirth, patientData.encryptionSettings.dateOfBirth),
                      medicalNotes: patientData.encryptionSettings.medicalNotes === "none"
                        ? patientData.medicalNotes
                        : simulateEncryption(patientData.medicalNotes, patientData.encryptionSettings.medicalNotes)
                    }, null, 2) : "No data"}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setFormSubmitted(false)}
                className="px-4 py-2 bg-neutral-600 text-white rounded hover:bg-neutral-500 transition-colors"
              >
                Edit Patient Data
              </button>
              <Link
                href={`/view/demo`}
                className="px-4 py-2 bg-primary text-mongo-dark-900 font-medium rounded hover:bg-primary/90 transition-colors"
              >
                Visualize Encryption Journey
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}