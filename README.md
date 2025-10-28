# BakırBank Web Client
BakırBank Web Client is a feature-rich banking front end built with the Next.js App Router. It powers ATM discovery, digital onboarding, profile management, and transactional banking workflows with a modern, animation-heavy UI that is ready for real-world demos and portfolio showcases.

## Table of Contents
- [Feature Highlights](#feature-highlights)
- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Key Backend Integrations](#key-backend-integrations)
- [Project Structure](#project-structure)
- [Development Guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Feature Highlights

- **Authentication & Session Management** – Centralized auth state powered by Zustand handles login, registration, logout, token refresh, and lazy user retrieval through dedicated API routes, making guarded areas (dashboard, transactions, profile) resilient to refreshes and multi-tab usage. 
- **Personal Finance Dashboard** – A gradient-rich overview page displays balances, monthly income/expenses, savings progress, and quick actions with protected routing, skeleton/loading states, and balance masking for demos in public settings.
- **Advanced Transactions Workspace** – Explore paginated transaction history with type/date filters, dynamic account switching, toast-style alerts, and a guided account creation wizard that loads cities, districts, and branches on demand.
- **Immersive ATM Finder** – A 3D Mapbox GL scene (with deck.gl layers and optional Three.js camera control) supports live ATM search, filtering by bank/status/cash availability, route playback, minimaps, QR panels, and animated travel modes.
- **Customer Profile & Security Center** – Modular tabs let users review personal details, session history, password options, notification settings, and account freezing tools—each guarded by protected routes and hydration-safe loading flows.
- **Real-time Notifications** – A STOMP-over-WebSocket client streams personalized notifications, syncs state across browser tabs via BroadcastChannel, and falls back to REST polling with retry logic.

## Architecture Overview

This project embraces the Next.js App Router convention with colocated server and client logic:

- **`app/`** – Route groups for landing pages, authentication flows, dashboards, ATM finder, transactions, and profile experiences. Each folder contains page components and feature-specific UI.
- **`app/api/`** – Next.js Route Handlers that proxy authentication, account, notification, and MCP service calls to the backend, encapsulating HTTP details server-side.
- **`app/lib/`** – Shared utilities including API clients, hooks (`useAuth`, `useATM`, alerts), Zustand stores (`authStore`), loading overlays, and provider components like `ProtectedRoute`.
- **`app/components/`** – Atomic and composite UI elements from hero banners to ATM control panels, plus shared design system primitives under `ui/`.
- **`public/`** – Static assets, including favicon and imagery referenced across the marketing site.

## Technology Stack

- **Framework** – Next.js 15 (App Router) with React 19 and TypeScript.
- **Styling** – Tailwind CSS v4 with utility-first theming, custom gradients, and animation helpers.
- **State & Validation** – Zustand for client state, React Hook Form with resolvers (where applicable), and Zod-ready validation patterns.
- **Mapping & 3D** – Mapbox GL JS, deck.gl, and React Three Fiber for geospatial rendering and immersive camera effects.
- **Data & Networking** – Axios/Fetch for RESTful calls, STOMP JS with SockJS for WebSocket messaging, and BroadcastChannel for multi-tab sync.
- **UI Enhancements** – Radix UI primitives, Lucide icons, Framer Motion transitions, React Hot Toast feedback, and Tailwind Scrollbar for polished experiences.

## Prerequisites

Ensure the following before starting development:

- **Node.js** `>= 18.18.0` (Next.js 15 also supports Node 20).
- **npm** `>= 9` (or use pnpm/yarn/bun if preferred).
- Access to BakırBank backend services (REST + WebSocket) running locally or remotely.
- A Mapbox account with a valid **Public Access Token** for the ATM Finder module.

## Environment Variables
Create a `.env.local` file at the repository root with the following keys. Adjust hostnames/ports to match your backend setup:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
SESSION_SECRET=replace-with-long-random-string
REACT_APP_MAPBOX_TOKEN=pk.your-mapbox-token
# Optional: override if your notification server differs
NEXT_PUBLIC_NOTIFICATION_WS=http://localhost:8090
```

> **Tip:** `SESSION_SECRET` secures cookie encryption for API routes; generate a long random string in production. `NEXT_PUBLIC_NOTIFICATION_WS` is optional but recommended if you refactor the notification client to consume an environment variable instead of hard-coded URLs.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run the development server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` to explore the app. The dashboard, transactions, ATM Finder, and profile sections require a logged-in user; configure the backend endpoints to return realistic data for demos.
3. **Sign in or register**
   - Use the `app/auth` routes to register or authenticate against your API.
   - The `useAuth` store will hydrate the client session and unlock protected routes.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server with hot module replacement. |
| `npm run build` | Produce a production build in `.next/`. |
| `npm run start` | Launch the production server (after building). |
| `npm run lint` | Run ESLint across the project. |

## Key Backend Integrations

The frontend communicates with several backend services. Confirm the endpoints below are reachable or adjust them in code:
- **Authentication** – `/api/auth/*` routes proxy to `${NEXT_PUBLIC_API_BASE_URL}` for login, register, password reset, OTP verification, and session checking.
- **Account & Transactions** – Server actions under `/api/account/*` provide account lists, creation, branch lookups, transaction history, and session records.
- **ATM Locations** – `app/lib/atm/getAtmLocations` fetches ATM metadata for the map experience.
- **Notifications** – `NotificationPanel` connects to the WebSocket gateway at `http://localhost:8090/notification-websocket` and REST endpoints under `/api/v1/notification/*` for persistence.

If your backend uses different ports or paths, update the associated fetch/axios calls or externalize them via environment variables.

## Project Structure

Below is a high-level snapshot of the most important folders:

```
app/
├── (auth)/        # Layout wrappers for authentication flows
├── api/           # Next.js route handlers that talk to backend services
├── atmfinder/     # 3D ATM locator page, controls, and map canvas
├── dashboard/     # Authenticated banking overview
├── transactions/  # History, filters, account creation
├── profile/       # Customer profile & security center
├── components/    # Reusable UI (Hero, forms, ATM widgets, etc.)
├── lib/           # Hooks, Zustand stores, API utilities, loading overlays
└── globals.css    # Tailwind layer setup and global styles
```

## Development Guidelines

- **Type Safety** – All components are written in TypeScript; keep props typed and reuse the shared interfaces in `app/lib` to reduce drift.
- **State Management** – Prefer Zustand stores or local component state; isolate network calls inside hooks or API route handlers for testability.
- **Styling** – Follow the Tailwind utility-first style already in use. For shared UI patterns, create/extend components in `app/components/ui`.
- **Protected Routes** – Wrap sensitive pages with `ProtectedRoute` to ensure consistent authentication checks.
- **Mapping Modules** – When extending ATM Finder, reuse the existing `useATM` hook and deck.gl layers to maintain animation performance.
- **Code Quality** – Run `npm run lint` before committing to catch accessibility and best-practice issues early.

## Troubleshooting

- **Map not loading** – Verify `REACT_APP_MAPBOX_TOKEN` is set and that the token allows the `localhost` domain.
- **Authentication loops** – Ensure backend cookies/JWT configuration matches the expectations in `authService.ts` and that CORS/credentials are enabled.
- **Notifications silent** – Confirm the WebSocket gateway (`notification-websocket`) and REST endpoints at port `8090` are available. Adjust the URL via code or environment variables if needed.
- **Slow ATM rendering** – deck.gl animations are GPU-intensive; disable 3D mode or reduce TripsLayer data volume during demos on low-end hardware.
