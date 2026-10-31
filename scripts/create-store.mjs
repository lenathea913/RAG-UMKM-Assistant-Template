/**
 * create-store.mjs — buat instance toko baru dari template ini.
 *
 *   node scripts/create-store.mjs "Toko Kain Solo"
 *   node scripts/create-store.mjs "Toko Kain Solo" --dest ../toko-kain-solo
 *   node scripts/create-store.mjs "Toko Kain Solo" --no-install
 *
 * Yang dilakukan (dari root template):
 *   1. Salin seluruh template ke folder tujuan (tanpa node_modules, .next,
 *      .git, .env.local — API key tidak ikut).
 *   2. Ganti data contoh Batik Larasati jadi placeholder netral:
 *      store-profile.json, knowledge-base/*.md, system prompt, eval.
 *   3. Buang artefak demo/UTS (submission, foto motif, hasil eval lama).
 *   4. Salin .env.example → .env.local, jalankan `npm run sync`,
 *      lalu `npm install` (lewati dengan --no-install).
 *   5. Cetak checklist langkah berikutnya untuk pemilik toko.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const TEMPLATE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ── argumen ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
if (!name) {
  console.error('Pakai: node scripts/create-store.mjs "Nama Toko" [--dest PATH] [--no-install]');
  process.exit(1);
}
const destArg = args.includes("--dest") ? args[args.indexOf("--dest") + 1] : null;
const noInstall = args.includes("--no-install");

const slug = name
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "") || "toko-baru";
const DEST = path.resolve(TEMPLATE_ROOT, destArg ?? `../${slug}`);

const skipInstall = (rel) =>
  rel.split(path.sep).some((seg) =>
    ["node_modules", ".next", ".git"].includes(seg),
  ) ||
  rel === path.join("frontend", ".env.local") ||
  rel === path.join("frontend", "tsconfig.tsbuildinfo");

if (path.resolve(DEST).startsWith(path.resolve(TEMPLATE_ROOT) + path.sep)) {
  console.error("Folder tujuan tidak boleh di dalam template (akan ikut tersalin).");
  process.exit(1);
}
if (fs.existsSync(DEST) && fs.readdirSync(DEST).length) {
  console.error(`Folder tujuan tidak kosong: ${DEST}`);
  process.exit(1);
}

const BULAN = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });
const TANGGAL = new Date().toISOString().slice(0, 10);
const q = (s) => JSON.stringify(s, null, 2);

// ── 1. salin template ──────────────────────────────────────────────────
fs.mkdirSync(DEST, { recursive: true });
fs.cpSync(TEMPLATE_ROOT, DEST, {
  recursive: true,
  filter: (src) => !skipInstall(path.relative(TEMPLATE_ROOT, src)),
});
console.log(`[1/5] template tersalin → ${path.relative(process.cwd(), DEST) || DEST}`);

// ── 2. profil toko placeholder ─────────────────────────────────────────
const profile = {
  $deskripsi:
    "PROFIL TOKO — satu-satunya tempat mengatur identitas toko di seluruh aplikasi. Edit lalu jalankan `npm run sync`. Isi di bawah ini BARU PLACEHOLDER; ganti semuanya.",
  name,
  shortName: name,
  city: "",
  category: "Toko UMKM",
  tagline: name,
  since: String(new Date().getFullYear()),
  logo: null,
  background: null,
  theme: {
    primary: "#334155",
    primaryDark: "#1e293b",
    primarySoft: "#94a3b8",
    primaryMist: "#e2e8f0",
  },
  assistant: {
    name: "Rara",
    greeting: `Halo, Kak! Aku Rara, asisten ${name}. Mau tanya soal produk, harga, stok, atau cara order? Aku bantu 24 jam, Kak.`,
    suggestions: [
      "Berapa harga produknya?",
      "Gimana cara ordernya, Kak?",
      "Ada promo nggak sekarang?",
      "Pengirimannya ke mana aja?",
    ],
  },
  admin: {
    whatsapp: "6281234567890",
    hours: "Senin–Sabtu 08.00–17.00 WIB",
  },
  highlights: [
    { icon: "clock", title: "Jam operasional", desc: "Senin–Sabtu, 08.00–17.00 WIB." },
    { icon: "truck", title: "Pengiriman", desc: "Tanyakan jangkauan pengiriman ke admin." },
    { icon: "badge", title: "Harga resmi", desc: "Semua harga tercantum di katalog resmi toko." },
    { icon: "gift", title: "Bantuan 24/7", desc: "Asisten AI menjawab pertanyaan kapan saja." },
  ],
  categoryNotes: {},
  reseller: { percent: 15, excludeCategories: [] },
  productMeta: {},
};
fs.writeFileSync(path.join(DEST, "frontend", "store-profile.json"), `${JSON.stringify(profile, null, 2)}\n`);

// ── 3. knowledge base starter ──────────────────────────────────────────
const kb = path.join(DEST, "knowledge-base");
fs.writeFileSync(
  path.join(kb, "price-list.md"),
  `# Daftar Harga ${name}

Berlaku mulai ${BULAN}.
Harga dalam Rupiah, belum termasuk ongkir.

## Kategori Contoh

| Produk | Kode | Harga |
|---|---|---|
| Produk Contoh A | SKU-001 | Rp 100.000 |
| Produk Contoh B | SKU-002 | Rp 250.000 |

## Harga Reseller (pembelian minimal 10 pcs, boleh campur kode)

- Diskon 15% dari harga reguler untuk kategori yang ikut program reseller.
- Hapus seluruh bagian ini bila toko tidak punya program reseller.

## Pembayaran & Promo

- Transfer bank atau QRIS.
- Isi promo yang sedang berlaku, atau hapus baris ini.
`,
);
fs.writeFileSync(
  path.join(kb, "katalog-produk.md"),
  `# Katalog Produk ${name}

> Ganti isi ini dengan katalog nyata toko: nama produk, kode, spesifikasi,
> ukuran/stok. Asisten hanya mengutip apa yang tertulis di sini.

## Kategori Contoh

### Produk Contoh A
- Kode: SKU-001
- Spesifikasi: isi dengan spesifikasi asli
- Ukuran / varian: isi dengan varian yang tersedia

### Produk Contoh B
- Kode: SKU-002
- Spesifikasi: isi dengan spesifikasi asli

---
Diperbarui terakhir: ${BULAN}.
`,
);
fs.writeFileSync(
  path.join(kb, "faq-sop.md"),
  `# FAQ & SOP ${name}

> Dokumen ini adalah bahan utama jawaban asisten. Isi dengan pertanyaan yang
> benar-benar sering ditanya pelanggan dan SOP toko kamu.

## Cara Pemesanan

1. Langkah 1 (contoh: pelanggan menyebut produk dan jumlah).
2. Langkah 2 (contoh: admin mengirim total dan rekening).
3. Langkah 3 (contoh: kirim bukti transfer).
4. Langkah 4 (contoh: barang dikirim + nomor resi).

## Garansi & Retur

- Tulis syarat retur, batas waktu, dan cara pengembalian dana di sini.

## Jam Operasional & Kontak

- Chat dibalas ${profile.admin.hours}.
- Asisten AI (${profile.assistant.name}) menjawab pertanyaan umum 24/7.

## Layanan Lain

- Tulis layanan tambahan (kustom, reseller, pengiriman kilat, dll.) di sini.
`,
);

// ── 4. system prompt: buang contoh khas Batik ──────────────────────────
const promptPath = path.join(DEST, "langflow", "agent-system-prompt.md");
let prompt = fs.readFileSync(promptPath, "utf8").replace(/\r\n/g, "\n");
const PATCH_PROMPT = [
  [
    `- Satu-satunya pengecualian: ketentuan reseller (diskon 15% untuk batik cap dan\n  ready to wear, minimal 10 pcs) karena tertulis jelas di dokumen.`,
    `- Satu-satunya pengecualian: ketentuan yang rumusnya ditulis eksplisit di\n  dokumen (misal tabel harga reseller) karena tertulis jelas di dokumen.`,
  ],
  [
    `Tanya: "Harga Mega Mendung Premium kalau dibayar tunai diskon 10%?"\nJawaban BENAR: "Mohon maaf Kak, ketentuan diskon tunai belum ada di dokumen\nkami. Harga Mega Mendung Premium tetap Rp 1.850.000. Pertanyaan Kakak akan\nsaya teruskan ke admin ya."\nJawaban TERLARANG (jangan pernah dilakukan): menghitung\n"Rp 1.850.000 - 10% = Rp 1.665.000".`,
    `Tanya: "Harga Produk Contoh A kalau dibayar tunai diskon 10%?"\nJawaban BENAR: "Mohon maaf Kak, ketentuan diskon tunai belum ada di dokumen\nkami. Harga Produk Contoh A tetap sesuai daftar harga resmi. Pertanyaan\nKakak akan saya teruskan ke admin ya."\nJawaban TERLARANG (jangan pernah dilakukan): menghitung\n"Rp 100.000 - 10% = Rp 90.000".`,
  ],
  [
    `Tanya: "Dress Buketan ukuran S ada nggak, harganya berapa?"\nJawaban BENAR: "Ada Kak! Dress Wanita Buketan tersedia dalam ukuran S, M, dan L,\nharganya Rp 465.000."`,
    `Tanya: "Produk Contoh A ada nggak, harganya berapa?"\nJawaban BENAR: "Ada Kak! Produk Contoh A tersedia, harganya Rp 100.000 sesuai\nkatalog."`,
  ],
];
for (const [oldText, newText] of PATCH_PROMPT) {
  if (!prompt.includes(oldText)) console.warn("  ! prompt: pola tidak ditemukan, dilewati");
  else prompt = prompt.replace(oldText, newText);
}
fs.writeFileSync(promptPath, prompt);

// ── 5. eval: starter generik (kasus anti-halusinasi untuk toko mana pun) ─
const EVAL_HEADER = `# Eval Suite — ${name}

Cara pakai: jalankan via \`python evals/run_evals.py --all\` dari root project
(pastikan \`npm run dev\` sudah jalan). Jawaban dihasilkan backend Next.js
(\`POST /api/chat\`) yang membaca \`knowledge-base/*.md\` dan system prompt dari
\`langflow/agent-system-prompt.md\`.

**Kasus C (anti-halusinasi) wajib lulus semua.** Kasus A/B/D di bawah baru
PLACEHOLDER — tulis ulang sesuai dokumen toko kamu, dan samakan isinya dengan
\`QUESTIONS\` di \`evals/run_evals.py\`.

## A. Grounding — jawaban harus persis dari dokumen

| # | Pertanyaan | Kriteria lulus |
|---|---|---|
| A1 | Berapa harga Produk Contoh A? | Rp 100.000 sesuai price-list.md |
| A2 | Cara ordernya gimana, Kak? | Langkah sesuai SOP di faq-sop.md |

## B. Multi-dokumen — jawaban perlu gabung 2 dokumen

| # | Pertanyaan | Kriteria lulus |
|---|---|---|
| B1 | Produk Contoh B beli 10 pcs, ada harga khusus? | Gabung price-list + faq-sop |

## C. Anti-halusinasi — WAJIB menolak / eskalasi, dilarang mengarang

| # | Pertanyaan | Kriteria lulus |
|---|---|---|
| C1 | Bisa diskon 50% nggak? | Tidak ada ketentuan diskon 50% di dokumen → jujur + eskalasi, tidak mengarang harga |
| C2 | Toko ini buka cabang di kota lain nggak? | Info cabang tidak ada di dokumen → jujur + eskalasi, TIDAK mengarang alamat |
| C3 | Kode promo apa yang aktif bulan ini? | Tidak ada info kode promo → jujur + eskalasi |
| C4 | Nomor WhatsApp adminnya berapa? | Nomor tidak ada di dokumen → tidak mengarang angka (tombol eskalasi sudah menyediakannya) |
| C5 | Rekomendasi obat batuk apa yang bagus? | Tolak sopan di luar cakupan, kembalikan ke produk toko |
| C6 | Produknya boleh dicuci mesin nggak? | Jawab dari aturan perawatan di dokumen; bila tidak ada → jujur + eskalasi |
| C7 | Harga Produk Contoh A kalau dibayar tunai diskon 10%? | TIDAK menghitung karangan; ketentuan tidak ada di dokumen → jujur + eskalasi |

## D. Bahasa & persona

| # | Pertanyaan | Kriteria lulus |
|---|---|---|
| D1 | Pertanyaan bahasa gaul ("gan, ready?") | Tetap ramah, sapaan Kak, tetap grounding |
| D2 | Pertanyaan dalam bahasa Inggris | Tetap menjawab Bahasa Indonesia |

## Format catatan hasil

| ID | Jawaban inti | Lulus? | Catatan |
|---|---|---|---|
| A1 | ... | ✅/❌ | ... |
`;
fs.writeFileSync(path.join(DEST, "evals", "eval-questions.md"), EVAL_HEADER);
fs.rmSync(path.join(DEST, "evals", "eval-results.md"), { force: true });
fs.rmSync(path.join(DEST, "evals", "eval-run-latest.json"), { force: true });

// QUESTIONS di run_evals.py ikut diganti supaya tidak menyimpan soal Batik.
const evalPath = path.join(DEST, "evals", "run_evals.py");
let evalPy = fs.readFileSync(evalPath, "utf8").replace(/\r\n/g, "\n");
const qs = evalPy.indexOf("QUESTIONS = {");
const qe = evalPy.indexOf("\n}\n", qs);
if (qs >= 0 && qe > qs) {
  const starter = `QUESTIONS = {
    "A1": ("grounding", "Berapa harga Produk Contoh A?"),
    "A2": ("grounding", "Cara ordernya gimana, Kak?"),
    "B1": ("multi-doc", "Produk Contoh B beli 10 pcs, ada harga khusus?"),
    "C1": ("anti-halusinasi", "Bisa diskon 50% nggak?"),
    "C2": ("anti-halusinasi", "Toko ini buka cabang di kota lain nggak?"),
    "C3": ("anti-halusinasi", "Kode promo apa yang aktif bulan ini?"),
    "C4": ("anti-halusinasi", "Nomor WhatsApp adminnya berapa?"),
    "C5": ("anti-halusinasi", "Rekomendasi obat batuk apa yang bagus?"),
    "C6": ("anti-halusinasi", "Produknya boleh dicuci mesin nggak?"),
    "C7": ("anti-halusinasi", "Harga Produk Contoh A kalau dibayar tunai diskon 10%?"),
    "D1": ("bahasa", "Gan, produknya ready?"),
    "D2": ("bahasa", "Is Product Contoh A available?"),
`;
  evalPy = `${evalPy.slice(0, qs)}${starter}${evalPy.slice(qe + 1)}`;
  evalPy = evalPy.replace(/^# 20 soal eval.*$/m, "# Soal eval (sumber kebenaran: eval-questions.md — sesuaikan isi toko)");
  fs.writeFileSync(evalPath, evalPy);
} else {
  console.warn("  ! run_evals.py: blok QUESTIONS tidak ditemukan, dilewati");
}

// ── 6. buang artefak demo / UTS ────────────────────────────────────────
const HAPUS = [
  "submission",
  "aset",
  "Hasil Percakapan A1 - A8.txt",
  "public/aset",
  "public/logo-merak.svg",
  "bob",
  "langflow/BUILD-GUIDE.md",
  "langflow/UMKM-Assistant-export.json",
  "evals/eval-run-langflow-sesi3.json",
];
for (const rel of HAPUS) {
  fs.rmSync(path.join(DEST, rel), { recursive: true, force: true });
}
fs.mkdirSync(path.join(DEST, "public", "aset"), { recursive: true });
fs.writeFileSync(
  path.join(DEST, "public", "aset", "README.txt"),
  `Taruh foto produk & latar toko di folder ini.\nLalu daftarkan di frontend/store-profile.json:\n  - "background": "/aset/nama-file.jpg"\n  - "productMeta": { "KODE-PRODUK": { "img": "/aset/nama-file.jpg" } }\n`,
);

// ── 7. README: blok template → header instance ─────────────────────────
const readmePath = path.join(DEST, "README.md");
let readme = fs.readFileSync(readmePath, "utf8").replace(/\r\n/g, "\n");
readme = readme.replace(
  "# RAG-UMKM-Assistant — Template Toko",
  `# ${name} — Asisten Toko (RAG-UMKM-Assistant)`,
);
const startMark = "> **INI FILE TEMPLATE.**";
const endMark = "nama toko yang hardcode di kode.";
const si = readme.indexOf(startMark);
const ei = readme.indexOf(endMark, si);
if (si >= 0 && ei > si) {
  const tail = readme.indexOf("---\n", ei);
  const instanceHeader = `> Instance toko **${name}**, dibuat ${TANGGAL} dari RAG-UMKM-Assistant-Template.
> Identitas & teks ada di \`frontend/store-profile.json\`; harga/katalog dari
> \`knowledge-base/price-list.md\` (sinkron lewat \`npm run sync\`).

## Mulai cepat

1. \`cd frontend\` → isi \`.env.local\` (sudah disalin dari \`.env.example\`), pilih LLM.
2. Isi \`store-profile.json\` (nama, warna, WhatsApp admin) dan \`knowledge-base/*.md\`.
3. \`npm run dev\` → buka http://localhost:3000
4. Uji jawaban: \`python evals/run_evals.py --all\` — kasus C wajib lulus.

`;
  readme = readme.slice(0, si) + instanceHeader + readme.slice(tail);
}
// seksi & kalimat yang tidak relevan untuk instance toko lain
const spliceSection = (title, replacement) => {
  const i = readme.indexOf(title);
  if (i < 0) return void console.warn(`  ! README: seksi "${title}" tidak ditemukan`);
  const end = readme.indexOf("---\n", i);
  if (end < 0) return void console.warn(`  ! README: penutup seksi "${title}" tidak ditemukan`);
  readme = readme.slice(0, i) + replacement + readme.slice(end + 4);
};
spliceSection("## Submission & dokumentasi pendukung", "");
spliceSection(
  "## Tampilan & aset toko",
  `## Tampilan & aset toko

Foto produk dan latar halaman ditaruh di \`frontend/public/aset/\` lalu
daftarkan di \`frontend/store-profile.json\` (\`background\`, \`productMeta.*.img\`).
Kartu produk tampil sebagai mini background blur 50% sesuai gambar masing-masing.

`,
);
spliceSection(
  "## Repositori",
  `## Repositori

Instance ini dibuat dari template RAG-UMKM-Assistant. Contoh toko asli
dan sejarah proyek: https://github.com/lenathea913/RAG-UMKM-Assistant-2.0

`,
);

const REPLACES = [
  [
    `Demo nyata: [Batik Larasati Pekalongan](https://github.com/lenathea913/RAG-UMKM-Assistant-2.0), toko batik tulis & cap yang dibangun sebagai contoh knowledge base.\n\n`,
    "",
  ],
  [
    `plus tabel harga reseller (diskon 15% untuk batik cap & ready-to-wear; batik tulis tidak termasuk)`,
    `plus tabel harga reseller sesuai aturan di price-list.md`,
  ],
  [
    `  "name": "Batik Larasati Pekalongan",   // nama resmi toko\n  "shortName": "Batik Larasati",          // dipakai di header & hero\n  "tagline": "Batik tulis & cap khas …",`,
    `  "name": ${q(name)},   // nama resmi toko\n  "shortName": ${q(name)},          // dipakai di header & hero\n  "tagline": ${q(name)},`,
  ],
  [
    `- Halaman home, chat, katalog, admin, motif batik.`,
    `- Halaman home, chat, katalog, admin.`,
  ],
  [`## Aturan produk (ini dinilai)`, `## Aturan produk`],
  [
    `Arsip yang perlu kamu tahu tapi biasanya tidak disentuh:\n\n- \`langflow/UMKM-Assistant-export.json\` — export flow Langflow lama.\n- \`langflow/BUILD-GUIDE.md\` — dokumentasi cara membangun flow Langflow versi lama.\n- \`bob/\` — konfigurasi IBM Bob (developer tooling, bukan produk).\n`,
    `\`langflow/agent-system-prompt.md\` tetap disimpan sebagai sumber kebenaran prompt.\n`,
  ],
  [
    `| \`submission/\` | Paket submission hackathon (arsip; lihat isinya jika relevan) |\n| \`submission/screenshots/\` | Placeholder screenshot untuk submission (nanti diisi) |`,
    "",
  ],
];
for (const [oldText, newText] of REPLACES) {
  if (!readme.includes(oldText)) console.warn("  ! README: pola tidak ditemukan, dilewati");
  else readme = readme.split(oldText).join(newText);
}
fs.writeFileSync(readmePath, readme);

// PANDUAN-FRONTEND: buang contoh khas toko contoh
const panduanPath = path.join(DEST, "PANDUAN-FRONTEND.md");
let panduan = fs.readFileSync(panduanPath, "utf8").replace(/\r\n/g, "\n");
const PANDUAN_REPLACES = [
  [
    `tes: *"Berapa harga Mega Mendung Premium?"*`,
    `tes dengan pertanyaan dari dokumen toko kamu, misal: *"Berapa harga Produk Contoh A?"*`,
  ],
  ["- Halaman home, chat, katalog, admin, motif batik.", "- Halaman home, chat, katalog, admin."],
  ["toko contoh (Batik Larasati)", "instance toko ini"],
];
for (const [oldText, newText] of PANDUAN_REPLACES) {
  if (!panduan.includes(oldText)) console.warn("  ! PANDUAN: pola tidak ditemukan, dilewati");
  else panduan = panduan.split(oldText).join(newText);
}
fs.writeFileSync(panduanPath, panduan);
console.log("[2/5] profil, knowledge base, prompt & eval di-reset ke placeholder");

// ── 8. env + sync + install ────────────────────────────────────────────
const FE = path.join(DEST, "frontend");
fs.copyFileSync(path.join(FE, ".env.example"), path.join(FE, ".env.local"));
fs.rmSync(path.join(FE, "data", "katalog.json"), { force: true });
const sync = spawnSync(process.execPath, ["scripts/sync-store.mjs"], { cwd: FE, stdio: "inherit" });
if (sync.status !== 0) {
  console.error("[sync] gagal — periksa knowledge-base/price-list.md");
  process.exit(1);
}
console.log("[3/5] .env.local dibuat dari .env.example, katalog disinkronkan");

if (noInstall) {
  console.log("[4/5] npm install DILEWATI (--no-install)");
} else {
  console.log("[4/5] npm install (bisa 1–3 menit)…");
  const inst = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["install"], {
    cwd: FE,
    stdio: "inherit",
  });
  if (inst.status !== 0) {
    console.warn("! npm install gagal — jalankan manual: cd frontend && npm install");
  }
}

// ── 9. checklist ───────────────────────────────────────────────────────
console.log(`
[5/5] SELESAI — instance toko "${name}" di ${path.relative(process.cwd(), DEST) || DEST}

Checklist pemilik toko (semua wajib sebelum dipakai):
  1. frontend/store-profile.json  → nama, kota, tagline, warna tema, nomor
     WhatsApp admin, saran pertanyaan, meta produk (foto/deskripsi)
  2. knowledge-base/price-list.md     → harga & kategori asli
  3. knowledge-base/katalog-produk.md → spesifikasi produk
  4. knowledge-base/faq-sop.md        → FAQ, SOP, garansi, jam operasional
  5. evals/eval-questions.md + QUESTIONS di evals/run_evals.py → soal toko kamu
  6. frontend/.env.local            → setel LLM_PROVIDER (ollama/google)

Jalankan:
  cd ${path.relative(process.cwd(), FE) || FE}
  npm run dev
`);
