import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "CLOCKED",
  description:
    "Public memory for crypto promises, with review, deadlines, evidence, and agent-friendly records."
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={sans.variable}>{props.children}</body>
    </html>
  );
}
