-- CreateEnum
CREATE TYPE "ToothCondition" AS ENUM ('sehat', 'karies', 'tambalan', 'mahkota', 'hilang');

-- CreateEnum
CREATE TYPE "IndexSurface" AS ENUM ('buccal', 'labial', 'lingual', 'palatal');

-- CreateEnum
CREATE TYPE "HeartRhythm" AS ENUM ('reguler', 'tidak_reguler');

-- CreateEnum
CREATE TYPE "ExaminationStatus" AS ENUM ('draft', 'final');

-- CreateTable
CREATE TABLE "examinations" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "examiner_id" UUID,
    "examiner_name" VARCHAR(120) NOT NULL,
    "exam_date" DATE NOT NULL,
    "chief_complaint" VARCHAR(600) NOT NULL,
    "blood_pressure" VARCHAR(20),
    "heart_rate" INTEGER,
    "heartRhythm" "HeartRhythm" NOT NULL DEFAULT 'reguler',
    "gingiva_condition" VARCHAR(255) NOT NULL,
    "mobility_degree" INTEGER NOT NULL DEFAULT 0,
    "mucosa_condition" VARCHAR(120) NOT NULL,
    "prescription_note" VARCHAR(600),
    "hygiene_diagnosis" VARCHAR(600),
    "plan_of_action" TEXT[],
    "debris_index" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calculus_index" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ohis_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ohis_category" "OhisCategory" NOT NULL DEFAULT 'baik',
    "healthy_teeth" INTEGER NOT NULL DEFAULT 0,
    "dmft_score" INTEGER NOT NULL DEFAULT 0,
    "status" "ExaminationStatus" NOT NULL DEFAULT 'draft',
    "next_visit_at" TIMESTAMP(3),
    "next_visit_note" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "examinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examination_teeth" (
    "id" UUID NOT NULL,
    "examination_id" UUID NOT NULL,
    "fdi_number" INTEGER NOT NULL,
    "condition" "ToothCondition" NOT NULL DEFAULT 'sehat',
    "note" VARCHAR(120),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "examination_teeth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examination_index_scores" (
    "id" UUID NOT NULL,
    "examination_id" UUID NOT NULL,
    "fdi_number" INTEGER NOT NULL,
    "surface" "IndexSurface" NOT NULL,
    "debris_value" INTEGER NOT NULL DEFAULT 0,
    "calculus_value" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "examination_index_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "examinations_patient_id_exam_date_idx" ON "examinations"("patient_id", "exam_date");

-- CreateIndex
CREATE INDEX "examinations_status_idx" ON "examinations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "examination_teeth_examination_id_fdi_number_key" ON "examination_teeth"("examination_id", "fdi_number");

-- CreateIndex
CREATE UNIQUE INDEX "examination_index_scores_examination_id_fdi_number_key" ON "examination_index_scores"("examination_id", "fdi_number");

-- AddForeignKey
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_examiner_id_fkey" FOREIGN KEY ("examiner_id") REFERENCES "health_workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_teeth" ADD CONSTRAINT "examination_teeth_examination_id_fkey" FOREIGN KEY ("examination_id") REFERENCES "examinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_index_scores" ADD CONSTRAINT "examination_index_scores_examination_id_fkey" FOREIGN KEY ("examination_id") REFERENCES "examinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
