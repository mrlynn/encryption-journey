"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TraceEvent, TracePhase } from "@/types/trace";
import { ReactFlowInstance } from "@xyflow/react";

interface EncryptionTourProps {
  events: TraceEvent[];
  currentEventIndex: number;
  onSelectEvent: (event: TraceEvent, index: number) => void;
  onToggleTour: () => void;
  isActive: boolean;
  reactFlowInstance: ReactFlowInstance | null;
}

interface TourStep {
  title: string;
  description: string;
  phase: TracePhase;
  nodeId: string;
  zoom: number;
}

export const EncryptionTour: React.FC<EncryptionTourProps> = ({
  events,
  currentEventIndex,
  onSelectEvent,
  onToggleTour,
  isActive,
  reactFlowInstance,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Define the tour steps
  const tourSteps: TourStep[] = [
    {
      title: "Client-Side Encryption",
      description: "Data is encrypted before leaving the client. This prevents sensitive information from being exposed during transmission or storage.",
      phase: "CLIENT_ENCRYPT",
      nodeId: "client",
      zoom: 1.5,
    },
    {
      title: "API Receives Encrypted Request",
      description: "The API receives the encrypted data but cannot decrypt it. This 'defense in depth' approach protects data even if the API server is compromised.",
      phase: "API_RECEIVE",
      nodeId: "api",
      zoom: 1.5,
    },
    {
      title: "MongoDB Driver Preparation",
      description: "The MongoDB driver formats the request with necessary encryption metadata to enable Queryable Encryption capabilities.",
      phase: "DRIVER_SEND",
      nodeId: "driver",
      zoom: 1.5,
    },
    {
      title: "Queryable Encryption in Action",
      description: "MongoDB processes the query on encrypted data using specialized indexes that allow searching without decryption - the data stays secure!",
      phase: "MONGO_MATCH_QE",
      nodeId: "mongo",
      zoom: 1.5,
    },
    {
      title: "Encrypted Data Storage",
      description: "Data is stored in encrypted form. Even database administrators with full access cannot view the sensitive information.",
      phase: "MONGO_STORE",
      nodeId: "mongo",
      zoom: 1.5,
    },
    {
      title: "Client Decryption",
      description: "Finally, the encrypted response is decrypted only on the client side, ensuring end-to-end protection of sensitive information.",
      phase: "CLIENT_DECRYPT",
      nodeId: "client",
      zoom: 1.5,
    },
  ];

  // Find the event index for a specific phase
  const findEventIndexForPhase = useCallback(
    (phase: TracePhase): number => {
      return events.findIndex((event) => event.phase === phase);
    },
    [events]
  );

  // Handle stepping through the tour
  const handleNextStep = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, tourSteps.length]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Handle node positioning for the current step
  const positionViewportForNode = useCallback((nodeId: string, zoom: number) => {
    if (!reactFlowInstance || !isActive) return;

    // In a more limited approach, we use fitView to focus on the node
    // and then use a timer to shift the view up
    reactFlowInstance.fitView({
      nodes: [{ id: nodeId }],
      duration: 800,
      padding: 0.2,
      minZoom: zoom,
      maxZoom: zoom,
    });

    // After the fitView animation, shift the viewport up to account for the tour panel
    setTimeout(() => {
      const { x, y, zoom: currentZoom } = reactFlowInstance.getViewport();
      reactFlowInstance.setViewport(
        { x, y: y - 180, zoom: currentZoom },
        { duration: 300 }
      );
    }, 850);
  }, [reactFlowInstance, isActive]);

  // Focus on the node associated with the current step
  useEffect(() => {
    if (!isActive || !reactFlowInstance) return;

    const step = tourSteps[currentStep];
    const eventIndex = findEventIndexForPhase(step.phase);

    // Only trigger event selection if the current event index is different
    // This prevents the infinite update loop
    if (eventIndex >= 0 && eventIndex !== currentEventIndex) {
      // Select the event to highlight the correct node and edges
      onSelectEvent(events[eventIndex], eventIndex);
    }

    // Position the viewport with a slight delay to ensure the node selection has been processed
    setTimeout(() => {
      positionViewportForNode(step.nodeId, step.zoom);
    }, 100);

  }, [currentStep, isActive, reactFlowInstance, tourSteps, findEventIndexForPhase, events, onSelectEvent, currentEventIndex, positionViewportForNode]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        handleNextStep();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        handlePreviousStep();
      } else if (e.key === "Escape") {
        onToggleTour();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, handleNextStep, handlePreviousStep, onToggleTour]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="fixed left-0 right-0 bottom-0 flex justify-center pb-8 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={`tour-step-${currentStep}`}
            className="bg-mongo-dark-800/95 border border-primary/30 backdrop-blur-sm rounded-lg shadow-xl w-full max-w-lg p-5 pointer-events-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress indicator */}
            <div className="flex mb-4 gap-1">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-grow rounded-full transition-colors ${
                    i === currentStep
                      ? "bg-primary"
                      : i < currentStep
                      ? "bg-primary/40"
                      : "bg-neutral-600"
                  }`}
                />
              ))}
            </div>

            {/* Step content */}
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 rounded-lg p-2 text-lg text-primary">
                {currentStep + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-primary mb-1">
                  {tourSteps[currentStep].title}
                </h3>
                <p className="text-sm text-neutral-300">
                  {tourSteps[currentStep].description}
                </p>

                {/* Phase label */}
                <div className="mt-3 inline-block px-2 py-1 bg-mongo-dark-900 rounded text-xs font-mono text-neutral-400">
                  {tourSteps[currentStep].phase}
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-5">
              <div>
                <button
                  onClick={onToggleTour}
                  className="text-sm text-neutral-400 hover:text-neutral-300"
                >
                  Exit Tour
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStep === 0}
                  className={`px-4 py-1 rounded text-sm ${
                    currentStep === 0
                      ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                      : "bg-accent/20 text-accent hover:bg-accent/30"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={
                    currentStep === tourSteps.length - 1
                      ? onToggleTour
                      : handleNextStep
                  }
                  className="bg-primary text-mongo-dark-900 px-4 py-1 rounded text-sm hover:bg-primary/90"
                >
                  {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EncryptionTour;