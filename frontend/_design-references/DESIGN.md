# TunHire Design System Reference (Project-Wide)

## 1. Overview & Creative North Star: "The Cognitive Architect"
TunHire is not a generic job board. It is a prestige editorial environment fused with AI intelligence. The experience should feel curated, premium, and forward-looking.

Core principles:
- Intentional asymmetry over rigid grids.
- Tonal depth over hard lines.
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

## 4. Spacing & Layout
- Use whitespace as structure. If crowded, increase spacing to 12 (3rem) or 16 (4rem).
- Break grids intentionally with overlap or offset blocks.
- Avoid harsh edges; use radius >= 12px for interactive items.

Suggested spacing scale:
- 2 (0.5rem), 3 (0.75rem), 4 (1rem)
- 6 (1.5rem), 8 (2rem), 12 (3rem), 16 (4rem)

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
- Use spacing and tonal shifts to separate content.
- Add AI signature elements: compatibility chips or score gauges.

### AI Compatibility Score (Signature)
- Pill or circle gauge.
- Background: surface_container_high.
- Indicator: gradient secondary -> tertiary_fixed.
- Label text: label-md.

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
- Prioritize whitespace and editorial hierarchy.
- Use Tunisian professional imagery when possible.

Dont:
- Use 1px separators for layout.
- Use generic tech blue outside of primary foundation.
- Use sharp corners or heavy shadows.

---

This document is the canonical design reference for the entire project. All pages and components should follow it unless explicitly justified by a special case.