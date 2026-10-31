import type { Metadata, Viewport } from "next";
import "./globals.css";

import { store } from "@/lib/store";

const t = store.theme;

/**
 * Warna tema dari store-profile.json (theme.primary & turunannya).
 * Di-override lewat style inline di <html> supaya mengalahkan token bawaan
 * Tailwind di :root — pemilik toko cukup mengganti satu warna di profil.
 */
const themeVars: React.CSSProperties & Record<string, string> = {
  "--store-primary": t.primary,
  "--color-indigo-deep": "var(--store-primary)",
  "--color-indigo-ink":
    t.primaryDark ?? "color-mix(in oklab, var(--store-primary) 78%, #000)",
  "--color-indigo-soft":
    t.primarySoft ?? "color-mix(in oklab, var(--store-primary) 45%, #fff)",
  "--color-indigo-mist":
    t.primaryMist ?? "color-mix(in oklab, var(--store-primary) 16%, #fff)",
};

export const metadata: Metadata = {
  title: `${store.shortName} · Tanya ${store.assistant.name}`,
  description: `Asisten AI layanan pelanggan ${store.name}. Jawaban berdasarkan dokumen resmi toko, 24/7.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: t.primary,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" style={themeVars}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
