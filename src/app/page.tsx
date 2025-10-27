import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mongo-dark-900 via-mongo-dark-800 to-accent-900 flex flex-col pt-16">
      {/* Hero Section */}
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold text-primary mb-4">
              Encryption Journey
            </h1>
            <p className="text-2xl text-neutral-200 mb-2">
              Visualize Patient Record Security
            </p>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Watch how sensitive patient data flows through client-side encryption,
              transport security, MongoDB Queryable Encryption, and secure decryption
              in real-time.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-mongo-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-primary mb-2">Queryable Encryption</h3>
              <p className="text-neutral-300 text-sm">
                See how MongoDB's field-level encryption enables secure queries on encrypted data
              </p>
            </div>

            <div className="bg-mongo-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-primary mb-2">Real-time Visualization</h3>
              <p className="text-neutral-300 text-sm">
                Animated flow diagrams show each step of the encryption journey
              </p>
            </div>

            <div className="bg-mongo-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-primary mb-2">Security First</h3>
              <p className="text-neutral-300 text-sm">
                Built for healthcare compliance with role-based access controls
              </p>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="space-y-4">
            <Link
              href="/view/demo"
              className="inline-block bg-primary hover:bg-primary/90 text-mongo-dark-900 font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🚀 Load Demo Session
            </Link>

            <div className="text-sm text-neutral-500">
              Experience a complete patient record creation and retrieval workflow
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Features Section */}
      <div className="bg-mongo-dark-900/90 backdrop-blur-md py-16">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            Interactive Features
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Link
              href="/interactive"
              className="bg-mongo-dark-800 rounded-2xl p-6 border border-accent/20 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">📝</div>
                <h3 className="text-xl font-semibold text-primary group-hover:text-primary/90">Patient Data Form</h3>
              </div>
              <p className="text-neutral-300 text-sm mb-4">
                Create a secure patient record with customizable encryption settings for different fields
              </p>
              <div className="flex justify-end">
                <span className="text-primary text-sm flex items-center">
                  Try it out
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 transform group-hover:translate-x-1 transition-transform">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </Link>

            <Link
              href="/query-console"
              className="bg-mongo-dark-800 rounded-2xl p-6 border border-accent/20 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">💻</div>
                <h3 className="text-xl font-semibold text-primary group-hover:text-primary/90">Query Console</h3>
              </div>
              <p className="text-neutral-300 text-sm mb-4">
                Experiment with queries against encrypted data and see how MongoDB Queryable Encryption works
              </p>
              <div className="flex justify-end">
                <span className="text-primary text-sm flex items-center">
                  Try it out
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 transform group-hover:translate-x-1 transition-transform">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </Link>

            <Link
              href="/encryption-visualizer"
              className="bg-mongo-dark-800 rounded-2xl p-6 border border-accent/20 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🔍</div>
                <h3 className="text-xl font-semibold text-primary group-hover:text-primary/90">Encryption Visualizer</h3>
              </div>
              <p className="text-neutral-300 text-sm mb-4">
                Compare different encryption modes and see how they transform data with interactive examples
              </p>
              <div className="flex justify-end">
                <span className="text-primary text-sm flex items-center">
                  Try it out
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 transform group-hover:translate-x-1 transition-transform">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </Link>

            <Link
              href="/developer-resources"
              className="bg-mongo-dark-800 rounded-2xl p-6 border border-accent/20 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">📚</div>
                <h3 className="text-xl font-semibold text-primary group-hover:text-primary/90">Developer Resources</h3>
              </div>
              <p className="text-neutral-300 text-sm mb-4">
                Implementation guides, code examples, and best practices for using MongoDB Queryable Encryption
              </p>
              <div className="flex justify-end">
                <span className="text-primary text-sm flex items-center">
                  Learn more
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 transform group-hover:translate-x-1 transition-transform">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-mongo-dark-900 py-8 border-t border-accent/20">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <p className="text-neutral-500 text-sm">
            Built for <span className="text-primary font-semibold">SecureHealth.dev</span> •
            Powered by <span className="text-primary font-semibold">MongoDB Queryable Encryption</span>
          </p>
        </div>
      </div>
    </div>
  );
}
