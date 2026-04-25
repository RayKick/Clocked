import React, { type ReactNode } from "react";
import Link from "next/link";

export function PageShell(props: { children: ReactNode }) {
  return (
    <div className="page-shell">
      <div className="site-frame">
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="wordmark" aria-label="CLOCKED homepage">
              <span className="wordmark-mark" aria-hidden="true">
                <span />
              </span>
              <span className="wordmark-copy">
                <span>CLOCKED</span>
                <span className="wordmark-caption">Public receipts for crypto promises</span>
              </span>
            </Link>
            <nav className="site-nav" aria-label="Primary">
              <Link href="/" className="site-nav-link">
                Receipts
              </Link>
              <Link href="/due" className="site-nav-link">
                Due soon
              </Link>
              <Link href="/delivered" className="site-nav-link">
                Delivered
              </Link>
              <Link href="/slipped" className="site-nav-link">
                Slipped
              </Link>
              <a href="/api/hud/project/example-protocol" className="site-nav-link">
                API
              </a>
            </nav>
          </div>
        </header>
        <main className="site-main">{props.children}</main>
        <footer className="site-footer">
          <p className="site-footer-note">
            CLOCKED preserves source, deadlines, and evidence with neutral public
            records. Review happens before anything becomes public.
          </p>
          <div className="site-footer-links">
            <Link href="/">Home</Link>
            <Link href="/due">Due</Link>
            <Link href="/admin">Admin</Link>
            <Link href="/admin/review">Review queue</Link>
            <a href="/api/hud/project/example-protocol">HUD example</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
