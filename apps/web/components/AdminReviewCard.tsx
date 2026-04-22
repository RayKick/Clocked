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
  const sourceQuote = stringValue(payload, "sourceQuote");
  const normalizedClaim = stringValue(payload, "normalizedClaim");
  const deadlineText = stringValue(payload, "deadlineText");
  const proposedStatus = stringValue(payload, "proposedStatus");
  const notClockableReason = stringValue(payload, "notClockableReason");
  const summaryLines = [
    verdict ? `Verdict: ${verdict}` : null,
    sourceQuote ? `Source quote: ${sourceQuote}` : null,
    normalizedClaim ? `Normalized claim: ${normalizedClaim}` : null,
    deadlineText ? `Deadline: ${deadlineText}` : null,
    proposedStatus ? `Proposed status: ${proposedStatus}` : null,
    notClockableReason ? `Reason: ${notClockableReason}` : null,
    numberValue(payload, "deadlineConfidence") != null
      ? `Deadline confidence: ${numberValue(payload, "deadlineConfidence")}`
      : null
  ].filter((line): line is string => Boolean(line));

  return (
    <article className="admin-card">
      <div className="admin-card-head">
        <strong>{props.reviewItem.kind}</strong>
        <span>{props.reviewItem.status}</span>
      </div>
      <div className="admin-card-head">
        <span>{props.reviewItem.createdAt.toUTCString()}</span>
      </div>
      {props.reviewItem.reason ? <p>{props.reviewItem.reason}</p> : null}
      {summaryLines.length > 0 ? (
        <div className="panel">
          <ul className="simple-list">
            {summaryLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="panel">
        <strong>Proposed action</strong>
        <p style={{ marginBottom: 0 }}>{proposedAction(props.reviewItem.kind, payload)}</p>
      </div>
      <pre>{JSON.stringify(props.reviewItem.payloadJson, null, 2)}</pre>
      <p>Approval does not post externally.</p>
      <div className="admin-actions">
        {verdict === "NOT_CLOCKABLE" ? null : (
          <form action={`/api/admin/review/${props.reviewItem.id}/approve`} method="post">
            <input type="hidden" name="adminPassword" value={props.adminPassword ?? ""} />
            <input type="hidden" name="redirectTo" value="/admin/review" />
            <button type="submit">Approve</button>
          </form>
        )}
        <form action={`/api/admin/review/${props.reviewItem.id}/reject`} method="post">
          <input type="hidden" name="adminPassword" value={props.adminPassword ?? ""} />
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
