# TunHire Frontend Improvement Specification

**Document version:** 1.0  
**Date:** 2026-05-26  
**Target codebase:** `frontend/` (Next.js App Router)  
**Design reference:** `Project_front/` (Vite + shadcn patterns)  
**Design system:** `frontend/_design-references/DESIGN.md`  
**API contracts:** `frontend/_design-references/API_ENDPOINTS.md`

---

## 1. Purpose

This document defines frontend improvements to adopt the **layout, information architecture, and UX patterns** from `Project_front` into the production Next.js app, while preserving TunHire’s editorial design tokens (`DESIGN.md`) and existing backend integrations.

It is intended for **designers and developers** as an implementation backlog with clear priorities and technical notes.

---

## 2. Scope

### In scope (this document)

| Module | Route(s) |
|--------|------------|
| Candidate dashboard | `/dashboard/candidate` |
| Candidate applications | `/dashboard/candidate/applications` |
| Job search (candidate + public) | `/jobs`, candidate job discovery |
| Recruiter applications | `/dashboard/recruiter/candidates`, company applications view |
| Recruiter jobs list | `/dashboard/recruiter/jobs` |
| Job creation / edit | `/dashboard/recruiter/jobs/new`, `/dashboard/recruiter/jobs/[id]/edit` |

### Out of scope (future phases)

- Full shadcn migration
- Admin panel
- Analytics pages
- Chat UI overhaul (separate spec)
- Replacing `Project_front` as a second app

---

## 3. Guiding principles

1. **Adapt patterns, not stacks** — Borrow layout and UX from `Project_front`; keep Next.js, existing hooks, and `DESIGN.md` tokens.
2. **Card-first, action-oriented** — Prefer scannable cards and KPI blocks over dense table rows where appropriate.
3. **Filter visibility** — Status counts, pill filters, and active-filter chips should be visible without opening hidden panels.
4. **Preserve working flows** — Do not regress: apply-to-job, ranked candidates, AI scores, CV upload, recruiter messaging.
5. **French copy** — UI strings remain French in the main app; this spec uses English for dev clarity.
6. **Responsive by default** — Mobile: stacked cards + bottom sheets; desktop: multi-column grids.

---

## 4. Priority legend

| Priority | Meaning | Target |
|----------|---------|--------|
| **P0** | Must-have for PFE demo | Sprint 1 |
| **P1** | High value, low–medium effort | Sprint 1–2 |
| **P2** | Polish / consistency | Post-PFE |
| **P3** | Nice-to-have | Backlog |

---

## 5. Reusable components to introduce

These should live under `frontend/components/` (shared) or domain folders (`candidate/`, `recruiter/`).

| Component | Purpose | Reference |
|-----------|---------|-----------|
| `StatCard` | Clickable KPI tile (icon, label, value, optional href) | `Project_front` CandidateDashboard stat bar |
| `ProfileChecklist` | Onboarding tasks with progress bar | `Project_front` ProfileChecklist |
| `ApplicationFunnel` | Horizontal/vertical pipeline counts by status | `Project_front` ApplicationFunnel |
| `StatusFilterPills` | Toggle filters with counts (`ALL`, `SUBMITTED`, …) | Both applications pages |
| `StatusPipelineStrip` | 4-column clickable status summary | CandidateApplicationsPage |
| `ApplicationCard` | Rich application row/card (logo, meta, badge, footer) | `Project_front` application cards |
| `JobCard` | Grid job tile with badges, hover, optional selection | `Project_front` JobBoardPage |
| `JobCardGrid` | Responsive grid wrapper + empty/loading states | JobBoardPage |
| `FilterBar` | Search + expandable filters + active chips + clear | JobBoardPage |
| `JobCardSelectable` | Job card with `selected` ring + `onSelect` | Hybrid job search |
| `RecruiterJobCard` | Job management card with footer actions | CompanyJobsPage |
| `InlineStatusSelect` | Recruiter status dropdown on application row | CompanyApplicationsPage |
| `FormSectionCard` | Grouped form block inside `.surface-section` | JobFormPage Card pattern |
| `EmptyStatePanel` | Dashed border + icon + CTA | Both codebases |
| `PageHeader` | Eyebrow + title + subtitle + actions slot | Extend `CandidatePageHeader` |

### Styling mapping (shadcn → TunHire)

