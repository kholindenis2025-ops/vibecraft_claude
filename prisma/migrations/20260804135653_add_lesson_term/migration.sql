-- CreateTable
CREATE TABLE "LessonTerm" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,

    CONSTRAINT "LessonTerm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonTerm_lessonId_order_key" ON "LessonTerm"("lessonId", "order");

-- AddForeignKey
ALTER TABLE "LessonTerm" ADD CONSTRAINT "LessonTerm_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
