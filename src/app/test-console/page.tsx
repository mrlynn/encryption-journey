"use client";

import { useEffect } from "react";

export default function TestConsolePage() {
  useEffect(() => {
    console.log('=== CLIENT-SIDE JAVASCRIPT IS WORKING ===');
    console.log('This should appear in the browser console');
    
    // Also try to show an alert
    setTimeout(() => {
      console.log('Timeout reached - useEffect is definitely running');
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen bg-mongo-dark-900 p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Console Test Page</h1>
      
      <div className="bg-mongo-dark-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-neutral-200 mb-4">Console Test</h2>
        <p className="text-neutral-300 mb-4">
          Check the browser console for "CLIENT-SIDE JAVASCRIPT IS WORKING" message.
        </p>
        
        <div className="bg-mongo-dark-700 p-4 rounded">
          <h3 className="text-lg font-semibold text-primary mb-2">Instructions</h3>
          <ol className="text-neutral-300 text-sm space-y-1 list-decimal list-inside">
            <li>Open browser developer tools (F12)</li>
            <li>Go to the Console tab</li>
            <li>Look for "CLIENT-SIDE JAVASCRIPT IS WORKING" message</li>
            <li>If you see it, client-side JavaScript is working</li>
            <li>If you don't see it, there's a hydration issue</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
