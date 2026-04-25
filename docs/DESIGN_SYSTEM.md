# CLOCKED Design System

## Purpose

CLOCKED is a public record system for time-bounded crypto promises. The interface should feel calm, exact, neutral, and review-gated. It should present evidence and deadlines with restraint, not spectacle.

This document defines the visual system used across public and admin surfaces so future work extends one coherent language instead of introducing page-by-page styling.

## Audit Notes

### What felt visually weak before the redesign

- Public pages read as long text stacks instead of deliberate product surfaces.
- Above-the-fold hierarchy was too flat, especially on the homepage.
- Cards, lists, and sections lacked a strong shared structure.
- Admin pages looked functional but not reviewer-ready.
- Status and metadata presentation felt serviceable, not polished.
- The product looked safe and factual, but not premium.

### What felt text-heavy

- Homepage explanation was doing too much work in body copy.
- Claim, project, and actor pages exposed metadata as long running blocks instead of scan-friendly modules.
- Admin review items surfaced raw payloads too early and too prominently.
- Helper copy often repeated the same idea in too many words.

### What felt inconsistent

- Header, hero, card, and section treatments did not feel part of one system.
- Some surfaces felt plain while others used stronger framing.
- Buttons, pills, and filters needed tighter visual alignment.
- Public and admin pages did not share enough component DNA.

### Where hierarchy was missing

- Homepage hero, proof strip, and examples section needed clearer pacing.
- Claim pages needed a stronger receipt header and clearer evidence/status separation.
- Project and actor pages needed summary stats before lists.
- Admin review needed queue grouping, stronger action framing, and calmer safety messaging.

### Reusable components that needed to exist

- A shared page shell with a refined top navigation and footer.
- A common section wrapper with eyebrow, title, body, and optional actions.
- A stat card for dashboard-like counts without template-dashboard styling.
- A consistent status chip.
- A calmer claim card.
- A shared banner/callout style.
- A better empty state treatment.
- A technical block for JSON, MCP, and HUD surfaces.
- A stronger review card for admin moderation work.

## Brand Feeling

### Core adjectives

- Calm
- Precise
- Neutral
- Premium
- Public-record-like
- Review-gated
- Credible
- Technical but human

### Product posture

- CLOCKED is not a hype surface.
- CLOCKED is not a scorecard.
- CLOCKED is not a marketing site in disguise.
- CLOCKED should feel like a considered record system for public claims.
- Review and evidence should feel built into the product, not bolted on afterward.

## Color System

Use semantic tokens only. Do not introduce one-off page colors when an existing token can express the same role.

### Core tokens

- `--bg`: `#f4f6fb`
- `--bg-soft`: `rgba(247, 249, 252, 0.82)`
- `--bg-elevated`: `rgba(255, 255, 255, 0.9)`
- `--panel`: `rgba(255, 255, 255, 0.84)`
- `--panel-strong`: `rgba(255, 255, 255, 0.96)`
- `--panel-accent`: `rgba(72, 104, 255, 0.07)`
- `--ink`: `#162033`
- `--ink-soft`: `#2b3850`
- `--muted`: `#627087`
- `--muted-strong`: `#4d5b73`
- `--brand`: `#4263eb`
- `--brand-strong`: `#2747d7`
- `--brand-soft`: `rgba(66, 99, 235, 0.1)`
- `--border`: `rgba(22, 32, 51, 0.1)`
- `--border-strong`: `rgba(22, 32, 51, 0.15)`

### Semantic mapping

- Background base: `--bg`
- Background subtle variation: `--bg-soft`
- Surface elevated: `--panel`
- Surface raised: `--panel-strong`
- Border subtle: `--border`
- Border strong: `--border-strong`
- Text primary: `--ink`
- Text secondary: `--ink-soft`
- Text tertiary: `--muted`
- Text inverse: white on brand buttons only
- Accent primary: `--brand`
- Accent soft: `--brand-soft`
- Focus ring: derived from brand at 10 to 50 percent opacity

### Status tokens

