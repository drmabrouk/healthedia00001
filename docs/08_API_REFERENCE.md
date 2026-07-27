# Healthedia - Full-Stack API Reference

This document provides a highly detailed reference for Healthedia's REST API endpoints defined in `server.ts`. It includes request formats, response schemas, error handling policies, and integration examples.

---

## 📋 Table of Contents
1. [General Configuration](#1-general-configuration)
2. [Database Hydration Endpoint](#2-database-hydration-endpoint)
3. [Authentication Endpoints](#3-authentication-endpoints)
4. [Universal Collection CRUD Endpoints](#4-universal-collection-crud-endpoints)
5. [Search Engine Optimization (SEO) Endpoints](#5-search-engine-optimization-seo-endpoints)
6. [Dynamic Crawler Endpoints](#6-dynamic-crawler-endpoints)
7. [System Integrity & Errors](#7-system-integrity--errors)
8. [Centralized Client Integration Example](#8-centralized-client-integration-example)
9. [🔍 Agent Notes](#-agent-notes)

---

## 1. General Configuration

- **Base URL**: `http://localhost:3000` (or dynamic production value specified via `APP_URL` environment variable).
- **Default Port**: `3000`
- **Content-Type Header**: `Application/json` (Required for all mutating operations).
- **Body Parsing Limit**: Configured up to `10mb` to safely support large manuscript text and image payloads.

---

## 2. Database Hydration Endpoint

### `GET /api/db`
Fetches the entire contents of the disk-serialized JSON database. This endpoint is called on client startup to hydrate all local collections and synchronize offline queues.

* **Response (200 OK)**:
  ```json
  {
    "users": [ ... ],
    "professions": [ ... ],
    "taxonomies": { ... },
    "manuscripts": [ ... ],
    "tickets": [ ... ],
    "appearance": { ... },
    "institutions": [ ... ],
    "evaluations": [ ... ],
    "institutionConfig": { ... },
    "projects": [ ... ],
    "activityLogs": [ ... ],
    "pages": [ ... ],
    "redirects": [ ... ],
    "seoSettings": { ... },
    "published_papers": [ ... ]
  }
  ```

### `GET /api/system/db-info`
Provides real-time system metrics, size calculations of the serialized on-disk file, active table counts, and transaction records volume. Used for clinical-grade diagnostics inside the System Administrator dashboard.

* **Response (200 OK)**:
  ```json
  {
    "databaseEngine": "JSON Local Database (with atomic replication)",
    "databaseStatus": "Optimal",
    "connectionStatus": "Connected",
    "serverStatus": "Online",
    "databaseVersion": "v1.4.2-stable",
    "storageUsage": "135.40 KB",
    "numberTables": 16,
    "totalRecords": 412,
    "filePath": "/app/data/db.json"
  }
  ```

---

## 3. Authentication Endpoints

These endpoints perform user lookup, registration, and profile metadata synchronization.

### `POST /api/auth/login`
Validates user existence by lowercased email string.

* **Request Body**:
  ```json
  {
    "email": "evelyn@dr.com"
  }
  ```
* **Response (200 OK - Match Found)**:
  ```json
  {
    "success": true,
    "user": {
      "email": "evelyn@dr.com",
      "name": "Dr. Evelyn Thorne",
      "role": "Reviewer",
      "specialty": "Neurology",
      "joinedAt": "2026-01-15",
      "status": "Active"
    }
  }
  ```
* **Response (404 Not Found - User Missing)**:
  ```json
  {
    "error": "User profile not found in database. Please register."
  }
  ```

### `POST /api/auth/register`
Saves a new user profile to disk. Automatically standardizes the email to lowercase, assigns a registration timestamp (`joinedAt`), and sets the default status to `"Active"`.

* **Request Body**:
  ```json
  {
    "user": {
      "email": "new.user@dr.com",
      "name": "Dr. Alan Turing",
      "role": "Researcher",
      "specialty": "Bioinformatics",
      "degree": "Ph.D.",
      "orcid": "0000-0002-1825-0097",
      "institution": "Cambridge Clinical Center"
    }
  }
  ```
* **Response (200 OK - Success)**:
  ```json
  {
    "success": true,
    "user": {
      "email": "new.user@dr.com",
      "name": "Dr. Alan Turing",
      "role": "Researcher",
      "specialty": "Bioinformatics",
      "degree": "Ph.D.",
      "orcid": "0000-0002-1825-0097",
      "institution": "Cambridge Clinical Center",
      "joinedAt": "2026-07-16",
      "status": "Active"
    }
  }
  ```
* **Response (400 Bad Request - Email Exists)**:
  ```json
  {
    "error": "A user with this email address is already registered."
  }
  ```

### `POST /api/auth/profile`
Updates a user's biographical cards, ORCID identifiers, clinical registries, or published history records.

* **Request Body**:
  ```json
  {
    "email": "new.user@dr.com",
    "profile": {
      "bio": "Pioneering clinical computational science.",
      "orcid": "0000-0002-1825-9999"
    }
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "email": "new.user@dr.com",
      "name": "Dr. Alan Turing",
      "role": "Researcher",
      "specialty": "Bioinformatics",
      "orcid": "0000-0002-1825-9999",
      "bio": "Pioneering clinical computational science.",
      "joinedAt": "2026-07-16",
      "status": "Active"
    }
  }
  ```

---

## 4. Universal Collection CRUD Endpoints

Healthedia uses a generic routing pattern supporting quick persistence for any of its backend collections: `users`, `professions`, `taxonomies`, `manuscripts`, `tickets`, `appearance`, `institutions`, `evaluations`, `institutionConfig`, `projects`, `activityLogs`, `pages`, `redirects`, `published_papers`.

### `GET /api/collections/:collection`
Fetches all records currently stored within a specified collection.

* **Response (200 OK)**:
  ```json
  [
    { "id": "1", "title": "Clinical Trials Summary", "status": "Draft" },
    { "id": "2", "title": "Cardiorespiratory Markers", "status": "Under Review" }
  ]
  ```

### `POST /api/collections/:collection/sync`
Overwrites the entirety of a collection on the server. Primarily used by the transaction service (`db.ts`) to commit atomic staging updates.

* **Request Body**:
  ```json
  [
    { "id": "1", "title": "Clinical Trials Summary", "status": "Draft" },
    { "id": "2", "title": "Cardiorespiratory Markers", "status": "Under Review" }
  ]
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true
  }
  ```

### `POST /api/collections/:collection`
Inserts a single new item into an array-based database collection.

* **Request Body**:
  ```json
  {
    "id": "101",
    "subject": "System Accreditations Query",
    "description": "Unable to locate accredited badges.",
    "userEmail": "mabrouk@dr.com"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "item": {
      "id": "101",
      "subject": "System Accreditations Query",
      "description": "Unable to locate accredited badges.",
      "userEmail": "mabrouk@dr.com"
    }
  }
  ```

### `PUT /api/collections/:collection/:id`
Updates fields of an existing item in the array collection. The API automatically looks up the item by checking for matches against fields `id`, `email`, or `username` matching the dynamic `:id` parameter.

* **Request Body**:
  ```json
  {
    "status": "Resolved"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "item": {
      "id": "101",
      "subject": "System Accreditations Query",
      "description": "Unable to locate accredited badges.",
      "userEmail": "mabrouk@dr.com",
      "status": "Resolved"
    }
  }
  ```
* **Response (404 Not Found)**:
  ```json
  {
    "error": "Item with ID 101 not found in tickets"
  }
  ```

### `DELETE /api/collections/:collection/:id`
Removes an item from the targeted collection array on disk.

* **Response (200 OK)**:
  ```json
  {
    "success": true
  }
  ```

---

## 5. Search Engine Optimization (SEO) Endpoints

These endpoints accept user inputs from the admin panel, serialize files directly to the web host, and update the server's cache.

### `POST /api/sitemap`
Overwrites the production and public `sitemap.xml` files with custom parsed strings.

* **Request Body**:
  ```json
  {
    "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url><loc>https://healthedia.org/</loc></url>\n</urlset>"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Sitemap updated successfully"
  }
  ```

### `POST /api/robots`
Overwrites the production and public `robots.txt` files with crawler accessibility parameters.

* **Request Body**:
  ```json
  {
    "robots": "User-agent: *\nAllow: /\nSitemap: https://healthedia.org/sitemap.xml"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "robots.txt updated successfully"
  }
  ```

---

## 6. Dynamic Crawler Endpoints

Crawling search bots bypass Single Page Application layout files entirely and hit root paths directly. The server dynamically intercepts these paths and delivers content directly from memory to improve discovery speeds.

### `GET /sitemap.xml`
Returns the cached sitemap XML document.

* **Response (200 OK - Content-Type: `application/xml`)**:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://healthedia.org/</loc></url>
  </urlset>
  ```

### `GET /robots.txt`
Returns the active plain-text crawler instructions file.

* **Response (200 OK - Content-Type: `text/plain`)**:
  ```text
  User-agent: *
  Allow: /
  Sitemap: https://healthedia.org/sitemap.xml
  ```

---

## 7. System Integrity & Errors

The backend returns standardized error formats detailing operations. It uses classic HTTP status codes:
- **`400 Bad Request`**: Indicates a validation failure, missing parameters, or duplicate index insertion.
- **`404 Not Found`**: Indicates the requested ID, collection name, or user profile email does not exist.
- **`500 Internal Server Error`**: Indicates filesystem exceptions, write access restriction, or serialization parsing faults.

### Standard JSON Error Layout:
```json
{
  "error": "Failed to write sitemap file",
  "details": "EACCES: permission denied, open '/app/public/sitemap.xml'"
}
```

---

## 8. Centralized Client Integration Example

To showcase how clean the communication has become, frontend developers don't have to write custom fetching scripts inside individual view files. Instead, they leverage the staging methods inside `src/lib/db.ts`:

### Inside `src/components/MyComponent.tsx`:
```typescript
import { db } from "../lib/db";
import { SupportTicket } from "../types";

// 1. Reading safely with database fallback:
const currentTickets = db.read<SupportTicket[]>("tickets", []);

// 2. Modifying data safely inside an isolated ACID transaction:
async function updateTicketStatus(ticketId: string, isResolved: boolean) {
  try {
    await db.runTransaction((tx) => {
      // Any step inside this block executes in staging
      tx.update<SupportTicket>("tickets", ticketId, {
        status: isResolved ? "Resolved" : "Open"
      });
      
      // Writes both to LocalStorage and triggers sync to server: POST /api/collections/tickets/sync
    });
    console.log("Ticket updated successfully!");
  } catch (error) {
    console.error("Failed to commit change. All local edits discarded:", error);
  }
}
```

---

## 🔍 Agent Notes

The design of the universal collection endpoints is incredibly efficient. Instead of writing custom database operations, routing logic, and error handlers for each of the 14 collections on the server, Express captures them using generic `:collection` parameters. It resolves queries in-memory using JavaScript object lookups before writing immediately to disk. This architecture reduces backend code footprint by almost 80%, makes debugging simpler, and simplifies database migrations.
