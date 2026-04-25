import React from "react";
import Link from "next/link";
import { SectionShell } from "@clocked/ui";

import { PageShell } from "../../components/PageShell";

const methodologySections = [
  {
    id: "clockable",
    title: "What counts as a clockable claim",
    body: "A claim is clockable when it is public, attributable, time-bounded, and specific enough to evaluate later.",
    items: [
      "Public source is available and can be linked.",
      "The promise names a deliverable, milestone, launch, artifact, or outcome.",
      "The statement includes a deadline or a deadline can be normalized from wording like next week, Q2, or end of month."
    ]
  },
  {
    id: "not-clockable",
    title: "What is not clockable",
    body: "CLOCKED avoids vague intent, private claims, and language that cannot be evaluated without guessing.",
    items: [
      "Pure vibes such as soon, cooking, or big things coming without a concrete deliverable.",
      "Private DMs, unverified screenshots, or claims without a public source.",
      "Predictions, price targets, or opinions that are not delivery commitments."
    ]
  },
  {
    id: "deadlines",
    title: "How deadlines are normalized",
    body: "Reviewers preserve the original wording and add a normalized deadline when the source gives enough context.",
    items: [
      "Exact dates keep the source timezone when available.",
      "Calendar windows such as Q2 resolve to the end of the stated window unless the source says otherwise.",
      "Ambiguous deadline language stays visible in the receipt and may remain open for review."
    ]
  },
  {
    id: "evidence",
    title: "How delivery evidence is evaluated",
    body: "Delivery requires public evidence that matches the recorded claim and delivery criteria.",
    items: [
      "Release notes, docs, public repos, product pages, dashboards, or official announcements can count.",
      "Evidence must match the claim, not merely show related work.",
      "Every status change keeps the reasoning and evidence trail attached."
    ]
  },
  {
    id: "status-labels",
    title: "Status labels describe the public record only",
    body: "CLOCKED does not score teams or dunk on projects. Labels summarize reviewed public evidence.",
    items: [
      "Open means the deadline has not resolved or evidence review is not complete.",
      "Delivered means qualifying public evidence was reviewed.",
      "Slipped means the deadline passed before qualifying delivery evidence was reviewed.",
      "Reframed means the project changed scope or context after the original promise.",
      "Ambiguous means the public record is not clear enough for a stronger label."
    ]
  },
  {
    id: "disputes",
    title: "Disputes and corrections",
    body: "Corrections are part of the record. The goal is accuracy, not drama.",
    items: [
      "Anyone can point to public evidence that changes the record.",
      "Reviewers decide whether the evidence changes claim text, deadline, criteria, or status.",
      "Accepted changes stay visible in status history."
    ]
  }
];

export default function MethodologyPage() {
  return (
    <PageShell>
      <section className="hero hero--compact reveal">
        <div className="page-intro">
          <span className="eyebrow">Methodology first</span>
          <h1 className="page-intro-title">CLOCKED is not a dunk bot.</h1>
          <p className="page-intro-body">
            CLOCKED preserves public claims, deadlines, evidence, and reviewed
            status changes. Status labels describe the public record only.
          </p>
          <div className="watch-strip" aria-label="Methodology guarantees">
            <span>Claims must be public</span>
            <span>Sources stay attached</span>
            <span>Evidence is reviewed</span>
            <span>Corrections are logged</span>
          </div>
        </div>
      </section>

      <div className="methodology-index">
        {methodologySections.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            {section.title}
          </a>
        ))}
      </div>

      {methodologySections.map((section) => (
        <SectionShell
          key={section.id}
          id={section.id}
          title={section.title}
          body={section.body}
        >
          <ul className="methodology-checklist">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionShell>
      ))}

      <section className="final-cta reveal">
        <div>
          <h2>Clock the next promise before it gets forgotten.</h2>
          <p>Turn public crypto claims into permanent, source-linked receipts.</p>
        </div>
        <Link href="/#clock-this" className="button">
          Start clocking →
        </Link>
      </section>
    </PageShell>
  );
}
