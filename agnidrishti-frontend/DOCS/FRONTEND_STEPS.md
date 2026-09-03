# FRONTEND_STEPS.md — AgniDrishti Frontend Build Roadmap

Step-by-step implementation plan derived from `PRD.md`, `TECHSTACK.md`, and `ARCHITECTURE.md`. Each step lists Goal, Files, Implementation, Dependency, Verification, Expected Result.

---

### Step 1 — Project Scaffolding

**Goal:** Create the Vite + React project with the folder structure from `ARCHITECTURE.md` §2.

**Files:** Full `src/` tree (empty folders with `.gitkeep`).

**Implementation:** `npm create vite@latest agnidrishti-frontend -- --template react-ts`. Create all subfolders under `src/` as listed in the architecture doc.

**Dependency:** None.

**Verification:** `npm run dev` shows the default Vite page with no errors.

**Expected Result:** Empty, correctly structured project.

---

### Step 2 — Install Dependencies

**Goal:** Install the full package list from `TECHSTACK.md`.

**Files:** `package.json`

**Implementation:** Install: `react-router-dom`, `leaflet`, `react-leaflet`, `leaflet.markercluster`, `recharts`, `lucide-react`, `zustand`, `@tanstack/react-query`, `framer-motion`, `tailwindcss`, `postcss`, `autoprefixer`.

**Dependency:** Step 1.

**Verification:** `npm install` completes cleanly, no peer-dependency errors.

**Expected Result:** All packages importable.

---

### Step 3 — Tailwind + Design Tokens Setup

**Goal:** Configure Tailwind and implement the light/dark theme CSS variables from `TECHSTACK.md`.

**Files:** `tailwind.config.js`, `src/styles/theme.css`

**Implementation:** Define CSS custom properties for both themes (`--color-bg`, `--color-surface`, `--color-border`, `--color-accent`, `--color-text-primary`, `--color-text-secondary`, `--color-success`, `--color-warning`, `--color-danger`, `--color-info`) under `:root` and `[data-theme="dark"]`. Map Tailwind theme extension to reference these variables. Add Inter + JetBrains Mono via font-face or Google Fonts import.

**Dependency:** Step 2.

**Verification:** Toggling `data-theme` attribute on `<html>` manually in devtools visibly switches all token-based colors.

**Expected Result:** Working dual-theme design system.

---

### Step 4 — App Shell & Routing

**Goal:** Build `AppShell.tsx`, `router.tsx`, and stub pages for all 10 routes from `ARCHITECTURE.md` §3.

**Files:** `src/app/*`, `src/pages/*` (stub content only)

**Implementation:** Set up React Router with all routes. `AppShell` wraps `<Outlet />` with `TopNav`, `Sidebar`, and a mount point for `SourceSnapshotPanel` (empty for now). Each page is a placeholder `<h1>{PageName}</h1>` initially.

**Dependency:** Step 3.

**Verification:** Navigating sidebar links changes the URL and visible page content.

**Expected Result:** Full page skeleton with working navigation.

---

### Step 5 — Zustand Stores

**Goal:** Implement `sourceStore`, `filterStore`, `themeStore`.

**Files:** `src/stores/*`

**Implementation:** `sourceStore`: `selectedSourceId`, `isPanelOpen`, setters. `filterStore`: filter fields matching PRD §4.4, setters, reset. `themeStore`: `theme`, `toggleTheme`, persisted to `localStorage`.

**Dependency:** Step 4.

**Verification:** Theme toggle button (temporary, in TopNav) switches theme and persists on page reload.

**Expected Result:** Working global client state.

---

### Step 6 — API Client & Placeholder Types

**Goal:** Set up `apiClient.ts` and the placeholder types from `ARCHITECTURE.md` §7.

**Files:** `src/lib/apiClient.ts`, `src/types/source.ts`

**Implementation:** `apiClient.ts` wraps `fetch` with base URL from `VITE_API_BASE_URL`, JSON parsing, error handling. Types match §7 exactly. Add a `.env.local.example` documenting `VITE_API_BASE_URL` and `VITE_MAP_TILE_URL`.

**Dependency:** Step 2.

