---
version: "alpha"
name: "CLOCKED Dark Receipt System"
description: "A crypto-native public receipts interface: dark graphite base, violet-blue receipt glow, factual copy, review-gated trust posture."
colors:
  primary: "#F7F7FF"
  secondary: "#A7ADBE"
  tertiary: "#6F42FF"
  neutral: "#05060B"
  background: "#05060B"
  background-subtle: "#090B13"
  surface: "#0D101B"
  surface-raised: "#111626"
  border-subtle: "#24293A"
  border-strong: "#343B55"
  accent: "#8B5CFF"
  accent-strong: "#B58CFF"
  accent-cyan: "#46D9FF"
  success: "#48D68A"
  warning: "#F4B64A"
  danger: "#FF5C6C"
  focus: "#B58CFF"
typography:
  hero-display:
    fontFamily: Manrope
    fontSize: 4.8rem
    fontWeight: 850
    lineHeight: 0.98
    letterSpacing: "-0.055em"
  page-title:
    fontFamily: Manrope
    fontSize: 3.25rem
    fontWeight: 820
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  section-title:
    fontFamily: Manrope
    fontSize: 2rem
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  body:
    fontFamily: Manrope
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.65
  label-caps:
    fontFamily: Manrope
    fontSize: 0.74rem
    fontWeight: 850
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  sm: 8px
  md: 12px
  lg: 18px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 14px 20px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 14px 20px
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 20px
  status-open:
    backgroundColor: "#111C3A"
    textColor: "#7AA2FF"
  status-delivered:
    backgroundColor: "#0F2A20"
    textColor: "{colors.success}"
  status-slipped:
    backgroundColor: "#351419"
    textColor: "{colors.danger}"
---

## Overview

CLOCKED should feel like a live crypto-market record system, not a generic SaaS dashboard. The primary visual object is the receipt: public, review-gated, source-linked, and deadline-aware. The interface uses a cinematic dark base, violet-blue receipt glow, dense but legible record surfaces, and restrained motion.

The UI can have crypto-native energy, but the product copy stays factual. No token utility, wallet CTA, leaderboard, score, shaming language, or fabricated social proof is part of the system.

## Colors

The palette is near-black graphite with one dominant violet-blue accent. Cyan, green, amber, and red are reserved for status/data cues only.

- **Background:** near-black with subtle radial glow and grid depth.
- **Surface:** graphite panels with 1px borders and inner highlights.
- **Accent:** violet-blue for primary CTAs, active states, and receipt glow.
- **Semantic colors:** open blue, delivered green, slipped red, ambiguous amber, reframed neutral-violet.

## Typography

Typography carries hierarchy. Headlines are large, tight, and confident. Body copy is short. Labels are uppercase and technical. Metadata stays quiet.

Use `Manrope` as the main family. Do not introduce novelty fonts. Use monospace only for IDs, API examples, hashes, and JSON-like technical details.

## Layout & Spacing

The homepage above the fold has one focal point: the hero copy and glowing receipt visual. Supporting panels must not compete with it.

Use fewer containers, but make each surface feel intentional. Prefer strong rows, table-like records, and compact metric strips over many disconnected cards.

## Elevation & Depth

Depth comes from glow, dark layers, and subtle border contrast. Shadows should be soft and dark. Avoid heavy glassmorphism and avoid light template panels.

## Shapes

Corners are controlled and technical: 8px for small elements, 12px for controls, 18px for large panels. Pills are allowed for nav and compact filters only.

## Components

- **Page shell:** sticky dark pill nav, graphite footer, no fake wallet/search.
- **Hero receipt:** CSS-built glowing object with short receipt rows.
- **Record panels:** dense, bordered, table-like, easy to scan.
- **Status badges:** factual and semantic, never accusatory.
- **Admin surfaces:** dark operations console, safety banner visible, no external-posting ambiguity.
- **Motion:** 120-180ms microinteractions, 250-450ms section entry, subtle receipt float/glow only. Respect reduced motion.

## Do's and Don'ts

- Do make the web app feel like a premium demo of public crypto receipts.
- Do keep copy neutral: reviewed, source-linked, deadline-aware.
- Do use animation for clarity and polish.
- Do not add wallet, token, on-chain, Discord, Telegram, trust score, liar score, leaderboard, or fake watcher metrics.
- Do not use the old `ui design/` image folder as implementation reference.
