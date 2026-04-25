# CLOCKED Copy Pack

## Purpose

This document defines the public and admin copy system for CLOCKED. It keeps the product neutral, precise, and consistent across pages, forms, empty states, and safety messaging.

## Voice and Tone

### Core voice

- Precise
- Neutral
- Calm
- Modern
- Factual
- Short
- Credible

### What CLOCKED copy should do

- Explain what the user is looking at quickly.
- Clarify review state and safety state explicitly.
- Preserve confidence without sounding promotional.
- Keep language readable for both crypto-native and general technical readers.

### What CLOCKED copy should not do

- Hype the product.
- Suggest intent or blame.
- Sound accusatory.
- Sound like a pitch deck.
- Overload the page with crypto jargon.

### Forbidden or discouraged language

- Do not use `revolutionize`.
- Do not use `trustless`.
- Do not use `exposed`.
- Do not use `liar`.
- Do not use `rug`.
- Do not use `fraud`.
- Avoid vague startup phrases.
- Avoid loaded judgment language.

## Headline Rules

- Keep headlines short.
- State the object or action clearly.
- Prefer concrete nouns.
- Avoid stacked clauses.
- Avoid marketing claims.

Good patterns:

- Public receipts for crypto promises.
- Claims on the clock.
- Admin review queue.
- Project record.
- Public receipt.

## CTA Rules

- CTA text should be literal.
- Use verbs that describe the next step plainly.
- Avoid hype verbs and vague verbs.

Preferred CTA patterns:

- View live receipts
- See due claims
- View receipt
- Open queue
- Open review queue
- Create review item
- View HUD export

## Empty-State Rules

- Say what is absent.
- Say when or how content would appear.
- Keep the tone calm.
- Do not joke.
- Do not imply failure when nothing is wrong.

Pattern:

- Title: what is absent now.
- Body: what would make it appear later.

## Helper Text Rules

- Explain the constraint, not the whole system.
- Keep helper text to one short sentence when possible.
- Use helper text to prevent mistakes, not restate the label.

## Status Label Rules

- Status labels are factual public-record labels.
- Use the same status names everywhere.
- Do not invent synonymous labels per page.

Approved public labels:

- Open
- Delivered
- Slipped
- Reframed
- Superseded
- Ambiguous

Approved admin-only labels:

- Needs review
- Not clockable
- Pending

## Error and Success Message Rules

- Keep messages short.
- State what happened.
- Add next-step guidance only when useful.
- Avoid dramatic phrasing.

Good error pattern:

- The review item was not created.
- The request could not be processed.

Good success pattern:

- Review item ready.
- Status update recorded.

## Admin Safety Wording Rules

- Always state that approvals are local-only when in dry-run mode.
- State clearly that approval does not post externally.
- State clearly that live X posting is disabled unless separately enabled.
- State clearly that live HeyAnon and Gemma calls remain disabled unless separately enabled.
- Use “protected mutations” and “header auth” language instead of vague warning language.

## Approved Page Copy

### Homepage

#### Eyebrow

- Neutral by default

#### Hero headline

- Public receipts for crypto promises.

#### Hero subcopy

- Track public promises with deadlines and evidence. Review before publishing. Built for humans and agents.

#### Primary CTA

- View live receipts

#### Secondary CTA

- See due claims

#### Three value props

- Track public promises
- Preserve deadlines and evidence
- Review before publishing

#### Expanded proof/value strip

- Track public promises
  Capture concrete public claims without editorializing.
- Preserve deadlines and evidence
  The public record keeps the timeline readable later.
- Review before publishing
  Drafts stay in queue until a human signs off.
- Built for humans and agents
  Browse on the web or pull structured surfaces through MCP.

#### How it works section

- Section title:
  A calm path from source to public record
- Section body:
  CLOCKED is designed to preserve public claims cleanly, keep review explicit, and publish neutral receipts only when they are ready.
- Step 1:
  Public source and deadline
- Step 1 body:
  Start from a public post, preserve the quote, and record the stated deadline.
- Step 2:
  Human review before publication
- Step 2 body:
  Drafts, evidence, and status changes stay in the queue until they are reviewed.
- Step 3:
  Neutral public receipt
- Step 3 body:
  The result is a factual record with status history, evidence, and agent-friendly surfaces.

#### Live examples section

- Section title:
  Open receipts
- Section body:
  A factual public memory layer for time-bounded crypto claims. The record stays shorter, calmer, and easier to scan than the original discourse.

#### MCP and HUD credibility section

- Section title:
  MCP and HUD are first-class surfaces
- Section body:
  CLOCKED keeps human-readable pages and machine-readable outputs aligned, so the same record can support browsing, moderation, and downstream agent workflows.
