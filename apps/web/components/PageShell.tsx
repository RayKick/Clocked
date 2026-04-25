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
                <span className="wordmark-caption">Public memory for crypto promises</span>
              </span>
            </Link>
            <nav className="site-nav" aria-label="Primary">
              <Link href="/" className="site-nav-link">
                Receipts
              </Link>
              <Link href="/due" className="site-nav-link">
                Due Soon
              </Link>
              <Link href="/methodology" className="site-nav-link">
                Methodology
              </Link>
              <Link href="/projects" className="site-nav-link">
                Projects
              </Link>
              <Link href="/api" className="site-nav-link">
                API
              </Link>
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
            <Link href="/">Receipts</Link>
            <Link href="/due">Due Soon</Link>
            <Link href="/methodology">Methodology</Link>
            <Link href="/projects">Projects</Link>
            <Link href="/api">API</Link>
            <a href="https://x.com/ClockedBot">X</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
