export default function TestStaticPage() {
  return (
    <div className="min-h-screen bg-mongo-dark-900 p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Static Test Page</h1>
      
      <div className="bg-mongo-dark-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-neutral-200 mb-4">This is a static page</h2>
        <p className="text-neutral-300 mb-4">
          If you can see this, the basic Next.js setup is working correctly.
        </p>
        
        <div className="space-y-4">
          <div className="bg-mongo-dark-700 p-4 rounded">
            <h3 className="text-lg font-semibold text-primary mb-2">✅ Static Rendering</h3>
            <p className="text-neutral-300">This page renders statically without any client-side JavaScript.</p>
          </div>
          
          <div className="bg-mongo-dark-700 p-4 rounded">
            <h3 className="text-lg font-semibold text-primary mb-2">✅ Tailwind CSS</h3>
            <p className="text-neutral-300">MongoDB-themed colors are working: primary green, dark backgrounds, neutral text.</p>
          </div>
          
          <div className="bg-mongo-dark-700 p-4 rounded">
            <h3 className="text-lg font-semibold text-primary mb-2">✅ Next.js App Router</h3>
            <p className="text-neutral-300">The App Router is functioning correctly with TypeScript support.</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-accent/20 rounded-lg border border-accent/30">
          <p className="text-neutral-300 text-sm">
            <strong>Next step:</strong> Test client-side JavaScript execution with a simple button click.
          </p>
        </div>
      </div>
    </div>
  );
}
