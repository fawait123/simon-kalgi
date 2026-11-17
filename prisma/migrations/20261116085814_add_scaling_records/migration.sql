-- CreateEnum
CREATE TYPE "ScalingType" AS ENUM ('supragingiva', 'subgingiva', 'root_planing');

-- CreateTable
CREATE TABLE "scaling_records" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "examination_id" UUID,
    "performed_at" DATE NOT NULL,
    "scaling_type" "ScalingType" NOT NULL,
    "quadrants" VARCHAR(120) NOT NULL,
    "operator_name" VARCHAR(120) NOT NULL,
    "note" VARCHAR(300),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scaling_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scaling_records_examination_id_key" ON "scaling_records"("examination_id");

-- CreateIndex
CREATE INDEX "scaling_records_patient_id_performed_at_idx" ON "scaling_records"("patient_id", "performed_at");

-- CreateIndex
CREATE INDEX "scaling_records_performed_at_idx" ON "scaling_records"("performed_at");

-- AddForeignKey
ALTER TABLE "scaling_records" ADD CONSTRAINT "scaling_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scaling_records" ADD CONSTRAINT "scaling_records_examination_id_fkey" FOREIGN KEY ("examination_id") REFERENCES "examinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
