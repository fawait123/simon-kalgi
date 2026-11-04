-- CreateEnum
CREATE TYPE "CareTaskSession" AS ENUM ('pagi', 'siang', 'malam');

-- CreateTable
CREATE TABLE "care_tasks" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "session" "CareTaskSession" NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "instruction" VARCHAR(500) NOT NULL,
    "time_start" VARCHAR(5) NOT NULL,
    "time_end" VARCHAR(5) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_task_completions" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "log_date" DATE NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_task_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "care_tasks_patient_id_session_idx" ON "care_tasks"("patient_id", "session");

-- CreateIndex
CREATE INDEX "care_task_completions_patient_id_log_date_idx" ON "care_task_completions"("patient_id", "log_date");

-- CreateIndex
CREATE UNIQUE INDEX "care_task_completions_task_id_log_date_key" ON "care_task_completions"("task_id", "log_date");

-- AddForeignKey
ALTER TABLE "care_tasks" ADD CONSTRAINT "care_tasks_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_task_completions" ADD CONSTRAINT "care_task_completions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "care_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_task_completions" ADD CONSTRAINT "care_task_completions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
