# AGENTS.md

Panduan wajib untuk semua AI agent yang menulis kode di repositori ini.
Ikuti aturan ini secara konsisten. Jika ada konflik antara aturan ini dan kebiasaan bawaan, **aturan ini yang menang**.

## 1. Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Nuxt 3 (Vue 3, Composition API, `<script setup lang="ts">`) |
| Server | Nitro (`server/api`) |
| Bahasa | TypeScript (strict mode) |
| Database | PostgreSQL |
| ORM | Prisma |
| UI | shadcn-vue (+ Tailwind CSS, Radix Vue / Reka UI) |
| Data fetching client | TanStack Query (`@tanstack/vue-query`) |
| Validasi | Zod |
| Package manager | pnpm |

Jangan menambahkan library baru yang fungsinya tumpang tindih (misalnya Axios, Pinia untuk server state, TypeORM, Drizzle, Vuetify, dll) tanpa persetujuan eksplisit.

## 2. Struktur Folder

Struktur ini baku. Jangan membuat folder baru di luar daftar ini tanpa alasan kuat.

```
.
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── server/
│   ├── api/                      # Route handler Nitro (tipis, hanya HTTP layer)
│   │   └── <resource>/
│   │       ├── index.get.ts      # list
│   │       ├── index.post.ts     # create
│   │       ├── [id].get.ts       # detail
│   │       ├── [id].patch.ts     # update
│   │       └── [id].delete.ts    # delete
│   ├── services/                 # Business logic: <resource>.service.ts
│   ├── repositories/             # Akses Prisma: <resource>.repository.ts
│   ├── schemas/                  # Zod schema server: <resource>.schema.ts
│   ├── middleware/
│   └── utils/
│       ├── prisma.ts             # Singleton PrismaClient
│       └── errors.ts             # Helper error terstandar
├── app/                          # (atau root jika tidak memakai srcDir)
│   ├── pages/
│   ├── layouts/
│   ├── components/
│   │   ├── ui/                   # Komponen shadcn-vue (JANGAN diedit manual kecuali perlu)
│   │   └── <feature>/            # Komponen per fitur, mis. components/user/UserTable.vue
│   ├── composables/
│   │   └── queries/              # TanStack Query hooks: use<Resource>Queries.ts
│   ├── lib/
│   │   ├── utils.ts              # cn() helper shadcn
│   │   └── query-keys.ts         # Query key factory
│   ├── plugins/
│   │   └── vue-query.ts
│   └── types/
├── shared/                       # Dipakai client & server
│   ├── schemas/                  # Zod schema bersama (form + API)
│   └── types/
├── tests/
├── .env.example
├── components.json               # Konfigurasi shadcn-vue
├── nuxt.config.ts
└── AGENTS.md
```

### Alur layer (wajib)

```
Page/Component → Composable (TanStack Query) → $fetch → server/api handler
                                                          ↓
                                                      Service → Repository → Prisma → PostgreSQL
```

- Route handler **tidak boleh** memanggil Prisma langsung. Lewat service → repository.
- Komponen **tidak boleh** memanggil `$fetch`/`useFetch` langsung untuk data server. Gunakan composable TanStack Query.
- Service tidak boleh mengimpor apa pun dari `h3` (tidak tahu soal HTTP).

## 3. Konvensi Penamaan

| Jenis | Aturan | Contoh |
|---|---|---|
| Folder & file umum | `kebab-case` | `query-keys.ts` |
| Komponen Vue | `PascalCase.vue` | `UserTable.vue` |
| Composable | `useXxx.ts` (camelCase) | `useUserQueries.ts` |
| Service | `<resource>.service.ts` | `user.service.ts` |
| Repository | `<resource>.repository.ts` | `user.repository.ts` |
| Schema Zod | `<resource>.schema.ts`, variabel `xxxSchema` | `createUserSchema` |
| Tipe TS | `PascalCase` | `CreateUserInput` |
| Model Prisma | `PascalCase` singular | `User`, `OrderItem` |
| Kolom Prisma | `camelCase`, dengan `@map("snake_case")` | `createdAt @map("created_at")` |
| Tabel Prisma | `@@map("snake_case_plural")` | `@@map("users")` |
| Endpoint | resource plural, kebab-case | `/api/order-items` |

Gunakan **bahasa Inggris** untuk nama variabel, fungsi, dan file. Komentar boleh Bahasa Indonesia atau Inggris, tetapi konsisten dalam satu file.

## 4. Database & Prisma

