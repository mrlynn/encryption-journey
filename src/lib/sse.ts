import { TraceEvent } from "@/types/trace";

export interface SSEConnection {
  close: () => void;
  readyState: number;
}

export interface SSEOptions {
  onMessage: (event: TraceEvent) => void;
  onError: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
  retryDelay?: number;
  maxRetries?: number;
}

// SSE connection states
export const SSE_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2,
} as const;

// Create SSE connection for trace events
export function createSSEConnection(
  sessionId: string,
  options: SSEOptions
): SSEConnection {
  const baseUrl = process.env.NEXT_PUBLIC_TRACE_BASEURL;
  
  if (!baseUrl) {
    options.onError(new Error('No trace base URL configured'));
    return {
      close: () => {},
      readyState: SSE_STATES.CLOSED,
    };
  }
  
  let eventSource: EventSource | null = null;
  let retryCount = 0;
  let retryTimeout: NodeJS.Timeout | null = null;
  
  const maxRetries = options.maxRetries || 3;
  const retryDelay = options.retryDelay || 1000;
  
  const connect = () => {
    if (eventSource) {
      eventSource.close();
    }
    
    eventSource = new EventSource(`${baseUrl}/trace/stream?sessionId=${sessionId}`);
    
    eventSource.onopen = () => {
      retryCount = 0;
      options.onOpen?.();
    };
    
    eventSource.onmessage = (event) => {
      try {
        const traceEvent: TraceEvent = JSON.parse(event.data);
        options.onMessage(traceEvent);
      } catch (error) {
        options.onError(new Error(`Failed to parse SSE message: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying SSE connection (${retryCount}/${maxRetries}) in ${retryDelay}ms`);
        
        retryTimeout = setTimeout(() => {
          connect();
        }, retryDelay * retryCount); // Exponential backoff
      } else {
        options.onError(new Error('SSE connection failed after maximum retries'));
        close();
      }
    };
    
    // Handle custom events
    eventSource.addEventListener('trace-event', (event) => {
      try {
        const traceEvent: TraceEvent = JSON.parse(event.data);
        options.onMessage(traceEvent);
      } catch (error) {
        options.onError(new Error(`Failed to parse trace event: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
    
    eventSource.addEventListener('session-complete', () => {
      options.onClose?.();
      close();
    });
  };
  
  const close = () => {
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
    
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
  
  // Start connection
  connect();
  
  return {
    close,
    get readyState() {
      return eventSource?.readyState ?? SSE_STATES.CLOSED;
    },
  };
}

// Utility to check if SSE is supported
export function isSSESupported(): boolean {
  return typeof EventSource !== 'undefined';
}

// Utility to create a mock SSE connection for testing
export function createMockSSEConnection(
  events: TraceEvent[],
  options: SSEOptions,
  interval: number = 1000
): SSEConnection {
  let currentIndex = 0;
  let intervalId: NodeJS.Timeout | null = null;
  let isClosed = false;
  
  const start = () => {
    if (isClosed) return;
    
    intervalId = setInterval(() => {
      if (currentIndex >= events.length) {
        options.onClose?.();
        close();
        return;
      }
      
      options.onMessage(events[currentIndex]);
      currentIndex++;
    }, interval);
  };
  
  const close = () => {
    isClosed = true;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
  
  // Start immediately
  start();
  
  return {
    close,
    get readyState() {
      return isClosed ? SSE_STATES.CLOSED : SSE_STATES.OPEN;
    },
  };
}

// Utility to create a WebSocket fallback (if needed)
export function createWebSocketConnection(
  sessionId: string,
  options: SSEOptions
): SSEConnection {
  const baseUrl = process.env.NEXT_PUBLIC_TRACE_BASEURL;
  
  if (!baseUrl) {
    options.onError(new Error('No trace base URL configured'));
    return {
      close: () => {},
      readyState: SSE_STATES.CLOSED,
    };
  }
  
  const wsUrl = baseUrl.replace(/^http/, 'ws') + `/trace/ws?sessionId=${sessionId}`;
  let websocket: WebSocket | null = null;
  
  const connect = () => {
    websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      options.onOpen?.();
    };
    
    websocket.onmessage = (event) => {
      try {
        const traceEvent: TraceEvent = JSON.parse(event.data);
        options.onMessage(traceEvent);
      } catch (error) {
        options.onError(new Error(`Failed to parse WebSocket message: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    websocket.onerror = (error) => {
      options.onError(new Error('WebSocket connection failed'));
    };
    
    websocket.onclose = () => {
      options.onClose?.();
    };
  };
  
  const close = () => {
    if (websocket) {
      websocket.close();
      websocket = null;
    }
  };
  
  connect();
  
  return {
    close,
    get readyState() {
      return websocket?.readyState ?? SSE_STATES.CLOSED;
    },
  };
}
