import { NextResponse } from "next/server";
import { requireRole } from "../../../../../lib/require-auth";
import { prisma } from "../../../../../lib/prisma";
import { snapshotMasterCurriculum } from "../../../../../lib/master-curriculum-revision";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(["GURUWALI_ADMIN"]);
  if (guard.response) return guard.response;
  const { id } = await params;
  const data = await prisma.curriculum.findUnique({
    where: { id },
    include: { phases: true, outcomes: true },
  });
  if (!data) return NextResponse.json({ error: "Kurikulum tidak ditemukan" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(["GURUWALI_ADMIN"]);
  if (guard.response) return guard.response;
  const { id } = await params;
  const body = await req.json();
  await snapshotMasterCurriculum(id, "Sebelum perubahan Kurikulum");
  const data = await prisma.curriculum.update({
    where: { id },
    data: { name: body.name?.trim(), description: body.description ?? null },
  });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(["GURUWALI_ADMIN"]);
  if (guard.response) return guard.response;
  const { id } = await params;
  await snapshotMasterCurriculum(id, "Sebelum penghapusan Kurikulum");
  await prisma.curriculum.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
