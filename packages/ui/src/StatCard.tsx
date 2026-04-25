import React from "react";

export function StatCard(props: {
  label: string;
  value: string | number;
  detail?: string;
  tone?: "accent" | "neutral" | "success" | "warning";
}) {
  return (
    <div className="surface-card stat-card" data-tone={props.tone ?? "neutral"}>
      <span className="stat-label">{props.label}</span>
      <strong className="stat-value">{props.value}</strong>
      {props.detail ? <p className="stat-detail">{props.detail}</p> : null}
    </div>
  );
}
