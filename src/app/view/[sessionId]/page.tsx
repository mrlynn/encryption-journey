"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { TraceSession, TraceEvent, PlaybackState } from "@/types/trace";
import { FlowCanvas } from "@/components/Canvas/FlowCanvas";
import { Timeline } from "@/components/Sidebar/Timeline";
import { Inspector } from "@/components/Sidebar/Inspector";
import { Legend } from "@/components/Overlays/Legend";
import { DetailedExplanationPanel } from "@/components/Explanation/DetailedExplanationPanel";
import { EncryptionTour } from "@/components/Tour/EncryptionTour";

export default function VisualizerPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<TraceSession | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentEventIndex: 0,
    speed: 1,
    showCiphertext: false,
    explainMode: false,
  });
  const [selectedEvent, setSelectedEvent] = useState<TraceEvent | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"timeline" | "inspector">("timeline");

  // Handle automated playback when isPlaying is true
  useEffect(() => {
    if (!session || !playbackState.isPlaying) return;

    // Calculate delay based on speed setting
    const delay = 1000 / playbackState.speed;

    // Set up interval to advance to next event
    const intervalId = setInterval(() => {
      if (playbackState.currentEventIndex < session.events.length - 1) {
        const newIndex = playbackState.currentEventIndex + 1;
        setPlaybackState(prev => ({ ...prev, currentEventIndex: newIndex }));
        setSelectedEvent(session.events[newIndex]);
      } else {
        // Stop playback when reaching the end of the timeline
        setPlaybackState(prev => ({ ...prev, isPlaying: false }));
      }
    }, delay);

    // Clean up interval when component unmounts or playback stops
    return () => clearInterval(intervalId);
  }, [playbackState.isPlaying, playbackState.currentEventIndex, playbackState.speed, session]);

  useEffect(() => {
    // Use API endpoint for all sessions
    fetch(`/api/trace/${sessionId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load session: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setSession(data);
        setSelectedEvent(data.events[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [sessionId]);

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
          <a 
            href="/" 
            className="text-primary hover:text-primary/80 underline"
          >
            Return to Home
          </a>
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
          <p className="text-neutral-500 mb-4">Session "{sessionId}" could not be found.</p>
          <a 
            href="/" 
            className="text-primary hover:text-primary/80 underline"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  const handlePlayPause = () => {
    setPlaybackState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleStepForward = () => {
    if (session && playbackState.currentEventIndex < session.events.length - 1) {
      const newIndex = playbackState.currentEventIndex + 1;
      setPlaybackState(prev => ({ ...prev, currentEventIndex: newIndex }));
      setSelectedEvent(session.events[newIndex]);
    }
  };

  const handleStepBackward = () => {
    if (playbackState.currentEventIndex > 0) {
      const newIndex = playbackState.currentEventIndex - 1;
      setPlaybackState(prev => ({ ...prev, currentEventIndex: newIndex }));
      setSelectedEvent(session?.events[newIndex] || null);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackState(prev => ({ ...prev, speed }));
  };

  const handleToggleCiphertext = () => {
    setPlaybackState(prev => ({ ...prev, showCiphertext: !prev.showCiphertext }));
  };

  const handleToggleExplainMode = () => {
    setPlaybackState(prev => ({ ...prev, explainMode: !prev.explainMode }));

    // When turning on explain mode, also expand the explanation panel
    if (!playbackState.explainMode) {
      setIsExplanationExpanded(true);
    }
  };

  const handleToggleExplanationPanel = () => {
    setIsExplanationExpanded(prev => !prev);
  };

  const handleToggleTour = () => {
    setIsTourActive(prev => !prev);
    // When starting the tour, pause any ongoing playback
    if (!isTourActive) {
      setPlaybackState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const handleEventSelect = (event: TraceEvent, index: number) => {
    setSelectedEvent(event);
    setPlaybackState(prev => ({ ...prev, currentEventIndex: index }));

    // Auto-expand explanation panel in explain mode or if it was already expanded
    if (playbackState.explainMode || isExplanationExpanded) {
      setIsExplanationExpanded(true);
    }
  };

  return (
    <div className="min-h-screen bg-mongo-dark-900 flex flex-col pt-16">
      {/* Visualization Controls */}
      <div className="bg-mongo-dark-800 border-b border-accent/20 px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-primary">Visualizer</h2>
            <p className="text-neutral-400 text-sm">Session: {sessionId}</p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="bg-primary hover:bg-primary/90 text-mongo-dark-900 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {playbackState.isPlaying ? "⏸️ Pause" : "▶️ Play"}
            </button>

            <div className="flex items-center">
              <button
                onClick={handleStepBackward}
                disabled={playbackState.currentEventIndex === 0}
                className="bg-accent hover:bg-accent/90 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-l-lg transition-colors"
              >
                ⏮️
              </button>

              <button
                onClick={handleStepForward}
                disabled={playbackState.currentEventIndex >= session.events.length - 1}
                className="bg-accent hover:bg-accent/90 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-r-lg transition-colors border-l border-accent/40"
              >
                ⏭️
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-300">Speed:</label>
              <select
                value={playbackState.speed}
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                className="bg-mongo-dark-700 border border-accent/20 text-neutral-200 rounded px-2 py-1 text-sm"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </div>

            <button
              onClick={handleToggleCiphertext}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                playbackState.showCiphertext
                  ? "bg-primary text-mongo-dark-900"
                  : "bg-mongo-dark-700 text-neutral-300 hover:bg-mongo-dark-600"
              }`}
            >
              {playbackState.showCiphertext ? "🔓 Show Plaintext" : "🔒 Show Ciphertext"}
            </button>

            <button
              onClick={handleToggleExplainMode}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                playbackState.explainMode
                  ? "bg-primary text-mongo-dark-900"
                  : "bg-mongo-dark-700 text-neutral-300 hover:bg-mongo-dark-600"
              }`}
            >
              {playbackState.explainMode ? "💡 Hide Help" : "💡 Explain Mode"}
            </button>

            <button
              onClick={handleToggleTour}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isTourActive
                  ? "bg-primary text-mongo-dark-900"
                  : "bg-mongo-dark-700 text-neutral-300 hover:bg-mongo-dark-600"
              }`}
            >
              {isTourActive ? "✖ Exit Tour" : "🧭 Guided Tour"}
            </button>

            {/* Role Lens Dropdown */}
            <div className="relative">
              <select
                value={activeRole || ""}
                onChange={(e) => setActiveRole(e.target.value || null)}
                className="bg-mongo-dark-700 border border-accent/20 text-neutral-200 rounded px-3 py-2 text-sm"
              >
                <option value="">All Fields</option>
                <option value="doctor">👨‍⚕️ Doctor</option>
                <option value="nurse">👩‍⚕️ Nurse</option>
                <option value="receptionist">👩‍💼 Receptionist</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 relative">
          <FlowCanvas
            session={session}
            playbackState={playbackState}
            selectedEvent={selectedEvent}
            onEventSelect={handleEventSelect}
            onReactFlowInstanceChange={setReactFlowInstance}
          />
          
          {/* Overlays */}
          <Legend explainMode={playbackState.explainMode} />
        </div>

        {/* Sidebar with Tabbed Interface */}
        <div className="w-80 bg-mongo-dark-800 border-l border-accent/20 flex flex-col h-full">
          {/* Tabs */}
          <div className="flex border-b border-accent/20 bg-mongo-dark-700">
            <button
              onClick={() => setActiveSidebarTab("timeline")}
              className={`flex-1 px-3 py-2 text-sm font-medium ${
                activeSidebarTab === "timeline"
                  ? "bg-mongo-dark-800 text-primary border-b-2 border-primary"
                  : "text-neutral-400 hover:text-neutral-300"
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveSidebarTab("inspector")}
              className={`flex-1 px-3 py-2 text-sm font-medium ${
                activeSidebarTab === "inspector"
                  ? "bg-mongo-dark-800 text-primary border-b-2 border-primary"
                  : "text-neutral-400 hover:text-neutral-300"
              }`}
            >
              Inspector
            </button>
          </div>

          {/* Panel Content based on active tab */}
          <div className="flex-1 overflow-hidden">
            {activeSidebarTab === "timeline" ? (
              <div className="h-full">
                <Timeline
                  events={session.events}
                  currentEventIndex={playbackState.currentEventIndex}
                  onEventSelect={handleEventSelect}
                />
              </div>
            ) : (
              <div className="h-full">
                <Inspector
                  event={selectedEvent}
                  showCiphertext={playbackState.showCiphertext}
                  activeRole={activeRole}
                />
              </div>
            )}
          </div>

          {/* Mini Preview of inactive tab */}
          <div className="border-t border-accent/20 bg-mongo-dark-900/70 py-2 px-3">
            {activeSidebarTab === "timeline" ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">Current Event:</span>
                <span className="text-xs text-primary">
                  {selectedEvent ? selectedEvent.phase.replace(/_/g, " ") : "None"}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">Current Step:</span>
                <span className="text-xs text-primary">
                  {playbackState.currentEventIndex + 1} of {session.events.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Explanation Panel */}
      <DetailedExplanationPanel
        selectedEvent={selectedEvent}
        isExpanded={isExplanationExpanded}
        onToggleExpand={handleToggleExplanationPanel}
        explainMode={playbackState.explainMode}
      />

      {/* Guided Tour */}
      {session && (
        <EncryptionTour
          events={session.events}
          currentEventIndex={playbackState.currentEventIndex}
          onSelectEvent={handleEventSelect}
          onToggleTour={handleToggleTour}
          isActive={isTourActive}
          reactFlowInstance={reactFlowInstance}
        />
      )}
    </div>
  );
}
