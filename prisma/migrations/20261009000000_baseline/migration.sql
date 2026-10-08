-- Baseline GuruWali V2
-- Membuat model fondasi (User, School, kurikulum, perangkat, dst).
-- Tabel Student, ImportedTeacher, DapodikImportLog dibuat oleh
-- migration 20261009050000_add_dapodik_people, dan ReportPeriod,
-- GradeEntry, ReportNote oleh 20261009070000_add_report_basic.
-- Folder ini sengaja diberi tanggal lebih awal agar berjalan pertama
-- saat `prisma migrate deploy` di database kosong.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('GURUWALI_ADMIN', 'SCHOOL_ADMIN', 'TEACHER');

-- CreateEnum
CREATE TYPE "TeacherMode" AS ENUM ('INDIVIDUAL', 'SCHOOL');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CurriculumSource" AS ENUM ('PLATFORM_MASTER', 'SCHOOL');

-- CreateEnum
CREATE TYPE "TeachingDeviceType" AS ENUM ('MODUL_AJAR', 'LKPD', 'BAHAN_AJAR', 'ASESMEN', 'KISI_KISI', 'PROGRAM_SEMESTER', 'PROGRAM_TAHUNAN');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'TEACHER',
    "teacherMode" "TeacherMode",
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "npsn" TEXT,
    "address" TEXT,
    "logoPath" TEXT,
    "principalName" TEXT,
    "principalNip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolMembership" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolClass" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT,
    "homeroomTeacherId" TEXT,

    CONSTRAINT "SchoolClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterSubject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "masterSubjectId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterCurriculumRevision" (
    "id" TEXT NOT NULL,
    "curriculumId" TEXT,
    "version" INTEGER NOT NULL,
    "label" TEXT,
    "snapshot" JSONB NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasterCurriculumRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curriculum" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sourceType" "CurriculumSource" NOT NULL DEFAULT 'PLATFORM_MASTER',

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningOutcome" (
    "id" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "subjectId" TEXT,
    "masterSubjectId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceType" "CurriculumSource" NOT NULL DEFAULT 'PLATFORM_MASTER',
    "isMaster" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningObjective" (
    "id" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningSequence" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningMaterial" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingDevice" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "schoolId" TEXT,
    "type" "TeachingDeviceType" NOT NULL,
    "title" TEXT NOT NULL,
    "subjectName" TEXT,
    "className" TEXT,
    "academicYear" TEXT,
    "curriculumId" TEXT,
    "phaseId" TEXT,
    "outcomeId" TEXT,
    "objectiveId" TEXT,
    "sequenceId" TEXT,
    "materialId" TEXT,
    "schoolClassId" TEXT,
    "content" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeachingDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "schoolId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "filePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "School_npsn_key" ON "School"("npsn");

-- CreateIndex
CREATE INDEX "SchoolMembership_userId_status_idx" ON "SchoolMembership"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolMembership_schoolId_userId_key" ON "SchoolMembership"("schoolId", "userId");

-- CreateIndex
CREATE INDEX "AcademicYear_schoolId_isActive_idx" ON "AcademicYear"("schoolId", "isActive");

-- CreateIndex
CREATE INDEX "SchoolClass_schoolId_idx" ON "SchoolClass"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolClass_homeroomTeacherId_idx" ON "SchoolClass"("homeroomTeacherId");

-- CreateIndex
CREATE UNIQUE INDEX "MasterSubject_name_key" ON "MasterSubject"("name");

-- CreateIndex
CREATE INDEX "MasterSubject_isActive_idx" ON "MasterSubject"("isActive");

-- CreateIndex
CREATE INDEX "Subject_schoolId_idx" ON "Subject"("schoolId");

-- CreateIndex
CREATE INDEX "Subject_masterSubjectId_idx" ON "Subject"("masterSubjectId");

-- CreateIndex
CREATE INDEX "MasterCurriculumRevision_curriculumId_createdAt_idx" ON "MasterCurriculumRevision"("curriculumId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MasterCurriculumRevision_curriculumId_version_key" ON "MasterCurriculumRevision"("curriculumId", "version");

-- CreateIndex
CREATE INDEX "Curriculum_schoolId_sourceType_idx" ON "Curriculum"("schoolId", "sourceType");

-- CreateIndex
CREATE INDEX "Phase_curriculumId_idx" ON "Phase"("curriculumId");

-- CreateIndex
CREATE INDEX "LearningOutcome_curriculumId_phaseId_subjectId_idx" ON "LearningOutcome"("curriculumId", "phaseId", "subjectId");

-- CreateIndex
CREATE INDEX "LearningOutcome_masterSubjectId_isMaster_idx" ON "LearningOutcome"("masterSubjectId", "isMaster");

-- CreateIndex
CREATE INDEX "LearningObjective_outcomeId_idx" ON "LearningObjective"("outcomeId");

-- CreateIndex
CREATE INDEX "LearningSequence_objectiveId_idx" ON "LearningSequence"("objectiveId");

-- CreateIndex
CREATE INDEX "LearningMaterial_sequenceId_idx" ON "LearningMaterial"("sequenceId");

-- CreateIndex
CREATE INDEX "TeachingDevice_ownerUserId_type_idx" ON "TeachingDevice"("ownerUserId", "type");

-- CreateIndex
CREATE INDEX "TeachingDevice_schoolId_type_idx" ON "TeachingDevice"("schoolId", "type");

-- CreateIndex
CREATE INDEX "TeachingDevice_outcomeId_objectiveId_sequenceId_idx" ON "TeachingDevice"("outcomeId", "objectiveId", "sequenceId");

-- CreateIndex
CREATE INDEX "Document_ownerUserId_idx" ON "Document"("ownerUserId");

-- CreateIndex
CREATE INDEX "Document_schoolId_idx" ON "Document"("schoolId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolMembership" ADD CONSTRAINT "SchoolMembership_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolMembership" ADD CONSTRAINT "SchoolMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClass" ADD CONSTRAINT "SchoolClass_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClass" ADD CONSTRAINT "SchoolClass_homeroomTeacherId_fkey" FOREIGN KEY ("homeroomTeacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_masterSubjectId_fkey" FOREIGN KEY ("masterSubjectId") REFERENCES "MasterSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterCurriculumRevision" ADD CONSTRAINT "MasterCurriculumRevision_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curriculum" ADD CONSTRAINT "Curriculum_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningOutcome" ADD CONSTRAINT "LearningOutcome_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningOutcome" ADD CONSTRAINT "LearningOutcome_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningOutcome" ADD CONSTRAINT "LearningOutcome_masterSubjectId_fkey" FOREIGN KEY ("masterSubjectId") REFERENCES "MasterSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningOutcome" ADD CONSTRAINT "LearningOutcome_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningObjective" ADD CONSTRAINT "LearningObjective_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "LearningOutcome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningSequence" ADD CONSTRAINT "LearningSequence_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "LearningObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningMaterial" ADD CONSTRAINT "LearningMaterial_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "LearningSequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingDevice" ADD CONSTRAINT "TeachingDevice_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingDevice" ADD CONSTRAINT "TeachingDevice_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingDevice" ADD CONSTRAINT "TeachingDevice_schoolClassId_fkey" FOREIGN KEY ("schoolClassId") REFERENCES "SchoolClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
