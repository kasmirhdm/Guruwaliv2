import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Bank Soal: soal milik guru sendiri + soal yang dibagikan ke sekolahnya.
const TYPES = ["PILIHAN_GANDA", "ISIAN", "ESAI"];
const LEVELS = ["MUDAH", "SEDANG", "SULIT"];

async function mySchoolIds(userId: string) {
  const rows = await prisma.schoolMembership.findMany({
    where: { userId, status: "ACTIVE" },
    select: { schoolId: true },
  });
  return rows.map((r) => r.schoolId);
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Anda harus login." }, { status: 401 });
  const q = new URL(req.url).searchParams;
  const subjectName = q.get("subjectName");
  const search = q.get("search");
  const schoolIds = await mySchoolIds(user.id);
  const rows = await prisma.question.findMany({
    where: {
      OR: [{ ownerUserId: user.id }, { schoolId: { in: schoolIds } }],
      ...(subjectName ? { subjectName } : {}),
      ...(search ? { question: { contains: search, mode: "insensitive" as const } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Anda harus login." }, { status: 401 });
  const b = await req.json();
  if (!b.subjectName?.trim() || !b.question?.trim() || !b.answer?.trim())
    return NextResponse.json(
      { error: "Mata pelajaran, soal, dan kunci jawaban wajib diisi." },
      { status: 400 }
    );
  let schoolId: string | null = null;
  if (typeof b.schoolId === "string" && b.schoolId) {
    const member = await prisma.schoolMembership.findFirst({
      where: { userId: user.id, schoolId: b.schoolId, status: "ACTIVE" },
    });
    if (!member)
      return NextResponse.json({ error: "Anda bukan anggota sekolah tersebut." }, { status: 403 });
    schoolId = b.schoolId;
  }
  const type = TYPES.includes(b.type) ? b.type : "PILIHAN_GANDA";
  const options =
    type === "PILIHAN_GANDA" && Array.isArray(b.options)
      ? b.options.map((o: unknown) => String(o)).filter((o: string) => o.trim())
      : null;
  if (type === "PILIHAN_GANDA" && (!options || options.length < 2))
    return NextResponse.json(
      { error: "Soal pilihan ganda butuh minimal 2 pilihan jawaban." },
      { status: 400 }
    );
  const row = await prisma.question.create({
    data: {
      ownerUserId: user.id,
      schoolId,
      subjectName: String(b.subjectName).trim(),
      outcomeId: typeof b.outcomeId === "string" ? b.outcomeId : null,
      objectiveId: typeof b.objectiveId === "string" ? b.objectiveId : null,
      sequenceId: typeof b.sequenceId === "string" ? b.sequenceId : null,
      materialId: typeof b.materialId === "string" ? b.materialId : null,
      type,
      question: String(b.question).trim(),
      options,
      answer: String(b.answer).trim(),
      explanation: typeof b.explanation === "string" ? b.explanation : null,
      difficulty: LEVELS.includes(b.difficulty) ? b.difficulty : "SEDANG",
    },
  });
  return NextResponse.json(row, { status: 201 });
}