- Satu-satunya sumber kebenaran skema adalah `prisma/schema.prisma`.
- Perubahan skema **selalu** lewat migrasi:
  - Dev: `pnpm prisma migrate dev --name <deskripsi_singkat>`
  - Production: `pnpm prisma migrate deploy`
  - Jangan memakai `prisma db push` untuk perubahan permanen.
- Jangan mengedit file di `prisma/migrations/` yang sudah ter-commit.
- Setiap model wajib punya:
  ```prisma
  id        String   @id @default(uuid()) @db.Uuid
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  ```
- Tambahkan `@@index` untuk kolom yang sering difilter/di-join. Foreign key harus eksplisit dengan `onDelete` yang disengaja.
- Gunakan singleton PrismaClient dari `server/utils/prisma.ts`. Jangan `new PrismaClient()` di tempat lain.
- Gunakan `select`/`include` secara eksplisit; jangan mengembalikan seluruh model jika ada field sensitif (mis. `passwordHash`).
- Transaksi multi-langkah memakai `prisma.$transaction`.
- Hindari raw query (`$queryRaw`) kecuali benar-benar perlu (agregasi kompleks, JSONB). Jika dipakai, gunakan tagged template agar aman dari SQL injection.
- Setelah mengubah skema, jalankan `pnpm prisma generate`.

### Repository pattern

```ts
// server/repositories/user.repository.ts
import { prisma } from '~~/server/utils/prisma'
import type { Prisma } from '@prisma/client'

export const userRepository = {
  findMany: (args?: Prisma.UserFindManyArgs) => prisma.user.findMany(args),
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  create: (data: Prisma.UserCreateInput) => prisma.user.create({ data }),
  update: (id: string, data: Prisma.UserUpdateInput) =>
    prisma.user.update({ where: { id }, data }),
  delete: (id: string) => prisma.user.delete({ where: { id } }),
}
```

## 5. Server API (Nitro)

- Satu file per method HTTP: `index.get.ts`, `index.post.ts`, `[id].patch.ts`, dst.
- Handler harus tipis: validasi → panggil service → return.
- **Selalu validasi input** dengan Zod:
  ```ts
  // server/api/users/index.post.ts
  import { createUserSchema } from '~~/shared/schemas/user.schema'
  import { userService } from '~~/server/services/user.service'

  export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, createUserSchema.parse)
    return userService.create(body)
  })
  ```
- Gunakan `createError({ statusCode, statusMessage, data })` untuk error. Jangan `throw new Error()` mentah dari handler.
- Format response sukses konsisten:
  - List: `{ data: T[], meta: { page, pageSize, total } }`
  - Detail/create/update: `{ data: T }`
  - Delete: `{ data: { id } }`
- Status code: `200` GET/PATCH, `201` POST, `204` atau `200` DELETE, `400` validasi, `401/403` auth, `404` tidak ditemukan, `409` konflik.
- Secret hanya dibaca dari `useRuntimeConfig()` di server. Jangan hardcode.

## 6. Validasi (Zod)

- Schema yang dipakai form **dan** API ditaruh di `shared/schemas/`.
- Turunkan tipe dengan `z.infer`, jangan menulis tipe ganda secara manual:
  ```ts
  export const createUserSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1).max(100),
  })
  export type CreateUserInput = z.infer<typeof createUserSchema>
  export const updateUserSchema = createUserSchema.partial()
  ```

## 7. TanStack Query (Client)

- Setup di `app/plugins/vue-query.ts` (QueryClient + `VueQueryPlugin`), dengan `staleTime` default yang masuk akal (mis. 30 detik) dan `retry` terbatas.
- **Semua query key lewat key factory** di `app/lib/query-keys.ts`. Dilarang menulis array key literal di komponen.
  ```ts
  export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...userKeys.lists(), params] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
  }
  ```
- Satu file composable per resource: `app/composables/queries/useUserQueries.ts`, mengekspor:
  `useUsersQuery`, `useUserQuery`, `useCreateUserMutation`, `useUpdateUserMutation`, `useDeleteUserMutation`.
- Setiap mutation **wajib** meng-invalidate key terkait di `onSuccess`.
- Gunakan `$fetch` (bukan Axios) sebagai fetcher di dalam `queryFn`/`mutationFn`.
- Pakai `computed`/`ref` untuk parameter reaktif agar query otomatis refetch.
- Gunakan state bawaan: `isPending`, `isError`, `error`, `data`. Jangan membuat `loading` ref manual.
- Untuk SSR, gunakan `useQuery` dengan hydration yang sudah di-setup di plugin; jangan mencampur `useFetch`/`useAsyncData` untuk data yang sama.

