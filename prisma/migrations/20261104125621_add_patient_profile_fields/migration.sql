-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "birth_place" VARCHAR(120),
ADD COLUMN     "emergency_email" VARCHAR(120),
ADD COLUMN     "emergency_name" VARCHAR(120),
ADD COLUMN     "emergency_phone" VARCHAR(20),
ADD COLUMN     "emergency_relation" VARCHAR(60),
ADD COLUMN     "insurance_policy_no" VARCHAR(40),
ADD COLUMN     "insurance_type" VARCHAR(60),
ADD COLUMN     "insurance_valid_until" DATE,
ADD COLUMN     "occupation" VARCHAR(120);
