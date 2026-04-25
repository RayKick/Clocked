import type { ClaimStatus } from "@clocked/core";
import { getNeutralReceiptSubline } from "@clocked/core";
import React from "react";

import { StatusBadge } from "./StatusBadge";

export interface ClaimCardProps {
  slug: string;
  status: ClaimStatus;
  normalizedClaim: string;
  sourceQuote?: string | null;
  evidenceRequired?: string | null;
  sourceLabel?: string | null;
  receiptId?: string | null;
  projectName?: string | null;
  actorHandle?: string | null;
  deadlineText?: string | null;
  deadlineAt?: string | null;
}

export function ClaimCard(props: ClaimCardProps) {
  const metadata = [props.projectName, props.actorHandle ? `@${props.actorHandle}` : null]
    .filter((value): value is string => Boolean(value))
    .join(" · ");

  return (
    <article className="surface-card surface-card--interactive claim-card receipt-card">
      <div className="receipt-card-top">
        <div>
          <span className="mini-label">CLOCKED receipt</span>
          <strong>{props.projectName ?? "Example project"}</strong>
          {props.actorHandle ? <small>@{props.actorHandle}</small> : null}
        </div>
        <StatusBadge status={props.status} />
      </div>
      <div className="receipt-card-rows">
        {props.sourceQuote ? (
          <div>
            <span>Source quote</span>
            <strong>“{props.sourceQuote}”</strong>
          </div>
        ) : null}
        <div>
          <span>Claim</span>
          <strong>{props.normalizedClaim}</strong>
        </div>
        <div>
          <span>Deadline</span>
          <strong>{props.deadlineText ?? "Deadline preserved"}</strong>
          {props.deadlineAt ? (
            <small>
              {new Date(props.deadlineAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "UTC"
              })}
            </small>
          ) : null}
        </div>
        <div>
          <span>Evidence required</span>
          <strong>{props.evidenceRequired ?? getNeutralReceiptSubline(props.status)}</strong>
        </div>
      </div>
      <div className="claim-card-footer receipt-card-footer">
        <span className="mono-id">{props.receiptId ?? `/c/${props.slug}`}</span>
        <span className="claim-card-date">{metadata || props.sourceLabel || "Source-linked"}</span>
      </div>
    </article>
  );
}
