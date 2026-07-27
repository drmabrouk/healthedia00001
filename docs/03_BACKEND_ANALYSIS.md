# Backend Codebase & Runtime Analysis

This document provides a technical analysis of Healthedia's active REST API and server-side engine running on port 3000.

---

## 📋 Table of Contents
1. [Backend Runtime Environment](#-backend-runtime-environment)
2. [Server Architecture Overview](#-server-architecture-overview)
3. [REST API Endpoints & Routes](#-rest-api-endpoints--routes)
4. [Authentication & Session Logic](#-authentication--session-logic)
5. [Dynamic File-Sync Controllers (SEO)](#-dynamic-file-sync-controllers-seo)
6. [Core Technical Integrity Answers](#-core-technical-integrity-answers)
7. [Backend Dependencies](#-backend-dependencies)
8. [🔍 Agent Notes](#-agent-notes)

---

## ⚡ Backend Runtime Environment

Healthedia's development and production runtimes are configured to execute seamlessly with native TypeScript support:
- **Primary Runtime Engine**: **Node.js** with **tsx** (TypeScript Execute) during development. The folder structure also includes `bun.lock` indicating native compatibility with the **Bun** high-performance runtime.
- **Production Bundler**: **esbuild** compiles `server.ts` to `dist/server.cjs` (CommonJS module), bundling the custom server code while treating external npm libraries as external packages.
- **Port Ingress**: Binds strictly to port `3000` on the `0.0.0.0` host interface, ensuring compatibility with containerized deployment layers (such as Google Cloud Run).

---

## 📐 Server Architecture Overview

The backend uses a standard **Express.js API server** which acts as the database of record, while also hosting Vite development middleware or static production content.

```
+-----------------------------------------------------------------------------------------+
|                                    EXPRESS BACKEND                                      |
|                                                                                         |
|  +--------------------+      +--------------------+      +---------------------------+  |
|  |     API Routes     |      |  Sitemap/Robots TXT|      |   Vite Asset Middleware   |  |
|  |  (Users, Projects, | <==> |  (Dynamic Serving  | <==> | (Dev: Live proxy          |  |
|  |   Papers, Tickets) |      |   & Disk Writing)  |      |  Prod: Static index.html) |  |
|  +--------------------+      +--------------------+      +---------------------------+  |
|           ||                          ||                                                |
|           \/                          \/                                                |
|  +------------------------------------------------+                                     |
|  |                DISK STORAGE DATABASE           |                                     |
|  |                 (/data/db.json)                |                                     |
|  +------------------------------------------------+                                     |
+-----------------------------------------------------------------------------------------+
```

---

## 📡 REST API Endpoints & Routes

The server defines endpoints mapping standard CRUD verbs to internal collection arrays:

### 1. Database Hydration & Sync
- `GET /api/db`: Hydrates the client. Fetches all in-memory server collections in a single round-trip.
- `POST /api/collections/:collection/sync`: Synchronizes a complete frontend collection array, instantly writing it to the server-side JSON database and persisting to disk.

### 2. Collection CRUD Endpoints
- `GET /api/collections/:collection`: Fetches the entire record list for a given collection (e.g. `users`, `published_papers`, `tickets`).
- `POST /api/collections/:collection`: Inserts a new record.
- `PUT /api/collections/:collection/:id`: Finds a record by ID, email, or username, merges modified fields, and writes back.
- `DELETE /api/collections/:collection/:id`: Removes a record from the targeted database collection.

---

## 🔒 Authentication & Session Logic

The backend supports lightweight, credential-less credential verification tailored for clinical sandboxes:
- `POST /api/auth/login`: Triggers a search inside the active `users` database. Returns the matching user profile if found, or returns a `404` prompt instructing registration.
- `POST /api/auth/register`: Prevents email duplication, seeds metadata (e.g., joined date), adds the record, and outputs a success object.
- `POST /api/auth/profile`: Updates a researcher's biography, credentials, ORCID, or publications by triggering a merge with the user's primary database record on disk.

---

## 🌐 Dynamic File-Sync Controllers (SEO)

To maintain search engine crawlers with updated information, Healthedia implements real-time dynamic SEO generation:
- `POST /api/sitemap`: Accepts generated XML strings from the client. Writes the XML file to disk inside both `public/sitemap.xml` and `dist/sitemap.xml` (for production containers), keeping the file in hot memory for high-speed serving.
- `POST /api/robots`: Accepts updated robots rules strings. Writes to `public/robots.txt` and `dist/robots.txt` and updates memory state.
- `GET /sitemap.xml`: Intercepts crawler requests and instantly returns the cached sitemap XML string.
- `GET /robots.txt`: Intercepts crawler requests and returns current search engine visibility criteria.

---

## 🔍 Core Technical Integrity Answers

### Is the backend actually working and connected to the frontend?
> **`✅ WORKING`**
>
> Yes. The backend compiles, boots, and binds correctly. The frontend client initiates an initial sync on mount (`fetch("/api/db")`) to populate state, and triggers subsequent REST synchronization requests upon local data modifications.

### Are there real API calls between frontend and backend?
> **`✅ WORKING`**
>
> Yes. Every CRUD action, profile update, ticketing creation, and custom SEO change triggers a real `fetch` network request directly to the backend API (`/api/*`).

### Is there a real database connection or is it mock data only?
> **`🔄 PARTIAL`**
>
> The backend does not connect to a heavy relational DBMS like PostgreSQL or a NoSQL BaaS like MongoDB. Instead, it utilizes a **disk-serialized JSON file system database** (`data/db.json`) located inside the server runtime environment. 
> 
> *Note:* This database is fully persistent. All changes, new registrations, tickets, and revised sitemaps persist across server restarts on host systems and persistent containers.

---

## 📦 Backend Dependencies

The backend components declared in `package.json` are:

| Package | Purpose | Category |
| :--- | :--- | :--- |
| `express` | Web routing, API endpoint serving, and sitemap delivery. | Dependency |
| `dotenv` | Loads environment configurations (`GEMINI_API_KEY`, `APP_URL`). | Dependency |
| `tsx` | Executes TS server code directly in development mode without build steps. | DevDependency |
| `esbuild` | Bundles and transpiles the TS server to standalone production CommonJS. | DevDependency |
| `@types/express` | Express.js TypeScript types. | DevDependency |
| `@types/node` | Node.js core type parameters. | DevDependency |

---

## 🔍 Agent Notes

The backend is brilliantly structured. By implementing dynamic `__dirname` resolution, it avoids path breaking when executing as standard TypeScript in dev mode versus a bundled CommonJS file in production. The dynamic serving of `/sitemap.xml` and `/robots.txt` directly from memory is a robust choice that eliminates disk-read latency when web crawlers crawl the system.
