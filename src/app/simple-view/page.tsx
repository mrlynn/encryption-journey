"use client";

import { useState, useEffect } from "react";
import { TraceSession } from "@/types/trace";

export default function SimpleViewPage() {
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
    return (
      <div className="min-h-screen bg-mongo-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-300">Loading session data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mongo-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Session</h2>
          <p className="text-neutral-300 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mongo-dark-900 p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Simple View Test</h1>
      
      <div className="bg-mongo-dark-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-neutral-200 mb-4">Session Data</h2>
        <p className="text-neutral-300 mb-2">Session ID: {data?.sessionId}</p>
        <p className="text-neutral-300 mb-2">Events: {data?.events?.length}</p>
        <p className="text-neutral-300 mb-4">Description: {data?.description}</p>
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-neutral-200 mb-2">Events:</h3>
          <div className="space-y-2">
            {data?.events?.slice(0, 5).map((event, index) => (
              <div key={event.id} className="bg-mongo-dark-700 p-3 rounded">
                <p className="text-sm text-neutral-300">
                  {index + 1}. {event.phase} - {event.actor} {event.verb} {event.dataset}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
