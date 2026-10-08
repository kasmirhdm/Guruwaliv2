import { NextResponse } from "next/server";
import { requireRole } from "../../../../../lib/require-auth";
import { prisma } from "../../../../../lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(["GURUWALI_ADMIN"]);
  if (guard.response) return guard.response;
  const { id } = await params;
  const revision = await prisma.masterCurriculumRevision.findUnique({ where: { id } });
  if (!revision) return NextResponse.json({ error: "Versi tidak ditemukan" }, { status: 404 });
  return NextResponse.json(revision);
}
