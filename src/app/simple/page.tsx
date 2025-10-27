"use client";

import { useState, useEffect } from "react";

export default function SimplePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Test direct fetch
    fetch('/demo/sessions/seed-create-then-read.json')
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Test Page</h1>
      
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