| Project_front token | TunHire equivalent |
|---------------------|-------------------|
| `border-border bg-card rounded-xl` | `.surface-section` + `rounded-2xl` / `rounded-3xl` |
| `text-muted-foreground` | `text-[var(--on-surface-variant)]` |
| `bg-primary text-primary-foreground` | `.btn-primary` / primary surface |
| `ring-1` active filter | tonal bg + `editorial-shadow` or primary tint |
| Status color pills (blue/amber/green/red) | Keep semantic colors; map to `APPLICATION_STATUS_TONES` |

---

## 6. Module specifications

---

### 6.1 Candidate dashboard

**Route:** `/dashboard/candidate`  
**Current file:** `frontend/app/(candidate)/dashboard/candidate/page.tsx`  
**Reference:** `Project_front/src/app/pages/candidate/CandidateDashboard.tsx`

#### Current behavior

- Page is effectively a **profile editor**: `ProfileHero`, `ProfileForm`, `SkillsSection`, `CvUploadSection`.
- No application overview, no onboarding checklist, no pipeline stats.
- Profile score shown in hero only.

#### Desired behavior

- **Dashboard-first** landing: greet user, show application activity, guide profile completion.
- Profile editing moves to `/dashboard/candidate` sub-section or stays accessible via “Complete profile” links (profile page already exists at same route — **split concerns**):
  - **Option A (recommended):** Dashboard at `/dashboard/candidate`, profile at `/dashboard/candidate/profile` (new route).
  - **Option B:** Dashboard as top section + collapsible profile blocks below (single page, longer scroll).

#### Layout (desired)

```
┌─────────────────────────────────────────────────────────────┐
│ Greeting + subtitle (applications count)                    │
├─────────────────────────────────────────────────────────────┤
│ [Applied] [In Review] [Shortlisted] [Skills]  ← StatCard×4  │
├──────────────────────┬──────────────────────────────────────┤
│ ProfileChecklist     │ Recent Applications (card)           │
│ ApplicationFunnel    │   → list of last 6 with status chips │
│ Quick actions        │   → “View all” link                  │
└──────────────────────┴──────────────────────────────────────┘
```

#### Change checklist

| # | Change | Priority |
|---|--------|----------|
| C-DASH-01 | Add greeting header with dynamic time-of-day | P0 |
| C-DASH-02 | Add 4 KPI `StatCard`s linking to applications/profile | P0 |
| C-DASH-03 | Add `ProfileChecklist` (bio, location, 3+ skills, CV) | P0 |
| C-DASH-04 | Add `ApplicationFunnel` when user has applications | P1 |
| C-DASH-05 | Add “Recent applications” panel with job title, company, status | P0 |
| C-DASH-06 | Add “Quick actions” block (Browse jobs, Upload CV, View applications) | P1 |
| C-DASH-07 | Move full profile form/skills/CV to dedicated profile route or tab | P1 |
| C-DASH-08 | Loading skeletons matching grid layout | P1 |
| C-DASH-09 | Empty state when no applications with CTA to `/jobs` | P0 |

#### Data / API

- `GET /candidates/me` — profile checklist fields
- `GET /applications?userId={id}` — counts + recent list
- `GET /jobs/{id}` — batch fetch for job titles (reuse pattern from Project_front)

#### Technical notes

- Extract `useCandidateDashboard()` hook: profile + applications + job map.
- Reuse existing `useCandidateProfile` for checklist fields only.
- Follow `DESIGN.md` spacing: `space-y-8` between sections, `gap-6` in grid.

---

### 6.2 Candidate applications

**Route:** `/dashboard/candidate/applications`  
**Current file:** `frontend/app/(candidate)/dashboard/candidate/applications/page.tsx`  
**Reference:** `Project_front/src/app/pages/candidate/CandidateApplicationsPage.tsx`

#### Current vs desired

| Aspect | Current | Desired |
|--------|---------|---------|
| Layout | Table-style rows (desktop grid columns) | **Card list** with logo, meta, footer |
| Status filtering | Search text only | **Pipeline strip** + **filter pills** with counts |
| Status display | `StatusChip` only | Chip + **icon** + **helper description** |
| Visual hierarchy | Flat divided rows | Elevated cards, hover border/shadow |
| Empty state | Basic `EmptyState` | Dashed panel + icon + CTA |
| Mobile | Stacked grid columns | Full-width cards, filters wrap |

