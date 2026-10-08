import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { getCurrentUser } from "./auth";

// Verifikasi: user login, periode ada, dan user anggota AKTIF sekolah pemilik periode.
// schoolId selalu diambil dari periode (database), tidak pernah dari input pengguna.
export async function requirePeriodAccess(periodId: string) {
  const user = await getCurrentUser();
  if (!user)
    return { user: null, period: null, membership: null, response: NextResponse.json({ error: "Anda harus login." }, { status: 401 }) };
  const period = await prisma.reportPeriod.findUnique({ where: { id: periodId } });
  if (!period)
    return { user, period: null, membership: null, response: NextResponse.json({ error: "Periode rapor tidak ditemukan." }, { status: 404 }) };
  const membership = await prisma.schoolMembership.findFirst({
    where: { userId: user.id, schoolId: period.schoolId, status: "ACTIVE" },
  });
  if (!membership)
    return { user, period, membership: null, response: NextResponse.json({ error: "Anda tidak memiliki akses ke sekolah ini." }, { status: 403 }) };
  return { user, period, membership, response: null };
}

// Guru hanya boleh mengubah nilai miliknya; Admin Sekolah boleh mengubah semua nilai di sekolahnya.
export function canEditGrade(
  membershipRole: string,
  userId: string,
  gradeTeacherId: string | null
) {
  if (membershipRole === "SCHOOL_ADMIN") return true;
  return gradeTeacherId === userId;
}

// Predikat Kurikulum Merdeka dari nilai akhir (bisa ditimpa guru).
export function predicateFor(finalScore: number | null | undefined): string | null {
  if (finalScore === null || finalScore === undefined || Number.isNaN(finalScore)) return null;
  if (finalScore >= 90) return "Sangat Baik";
  if (finalScore >= 80) return "Baik";
  if (finalScore >= 70) return "Cukup";
  return "Perlu Bimbingan";
}

// Nilai akhir: gunakan yang diisi guru; bila kosong, rata-rata pengetahuan & keterampilan.
export function resolveFinalScore(b: {
  knowledge?: number | null;
  skill?: number | null;
  finalScore?: number | null;
}): number | null {
  if (b.finalScore !== null && b.finalScore !== undefined) return b.finalScore;
  const parts = [b.knowledge, b.skill].filter(
    (v): v is number => v !== null && v !== undefined && !Number.isNaN(v)
  );
  if (!parts.length) return null;
  return Math.round((parts.reduce((a, c) => a + c, 0) / parts.length) * 100) / 100;
}

export function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isNaN(n) ? null : n;
}
