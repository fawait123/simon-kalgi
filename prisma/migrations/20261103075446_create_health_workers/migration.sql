-- CreateEnum
CREATE TYPE "HealthWorkerRole" AS ENUM ('spesialis', 'umum', 'perawat', 'asisten');

-- CreateEnum
CREATE TYPE "WorkerStatus" AS ENUM ('aktif', 'cuti', 'nonaktif');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('tetap', 'mitra', 'residen');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('dokter', 'perawat', 'admin');

-- CreateTable
CREATE TABLE "health_workers" (
    "id" UUID NOT NULL,
    "medical_id" VARCHAR(15) NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "nik" CHAR(16) NOT NULL,
    "birth_date" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "employment_status" "EmploymentStatus" NOT NULL DEFAULT 'tetap',
    "role" "HealthWorkerRole" NOT NULL,
    "specialization" VARCHAR(100),
    "str_number" VARCHAR(40) NOT NULL,
    "str_expiry_date" DATE NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "address" VARCHAR(255),
    "username" VARCHAR(40) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "access_level" "AccessLevel" NOT NULL,
    "duty_days" VARCHAR(80) NOT NULL,
    "duty_time" VARCHAR(60) NOT NULL,
    "status" "WorkerStatus" NOT NULL DEFAULT 'aktif',
    "is_pic" BOOLEAN NOT NULL DEFAULT false,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_workers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "health_workers_medical_id_key" ON "health_workers"("medical_id");

-- CreateIndex
CREATE UNIQUE INDEX "health_workers_nik_key" ON "health_workers"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "health_workers_email_key" ON "health_workers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "health_workers_username_key" ON "health_workers"("username");

-- CreateIndex
CREATE INDEX "health_workers_role_idx" ON "health_workers"("role");

-- CreateIndex
CREATE INDEX "health_workers_status_idx" ON "health_workers"("status");

-- CreateIndex
CREATE INDEX "health_workers_str_number_idx" ON "health_workers"("str_number");
