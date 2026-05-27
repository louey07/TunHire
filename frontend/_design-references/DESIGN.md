# TunHire Design System Reference (Project-Wide)

## 1. Overview & Creative North Star: "The Cognitive Architect"
TunHire is not a generic job board. It is a prestige editorial environment fused with AI intelligence. The experience should feel curated, premium, and forward-looking.

Core principles:
- Intentional asymmetry over rigid grids.
- Tonal depth over hard lines.
- Whitespace as structure — large gaps between sections, tight grouping within (see §4).
- High-contrast typography (architectural headlines + dense body text).
- Floating layers and soft overlap for a refined, modern feel.

## 2. Color System
We use a deep, professional foundation with "vibrant intelligence" accents.

### Primary Foundation
- primary: #001e40
- primary_container: #003366

### Innovation Accents
- secondary: #006875
- secondary_fixed_dim: #00daf3

### Growth Tertiary
- tertiary_fixed: #69ff87

### Surface Hierarchy
Treat UI as layered paper:
- surface (base): #f7f9fb
- surface_container_low (sections): #f2f4f6
- surface_container_lowest (cards): #ffffff
- surface_container_highest (popovers): #e0e3e5

### The No-Line Rule
Avoid 1px solid borders for sectioning. Define boundaries via:
- background shifts between surface levels
- tonal transitions, spacing, and layering

### Glass & Gradient Rule
- Use subtle gradients from primary -> primary_container in hero and AI sections.
- Use glassmorphism for floating navigation and overlay panels.

## 3. Typography
Typography is the editorial voice. Pair Manrope (display) with Inter (body).

| Level | Token | Font | Size | Intent |
| --- | --- | --- | --- | --- |
| Display | display-lg | Manrope | 3.5rem | Hero messaging |
| Headline | headline-md | Manrope | 1.75rem | Section titles |
| Title | title-lg | Inter | 1.375rem | Card headings |
| Body | body-md | Inter | 0.875rem | Content text |
| Label | label-md | Inter | 0.75rem | Metadata, tags |

Guidance:
- Use tighter tracking for display/headlines (-0.02em).
- Use uppercase + wider tracking for labels (+0.05em).

## 4. Spacing & Layout — Whitespace as Architecture

Whitespace is the primary layout tool in TunHire. It separates hierarchy, defines rhythm, and replaces dividers. When a screen feels crowded, **increase spacing before adding borders or shrinking type**.

### Philosophy
- Treat empty space as intentional structure, not leftover area.
- Pair **large outer margins** with **tighter inner grouping** so content reads in clear clusters.
- One strong focal block per viewport beats many equal-weight panels.
- Break grids with offset columns (`md:translate-y-6`) or asymmetric splits (`lg:grid-cols-[1.4fr_1fr]`), not with lines.

### Spatial rhythm scale

Use a small set of recurring values. Prefer the next tier up over inventing one-off numbers.

| Tier | Tailwind | Rem | Use |
| --- | --- | --- | --- |
| Micro | `gap-2`, `gap-3` | 0.5–0.75 | Chips, badge rows, inline metadata |
| Component | `p-4`, `p-5`, `p-6`, `gap-4` | 1–1.5 | Card padding, list rows, KPI tiles |
| Section | `gap-6`, `gap-8`, `mt-8`, `mt-10` | 1.5–2.5 | Blocks within a page, header → content |
| Page | `py-16`, `py-24`, `gap-12`, `gap-16` | 3–4+ | Marketing sections, major dashboard zones |
| Editorial | `p-8`, `p-10`, `p-12` | 2–3 | Hero panels, empty states, onboarding |

**Rule of thumb:** related items sit at Component tier; unrelated groups sit at Section tier or above.

### Page shells

Every page should anchor content in a predictable container. Do not let sections touch the viewport edge.

| Context | Container | Vertical padding |
| --- | --- | --- |
| Recruiter / candidate dashboard | `mx-auto max-w-6xl px-6 pb-16 pt-10` | `pt-10` under shell header |
| Marketing / landing | `mx-auto max-w-7xl px-6` | `py-24` per major section |
| Detail / form focus | `mx-auto max-w-4xl px-4 py-10` | Single-column editorial read |
| Chat | `mx-auto max-w-6xl px-6 py-8` | Compact header, then split pane |

