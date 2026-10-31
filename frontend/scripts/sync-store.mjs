/**
 * Sinkronisasi katalog — dijalankan otomatis sebelum `npm run dev` / `npm run build`.
 *
 * Sumber kebenaran harga:  ../knowledge-base/price-list.md   (diedit pemilik toko)
 * Sumber kebenaran profil: ./store-profile.json              (diedit pemilik toko)
 * Hasil:                  ./data/katalog.json                (GENERATED — jangan diedit manual)
 *
 * Yang dibaca dari price-list.md:
 *   - judul (# ...) dan catatan harga (paragraf sebelum ## pertama)
 *   - tiap section "## Kategori" berisi tabel | Produk | Kode | Harga |
 *   - bullet "  - ..." di section Harga Reseller & Pembayaran/Promo
 *
 * Harga reseller dihitung dari profil (reseller.percent, reseller.excludeCategories),
 * bukan ditulis tangan, supaya tidak ada angka yang dobel.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KB_DIR = process.env.KNOWLEDGE_DIR
  ? path.resolve(FRONTEND, process.env.KNOWLEDGE_DIR)
  : path.resolve(FRONTEND, "..", "knowledge-base");

const PRICE_FILE = path.join(KB_DIR, "price-list.md");
const PROFILE_FILE = path.join(FRONTEND, "store-profile.json");
const OUT_DIR = path.join(FRONTEND, "data");
const OUT_FILE = path.join(OUT_DIR, "katalog.json");

/** "Rp 1.850.000" → 1850000 (bila bukan angka, kembalikan null) */
function parseRupiah(text) {
  const digits = String(text).replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number(digits);
}

/** 327250 → "Rp 327.250" */
function formatRupiah(value) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function isTableSeparator(cells) {
  return cells.every((c) => /^:?-{3,}:?$/.test(c));
}

function splitRow(line) {
  const row = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return row.split("|").map((c) => c.trim());
}

function parsePriceList(markdown) {
  const lines = markdown.split(/\r?\n/);

  const result = {
    priceTitle: "",
    priceNote: [],
    categories: [],
    resellerNotes: [],
    paymentNotes: [],
  };

  let section = null; // { title, bullets, rows }
  let introDone = false;

  const flush = () => {
    if (!section) return;
    if (/reseller/i.test(section.title)) {
      // Keterangan dalam kurung judul section (mis. "Harga Reseller (min. 10 pcs)")
      // ikut ditampilkan sebagai catatan pertama.
      const paren = section.title.match(/\(([^)]+)\)/);
      if (paren) {
        const cap = paren[1].trim();
        result.resellerNotes.push(
          cap.charAt(0).toUpperCase() + cap.slice(1) + ".",
        );
      }
      result.resellerNotes.push(...section.bullets);
    }
    if (/(pembayaran|promo)/i.test(section.title)) {
      result.paymentNotes.push(...section.bullets);
    }

    const rows = section.rows;
    const header = rows[0];
    if (header && header.length >= 3) {
      const cols = header.map((h) => h.toLowerCase());
      const iName = cols.findIndex((h) => h.includes("produk"));
      const iCode = cols.findIndex((h) => h.includes("kode"));
      const iPrice = cols.findIndex((h) => h.includes("harga"));
      if (iName >= 0 && iCode >= 0 && iPrice >= 0) {
        const items = rows.slice(1)
          .map((r) => ({
            name: r[iName] ?? "",
            code: r[iCode] ?? "",
            price: r[iPrice] ?? "",
          }))
          .filter((it) => it.name && it.code && it.price);
        if (items.length) {
          result.categories.push({ title: section.title, items });
        }
      }
    }
    section = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (/^#\s+/.test(line)) {
      if (!result.priceTitle) result.priceTitle = line.replace(/^#\s+/, "").trim();
      continue;
    }

    if (/^##\s+/.test(line)) {
      flush();
      introDone = true;
      section = { title: line.replace(/^##\s+/, "").trim(), bullets: [], rows: [] };
      continue;
    }

    if (!introDone) {
      const t = line.trim();
      if (t && !t.startsWith("#")) result.priceNote.push(t);
      continue;
    }

    if (!section) continue;

    if (line.trim().startsWith("- ")) {
      section.bullets.push(line.trim().slice(2).trim());
      continue;
    }

    if (line.trim().startsWith("|")) {
      const cells = splitRow(line);
      if (isTableSeparator(cells)) continue;
      section.rows.push(cells);
    }
  }
  flush();

  return result;
}

function main() {
  if (!fs.existsSync(PRICE_FILE)) {
    console.error(`[sync] tidak menemukan ${PRICE_FILE}`);
    process.exit(1);
  }
  if (!fs.existsSync(PROFILE_FILE)) {
    console.error(`[sync] tidak menemukan ${PROFILE_FILE}`);
    process.exit(1);
  }

  const profile = JSON.parse(fs.readFileSync(PROFILE_FILE, "utf8"));
  const parsed = parsePriceList(fs.readFileSync(PRICE_FILE, "utf8"));

  const percent = profile.reseller?.percent ?? 0;
  const excluded = new Set(profile.reseller?.excludeCategories ?? []);

  const categories = parsed.categories.map((cat) => ({
    title: cat.title,
    note: profile.categoryNotes?.[cat.title] ?? "",
    items: cat.items.map((it) => {
      const meta = profile.productMeta?.[it.code] ?? {};
      const rupiah = parseRupiah(it.price);
      const reseller =
        percent > 0 && !excluded.has(cat.title) && rupiah != null
          ? formatRupiah(Math.round((rupiah * (100 - percent)) / 100))
          : null;
      return {
        name: it.name,
        code: it.code,
        price: it.price,
        reseller,
        img: meta.img ?? null,
        desc: meta.desc ?? "",
        highlight: Boolean(meta.highlight),
      };
    }),
  }));

  const output = {
    priceTitle: parsed.priceTitle,
    priceNote: parsed.priceNote,
    categories,
    reseller: {
      percent,
      notes: parsed.resellerNotes,
    },
    paymentNotes: parsed.paymentNotes,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  const total = categories.reduce((n, c) => n + c.items.length, 0);
  console.log(
    `[sync] ${path.relative(process.cwd(), OUT_FILE)} ← ${total} produk / ${categories.length} kategori (dari ${path.relative(process.cwd(), PRICE_FILE)})`,
  );
}

main();
