# Database System Analysis

This document outlines the database and persistent storage architecture of the Healthedia platform.

---

## 📋 Table of Contents
1. [Active Database Stack](#-active-database-stack)
2. [Database Type & Architecture](#-database-type--architecture)
3. [Database Schema & Data Models](#-database-schema--data-models)
4. [Is `data.ts` the Only Data Source?](#-is-datats-the-only-data-source)
5. [How `taxonomyStore.ts` Works](#-how-taxonomystorets-works)
6. [Connection Status & Live Persistency](#-connection-status--live-persistency)
7. [🚀 Recommendations for Proper Database Integration](#-recommendations-for-proper-database-integration)
8. [🔍 Agent Notes](#-agent-notes)

---

## ⚡ Active Database Stack

The application does not use external databases or third-party Database-as-a-Service (BaaS) engines by default.
- **Detected DB configuration**: No external DB URI (such as `DATABASE_URL` or `MONGODB_URI`) is specified in `.env.example` or inside `package.json`.
- **Implementation**: Persists data locally on disk via a custom **disk-serialized JSON file database** (`data/db.json`), managed by the Express backend (`server/db.ts`) and wrapped securely by the client transaction client (`src/lib/db.ts`).

---

## 📐 Database Type & Architecture

The database can be categorized as a **Disk-Serialized Single-File NoSQL Key-Value Store**.

```
 +-------------------------------------------------------------------------+
 |                               CLIENT SIDE                               |
 |   Views ===> taxonomyStore.ts ===> src/lib/db.ts (Atomic Transaction)   |
 +-------------------------------------------------------------------------+
                                      ||
                             fetch() REST API Call
                                      ||
 +-------------------------------------------------------------------------+
 |                               SERVER SIDE                               |
 |   REST API Endpoint ===> server/db.ts (Memory State) ===> data/db.json  |
 +-------------------------------------------------------------------------+
```

### Architectural Properties:
1. **In-Memory Loading**: Upon application boot, `initDB()` reads `data/db.json` from the workspace directory and loads the JSON object into a stateful in-memory object (`inMemoryStore`).
2. **Synchronous Serialization**: Every mutating action (`insertItem`, `updateItem`, `deleteItem`) replaces or edits elements in the memory store, and instantly triggers a synchronous write to disk (`fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2))`).
3. **Backup Fallbacks**: If the disk file fails to load or is corrupted, the server falls back to default seed datasets, ensuring the application remains functional.

---

## 🗄️ Database Schema & Data Models

The server database stores 14 primary collections:

| Collection Name | Data Structure Summary | Mapped Storage Key |
| :--- | :--- | :--- |
| **users** | Array of verified credentials, titles, ORCID, bio, role, status. | `healthedia_users` |
| **professions** | Array of strings representing approved clinical and scientific roles. | `healthedia_professions` |
| **taxonomies** | Nested dictionaries of categories, keywords, countries, etc. | `healthedia_taxonomies` |
| **manuscripts** | Peer-review draft submissions, abstracts, authors, statuses. | `healthedia_manuscripts` |
| **tickets** | Support and help tickets with categories, descriptions, status. | `healthedia_tickets` |
| **appearance** | Visual parameters: branding text, colors, hero text layouts. | `healthedia_appearance` |
| **institutions** | Accredited clinical centers: names, types, addresses, phone, stats. | `healthedia_institutions` |
| **evaluations** | Institutional reviews: ratings, scores, relationships, comments. | `healthedia_evaluations` |
| **institutionConfig** | Weighting biases and guidelines for clinical accreditations. | `healthedia_institution_config` |
| **projects** | Custom researcher workspace documents, comments, highlights, versions. | `healthedia_projects` |
| **activityLogs** | General system log: actions, timestamps, users, details. | `healthedia_activity_logs` |
| **pages** | SEO pages: titles, slugs, visibility, search indexes. | `healthedia_pages` |
| **redirects** | Path mapping parameters (status 301, source, target). | `healthedia_redirects` |
| **published_papers**| Catalog of published scholarly studies, DOIs, abstracts, journals. | `healthedia_published_papers` |

---

## 📊 Is `data.ts` the Only Data Source?

No. While `src/data.ts` serves as the initial client fallback seed, it is **not** the only data source.
- **Initial Boot**: On the very first run, `server/db.ts` generates `data/db.json` on disk using the data structures found inside its own codebase.
- **Dynamic Updates**: Once booted, the file on disk (`data/db.json`) diverges from `src/data.ts` as users register, submit manuscripts, post comments, configure SEO redirects, or write custom robots.txt.
- **Centralized Client DB**: The client-side transaction service `src/lib/db.ts` acts as the single point of contact for data mutations, bypassing simple static mock interactions.

---

## 🔄 How `taxonomyStore.ts` Works

`src/lib/taxonomyStore.ts` serves as the legacy interface for global application state hydration, which has been upgraded to delegate directly to `src/lib/db.ts`:
- **Hydration**: On app mounting, `initializeTaxonomyStore` executes `fetch("/api/db")`. If the server responds with a valid collection payload, the client replaces local state with the server's state.
- **Safe Wrappers**: The traditional `getStoredItem` and `setStoredItem` functions are refactored to read and write directly using the high-performance transaction-staging logic in `db.ts`, eliminating raw unformatted `localStorage` entries and securing data synchronization.

---

## 📡 Connection Status: Real DB Connection or Placeholder?

### Connection Status: `🔄 PARTIAL` (File-System Database Engine)

The backend features a fully functioning persistence system, but it is not connected to an external enterprise DBMS:
- **No external DB connections exist**. There are no network drivers for MongoDB, PostgreSQL, or Firestore initialized.
- **Local persistence is 100% active**. In-memory values are bound to file-system stream-writers, making the application offline-tolerant while ensuring that all user data remains safe and sound across local container restarts.

---

## 🚀 Recommendations for Proper Database Integration

To transition Healthedia from a disk-level JSON container database to an enterprise production setup, we recommend the following migrations:

### Option A: Firebase Firestore (Default Recommended)
- **Why**: Excellent for real-time document-based state matching. Integrates flawlessly with Firebase Authentication.
- **How**:
  1. Initialize Firestore via the AI Studio Firebase Setup tool.
  2. Implement security rules to lock down manuscript and reviewer collection modifications to authorized user roles.
  3. Replace the local `fetch` calls inside `src/lib/db.ts` with Firestore SDK actions (`doc()`, `setDoc()`, `getDocs()`).

### Option B: Cloud SQL (PostgreSQL via Drizzle ORM)
- **Why**: Necessary if the platform moves toward strict relational billing, SQL joins, or structured clinical datasets requiring ACID safety.
- **How**:
  1. Provision a PostgreSQL instance using Cloud SQL.
  2. Define schemas inside `src/db/schema.ts` (mapping Users, Manuscripts, Peer Reviews).
  3. Swap the CRUD handlers in `server/db.ts` with SQL queries executed using Drizzle or Prisma.

---

## 🔍 Agent Notes

The implementation of `data/db.json` is a superb staging pattern. It provides complete persistence for development without the overhead of spinning up databases, making the application fully functional immediately upon clone. Wrapping client-side database writes inside ACID-like local transactions (`src/lib/db.ts`) simplifies future migrations: if the platform transitions to Firebase or PostgreSQL, the developer only needs to modify the endpoints in `server.ts` or the sync wrapper in `db.ts` without touching any of the UI views!
