# Checklist Bawaan 3x Sehari (Pagi/Siang/Malam) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pasien selalu punya checklist harian 3 sesi bawaan (pagi/siang/malam) tanpa input admin; CRUD admin menjadi tugas tambahan opsional.

**Architecture:** Tambah flag `isBuiltin` di model `CareTask` yang sudah ada. Baris builtin dibuat lewat migrasi backfill untuk pasien existing dan lewat `ensureBuiltinTasks` lazy saat pasien membuka checklist. Sisi admin hanya dapat membaca (edit/hapus builtin diveto 409 di service). Checklist pasien, completion, streak, dan metrics tidak berubah karena baris builtin adalah task biasa.

**Tech Stack:** Nuxt 3 + Nitro, Prisma/PostgreSQL (Supabase), Zod, TanStack Query, shadcn-vue.

**Spec:** `docs/superpowers/specs/2026-11-20-builtin-care-task-sessions-design.md`

**Catatan penting sebelum mulai:**

- Repo TIDAK punya test runner (tidak ada vitest/tests). Verifikasi per tugas memakai `pnpm lint`, `pnpm typecheck`, SQL langsung, dan alur manual — bukan unit test. Jangan menambahkan dependensi test tanpa persetujuan user.
- Seluruh file care-task saat ini masih untracked/modified (Pekerjaan Dalam Proses user). `git add <file>` pada tugas berikutnya otomatis ikut meng-commit WIP feature tersebut — ini disengaja karena fitur ini satu kesatuan. JANGAN pakai `git add -A`; file di luar daftar tugas tidak boleh ikut.
- DATABASE_URL menunjuk DB Supabase dev. Jalankan migrasi hanya saat diminta user; konfirmasi dulu sebelum `pnpm prisma migrate dev`.

---

### Task 1: Skema Prisma — field `isBuiltin`

**Files:**
- Modify: `prisma/schema.prisma` (model `CareTask`, ±baris 349)

- [ ] **Step 1: Tambah field di model `CareTask`**

Di dalam `model CareTask { ... }`, tambah tepat setelah baris `session CareTaskSession`:

```prisma
  /// Sesi bawaan sistem (pagi/siang/malam): dibuat otomatis, dikunci dari CRUD admin.
  isBuiltin   Boolean         @default(false) @map("is_builtin")
```

- [ ] **Step 2: Generate client**

Run: `pnpm prisma generate`
Expected: `Generated Prisma Client` tanpa error.

