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
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        borderRadius: 999,
        padding: "0.35rem 0.7rem",
        background: colorMap[status],
        color: "#101215",
        fontSize: "0.8rem",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase"
      }}
    >
      {getPublicStatusLabel(status)}
    </span>
  );
}