#### Layout (desired)

```
Header: "Mes candidatures" + total count
┌────────┬────────┬────────┬────────┐
│ Sub 3  │ Review │ Short  │ Reject │  ← clickable pipeline strip
└────────┴────────┴────────┴────────┘
[All 12] [Submitted 5] [In Review 4] …     ← filter pills

┌──────────────────────────────────────┐
│ [logo] Job title          [Status ▼] │
│        Company · location            │
│        Applied 2d ago · helper text    │
│ ──────────────────────────────────── │
│        [View job →]                  │
└──────────────────────────────────────┘
```

#### Change checklist

| # | Change | Priority |
|---|--------|----------|
| C-APP-01 | Replace table layout with `ApplicationCard` list | P0 |
| C-APP-02 | Add status pipeline strip (4 counts, toggle filter) | P0 |
| C-APP-03 | Add filter pills: All + each status with count | P0 |
| C-APP-04 | Show company logo placeholder / `BuildingIcon` | P1 |
| C-APP-05 | Add status-specific helper text under meta | P1 |
| C-APP-06 | Add “Shortlisted” highlight banner on card | P2 |
| C-APP-07 | Keep search; combine with status filters | P1 |
| C-APP-08 | Sort by `createdAt` desc | P0 |

#### Technical notes

- Centralize `APPLICATION_STATUS_CONFIG` in `lib/candidate/applications.ts` (label, colors, icon, description).
- Filter state: `useState<ApplicationStatus | "ALL">`.
- Cards use `.surface-section p-4` + inner tonal row backgrounds per `DESIGN.md`.

---

### 6.3 Job search page & filters

**Route:** `/jobs` (candidate layout)  
**Current file:** `frontend/app/(candidate)/jobs/page.tsx`  
**Reference:** `Project_front/src/app/pages/public/JobBoardPage.tsx`

#### Current vs desired

| Aspect | Current | Desired |
|--------|---------|---------|
| Results display | **Vertical list rows** (`JobSearchResultRow`) | **Card grid** (2–3 columns) |
| Selection model | Click row → detail panel (3-column layout) | **Click card to select/check** job; keep detail panel OR drawer |
| Filters | Sidebar `JobSearchFilters` (always visible xl+) | Sidebar **+** collapsible filter bar with work mode / experience pills |
| Active filters | Count badge on mobile button | **Removable chips** showing active filters + result count |
| Search | Keyword + location + submit | Same, plus inline clear (×) |
| Pagination | Bottom of list panel | Bottom of page grid |
| Apply CTA | Detail panel footer | Sticky footer on detail panel + mobile sheet |

#### Key UX requirement (from stakeholder)

> Prefer **blocks of jobs** where the user can **check/select** certain jobs — not a plain list.

**Recommended hybrid layout:**

```
Desktop (xl+):
┌──────────┬────────────────────────────┬─────────────────┐
│ Filters  │ Job card grid (selectable)   │ Job detail pane │
│ (sticky) │ [card][card][card]         │ (selected job)  │
│          │ [card][card][card]         │ Postuler        │
└──────────┴────────────────────────────┴─────────────────┘

Mobile:
Filters (sheet) → Card grid → tap card opens bottom sheet detail
```

#### Card selection states

| State | Visual |
|-------|--------|
| Default | `surface-section`, soft hover shadow |
| Selected | Primary tint border / ring, subtle `primary/8%` background |
| Applied | “Candidature envoyée” badge, disabled apply |

#### Change checklist

| # | Change | Priority |
|---|--------|----------|
| J-SEARCH-01 | Replace list rows with responsive `JobCardGrid` (1/2/3 cols) | P0 |
| J-SEARCH-02 | Card click sets `selectedId` (preserve current logic) | P0 |
| J-SEARCH-03 | Selected card visual state (ring/border) | P0 |
| J-SEARCH-04 | Add collapsible filter panel (work mode, experience) | P1 |
| J-SEARCH-05 | Active filter chips with remove + “Clear all” | P1 |
| J-SEARCH-06 | Show result count near header | P1 |
| J-SEARCH-07 | Job card content: logo, title, company, location, time ago, badges (work mode, contract, salary) | P0 |
| J-SEARCH-08 | Keep sidebar filters on xl; merge with expandable bar on md | P1 |
| J-SEARCH-09 | Mobile: detail as bottom sheet instead of duplicate block | P2 |
| J-SEARCH-10 | Optional: multi-select checkboxes for “compare” (future) | P3 |

