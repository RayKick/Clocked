# CLOCKED Product Thesis

CLOCKED is a public memory and delivery-record layer for crypto promises.

The product turns concrete, time-bounded public statements into structured claim records with:

- a source quote and source URL
- a normalized claim statement
- deadline logic and confidence
- evidence and follow-up history
- neutral status changes
- public receipts that can be shared or queried by agents

The product is intentionally not a harassment bot, not a dunk machine, and not a liar-score system. Its job is to preserve what was promised, what was delivered, what changed, and what remains ambiguous.

## Why This Exists

Crypto is unusually dependent on public promises made across fast-moving public channels. Teams announce launches, audits, docs, buybacks, migrations, betas, and releases in posts that are easy to amplify and easy to forget. The market remembers hype better than delivery.

CLOCKED gives the ecosystem a better memory:

- if a team delivers, the receipt should be visible
- if a deadline slips, the record should still be factual
- if a claim gets reframed, the public should be able to see how it changed
- if a statement is too vague to evaluate, the system should say so plainly

This keeps the product useful to researchers, communities, builders, and downstream agents without turning it into accusation-as-a-service.

## Core Product Shape

At MVP, CLOCKED is:

- an intake and review system for public claims
- a public web layer for claim, project, and actor records
- a review queue for evidence and status changes
- a receipts surface that other agents can query through MCP
- a HeyAnon-native agent foundation with mock-first adapters

At MVP, CLOCKED is not:

- a token utility product
- an on-chain enforcement system
- a private surveillance tool
- a trust score or liar score
- a fully automated posting system

## Viral Loop

The growth loop is based on shareable receipts, not accusations.

1. A user tags the bot under a concrete public promise.
2. CLOCKED creates a structured draft or a neutral "Not Clockable" response.
3. Approved claims become public receipt pages with deadlines, evidence criteria, and source preservation.
4. When outcomes become clear, the product publishes a delivery-oriented update such as Delivered, Slipped, Reframed, or Superseded.
5. People share the receipt because it is useful context, not because it is hostile.

The strongest loop is not "gotcha." It is public memory with compact, factual cards.

## X Wedge

X is the wedge because many crypto commitments are made there first and amplified there fastest.

The MVP X experience should feel simple:

- mention the CLOCKED bot under a concrete promise
- the agent identifies the parent or quoted source post
- the system extracts whether the claim is Clockable, Not Clockable, or Needs Review
- a draft reply is proposed for admin review
- only approved replies may move toward posting

The X wedge is useful because it lowers intake friction, but the durable product is the receipt record itself.

## Delivery Receipts

Delivered receipts matter as much as slipped receipts.

The product should celebrate delivery without sounding promotional. A Delivered claim page should make it easy to see:

- what was promised
- when it was promised
- what evidence supports delivery
- how the status changed

Balanced treatment improves trust in the record because the system is visibly capable of documenting good outcomes as well as delays.

## "Not Clockable" as a Useful Meme

"Not Clockable" can become a shareable meme, but the joke only works if it remains policy-grounded.

The phrase should mean:

- there is no concrete deliverable
- there is no explicit or reasonably bounded deadline
- the source is not official enough without review
- the outcome cannot later be evaluated with public evidence

It should never mean "this team is bad." It only means the statement is too vague for a fair public receipt.

## Public Memory Layer

The long-term value of CLOCKED is a reusable memory layer for crypto accountability:

- web pages for humans
- MCP tools for agents
- HeyAnon context for research workflows
- HUD exports for compact project context

This allows CLOCKED to become infrastructure, not just a feed.

## Why No Token Utility In MVP

Token utility is explicitly out of scope for MVP.

Reasons:

- it adds legal, incentive, and governance complexity without improving the core record
- it can distort incentives toward engagement farming or punishment dynamics
- it distracts from the product's strongest proof of value: reliable, neutral public receipts

If CLOCKED earns distribution, it should earn it because the records are useful and trustworthy.

## MVP Success Criteria

The MVP succeeds if it can reliably do the following:

- preserve public sources and quotes
- distinguish Clockable claims from vague hype
- create reviewable claim drafts
- show neutral claim pages and project records
- surface evidence for delivery, slippage, reframes, and superseding updates
- export compact, factual context for HeyAnon and other agents

The MVP does not need to automate judgment perfectly. It needs to create a defensible workflow where evidence, deadlines, confidence, and review status are always visible.
