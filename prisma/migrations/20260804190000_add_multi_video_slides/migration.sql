-- CreateTable
CREATE TABLE "LessonVideo" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT,
    "url" TEXT NOT NULL,

    CONSTRAINT "LessonVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonSlide" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT,
    "url" TEXT NOT NULL,

    CONSTRAINT "LessonSlide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonVideo_lessonId_order_key" ON "LessonVideo"("lessonId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "LessonSlide_lessonId_order_key" ON "LessonSlide"("lessonId", "order");

-- AddForeignKey
ALTER TABLE "LessonVideo" ADD CONSTRAINT "LessonVideo_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSlide" ADD CONSTRAINT "LessonSlide_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: move existing single video/slides URLs into the new tables
-- before the old columns are dropped, so no lesson loses its material.
INSERT INTO "LessonVideo" ("id", "lessonId", "order", "url")
SELECT gen_random_uuid()::text, "id", 1, "videoUrl"
FROM "Lesson"
WHERE "videoUrl" IS NOT NULL;

INSERT INTO "LessonSlide" ("id", "lessonId", "order", "url")
SELECT gen_random_uuid()::text, "id", 1, "slidesUrl"
FROM "Lesson"
WHERE "slidesUrl" IS NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "slidesUrl",
DROP COLUMN "videoUrl";
