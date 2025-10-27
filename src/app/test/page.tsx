"use client";

import { useState, useEffect } from "react";
import { loadSessionData } from "@/lib/api";
import { TraceSession } from "@/types/trace";

export default function TestPage() {
  const [data, setData] = useState<TraceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSessionData("demo")
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Loading:</strong> {loading ? "Yes" : "No"}
        </div>
        
        <div>
          <strong>Error:</strong> {error || "None"}
        </div>
        
        <div>
          <strong>Data:</strong>
          <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto max-h-96">
            {data ? JSON.stringify(data, null, 2) : "No data"}
          </pre>
        </div>
      </div>
    </div>
  );
}
