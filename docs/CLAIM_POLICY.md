# CLOCKED Claim Policy

This document defines what CLOCKED will track, how it evaluates public promises, and how it communicates outcomes without adopting accusatory language.

## Policy Goal

CLOCKED exists to preserve factual public receipts for concrete, time-bounded crypto commitments.

The policy is designed to:

- reduce hindsight distortion
- preserve source context and timeline logic
- separate vague hype from evaluable commitments
- keep public copy neutral and non-defamatory
- require human review where interpretation is uncertain

## What Counts As Clockable

A statement is Clockable only when all of the following are true:

1. The source is official, founder-level, approved, or manually approved for review.
2. The statement includes a concrete deliverable or action.
3. The statement includes an explicit deadline or a clearly bounded time window.
4. The outcome can later be evaluated with public evidence.
5. CLOCKED can explain both delivery criteria and non-delivery criteria without inventing facts.

If any of those conditions are missing, the statement should not become a public claim automatically.

## Clockable Examples

- "V2 next week."
- "Mainnet launches tomorrow."
- "Buybacks start this month."
- "Public beta ships by Friday."
- "The audit report will be published in Q2."
- "We will publish the docs before the end of April."

These are clockable because each statement points to a concrete deliverable and a time boundary that can later be checked.

## Not Clockable

Statements should be labeled Not Clockable when they do not support a fair future evaluation.

Common reasons:

- no concrete deliverable
- no clear deadline
- pure marketing language
- speculation, rumors, jokes, or memes
- third-party commentary without an approved official source
- price predictions that do not commit the project to a public action

Examples:

- "Soon."
- "Cooking."
- "Big things coming."
- "We are exploring V2."
- "Mainnet when ready."
- "Buybacks eventually."

Not Clockable is a scope decision, not a moral judgment.

## Needs Review

Some statements may be plausible commitments but remain too ambiguous for automatic handling.

These should be routed to Needs Review when:

- the deadline is approximate or hedged
- the deliverable is underspecified
- the wording may describe intent rather than commitment
- the source is relevant but not yet trusted enough for automatic creation
- the statement could map to multiple interpretations

Examples:

- "Beta soon, probably next week."
- "Launch should be around Friday."
- "We expect mainnet in the coming weeks."
- "Audit is basically done."
- "Rewards are coming after the next phase."

Needs Review protects fairness. It is the correct answer whenever CLOCKED cannot explain the evaluation logic confidently.

## Deadline Parsing Rules

Deadline parsing must be source-aware and conservative.

Rules:

1. Relative deadlines are parsed from the original post timestamp, never from the current time.
2. Raw deadline text must always be preserved.
3. Parsed timestamps must preserve a confidence score.
4. If the source timezone is known, use it. Otherwise default to UTC and preserve that assumption.
5. Do not silently harden vague timing into a precise date.

Interpretation guidance:

- "tomorrow" means the end of the next calendar day in the source timezone if known, otherwise UTC
- "this week" means the end of the current ISO week
- "next week" means the end of the next ISO week and should carry medium confidence
- "this month" means the end of the current calendar month
- "Q1", "Q2", "Q3", and "Q4" mean the end of the relevant quarter

Automatic claim creation should not occur when the deadline remains materially ambiguous after parsing.

## Status Taxonomy

CLOCKED uses neutral statuses that describe the record, not the speaker's intent.

### OPEN

The claim has been accepted and the deadline has not yet passed, or public delivery is not yet confirmed.

### DELIVERED

Public evidence indicates that the delivery criteria were met.

Delivered should be used only when the evidence is specific enough to support the original claim. Soft hints, previews, or unrelated activity are not enough unless the claim itself was about those narrower outputs.

### SLIPPED

The deadline passed and public evidence does not show that the delivery criteria were met.

Slipped should generally require review before becoming public. The public meaning is that the scheduled outcome did not arrive on time based on the available record. It does not imply deception, incompetence, or bad faith.

### REFRAMED

An official follow-up changed the scope, wording, or deadline in a material way.

Examples:

- a launch becomes a closed beta
- a publication becomes a preview
- "this month" becomes "next quarter"

Reframed is descriptive. It should not be accompanied by loaded language.

### SUPERSEDED

The original claim was replaced by a newer official claim, cancellation, or clearer restatement.

Superseded is appropriate when the public record is better represented by a newer commitment than by keeping the old claim as the active reference point.

### AMBIGUOUS

Evidence is insufficient, contradictory, or genuinely contestable.

Ambiguous is a valid outcome and should be used readily when the available public evidence does not support a clean Delivered, Slipped, Reframed, or Superseded conclusion.

## Evidence Standards

CLOCKED should rely only on public evidence in MVP.

Preferred evidence sources:

- the original source post or an official follow-up post
- project websites, docs, and GitBook pages
- official GitHub activity tied to the claimed deliverable
- official HeyAnon-supported public context where configured
- manually reviewed public links and screenshots where the underlying source is still available

Evidence should be stored with:

- source URL when available
- summary of why it matters
- when it occurred
- confidence
- raw capture metadata where appropriate

Weak evidence should create review items, not automatic status changes.

## Public Tone Rules

All public copy must remain factual, neutral, and evidence-based.

Required norms:

- say "Slipped," not "failed"
- say "Reframed," not "moved goalposts"
- say "Not Clockable," not "empty promises"
- celebrate Delivered receipts as visibly as delayed ones
- use short, factual wording in cards and replies

Avoid:

- "lied"
- "scam"
- "rug"
- "fraud"
- motive attribution
- sarcasm that implies intent
- certainty beyond the evidence

If a source contains inflammatory language, CLOCKED may preserve a short source quote but should avoid echoing or amplifying the accusation in its own copy.

## Disputes And Corrections

The record must be correctable.

Correction principles:

1. Preserve the original source and original claim record.
2. Add evidence or status events instead of silently rewriting history where possible.
3. Route contested changes through review.
4. Prefer AMBIGUOUS when the evidence is contested and not yet resolved.
5. Record why a change was made and what evidence was considered.

Common correction scenarios:

- a source timestamp was captured incorrectly
- a follow-up source shows the deliverable actually shipped on time
- a claimed deliverable referred to a narrower artifact than initially understood
- a follow-up statement clearly superseded the original claim

The product should support corrections without making the record disappear.

## Source Trust And Manual Approval

Not every public mention should become a claim.

Automatic handling should be limited to official or approved sources. Community posts, screenshots without verifiable provenance, and indirect hearsay should require manual review before they can produce a public claim.

## Policy Default

When the system is uncertain, it should prefer one of these outcomes:

- Not Clockable
- Needs Review
- Ambiguous

That bias is intentional. CLOCKED is more trustworthy when it declines weak claims than when it overstates certainty.
