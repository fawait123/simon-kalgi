# DentaCare Pro

Aplikasi manajemen klinik gigi berbasis Nuxt 3 — portal admin (kelola petugas, pasien, pemeriksaan, rekam medis, materi edukasi, monitoring) dan portal pasien (dashboard, checklist perawatan mandiri, rekam medis, edukasi kesehatan gigi).

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Nuxt 3 (Vue 3, `<script setup lang="ts">`) |
| Server API | Nitro (`server/api`) |
| Database | PostgreSQL + Prisma |
| UI | shadcn-vue + Tailwind CSS |
| Data fetching | TanStack Query |
| Validasi | Zod |
| Editor konten | TipTap (WYSIWYG, body materi edukasi disimpan sebagai HTML) |
| Package manager | pnpm |

Struktur folder, alur layer (Page → Composable → API → Service → Repository), dan konvensi penamaan mengikuti [AGENTS.md](./AGENTS.md).

## Setup

```bash
pnpm install
cp .env.example .env   # sesuaikan DATABASE_URL
pnpm prisma migrate dev
pnpm prisma generate
pnpm prisma db seed
```

Akun demo (admin, nakes, pasien) dapat dilihat di `prisma/seed.ts`.

## Development Server

```bash
pnpm dev
```

Buka `http://localhost:3000` — login terpisah untuk portal admin (`/admin`) dan portal pasien (`/pasien`).

## Quality Checks

```bash
pnpm lint
pnpm typecheck
```

## Production

```bash
pnpm build
pnpm preview
```

Untuk deployment: jalankan `pnpm prisma migrate deploy` sebelum memulai server produksi.

## Fitur Utama

- **Portal Admin** — data petugas kesehatan (CRUD), data pasien, pemeriksaan gigi & rekam medis (OHI-S, indeks kalkulus), pemantauan pasien, notifikasi, dan kelola materi edukasi (`/admin/edukasi`, khusus role admin).
- **Portal Pasien** — dashboard ringkasan (skor OHI-S, jadwal kontrol, kepatuhan), checklist perawatan mandiri harian, riwayat pemeriksaan, serta edukasi kesehatan gigi dengan pencarian/filter, bookmark lokal, dan halaman detail artikel.
