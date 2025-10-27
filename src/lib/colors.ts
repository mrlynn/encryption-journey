import { EncryptionMode, TraceActor, TracePhase } from "@/types/trace";

// MongoDB palette constants
export const COLORS = {
  primary: "#00ED64",
  dark: "#001E2B",
  accent: "#00684A",
  neutral: "#C1BEBC",
  
  // Node states
  active: "#00ED64",
  idle: "#00684A",
  error: "#FF6B6B",
  
  // Encryption modes
  qe: "#00ED64",      // Queryable Encryption - MongoDB green
  det: "#FFD93D",     // Deterministic - Yellow
  rand: "#FF6B6B",    // Randomized - Red
  none: "#6C757D",    // None - Gray
  
  // Actors
  client: "#4ECDC4",  // Teal
  api: "#45B7D1",     // Blue
  driver: "#96CEB4",  // Light green
  mongo: "#FECA57",   // Orange
  
  // Phases
  encrypt: "#00ED64",
  transport: "#45B7D1",
  store: "#FECA57",
  query: "#FF6B6B",
  decrypt: "#4ECDC4",
} as const;

// Encryption mode colors
export function getEncryptionModeColor(mode: EncryptionMode): string {
  return COLORS[mode];
}

// Actor colors
export function getActorColor(actor: TraceActor): string {
  return COLORS[actor];
}

// Phase colors
export function getPhaseColor(phase: TracePhase): string {
  const phaseMap: Record<TracePhase, string> = {
    CLIENT_ENCRYPT: COLORS.encrypt,
    API_RECEIVE: COLORS.transport,
    DRIVER_SEND: COLORS.transport,
    MONGO_MATCH_QE: COLORS.query,
    MONGO_STORE: COLORS.store,
    MONGO_READ: COLORS.store,
    DRIVER_RECEIVE: COLORS.transport,
    API_RESPOND: COLORS.transport,
    CLIENT_DECRYPT: COLORS.decrypt,
  };
  
  return phaseMap[phase];
}

// Node state colors
export function getNodeStateColor(isActive: boolean, hasError: boolean = false): string {
  if (hasError) return COLORS.error;
  return isActive ? COLORS.active : COLORS.idle;
}

// Edge colors based on encryption state
export function getEdgeColor(hasEncryptedFields: boolean, isActive: boolean): string {
  if (isActive) return COLORS.active;
  return hasEncryptedFields ? COLORS.qe : COLORS.neutral;
}

// Background colors for different contexts
export const BACKGROUNDS = {
  canvas: "bg-mongo-dark-900",
  sidebar: "bg-mongo-dark-800",
  card: "bg-mongo-dark-700",
  overlay: "bg-mongo-dark-800/90",
} as const;

// Text colors
export const TEXT_COLORS = {
  primary: "text-primary",
  secondary: "text-neutral-300",
  muted: "text-neutral-500",
  accent: "text-accent",
  error: "text-red-400",
  success: "text-green-400",
} as const;

// Border colors
export const BORDER_COLORS = {
  default: "border-accent/20",
  active: "border-primary",
  error: "border-red-400",
  success: "border-green-400",
} as const;

// Shadow colors for glow effects
export const SHADOWS = {
  glow: "shadow-[0_0_20px_rgba(0,237,100,0.5)]",
  glowActive: "shadow-[0_0_30px_rgba(0,237,100,0.8)]",
  glowError: "shadow-[0_0_20px_rgba(255,107,107,0.5)]",
} as const;