Dashboard content sits beside a fixed sidebar (`lg:ml-64`). Keep horizontal padding at `px-6` on all breakpoints — reduce columns on mobile, not page gutters.

### Vertical rhythm (stack spacing)

Consistent top-to-bottom spacing creates calm, premium pacing.

```
Page label + title + subtitle     →  space-y-3  (inside header block)
Header block → first content      →  mt-10
Major sections on a page          →  space-y-8  (parent wrapper)
Section title → description       →  mt-2
Section title → list / body       →  mt-6
List items inside a card          →  space-y-3 or space-y-4
Empty / CTA states                →  p-10, mt-6 before primary action
```

Loading skeletons mirror real layout: `mt-10 space-y-4` with pulsing `surface-card` blocks.

### Horizontal rhythm

| Pattern | Classes | When |
| --- | --- | --- |
| Page header + actions | `flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between` | Title left, CTAs right on large screens |
| KPI grid | `grid gap-4 sm:grid-cols-2 xl:grid-cols-4` | Equal-weight stat tiles |
| Editorial split | `grid gap-8 lg:grid-cols-[1.4fr_1fr]` | Primary queue + secondary panel |
| Chat split | `grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]` | Sidebar list + message pane |
| Button groups | `flex flex-wrap gap-3` | Secondary actions, filters |

Default grid gutter is `gap-8` for two-column layouts; use `gap-4` only when tiles are small and homogeneous (KPIs).

### Card & panel padding

Match padding to content density. All interactive surfaces use `border-radius >= 12px` (`rounded-2xl` / `rounded-3xl` / `.surface-section`).

| Surface | Padding | Example |
| --- | --- | --- |
| KPI / metric tile | `p-5` | Dashboard stat cards |
| Standard section card | `p-6` | Action queue, insights, forms |
| Feature / onboarding block | `p-8` | Company profile, job detail |
| Marketing feature card | `p-8` | Landing IA section |
| Inner list row | `p-4` on `surface-container-low` | Queue items, team members |
| Empty state | `p-10 text-center` | “Publish your first job” |

Use `.surface-section` + `.editorial-shadow` for elevated panels. Separate inner rows with **background shift + padding**, not `border-b`.

### Density modes

Pick one mode per screen region; do not mix editorial and compact in the same visual group.

| Mode | Spacing feel | Use for |
| --- | --- | --- |
| **Editorial** (default) | `space-y-8`, `p-6`+, generous headlines | Dashboard aperçu, landing, onboarding |
| **Operational** | `space-y-3`–`4`, `p-4`–`6` | Lists, chat threads, candidate review |
| **Compact** | `gap-2`, `p-3`, small labels | Nav items, chips, metadata only |

Recruiter dashboard **Aperçu** is the reference editorial layout: KPI row → asymmetric two-column block → full-width recent jobs, each separated by `space-y-8`.

### Whitespace instead of lines

The no-line rule applies to spacing decisions too:

- **Section boundaries:** `mt-10` or `space-y-8` + surface level change (`surface` → `surface-section`).
- **List separation:** `space-y-3`/`4` + `rounded-2xl bg-[var(--surface-container-low)] p-4`.
- **Header bands:** full-bleed tonal band with `py-6` and horizontal padding aligned to page shell — not a 1px rule.
- **Focus / hover:** tonal or shadow shift; never add a divider “to clarify” a already-spaced block.

If two blocks still feel merged after a surface shift, **add 8 (2rem) vertical gap** before adding any border.

### Responsive spacing

- Keep `px-6` page gutters on mobile; stack columns instead of tightening horizontal padding.
- Headlines may scale up at `lg:` (`text-4xl lg:text-5xl`); spacing tiers stay the same.
- Reduce **column count**, not **section gaps**, below `lg`.
- Chat and split layouts collapse to single column with `gap-6` preserved between stacked panes.

### Layout recipes (canonical)

