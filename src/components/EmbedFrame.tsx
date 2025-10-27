"use client";

import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface EmbedFrameProps {
  sessionId: string;
  width?: number | string;
  height?: number | string;
  compact?: boolean;
  showControls?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const EmbedFrame = memo(({
  sessionId,
  width = "100%",
  height = 600,
  compact = false,
  showControls = true,
  onLoad,
  onError,
}: EmbedFrameProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";

  const embedUrl = `${baseUrl}/view/${sessionId}`;
  const iframeHeight = compact ? 400 : height;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our own domain
      if (event.origin !== baseUrl) return;

      switch (event.data.type) {
        case "embed-loaded":
          setIsLoaded(true);
          onLoad?.();
          break;
        case "embed-error":
          setHasError(true);
          onError?.(new Error(event.data.message));
          break;
        case "embed-ready":
          // Send configuration to the embedded visualizer
          event.source?.postMessage({
            type: "embed-config",
            config: {
              compact,
              showControls,
            },
          }, { targetOrigin: baseUrl });
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [baseUrl, compact, showControls, onLoad, onError]);

  if (hasError) {
    return (
      <div 
        className="bg-mongo-dark-900 border border-red-400 rounded-lg flex items-center justify-center"
        style={{ width, height: iframeHeight }}
      >
        <div className="text-center p-8">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Failed to Load Visualizer
          </h3>
          <p className="text-neutral-400 text-sm">
            Unable to load the encryption journey visualizer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height: iframeHeight }}>
      {/* Loading Overlay */}
      {!isLoaded && (
        <motion.div
          className="absolute inset-0 bg-mongo-dark-900 border border-accent/20 rounded-lg flex items-center justify-center z-10"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoaded ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-neutral-300 text-sm">Loading visualizer...</p>
          </div>
        </motion.div>
      )}

      {/* Iframe */}
      <iframe
        src={embedUrl}
        width="100%"
        height={iframeHeight}
        className="border-0 rounded-lg"
        style={{
          background: "#001E2B",
        }}
        title="Encryption Journey Visualizer"
        allow="fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />

      {/* Embed Info */}
      <div className="absolute bottom-2 right-2 text-xs text-neutral-500">
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          Open in new tab
        </a>
      </div>
    </div>
  );
});

// Embed code generator component
export const EmbedCodeGenerator = memo(({ sessionId }: { sessionId: string }) => {
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";

  const embedUrl = `${baseUrl}/view/${sessionId}`;

  const embedCodes = {
    html: `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`,
    react: `<EmbedFrame sessionId="${sessionId}" width="100%" height={600} />`,
    docusaurus: `import EmbedFrame from '@site/src/components/EmbedFrame';

<EmbedFrame 
  sessionId="${sessionId}" 
  width="100%" 
  height={600} 
/>`,
    symfony: `{{ render(controller('App\\Controller\\EmbedController::visualizer', {
    'sessionId': '${sessionId}',
    'width': '100%',
    'height': 600
})) }}`,
  };

  const [activeTab, setActiveTab] = useState<keyof typeof embedCodes>("html");

  return (
    <div className="bg-mongo-dark-800 border border-accent/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-primary mb-4">Embed Code</h3>
      
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        {Object.keys(embedCodes).map((tab) => (
          <button
            key={tab}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-primary text-mongo-dark-900"
                : "bg-mongo-dark-700 text-neutral-300 hover:bg-mongo-dark-600"
            }`}
            onClick={() => setActiveTab(tab as keyof typeof embedCodes)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Code Block */}
      <div className="bg-mongo-dark-900 rounded-lg p-4 border border-accent/10">
        <pre className="text-sm text-neutral-200 font-mono whitespace-pre-wrap overflow-x-auto">
          {embedCodes[activeTab]}
        </pre>
      </div>

      {/* Copy Button */}
      <button
        className="mt-4 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        onClick={() => {
          navigator.clipboard.writeText(embedCodes[activeTab]);
        }}
      >
        📋 Copy Code
      </button>
    </div>
  );
});

EmbedFrame.displayName = "EmbedFrame";
EmbedCodeGenerator.displayName = "EmbedCodeGenerator";
