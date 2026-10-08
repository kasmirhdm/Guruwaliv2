import { prisma } from "./prisma";

// Rakit data rapor lengkap satu siswa pada satu periode (untuk preview & PDF).
// Mengembalikan null bila siswa tidak berada di sekolah pemilik periode.
export async function getRaporData(periodId: string, studentId: string) {
  const period = await prisma.reportPeriod.findUnique({ where: { id: periodId } });
  if (!period) return null;
  const student = await prisma.student.findFirst({
    where: { id: studentId, schoolId: period.schoolId },
    include: {
      schoolClass: {
        include: { homeroomTeacher: { select: { id: true, name: true } } },
      },
    },
  });
  if (!student) return null;
  const [school, grades, notes] = await Promise.all([
    prisma.school.findUnique({ where: { id: period.schoolId } }),
    prisma.gradeEntry.findMany({
      where: { periodId, studentId },
      orderBy: { subjectName: "asc" },
    }),
    prisma.reportNote.findMany({ where: { periodId, studentId } }),
  ]);
  const waliNote = notes.find((n) => n.category === "WALI_KELAS") || null;
  return { period, student, school, grades, notes, waliNote };
}
