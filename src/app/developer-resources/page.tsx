"use client";

import { useState } from "react";
import Link from "next/link";
import { DeveloperGuide } from "@/components/Resources/DeveloperGuide";

export default function DeveloperResourcesPage() {
  const [activeTab, setActiveTab] = useState("guide");

  return (
    <div className="min-h-screen bg-mongo-dark-900 flex flex-col">
      {/* Header */}
      <header className="bg-mongo-dark-800 border-b border-accent/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">MongoDB Queryable Encryption</h1>
            <p className="text-neutral-400 text-sm">Developer Resources & Implementation Guide</p>
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
        <div className="grid grid-cols-1 gap-6">
          {/* Page Tabs */}
          <div className="flex border-b border-accent/20">
            <button
              onClick={() => setActiveTab("guide")}
              className={`px-4 py-2 text-sm ${
                activeTab === "guide" ? "border-b-2 border-primary text-primary" : "text-neutral-300 hover:bg-mongo-dark-800"
              }`}
            >
              Implementation Guide
            </button>
            <button
              onClick={() => setActiveTab("concepts")}
              className={`px-4 py-2 text-sm ${
                activeTab === "concepts" ? "border-b-2 border-primary text-primary" : "text-neutral-300 hover:bg-mongo-dark-800"
              }`}
            >
              Key Concepts
            </button>
            <Link
              href="/query-console"
              className="px-4 py-2 text-sm text-neutral-300 hover:bg-mongo-dark-800"
            >
              Query Console →
            </Link>
          </div>

          {/* Developer Guide */}
          {activeTab === "guide" && (
            <DeveloperGuide />
          )}

          {/* Key Concepts */}
          {activeTab === "concepts" && (
            <div className="bg-mongo-dark-800 rounded-lg border border-accent/20 p-6">
              <h2 className="text-xl font-medium text-primary mb-4">Key Concepts of MongoDB Queryable Encryption</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-neutral-200 mb-2">Why Encrypt Your Data?</h3>
                  <p className="text-sm text-neutral-400">
                    In today's data-driven world, protecting sensitive information is critical. MongoDB's Queryable
                    Encryption helps organizations comply with regulations like GDPR, HIPAA, and CCPA while protecting
                    customer data from unauthorized access, data breaches, and insider threats.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-mongo-dark-700 p-4 rounded-lg border border-accent/10">
                    <h4 className="text-md font-medium text-neutral-200 mb-2">Client-Side Encryption</h4>
                    <p className="text-xs text-neutral-400">
                      Data is encrypted and decrypted in the client application, not on the database server. This means sensitive
                      data is never exposed as plaintext on the server, significantly reducing the attack surface.
                    </p>
                    <div className="mt-2 bg-mongo-dark-900 p-2 rounded">
                      <div className="text-xs font-mono text-green-400">App → [Encrypt] → MongoDB → [Decrypt] → App</div>
                    </div>
                  </div>

                  <div className="bg-mongo-dark-700 p-4 rounded-lg border border-accent/10">
                    <h4 className="text-md font-medium text-neutral-200 mb-2">Queryable Encryption</h4>
                    <p className="text-xs text-neutral-400">
                      A revolutionary technique that allows querying encrypted data without decrypting it first. It uses
                      secure indexes that enable equality searches while keeping the data fully encrypted.
                    </p>
                    <div className="mt-2 bg-mongo-dark-900 p-2 rounded">
                      <div className="text-xs font-mono text-green-400">find(&#123; "lastName": "Smith" &#125;) -&gt; <span className="text-yellow-400">works on encrypted data!</span></div>
                    </div>
                  </div>
                </div>

                <div className="bg-mongo-dark-700 p-4 rounded-lg border border-accent/10">
                  <h4 className="text-md font-medium text-neutral-200 mb-2">Defense in Depth</h4>
                  <p className="text-sm text-neutral-400 mb-3">
                    MongoDB Queryable Encryption provides multiple layers of security:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-mongo-dark-900 p-3 rounded">
                      <h5 className="text-sm text-primary font-medium mb-1">Encrypted at Rest</h5>
                      <p className="text-xs text-neutral-400">
                        Data is stored in encrypted form on disk, protected even if someone gains access to database files.
                      </p>
                    </div>
                    <div className="bg-mongo-dark-900 p-3 rounded">
                      <h5 className="text-sm text-primary font-medium mb-1">Encrypted in Transit</h5>
                      <p className="text-xs text-neutral-400">
                        Data remains encrypted as it moves between client and server over the network.
                      </p>
                    </div>
                    <div className="bg-mongo-dark-900 p-3 rounded">
                      <h5 className="text-sm text-primary font-medium mb-1">Encrypted in Use</h5>
                      <p className="text-xs text-neutral-400">
                        Data remains encrypted in memory on the server during query processing.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-neutral-200 mb-2">Key Management Architecture</h3>
                  <div className="bg-mongo-dark-700 p-4 rounded-lg border border-accent/10">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="md:w-1/2">
                        <h4 className="text-md font-medium text-neutral-300 mb-2">Two-Tier Key Hierarchy</h4>
                        <p className="text-xs text-neutral-400 mb-4">
                          MongoDB Queryable Encryption uses a two-tier key hierarchy for maximum security:
                        </p>
                        <ul className="text-xs text-neutral-400 space-y-3 list-disc pl-4">
                          <li>
                            <span className="text-primary font-medium">Customer Master Key (CMK)</span>: Stored in an external
                            Key Management Service (AWS KMS, Azure Key Vault, GCP KMS). Never stored in MongoDB.
                          </li>
                          <li>
                            <span className="text-primary font-medium">Data Encryption Keys (DEK)</span>: Used to encrypt individual
                            fields. Stored encrypted in the key vault collection, protected by the CMK.
                          </li>
                        </ul>
                      </div>
                      <div className="md:w-1/2">
                        <div className="bg-mongo-dark-900 p-3 rounded h-full">
                          <h5 className="text-xs text-neutral-300 font-medium mb-2">Key Management Flow</h5>
                          <div className="text-xs text-neutral-400">
                            <p className="mb-2">1. Application requests DEK from key vault</p>
                            <p className="mb-2">2. DEK is decrypted using CMK from external KMS</p>
                            <p className="mb-2">3. Application uses DEK to encrypt/decrypt data</p>
                            <p className="mb-2">4. DEK is securely removed from memory after use</p>
                            <p>5. Only encrypted data is stored in database</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                  <h4 className="text-md font-medium text-primary mb-2">Encryption Best Practices</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm text-neutral-200 font-medium mb-1">Field Selection</h5>
                      <ul className="text-xs text-neutral-400 space-y-1 list-disc pl-4">
                        <li>Identify all sensitive fields that require encryption</li>
                        <li>Use the appropriate encryption type based on query needs</li>
                        <li>Consider performance implications of encrypting many fields</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm text-neutral-200 font-medium mb-1">Key Management</h5>
                      <ul className="text-xs text-neutral-400 space-y-1 list-disc pl-4">
                        <li>Use a reputable Key Management Service</li>
                        <li>Implement key rotation procedures</li>
                        <li>Create separate keys for different collections/purposes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Link
                    href="/query-console"
                    className="px-4 py-2 bg-primary text-mongo-dark-900 rounded hover:bg-primary/90 transition-colors"
                  >
                    Try the Interactive Query Console →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}