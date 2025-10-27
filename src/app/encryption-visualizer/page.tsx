"use client";

import { useState } from "react";
import Link from "next/link";
import { EncryptionModeVisualizer } from "@/components/Visualization/EncryptionModeVisualizer";
import { EncryptionMode } from "@/types/trace";

export default function EncryptionVisualizerPage() {
  const [activeMode, setActiveMode] = useState<EncryptionMode>("qe");

  return (
    <div className="min-h-screen bg-mongo-dark-900 flex flex-col">
      {/* Header */}
      <header className="bg-mongo-dark-800 border-b border-accent/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Encryption Mode Visualizer</h1>
            <p className="text-neutral-400 text-sm">Compare different encryption modes and their capabilities</p>
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
          {/* Left Column - Visualizer */}
          <div className="lg:col-span-2">
            <EncryptionModeVisualizer
              initialMode="qe"
              onModeChange={setActiveMode}
              animate={true}
              showLabels={true}
            />

            {/* Educational Section */}
            <div className="mt-6 bg-mongo-dark-800 rounded-lg border border-accent/20 p-4">
              <h2 className="text-lg font-medium text-primary mb-3">Understanding Encryption Modes</h2>
              <p className="text-sm text-neutral-400 mb-4">
                MongoDB offers multiple encryption types to balance security and query capabilities for different use cases.
                Choosing the right type depends on your specific security requirements and how you need to access the data.
              </p>

              <div className="space-y-4">
                <div className="bg-mongo-dark-700 p-3 rounded border border-accent/10">
                  <h3 className="text-sm font-medium text-primary mb-2">When to use Queryable Encryption</h3>
                  <p className="text-xs text-neutral-400">
                    Use Queryable Encryption when you need to search on encrypted fields while maintaining a high level of
                    security. It's ideal for fields like patient names, email addresses, or account numbers that you need
                    to search by exact matches but want to keep encrypted.
                  </p>
                  <div className="mt-2 bg-mongo-dark-900 p-2 rounded text-xs text-neutral-400">
                    <strong>Example:</strong> Patient last names that need to be searchable but kept secure
                  </div>
                </div>

                <div className="bg-mongo-dark-700 p-3 rounded border border-accent/10">
                  <h3 className="text-sm font-medium text-yellow-400 mb-2">When to use Deterministic Encryption</h3>
                  <p className="text-xs text-neutral-400">
                    Use Deterministic Encryption when you need to create unique indexes or perform equality matches on
                    encrypted fields, but the security requirements are less stringent than for highly sensitive data.
                  </p>
                  <div className="mt-2 bg-mongo-dark-900 p-2 rounded text-xs text-neutral-400">
                    <strong>Example:</strong> ZIP codes or dates that need exact matching
                  </div>
                </div>

                <div className="bg-mongo-dark-700 p-3 rounded border border-accent/10">
                  <h3 className="text-sm font-medium text-red-400 mb-2">When to use Randomized Encryption</h3>
                  <p className="text-xs text-neutral-400">
                    Use Randomized Encryption for your most sensitive data that doesn't need to be queried directly.
                    This provides the highest level of security by generating different ciphertext even for identical
                    plaintext values.
                  </p>
                  <div className="mt-2 bg-mongo-dark-900 p-2 rounded text-xs text-neutral-400">
                    <strong>Example:</strong> Social Security Numbers, credit card numbers, or medical diagnoses
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Comparison and Resources */}
          <div>
            {/* Encryption Modes Comparison */}
            <div className="bg-mongo-dark-800 rounded-lg border border-accent/20 p-4 mb-6">
              <h2 className="text-md font-medium text-primary mb-3">Encryption Modes Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-accent/20">
                      <th className="text-left p-2 text-neutral-400">Feature</th>
                      <th className="p-2 text-center text-primary">Queryable</th>
                      <th className="p-2 text-center text-yellow-400">Deterministic</th>
                      <th className="p-2 text-center text-red-400">Randomized</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-accent/10">
                      <td className="p-2 text-neutral-300">Security Level</td>
                      <td className="p-2 text-center">High</td>
                      <td className="p-2 text-center">Medium</td>
                      <td className="p-2 text-center">Highest</td>
                    </tr>
                    <tr className="border-b border-accent/10">
                      <td className="p-2 text-neutral-300">Equality Queries</td>
                      <td className="p-2 text-center text-green-400">✓</td>
                      <td className="p-2 text-center text-green-400">✓</td>
                      <td className="p-2 text-center text-red-400">✗</td>
                    </tr>
                    <tr className="border-b border-accent/10">
                      <td className="p-2 text-neutral-300">Range Queries</td>
                      <td className="p-2 text-center text-red-400">✗</td>
                      <td className="p-2 text-center text-red-400">✗</td>
                      <td className="p-2 text-center text-red-400">✗</td>
                    </tr>
                    <tr className="border-b border-accent/10">
                      <td className="p-2 text-neutral-300">Unique Indexes</td>
                      <td className="p-2 text-center text-green-400">✓</td>
                      <td className="p-2 text-center text-green-400">✓</td>
                      <td className="p-2 text-center text-red-400">✗</td>
                    </tr>
                    <tr className="border-b border-accent/10">
                      <td className="p-2 text-neutral-300">Pattern Analysis Risk</td>
                      <td className="p-2 text-center">Very Low</td>
                      <td className="p-2 text-center">Medium</td>
                      <td className="p-2 text-center">None</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-neutral-300">Performance Impact</td>
                      <td className="p-2 text-center">Medium</td>
                      <td className="p-2 text-center">Low</td>
                      <td className="p-2 text-center">High</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sample Data Scenarios */}
            <div className="bg-mongo-dark-800 rounded-lg border border-accent/20 p-4 mb-6">
              <h2 className="text-md font-medium text-primary mb-3">Sample Healthcare Data Scenarios</h2>
              <div className="space-y-3">
                <div className="bg-mongo-dark-700 p-2 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-300">Patient Name</span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-primary/20 text-primary border border-primary/30">
                      QE
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Need to search by name but keep it secure from database admins and potential breaches
                  </p>
                </div>

                <div className="bg-mongo-dark-700 p-2 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-300">Date of Birth</span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      DET
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Needs exact matching for filtering patient records by birth date
                  </p>
                </div>

                <div className="bg-mongo-dark-700 p-2 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-300">Social Security Number</span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-red-500/20 text-red-400 border border-red-500/30">
                      RAND
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Highly sensitive data that requires maximum protection
                  </p>
                </div>

                <div className="bg-mongo-dark-700 p-2 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-300">Medical Notes</span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-red-500/20 text-red-400 border border-red-500/30">
                      RAND
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Contains sensitive diagnoses and treatment information
                  </p>
                </div>

                <div className="bg-mongo-dark-700 p-2 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-300">Address</span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-neutral-500/20 text-neutral-400 border border-neutral-500/30">
                      NONE
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Need full query capabilities for geographic grouping and analysis
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-mongo-dark-800 rounded-lg border border-accent/20 p-4">
              <h2 className="text-md font-medium text-primary mb-3">Explore More</h2>
              <div className="space-y-2">
                <Link
                  href="/query-console"
                  className="flex items-center justify-between p-2 bg-mongo-dark-700 rounded hover:bg-mongo-dark-600 transition-colors"
                >
                  <span className="text-sm text-neutral-300">Try the Query Console</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link
                  href="/developer-resources"
                  className="flex items-center justify-between p-2 bg-mongo-dark-700 rounded hover:bg-mongo-dark-600 transition-colors"
                >
                  <span className="text-sm text-neutral-300">Developer Resources</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link
                  href="/interactive"
                  className="flex items-center justify-between p-2 bg-mongo-dark-700 rounded hover:bg-mongo-dark-600 transition-colors"
                >
                  <span className="text-sm text-neutral-300">Create Patient Record</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link
                  href="/view/demo"
                  className="flex items-center justify-between p-2 bg-mongo-dark-700 rounded hover:bg-mongo-dark-600 transition-colors"
                >
                  <span className="text-sm text-neutral-300">View Full Encryption Journey</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}