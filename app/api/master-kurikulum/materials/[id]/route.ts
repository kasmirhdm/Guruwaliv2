import { NextResponse } from "next/server";
import { requireRole } from "../../../../../lib/require-auth";
import { prisma } from "../../../../../lib/prisma";
import { snapshotMasterCurriculum } from "../../../../../lib/master-curriculum-revision";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(["GURUWALI_ADMIN"]);
  if (guard.response) return guard.response;
  const { id } = await params;
  const b = await req.json();
  const current = await prisma.learningMaterial.findUnique({
    where: { id },
    select: { sequence: { select: { objective: { select: { outcome: { select: { curriculumId: true } } } } } } },
  });
  const curriculumId = current?.sequence.objective.outcome.curriculumId;
  if (curriculumId) await snapshotMasterCurriculum(curriculumId, "Sebelum perubahan Master Kurikulum");
  return NextResponse.json(
    await prisma.learningMaterial.update({
      where: { id },
      data: { sequenceId: b.sequenceId, title: b.title, content: b.content },
    })
  );
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(["GURUWALI_ADMIN"]);
  if (guard.response) return guard.response;
  const { id } = await params;
  const current = await prisma.learningMaterial.findUnique({
    where: { id },
    select: { sequence: { select: { objective: { select: { outcome: { select: { curriculumId: true } } } } } } },
  });
  const curriculumId = current?.sequence.objective.outcome.curriculumId;
  if (curriculumId) await snapshotMasterCurriculum(curriculumId, "Sebelum penghapusan Master Kurikulum");
  await prisma.learningMaterial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
