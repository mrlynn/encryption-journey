# Trace Event Schema

This document defines the JSON contract for trace events emitted by the Symfony backend and consumed by the Encryption Journey visualizer.

## Overview

Trace events represent discrete steps in the encryption journey of a patient record through the system. Each event captures the state of data at a specific phase, including encryption details, actor information, and metadata.

## Core Types

### TracePhase

The phase in the encryption journey where this event occurs:

- `CLIENT_ENCRYPT` - Client-side encryption of sensitive fields
- `API_RECEIVE` - Symfony API receives the request
- `DRIVER_SEND` - MongoDB driver sends encrypted data
- `MONGO_MATCH_QE` - MongoDB Queryable Encryption matching
- `MONGO_STORE` - Data stored in MongoDB
- `MONGO_READ` - Data read from MongoDB
- `DRIVER_RECEIVE` - MongoDB driver receives response
- `API_RESPOND` - Symfony API sends response
- `CLIENT_DECRYPT` - Client-side decryption of fields

### TraceActor

The system component performing the action:

- `client` - Browser/frontend application
- `api` - Symfony backend API
- `driver` - MongoDB PHP driver
- `mongo` - MongoDB database

### EncryptionMode

Field-level encryption types:

- `qe` - Queryable Encryption (MongoDB's field-level encryption)
- `det` - Deterministic encryption (same input = same ciphertext)
- `rand` - Randomized encryption (same input = different ciphertext)
- `none` - No encryption (plaintext)

## TraceEvent Interface

```typescript
interface TraceEvent {
  id: string;               // UUID v4
  sessionId: string;        // Groups events from single workflow
  ts: string;               // ISO 8601 timestamp
  phase: TracePhase;
  actor: TraceActor;
  verb: TraceVerb;          // "create" | "update" | "read" | "query"
  dataset: string;          // "patient" | "note" | "observation" | custom
  fields: TraceField[];     // Array of field encryption details
  payloadSizeBytes?: number; // Optional payload size
  meta?: Record<string, unknown>; // Additional metadata
  keyRef?: KeyReference;    // Key reference (never actual key material)
  signature: string;        // HMAC-SHA256 signature
}
```

### TraceField

```typescript
interface TraceField {
  name: string;             // Field path, e.g., "patient.lastName"
  encryption: EncryptionMode;
  visibleSample?: string;   // Redacted sample for demo purposes
}
```

### KeyReference

```typescript
interface KeyReference {
  alias: string;            // Key alias, e.g., "securehealth/patient"
  version: number;          // Key version number
}
```

## Example Events

### Client Encryption Event

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "demo-session-001",
  "ts": "2024-01-15T10:30:00.000Z",
  "phase": "CLIENT_ENCRYPT",
  "actor": "client",
  "verb": "create",
  "dataset": "patient",
  "fields": [
    {
      "name": "patient.lastName",
      "encryption": "qe",
      "visibleSample": "Smi***"
    },
    {
      "name": "patient.ssn",
      "encryption": "qe", 
      "visibleSample": "***-**-1234"
    },
    {
      "name": "patient.notes",
      "encryption": "rand",
      "visibleSample": "Encrypted content"
    }
  ],
  "payloadSizeBytes": 1024,
  "meta": {
    "encryptionLibrary": "mongodb-client-side-encryption",
    "keyProvider": "aws-kms"
  },
  "keyRef": {
    "alias": "securehealth/patient",
    "version": 3
  },
  "signature": "a1b2c3d4e5f6..."
}
```

### MongoDB Query Event

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "sessionId": "demo-session-001", 
  "ts": "2024-01-15T10:30:05.000Z",
  "phase": "MONGO_MATCH_QE",
  "actor": "mongo",
  "verb": "query",
  "dataset": "patient",
  "fields": [
    {
      "name": "patient.lastName",
      "encryption": "qe",
      "visibleSample": "Encrypted query"
    }
  ],
  "meta": {
    "queryType": "equality",
    "index": "qe_lastName_v1",
    "matchCount": 1
  },
  "keyRef": {
    "alias": "securehealth/patient",
    "version": 3
  },
  "signature": "b2c3d4e5f6a1..."
}
```

## Signature Verification

All events must be signed using HMAC-SHA256 with a shared secret key. The signature is calculated over the entire event payload (excluding the signature field itself).

### Signature Calculation

```javascript
const crypto = require('crypto');

function signEvent(event, secretKey) {
  const { signature, ...payload } = event;
  const payloadString = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHmac('sha256', secretKey)
    .update(payloadString)
    .digest('hex');
}
```

### Verification

```javascript
function verifyEvent(event, secretKey) {
  const { signature, ...payload } = event;
  const expectedSignature = signEvent(event, secretKey);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

## Session Grouping

Events are grouped by `sessionId` to represent a complete user workflow. A typical session might include:

1. `CLIENT_ENCRYPT` - User creates patient record
2. `API_RECEIVE` - Symfony receives request
3. `DRIVER_SEND` - Driver sends to MongoDB
4. `MONGO_STORE` - Data stored with Q/E
5. `MONGO_READ` - Later query for the record
6. `MONGO_MATCH_QE` - Q/E matching process
7. `DRIVER_RECEIVE` - Driver gets response
8. `API_RESPOND` - API returns to client
9. `CLIENT_DECRYPT` - Client decrypts response

## Security Considerations

- **No Key Material**: Never include actual encryption keys in events
- **Signature Verification**: All events must be verified client-side
- **Field Redaction**: Sensitive data should be redacted in `visibleSample`
- **CORS**: Only allow-listed origins can consume events
- **Logging**: Never log event content in production

## API Endpoints

### Server-Sent Events (SSE)

```
GET /trace/stream?sessionId={sessionId}
Content-Type: text/event-stream
```

Streams events as they occur in real-time.

### Session Replay

```
GET /trace/session/{sessionId}
Content-Type: application/json
```

Returns complete array of events for a session (for replay).

## Error Handling

Invalid or unverified events should be displayed with a red "Untrusted Event" banner in the visualizer. The visualizer should continue processing other events even if some fail verification.
