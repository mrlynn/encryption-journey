"use client";

import { useState } from "react";

export default function TestClientPage() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log('Button clicked!');
    setCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-mongo-dark-900 p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Client Test Page</h1>
      
      <div className="bg-mongo-dark-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-neutral-200 mb-4">Client-side JavaScript Test</h2>
        <p className="text-neutral-300 mb-4">
          If you can see this and the button works, client-side JavaScript is working.
        </p>
        
        <div className="space-y-4">
          <div className="bg-mongo-dark-700 p-4 rounded">
            <h3 className="text-lg font-semibold text-primary mb-2">Button Test</h3>
            <button
              onClick={handleClick}
              className="bg-primary hover:bg-primary/90 text-mongo-dark-900 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Click me! Count: {count}
            </button>
            <p className="text-neutral-300 text-sm mt-2">
              If this button works and the count increases, client-side JavaScript is functional.
            </p>
          </div>
          
          <div className="bg-mongo-dark-700 p-4 rounded">
            <h3 className="text-lg font-semibold text-primary mb-2">Console Test</h3>
            <p className="text-neutral-300 text-sm">
              Check the browser console for "Button clicked!" messages when you click the button.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
