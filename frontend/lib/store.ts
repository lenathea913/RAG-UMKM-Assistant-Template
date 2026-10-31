/**
 * Profil toko & data katalog — konfigurasi tunggal seluruh aplikasi.
 *
 * - store-profile.json  : identitas toko, asisten, tema, metadata produk (diedit pemilik)
 * - data/katalog.json   : hasil generate dari knowledge-base/price-list.md (npm run sync)
 *
 * Halaman frontend mengimpor dari sini, bukan menduplikasi teks/angka.
 */
import type { ComponentType } from "react";
import {
  BadgePercent,
  Clock3,
  Gift,
  Phone,
  ShieldCheck,
  Star,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";

import profile from "@/store-profile.json";
import catalog from "@/data/katalog.json";

export type Highlight = { icon: string; title: string; desc: string };

export type StoreProfile = {
  name: string;
  shortName: string;
  city: string;
  category: string;
  tagline: string;
  since: string;
  logo: string | null;
  background: string | null;
  theme: {
    primary: string;
    primaryDark?: string;
    primarySoft?: string;
    primaryMist?: string;
  };
  assistant: {
    name: string;
    greeting: string;
    suggestions: string[];
  };
  admin: {
    whatsapp: string;
    hours: string;
  };
  highlights: Highlight[];
};

export type KatalogItem = {
  name: string;
  code: string;
  price: string;
  reseller: string | null;
  img: string | null;
  desc: string;
  highlight: boolean;
};

export type Katalog = {
  priceTitle: string;
  priceNote: string[];
  categories: { title: string; note: string; items: KatalogItem[] }[];
  reseller: { percent: number; notes: string[] };
  paymentNotes: string[];
};

export const store = profile as StoreProfile;
export const katalog = catalog as Katalog;

/** Semua produk, dipakai halaman home & reseller. */
export const allItems: KatalogItem[] = katalog.categories.flatMap((c) => c.items);

/** Produk unggulan untuk halaman home (highlight, fallback: empat pertama). */
export const featuredItems: KatalogItem[] = (() => {
  const marked = allItems.filter((i) => i.highlight);
  return (marked.length ? marked : allItems).slice(0, 4);
})();

/** Tautan WhatsApp admin, pesan disesuaikan. */
export function waHref(message: string): string {
  return `https://wa.me/${store.admin.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Ganti {assistant} di teks disclaimer dengan nama asisten toko. */
export function withAssistant(text: string): string {
  return text.replaceAll("{assistant}", store.assistant.name);
}

/** Peta ikon highlight — nama dari store-profile.json → ikon lucide. */
const ICONS: Record<string, LucideIcon> = {
  truck: Truck,
  clock: Clock3,
  badge: BadgePercent,
  gift: Gift,
  store: Store,
  phone: Phone,
  shield: ShieldCheck,
};

export function highlightIcon(name: string): LucideIcon {
  return ICONS[name] ?? Star;
}

/** Ikon untuk catatan pembayaran/promo (katalog). */
export function paymentIcon(note: string): ComponentType<{ className?: string }> {
  const n = note.toLowerCase();
  if (n.includes("ongkir") || n.includes("kirim") || n.includes("pengiriman")) return Truck;
  if (n.includes("promo") || n.includes("diskon") || n.includes("potongan")) return BadgePercent;
  return Store;
}