**Dashboard page shell**
```tsx
<div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
  <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
    <div className="space-y-3">{/* label, h1, subtitle */}</div>
    <div className="flex flex-wrap gap-3">{/* actions */}</div>
  </header>
  <div className="mt-10 space-y-8">{/* sections */}</div>
</div>
```

**Section card with list**
```tsx
<section className="surface-section p-6 editorial-shadow">
  <h2 className="font-headline text-xl font-bold text-[var(--primary)]">Titre</h2>
  <p className="mt-2 text-sm text-[var(--on-surface-variant)]">Description</p>
  <ul className="mt-6 space-y-3">
    <li className="rounded-2xl bg-[var(--surface-container-low)] p-4">{/* row */}</li>
  </ul>
</section>
```

**Asymmetric dashboard split**
```tsx
<div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
  <DashboardActionQueue />
  <DashboardTopCandidates />
</div>
```

When implementing new pages (chat, team, candidates), copy these recipes before inventing new spacing values.

## 5. Elevation & Depth
- Depth via tonal layering, not heavy shadows.
- Use soft ambient shadow when needed: 24px blur, 6% opacity, tinted with on_surface.
- Ghost border fallback only for accessibility: outline_variant at 20% opacity.

## 6. Components

### Buttons
- Primary: primary bg, on_primary text, radius 24px.
- Secondary: secondary_container bg, on_secondary_container text.
- Tertiary: text-only, primary color, subtle hover on surface_container_high.

### Inputs & Search
- Fill: surface_container_lowest.
- No visible border; use ghost border on focus.
- AI search: subtle glow using secondary_fixed_dim.

### Cards (Jobs, Candidates)
- No divider lines.
- Default outer padding: `p-6` on `.surface-section`; inner rows at `p-4` on `surface-container-low`.
- Separate content groups with `mt-6` / `space-y-3`–`4`, not borders.
- Stack cards in a page with `space-y-8` or `gap-8` in grids.
- Add AI signature elements: compatibility chips or score gauges.

### AI Compatibility Score (Signature)
- Pill or circle gauge.
- Background: surface_container_high.
- Indicator: gradient secondary -> tertiary_fixed.
- Label text: label-md.

### Chat & Messaging
- Shell: `max-w-6xl`, sidebar + pane split at `lg:grid-cols-[320px_minmax(0,1fr)]`, `gap-6`, page shell `pt-10 pb-16`.
- Recruiter views: tab switcher for **Équipe** (company channel) and **Candidats** (direct); only recruiters can open a new direct thread.
- Candidate view: inbox-only — list existing direct threads, reply in thread; no “start conversation” control.
- Conversation list: `space-y-3` between items; each row `p-4`, rounded `2xl`, tonal background — no stacked border dividers.
- Message thread: operational density — scrollable `space-y-3` bubbles, composer pinned with `p-5` and top border at 12% outline opacity.
- Empty states: centered copy with `p-10`; explain who can initiate (recruiter) vs who can only reply (candidate).

## 7. Motion & Interaction
- Motion should be meaningful: page-load fade, staggered reveals.
- Avoid generic micro-motion on every element.
- Use easing that feels calm and premium (ease-out, 150-250ms).

## 8. Content & Tone
- Voice: professional, confident, and modern.
- Avoid overly casual language.
- Use French copy where required, but keep typography and spacing consistent.

## 9. Accessibility
- Maintain sufficient contrast for text on surfaces.
- Use ghost borders for inputs and focus states.
- Ensure keyboard navigation for dropdowns, modals, and menus.

## 10. Do / Dont

Do:
- Use layered surfaces instead of lines.
- Follow the spacing tiers in §4 — editorial gaps between sections, tighter gaps inside cards.
- Use asymmetric splits (`1.4fr / 1fr`, chat `320px / 1fr`) to create breathing room around primary content.
- Prioritize whitespace and editorial hierarchy.
- Use Tunisian professional imagery when possible.

Dont:
- Use 1px separators for layout.
- Shrink page gutters (`px-6`) on mobile to fit more content — stack instead.
- Mix compact list spacing with editorial section spacing in the same visual group.
- Use generic tech blue outside of primary foundation.
- Use sharp corners or heavy shadows.

---

This document is the canonical design reference for the entire project. All pages and components should follow it unless explicitly justified by a special case.