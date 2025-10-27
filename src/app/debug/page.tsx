"use client";

import { useTraceSession } from "@/lib/api";

export default function DebugPage() {
  const { data, isLoading, error } = useTraceSession("demo");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
        </div>
        
        <div>
          <strong>Error:</strong> {error ? error.message : "None"}
        </div>
        
        <div>
          <strong>Data:</strong>
          <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
            {data ? JSON.stringify(data, null, 2) : "No data"}
          </pre>
        </div>
      </div>
    </div>
  );
}
