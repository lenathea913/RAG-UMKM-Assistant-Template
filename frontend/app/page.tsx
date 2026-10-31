import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MessageCircle } from "lucide-react";

import { StoreLogo } from "@/components/store-logo";
import {
  allItems,
  featuredItems,
  highlightIcon,
  katalog,
  store,
} from "@/lib/store";

const A = store.assistant;

export const metadata: Metadata = {
  title: `${store.shortName} · ${store.category}`,
  description: `${store.tagline} (sejak ${store.since}). Dilengkapi ${A.name}, asisten AI yang menjawab 24/7 berdasarkan dokumen resmi toko.`,
};

const CTA_CLASS =
  "inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-deep px-5 text-sm font-semibold text-white shadow-[0_4px_12px_-4px_rgba(47,68,112,0.55)] transition-all hover:bg-indigo-ink active:scale-[0.97]";

const GHOST_CLASS =
  "inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-5 text-sm font-semibold text-indigo-ink transition-colors hover:bg-indigo-mist/50";

export default function HomePage() {
  return (
    <div className="page-membrane relative min-h-dvh overflow-hidden">
      {/* Latar halaman dari profil toko (opsional) — blur + opacity 50% */}
      {store.background && (
        <img
          src={store.background}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50 blur-[6px]"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-canvas/45" />
      <div className="relative mx-auto w-full max-w-2xl px-4 pb-12">
        {/* Nav */}
        <header className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-mist">
            <StoreLogo className="h-6 w-6 text-indigo-deep" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold tracking-[-0.01em] text-ink">
              {store.shortName}
            </p>
            <p className="text-xs text-ink-soft">{store.city}</p>
          </div>
          <Link
            href="/chat"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-indigo-deep px-4 text-xs font-semibold text-white transition-colors hover:bg-indigo-ink"
          >
            Tanya {A.name}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-[0_12px_32px_-16px_rgba(34,51,92,0.3)]">
          <StoreLogo className="pointer-events-none absolute -right-10 -top-12 h-56 w-56 rotate-6 text-indigo-deep opacity-[0.05]" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-mist bg-indigo-mist/50 px-3 py-1 text-xs font-medium text-indigo-ink">
            {store.category} · sejak {store.since}
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.02em] text-ink">
            {store.shortName}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {store.tagline}. Sekarang punya <strong>{A.name}</strong>, asisten
            AI yang menjawab tanya kamu 24 jam, berdasarkan dokumen resmi toko.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/chat" className={CTA_CLASS}>
              Tanya {A.name} sekarang
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="#koleksi" className={GHOST_CLASS}>
              Lihat koleksi
            </Link>
          </div>
        </section>

        {/* Info toko — fakta dari knowledge base, diatur di store-profile.json */}
        <section className="mt-3 grid grid-cols-2 gap-3">
          {store.highlights.map((h) => {
            const Icon = highlightIcon(h.icon);
            return (
              <div
                key={h.title}
                className="rounded-2xl border border-line bg-surface p-4 shadow-[0_6px_16px_-12px_rgba(34,51,92,0.25)]"
              >
                <Icon className="h-4 w-4 text-indigo-deep" aria-hidden />
                <h2 className="mt-2 text-sm font-bold text-ink">{h.title}</h2>
                <p className="mt-0.5 text-xs leading-snug text-ink-soft">
                  {h.desc}
                </p>
              </div>
            );
          })}
        </section>

        {/* Koleksi pilihan — dari knowledge-base/price-list.md (npm run sync) */}
        <section id="koleksi" className="mt-8 scroll-mt-4">
          <h2 className="text-lg font-bold tracking-[-0.01em] text-ink">
            Koleksi pilihan
          </h2>
          <p className="mt-0.5 text-xs text-ink-soft">
            {katalog.priceNote.join(" ")}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {featuredItems.map((p) => (
              <div
                key={p.code}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-4 shadow-[0_6px_16px_-12px_rgba(34,51,92,0.25)]"
              >
                {p.img && (
                  <>
                    {/* Motif sesuai nama produk — blur + opacity 50% */}
                    <img
                      src={p.img}
                      alt=""
                      aria-hidden
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50 blur-[3px]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-surface/50" />
                  </>
                )}
                <div className="relative flex h-full flex-col">
                  {/* Ilustrasi produk — tampil jelas sebagai gambar */}
                  {p.img && (
                    <div className="relative -mx-4 -mt-4 mb-3 h-24 overflow-hidden">
                      <img
                        src={p.img}
                        alt={`Motif ${p.name}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface/85 via-transparent to-transparent" />
                      <span className="absolute left-3 top-3 rounded-md bg-surface/90 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-indigo-ink shadow-sm">
                        {p.code}
                      </span>
                    </div>
                  )}
                  <h3 className="text-sm font-bold text-ink">{p.name}</h3>
                  {p.desc && (
                    <p className="mt-0.5 text-xs leading-snug text-ink-soft">
                      {p.desc}
                    </p>
                  )}
                  <p className="mt-3 text-base font-extrabold text-indigo-ink">
                    {p.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-soft">
            {allItems.length > featuredItems.length &&
              `Masih ada ${allItems.length - featuredItems.length} produk lainnya. `}
            <Link
              href="/katalog"
              className="font-semibold text-indigo-deep underline underline-offset-2 hover:text-indigo-ink"
            >
              Lihat katalog lengkap &amp; harga reseller →
            </Link>{" "}
            atau tanya langsung ke {A.name}, Kak.
          </p>
        </section>

        {/* Kenalan dengan asisten */}
        <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-[0_12px_32px_-16px_rgba(34,51,92,0.3)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-mist">
            <MessageCircle className="h-5 w-5 text-indigo-deep" aria-hidden />
          </div>
          <h2 className="mt-3 text-lg font-bold tracking-[-0.01em] text-ink">
            Kenalan dengan {A.name}
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-soft" />
              Jawabannya mengacu pada dokumen resmi toko. Harga dan info tidak
              dikarang.
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-soft" />
              Kalau tidak tahu, {A.name} jujur lalu meneruskan pertanyaanmu ke
              admin.
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-soft" />
              Admin membalas {store.admin.hours}, sedangkan {A.name} online 24/7.
            </li>
          </ul>
          <Link href="/chat" className={`${CTA_CLASS} mt-5`}>
            Mulai chat
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-[11px] leading-snug text-ink-soft">
            Kamu bisa chat dengan asisten AI di halaman berikutnya. Jawaban
            mengacu pada dokumen resmi toko; untuk hal di luar itu, {A.name}{" "}
            akan meneruskan ke admin.
          </p>
          <p className="mt-2 text-[11px] font-semibold text-ink-soft">
            {store.name} · {store.admin.hours}
          </p>
        </footer>
      </div>
    </div>
  );
}
