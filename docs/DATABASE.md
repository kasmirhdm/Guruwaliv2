# GuruWali V2 Database Blueprint

## Identity
users
- id
- email
- password_hash
- role
- teacher_mode
- status
- created_at

schools
- id
- name
- npsn
- address
- logo_path
- principal_name
- created_at

school_memberships
- id
- school_id
- user_id
- role
- status
- joined_at

## School data
academic_years
classes
subjects
teachers
students
homeroom_assignments

## Curriculum
curriculums
phases
curriculum_subjects
learning_outcomes
learning_objectives
learning_sequences
learning_materials

Important fields for learning_outcomes:
- source_type: PLATFORM_MASTER | SCHOOL
- is_master: boolean
- status
- curriculum_id
- phase_id
- subject_id

## Learning documents
teaching_modules
teaching_materials
worksheets
assessments
question_banks
documents

## Student administration
attendance
grades
student_notes
achievements

All school-scoped tables use school_id where appropriate. Personal teacher documents may use owner_user_id and nullable school_id.

## Future
Use PostgreSQL on the production VPS. Prisma will be used as the ORM.

---

## Status implementasi (sumber kebenaran: `prisma/schema.prisma`)

Catatan: blueprint konseptual di atas memakai nama generik; nama tabel/
kolom yang sebenarnya mengikuti model Prisma (PascalCase). Database
target adalah **PostgreSQL di VPS** — **bukan Supabase**. Koneksi hanya
melalui `DATABASE_URL`.

### Migration (urut, terverifikasi di database kosong)
1. `20261009000000_baseline` — 17 tabel fondasi (identitas, sekolah,
   kurikulum master, perangkat, sesi).
2. `20261009050000_add_dapodik_people` — siswa & impor Dapodik.
3. `20261009070000_add_report_basic` — periode rapor, nilai, catatan.
4. `20261009110000_add_bank_soal_question` — bank soal.
5. `20261009120000_teaching_device_relations` — foreign key resmi
   rantai kurikulum pada `TeachingDevice`.

`migration_lock.toml` mengunci provider `postgresql`. Deploy memakai
`prisma migrate deploy`; jangan memakai `migrate reset` di data nyata.

### Relasi kunci
- `TeachingDevice.curriculumId/phaseId/outcomeId/objectiveId/
  sequenceId/materialId` adalah foreign key resmi ke `Curriculum`,
  `Phase`, `LearningOutcome` (CP), `LearningObjective` (TP),
  `LearningSequence` (ATP), `LearningMaterial` (Materi) dengan
  `ON DELETE SET NULL` — perangkat tidak ikut hilang saat master dihapus,
  dan migration menull-kan referensi yatim tanpa menghapus baris.
- `LearningOutcome.subjectId` berelasi ke `Subject` (SetNull);
  `MasterSubject` tetap menjadi katalog mapel platform pada CP.
- `GradeEntry.teacher` ↔ `User.gradeEntries` memakai nama relasi yang
  sama: `TeacherGrades`.
- Unique: `GradeEntry (periodId, studentId, subjectName)`,
  `ReportNote (periodId, studentId, category)`.

### Index jalur query utama
- Rantai kurikulum: `LearningOutcome (curriculumId, phaseId, subjectId)`,
  `LearningObjective (outcomeId)`, `LearningSequence (objectiveId)`,
  `LearningMaterial (sequenceId)`.
- Perangkat: `(ownerUserId, type)`, `(schoolId, type)`,
  `(outcomeId, objectiveId, sequenceId)`, `(curriculumId, phaseId)`,
  `(materialId)`.
- Isolasi tenant: semua tabel operasional sekolah terindeks pada
  `schoolId`.
