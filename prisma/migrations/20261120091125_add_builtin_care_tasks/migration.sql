-- AlterTable
ALTER TABLE "care_tasks" ADD COLUMN     "is_builtin" BOOLEAN NOT NULL DEFAULT false;

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