#### Technical notes

- New `JobCard.tsx` in `components/candidate/` — props: `job`, `selected`, `applied`, `onSelect`.
- Reuse `applyJobSearchFilters`, `buildFilterOptions` from `lib/candidate/jobSearch.ts`.
- Grid: `grid gap-4 md:grid-cols-2 xl:grid-cols-2` when detail pane open; `xl:grid-cols-3` on public `/jobs` without pane.
- Do **not** remove master-detail — combine grid selection with detail pane (best of both).

---

### 6.4 Recruiter applications page

**Route:** `/dashboard/recruiter/candidates` (and/or dedicated applications route)  
**Current file:** `frontend/app/dashboard/recruiter/candidates/page.tsx`  
**Reference:** `Project_front/src/app/pages/recruiter/CompanyApplicationsPage.tsx`

#### Current vs desired

| Aspect | Current | Desired |
|--------|---------|---------|
| Scope | Ranked candidates **per selected job** | **All company applications** with job filter |
| Layout | `CandidateCard` list with AI score focus | Table-like **rows** with avatar, inline status change |
| Filters | Job `<select>` only | Job select + **status pills** + **search** |
| Stats | None at top | **4 status count tiles** (click to filter) |
| AI | Score on each card | **AI Rankings CTA** when single job selected |
| Actions | Status update on card | Inline `Select` + link to candidate profile |

#### Layout (desired)

```
Header: Applications + total
[Optional: AI Rankings button when job filtered]

┌────────┬────────┬────────┬────────┐
│ Sub 8  │ Review │ Short  │ Reject │  ← status strip
└────────┴────────┴────────┴────────┘

[Job ▼] [Search…] [Clear filters]

┌──────────────────────────────────────────────────────────┐
│ (AB) Candidate name · Job title · 2d ago  [Status ▼] [→] │
└──────────────────────────────────────────────────────────┘
```

#### Change checklist

| # | Change | Priority |
|---|--------|----------|
| R-APP-01 | Fetch `GET /companies/{id}/dashboard` for enriched applications | P0 |
| R-APP-02 | Add status pipeline strip with counts | P0 |
| R-APP-03 | Add job filter dropdown (All jobs + each job title) | P0 |
| R-APP-04 | Add candidate name search | P1 |
| R-APP-05 | Row layout: initials avatar, name, job, time ago | P0 |
| R-APP-06 | Inline status `Select` → `PATCH /applications/{id}/status` | P0 |
| R-APP-07 | Link row to candidate profile / application detail | P0 |
| R-APP-08 | “AI Rankings” button → `/jobs/{id}/ranked` when one job selected | P1 |
| R-APP-09 | AI ranking callout banner when job filter active | P2 |
| R-APP-10 | Keep existing ranked view as separate tab or route | P1 |

#### Technical notes

- Consider **two tabs** on same page: “All applications” | “AI ranking (per job)” to preserve current ranked flow.
- Reuse `DashboardApplicationItem` shape from backend.
- `useCompanyDashboard` hook already exists — extend for this page.

---

### 6.5 Recruiter jobs page

**Route:** `/dashboard/recruiter/jobs`  
**Current file:** `frontend/app/dashboard/recruiter/jobs/page.tsx`  
**Reference:** `Project_front/src/app/pages/recruiter/CompanyJobsPage.tsx`

#### Current vs desired

| Aspect | Current | Desired |
|--------|---------|---------|
| Layout | Single-column **list** of stacked cards | **2-column card grid** |
| Filters | None | Status pills: All / Open / Draft / Closed with counts |
| Job card | Title, meta, action buttons inline | Card header (status dot), title link, meta, applicant count badge |
| Footer actions | Publish / Close / Delete buttons visible | **Footer bar** with primary action + `⋯` dropdown |
| Applicant count | Not shown on card | Badge linking to applications filtered by `jobId` |
| Empty state | Text only | Dashed panel + illustration + CTA |

#### Job card anatomy (desired)

```
┌─────────────────────────────────────┐
│ ● Open          [3 applicants →]    │
│ Senior Java Developer               │
│ 📍 Tunis  ·  🏠 Hybrid              │
├─────────────────────────────────────┤
│ [Publish] or [Close]    [⋯ Edit/Delete/Rank] │
└─────────────────────────────────────┘
```

