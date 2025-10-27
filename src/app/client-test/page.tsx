"use client";

import { useState, useEffect } from "react";
import { TraceSession } from "@/types/trace";

export default function ClientTestPage() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState<TraceSession | null>(null);

  useEffect(() => {
    // Simple test to see if useEffect works
    const timer = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);

    // Test API call
    fetch('/api/trace/demo')
      .then(res => res.json())
      .then(data => {
        setData(data);
      })
      .catch(err => {
        console.error('API Error:', err);
      });

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Client Test Page</h1>
      <p>Counter: {count}</p>
      <p>Data loaded: {data ? 'Yes' : 'No'}</p>
      {data && (
        <div>
          <p>Session ID: {data.sessionId}</p>
          <p>Events: {data.events?.length}</p>
        </div>
      )}
    </div>
  );
}