- [ ] **Step 3: Lint + typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: lolos (field baru default opsional di tipe, belum dipakai siapa pun).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(care-task): add is_builtin flag to CareTask"
```

---

### Task 2: Migrasi + backfill 3 sesi bawaan untuk pasien existing

**Files:**
- Create: `prisma/migrations/<timestamp>_add_builtin_care_tasks/migration.sql` (nama folder diisi Prisma saat `migrate dev --create-only`)

- [ ] **Step 1: Buat migrasi kosong untuk diedit dulu**

Run: `pnpm prisma migrate dev --name add_builtin_care_tasks --create-only`
Expected: folder migrasi baru dibuat, perubahan BELUM diterapkan. **Konfirmasi user dulu sebelum langkah ini bila DB yang tersambung bukan DB dev.**

- [ ] **Step 2: Tambah SQL backfill di dalam `migration.sql`**

Biarkan SQL hasil Prisma (ALTER TABLE `is_builtin` + komentar) di atas, lalu append di bawahnya:

```sql
-- Backfill: 3 tugas bawaan (pagi/siang/malam) untuk setiap pasien yang belum punya.
-- Nilai HARUS sama dengan careTaskBuiltinTemplates di shared/types/care-task.ts.
INSERT INTO "care_tasks" ("id", "patient_id", "session", "title", "instruction", "time_start", "time_end", "is_builtin", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  p."id",
  s."session",
  s."title",
  s."instruction",
  s."time_start",
  s."time_end",
  true,
  now(),
  now()
FROM "patients" p
CROSS JOIN (VALUES
  ('pagi'::"CareTaskSession", 'Perawatan pagi', 'Sikat gigi 2 menit setelah sarapan, bersihkan lidah, dan bilas dengan mouthwash.', '05:00', '09:00'),
  ('siang'::"CareTaskSession", 'Perawatan siang', 'Bersihkan sela gigi setelah makan siang, lalu kumur dengan air putih.', '11:30', '14:00'),
  ('malam'::"CareTaskSession", 'Perawatan malam', 'Sikat gigi 2 menit sebelum tidur dan gunakan benang gigi.', '19:00', '22:00')
) AS s("session", "title", "instruction", "time_start", "time_end")
WHERE NOT EXISTS (
  SELECT 1 FROM "care_tasks" ct
  WHERE ct."patient_id" = p."id" AND ct."is_builtin" AND ct."session" = s."session"
);
```

- [ ] **Step 3: Terapkan migrasi**

Run: `pnpm prisma migrate dev`
Expected: migrasi applied; output Prisma menyebut `add_builtin_care_tasks`.

- [ ] **Step 4: Verifikasi backfill via SQL**

Run: `pnpm prisma db execute --stdin <<< 'SELECT count(DISTINCT "patient_id") AS patients_with_builtin, count(*) AS builtin_rows FROM "care_tasks" WHERE "is_builtin";'`
atau lewat `pnpm prisma studio`.
Expected: `builtin_rows = 3 × jumlah pasien` (0 pasien → 0 baris, tetap valid).

- [ ] **Step 5: Commit**

```bash
git add prisma/migrations
git commit -m "feat(care-task): backfill builtin 3x daily sessions per patient"
```

---

### Task 3: Sumber kebenaran template + DTO

**Files:**
- Modify: `shared/types/care-task.ts`

- [ ] **Step 1: Tambah template bawaan dan field DTO**

Seluruh isi file setelah perubahan:

```ts
import type { CareTaskSession } from '~~/shared/schemas/patient-care.schema'

export interface CareTaskBuiltinTemplate {
  session: CareTaskSession
  title: string
  instruction: string
  timeStart: string
  timeEnd: string
}

/**
 * Satu-satunya sumber kebenaran teks/jam sesi bawaan. Nilai migrasi backfill
 * (`add_builtin_care_tasks`) menyalin tabel ini secara literal dan harus tetap sama.
 */
export const careTaskBuiltinTemplates: CareTaskBuiltinTemplate[] = [
  {
    session: 'pagi',
    title: 'Perawatan pagi',
    instruction: 'Sikat gigi 2 menit setelah sarapan, bersihkan lidah, dan bilas dengan mouthwash.',
    timeStart: '05:00',
    timeEnd: '09:00',
  },
  {
    session: 'siang',
    title: 'Perawatan siang',
    instruction: 'Bersihkan sela gigi setelah makan siang, lalu kumur dengan air putih.',
    timeStart: '11:30',
    timeEnd: '14:00',
  },
  {
    session: 'malam',
    title: 'Perawatan malam',
    instruction: 'Sikat gigi 2 menit sebelum tidur dan gunakan benang gigi.',
    timeStart: '19:00',
    timeEnd: '22:00',
  },
]

export interface CareTaskStaffDto {
  id: string
  patientId: string
  session: CareTaskSession
  title: string
  instruction: string
  timeStart: string
  timeEnd: string
  /** Tugas bawaan sistem: diblokir dari edit/hapus di service, ditampilkan terkunci di UI. */
  isBuiltin: boolean
  /** Jumlah centang yang pernah dilakukan pasien; dipakai UI untuk memblokir hapus. */
  completionCount: number
}

export interface CareTaskListResponse {
  data: CareTaskStaffDto[]
  meta: { page: number, pageSize: number, total: number }
}
```

- [ ] **Step 2: Lint**

Run: `pnpm lint shared/types/care-task.ts`
Expected: lolos. (`pnpm typecheck` sengaja ditunda ke Task 5: `toDto` service belum memetakan `isBuiltin` sehingga typecheck penuh baru bersih setelah Task 4-5.)

- [ ] **Step 3: Commit**

```bash
git add shared/types/care-task.ts
git commit -m "feat(care-task): add builtin session templates and isBuiltin DTO"
```

---

### Task 4: Repository — `ensureBuiltinTasks` + select & delete guard `isBuiltin`

**Files:**
- Modify: `server/repositories/care-task.repository.ts`

- [ ] **Step 1: Pilih kolom `isBuiltin` di select admin**

Tambah `isBuiltin: true` pada spread select (field belum ada di `careTaskSelect` milik patient-care.repository, jadi declare eksplisit):

```ts
export const careTaskAdminSelect = {
  ...careTaskSelect,
  isBuiltin: true,
  _count: { select: { completions: true } },
} satisfies Prisma.CareTaskSelect
```

- [ ] **Step 2: Tambah `ensureBuiltinTasks` di `careTaskRepository`**

Tambahkan method baru (import `careTaskBuiltinTemplates` dari `~~/shared/types/care-task` di header file):

```ts
  /**
   * Lazy-create sesi bawaan yang belum ada untuk pasien ini. Idempoten; race dua
   * request pertama sengaja ditoleransi (duplikat ringan, tanpa unique constraint baru).
   */
  ensureBuiltinTasks: (patientId: string) =>
    prisma.$transaction(async (tx) => {
      const existing = await tx.careTask.findMany({
        where: { patientId, isBuiltin: true },
        select: { session: true },
      })
      const done = new Set(existing.map(row => row.session))
      const missing = careTaskBuiltinTemplates.filter(template => !done.has(template.session))
      if (missing.length === 0) return
      await tx.careTask.createMany({
        data: missing.map(template => ({ ...template, patientId, isBuiltin: true })),
      })
    }),
```

- [ ] **Step 3: Veto builtin di `deleteIfNoCompletions`**

Ganti seluruh method sehingga `isBuiltin: false` ikut dievaluasi DB dalam statement yang sama:

```ts
  deleteIfNoCompletions: (id: string) =>
    prisma.$transaction(async (tx) => {
      const deleted = await tx.careTask.deleteMany({
        where: { id, isBuiltin: false, completions: { none: {} } },
      })
      if (deleted.count > 0) return { deleted: true as const }

      const task = await tx.careTask.findUnique({
        where: { id },
        select: {
          id: true,
          isBuiltin: true,
          _count: { select: { completions: true } },
        },
      })
      if (!task) return { deleted: false as const, reason: 'not_found' as const }
      if (task.isBuiltin) return { deleted: false as const, reason: 'builtin' as const }
      return {
        deleted: false as const,
        reason: 'has_completions' as const,
        completionCount: task._count.completions,
      }
    }),
```

- [ ] **Step 4: Lint**

Run: `pnpm lint server/repositories/care-task.repository.ts`
Expected: lolos.

- [ ] **Step 5: Commit**

```bash
git add server/repositories/care-task.repository.ts
git commit -m "feat(care-task): ensure builtin tasks and veto builtin deletes in repository"
```

---

### Task 5: Service admin — guard update/remove + DTO `isBuiltin`

**Files:**
- Modify: `server/services/care-task.service.ts`

- [ ] **Step 1: Petakan `isBuiltin` di `toDto`**

Tambah di objek return `toDto`, setelah `timeEnd`:

```ts
    isBuiltin: row.isBuiltin,
```

- [ ] **Step 2: Veto builtin di `update`**

Ganti badan `update`:

```ts
  async update(id: string, input: UpdateCareTaskInput) {
    const existing = await careTaskRepository.findById(id)
    if (!existing) throw createApiError(404, 'Tugas perawatan tidak ditemukan.')
    if (existing.isBuiltin)
      throw createApiError(409, 'Tugas bawaan sistem tidak dapat diubah atau dihapus.')

    return toDto(await careTaskRepository.update(id, input))
  },
```

- [ ] **Step 3: Tangani reason `builtin` di `remove`**

Sisipkan sebelum cek `has_completions` (setelah `not_found`):

```ts
    if (result.reason === 'builtin')
      throw createApiError(409, 'Tugas bawaan sistem tidak dapat diubah atau dihapus.')
```

- [ ] **Step 4: Typecheck penuh**

Run: `pnpm typecheck`
Expected: lolos — error DTO Task 3 selesai di sini.

- [ ] **Step 5: Verifikasi API guard (server dev harus jalan)**

Run: `pnpm dev` (latar belakang), lalu dengan token admin yang tersimpan di DB dev, ambil `id` builtin salah satu pasien via:

```bash
curl -s "$BASE_URL/api/care-tasks?patientId=$PID" -H "Cookie: $ADMIN_COOKIE" | head -c 400
curl -s -X PATCH "$BASE_URL/api/care-tasks/$BUILTIN_ID" -H "Content-Type: application/json" -H "Cookie: $ADMIN_COOKIE" \
  -d '{"session":"pagi","title":"x","instruction":"y","timeStart":"05:00","timeEnd":"09:00"}'
curl -s -X DELETE "$BASE_URL/api/care-tasks/$BUILTIN_ID" -H "Cookie: $ADMIN_COOKIE"
```

Expected: list menampilkan `"isBuiltin":true` untuk 3 baris builtin; PATCH dan DELETE sama-sama mengembalikan status 409 dengan pesan `Tugas bawaan sistem tidak dapat diubah atau dihapus.`

- [ ] **Step 6: Commit**

```bash
git add server/services/care-task.service.ts
git commit -m "feat(care-task): block edit/delete of builtin tasks in admin service"
```

---

### Task 6: Lazy-ensure di checklist pasien

**Files:**
- Modify: `server/services/patient-care.service.ts` (method `checklist`, ±baris 189-199)

- [ ] **Step 1: Panggil ensure sebelum fetch paralel**

Import di header file:

```ts
import { careTaskRepository } from '~~/server/repositories/care-task.repository'
```

Ganti blok pembuka `checklist` sehingga Promise.all berjalan SETELAH ensure (hasil ensure harus terlihat query tasks):

```ts
  async checklist(patientId: string): Promise<CareChecklistDto> {
    const now = new Date()
    const today = wibKeyOf(now)
    // Jendela 34 hari menutup heatmap 28 hari, minggu berjalan, dan minggu sebelumnya sekali jalan.
    const windowStart = dayOffsetKey(today, -(CARE_HEAT_WINDOW_DAYS + 6))

    // Pasien baru belum punya baris builtin sampai pertama kali membuka halaman ini.
    await careTaskRepository.ensureBuiltinTasks(patientId)

    const [patient, tasks, completions] = await Promise.all([
```

Sisanya tidak berubah.

- [ ] **Step 2: Verifikasi manual alur pasien**

Dengan akun pasien dev (atau buat pasien baru via admin):

1. SQL: `SELECT count(*) FROM care_tasks WHERE "patient_id" = '<pasien baru>' AND "is_builtin";` → 0.
2. Login pasien → buka `/pasien/kepatuhan`.
3. Ulangi SQL → 3. Checklist menampilkan grup Pagi/Siang/Malam berisi 3 tugas bawaan; centang bekerja (1x/hari) dan metrik minggu/streak menghitung dari 3 tugas.

Expected: seperti di atas; error state checklist tidak terpicu.

- [ ] **Step 3: Lint + typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: lolos.

- [ ] **Step 4: Commit**

```bash
git add server/services/patient-care.service.ts
git commit -m "feat(care-task): auto-ensure builtin sessions when patient opens checklist"
```

---

### Task 7: UI admin — baris builtin terkunci + empty-state baru

**Files:**
- Modify: `app/components/care-task/CareTaskManager.vue`

- [ ] **Step 1: Badge "Bawaan sistem" di kolom Sesi**

Di `TableCell` pertama body row, setelah elemen `span` badge sesi yang ada, tambahkan:

```html
                <p v-if="task.isBuiltin" class="mt-1 inline-flex items-center gap-1 font-caption text-caption text-text-muted">
                  <Lock class="size-3" aria-hidden="true" />
                  Bawaan sistem
                </p>
```

Tambahkan `Lock` pada import lucide (baris 3):

```ts
import { ListChecks, Lock, Pencil, Plus, RotateCcw, SearchX, Trash2 } from 'lucide-vue-next'
```

- [ ] **Step 2: Ganti aksi Edit/Hapus dengan gembok untuk builtin**

Bungkus kolom Aksi: untuk `task.isBuiltin` tampilkan tooltip gembok disabled, selain itu render tombol lama apa adanya.

```html
              <TableCell class="align-top">
                <div class="flex items-center justify-end gap-1">
                  <Tooltip v-if="task.isBuiltin">
                    <TooltipTrigger as-child>
                      <span tabindex="0" class="inline-flex">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          class="size-8 rounded-lg text-text-muted opacity-60"
                          aria-label="Tugas bawaan sistem terkunci"
                          disabled
                        >
                          <Lock class="size-[18px]" aria-hidden="true" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="left" class="max-w-64">
                      Tugas bawaan sistem tidak dapat diubah atau dihapus.
                    </TooltipContent>
                  </Tooltip>

                  <template v-else>
                    <!-- tombol Pencil dan blok hapus (Tooltip/Trash2) yang sudah ada, tidak diubah -->
                  </template>
                </div>
              </TableCell>
```

- [ ] **Step 3: Ubah copy header dan empty-state**

Ganti kalimat paragraf deskripsi (`Tugas berulang setiap hari...`) menjadi:

```html
            Instruksi harian untuk
            <span class="font-semibold text-text-primary">{{ patientName }}</span>
            ({{ medicalRecordNo }}) yang muncul pada checklist pasien. Tiga sesi harian
            (pagi, siang, malam) sudah aktif otomatis sebagai tugas bawaan; tugas berulang
            hanya dapat dicentang pada tanggal berjalan.
```

Ganti isi blok empty-state (`Belum ada tugas perawatan`) — paragraf dan tombolnya:

```html
                <span class="font-headline-sm text-headline-sm text-text-primary">Belum ada tugas tambahan</span>
                <p class="max-w-md font-body-md text-body-md text-text-secondary">
                  Checklist pasien sudah memuat tiga sesi harian bawaan (pagi, siang, malam) yang tampil
                  otomatis saat pasien pertama kali membuka checklist. Tambahkan tugas khusus di luar itu
                  bila perlu.
                </p>
                <Button type="button" variant="outline" class="gap-2 rounded-lg" @click="openCreate">
                  <Plus class="size-4" aria-hidden="true" />
                  Tambah Tugas Tambahan
                </Button>
```

- [ ] **Step 4: Lint + typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: lolos.

- [ ] **Step 5: Verifikasi visual**

Buka `/admin/monitoring` → detail pasien → panel Tugas Perawatan Mandiri: 3 baris builtin tampil dengan badge gembok tanpa tombol edit/hapus; tugas admin biasa tetap dapat diedit/dihapus seperti sebelumnya.

- [ ] **Step 6: Commit**

```bash
git add app/components/care-task/CareTaskManager.vue
git commit -m "feat(care-task): lock builtin rows and clarify manager empty state"
```

---

### Task 8: Verifikasi akhir menyeluruh

- [ ] **Step 1: Gerbang kualitas**

Run: `pnpm lint && pnpm typecheck`
Expected: keduanya lolos bersih.

- [ ] **Step 2: Skenario end-to-end (dev server + DB dev)**

1. Pasien lama (ter-backfill migrasi): checklist menampilkan 3 sesi; riwayat centang lama tetap utuh.
2. Pasien baru dibuat admin → belum pernah buka checklist: panel admin menampilkan daftar kosong + empty-state baru; setelah pasien login dan membuka `/pasien/kepatuhan`, 3 builtin muncul dan dapat dicentang; panel admin kini menampilkan 3 baris builtin terkunci.
3. Admin menambah tugas tambahan → muncul di grup sesi yang sesuai pada checklist pasien; metrik `today.total` ikut bertambah.
4. Hapus tugas admin biasa yang sudah punya riwayat → tetap diblokir 409 (regresi guard lama).
5. Toggle centang builtin di hari kemarin → tetap ditolak (kunci hari berjalan tidak berubah).

- [ ] **Step 3: Tutup diff**

Pastikan `git status` hanya menyisakan perubahan di luar scope rencana ini (`app/pages/admin/monitoring.vue`, `app/lib/query-keys.ts`, `server/utils/prisma.ts`, komponen/form/dialog care-task WIP yang tidak diubah) dan tidak ada file temporari.
