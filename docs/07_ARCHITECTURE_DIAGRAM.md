# System Architecture & Diagrams

This document contains comprehensive structural and data flow diagrams representing the Healthedia platform.

---

## 📋 Table of Contents
1. [Full-Stack System Architecture](#1-full-stack-system-architecture)
2. [Transactional State Synchronization Flow](#2-transactional-state-synchronization-flow)
3. [Client Component Hierarchy Tree](#3-client-component-hierarchy-tree)
4. [Page Navigation & State Routing Map](#4-page-navigation---state-routing-map)
5. [🔍 Agent Notes](#-agent-notes)

---

## 1. Full-Stack System Architecture

Below is a block architecture illustrating how components and sub-systems interface across network boundaries:

```mermaid
graph TD
    %% Client Tier
    subgraph Client Tier [Browser Environment]
        UI[React 19 Views] <--> State[React State / Context]
        UI <--> Auth[AuthView State]
        UI <--> SEO[seoHelper.ts Meta Injector]
        
        %% Centralized Database Layer
        subgraph Client DB Layer
            TX[src/lib/db.ts Transaction Service]
            LS[(LocalStorage Cache)]
        end
        
        UI <--> TX
        TX <--> LS
    end

    %% Network Connection
    TX -- "REST Sync API Calls (fetch)" --> BackEnd
    SEO -- "Crawler XML/Robots Requests" --> BackEnd

    %% Backend Tier
    subgraph Backend Tier [Express Server Runtime]
        BackEnd[server.ts - Express App]
        
        subgraph Router Mid [Routing & Middleware]
            Vite[Vite Dev Middleware]
            API[API Router]
            SEO_Serve[SEO Route Handlers /sitemap.xml]
        end
        
        BackEnd --> Vite
        BackEnd --> API
        BackEnd --> SEO_Serve
        
        subgraph Server DB Layer
            S_DB[server/db.ts DB Operations]
            Disk[(data/db.json Disk Persistence)]
        end
        
        API <--> S_DB
        S_DB <--> Disk
    end

    %% External Interfaces
    API -- "Secure API Request" --> Gemini["@google/genai (Gemini API)"]
```

---

## 2. Transactional State Synchronization Flow

This sequence trace diagram illustrates the lifecycle of a user-initiated data mutation (e.g. creating a support ticket or editing a profile). It highlights the transactional roll-back and REST-synchronization pipelines:

```mermaid
sequenceDiagram
    autonumber
    actor User as Investigator (User)
    participant V as View (e.g. SupportView)
    participant DB as src/lib/db.ts (Client DB)
    participant LS as LocalStorage Cache
    participant API as Express API Server
    participant S_DB as server/db.ts DB Manager
    participant File as data/db.json (Disk File)

    User->>V: Clicks 'Submit Ticket'
    V->>DB: Calls db.runTransaction(work)
    activate DB
    Note over DB: Instantiates Transaction Stage (Map)
    DB->>DB: Reads collection state into memory
    
    alt Operation Fails
        DB-->>V: Error Encountered (Discard staging changes - Atomic Rollback)
    else Operation Succeeds
        DB->>DB: Stages new ticket record
        DB->>LS: Writes staged data to local cache
        DB->>API: Dispatches async fetch('/api/collections/tickets/sync')
        activate API
        API->>S_DB: Receives update payload
        S_DB->>S_DB: Merges payload in-memory
        S_DB->>File: Serializes updated collections to disk
        File-->>API: Disk Write Committed
        API-->>DB: Returns Sync Success Response (200 OK)
        deactivate API
        DB-->>V: Transaction Committed Successfully
        V-->>User: Renders success status notification
    end
    deactivate DB
```

---

## 3. Client Component Hierarchy Tree

The following diagram maps the structural components rendered inside the main application viewport:

```mermaid
graph TD
    App[src/App.tsx - Core Layout Shell] --> Nav[src/components/Navbar.tsx]
    App --> Foot[src/components/Footer.tsx]
    
    %% Views Directory
    subgraph Primary Page Views
        App --> Home[HomeView]
        App --> Search[SearchResultsView]
        App --> Paper[ResearchPaperView]
        App --> Journal[JournalView]
        App --> Inst[InstitutionsView]
        App --> Res[ResearchersView]
        App --> Work[ResearchWorkspaceView]
        App --> Review[ReviewerDashboardView]
        App --> Admin[AdminDashboardView]
        App --> SEO_M[SEOManagerView]
        App --> Auth[AuthView]
        App --> Prof[UserProfileView]
        App --> Cert[CertificateVerificationView]
        App --> Course[CoursesView]
        App --> Support[SupportView]
        App --> Legal[LegalView]
    end

    %% Nested Common Elements
    Home --> SearchBar[UnifiedSearch.tsx Autocomplete]
    Search --> SearchBar
    Paper --> Certificate[PublicationCertificate.tsx Vector]
    Cert --> Certificate
    Work --> Citations[Citations Bibliography Manager]
```

---

## 4. Page Navigation & State Routing Map

Since routing is managed in-app via a state controller (`currentPage` state), this diagram traces valid view transitions and access authorization roles:

```mermaid
graph TD
    %% Public Routes
    subgraph Public Gateway
        HomeV[Home Landing Page] --- SearchV[Search Results Page]
        SearchV --- PaperV[Scholarly Paper Reader]
        HomeV --- JournalV[Academic Journal Index]
        HomeV --- InstV[Institutional Registry]
        HomeV --- CertV[Credential Certificate Search]
    end

    %% Authentication Boundary
    HomeV -->|Click Sign In| AuthV[AuthView Credentials Validator]

    %% User Specific Views
    subgraph Authenticated Workspace [Requires Researcher Role]
        AuthV -->|Login Success| ProfileV[UserProfileView Dashboard]
        ProfileV --- WorkspaceV[Manuscript Authoring Editor]
        WorkspaceV --- SubmissionsV[ManuscriptSubmissionView Wizard]
    end

    %% Reviewer Specific Views
    subgraph Peer Reviewer Portal [Requires Reviewer Role]
        AuthV -->|Login Success| ReviewerV[ReviewerDashboardView Scoring]
    end

    %% Admin Specific Views
    subgraph Control Rooms [Requires System Admin Role]
        AuthV -->|Login Success| AdminV[AdminDashboardView Configuration]
        AdminV --- SEOM[SEOManagerView Control Panel]
    end
```

---

## 🔍 Agent Notes

Mermaid is highly suitable for diagramming this platform because it visualizes the dual-state routing and transactional storage patterns. Note how the Client DB acts as a shield: the Views never touch the raw local storage database or dispatch network fetches directly. This decoupling guarantees that even if a server undergoes maintenance, the frontend remains fully functional in offline-simulation mode, caching changes on the client and resolving them with the API as soon as connectivity resumes.
