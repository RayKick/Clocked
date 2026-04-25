import React from "react";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function stringValue(payload: Record<string, unknown>, key: string) {
  return typeof payload[key] === "string" ? payload[key] : null;
}

function numberValue(payload: Record<string, unknown>, key: string) {
  return typeof payload[key] === "number" ? payload[key] : null;
}

function stringArrayValue(payload: Record<string, unknown>, key: string) {
  return Array.isArray(payload[key]) ? payload[key].map(String) : [];
}

function proposedAction(kind: string, payload: Record<string, unknown>) {
  const verdict = stringValue(payload, "verdict");
  switch (kind) {
    case "CLAIM_CREATE":
      if (verdict === "NOT_CLOCKABLE") {
        return "Informational only. This item should stay non-public and can be rejected to clear the queue.";
      }
      return "Create a local public claim and a draft bot reply. Approval does not post externally.";
    case "STATUS_CHANGE":
      return "Apply the proposed status only after human review. Approval does not change any external platform state.";
    case "HEYANON_EVIDENCE":
    case "EVIDENCE_REVIEW":
      return "Attach evidence locally. Approval does not automatically change claim status.";
    case "BOT_REPLY":
      return "Mark the bot reply approved only. External posting remains disabled unless separate gates are satisfied.";
    default:
      return "Review and apply this item locally only.";
  }
}

export function AdminReviewCard(props: {
  reviewItem: {
    id: string;
    kind: string;
    status: string;
    reason: string | null;
    payloadJson: unknown;
    createdAt: Date;
  };
  adminPassword?: string;
}) {
  const payload = asRecord(props.reviewItem.payloadJson);
  const verdict = stringValue(payload, "verdict");
  const sourceQuote =
    stringValue(payload, "sourceQuote") ?? stringValue(payload, "sourceText");
  const normalizedClaim = stringValue(payload, "normalizedClaim");
  const deadlineText = stringValue(payload, "deadlineText");
  const deadlineAt = stringValue(payload, "deadlineAt");
  const proposedStatus = stringValue(payload, "proposedStatus");
  const notClockableReason = stringValue(payload, "notClockableReason");
  const projectName = stringValue(payload, "projectName");
  const projectSlug = stringValue(payload, "projectSlug");
  const actorHandle = stringValue(payload, "actorHandle");
  const sourceUrl = stringValue(payload, "sourceUrl");
  const evidenceSummary = stringValue(payload, "summary");
  const rationale = stringValue(payload, "rationale") ?? stringValue(payload, "reason");
  const evidenceType = stringValue(payload, "evidenceType");
  const deadlineConfidence = numberValue(payload, "deadlineConfidence");
  const ambiguityNotes = stringArrayValue(payload, "ambiguityNotes");
  const deliveryCriteria = stringArrayValue(payload, "deliveryCriteria");
  const nonDeliveryCriteria = stringArrayValue(payload, "nonDeliveryCriteria");
  const headerMeta = [
    verdict ? `Verdict: ${verdict}` : null,
    proposedStatus ? `Proposed status: ${proposedStatus}` : null,
    evidenceType ? `Evidence: ${evidenceType}` : null
  ].filter((line): line is string => Boolean(line));
  const extractedPreview = [
    normalizedClaim,
    deadlineText ? `Deadline: ${deadlineText}` : null,
    deadlineAt ? `Recorded for ${deadlineAt}` : null,
    deadlineConfidence != null ? `Confidence: ${deadlineConfidence}` : null
  ].filter((line): line is string => Boolean(line));
  const contextPreview = [
    rationale,
    notClockableReason,
    ...ambiguityNotes,
    ...deliveryCriteria.slice(0, 2),
    ...nonDeliveryCriteria.slice(0, 2)
  ].filter((line): line is string => Boolean(line));
  const sourceMeta = [
    projectName ? `Project: ${projectName}` : null,
    projectSlug ? `Slug: ${projectSlug}` : null,
    actorHandle ? `Actor: @${actorHandle}` : null
  ].filter((line): line is string => Boolean(line));
  const kindLabel = props.reviewItem.kind.replaceAll("_", " ");

  return (
    <article className="review-card">
      <div className="review-card-header">
        <div className="review-card-copy">
          <span className="card-kicker">Review item</span>
          <h3 className="card-title">{kindLabel}</h3>
          {props.reviewItem.reason ? (
            <p className="muted-copy">{props.reviewItem.reason}</p>
          ) : null}
        </div>
        <div className="review-card-meta">
          <span className="tab">{props.reviewItem.status}</span>
          <span className="mini-label">{props.reviewItem.createdAt.toUTCString()}</span>
        </div>
      </div>
      {headerMeta.length > 0 ? (
        <div className="review-inline-list">
          {headerMeta.map((item) => (
            <span key={item} className="hero-meta-item">
              {item}
            </span>
          ))}
        </div>
      ) : null}
      <div className="review-card-sections">
        {(sourceQuote || sourceMeta.length > 0 || sourceUrl) && (
          <section className="review-section">
            <span className="mini-label">Source preview</span>
            {sourceQuote ? <div className="quote-block">“{sourceQuote}”</div> : null}
            {sourceMeta.length > 0 ? (
              <p className="review-section-copy">{sourceMeta.join(" · ")}</p>
            ) : null}
            {sourceUrl ? <a href={sourceUrl}>Open source</a> : null}
          </section>
        )}
        {extractedPreview.length > 0 ? (
          <section className="review-section">
            <span className="mini-label">Extracted claim</span>
            <ul className="simple-list">
              {extractedPreview.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {(evidenceSummary || contextPreview.length > 0) && (
          <section className="review-section">
            <span className="mini-label">Evidence and rationale</span>
            {evidenceSummary ? <p className="review-section-copy">{evidenceSummary}</p> : null}
            {contextPreview.length > 0 ? (
              <ul className="simple-list">
                {contextPreview.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}
          </section>
        )}
      </div>
      <div className="review-callout">
        <strong className="banner-title">Proposed action</strong>
        <p className="muted-copy">{proposedAction(props.reviewItem.kind, payload)}</p>
      </div>
      <details className="details-reset">
        <summary>Payload JSON</summary>
        <pre>{JSON.stringify(props.reviewItem.payloadJson, null, 2)}</pre>
      </details>
      <p className="muted-copy">Approval does not post externally.</p>
      <div className="review-card-actions">
        {verdict === "NOT_CLOCKABLE" ? null : (
          <form action={`/api/admin/review/${props.reviewItem.id}/approve`} method="post">
            {props.adminPassword ? (
              <input type="hidden" name="adminPassword" value={props.adminPassword} />
            ) : null}
            <input type="hidden" name="redirectTo" value="/admin/review" />
            <button type="submit">Approve</button>
          </form>
        )}
        <form action={`/api/admin/review/${props.reviewItem.id}/reject`} method="post">
          {props.adminPassword ? (
            <input type="hidden" name="adminPassword" value={props.adminPassword} />
          ) : null}
          <input type="hidden" name="reason" value="Rejected from admin queue." />
          <input type="hidden" name="redirectTo" value="/admin/review" />
          <button type="submit" className="secondary">
            Reject
          </button>
        </form>
      </div>
    </article>
  );
}
