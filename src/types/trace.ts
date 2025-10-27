export type TracePhase =
  | "CLIENT_ENCRYPT"
  | "API_RECEIVE"
  | "DRIVER_SEND"
  | "MONGO_MATCH_QE"
  | "MONGO_STORE"
  | "MONGO_READ"
  | "DRIVER_RECEIVE"
  | "API_RESPOND"
  | "CLIENT_DECRYPT";

export type TraceActor = "client" | "api" | "driver" | "mongo";

export type TraceVerb = "create" | "update" | "read" | "query";

export type EncryptionMode = "qe" | "det" | "rand" | "none";

export interface TraceField {
  name: string;                   // e.g., "patient.lastName"
  encryption: EncryptionMode;
  visibleSample?: string;         // redacted/plain sample for demo
}

export interface KeyReference {
  alias: string;                  // e.g., "securehealth/patient"
  version: number;                // e.g., 3
}

export interface TraceEvent {
  id: string;               // uuid
  sessionId: string;        // groups a single user workflow
  ts: string;               // ISO date
  phase: TracePhase;
  actor: TraceActor;
  verb: TraceVerb;
  dataset: "patient" | "note" | "observation" | string;
  fields: TraceField[];
  payloadSizeBytes?: number;
  meta?: Record<string, unknown>;   // e.g., { queryType:"equality", index:"qe_lastName_v1" }
  keyRef?: KeyReference;            // which logical key was used (never material!)
  signature: string;                // HMAC over event for integrity (Symfony signs)
  verified?: boolean;               // Whether signature has been verified
}

export interface TraceSession {
  sessionId: string;
  id?: string;                // Optional alias for sessionId
  name?: string;              // Optional display name
  events: TraceEvent[];
  createdAt: string;
  description?: string;
}

// UI State types
export interface PlaybackState {
  isPlaying: boolean;
  currentEventIndex: number;
  speed: number; // 0.5, 1, 2, 4
  showCiphertext: boolean;
  explainMode: boolean;
}

export interface NodeState {
  id: string;
  isActive: boolean;
  lastEvent?: TraceEvent;
  glowIntensity: number;
}

export interface EdgeState {
  id: string;
  isActive: boolean;
  lastEvent?: TraceEvent;
  animationProgress: number;
}

// Role-based access control
export type UserRole = "doctor" | "nurse" | "receptionist";

export interface RolePermissions {
  [role: string]: {
    canView: string[]; // field names
    canEdit: string[]; // field names
    description: string;
  };
}

// Phase metadata for UI
export interface PhaseInfo {
  phase: TracePhase;
  title: string;
  description: string;
  icon: string;
  color: string;
  actor: TraceActor;
}

// Encryption mode metadata
export interface EncryptionModeInfo {
  mode: EncryptionMode;
  name: string;
  description: string;
  color: string;
  icon: string;
  isQueryable: boolean;
}
