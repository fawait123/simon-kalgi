-- CreateEnum
CREATE TYPE "EducationCategory" AS ENUM ('menyikat', 'kalkulus', 'gusi', 'diet', 'faq');

-- CreateEnum
CREATE TYPE "EducationFormat" AS ENUM ('artikel', 'video', 'checklist');

-- CreateTable
CREATE TABLE "education_articles" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "excerpt" VARCHAR(320) NOT NULL,
    "body" TEXT NOT NULL,
    "category" "EducationCategory" NOT NULL,
    "format" "EducationFormat" NOT NULL DEFAULT 'artikel',
    "cover_image_url" VARCHAR(500),
    "read_minutes" INTEGER NOT NULL DEFAULT 4,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "education_articles_title_key" ON "education_articles"("title");

-- CreateIndex
CREATE INDEX "education_articles_category_idx" ON "education_articles"("category");

-- CreateIndex
CREATE INDEX "education_articles_is_published_idx" ON "education_articles"("is_published");
