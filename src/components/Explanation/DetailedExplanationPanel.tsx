"use client";

import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TraceEvent, TracePhase } from "@/types/trace";
import { getPhaseColor, getActorColor } from "@/lib/colors";

interface DetailedExplanationPanelProps {
  selectedEvent: TraceEvent | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  explainMode: boolean;
}

interface PhaseExplanation {
  phase: TracePhase;
  title: string;
  detailedDescription: string;
  securityImplications: string;
  technicalDetails: string;
  bestPractices: string;
  code?: string;
  links?: Array<{ text: string; url: string }>;
}

export const DetailedExplanationPanel = memo(({
  selectedEvent,
  isExpanded,
  onToggleExpand,
  explainMode
}: DetailedExplanationPanelProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "technical" | "security" | "code">("overview");
  const [explanationContent, setExplanationContent] = useState<PhaseExplanation | null>(null);

  // Define explanations for each phase
  const phaseExplanations: Record<TracePhase, PhaseExplanation> = {
    "CLIENT_ENCRYPT": {
      phase: "CLIENT_ENCRYPT",
      title: "Client-Side Encryption",
      detailedDescription:
        "In this phase, the client application (such as a browser or mobile app) encrypts sensitive fields locally before sending data to the server. This is a critical security step that ensures sensitive data is protected before it ever leaves the client device.",
      securityImplications:
        "Client-side encryption significantly reduces the attack surface by ensuring sensitive data is encrypted before transmission. This protects against man-in-the-middle attacks, server breaches, and unauthorized database access. Even if subsequent systems are compromised, the encrypted data remains protected.",
      technicalDetails:
        "The client uses the MongoDB Client-Side Field Level Encryption library. The application first retrieves a Data Encryption Key (DEK) from the key vault, which is protected by a Customer Master Key (CMK). The library then encrypts specific fields according to their encryption type (QE, DET, or RAND) before sending the data to the server.",
      bestPractices:
        "• Store encryption keys securely and separately from the encrypted data\n• Use a robust Key Management Service (KMS) like AWS KMS or Azure Key Vault\n• Apply appropriate encryption types based on field sensitivity and query requirements\n• Ensure all sensitive fields are included in the encryption schema",
      code:
`// Initialize MongoDB Client with encryption configuration
const clientEncryption = new ClientEncryption(mongoClient, {
  keyVaultNamespace: 'encryption.__keyVault',
  kmsProviders: {
    local: { key: masterKey }  // In production, use a KMS provider
  }
});

// Define encryption schema with different encryption types
const schema = {
  properties: {
    ssn: {               // Highly sensitive - use randomized
      encrypt: {
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512",
        keyId: patientKeyId
      }
    },
    lastName: {          // Needs to be searchable - use QE
      encrypt: {
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512",
        keyId: patientKeyId,
        queryType: "equality"
      }
    }
  }
};

// Apply encryption to document before sending
const encryptedDoc = await clientEncryption.encrypt(
  patientData,
  schema
);`
    },
    "API_RECEIVE": {
      phase: "API_RECEIVE",
      title: "API Receives Encrypted Request",
      detailedDescription:
        "The API server receives the client request containing encrypted fields. At this point, the sensitive data remains encrypted and unreadable to the API server itself, providing an additional layer of security. The API processes the request, validates input, and prepares it for database operations.",
      securityImplications:
        "This architecture provides 'defense in depth' - even if the API server is compromised, sensitive data remains encrypted. The API operates on encrypted data without needing to decrypt it, reducing the risk of exposing sensitive information during processing.",
      technicalDetails:
        "The server validates the request structure, authentication, and authorization but does not attempt to decrypt sensitive fields. It then forwards the request to the MongoDB driver to handle the database operations. This implementation follows the principle of least privilege - the API only has access to the data it needs.",
      bestPractices:
        "• Implement proper authentication and authorization at the API level\n• Validate all inputs, even encrypted ones, for proper format and structure\n• Use TLS/HTTPS for all client-server communications\n• Implement proper logging but avoid logging encrypted fields",
      code:
`// API route handler receives encrypted data
app.post('/api/patients', authenticate, async (req, res) => {
  try {
    // Validate request structure (but not encrypted content)
    validatePatientRequest(req.body);

    // Note: The sensitive fields are still encrypted at this point
    // and the API server cannot read them

    // Forward to database handler
    const result = await patientService.createPatient(req.body);

    res.status(201).json({
      success: true,
      id: result.insertedId
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});`
    },
    "DRIVER_SEND": {
      phase: "DRIVER_SEND",
      title: "Database Driver Sends Request",
      detailedDescription:
        "The MongoDB driver formats the request according to the MongoDB wire protocol and sends it to the MongoDB server. The driver handles connection management, request formatting, and maintains security configurations for Queryable Encryption.",
      securityImplications:
        "The driver maintains the security context necessary for Queryable Encryption, including information about encrypted fields. It ensures that queries on encrypted fields are properly transformed to work with the encrypted data without compromising security.",
      technicalDetails:
        "The driver maintains a mapping of which fields are encrypted and how they're encrypted. When sending requests, it includes metadata that allows MongoDB to understand how to handle encrypted fields. For Queryable Encryption fields, it includes information about the encryption keys and query types.",
      bestPractices:
        "• Keep driver libraries updated to the latest version\n• Configure connection pooling appropriately for your workload\n• Use secure TLS connections to the database\n• Configure appropriate timeouts and retry policies",
      code:
`// MongoDB driver configuration with encryption settings
const mongoClientOptions = {
  autoEncryption: {
    keyVaultNamespace: 'encryption.__keyVault',
    kmsProviders: {
      aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    },
    schemaMap: {
      'database.collection': {
        properties: {
          encryptedField: {
            encrypt: {
              keyId: [UUID('...')],
              algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512',
              bsonType: 'string',
              queryType: 'equality'
            }
          }
        }
      }
    }
  }
};

// Create MongoDB client with encryption settings
const client = new MongoClient(uri, mongoClientOptions);`
    },
    "MONGO_MATCH_QE": {
      phase: "MONGO_MATCH_QE",
      title: "MongoDB Queryable Encryption Matching",
      detailedDescription:
        "When querying encrypted fields, MongoDB uses special indexes to perform equality matches on encrypted data without decrypting it. This is the key innovation of Queryable Encryption - it allows searching encrypted data while keeping it secure.",
      securityImplications:
        "Queryable Encryption provides the security benefits of encryption while still allowing queries. The data remains encrypted in memory, on disk, and during query processing, protecting it against database breaches, unauthorized admin access, and memory scraping attacks.",
      technicalDetails:
        "MongoDB creates special indexes for fields using Queryable Encryption. When a query includes an encrypted field, MongoDB transforms the query to work with these indexes. The query transformation happens on the client, and MongoDB uses cryptographic techniques to search the encrypted data without decrypting it.",
      bestPractices:
        "• Only use Queryable Encryption for fields that need to be searched\n• Understand that only equality queries are supported on encrypted fields\n• Create appropriate indexes for frequently queried encrypted fields\n• Use randomized encryption for highly sensitive fields that don't need to be queried",
      code:
`// Query using Queryable Encryption
// The driver automatically handles the query transformation
const result = await collection.find({
  // This field uses Queryable Encryption
  lastName: "Smith"
}).toArray();

// Under the hood, the driver:
// 1. Recognizes lastName is encrypted with QE
// 2. Encrypts "Smith" using the same key and algorithm
// 3. Transforms the query to use the special QE index
// 4. MongoDB uses the index to find matching documents
// 5. Returns encrypted documents to the client`
    },
    "MONGO_STORE": {
      phase: "MONGO_STORE",
      title: "MongoDB Stores Encrypted Data",
      detailedDescription:
        "MongoDB writes the encrypted document to disk. The sensitive fields remain encrypted while stored in the database, providing protection for data at rest. MongoDB's storage engine handles the persistence of the encrypted data efficiently.",
      securityImplications:
        "Storing encrypted data protects against unauthorized access to the database files, backup theft, and disk forensics. Even database administrators with full access cannot view the sensitive data because the encryption keys are managed separately from the database.",
      technicalDetails:
        "MongoDB's WiredTiger storage engine writes the encrypted BSON documents to disk. For Queryable Encryption fields, special index structures are maintained to enable queries. The encrypted data is stored alongside any unencrypted fields in the document.",
      bestPractices:
        "• Implement database-level access controls even with encryption\n• Use encryption for backups and snapshots\n• Regularly rotate encryption keys\n• Monitor database access patterns for unusual behavior",
      code:
`// MongoDB stores the document with encrypted fields
// Storage example (what's actually on disk):
{
  "_id": ObjectId("6513a94e2b5d7a6e3c34d8f1"),
  "firstName": "Jane",
  "lastName": BinData(6, "Sk3Cb1xaZmhaWJwfnN33dv8gJlOwuDLBDlQTo..."),
  "ssn": BinData(6, "Ix98QwpnVmFoYupReWqScRbTlKxCxSqbBpLmiU..."),
  "dateOfBirth": BinData(6, "KwUiPoqnVmFoYupReWqScRbTlKxCcTqbBLm..."),
  "address": {
    "city": "Boston",
    "state": "MA"
  }
}`
    },
    "MONGO_READ": {
      phase: "MONGO_READ",
      title: "MongoDB Reads Encrypted Data",
      detailedDescription:
        "MongoDB retrieves the document from disk, keeping encrypted fields in their encrypted state. When the query involves encrypted fields using Queryable Encryption, MongoDB uses specialized indexes to find matching documents without decrypting the data.",
      securityImplications:
        "The data remains encrypted during the entire read process, protecting it from memory dumps and unauthorized access. This maintains the security of sensitive information even during active database operations.",
      technicalDetails:
        "For Queryable Encryption fields, MongoDB uses secure index structures that enable searching without decryption. The document is read from disk and returned to the driver with encrypted fields still in their encrypted state. The server never has access to the encryption keys needed to decrypt the data.",
      bestPractices:
        "• Use appropriate read concerns based on your consistency requirements\n• Design queries to efficiently use indexes on encrypted fields\n• Be aware that only equality queries are supported on encrypted fields\n• Consider performance implications when querying many encrypted fields",
      code:
`// MongoDB reads document with encrypted fields
db.patients.find({ lastName: "Smith" })

// Execution plan with Queryable Encryption
{
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
        "[BinData(6, \"ZncyZWRzajA1kSMksGNAslPXGtyQHcr9x\"), BinData(6, \"ZncyZWRzajA1kSMksGNAslPXGtyQHcr9x\")]"
      ]
    }
  }
}`
    },
    "DRIVER_RECEIVE": {
      phase: "DRIVER_RECEIVE",
      title: "Driver Receives Encrypted Response",
      detailedDescription:
        "The MongoDB driver receives the response from the database, which still contains encrypted fields. The driver prepares to pass this data back to the application, maintaining the encrypted state of sensitive data.",
      securityImplications:
        "By keeping the data encrypted until it reaches the client application, the system maintains end-to-end encryption. This reduces the risk of data exposure at intermediate layers of the application stack.",
      technicalDetails:
        "The driver receives BSON documents with binary encrypted fields and passes them through the application stack. The data remains encrypted until explicitly decrypted by the client application using the proper encryption keys.",
      bestPractices:
        "• Process responses efficiently to minimize memory usage\n• Implement proper error handling for database connection issues\n• Avoid logging responses containing encrypted fields\n• Use connection pooling for efficient connection management",
      code:
`// Driver receives encrypted document from MongoDB
async function findPatient(filter) {
  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db('medical');
    const patients = database.collection('patients');

    // Execute query - result still has encrypted fields
    const result = await patients.findOne(filter);

    // Return encrypted document to application
    return result;
  } finally {
    // Manage connection
    await client.close();
  }
}`
    },
    "API_RESPOND": {
      phase: "API_RESPOND",
      title: "API Sends Response to Client",
      detailedDescription:
        "The API server sends the response back to the client application with sensitive fields still encrypted. The API adds any necessary metadata, headers, and formats the response according to the API contract.",
      securityImplications:
        "Maintaining encryption throughout the API layer ensures that sensitive data remains protected even if there's a vulnerability in the API or if API logs are compromised. This follows the principle of defense in depth.",
      technicalDetails:
        "The API formats the response according to its contract, potentially adding pagination information, timestamps, or other metadata. However, it doesn't modify or attempt to decrypt the encrypted fields, as it doesn't have access to the encryption keys.",
      bestPractices:
        "• Use HTTPS for all API communications\n• Implement appropriate response caching strategies\n• Include necessary metadata like timestamps and request IDs\n• Apply compression for large responses when appropriate",
      code:
`// API sends response with encrypted fields back to client
app.get('/api/patients/:id', authenticate, async (req, res) => {
  try {
    const patientId = req.params.id;

    // Get patient document (with encrypted fields)
    const patient = await patientService.findPatientById(patientId);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Send response - encrypted fields remain encrypted
    res.status(200).json({
      data: patient,
      meta: {
        timestamp: new Date(),
        requestId: req.id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`
    },
    "CLIENT_DECRYPT": {
      phase: "CLIENT_DECRYPT",
      title: "Client Decrypts Response",
      detailedDescription:
        "The client application receives the response from the API and decrypts the sensitive fields locally. This is the final step in the encryption journey, where the protected data is finally made readable for the end-user.",
      securityImplications:
        "Client-side decryption ensures that sensitive data is only ever decrypted on the client device and only when needed. This completes the end-to-end encryption process, protecting data throughout its entire lifecycle.",
      technicalDetails:
        "The client uses the same encryption library and keys used for encryption to decrypt the data. It identifies encrypted fields in the document and applies the appropriate decryption algorithm based on the encryption type (QE, DET, or RAND).",
      bestPractices:
        "• Only decrypt data when necessary for display or processing\n• Clear decrypted data from memory when no longer needed\n• Implement proper error handling for decryption failures\n• Use secure key storage on client devices",
      code:
`// Client-side decryption of received document
async function displayPatientData(encryptedPatient) {
  try {
    // Decrypt the document using client encryption
    const decryptedPatient = await clientEncryption.decrypt(
      encryptedPatient
    );

    // Now safe to display or process the decrypted data
    renderPatientView(decryptedPatient);

    // Example of what was decrypted:
    // Before: { ssn: BinData(6, "Ix98QwpnVmFoYup...") }
    // After: { ssn: "123-45-6789" }
  } catch (error) {
    console.error('Failed to decrypt patient data:', error);
    showErrorMessage('Could not decrypt patient information');
  }
}`
    }
  };

  // Update explanation when selected event changes
  useEffect(() => {
    if (selectedEvent) {
      setExplanationContent(phaseExplanations[selectedEvent.phase]);
    } else {
      setExplanationContent(null);
    }
  }, [selectedEvent]);

  if (!selectedEvent || !explanationContent) {
    return null;
  }

  return (
    <AnimatePresence>
      {!isExpanded && selectedEvent && (
        <motion.button
          className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-primary text-mongo-dark-900 font-medium text-sm py-2 px-5 rounded-t-lg shadow-lg z-50 w-auto max-w-xs md:max-w-md"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onToggleExpand}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 15L12 8L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="text-center flex-1 flex flex-col">
              <span>Show Explanation</span>
              {selectedEvent && (
                <span className="text-xs opacity-80 truncate">
                  {explanationContent?.title || selectedEvent.phase.replace(/_/g, " ")}
                </span>
              )}
            </div>
          </div>
        </motion.button>
      )}

      {isExpanded && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 bg-mongo-dark-800 border-t border-accent/20 shadow-lg"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="p-3 md:p-4 max-w-7xl mx-auto">
            {/* Drag handle for visual indication this is a movable panel */}
            <div className="absolute top-0 left-0 right-0 h-2 flex justify-center">
              <div className="w-16 h-1 bg-accent/30 rounded-full mt-1"></div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 pt-2">
              <div>
                <h3 className="text-lg font-semibold text-primary">
                  {explanationContent.title}
                </h3>
                <p className="text-sm text-neutral-400">
                  Phase: <span className="font-mono">{selectedEvent.phase}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleExpand}
                  className="bg-mongo-dark-700 hover:bg-mongo-dark-600 text-neutral-400 hover:text-neutral-200 p-1.5 rounded"
                  title="Minimize panel"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-accent/20 mb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent pb-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === "overview"
                    ? "border-b-2 border-primary text-primary"
                    : "text-neutral-400 hover:text-neutral-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("technical")}
                className={`px-4 py-2 text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === "technical"
                    ? "border-b-2 border-primary text-primary"
                    : "text-neutral-400 hover:text-neutral-300"
                }`}
              >
                Technical Details
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-4 py-2 text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === "security"
                    ? "border-b-2 border-primary text-primary"
                    : "text-neutral-400 hover:text-neutral-300"
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`px-4 py-2 text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === "code"
                    ? "border-b-2 border-primary text-primary"
                    : "text-neutral-400 hover:text-neutral-300"
                }`}
              >
                Code Example
              </button>
            </div>

            {/* Tab Content */}
            <div className="overflow-auto max-h-[30vh] md:max-h-[40vh]">
              {activeTab === "overview" && (
                <div className="text-neutral-300 text-sm">
                  {explanationContent.detailedDescription}
                </div>
              )}

              {activeTab === "technical" && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-200 mb-2">Technical Implementation</h4>
                  <p className="text-neutral-300 text-sm">
                    {explanationContent.technicalDetails}
                  </p>

                  <h4 className="text-sm font-medium text-neutral-200 mt-4 mb-2">Best Practices</h4>
                  <pre className="bg-mongo-dark-900 p-3 rounded text-xs text-neutral-300 whitespace-pre-wrap">
                    {explanationContent.bestPractices}
                  </pre>
                </div>
              )}

              {activeTab === "security" && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-200 mb-2">Security Implications</h4>
                  <p className="text-neutral-300 text-sm">
                    {explanationContent.securityImplications}
                  </p>

                  {selectedEvent.fields && selectedEvent.fields.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-neutral-200 mb-2">Encrypted Fields</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedEvent.fields.map((field, index) => (
                          <div key={index} className="bg-mongo-dark-900 p-2 rounded">
                            <div className="flex flex-wrap justify-between">
                              <span className="text-xs font-mono text-neutral-300 truncate max-w-full sm:max-w-[70%]">{field.name}</span>
                              <span className={`text-xs font-mono ${
                                field.encryption === "qe" ? "text-primary" :
                                field.encryption === "det" ? "text-yellow-400" :
                                field.encryption === "rand" ? "text-red-400" :
                                "text-neutral-400"
                              }`}>
                                {field.encryption.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "code" && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-200 mb-2">Implementation Example</h4>
                  <div className="relative">
                    <pre className="bg-mongo-dark-900 p-3 rounded text-xs font-mono text-neutral-300 overflow-auto whitespace-pre max-h-64">
                      {explanationContent.code}
                    </pre>
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => {
                          if (explanationContent.code) {
                            navigator.clipboard.writeText(explanationContent.code);
                          }
                        }}
                        className="bg-mongo-dark-800/80 hover:bg-mongo-dark-700 text-xs text-neutral-400 hover:text-neutral-300 px-2 py-1 rounded"
                        title="Copy code"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {explanationContent.links && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-neutral-200 mb-2">Additional Resources</h4>
                      <ul className="list-disc pl-4">
                        {explanationContent.links.map((link, index) => (
                          <li key={index} className="text-xs text-primary">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {link.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Navigation - When explain mode is active, show a next event button */}
            {explainMode && (
              <div className="flex justify-end mt-4 gap-2">
                <div className="text-xs text-neutral-500">
                  Explanation mode is active. Navigate through events to see detailed explanations of each phase.
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

DetailedExplanationPanel.displayName = "DetailedExplanationPanel";