import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePeriodAccess } from "@/lib/rapor-access";

// Catatan Wali Kelas memakai model ReportNote dengan category "WALI_KELAS".
// Wewenang: guru yang menjadi wali kelas dari kelas siswa tersebut.
const CATEGORY = "WALI_KELAS";

async function requireHomeroomStudent(userId: string, studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { schoolClass: { select: { id: true, homeroomTeacherId: true } } },
  });
  if (!student || student.schoolClass?.homeroomTeacherId !== userId) return null;
  return student;
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Anda harus login." }, { status: 401 });
  const periodId = new URL(req.url).searchParams.get("periodId");
  if (!periodId) return NextResponse.json({ error: "periodId wajib diisi." }, { status: 400 });
  const access = await requirePeriodAccess(periodId);
  if (access.response) return access.response;

  // Hanya kelas yang diwalikan guru ini
  const classes = await prisma.schoolClass.findMany({
    where: { schoolId: access.period!.schoolId, homeroomTeacherId: user.id },
    select: { id: true, name: true, grade: true },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
  });
  const students = await prisma.student.findMany({
    where: { schoolId: access.period!.schoolId, schoolClassId: { in: classes.map((c) => c.id) }, status: "ACTIVE" },
    select: { id: true, name: true, schoolClass: { select: { id: true, name: true, grade: true } } },
    orderBy: { name: "asc" },
  });
  const notes = await prisma.reportNote.findMany({
    where: { periodId, category: CATEGORY, studentId: { in: students.map((s) => s.id) } },
  });
  const noteByStudent = new Map(notes.map((n) => [n.studentId, n]));
  return NextResponse.json({
    period: access.period,
    classes,
    students: students.map((s) => ({ ...s, note: noteByStudent.get(s.id) ?? null })),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Anda harus login." }, { status: 401 });
  const b = await req.json();
  if (!b.periodId || !b.studentId)
    return NextResponse.json({ error: "Periode dan siswa wajib diisi." }, { status: 400 });
  const access = await requirePeriodAccess(String(b.periodId));
  if (access.response) return access.response;

  const student = await requireHomeroomStudent(user.id, String(b.studentId));
  if (!student || student.schoolId !== access.period!.schoolId)
    return NextResponse.json(
      { error: "Siswa ini bukan dari kelas yang Anda walikan." },
      { status: 403 }
    );

  const note = typeof b.note === "string" ? b.note.trim() : "";
  const saved = await prisma.reportNote.upsert({
    where: {
      periodId_studentId_category: {
        periodId: access.period!.id,
        studentId: student.id,
        category: CATEGORY,
      },
    },
    update: { note },
    create: { periodId: access.period!.id, studentId: student.id, category: CATEGORY, note },
  });
  return NextResponse.json(saved);
}