- MCP card title:
  Structured records for agent use
- MCP card body:
  Agents can pull public-safe claim and record data without scraping page chrome.
- HUD card title:
  Compact project export
- HUD card body:
  The HUD surface exposes the latest claim, due-soon count, and public record URL in one concise payload.

#### Footer copy

- CLOCKED preserves source, deadlines, and evidence with neutral public records. Review happens before anything becomes public.

### Claim Page

#### Section labels

- Public receipt
- Deadline
- Source
- Evidence trail
- Status history
- Receipt details
- Assessment notes
- Technical context

#### Helper copy

- This receipt records a public, time-bounded claim and its evidence trail. It does not infer intent.
- Public evidence and review notes are preserved against the original claim.
- Statuses describe the public record only: open, delivered, slipped, reframed, superseded, or ambiguous.

#### Evidence section heading

- Evidence trail

#### Status history heading

- Status history

#### Metadata labels

- Project
- Source
- Deadline
- Receipt URL
- Public JSON
- Delivery criteria
- Non-delivery criteria
- Classification notes

### Project Page

#### Page intro

- Project record
- Neutral public record
- No trust score

#### Delivery record explanation

- Counts are presented as a factual snapshot of the current public record.

#### Stats labels

- Open
- Delivered
- Due soon
- Actors

#### Empty states

- No actors linked yet.
  Associated public sources will appear here once they are attached to the project record.
- Nothing due soon.
  No open claim in this project is currently close to deadline.
- No public claims yet.
  Claims will appear here once reviewed drafts are published.
- No status changes recorded yet.
  When the public record changes, the latest reviewed updates will appear here.

### Actor Page

#### Neutral framing

- Neutral track record view
- This page lists public claims linked to the actor and associated project sources. It does not assign a trust score.
- No public reputation score

#### Empty states

- No associated projects yet.
  Linked projects will appear here once they are connected to the actor record.
- No recent claims.
  Claims will appear here after review once they are linked to this actor.
- No status changes recorded yet.
  Reviewed status changes will appear here when the public record updates.

#### Metadata labels

- Claims
- Open
- Delivered
- Projects
- Status mix
- Associated projects
- Recent claims
- Recent activity

### Due Page

#### Urgency group labels

- Due today
- Due this week
- Overdue pending review
- Recently delivered
- Recently reframed

#### Digest copy

- Claims on the clock.
- A calm command view for upcoming deadlines, overdue open claims, and recent outcomes.

#### Empty states

- Nothing due today.
  The public queue is quiet for the rest of the day.
- Nothing due this week.
  No open public claim is approaching a recorded deadline right now.
- No overdue open claims.
  Nothing in the open record appears past deadline without review.
- No recent delivered outcomes.
  Delivered claims will appear here once recent evidence is reviewed.
- No recent reframes.
  Scope changes and follow-up context will appear here after review.

### Admin Review

#### Page intro

- Admin review queue
- Review claim drafts, status changes, and evidence without enabling live posting or live model calls.

#### Safety banner

- Dry-run mode stays on
- Approvals create local records only. X posting and live HeyAnon or Gemma calls remain disabled.

#### Approve and reject helper copy

- Approving a review item updates the local record only. Nothing here posts externally.
- Approval does not post externally.

#### Review item labels

- Review item
- Source preview
- Extracted claim
- Evidence and rationale
- Proposed action
- Payload JSON

#### No-external-posting language

- Approval does not post externally.
- Create a local public claim and a draft bot reply. Approval does not post externally.
- Apply the proposed status only after human review. Approval does not change any external platform state.
- Attach evidence locally. Approval does not automatically change claim status.

### Admin Ingest

#### Page intro

- Create review items from public X URLs.
- This console is for curation only. It prepares review items and does not read or post live content by default.

#### Form helper copy

- Use a public post URL. Fixture URLs still work in the dry-run demo.
- Helpful in local dry-run mode when you want to avoid live reads.
- Paste a public X post URL, then optionally add manual source text or curation metadata for the dry-run workflow.

#### Success state

- Review item ready.

#### Error state

- The review item was not created.

#### Preview and result wording

- What happens next
- The source is prepared as a review item.
- Nothing becomes public until a reviewer approves it.
- Dry-run mode keeps external posting disabled.
- Latest result
- No ingest submitted yet.
- When you create a review item, the parsed result will appear here.

## Global Style Rules

- Prefer one strong sentence over two soft ones.
- Prefer “public record” over “accountability layer” in UI copy.
- Prefer “review” over “moderation” unless the context is explicitly internal operations.
- Prefer “public claim” or “public receipt” over abstract jargon.
- Prefer “does not post externally” over more ambiguous phrases like “safe mode enabled.”
- Keep crypto references factual and restrained.
