import React from "react";

export function SectionShell(props: {
  id?: string;
  eyebrow?: string;
  title: string;
  body?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={props.id} className="section-shell reveal">
      <div className="section-head">
        <div className="section-copy">
          {props.eyebrow ? <span className="eyebrow">{props.eyebrow}</span> : null}
          <h2 className="section-title">{props.title}</h2>
          {props.body ? <p className="section-body">{props.body}</p> : null}
        </div>
        {props.actions ? <div className="section-actions">{props.actions}</div> : null}
      </div>
      {props.children}
    </section>
  );
}
