/*
  Warnings:

  - You are about to drop the column `dmft_score` on the `examinations` table. All the data in the column will be lost.
  - You are about to drop the column `healthy_teeth` on the `examinations` table. All the data in the column will be lost.
  - You are about to drop the column `dmft_score` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `healthy_teeth` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `odontogram_note` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the `examination_teeth` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "examination_teeth" DROP CONSTRAINT "examination_teeth_examination_id_fkey";

-- AlterTable
ALTER TABLE "examinations" DROP COLUMN "dmft_score",
DROP COLUMN "healthy_teeth";

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "dmft_score",
DROP COLUMN "healthy_teeth",
DROP COLUMN "odontogram_note";

-- DropTable
DROP TABLE "examination_teeth";

-- DropEnum
DROP TYPE "ToothCondition";
