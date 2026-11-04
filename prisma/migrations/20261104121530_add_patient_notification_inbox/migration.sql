-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "recipient_patient_id" UUID,
ALTER COLUMN "recipient_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "notifications_recipient_patient_id_is_read_idx" ON "notifications"("recipient_patient_id", "is_read");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_patient_id_fkey" FOREIGN KEY ("recipient_patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
