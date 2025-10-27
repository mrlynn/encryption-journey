"use client";

import { useState, useEffect } from "react";
import { TraceSession, TraceEvent } from "@/types/trace";

export default function TestSimplePage() {
  const [session, setSession] = useState<TraceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Test page useEffect running - this should appear in browser console');
    
    // Add a timeout to see if useEffect runs at all
    setTimeout(() => {
      console.log('Timeout reached - useEffect is running');
    }, 1000);
    
    fetch('/api/trace/demo')
      .then(res => {
        console.log('API response status:', res.status);
        if (!res.ok) {
          throw new Error(`Failed to load session: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('API data received:', data);
        setSession(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('API error:', err);
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

  if (!session) {
    return (
      <div className="min-h-screen bg-mongo-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-neutral-400 text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-neutral-300 mb-2">Session Not Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mongo-dark-900 p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Simple Test Page</h1>
      
      <div className="bg-mongo-dark-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-neutral-200 mb-4">Session Data</h2>
        <p className="text-neutral-300 mb-2">Session ID: {session.id}</p>
        <p className="text-neutral-300 mb-2">Events: {session.events.length}</p>
        <p className="text-neutral-300 mb-4">Description: {session.description}</p>
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-neutral-200 mb-2">First 3 Events:</h3>
          <div className="space-y-2">
            {session.events.slice(0, 3).map((event, index) => (
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
