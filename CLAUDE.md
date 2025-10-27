# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Encryption Journey Visualizer is a Next.js application that provides real-time visualization of patient record encryption for healthcare data security. It demonstrates MongoDB Queryable Encryption through an interactive visualization that shows the flow of data through client-side encryption → transport → MongoDB Queryable Encryption → decryption.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test                # Standard test run
npm run test:ui         # Test with UI
npm run test:headed     # Tests in visible browser
npm run test:debug      # Tests in debug mode

# Linting and formatting
npm run lint            # Check code with ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run format:check    # Check formatting without changes

# Type checking
npm run type-check      # Run TypeScript type checking
```

## Architecture

This project uses:

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **React Flow** (@xyflow/react) for visualization
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **TanStack Query** for data fetching
- **Playwright** for testing

## Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   ├── view/[sessionId]/   # Main visualizer route
│   └── api/                # API routes
├── components/
│   ├── Canvas/             # React Flow components
│   │   ├── FlowCanvas.tsx
│   │   ├── nodes/          # Custom node types
│   │   └── edges/          # Custom edge types
│   ├── Sidebar/            # Timeline and Inspector
│   ├── Overlays/           # Legend and RoleLens
│   └── EmbedFrame.tsx      # Embedding component
├── lib/                    # Utilities
│   ├── colors.ts           # Color system
│   ├── layout.ts           # Graph layout
│   ├── api.ts              # API client
│   └── sse.ts              # Server-sent events
└── types/
    └── trace.ts            # TypeScript definitions
```

## Key Files

- `src/app/view/[sessionId]/page.tsx`: Main visualizer component
- `src/components/Canvas/FlowCanvas.tsx`: Core React Flow implementation
- `src/lib/api.ts`: API client for fetching trace data
- `src/types/trace.ts`: TypeScript definitions for trace events

## Environment Variables

```
# Symfony trace API base URL
NEXT_PUBLIC_TRACE_BASEURL=https://your-symfony-app.com

# Vercel deployment URL
NEXT_PUBLIC_VERCEL_URL=encryption-journey.vercel.app
```

## Testing

Tests are located in `tests/visualizer.spec.ts` and use Playwright for end-to-end testing. The tests validate:

- Page loading and navigation
- Component rendering
- Event timeline functionality
- Playback controls
- Role-based access switching
- Responsive design
- API health checks

## Core Features

1. **Real-time Visualization**: Animated flow diagrams showing encryption journey
2. **Interactive Timeline**: Step through encryption events
3. **Field Inspector**: View detailed encryption information for each field
4. **Role-based Access Lens**: Simulate different user role access patterns
5. **Embeddable**: Designed to be embedded in Docusaurus or Symfony apps

## Key Concepts

- **Trace Events**: Data structure representing steps in the encryption journey
- **System Components**: Client, API, Driver, MongoDB
- **Encryption Phases**: Plaintext → Client Encryption → Transit → Server Encryption/Decryption
- **Role-based Access**: Different user roles can view different fields