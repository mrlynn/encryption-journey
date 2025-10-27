"use client";

import { useState, useEffect } from "react";
import { TraceSession } from "@/types/trace";

export default function MinimalPage() {
  const [data, setData] = useState<TraceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/trace/demo')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Minimal Test</h1>
      <p>Session ID: {data?.sessionId}</p>
      <p>Events: {data?.events?.length}</p>
      <pre className="bg-gray-100 p-4 rounded mt-4 overflow-auto max-h-96">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