**Verification:** A test call to a mock/dummy JSON file resolves through `apiClient` without runtime errors.

**Expected Result:** Typed API layer ready to be wired to mock or real data.

---

### Step 7 — Mock Data Layer

**Goal:** Create dummy JSON matching the placeholder types, so all components can be built before the backend exists.

**Files:** `src/lib/mockData/*.json`

**Implementation:** Generate representative dummy data: ~30–50 sources spread across the AOI bounding box (21°N–27.3°N, 85.5°E–89.7°E), a few alerts, one detailed source history/fingerprint/anomaly set. Service functions (Step 8) read from these files when `VITE_API_BASE_URL` is unset.

**Dependency:** Step 6.

**Verification:** Mock data validates against TypeScript interfaces with no type errors.

**Expected Result:** Realistic data available for UI development without waiting on backend.

---

### Step 8 — React Query Services

**Goal:** Implement all hooks in `services/*.ts` from `ARCHITECTURE.md` §5.

**Files:** `src/services/*`

**Implementation:** `useSources`, `useSourceDetail`, `useSourceHistory`, `useSourceFingerprint`, `useSourceAnomaly`, `useNearbyFacilities`, `useAlerts` (with `refetchInterval` for polling), `useKPISummary`. Each falls back to mock data (Step 7) if `VITE_API_BASE_URL` is unset.

**Dependency:** Step 7.

**Verification:** React Query devtools show successful queries with mock data populated.

**Expected Result:** Full data-fetching layer, backend-agnostic.

---

### Step 9 — KPI Cards

**Goal:** Build `KPICard.tsx` and wire to `useKPISummary`.

**Files:** `src/components/kpi/KPICard.tsx`

**Implementation:** Magic UI card base; props `label, value, deltaPct, icon`. Render 6 cards on `DashboardPage`.

**Dependency:** Step 8.

**Verification:** Dashboard shows 6 populated KPI cards with correct mock values.

**Expected Result:** P0 feature complete (PRD §4.2).

---

### Step 10 — Interactive Map

**Goal:** Build `ThermalMap.tsx` with clustered, color/shape-coded markers.

**Files:** `src/components/map/ThermalMap.tsx`, `MapLegend.tsx`, `mapColors.ts`

**Implementation:** react-leaflet map with `leaflet.markercluster`. Markers colored per `mapColors.ts` (fixed category constants from `TECHSTACK.md`), shaped per category for color-blind accessibility. Legend component lists all 6 categories. Zoom/pan default controls, satellite/map tile toggle.

**Dependency:** Step 8.

**Verification:** Map renders all mock sources, clusters at low zoom, un-clusters on zoom-in, legend matches marker colors.

**Expected Result:** P0 feature complete (PRD §4.3).

---

### Step 11 — Source Snapshot Panel

**Goal:** Build the slide-in detail panel (confirmed behavior).

**Files:** `src/components/source/SourceSnapshotPanel.tsx`, `DataSourceBadge.tsx`

**Implementation:** Framer Motion slide-in from right, mounted in `AppShell`. Triggered by `sourceStore.selectedSourceId`. Shows all fields from PRD §4.5. Includes `DataSourceBadge` (FIRMS/VNF disclosure, fixed requirement per `TECHSTACK.md`).

**Dependency:** Steps 5, 8, 10.

**Verification:** Clicking any map marker opens the panel with correct mock data; closing returns focus to map.

**Expected Result:** P0 feature complete (PRD §4.5).

---

### Step 12 — Filters Panel

**Goal:** Build `FilterPanel.tsx`, wired to `filterStore`.

**Files:** `src/components/filters/FilterPanel.tsx`

**Implementation:** Origin UI form components (select/dropdown/date-range/slider for confidence). Apply button triggers `useSources` refetch with filter params; Reset clears `filterStore`.

**Dependency:** Steps 5, 8.

**Verification:** Applying a filter visibly reduces markers shown on the map (against mock data).

**Expected Result:** P0 feature complete (PRD §4.4).

---

### Step 13 — Charts (Activity, Fingerprint, Anomaly)

**Goal:** Build the three Recharts-based components.

**Files:** `src/components/charts/*`

