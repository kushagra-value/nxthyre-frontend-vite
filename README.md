# NxtHyre Frontend - Architecture & Codebase Overview

This document provides a comprehensive technical breakdown of the existing NxtHyre frontend codebase (`nxthyre-frontend-vite`). It covers the directory structure, routing, state management, API layer, authentication flows, technical debt, and actionable recommendations for a V2 architecture redesign following modern React best practices.

---

## Table of Contents
1. [Overall Folder Structure & Directory Purpose](#1-overall-folder-structure--directory-purpose)
2. [Application Flow & Lifecycle](#2-application-flow--lifecycle)
3. [State Management Approach](#3-state-management-approach)
4. [API Layer & Data Flow](#4-api-layer--data-flow)
5. [Reusable Components & Shared Utilities](#5-reusable-components--shared-utilities)
6. [Custom Hooks & Responsibilities](#6-custom-hooks--responsibilities)
7. [Authentication & Authorization Flow](#7-authentication--authorization-flow)
8. [Environment Variables & Configuration](#8-environment-variables--configuration)
9. [Key Dependencies & Technology Stack](#9-key-dependencies--technology-stack)
10. [Current Architectural Issues & Technical Debt](#10-current-architectural-issues--technical-debt)
11. [V2 Architecture Blueprint & Recommendations](#11-v2-architecture-blueprint--recommendations)

---

## 1. Overall Folder Structure & Directory Purpose

The workspace is a Single Page Application (SPA) initialized with [Vite](https://vitejs.dev/), React 18, TypeScript, and Tailwind CSS. Below is the tree representation of the codebase root and `src/` directory:

```text
nxthyre-frontend-vite/
├── .env / .env.example        # Environment variable definitions
├── check.md                   # API contract notes (documenting typo fallback fields)
├── index.html                 # HTML shell entry point
├── package.json               # Package manifests and script definitions
├── postcss.config.js          # PostCSS configuration for Tailwind CSS
├── tailwind.config.js         # Tailwind CSS styling design system tokens
├── tsconfig.json / .app.json  # TypeScript compiler configurations
├── vite.config.ts             # Vite bundler configuration
└── src/
    ├── main.tsx               # Primary JavaScript entry point
    ├── App.tsx                # Master routing, layout frame & main state router
    ├── App copy.tsx           # [DEPRECATED] 153KB leftover backup file
    ├── AuthApp.tsx            # Legacy authentication entry point wrapper
    ├── index.css              # Global styles & Tailwind CSS imports
    ├── ckeditor.d.ts          # Custom TypeScript declarations for CKEditor
    ├── components/            # Visual UI components
    │   ├── AuthApp.tsx        # Authentication modal and workflow container
    │   ├── common/            # Complex multi-purpose components (ProjectCard, TemplateSelector)
    │   ├── layout/            # Application frame (Sidebar, Header, AuthLayout, DashboardLayout)
    │   ├── legal/            # Privacy Policy and Terms content pages
    │   ├── skeletons/        # Loading skeleton placeholders
    │   ├── ui/               # [EMPTY] Intended for primitive UI design system components
    │   ├── utils/            # [MISPLACED] Utility file sendInviteUtils.ts
    │   └── workspace/        # Organization and Workspace setup modals
    ├── config/                # Platform configuration
    │   └── firebase.ts        # Firebase app & authentication initialization
    ├── context/               # React Context definitions
    │   └── AuthContext.tsx    # Global authentication & active workspace context
    ├── data/                  # Static & mock dataset files
    │   ├── authData.ts        # Auth onboarding dropdown options
    │   ├── candidates.ts      # Mock candidate lists
    │   ├── mockEvents.ts      # Mock calendar events
    │   └── pipelineData.ts    # Mock recruitment pipeline stages
    ├── hooks/                 # Custom React hooks
    │   ├── useAuth.ts         # Firebase auth listener & user status sync
    │   └── useDebounce.ts     # Input search debouncing hook
    ├── lib/                   # [EMPTY] Intended for third-party client instances
    ├── pages/                 # Route/Page level view containers
    │   ├── auth/              # Auth pages (Login, SignUp, ForgotPassword, LinkedInAuth)
    │   ├── candidatePortal/   # Candidate tracking & login views
    │   ├── candidates/        # Candidate pool & search views (+ 187KB CandidatesMain.tsx)
    │   ├── companies/         # Workspace job listings & 272KB JobPipelineDashboard.tsx
    │   ├── dashboard/         # Recruiter analytics dashboard & action cards
    │   ├── interviews/        # Interview overview page
    │   ├── pipelines/         # Requisition pipelines (+ 295KB PipelineStages.tsx)
    │   ├── profileShare/      # Public candidate shareable profile page
    │   ├── schedules/         # Calendar and interview scheduling views
    │   ├── settings/          # User settings page
    │   └── superadmin/        # Super-admin management dashboards
    ├── services/              # API Client & Backend HTTP Service layer
    │   ├── api.ts             # Primary Axios instance with Bearer token interceptor
    │   ├── authService.ts     # Authentication & user status API calls
    │   ├── candidateService.ts# 1,300-line candidate data CRUD & unlock API service
    │   ├── dashboardService.ts# Recruiter dashboard metrics API service
    │   ├── jobPostService.ts  # Job posting & pipeline stages API service
    │   ├── organizationService.ts# Workspaces & organizations API service
    │   └── scheduleService.ts # Interview schedule API service
    │   └── superAdminApi.ts   # [INCONSISTENT] Native fetch API service for superadmin
    ├── types/                 # TypeScript interfaces
    │   └── auth.ts            # User and Auth state interfaces
    └── utils/                 # Pure helper functions
        ├── candidateAttention.ts# Attention pill tag calculation algorithms
        ├── interviewForm.constants.ts # Form dropdown options
        ├── recruiterMappings.ts# Recruiter role label mappings
        ├── stageColors.ts     # Pipeline badge color mappers
        ├── stageUtils.ts      # Stage progression helpers
        └── toast.ts           # Wrapped react-hot-toast notifications
```

---

## 2. Application Flow & Lifecycle

The execution flow of the application follows a hybrid architecture, combining standard React Router URLs for public/standalone views with internal state-based tab routing for the core recruiter dashboard.

```mermaid
flowchart TD
    A[main.tsx Entry Point] --> B[PostHog Analytics Provider]
    B --> C[App.tsx Master Router]
    C --> D[AuthProvider Context]
    D --> E[BrowserRouter]

    E --> F{Route Path Check}
    F -- "/super-admin" --> G[SuperAdminRoute Guard]
    F -- "/candidate-profiles/:id" --> H[ShareableProfile]
    F -- "/call/:candidateId/:jobId" --> I[CandidateCallPage]
    F -- "/pipelines/:pipelineId" --> J[PipelineSharePage]
    F -- "/jobs/:id" --> K[JobApplicationForm]
    F -- "/invite" --> L[InvitePage]
    F -- "/" Root Route --> M{isAuthenticated?}

    M -- False --> N[AuthApp Modal / Login Page]
    M -- True --> O[Main Shell Layout]

    O --> P[Sidebar Component]
    O --> Q[HeaderBar Component]
    O --> R{currentPage State}

    R -- "dashboard" --> S[Dashboard Page]
    R -- "companies" --> T[Companies Page]
    R -- "candidatePool" --> U[CandidatesPool Page]
    R -- "candidateSearch" --> V[CandidateSearch Page]
    R -- "jobPipeline" --> W[JobPipeline Page]
    R -- "calendar" --> X[SchedulePage]
```

### Flow Breakdown:
1. **Entry Point ([main.tsx](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/main.tsx))**:
   - Mounts the React root into `<div id="root">`.
   - Wraps `<App />` with `StrictMode` and `PostHogProvider` for client analytics.
2. **Top-Level Orchestrator ([App.tsx](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/App.tsx))**:
   - Wraps the component tree with `<AuthProvider>` ([AuthContext.tsx](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/context/AuthContext.tsx)) and `BrowserRouter`.
   - Manages top-level React Router routes (`/super-admin`, `/candidate-profiles/:id`, `/pipelines/:id`, `/jobs/:id`, `/invite`, `/settings`, etc.).
3. **Workspace Layout & State Routing**:
   - When the user lands on `/`, `App.tsx` evaluates `isAuthenticated`.
   - Unauthenticated users render `<AuthApp initialFlow="login" />`.
   - Authenticated users render a fixed layout containing `<Sidebar>`, `<HeaderBar>`, and `{renderPage()}`.
   - Internal tab switching is driven by `currentPage` state (persisted in `sessionStorage.getItem("nxthyre_activeTab")`).
4. **Cross-Component Event Signaling (Anti-Pattern)**:
   - Navigation between nested levels (e.g., Companies list → Workspace Jobs → Job Candidate Profile) communicates using Custom Window DOM Events (`breadcrumb-navigate`, `header-update`, `tab-switch`).
   - Selected entity state is saved on the `window` object (e.g., `(window as any).__selectedWorkspaceName`, `__selectedJobName`).

---

## 3. State Management Approach

The application **does not use an external global state management library** (such as Redux, Zustand, or TanStack Query). Instead, it relies on a combination of React Context, browser storage, local component state, and global window objects.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            STATE ARCHITECTURE                               │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ State Scope                   │ Implementation Strategy                     │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ Global Auth & Workspace       │ AuthContext.tsx (React Context)             │
│ Active Navigation Tab         │ sessionStorage ("nxthyre_activeTab")        │
│ Selected Recruiter Workspace  │ Cookies ("selectedWorkspaceId")             │
│ Firebase Auth Token           │ localStorage ("authToken")                  │
│ Cross-Component Breadcrumbs   │ Global window object + Custom DOM Events    │
│ Server Data & UI State        │ Isolated useState per component file        │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

### Key Characteristics:
* **AuthContext ([AuthContext.tsx](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/context/AuthContext.tsx))**:
  Exposes `isAuthenticated`, `user` (transformed backend user model), `userStatus`, `loading`, `selectedWorkspaceId`, `setSelectedWorkspaceId`, and `signOut()`.
* **Isolated Server State**:
  Every component fetches its own data independently inside `useEffect` hooks and stores it in local state. There is **no client-side caching**, query deduplication, or automatic revalidation. Navigating between views re-triggers fresh network calls.
* **Global Window Mutations**:
  Components share header breadcrumbs and selection state via global variables (`window.__selectedJobName`) and custom events (`window.dispatchEvent(new CustomEvent("header-update"))`).

---

## 4. API Layer & Data Flow

### 1. HTTP Client Architecture
API calls are primarily funneled through [src/services/api.ts](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/services/api.ts), which exports a pre-configured Axios instance (`apiClient`).

```typescript
// apiClient Interceptor Pattern (src/services/api.ts)
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. Dual API Client Fragmentation
An inconsistency exists in the API layer:
* **Standard Services** ([candidateService.ts](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/services/candidateService.ts), [jobPostService.ts](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/services/jobPostService.ts), [organizationService.ts](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/services/organizationService.ts)): Use `apiClient` (Axios) with automatic Firebase Bearer token attachment.
* **SuperAdmin API Service** ([superAdminApi.ts](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/services/superAdminApi.ts)): Bypasses Axios and uses a custom `fetchWithAuth` wrapper using native `fetch()`. It retrieves the Bearer token directly from `localStorage.getItem("authToken")`.

### 3. End-to-End Data Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Component as Page Component (e.g. CandidatesMain)
    participant Service as Service Layer (e.g. candidateService)
    participant Axios as Axios Instance (apiClient)
    participant Firebase as Firebase Auth SDK
    participant Backend as Django REST Backend

    User->>Component: Interacts with UI (e.g., search candidates)
    Component->>Service: Call candidateService.getCandidates(params)
    Service->>Axios: apiClient.get("/candidates/search/", config)
    Axios->>Firebase: auth.currentUser.getIdToken()
    Firebase-->>Axios: Return fresh JWT Bearer Token
    Axios->>Backend: HTTP GET /api/candidates/search/ Header: Authorization Bearer JWT
    Backend-->>Axios: 200 OK Response (JSON payload)
    Axios-->>Service: AxiosResponse
    Service-->>Component: Processed Candidate Data
    Component->>Component: setState(data)
    Component-->>User: Re-render UI with new candidates
```

### 4. API Payload Technical Debt
As documented in [check.md](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/check.md), backend response contracts include duplicate misspelled fields (`questioion_analysis` alongside `question_analysis`) to maintain backwards compatibility with legacy frontend checks.

---

## 5. Reusable Components & Shared Utilities

### 1. Shared Layout & Workspace Components
* **Layout Frames**:
  - [Sidebar.tsx](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/components/layout/Sidebar.tsx): Primary sidebar with active tab highlighting and workspace switcher dropdown.
  - [Header.tsx](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/components/layout/Header.tsx): Top navigation bar with dynamic breadcrumbs, notification popover, and profile dropdown.
* **Workspace Setup**:
  - [CreateOrganization.tsx](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/components/workspace/CreateOrganization.tsx), [WorkspaceCreation.tsx](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/components/workspace/WorkspaceCreation.tsx), [WorkspacesOrg.tsx](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/components/workspace/WorkspacesOrg.tsx): Onboarding modals for organization setup and workspace creation.
* **Skeletons**:
  - [PipelineSkeletonLoader.tsx](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/components/skeletons/PipelineSkeletonLoader.tsx), [ProjectSkeletonCard.tsx](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/components/skeletons/ProjectSkeletonCard.tsx): Skeleton loading cards.

### 2. Core Utilities
* **[toast.ts](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/utils/toast.ts)**: A structured wrapper around `react-hot-toast` providing standard styling for `showToast.success()`, `showToast.error()`, `showToast.loading()`, and `showToast.info()`.
* **[candidateAttention.ts](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/utils/candidateAttention.ts)**: Utility containing algorithms to determine attention status badges:
  - `getAttentionPill()`: Calculates follow-up priorities and formats call status labels (`Call not picked up`, `Wrong Number`, `Call line busy`).
  - `formatTimeAgo()`: Converts ISO strings into abbreviated relative timestamps (`5m`, `3h`, `2d`).
  - `formatMovedDate()`: Extracts stage transition dates.
* **[stageUtils.ts](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/utils/stageUtils.ts)** & **[stageColors.ts](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/utils/stageColors.ts)**: Helper functions for mapping recruitment pipeline stages to distinct CSS background and text color tokens.

---

## 6. Custom Hooks & Responsibilities

The project currently contains two custom hooks:

```text
┌─────────────────┬───────────────────────────────────────────────────────────┐
│ Custom Hook     │ Key Responsibilities                                      │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ useAuth.ts      │ 1. Subscribes to Firebase onAuthStateChanged events.      │
│                 │ 2. Stores fresh Firebase ID token in localStorage.        │
│                 │ 3. Fetches user status & permissions via authService.     │
│                 │ 4. Provides signOut() and refreshUserStatus() methods.    │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ useDebounce.ts  │ 1. Delays updating a value until a specified timeout      │
│                 │    elapses (default 500ms).                             │
│                 │ 2. Used in candidate search filters to prevent excessive  │
│                 │    network requests per keystroke.                        │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 7. Authentication & Authorization Flow

The application implements a dual authentication and authorization model combining **Firebase Auth** for identity management and **Django REST Framework Backend** for Role-Based Access Control (RBAC).

```mermaid
flowchart TD
    A[User Enters Credentials] --> B{Auth Method}
    B -- Email / Password --> C[Firebase signInWithEmailAndPassword]
    B -- Google OAuth --> D[Firebase signInWithPopup GoogleAuthProvider]
    B -- LinkedIn OAuth --> E[LinkedIn Callback -> Backend Exchange]

    C --> F[Firebase Returns User & JWT Token]
    D --> F
    E --> F

    F --> G[useAuth Hook Detects Token]
    G --> H[Save Token to localStorage 'authToken']
    G --> I[Call authService.getUserStatus]
    I --> J[Backend Validates Token & Returns User Status Payload]

    J --> K{userStatus.is_onboarded?}
    K -- False --> L[Redirect to /workspaces-org Setup]
    K -- True --> M[Mount Dashboard / Interface]

    M --> N{SuperAdmin Route Access?}
    N -- Yes --> O[Check user.isSuperAdmin]
    O -- False --> P[Redirect to /]
    O -- True --> Q[Mount SuperAdmin Dashboard]
```

### Key Authorization Mechanisms:
* **Token Lifecycle**:
  `onAuthStateChanged` in [useAuth.ts](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/hooks/useAuth.ts) retrieves a fresh token (`getIdToken()`) whenever auth state changes and persists it in `localStorage.getItem("authToken")`.
* **Workspace Selection**:
  Recruiter permissions are scoped to the active workspace ID (`selectedWorkspaceId` stored in `Cookies`), which is automatically attached to API request params across services.
* **SuperAdmin Route Guard**:
  `App.tsx` defines `<SuperAdminRoute>` which checks `user.isSuperAdmin`. Non-superadmin users are redirected to `/`.

---

## 8. Environment Variables & Configuration

The application defines environment variables in [.env.example](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/.env.example):

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBoC...
VITE_FIREBASE_AUTH_DOMAIN=nxthyre.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nxthyre
VITE_FIREBASE_STORAGE_BUCKET=nxthyre.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=863630644667
VITE_FIREBASE_APP_ID=1:863630644667:web:137f60cd0f723ee301e09e

# Backend API Configuration
VITE_API_BASE_URL=https://nxthyre-server-staging-863630644667.asia-south1.run.app/api

# LinkedIn OAuth Configuration
VITE_LINKEDIN_CLIENT_ID=your-linkedin-client-id

# Analytics Configuration
VITE_PUBLIC_POSTHOG_KEY=phc_...
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### ⚠️ Configuration Flaw & Security Violation:
In [src/config/firebase.ts](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/config/firebase.ts), Firebase credentials are **hardcoded directly into the source file** instead of consuming `import.meta.env` values:

```typescript
// Current Hardcoded Implementation in src/config/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyBoCauxrpkHo3kzCHq1A_Zi9YF63OerM18", // HARDCODED
  authDomain: "nxthyre.firebaseapp.com",
  projectId: "nxthyre",
  // ...
};
```

---

## 9. Key Dependencies & Technology Stack

The application's core libraries listed in [package.json](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/package.json):

```text
┌───────────────────────────────────────┬─────────────┬────────────────────────────────────────────────────────┐
│ Dependency Package                    │ Version     │ Primary Purpose & Usage Rationale                      │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ react / react-dom                     │ ^18.3.1     │ Core UI component rendering library.                   │
│ react-router-dom                      │ ^7.6.3      │ Client-side routing and URL matching.                  │
│ firebase                              │ ^11.10.0    │ User authentication, JWT ID token management.          │
│ axios                                 │ ^1.10.0     │ HTTP client for backend REST API calls.                │
│ lucide-react                          │ ^0.344.0    │ Primary icon set for UI interface.                     │
│ @fortawesome/react-fontawesome        │ ^0.2.2      │ Social & brand icons (LinkedIn, etc.).                 │
│ react-hot-toast                       │ ^2.4.1      │ Toast notification alerts.                             │
│ posthog-js                            │ ^1.258.2    │ Analytics and user interaction tracking.               │
│ js-cookie                             │ ^3.0.5      │ Persistent storage of selected workspace ID in cookie. │
│ @ckeditor/ckeditor5-react             │ ^11.0.0     │ Rich text editor for Job Description creation.         │
│ papaparse                             │ ^5.5.3      │ CSV parser for candidate bulk imports.                 │
│ xlsx                                  │ ^0.18.5     │ Excel parsing for bulk candidate data.                 │
│ html2pdf.js                           │ ^0.14.0     │ Client-side PDF export for candidate profiles.         │
│ plivo-browser-sdk                     │ ^2.2.21     │ WebRTC audio calling for screening candidates.        │
│ tailwindcss                           │ ^3.4.1      │ Utility-first styling framework.                       │
└───────────────────────────────────────┴─────────────┴────────────────────────────────────────────────────────┘
```

---

## 10. Current Architectural Issues & Technical Debt

### 1. Monolithic "God Components"
Multiple files in the codebase exceed standard size limits and contain mixed business logic, inline sub-components, complex state hooks, and custom styling:

```text
┌─────────────────────────────────────────────────────────────────────────────┬───────────┐
│ File Path                                                                   │ File Size │
├─────────────────────────────────────────────────────────────────────────────┼───────────┤
│ src/pages/pipelines/PipelineStages.tsx                                      │ 295 KB    │
│ src/pages/companies/components/JobPipelineDashboard.tsx                     │ 272 KB    │
│ src/pages/pipelines/PipelineSharePage.tsx                                  │ 223 KB    │
│ src/pages/candidates/components/CandidatesMain.tsx                         │ 187 KB    │
│ src/App copy.tsx (Dead code lingering in source root)                       │ 153 KB    │
│ src/pages/companies/components/JobCandidateProfile.tsx                    │ 146 KB    │
│ src/pages/companies/components/JobListing.tsx                              │ 135 KB    │
│ src/pages/pipelines/StageDetails.tsx                                       │ 107 KB    │
│ src/pages/companies/components/CandidateCallPage.tsx                       │ 94 KB     │
│ src/pages/candidates/components/CandidateDetail.tsx                        │ 87 KB     │
│ src/components/common/TemplateSelector.tsx                                 │ 85 KB     │
└─────────────────────────────────────────────────────────────────────────────┴───────────┘
```

### 2. Hybrid State Routing & Global Window Mutations
- The primary recruiter dashboard ignores React Router URLs and relies on state-based page switching (`currentPage` stored in `sessionStorage`).
- Components communicate navigation and active selections using global window object properties (`window.__selectedJobName`) and custom DOM Event Listeners (`window.dispatchEvent(new CustomEvent("breadcrumb-navigate"))`).

### 3. Lack of Data Caching & Network Redundancy
- Data fetching logic is duplicated across components using raw `useEffect` calls.
- Navigating between pages destroys component state, forcing full API re-fetches without client-side caching, optimistic updates, or background revalidation.

### 4. API Layer Inconsistencies & Hardcoded Credentials
- Dual HTTP clients exist (`apiClient` using Axios vs `superAdminApi` using `fetchWithAuth`).
- Firebase tokens are redundantly stored in `localStorage` ("authToken").
- Firebase API keys are hardcoded in [src/config/firebase.ts](file:///d:/downloads/next_project/nxthyre_website/nxthyre-frontend-vite/src/config/firebase.ts).

### 5. Disorganized Project Taxonomy & Misplaced Code
- `sendInviteUtils.ts` is located inside `src/components/utils/` instead of `src/utils/`.
- Page-specific mock datasets (`companiesData.ts`, `JobPipelineData.ts`, `dashboardData.ts`) are stored directly inside page subdirectories.
- Feature modals (e.g., `CallCandidateModal.tsx`, `ActionReviewModal.tsx`) are buried deep inside page component folders rather than stored in a shared modal directory.
- `src/components/ui/` and `src/lib/` directories are completely empty.

---

## 11. V2 Architecture Blueprint & Recommendations

To eliminate technical debt, improve performance, ensure scale, and simplify maintainability, the following architecture is recommended for the V2 redesign.

```mermaid
graph TD
    subgraph V2 Architecture Blueprint
        A[URL-Driven Router: TanStack Router / React Router v7] --> B[Zustand Store: Client Auth & UI Preferences]
        A --> C[TanStack Query: Server State, Caching & Optimistic UI]
        C --> D[Unified Axios API Client + Request/Response Interceptors]
        
        E[Modular Atomic UI System: Shadcn UI / Radix Primitives] --> F[Feature-Driven Domains]
        F --> G[features/candidates]
        F --> H[features/jobs]
        F --> I[features/pipeline]
        F --> J[features/auth]
        F --> K[features/organization]
    end
```

### 1. Feature/Domain-Driven Folder Hierarchy
Transition from generic, flat folders (`pages/`, `components/`) to self-contained feature domains:

```text
src/
├── assets/                  # Public static assets & SVGs
├── components/              # Global reusable UI primitives only
│   ├── ui/                  # Atomic Shadcn UI / Radix primitives (Button, Dialog, Table)
│   └── feedback/            # Toast, Spinner, Skeleton loaders
├── config/                  # Validated environment configurations (via Zod)
├── features/                # Feature-Driven Domain Modules
│   ├── auth/                # Auth forms, hooks, auth API, auth types
│   ├── candidates/          # Candidate list, search, filters, candidate API
│   ├── jobs/                # Job management, job creation modals, jobs API
│   ├── pipeline/            # Pipeline Kanban, stage editor, pipeline API
│   └── organization/        # Workspace switcher, org setup, org API
├── hooks/                   # App-wide utility hooks (useDebounce, useMediaQuery)
├── lib/                     # Third-party client instances (Axios, Firebase, PostHog)
├── routes/                  # URL-driven route definitions & page wrappers
├── store/                   # Zustand stores for global client UI state
├── types/                   # Shared TypeScript interfaces & DTO schemas
└── utils/                   # Pure utility functions
```

### 2. URL-Driven Router (React Router v7 / TanStack Router)
- Replace internal `currentPage` state with true URL routing.
- Map sub-views to explicit nested routes (e.g., `/workspaces/:wsId/jobs/:jobId/pipeline`, `/candidates/:candidateId`).
- Eliminate custom window events (`breadcrumb-navigate`) and global window state mutations in favor of standard URL search params (`useSearchParams`) and route loaders.

### 3. Server State Management with TanStack Query (React Query)
- Replace all manual `useEffect` + `useState` API calls with TanStack Query custom query hooks (`useCandidatesQuery`, `usePipelineQuery`, `useJobDetailsQuery`).
- Gain automatic client-side caching, background refetching, request deduplication, optimistic UI updates, and pagination handling out-of-the-box.

### 4. Global Client State with Zustand
- Replace `AuthContext` and cookie state hacks with a lightweight Zustand store (`useAuthStore`, `useWorkspaceStore`).
- Maintain persistent active workspace selection and authenticated user metadata across sessions seamlessly.

### 5. Unified API Layer & Axios Interceptors
- Consolidate all services into a single Axios client instance.
- Handle token attachment via an asynchronous request interceptor.
- Implement a global response error interceptor to handle HTTP 401 (Unauthorized), 403 (Forbidden), and 500 errors uniformly with user-friendly notifications.

### 6. Atomic UI Design System (Shadcn UI / Radix)
- Extract inline component styles and massive modal dialogs into reusable, accessible UI primitives in `src/components/ui/` using Shadcn UI / Radix UI.
- Enforce strict component size limits (maximum 200 lines per file).

### 7. Enforce Strict Environment & Type Validation
- Implement Zod schema validation for environment variables at runtime (`env.ts`).
- Remove hardcoded credentials from `firebase.ts`.
- Remove technical debt typo fallbacks (`questioion_analysis`) once backend payloads are standardized.