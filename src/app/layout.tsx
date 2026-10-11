import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Game of Life",
  description: "Conway's Game of Life in Next.js and TypeScript.",
};

export const viewport: Viewport = {
  themeColor: "#07080c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
