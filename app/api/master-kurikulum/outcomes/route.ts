import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/require-auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  const guard = await requireRole(["GURUWALI_ADMIN"]);
  if (guard.response) return guard.response;
  const p = new URL(req.url).searchParams;
  const curriculumId = p.get("curriculumId");
  const phaseId = p.get("phaseId");
  const masterSubjectId = p.get("masterSubjectId");
  return NextResponse.json(
    await prisma.learningOutcome.findMany({
      where: {
        isMaster: true,
        sourceType: "PLATFORM_MASTER",
        ...(curriculumId ? { curriculumId } : {}),
        ...(phaseId ? { phaseId } : {}),
        ...(masterSubjectId ? { masterSubjectId } : {}),
      },
      include: { phase: true, masterSubject: true },
      orderBy: { createdAt: "desc" },
    })
  );
}

export async function POST(req: Request) {
  const guard = await requireRole(["GURUWALI_ADMIN"]);
  if (guard.response) return guard.response;
  const body = await req.json();
  if (!body.curriculumId || !body.phaseId || !body.masterSubjectId || !body.title || !body.content)
    return NextResponse.json(
      { error: "Kurikulum, fase, mata pelajaran, judul dan isi CP wajib diisi" },
      { status: 400 }
    );
  const phase = await prisma.phase.findFirst({
    where: { id: body.phaseId, curriculumId: body.curriculumId },
  });
  if (!phase)
    return NextResponse.json(
      { error: "Fase tidak sesuai dengan Kurikulum yang dipilih." },
      { status: 400 }
    );
  const subject = await prisma.masterSubject.findFirst({
    where: { id: body.masterSubjectId, isActive: true },
  });
  if (!subject)
    return NextResponse.json(
      { error: "Mata pelajaran master tidak valid atau tidak aktif." },
      { status: 400 }
    );
  const data = await prisma.learningOutcome.create({
    data: {
      curriculumId: body.curriculumId,
      phaseId: body.phaseId,
      masterSubjectId: body.masterSubjectId,
      title: body.title,
      content: body.content,
      sourceType: "PLATFORM_MASTER",
      isMaster: true,
    },
  });
  return NextResponse.json(data, { status: 201 });
}
