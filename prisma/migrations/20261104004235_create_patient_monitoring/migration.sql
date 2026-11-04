-- CreateEnum
CREATE TYPE "MonitoringStatus" AS ENUM ('terkontrol', 'perlu_perhatian', 'terlambat', 'kritis');

-- AlterTable
ALTER TABLE "patient_visits" ADD COLUMN     "note" VARCHAR(500);

-- CreateTable
CREATE TABLE "patient_monitorings" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "program_name" VARCHAR(120) NOT NULL,
    "status" "MonitoringStatus" NOT NULL DEFAULT 'terkontrol',
    "checklist_percent" INTEGER NOT NULL DEFAULT 0,
    "baseline_ohis_score" DOUBLE PRECISION,
    "baseline_debris_index" DOUBLE PRECISION,
    "baseline_calculus_index" DOUBLE PRECISION,
    "scheduled_visit_at" TIMESTAMP(3),
    "scheduled_visit_note" VARCHAR(120),
    "confirmed_via_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "reminder_sent_at" TIMESTAMP(3),
    "doctor_note" VARCHAR(500),
    "validated_by_clinician" VARCHAR(120),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_monitorings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_monitorings_patient_id_key" ON "patient_monitorings"("patient_id");

-- CreateIndex
CREATE INDEX "patient_monitorings_status_idx" ON "patient_monitorings"("status");

-- CreateIndex
CREATE INDEX "patient_monitorings_scheduled_visit_at_idx" ON "patient_monitorings"("scheduled_visit_at");

-- AddForeignKey
ALTER TABLE "patient_monitorings" ADD CONSTRAINT "patient_monitorings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
