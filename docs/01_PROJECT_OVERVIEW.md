# Healthedia - Academic Research, Clinical Registry & SEO Platform

Healthedia is a highly polished, robust, full-stack application designed as an authoritative platform for academic research, clinical medical registration, professional researcher verification, and advanced dynamic Search Engine Optimization (SEO) management.

---

## 📋 Table of Contents
1. [Project Purpose & Vision](#-project-purpose--vision)
2. [Tech Stack Summary](#%EF%B8%8F-tech-stack-summary)
3. [Project Type & Architecture](#-project-type--architecture)
4. [Core Features & Capability Status](#-core-features--capability-status)
5. [🔍 Agent Notes](#-agent-notes)

---

## 🎯 Project Purpose & Vision
Healthedia serves as a trusted ecosystem bridging professional medical science with discoverability. It addresses the critical challenges in scholarly communications:
1. **Academic Integrity**: Provides secure manuscript submission, structured peer review, and verifiable digital publication certificates.
2. **Clinical Transparency**: Maintains registries of accredited research institutions and verified healthcare practitioners.
3. **Organic Discoverability (SEO)**: Integrates deep, real-time Search Engine Optimization (SEO) management, allowing administrators to configure redirects, custom robots.txt controls, page-by-page metadata, and dynamically updated XML sitemaps to maximize indexing of scholarly papers.
4. **Data Integrity**: Implements a robust offline-tolerant database client with atomicity and transactional integrity, synchronized instantly with an active Node.js/Express server.

---

## 🛠️ Tech Stack Summary

The platform uses a modern, high-performance, and lightweight full-stack runtime and development setup:

| Layer | Technology | Details / Versions |
| :--- | :--- | :--- |
| **Frontend Runtime** | **React 19** | Implements standard hooks (`useState`, `useEffect`, `useMemo`, `useRef`) with custom hook logic and React Router style views. |
| **Styling** | **Tailwind CSS v4** | Styled via `@import "tailwindcss";` using modern CSS utility paradigms. |
| **Icons & Visuals** | **Lucide React** | Consistent, high-fidelity SVG icon representations across all views. |
| **Animations** | **Motion** | Dynamic animations and view transitions from `motion/react`. |
| **Data & Charts** | **D3.js** & **Recharts** | Interactive rendering of metrics, publication growth, and SEO tracking graphs. |
| **Client Data Layer** | **Custom Database Client** | Isolated transaction staging context, transactional rollback (`docs/db.ts`), fallback tolerance, and automated REST synchronization. |
| **Backend Framework**| **Express.js (v4.21.2)** | Full REST backend acting as database-of-record synchronizer, serving static assets, routing API requests, and managing disk-persisted state. |
| **Backend Runtime** | **Node.js / Bun** | Native fast-execution TS support. Includes `bun.lock` for rapid dependency resolution. |
| **Development Utility**| **tsx** & **esbuild** | Direct TypeScript execution in development and lightning-fast CommonJS bundling (`dist/server.cjs`) for production. |
| **Build System** | **Vite (v6.2.3)** | Module bundler serving as production builder and development middleware proxy. |

---

## 📐 Project Type & Architecture

Healthedia is built as a **Full-Stack SPA with Embedded API Middleware**.

```
+----------------------------------------------------------------------------+
|                                FRONTEND (SPA)                              |
|   React 19 + Vite  <=====>  Centralized DB Service  <=====>  Tailwind CSS v4|
+----------------------------------------------------------------------------+
                                      ||
                        REST Synced State via fetch()
                                      ||
+----------------------------------------------------------------------------+
|                            BACKEND (EXPRESS APP)                           |
|   Disk Storage <=====>  Express REST API  <=====>  Vite Middleware Proxy   |
+----------------------------------------------------------------------------+
```

### Architectural Key Elements:
1. **Dual-Mode Serving**:
   - **Development**: Express is booted. Inside the Express lifecycle, Vite is integrated as a development middleware (`app.use(vite.middlewares)`). This means developers query standard `http://localhost:3000` which serves both static client assets on-the-fly and the active REST API.
   - **Production**: The application is compiled. The backend serves pre-built static client files from the `dist/` directory via `express.static()` and handles custom request fallbacks.
2. **Centralized Client Database Pattern**:
   - Instead of views directly accessing `localStorage`, all read/write and list operations transit through the custom transaction client in `src/lib/db.ts`. 
   - A logical-to-physical key mapper translates simple collection names (e.g. `users`) to their localStorage prefixes, and handles background fetch replication to the server.
3. **Atomic Transactions**:
   - Transactions support standard SQL-like operations in memory (`read`, `write`, `insert`, `update`, `delete`). Staged updates commit to client local storage and server database storage synchronously only upon successful function completion.

---

## 📊 Core Features & Capability Status

- **Professional Researcher Registration & Profile Verification**: `✅ WORKING` (Complete flow with ORCID integrations, profile edits, and verification requests).
- **Institution Registry & Verification System**: `✅ WORKING` (Listing, dynamic configurations, mapping, and detailed subpages).
- **Manuscript Submission & Workspace Draft Collaboration**: `✅ WORKING` (Full draft editor, live commenting, references and citation manager, auto-citation formatters).
- **Reviewer Peer-Review Panels**: `✅ WORKING` (Assigned papers, scoring systems, recommendations, action logs).
- **Publication Certificate Verification Service**: `✅ WORKING` (Digital verification search, cryptographic hash matching, and SVG vector certificates).
- **System Administrative Dashboard & Configurations**: `✅ WORKING` (Professional taxonomies modification, user status control, tickets and issues handling).
- **Full-Scale SEO Manager Control Room**: `✅ WORKING` (Site headers, templates, Canonical domains, dynamic redirects, robots.txt modifier, sitemap builder).
- **Disk-Synchronized Node/Express State**: `✅ WORKING` (REST API synchronizing collection lists, rendering sitemaps, writing static sitemap.xml and robots.txt files dynamically).

---

## 🔍 Agent Notes

The Healthedia project is an exceptionally comprehensive platform. What sets it apart is its **SEO-first architecture**. Usually, Single Page Applications struggle with indexing. However, Healthedia overcomes this by utilizing a server-side Express handler that intercepts crawler requests for `/sitemap.xml` and `/robots.txt` and dynamically serves updated content synced straight from the user's SEO Control Panel on the frontend. 

Furthermore, the implementation of a full ACID-like transactional storage manager on top of `localStorage` ensures that even during unexpected network dropouts, the client state remains consistent and merges with the Express server as soon as connection is re-established.