- Open: `--status-open` / `--status-open-ink`
- Delivered: `--status-delivered` / `--status-delivered-ink`
- Slipped: `--status-slipped` / `--status-slipped-ink`
- Reframed: `--status-reframed` / `--status-reframed-ink`
- Superseded: `--status-superseded` / `--status-superseded-ink`
- Ambiguous: `--status-ambiguous` / `--status-ambiguous-ink`

### Additional semantic guidance

- `Not clockable` should use muted neutral treatments and informational copy, not alert red styling.
- `Needs review` should use a restrained warning or neutral accent treatment in admin-only surfaces.
- Status colors should never be neon.
- Color must never be the only signal for meaning. Pair status color with text labels.

### Usage rules

- The public experience stays light-first.
- Large surfaces should use tonal variation and gradients sparingly.
- Borders are soft separators, not heavy rails.
- Elevated moments should feel quiet and high-end, not glassy or flashy.
- Brand color is used to guide attention, not flood the page.

## Typography System

The system uses a premium sans for the product UI and a restrained editorial serif for select display moments.

### Font roles

- Primary UI font: `Manrope`
- Editorial display accent: `Newsreader`
- Technical text: system monospace stack

The serif is reserved for short, high-importance display text only. Everything else should remain in the sans UI system.

### Type scale and usage

- Hero display:
  `clamp(2.7rem, 5vw, 4.85rem)`, weight visually bold, line-height `0.94`, tracking `-0.06em`, max width `11ch`
- Page title:
  `clamp(2.1rem, 4vw, 3.4rem)`, line-height `1`, tracking `-0.05em`
- Section title:
  `clamp(1.45rem, 2vw, 2.15rem)`, line-height `1.1`, tracking `-0.04em`
- Card title:
  `1.22rem`, line-height `1.3`, tracking `-0.03em`
- Claim card title:
  `1.14rem`, line-height `1.42`, tracking `-0.025em`
- Body:
  `1.05rem` default, line-height `1.65` to `1.7`
- Hero lead:
  `1.12rem`, line-height `1.72`
- Metadata and labels:
  `0.78rem` to `0.85rem`, uppercase where used, higher tracking
- Monospace:
  `0.9rem`, line-height `1.6`

### Typography principles

- Headlines should be short.
- Supporting copy should rarely exceed two sentences before a structural break.
- Metadata should stay quiet and never compete with headings.
- Copy blocks should typically stay below `42rem`.
- Section intros should typically stay below `44rem`.
- Display text earns attention through spacing and restraint, not loud styling.

## Spacing System

Use a disciplined scale. Current implementation aligns to these steps:

- `4`
- `8`
- `12`
- `16`
- `24`
- `32`
- `48`
- `64`
- `96`

### Layout guidance

- Page max width: `1180px`
- Default page side padding: `1rem`
- Mobile side padding: `1.1rem` viewport subtraction
- Section gap inside pages: around `2.2rem`
- Card grid gap: `1rem`
- Stat grid gap: `1rem`
- Card padding: `1rem` to `1.2rem`
- Hero padding: `1.4rem` to `2rem`
- Section head gap: `1rem`

### Rhythm rules

- Prefer whitespace over dividers.
- Use consistent internal card spacing rather than stacking ad hoc margins.
- Group related metadata into modules before adding more text.
- On mobile, preserve vertical rhythm before preserving column density.

## Radius and Shadow System

The interface should feel refined, not puffy.

### Radius tokens

- Small radius: `--radius-sm = 14px`
- Medium radius: `--radius-md = 20px`
- Large radius: `--radius-lg = 28px`
- Interactive pills and segmented controls: fully rounded

### Shadow tokens

- Subtle surface shadow: `--shadow-sm = 0 10px 30px rgba(27, 39, 60, 0.06)`
- Raised surface shadow: `--shadow-md = 0 20px 60px rgba(27, 39, 60, 0.1)`

### Elevation rules

- Most cards use `--shadow-sm`.
- Hero and high-importance surfaces may use `--shadow-md`.
- Hover elevation should be subtle, usually a small translate and shadow increase.
- Do not stack large shadow plus heavy border plus strong gradient on the same component.

