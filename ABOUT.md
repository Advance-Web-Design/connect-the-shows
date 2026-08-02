# About Silver Sync

## Background

Silver Sync is a web game built for the Advanced Web Design course. It's a "Six Degrees of Kevin Bacon"-style game: players connect actors through shared movies/TV appearances, backed by live data from The Movie Database (TMDB).

## Goals

- Build a full-stack app with a clear separation between a React/Vite frontend and a Next.js API backend.
- Integrate a real third-party API (TMDB) for search, then layer custom game logic (pathfinding/connection validation, scoring) on top of it.
- Add authentication and persistence (Firebase Auth + Firestore) for user profiles and scores.
- Ship a deployed, playable product (Vercel), not just a local demo.

## Scope

- **Client** (`client/`): React 18 + Vite + Tailwind game UI — search, drag-and-drop board, connection validation feedback, profiles.
- **Server** (`server/`): Next.js API routes proxying TMDB, running game/connection-validation logic, and handling auth.
- **Diagrams** (`diagrams/`): architecture and data-flow documentation referenced from the main README.

## Status

Actively deployed on Vercel (see README for live links). Known issue: a z-index bug can make cards behind the header unclickable — tracked in the main README.

## Team

Maintained by the Advance-Web-Design/silversync group.
