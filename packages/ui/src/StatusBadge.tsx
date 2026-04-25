import React from "react";
import type { ClaimStatus } from "@clocked/core";
import { getPublicStatusLabel } from "@clocked/core";

const colorMap: Record<ClaimStatus, string> = {
  OPEN: "var(--status-open)",
  DELIVERED: "var(--status-delivered)",
  SLIPPED: "var(--status-slipped)",
  REFRAMED: "var(--status-reframed)",
  SUPERSEDED: "var(--status-superseded)",
  AMBIGUOUS: "var(--status-ambiguous)"
};

export function StatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <span
      className="status-badge"
      data-status={status}
      style={{
        background: colorMap[status]
      }}
    >
      {getPublicStatusLabel(status)}
    </span>
  );
}
