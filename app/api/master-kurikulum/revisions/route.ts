import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/require-auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  const guard = await requireRole(["GURUWALI_ADMIN"]);
  if (guard.response) return guard.response;
  const { searchParams } = new URL(req.url);
  const curriculumId = searchParams.get("curriculumId");
  if (!curriculumId) return NextResponse.json({ error: "curriculumId wajib diisi" }, { status: 400 });
  const revisions = await prisma.masterCurriculumRevision.findMany({
    where: { curriculumId },
    orderBy: { version: "desc" },
    select: { id: true, version: true, label: true, createdAt: true },
  });
  return NextResponse.json(revisions);
}