#### Change checklist

| # | Change | Priority |
|---|--------|----------|
| R-JOB-01 | Switch to `grid grid-cols-1 md:grid-cols-2 gap-4` | P0 |
| R-JOB-02 | Add status filter pills with counts | P0 |
| R-JOB-03 | Add applicant count badge → candidates page with `?jobId=` | P0 |
| R-JOB-04 | Card footer: contextual primary action (Publish/Close/Reopen) | P0 |
| R-JOB-05 | Overflow menu: Edit, Delete, View applications, AI rank | P1 |
| R-JOB-06 | Status badge with colored dot | P1 |
| R-JOB-07 | Work mode icon + label on card | P1 |
| R-JOB-08 | Improved empty state with CTA | P1 |

#### Technical notes

- Merge job list + application counts via dashboard endpoint or parallel fetch.
- Reuse `JOB_STATUS_LABELS`, `JOB_STATUS_TONES` from `lib/recruiter/jobs.ts`.
- Delete remains behind confirm dialog.

---

### 6.6 Job creation & edit page

**Route:** `/dashboard/recruiter/jobs/new`, `/dashboard/recruiter/jobs/[id]/edit`  
**Current files:** `jobs/new/page.tsx`, `components/recruiter/JobForm.tsx`  
**Reference:** `Project_front/src/app/pages/recruiter/JobFormPage.tsx`

#### Current vs desired

| Aspect | Current | Desired |
|--------|---------|---------|
| Container | Form on page with TunHire typography | Form inside **card panel** (`.surface-section`) |
| Fields | Single column, mixed spacing | **Grouped sections**: Basics, Location & mode, Compensation, Description |
| Work mode | Likely select/radio in JobForm | **Select** with clear labels (On-site / Hybrid / Remote) |
| Validation | Basic submit messages | **Inline field errors** (required, min length) |
| Actions | “Publier” + “Brouillon” | Same; sticky footer on mobile |
| Back nav | Text link | Back link with icon above title |
| Helper text | Minimal | Subtitle: “Jobs are created as draft…” |

#### Form sections

1. **Basics** — title, contract type, experience level  
2. **Location & work mode** — location, work mode select  
3. **Compensation** — salary min/max (optional)  
4. **Description** — textarea, min 50 chars  

#### Change checklist

| # | Change | Priority |
|---|--------|----------|
| R-FORM-01 | Wrap form in `.surface-section` card with padding `p-6`–`p-8` | P0 |
| R-FORM-02 | Add section headings (label-uppercase eyebrow style) | P1 |
| R-FORM-03 | Two-column grid for short fields on `md+` (title full width) | P1 |
| R-FORM-04 | Explicit validation messages under fields | P1 |
| R-FORM-05 | Back link + page title + subtitle block | P1 |
| R-FORM-06 | Loading skeleton on edit fetch | P2 |
| R-FORM-07 | Toast on success/error (optional; keep inline msg as fallback) | P2 |

#### Technical notes

- Keep existing `JobForm` + `jobFormValuesToRequest`; refactor presentation only.
- Edit mode: preload via `GET /jobs/{id}`.
- Publish flow unchanged: create → `PATCH status=OPEN`.

---

## 7. Cross-cutting UI/UX enhancements

### 7.1 Spacing & layout (from DESIGN.md)

- Page shell: `max-w-5xl mx-auto px-6 pt-10 pb-16` (dashboard pages)
- Section gaps: `space-y-8` between major blocks
- Card interior: `p-4`–`p-6`; grid gutters: `gap-4`

### 7.2 Status system unification

Create shared config in `lib/status/`:

```typescript
// lib/status/applications.ts
export const APPLICATION_STATUS_UI = {
  SUBMITTED: { label: "Soumise", ... },
  IN_REVIEW: { label: "En examen", ... },
  ...
};
```

Used by candidate applications, recruiter applications, dashboard funnel.

### 7.3 Loading & empty states

- [ ] Skeleton components match final layout (grid count, card heights)
- [ ] Empty states always include **one primary CTA**
- [ ] Error states use existing `ErrorBlock` with retry

### 7.4 Responsiveness