## Motion System

Motion should improve clarity and quality without slowing the product down.

### Duration tokens

- Fast: `150ms`
- Base: `220ms`
- Microinteraction target: `120ms` to `180ms`
- Component enter and exit target: `180ms` to `260ms`
- Section reveal target: `250ms` to `450ms`

### Easing

- Use simple ease curves for most UI transitions.
- Avoid bouncy spring motion for core product interactions.

### Current implemented motion

- `fade-up` reveal on key sections
- delayed `fade-up` for secondary surfaces
- hover lift on interactive cards
- hover and press polish on buttons
- hover state transitions on nav and segmented controls

### When motion is allowed

- Hero reveal
- Section reveal
- Card hover refinement
- Filter and segmented control transitions
- Button press and submit feedback
- Small list or stack reveals when they improve perceived polish

### When motion is not allowed

- Motion that delays access to important information
- Decorative animation without a functional role
- Long parallax or theatrical page choreography
- Repeated motion on dense admin workflows

### Reduced-motion behavior

- Disable animations and transitions with `prefers-reduced-motion`
- Disable smooth scroll under reduced motion
- Keep state changes legible without depending on movement

## Component Philosophy

### Page shell

- Provides the shared frame, sticky header, footer, and max-width rhythm.
- Should make every page feel part of the same product immediately.

### Nav

- Light, quiet, and sticky.
- Uses pill-like hover states rather than heavy active chrome.

### Hero block

- Sets the tone and the page purpose quickly.
- Should contain a short headline, a short body, and only the next most useful actions.

### CTA buttons

- Primary action uses brand fill.
- Secondary action uses subtle border and neutral fill.
- Ghost action uses soft accent tint.
- CTA copy should stay short and literal.

### Section headers

- Eyebrow for context only when helpful.
- One short title.
- Optional short body.
- Optional action area aligned to the same system.

### Status chips

- One shared component for all public claim statuses.
- Always pair color with uppercase label text.
- Should feel crisp and quiet, not gamified.

### Cards

- Soft panel, low-contrast border, premium spacing.
- Use cards to create structure, not to create noise.

### Stat cards

- Used for calm quantitative summaries.
- Should read like a factual snapshot, not KPI hype.

### Timelines

- Use a thin rule, small markers, and short event copy.
- Events should scan vertically with minimal visual clutter.

### Filters and tabs

- Use segmented controls with soft backgrounds and rounded pills.
- State change should be visible but understated.

### Tables and lists

- Prefer cards and modular lists when the dataset is small or mixed-format.
- Use metadata groupings instead of long inline text runs.

### Banners and callouts

- Used for safety state, dry-run state, and important clarifications.
- They should feel calm and explicit, not alarming by default.

### Form controls

- Large enough to feel deliberate.
- Quiet borders, strong focus ring, readable helper text.
- Forms should read as professional curation tools, not internal scaffolding.

### Toasts and inline confirmation

- Keep short, factual, and calm.
- Confirmation copy should say what happened without hype.

### Empty states

- Explain what is absent and what would cause content to appear.
- Avoid jokey or apologetic language.

### Loading states

- Should preserve layout shape where practical.
- Motion, if used, should be soft and unobtrusive.

## Accessibility Rules

- Contrast must stay readable on all statuses and banners.
- Focus states must be visible on keyboard navigation.
- Semantic headings should remain intact across public and admin pages.
- Meaning must not depend on color alone.
- Motion must respect reduced-motion preferences.
- Dense admin controls must remain usable on smaller screens.

## Implementation Notes

### Current implementation anchors

- Global tokens and motion live in `apps/web/app/globals.css`
- Shared shell lives in `apps/web/components/PageShell.tsx`
- Shared UI primitives live in `packages/ui/src`

### Extension rules

- Add new semantic tokens before adding new one-off colors.
- Reuse `surface-card`, `section-shell`, `status-badge`, and `stat-card` patterns before inventing new panel styles.
- Keep admin and public surfaces in the same family even when their density differs.
- Default to calmer copy and more whitespace before adding more UI chrome.
