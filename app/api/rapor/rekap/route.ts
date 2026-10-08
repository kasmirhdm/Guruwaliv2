import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePeriodAccess } from "@/lib/rapor-access";

// Rekap nilai satu periode: statistik per mata pelajaran + rata-rata per siswa.
// Query: periodId (wajib), schoolClassId (opsional)
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const periodId = q.get("periodId");
  if (!periodId) return NextResponse.json({ error: "periodId wajib diisi." }, { status: 400 });
  const access = await requirePeriodAccess(periodId);
  if (access.response) return access.response;
  const period = access.period!;
  const schoolClassId = q.get("schoolClassId");

  const students = await prisma.student.findMany({
    where: {
      schoolId: period.schoolId,
      status: "ACTIVE",
      ...(schoolClassId ? { schoolClassId } : {}),
    },
    select: { id: true, name: true, schoolClass: { select: { id: true, name: true, grade: true } } },
  });
  const grades = await prisma.gradeEntry.findMany({
    where: { periodId, studentId: { in: students.map((s) => s.id) } },
  });

  const subjectMap = new Map<string, { scores: number[]; predicates: Map<string, number> }>();
  const perStudent = new Map<string, number[]>();
  for (const g of grades) {
    const entry: { scores: number[]; predicates: Map<string, number> } =
      subjectMap.get(g.subjectName) ?? { scores: [], predicates: new Map<string, number>() };
    if (g.finalScore !== null && g.finalScore !== undefined) {
      entry.scores.push(g.finalScore);
      perStudent.set(g.studentId, [...(perStudent.get(g.studentId) ?? []), g.finalScore]);
    }
    if (g.predicate) entry.predicates.set(g.predicate, (entry.predicates.get(g.predicate) ?? 0) + 1);
    subjectMap.set(g.subjectName, entry);
  }

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const subjects = [...subjectMap.entries()]
    .map(([subjectName, v]) => ({
      subjectName,
      count: v.scores.length,
      average: v.scores.length ? round2(v.scores.reduce((a, c) => a + c, 0) / v.scores.length) : null,
      min: v.scores.length ? Math.min(...v.scores) : null,
      max: v.scores.length ? Math.max(...v.scores) : null,
      predicates: Object.fromEntries(v.predicates),
    }))
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName));

  const studentRows = students.map((s) => {
    const scores = perStudent.get(s.id) ?? [];
    return {
      studentId: s.id,
      name: s.name,
      schoolClass: s.schoolClass,
      subjectsGraded: scores.length,
      average: scores.length ? round2(scores.reduce((a, c) => a + c, 0) / scores.length) : null,
    };
  });

  return NextResponse.json({
    period,
    totalStudents: students.length,
    totalGrades: grades.length,
    subjects,
    students: studentRows,
  });
}
