# Frontend Codebase Analysis

This document provides a highly detailed analysis of Healthedia's React 19 + Tailwind CSS v4 frontend.

---

## 📋 Table of Contents
1. [Framework & Tooling](#-framework--tooling)
2. [Source Folder Structure (`/src`)](#-source-folder-structure-src)
3. [View Layouts & Page Routing](#-view-layouts--page-routing)
4. [Extracted Components](#-extracted-components)
5. [Custom Hooks](#-custom-hooks)
6. [Services & Lib Utilities](#-services--lib-utilities)
7. [The Data Layer & Search Logic](#-the-data-layer--search-logic)
8. [TypeScript Types Structure](#-typescript-types-structure)
9. [UI/UX Design Patterns](#-uiux-design-patterns)
10. [⚠️ Missing Pieces & Recommendations](#%EF%B8%8F-missing-pieces--recommendations)
11. [🔍 Agent Notes](#-agent-notes)

---

## ⚡ Framework & Tooling

Healthedia uses a state-of-the-art frontend build and runtime setup:
- **Core Library**: **React 19.0.1** (utilizing concurrent rendering paradigms, functional components, and refined state bindings).
- **Styles**: **Tailwind CSS v4.1.14** (loaded using the modern CSS compiler directive `@import "tailwindcss";` in `src/index.css` with a customized font theme).
- **Bundler**: **Vite 6.2.3** (handling static asset resolution, build compilation, and server proxy routing).
- **Animations**: **Motion (v12.23.24)** (used for page entry-fades, sidebar triggers, and layout morphing).

---

## 📂 Source Folder Structure (`/src`)

The source folder `/src` is organized logically to separate styling, layout, data models, state layers, and business logic:

```
src/
│   App.tsx                        # Root component containing core view routing & layout shell
│   data.ts                        # Static seed and initial sandbox data
│   index.css                      # Global Tailwind styling, custom font variables, & @theme
│   main.tsx                       # React application mounting entry point
│   searchEngine.ts                # Advanced fuzzy, Levenshtein, and prefix search engine
│   types.ts                       # Core shared TypeScript declarations (Users, Papers, SEO, etc.)
│
├───components/                    # Standalone views and reusable visual modular components
│       AdminDashboardView.tsx     # Site-wide controls, taxonomies, users, and ticket manager
│       AuthView.tsx               # Professional login, registration, and OTP verification flow
│       CertificateVerificationView.tsx # Scholarly credential search and verification
│       CoursesView.tsx            # Professional curriculum overview and clinical syllabus
│       Footer.tsx                 # Site-wide semantic footer links and branding
│       HomeView.tsx               # Main landing portal with unified academic search bar
│       InstitutionsView.tsx       # Accredited clinical institutions list and profiles
│       JournalView.tsx            # Academic volume and issue index for published papers
│       LegalView.tsx              # Terms of Service, Privacy, and Institutional Governance pages
│       ManuscriptSubmissionView.tsx # Academic paper creation wizard and manuscript tracking
│       Navbar.tsx                 # Header navigation bar with role badge & profile indicators
│       PageNotFoundView.tsx       # Creative 404 handler for invalid routes
│       PublicationCertificate.tsx # Cryptographically hashable digital scholarly certificate
│       ResearchersView.tsx        # Researcher registry list and verification applications
│       ResearchPaperView.tsx      # Comprehensive reader page for a single scholarly paper
│       ResearchWorkspaceView.tsx  # Dynamic document authoring environment with live comments
│       ReviewerDashboardView.tsx  # Interactive blind-review scoring and recommendation board
│       SearchResultsView.tsx      # Multi-criteria search matches with spelling recommendations
│       SEOManagerView.tsx         # Full-scale site metadata, robots.txt, and sitemap controller
│       SupportView.tsx            # Support ticketing system, FAQs, and system health status
│       UnifiedSearch.tsx          # Real-time suggestions search overlay widget
│       UserProfileView.tsx        # Profile editing card, ORCID inputs, and career publications
│
├───hooks/
│       useSearchHistory.ts        # Custom hook tracking recent query terms and cleared history
│
├───lib/
│       db.ts                      # Centralized transactional CRUD manager with sync handlers
│       seoHelper.ts               # Dynamic head injector, Canonical generator, & schema.org creator
│       taxonomyStore.ts           # Global store definitions, initial values, and state hydration
│
├───services/
│       researchWorkspaceService.ts # Pre-defined templates, styles, and citation formatter algorithms
│       sitemapService.ts          # XML/Robots writer and sitemap builder mapping
│
└───types/
        researchWorkspace.ts       # Specialized models for workspace projects, figures, and comments
```

---

## 🖥️ View Layouts & Page Routing

Since Healthedia operates in sandboxed environments, routing is implemented as a **controlled state routing engine** in `src/App.tsx`. This avoids frame-breaking window updates and secures stable subpage rendering:

| Page State / ID | Component | View Purpose |
| :--- | :--- | :--- |
| **home** | `HomeView` | Primary landing page with large search bar and metric dashboards. |
| **search-results** | `SearchResultsView` | Displays scholarly papers and researchers corresponding to query. |
| **paper-view** | `ResearchPaperView` | Immersive reader mode with full abstract, metadata, PDF print, and citations. |
| **journal** | `JournalView` | Scholarly index representing published volumes and peer-reviewed issues. |
| **institutions** | `InstitutionsView` | Registry for mapped research institutions, accreditation levels, and parameters. |
| **researchers** | `ResearchersView` | Directory of verified clinical and scientific investigators. |
| **workspace** | `ResearchWorkspaceView` | Interactive full-stack doc editor with collaboration comments and reference tools. |
| **reviewer-dashboard** | `ReviewerDashboardView` | Dedicated portal for peer-reviewers to grade active submissions. |
| **admin-dashboard** | `AdminDashboardView` | Management panel for users, taxonomic settings, and tickets. |
| **seo-manager** | `SEOManagerView` | Dynamic robots, sitemap configurations, templates, and redirect mapping. |
| **auth** | `AuthView` | Multiphase authentication, registration wizard, OTP simulation, and recovery. |
| **profile** | `UserProfileView` | Custom user profile, credentials, ORCID integration, and bio editing. |
| **verification** | `CertificateVerificationView` | Lookup engine matching cryptographic hash keys to dynamic certificates. |
| **courses** | `CoursesView` | Educational and certification curricular overview. |
| **support** | `SupportView` | Dynamic ticketing dashboard with immediate seed tracking and FAQs. |
| **legal** | `LegalView` | Administrative terms, privacy conditions, and data sovereignty parameters. |

---

## 🧱 Extracted Components

Several key subcomponents are isolated to ensure readability and DRY (Don't Repeat Yourself) compliance:
1. `Navbar.tsx`: Holds sticky navigation, dynamic role markers, core route buttons, and mobile collapsible overlays.
2. `Footer.tsx`: Semantic footer covering copyright, fast links, API health badges, and responsive grids.
3. `UnifiedSearch.tsx`: Search autocomplete engine offering type-specific suggestions (`title`, `author`, `keyword`, `specialty`, `researcher`).
4. `PublicationCertificate.tsx`: Highly structured, printable vector certificate for peer-reviewed papers featuring QR codes, cryptographic validation hashes, signatures, and accreditation tags.

---

## ⚓ Custom Hooks

### `src/hooks/useSearchHistory.ts`
- **Purpose**: Manages search query tracking for the user to optimize fast recall.
- **Functionality**:
  - Automatically loads searches on hook initialization.
  - Exposes an active `history` list of unique strings.
  - Exposes a `saveSearch(term)` method that pushes a query, keeps unique terms, caps history to 10 queries, and persists via the centralized database client (`db`).
  - Exposes `removeSearch(term)` and `clearHistory()` methods for user privacy.

---

## 📡 Services & Lib Utilities

### `src/lib/db.ts` `✅ WORKING`
Provides transactional safety around raw memory and storage operations:
- Maps logical collections (`users`, `manuscripts`, etc.) to specific physical storage representations.
- Guarantees transaction-level staging. If multiple dependent mutations fail during compilation, changes are discarded entirely.
- Executes background synchronization callbacks against active endpoints on the Express server via asynchronous `fetch` calls.

### `src/lib/seoHelper.ts` `✅ WORKING`
Injects real-time SEO descriptors into the host container:
- Dynamically updates the browser's document title and meta keywords.
- Implements conditional JSON-LD schema objects (e.g. `ScholarlyArticle` for papers, `ProfilePage` for researchers, `EducationalOrganization` for institutions) to enhance semantic machine readability.
- Injects standard social preview tags (`og:title`, `og:description`, `og:image`, `twitter:card`) and controls crawler indexing using automated `robots` metadata toggles.

### `src/services/sitemapService.ts` `✅ WORKING`
Exposes the core algorithm translating active database collections (pages, papers, users, institutions) into standard XML sitemaps and text-based `robots.txt` files, sending them directly to the Express server for disk-level persistence.

---

## 📊 The Data Layer & Search Logic

### `src/data.ts`
Holds initial seed values ensuring the application boots with data:
- `DEMO_USERS`: Preset users representing different system roles (System Admin, Chief Editor, Verified Reviewer, Registered Researcher).
- `INITIAL_PAPERS`: Preset academic papers in distinct medical fields (Cardiorespiratory, Neuroscience, Physical Therapy).
- `INITIAL_PAGES`: Default pages mapped for administrative SEO monitoring.

### `src/searchEngine.ts` `✅ WORKING`
Features a highly sophisticated, multi-stage offline search algorithm:
1. **Levenshtein Distance Spelling Correction**: Measures differences between characters to suggest corrections (e.g., matching "cardio" if a user types "cardo").
2. **Vocabulary Indexing**: Builds an internal vocabulary set by parsing title, author, keyword, and institution strings from dataset seeds.
3. **Keyword & Weight Scoring**: Processes search terms against multiple fields, applying weighted multipliers:
   - *DOI Match*: +100
   - *Direct Title Match*: +50
   - *Direct Abstract Match*: +20
   - *Term-in-Author Match*: +15
   - *Term-in-Specialty Match*: +12
   - *Term-in-Title Match*: +10

---

## 🏷️ TypeScript Types Structure

The types defined in `src/types.ts` are strictly typed to enforce full safety:
- `UserProfileData`: Mapped user parameters including degree, specialty, ORCID, bio, role, and verification flags.
- `ResearchPaper`: Structured published paper parameters covering DOI, authors, abstracts, volume, issue, and specialties.
- `SEOPage` / `SEORedirect` / `SEOSettings`: Definitions governing redirect parameters, visibility, and crawler accessibility.
- `UserRole`: Union of `"Admin" | "Reviewer" | "Researcher" | "Public"`.

The specialized file `src/types/researchWorkspace.ts` models:
- `ResearchProject`: Dynamic document metadata, collaborators, version control snapshots, and citation attachments.
- `ReferenceItem`: Author list, title, journal, volume, issue, publication year, and DOI pointers.

---

## 🎨 UI/UX Design Patterns

The platform features an elegant, high-contrast, professional layout:
- **Visual Palette**: Neutral cool slates, charcoal grays, deep emerald accents (success triggers), and rich crimson highlights (alert controls) that convey clinical precision.
- **Micro-interactions**: Scale hover animations on action buttons, sliding sidebar panel transitions, and staggered list expansions.
- **Desktop Grid Adaptation**: Layout switches dynamically from a single-column layout on mobile devices to highly dense multi-pane interfaces (such as the document editor or SEO dashboard) on widescreen desktops.

---

## ⚠️ Missing Pieces & Recommendations

1. **🔒 State Hydration Race Conditions**:
   - *Observed*: Dynamic state is loaded via `useEffect` in several views. This can lead to flash-of-unstyled-content (FOUC).
   - *Recommendation*: Use standard React Context provider or route loader boundaries to hydrate data prior to layout rendering.
2. **🔌 Real-time WebSocket Messaging**:
   - *Observed*: Manuscript commenting currently updates local memory, which is then persisted.
   - *Recommendation*: Integrate a real-time event listener socket to propagate collaborator highlights and comment replies immediately between active researchers.

---

## 🔍 Agent Notes

The frontend of Healthedia is built as an extremely modular system. Instead of stuffing all views into a single massive file, each panel and view remains self-contained. The custom search autocomplete widget is particularly responsive as it performs zero-latency indexing directly on the active dataset in memory, preventing unnecessary network trips while providing immediate feedback on key-down.