**Implementation:** `ActivityTimelineChart` (bar + line combo), `ThermalFingerprintChart` (histogram + best-match label), `AnomalyDetectionChart` (dual-line + severity badge). All render inside `SourceSnapshotPanel` or a dedicated detail view.

**Dependency:** Steps 8, 11.

**Verification:** Selecting a source populates all three charts with its mock history/fingerprint/anomaly data.

**Expected Result:** P0 feature complete (PRD §4.6, 4.7, 4.8).

---

### Step 14 — Nearby Facilities & Satellite Context

**Goal:** Build the remaining P1 components.

**Files:** `src/components/tables/NearbyFacilitiesTable.tsx`, `src/components/satellite/SatelliteContextViewer.tsx`

**Implementation:** Origin UI table for facilities. Satellite viewer shows a static mock image with a thermal-overlay toggle (real Sentinel-2/Prithvi-EO integration is backend/data-dependent, `TBD`).

**Dependency:** Step 11.

**Verification:** Both render correctly inside the Source Snapshot panel or Investigation page with mock data.

**Expected Result:** P1 features complete (PRD §4.9, 4.10).

---

### Step 15 — Alerts Center

**Goal:** Build `AlertsList.tsx` and wire to `useAlerts` polling.

**Files:** `src/components/alerts/AlertsList.tsx`, `src/pages/AlertsPage.tsx`

**Implementation:** Origin UI list/badge components. Poll every 30s via React Query `refetchInterval`. Each alert has an "Investigate" button that sets `sourceStore.selectedSourceId` and opens the panel.

**Dependency:** Steps 5, 8, 11.

**Verification:** Alerts list populates from mock data; clicking "Investigate" opens the correct source's snapshot panel.

**Expected Result:** P1 feature complete (PRD §4.11).

---

### Step 16 — Regional Analytics, Reports, System Status (P2, can be static)

**Goal:** Build simplified/static versions of the three lowest-priority sections.

**Files:** `src/pages/ReportsPage.tsx`, regional analytics components, `src/pages/SystemStatusPage.tsx`

**Implementation:** Static/mock UI matching PRD §4.12–4.14 layouts; export buttons show a "Coming soon" or trigger a mock download; System Status shows hardcoded placeholder health values clearly labeled as illustrative.

**Dependency:** Step 8.

**Verification:** Pages render without errors; clearly does not claim live backend connectivity.

**Expected Result:** P2 features present for demo completeness, not fully functional.

---

### Step 17 — Historical Activity Timeline (Kibo UI)

**Goal:** Build `SourceHistoryTimeline.tsx` for Source Investigation.

**Files:** `src/components/timeline/SourceHistoryTimeline.tsx`

**Implementation:** Kibo UI timeline component showing first detected → status changes → last detected, per PRD §4.6/§4.9 history requirements.

**Dependency:** Step 8.

**Verification:** Renders correctly on `InvestigationPage` with mock history data.

**Expected Result:** Rounds out Source Investigation page.

---

### Step 18 — Polish Pass

**Goal:** Apply the UX/UI polish items already agreed on.

**Files:** Various (no new files)

**Implementation:** Loading skeletons for map/charts, empty-state messaging with Reset Filters, hover tooltips on map markers, consistent card elevation/border (no more neon-per-card borders), tabular-nums/mono font applied to all numeric displays, one Framer Motion fade-in on panel open, at most one React Bits decorative effect.

**Dependency:** Steps 9–17.

**Verification:** Manual visual QA against the polish checklist from earlier review.

**Expected Result:** Demo-ready UI.

---

### Step 19 — Backend Integration (when available)

**Goal:** Replace mock data with real Backend API calls.

**Files:** `src/services/*`, `.env.local`

**Implementation:** Set `VITE_API_BASE_URL` to the real backend. Reconcile placeholder types in `types/source.ts` against the actual OpenAPI schema; adjust field names/shapes as needed. Remove mock-data fallback logic once confidence in the real API is established.

**Dependency:** Backend API must exist (out of scope of this document).

**Verification:** Dashboard shows real data end-to-end; no console errors; all P0/P1 features function against live data.

**Expected Result:** Fully integrated, demo-ready AgniDrishti dashboard.
