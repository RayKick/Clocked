import React from "react";

export function SectionShell(props: {
  eyebrow?: string;
  title: string;
  body?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gap: "0.45rem" }}>
        {props.eyebrow ? (
          <span
            style={{
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--brand-accent)"
            }}
          >
            {props.eyebrow}
          </span>
        ) : null}
        <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2vw, 2rem)" }}>
          {props.title}
        </h2>
        {props.body ? (
          <p style={{ margin: 0, maxWidth: 780, opacity: 0.84 }}>{props.body}</p>
        ) : null}
      </div>
      {props.children}
    </section>
  );
}

