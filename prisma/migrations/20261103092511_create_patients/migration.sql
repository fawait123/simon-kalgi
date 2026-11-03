-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A', 'B', 'AB', 'O');

-- CreateEnum
CREATE TYPE "OhisCategory" AS ENUM ('baik', 'sedang', 'buruk');

-- CreateEnum
CREATE TYPE "ControlPriority" AS ENUM ('normal', 'urgent');

-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL,
    "medical_record_no" VARCHAR(15) NOT NULL,
    "nik" CHAR(16) NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "birth_date" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "blood_type" "BloodType",
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(120),
    "address" VARCHAR(255) NOT NULL,
    "allergy_antibiotics" BOOLEAN NOT NULL DEFAULT false,
    "hypertension" BOOLEAN NOT NULL DEFAULT false,
    "diabetes" BOOLEAN NOT NULL DEFAULT false,
    "ohis_score" DOUBLE PRECISION,
    "debris_index" DOUBLE PRECISION,
    "calculus_index" DOUBLE PRECISION,
    "ohis_category" "OhisCategory",
    "healthy_teeth" INTEGER NOT NULL DEFAULT 0,
    "odontogram_note" VARCHAR(200),
    "dmft_score" INTEGER,
    "last_visit_at" DATE,
    "next_visit_at" TIMESTAMP(3),
    "next_visit_clinician" VARCHAR(120),
    "control_title" VARCHAR(80),
    "control_note" VARCHAR(120),
    "control_priority" "ControlPriority" NOT NULL DEFAULT 'normal',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_visits" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "visit_date" DATE NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "clinician_name" VARCHAR(120) NOT NULL,
    "ohis_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_medical_record_no_key" ON "patients"("medical_record_no");

-- CreateIndex
CREATE UNIQUE INDEX "patients_nik_key" ON "patients"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "patients"("email");

-- CreateIndex
CREATE INDEX "patients_gender_idx" ON "patients"("gender");

-- CreateIndex
CREATE INDEX "patients_ohis_category_idx" ON "patients"("ohis_category");

-- CreateIndex
CREATE INDEX "patients_full_name_idx" ON "patients"("full_name");

-- CreateIndex
CREATE INDEX "patient_visits_patient_id_visit_date_idx" ON "patient_visits"("patient_id", "visit_date");

-- AddForeignKey
ALTER TABLE "patient_visits" ADD CONSTRAINT "patient_visits_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
