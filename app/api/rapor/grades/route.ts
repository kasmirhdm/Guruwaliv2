import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requirePeriodAccess,
  canEditGrade,
  predicateFor,
  resolveFinalScore,
  numOrNull,
} from "@/lib/rapor-access";

// Daftar siswa sekolah pemilik periode (+ nilai mereka pada periode ini).
// Query: periodId (wajib), schoolClassId (opsional), subjectName (opsional)
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const periodId = q.get("periodId");
  if (!periodId) return NextResponse.json({ error: "periodId wajib diisi." }, { status: 400 });
  const access = await requirePeriodAccess(periodId);
  if (access.response) return access.response;
  const period = access.period!;
  const schoolClassId = q.get("schoolClassId");
  const subjectName = q.get("subjectName");

  const students = await prisma.student.findMany({
    where: {
      schoolId: period.schoolId,
      status: "ACTIVE",
      ...(schoolClassId ? { schoolClassId } : {}),
    },
    select: {
      id: true,
      name: true,
      nis: true,
      nisn: true,
      gender: true,
      schoolClass: { select: { id: true, name: true, grade: true } },
    },
    orderBy: { name: "asc" },
  });
  const grades = await prisma.gradeEntry.findMany({
    where: {
      periodId,
      ...(subjectName ? { subjectName } : {}),
      studentId: { in: students.map((s) => s.id) },
    },
  });
  const byStudentSubject = new Map(grades.map((g) => [`${g.studentId}|${g.subjectName}`, g]));
  return NextResponse.json({
    period,
    students: students.map((s) => ({
      ...s,
      grade: subjectName ? byStudentSubject.get(`${s.id}|${subjectName}`) ?? null : null,
      grades: grades.filter((g) => g.studentId === s.id),
    })),
  });
}

// Buat/perbarui nilai (upsert per kombinasi periode+siswa+mapel).
// AI tidak pernah menyentuh endpoint ini untuk mengubah nilai; deskripsi
// boleh disimpan/diedit guru lewat POST/PATCH ini.
export async function POST(req: Request) {
  const b = await req.json();
  if (!b.periodId || !b.studentId || !b.subjectName?.trim())
    return NextResponse.json(
      { error: "Periode, siswa, dan mata pelajaran wajib diisi." },
      { status: 400 }
    );
  const access = await requirePeriodAccess(String(b.periodId));
  if (access.response) return access.response;
  const { user, period, membership } = access;

  // Siswa harus satu sekolah dengan periode (mencegah relasi menyebrang sekolah).
  const student = await prisma.student.findFirst({
    where: { id: String(b.studentId), schoolId: period!.schoolId },
    select: { id: true },
  });
  if (!student) return NextResponse.json({ error: "Siswa tidak ditemukan di sekolah ini." }, { status: 404 });

  const subjectName = String(b.subjectName).trim();
  const existing = await prisma.gradeEntry.findUnique({
    where: {
      periodId_studentId_subjectName: {
        periodId: period!.id,
        studentId: student.id,
        subjectName,
      },
    },
  });
  if (existing && !canEditGrade(membership!.role, user!.id, existing.teacherId))
    return NextResponse.json(
      { error: "Nilai ini diinput guru lain; hanya pemilik atau Admin Sekolah yang dapat mengubahnya." },
      { status: 403 }
    );

  const knowledge = numOrNull(b.knowledge);
  const skill = numOrNull(b.skill);
  const finalScore = resolveFinalScore({ knowledge, skill, finalScore: numOrNull(b.finalScore) });
  const data = {
    subjectId: typeof b.subjectId === "string" ? b.subjectId : existing?.subjectId ?? null,
    teacherId: user!.id,
    knowledge,
    skill,
    finalScore,
    predicate:
      typeof b.predicate === "string" && b.predicate.trim()
        ? b.predicate.trim()
        : predicateFor(finalScore),
    description:
      typeof b.description === "string" ? b.description : existing?.description ?? null,
  };
  const grade = existing
    ? await prisma.gradeEntry.update({ where: { id: existing.id }, data })
    : await prisma.gradeEntry.create({
        data: { periodId: period!.id, studentId: student.id, subjectName, ...data },
      });
  return NextResponse.json(grade, { status: existing ? 200 : 201 });
}
