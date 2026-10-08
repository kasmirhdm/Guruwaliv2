CREATE TABLE "Student" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "schoolClassId" TEXT,
  "nis" TEXT,
  "nisn" TEXT,
  "nik" TEXT,
  "name" TEXT NOT NULL,
  "gender" TEXT,
  "birthPlace" TEXT,
  "birthDate" TIMESTAMP(3),
  "address" TEXT,
  "parentName" TEXT,
  "parentPhone" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "source" TEXT NOT NULL DEFAULT 'MANUAL',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ImportedTeacher" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "nip" TEXT,
  "nuptk" TEXT,
  "nik" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "status" TEXT NOT NULL DEFAULT 'IMPORTED',
  "source" TEXT NOT NULL DEFAULT 'DAPODIK',
  "linkedUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ImportedTeacher_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Student_schoolId_schoolClassId_idx" ON "Student"("schoolId","schoolClassId");
CREATE INDEX "Student_schoolId_name_idx" ON "Student"("schoolId","name");
CREATE INDEX "Student_schoolId_nik_idx" ON "Student"("schoolId","nik");
CREATE INDEX "ImportedTeacher_schoolId_name_idx" ON "ImportedTeacher"("schoolId","name");

ALTER TABLE "Student" ADD CONSTRAINT "Student_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_schoolClassId_fkey" FOREIGN KEY ("schoolClassId") REFERENCES "SchoolClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ImportedTeacher" ADD CONSTRAINT "ImportedTeacher_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Student_schoolId_nisn_not_null_key" ON "Student"("schoolId","nisn") WHERE "nisn" IS NOT NULL;
CREATE UNIQUE INDEX "ImportedTeacher_schoolId_nuptk_not_null_key" ON "ImportedTeacher"("schoolId","nuptk") WHERE "nuptk" IS NOT NULL;
