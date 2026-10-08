CREATE TABLE "ReportPeriod" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "academicYear" TEXT NOT NULL,
  "semester" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "ReportPeriod_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "GradeEntry" (
  "id" TEXT NOT NULL,
  "periodId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "subjectId" TEXT,
  "subjectName" TEXT NOT NULL,
  "teacherId" TEXT,
  "knowledge" DOUBLE PRECISION,
  "skill" DOUBLE PRECISION,
  "finalScore" DOUBLE PRECISION,
  "predicate" TEXT,
  "description" TEXT,
  CONSTRAINT "GradeEntry_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ReportNote" (
  "id" TEXT NOT NULL,
  "periodId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  CONSTRAINT "ReportNote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "GradeEntry_periodId_studentId_subjectName_key" ON "GradeEntry"("periodId","studentId","subjectName");
CREATE INDEX "GradeEntry_studentId_periodId_idx" ON "GradeEntry"("studentId","periodId");
CREATE UNIQUE INDEX "ReportNote_periodId_studentId_category_key" ON "ReportNote"("periodId","studentId","category");
CREATE INDEX "ReportNote_studentId_periodId_idx" ON "ReportNote"("studentId","periodId");
CREATE INDEX "ReportPeriod_schoolId_academicYear_semester_idx" ON "ReportPeriod"("schoolId","academicYear","semester");
ALTER TABLE "ReportPeriod" ADD CONSTRAINT "ReportPeriod_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GradeEntry" ADD CONSTRAINT "GradeEntry_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "ReportPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GradeEntry" ADD CONSTRAINT "GradeEntry_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GradeEntry" ADD CONSTRAINT "GradeEntry_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReportNote" ADD CONSTRAINT "ReportNote_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "ReportPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReportNote" ADD CONSTRAINT "ReportNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
