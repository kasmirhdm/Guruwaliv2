-- TeachingDevice: ubah kolom rantai kurikulum menjadi relasi resmi.
-- Aman untuk data existing: referensi yatim (menunjuk baris yang sudah
-- tidak ada) dinull-kan terlebih dahulu; baris perangkat tidak dihapus.
UPDATE "TeachingDevice" SET "curriculumId" = NULL WHERE "curriculumId" IS NOT NULL AND "curriculumId" NOT IN (SELECT "id" FROM "Curriculum");
UPDATE "TeachingDevice" SET "phaseId" = NULL WHERE "phaseId" IS NOT NULL AND "phaseId" NOT IN (SELECT "id" FROM "Phase");
UPDATE "TeachingDevice" SET "outcomeId" = NULL WHERE "outcomeId" IS NOT NULL AND "outcomeId" NOT IN (SELECT "id" FROM "LearningOutcome");
UPDATE "TeachingDevice" SET "objectiveId" = NULL WHERE "objectiveId" IS NOT NULL AND "objectiveId" NOT IN (SELECT "id" FROM "LearningObjective");
UPDATE "TeachingDevice" SET "sequenceId" = NULL WHERE "sequenceId" IS NOT NULL AND "sequenceId" NOT IN (SELECT "id" FROM "LearningSequence");
UPDATE "TeachingDevice" SET "materialId" = NULL WHERE "materialId" IS NOT NULL AND "materialId" NOT IN (SELECT "id" FROM "LearningMaterial");

-- CreateIndex
CREATE INDEX "TeachingDevice_curriculumId_phaseId_idx" ON "TeachingDevice"("curriculumId", "phaseId");

-- CreateIndex
CREATE INDEX "TeachingDevice_materialId_idx" ON "TeachingDevice"("materialId");

-- AddForeignKey
ALTER TABLE "TeachingDevice" ADD CONSTRAINT "TeachingDevice_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingDevice" ADD CONSTRAINT "TeachingDevice_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingDevice" ADD CONSTRAINT "TeachingDevice_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "LearningOutcome"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingDevice" ADD CONSTRAINT "TeachingDevice_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "LearningObjective"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingDevice" ADD CONSTRAINT "TeachingDevice_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "LearningSequence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingDevice" ADD CONSTRAINT "TeachingDevice_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "LearningMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