```ts
// app/composables/queries/useUserQueries.ts
export function useUsersQuery(params: MaybeRef<{ page: number }>) {
  return useQuery({
    queryKey: computed(() => userKeys.list(unref(params))),
    queryFn: () => $fetch('/api/users', { query: unref(params) }),
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateUserInput) =>
      $fetch('/api/users', { method: 'POST', body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
  })
}
```

## 8. UI (shadcn-vue + Tailwind)

- Tambahkan komponen shadcn **hanya** lewat CLI: `pnpm dlx shadcn-vue@latest add <component>`. Hasilnya masuk ke `app/components/ui/`.
- Jangan menulis ulang komponen dasar (Button, Input, Dialog, Table, dll) yang sudah tersedia di shadcn. Komposisikan saja.
- Komponen fitur ditaruh di `app/components/<feature>/` dan dibangun dari komponen `ui/`.
- Styling hanya dengan utility Tailwind + `cn()` dari `app/lib/utils.ts`. Hindari `<style>` kustom kecuali terpaksa.
- Warna memakai token tema (`bg-background`, `text-foreground`, `bg-primary`, dst), bukan warna hardcode (`bg-blue-500`).
- Form: shadcn `Form` + `vee-validate` dengan `@vee-validate/zod`, memakai schema dari `shared/schemas/`.
- Ikon: `lucide-vue-next`.
- Wajib menangani tiga state di UI data: **loading** (Skeleton), **error**, dan **empty**.
- Pastikan aksesibilitas dasar: label pada input, `aria-*` bila perlu, fokus yang terlihat.

## 9. Pola Komponen Vue

- Selalu `<script setup lang="ts">`. Urutan blok: `<script setup>` → `<template>` → `<style>` (jika ada).
- Props dengan `defineProps<{...}>()`, emits dengan `defineEmits<{...}>()`.
- Hindari `any`. Gunakan `unknown` + narrowing bila tipe tidak jelas.
- Nuxt auto-import dipakai untuk `ref`, `computed`, composable, dan komponen. Jangan mengimpor ulang secara manual tanpa alasan.
- Halaman (`pages/`) hanya merakit komponen dan memanggil composable; logika UI yang besar dipindah ke komponen/composable.

## 10. Environment & Konfigurasi

- Semua variabel env didokumentasikan di `.env.example` (tanpa nilai rahasia).
- Variabel server diakses lewat `runtimeConfig` (private); hanya yang aman untuk publik di `runtimeConfig.public`.
- Minimal: `DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"`.
- Jangan pernah commit `.env`.

## 11. Perintah Standar

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck               # nuxi typecheck
pnpm prisma generate
pnpm prisma migrate dev --name <nama>
pnpm prisma migrate deploy
pnpm prisma db seed
pnpm prisma studio
```

## 12. Checklist Menambah Fitur/Resource Baru

Ikuti urutan ini setiap membuat resource baru (contoh: `product`):

1. Tambah model di `prisma/schema.prisma` → `prisma migrate dev` → `prisma generate`.
2. Buat Zod schema di `shared/schemas/product.schema.ts`.
3. Buat `server/repositories/product.repository.ts`.
4. Buat `server/services/product.service.ts`.
5. Buat route handler di `server/api/products/` (`index.get/post`, `[id].get/patch/delete`).
6. Tambah key factory `productKeys` di `app/lib/query-keys.ts`.
7. Buat `app/composables/queries/useProductQueries.ts`.
8. Buat komponen di `app/components/product/` dan halaman di `app/pages/products/`.
9. Tambahkan komponen shadcn yang dibutuhkan via CLI.
10. Jalankan `pnpm lint` dan `pnpm typecheck` sampai bersih.

## 13. Aturan Umum untuk Agent

- **Baca dulu** file yang relevan dan ikuti pola yang sudah ada sebelum menulis kode baru.
- Buat perubahan **minimal dan terfokus**; jangan refactor di luar permintaan.
- Jangan membuat file/folder di lokasi yang tidak sesuai struktur di atas. Jika ragu, tanyakan.
- Jangan menambahkan dependensi baru tanpa konfirmasi.
- Jangan menghapus atau melewati validasi, tipe, atau penanganan error demi "cepat jalan".
- Jangan menaruh secret, token, atau kredensial di kode.
- Tulis kode yang sudah lolos lint dan typecheck sebelum dianggap selesai.
- Setelah selesai, ringkas file apa saja yang dibuat/diubah dan perintah yang perlu dijalankan (mis. migrasi).