| Breakpoint | Behavior |
|------------|----------|
| `< md` | Single column grids; filters in sheet/drawer |
| `md` | 2-column job/application grids |
| `xl` | Job search 3-column with detail pane; sidebar filters sticky |

### 7.5 Accessibility

- [ ] Filter pills: `aria-pressed` on toggle buttons
- [ ] Selectable job cards: `aria-selected`
- [ ] Status selects: accessible labels
- [ ] Focus rings on keyboard navigation (ghost border per DESIGN.md)

---

## 8. Implementation phases

### Phase 1 — PFE demo critical (P0)

1. Candidate dashboard rework (or split profile route)
2. Candidate applications cards + filters
3. Job search card grid + selection state
4. Recruiter jobs grid + status filters
5. Recruiter applications row view + filters

**Estimated effort:** 3–5 dev days (without shadcn migration)

### Phase 2 — Polish (P1)

1. Job creation form card layout
2. Filter chips on job search
3. Profile checklist on dashboard
4. Applicant count badges on job cards
5. AI ranking CTA on applications page

### Phase 3 — Backlog (P2+)

1. Mobile bottom sheets
2. Toast notifications
3. Multi-job compare selection
4. Shared shadcn-style primitives adapted to DESIGN.md

---

## 9. File change map (developer reference)

| Area | Files to create/modify |
|------|------------------------|
| Candidate dashboard | `app/(candidate)/dashboard/candidate/page.tsx`, new `components/candidate/dashboard/*`, `lib/hooks/useCandidateDashboard.ts` |
| Candidate applications | `app/(candidate)/dashboard/candidate/applications/page.tsx`, `components/candidate/ApplicationCard.tsx` |
| Job search | `app/(candidate)/jobs/page.tsx`, `components/candidate/JobCard.tsx`, `JobCardGrid.tsx` |
| Recruiter applications | `app/dashboard/recruiter/candidates/page.tsx` or new applications route, `components/recruiter/ApplicationRow.tsx` |
| Recruiter jobs | `app/dashboard/recruiter/jobs/page.tsx`, `components/recruiter/RecruiterJobCard.tsx` |
| Job form | `components/recruiter/JobForm.tsx`, `app/dashboard/recruiter/jobs/new/page.tsx` |
| Shared | `lib/status/applications.ts`, `lib/status/jobs.ts` |

---

## 10. Acceptance criteria (summary)

### Candidate

- [x] Dashboard shows KPI stats, profile progress, and recent applications
- [x] Applications page filters by status with visible counts
- [x] Job search shows **cards**, not list rows; selected job is visually obvious
- [x] User can still apply from job search without regression

### Recruiter

- [x] Jobs page uses **2-column cards** with status filters and applicant counts
- [x] Applications page lists all company applications with job + status filters
- [x] Job create/edit form is grouped in a clear card layout
- [x] All existing API integrations continue to work

---

## 11. Reference screenshots / source files

| Screen | Project_front reference |
|--------|-------------------------|
| Candidate dashboard | `src/app/pages/candidate/CandidateDashboard.tsx` |
| Candidate applications | `src/app/pages/candidate/CandidateApplicationsPage.tsx` |
| Job board | `src/app/pages/public/JobBoardPage.tsx` |
| Recruiter applications | `src/app/pages/recruiter/CompanyApplicationsPage.tsx` |
| Recruiter jobs | `src/app/pages/recruiter/CompanyJobsPage.tsx` |
| Job form | `src/app/pages/recruiter/JobFormPage.tsx` |

| Screen | Current Next.js implementation |
|--------|-------------------------------|
| Candidate dashboard | `frontend/app/(candidate)/dashboard/candidate/page.tsx` |
| Candidate applications | `frontend/app/(candidate)/dashboard/candidate/applications/page.tsx` |
| Job search | `frontend/app/(candidate)/jobs/page.tsx` |
| Recruiter candidates | `frontend/app/dashboard/recruiter/candidates/page.tsx` |
| Recruiter jobs | `frontend/app/dashboard/recruiter/jobs/page.tsx` |
| Job create | `frontend/app/dashboard/recruiter/jobs/new/page.tsx` |

---

## 12. Document maintenance

- Update this spec when a module is completed (check off items).
- Log deviations in PR descriptions.
- Do not migrate to shadcn wholesale; extract **patterns** only unless explicitly approved.

---

*End of specification.*
