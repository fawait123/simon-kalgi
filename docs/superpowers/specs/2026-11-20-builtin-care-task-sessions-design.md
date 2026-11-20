# Spec: Checklist Bawaan 3x Sehari (Pagi/Siang/Malam) Tanpa Input Admin

Tanggal: 2026-11-20
Status: Disetujui user (desain bagian 1 & 2 + keputusan opsi A "lazy saja")

## Latar Belakang

Fitur care-task yang sedang berjalan (uncommitted) mengharuskan admin menginput
tugas perawatan per pasien lewat `CareTaskManager` di halaman admin monitoring;
pasien baru bisa mencentang checklist setelah tugas dibuat. Akibatnya pasien yang
belum mendapat input admin tidak punya checklist sama sekali.

## Tujuan

- Setiap pasien selalu punya checklist harian 3 sesi (pagi, siang, malam) tanpa
  perlu input admin apa pun.
- CRUD admin tetap berfungsi untuk **tugas tambahan** di luar 3 sesi bawaan.
- Teks dan jam sesi bawaan dikunci sistem: tidak dapat diedit/dihapus admin.

## Non-Tujuan

- Tidak ada tabel template global / editor teks bawaan (YAGNI).
- Tidak mengubah logika completion, streak, heatmap, metrics pasien.
- Tidak mengubah skema `CareTaskCompletion` (FK ke `care_tasks` tetap).

## Konten Sesi Bawaan

| Sesi | Judul | Instruksi baku | Jam |
|---|---|---|---|
| pagi | Perawatan pagi | Sikat gigi 2 menit setelah sarapan, bersihkan lidah, dan bilas dengan mouthwash. | 05:00–09:00 |
| siang | Perawatan siang | Bersihkan sela gigi setelah makan siang, lalu kumur dengan air putih. | 11:30–14:00 |
| malam | Perawatan malam | Sikat gigi 2 menit sebelum tidur dan gunakan benang gigi. | 19:00–22:00 |

Sumber kebenaran di kode: `shared/types/care-task.ts` mengekspor
`careTaskBuiltinTemplates` (array 3 objek: `session`, `title`, `instruction`,
`timeStart`, `timeEnd`). Migrasi backfill menyalin nilai yang sama secara literal
di SQL.

## Desain

### 1. Data model

`prisma/schema.prisma`, model `CareTask`:

```prisma
isBuiltin Boolean @default(false) @map("is_builtin")
```

Migrasi `add_builtin_care_tasks`:

1. `ALTER TABLE care_tasks ADD COLUMN is_builtin BOOLEAN NOT NULL DEFAULT false;`
2. Backfill: `INSERT INTO care_tasks (id, patient_id, session, title, instruction,
   time_start, time_end, is_builtin, created_at, updated_at)` dari
   `patients CROSS JOIN (VALUES ...)` 3 template, dengan guard `NOT EXISTS`
   (baris builtin pasien+sesi yang sama), sehingga idempoten. Kolom `id` memakai
   `gen_random_uuid()`.

### 2. Auto-ensure lazy (opsi A — disetujui)

`careTaskRepository.ensureBuiltinTasks(patientId)`:

- Query builtin milik pasien → tentukan sesi mana yang belum ada → insert yang
  kurang dari `careTaskBuiltinTemplates`.
- Dipanggil di awal `patientCareService.checklist()` sebelum `Promise.all` fetch
  lainnya, karena hasil ensure harus sudah terlihat oleh query tasks.
- Idempoten. Race dua request pertama bisa menghasilkan duplikat ringan;
  diterima tanpa unique constraint baru (perubahan minimal; dapat dibersihkan
  manual bila terjadi).
- **Konsekuensi yang diterima:** pasien yang belum pernah membuka checklist belum
  punya baris builtin; admin `CareTaskManager` akan menampilkan daftar kosong /
  tanpa builtin sampai pasien pertama kali login ke halaman kepatuhan.

### 3. Guard sisi admin

`careTaskService`:

- `update(id, ...)` dan `remove(id)`: bila baris `isBuiltin` →
  `createApiError(409, 'Tugas bawaan sistem tidak dapat diubah atau dihapus.')`.
- `CareTaskStaffDto` menambah field `isBuiltin: boolean`; `toDto` ikut memetakan.
- `list` tetap mengembalikan baris builtin (admin melihat persis isi checklist
  pasien).
- `create` tidak berubah.

### 4. UI admin — `CareTaskManager.vue`

- Baris `isBuiltin`: badge "Bawaan sistem" di kolom Sesi; tombol Edit/Hapus
  diganti ikon gembok disabled dengan tooltip "Tugas bawaan sistem tidak dapat
  diubah."
- Empty-state baru: menjelaskan 3 sesi harian (pagi/siang/malam) aktif otomatis
  dan muncul saat pasien pertama membuka checklist; tombol "Tambah Tugas" tetap.

### 5. UI pasien

Nol perubahan. Baris builtin dirender oleh `PatientCareSessionGroup` seperti task
biasa; status jam (menunggu/belum/terlewat) memakai `timeStart`/`timeEnd` bawaan.
Metrics otomatis menghitung 3 + jumlah tugas admin per hari.

## Penanganan Error

- Kegagalan ensure saat checklist → ditangani error state checklist yang sudah ada.
- 409 guard builtin → ditangani tampilan error/toast admin yang sudah ada (pola
  sama dengan blokir hapus task ber-riwayat).

## File yang Disentuh

| File | Perubahan |
|---|---|
| `prisma/schema.prisma` | field `isBuiltin` |
| `prisma/migrations/<ts>_add_builtin_care_tasks/` | kolom + backfill idempoten |
| `shared/types/care-task.ts` | `careTaskBuiltinTemplates`, `isBuiltin` di DTO |
| `server/repositories/care-task.repository.ts` | `ensureBuiltinTasks`, select `is_builtin` |
| `server/services/care-task.service.ts` | guard update/remove, DTO `isBuiltin` |
| `server/services/patient-care.service.ts` | panggil ensure di `checklist()` |
| `app/components/care-task/CareTaskManager.vue` | badge gembok, empty-state |

## Verifikasi

1. `pnpm prisma migrate dev` → `pnpm prisma generate`; `pnpm lint`; `pnpm typecheck`.
2. Manual:
   - Pasien lama (sudah ada sebelum migrasi): 3 baris builtin langsung ada.
   - Pasien baru: buka checklist pertama kali → 3 sesi tampil, bisa dicentang
     1x/hari; centang ulang / toggle hari lain ditolak sesuai aturan lama.
   - Admin monitoring: builtin tampil dengan gembok; edit/hapus via API → 409.
   - Tambah tugas admin → checklist pasien menampilkan gabungan builtin + tambahan.
