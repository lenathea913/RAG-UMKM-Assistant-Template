import { Store } from "lucide-react";

import { store } from "@/lib/store";

/**
 * Logo toko generik:
 * - store-profile.json punya `logo` → SVG/PNG dipakai, diwarnai mengikuti teks
 *   sekitarnya (currentColor) lewat CSS mask.
 * - tanpa `logo` → ikon toko bawaan, jadi template netral untuk toko mana pun.
 */
export function StoreLogo({ className }: { className?: string }) {
  if (store.logo) {
    return (
      <span
        aria-hidden
        className={className}
        style={{
          display: "inline-block",
          backgroundColor: "currentColor",
          WebkitMaskImage: `url(${store.logo})`,
          maskImage: `url(${store.logo})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    );
  }
  return <Store className={className} aria-hidden focusable="false" />;
}
