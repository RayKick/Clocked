import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "CLOCKED",
  description:
    "HeyAnon-native public receipts layer for crypto promises, delivery evidence, and accountability records."
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{props.children}</body>
    </html>
  );
}
