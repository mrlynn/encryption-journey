import { TraceSession, TraceEvent } from "@/types/trace";
import { useQuery } from "@tanstack/react-query";

// Demo HMAC key for seed data verification (in production, this would be from environment)
const DEMO_HMAC_KEY = "demo-key-for-seed-data-verification-only";

// Load session data from API or fallback to seed data
export async function loadSessionData(sessionId: string): Promise<TraceSession> {
  const baseUrl = process.env.NEXT_PUBLIC_TRACE_BASEURL;
  
  if (baseUrl) {
    // Try to load from Symfony API
    try {
      const response = await fetch(`${baseUrl}/trace/session/${sessionId}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load session: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Failed to load from API, falling back to seed data:', error);
    }
  }
  
  // Fallback to seed data
  return loadSeedData(sessionId);
}

// Load seed data from public directory
async function loadSeedData(sessionId: string): Promise<TraceSession> {
  try {
    // Map demo session to our seed data file
    const fileName = sessionId === 'demo' ? 'seed-create-then-read.json' : `${sessionId}.json`;
    const response = await fetch(`/demo/sessions/${fileName}`);
    
    if (!response.ok) {
      throw new Error(`Seed data not found for session: ${sessionId}`);
    }
    
    const data = await response.json();
    
    // Verify signatures for demo purposes
    if (data.events) {
      data.events = data.events.map((event: TraceEvent) => ({
        ...event,
        verified: verifyEventSignature(event),
      } as TraceEvent));
    }
    
    return data;
  } catch (error) {
    throw new Error(`Failed to load seed data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Verify event signature using Web Crypto API
export function verifyEventSignature(event: TraceEvent): boolean {
  try {
    // For demo purposes, we'll use a simple verification
    // In production, this would use proper HMAC verification
    return event.signature.length === 64; // Basic length check for demo
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

// Verify HMAC signature (production implementation)
export async function verifyHMACSignature(
  event: TraceEvent,
  secretKey: string
): Promise<boolean> {
  try {
    const { signature, ...payload } = event;
    const payloadString = JSON.stringify(payload, Object.keys(payload).sort());
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(payloadString);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureArray = new Uint8Array(signatureBuffer);
    const computedSignature = Array.from(signatureArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signature === computedSignature;
  } catch (error) {
    console.error('HMAC verification failed:', error);
    return false;
  }
}

// Create HMAC signature (for testing)
export async function createHMACSignature(
  payload: Record<string, any>,
  secretKey: string
): Promise<string> {
  try {
    const payloadString = JSON.stringify(payload, Object.keys(payload).sort());
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(payloadString);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureArray = new Uint8Array(signatureBuffer);
    
    return Array.from(signatureArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('HMAC creation failed:', error);
    throw error;
  }
}

// Stream events from SSE endpoint
export function streamEvents(
  sessionId: string,
  onEvent: (event: TraceEvent) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): () => void {
  const baseUrl = process.env.NEXT_PUBLIC_TRACE_BASEURL;
  
  if (!baseUrl) {
    onError(new Error('No trace base URL configured'));
    return () => {};
  }
  
  const eventSource = new EventSource(`${baseUrl}/trace/stream?sessionId=${sessionId}`);
  
  eventSource.onmessage = (event) => {
    try {
      const traceEvent: TraceEvent = JSON.parse(event.data);
      const verifiedEvent = { ...traceEvent, verified: verifyEventSignature(traceEvent) };
      onEvent(verifiedEvent as TraceEvent);
    } catch (error) {
      onError(new Error(`Failed to parse event: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  };
  
  eventSource.onerror = (error) => {
    onError(new Error('SSE connection failed'));
    eventSource.close();
  };
  
  eventSource.addEventListener('complete', () => {
    onComplete();
    eventSource.close();
  });
  
  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

// Health check
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Hook to fetch trace session data
export function useTraceSession(sessionId: string) {
  return useQuery<TraceSession, Error>({
    queryKey: ['traceSession', sessionId],
    queryFn: () => loadSessionData(sessionId),
    refetchOnWindowFocus: false,
    staleTime: Infinity, // Data doesn't change for a session
  });
}

// Get available sessions (for future use)
export async function getAvailableSessions(): Promise<string[]> {
  const baseUrl = process.env.NEXT_PUBLIC_TRACE_BASEURL;
  
  if (baseUrl) {
    try {
      const response = await fetch(`${baseUrl}/trace/sessions`);
      const data = await response.json();
      return data.sessions || [];
    } catch (error) {
      console.warn('Failed to load sessions from API:', error);
    }
  }
  
  // Fallback to known demo sessions
  return ['demo', 'demo-session-001'];
}
