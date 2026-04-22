import type { ReactNode } from "react";
import Link from "next/link";

export function PageShell(props: { children: ReactNode }) {
  return (
    <div className="page-shell">
      <header className="site-header">
        <Link href="/" className="wordmark">
          CLOCKED
        </Link>
        <nav className="site-nav">
          <Link href="/due">Due</Link>
          <Link href="/delivered">Delivered</Link>
          <Link href="/slipped">Slipped</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </header>
      <main>{props.children}</main>
    </div>
  );
}

