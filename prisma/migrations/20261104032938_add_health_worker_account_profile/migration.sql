-- AlterTable
ALTER TABLE "health_workers" ADD COLUMN     "bio" VARCHAR(600),
ADD COLUMN     "kki_number" VARCHAR(20),
ADD COLUMN     "sip_issuer" VARCHAR(80),
ADD COLUMN     "sip_number" VARCHAR(40);

-- CreateIndex
CREATE INDEX "examinations_examiner_id_exam_date_idx" ON "examinations"("examiner_id", "exam_date");
