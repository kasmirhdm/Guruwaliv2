-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "schoolId" TEXT,
    "subjectName" TEXT NOT NULL,
    "outcomeId" TEXT,
    "objectiveId" TEXT,
    "sequenceId" TEXT,
    "materialId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PILIHAN_GANDA',
    "question" TEXT NOT NULL,
    "options" JSONB,
    "answer" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'SEDANG',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Question_ownerUserId_idx" ON "Question"("ownerUserId");

-- CreateIndex
CREATE INDEX "Question_schoolId_subjectName_idx" ON "Question"("schoolId", "subjectName");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

