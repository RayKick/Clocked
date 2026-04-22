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
  return (
    <article
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "1.1rem",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
        boxShadow: "0 16px 40px rgba(0,0,0,0.15)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "0.9rem"
        }}
      >
        <StatusBadge status={props.status} />
        <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>
          /c/{props.slug}
        </span>
      </div>
      <h3 style={{ margin: 0, fontSize: "1.1rem", lineHeight: 1.35 }}>
        {props.normalizedClaim}
      </h3>
      <p style={{ margin: "0.6rem 0", opacity: 0.8 }}>
        {getNeutralReceiptSubline(props.status)}
      </p>
      <div style={{ display: "grid", gap: "0.25rem", fontSize: "0.92rem" }}>
        {props.projectName ? <span>Project: {props.projectName}</span> : null}
        {props.actorHandle ? <span>Source: @{props.actorHandle}</span> : null}
        {props.deadlineText ? (
          <span>
            Deadline: {props.deadlineText}
            {props.deadlineAt ? ` (${new Date(props.deadlineAt).toUTCString()})` : ""}
          </span>
        ) : null}
      </div>
    </article>
  );
}

