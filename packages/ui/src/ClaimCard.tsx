import type { ClaimStatus } from "@clocked/core";
import { getNeutralReceiptSubline } from "@clocked/core";
import React from "react";

import { StatusBadge } from "./StatusBadge";

export interface ClaimCardProps {
  slug: string;
  status: ClaimStatus;
  normalizedClaim: string;
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
    <article className="surface-card surface-card--interactive claim-card">
      <div className="claim-card-header">
        <StatusBadge status={props.status} />
        {props.deadlineText ? (
          <span className="mini-label">Deadline {props.deadlineText}</span>
        ) : (
          <span className="mini-label">Receipt</span>
        )}
      </div>
      <h3 className="claim-card-title">{props.normalizedClaim}</h3>
      <p className="claim-card-subline">{getNeutralReceiptSubline(props.status)}</p>
      <div className="claim-card-footer">
        {metadata ? <span className="metadata-value">{metadata}</span> : <span />}
        {props.deadlineAt ? (
          <span className="claim-card-date">
            {new Date(props.deadlineAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "UTC"
            })}
          </span>
        ) : (
          <span className="claim-card-date">/c/{props.slug}</span>
        )}
      </div>
    </article>
  );
}
