import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requirePeriodAccess,
  canEditGrade,
  predicateFor,
  resolveFinalScore,
  numOrNull,
} from "@/lib/rapor-access";

async function loadGrade(id: string) {
  const grade = await prisma.gradeEntry.findUnique({ where: { id } });
  if (!grade) return { grade: null, access: null, response: NextResponse.json({ error: "Nilai tidak ditemukan." }, { status: 404 }) };
  const access = await requirePeriodAccess(grade.periodId);
  if (access.response) return { grade, access: null, response: access.response };
  if (!canEditGrade(access.membership!.role, access.user!.id, grade.teacherId))
    return {
      grade,
      access: null,
      response: NextResponse.json(
        { error: "Nilai ini diinput guru lain; hanya pemilik atau Admin Sekolah yang dapat mengubahnya." },
        { status: 403 }
      ),
    };
  return { grade, access, response: null };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { grade, response } = await loadGrade(id);
  if (response) return response;
  const b = await req.json();
  const knowledge = b.knowledge !== undefined ? numOrNull(b.knowledge) : grade!.knowledge;
  const skill = b.skill !== undefined ? numOrNull(b.skill) : grade!.skill;
  const finalScore =
    b.finalScore !== undefined || b.knowledge !== undefined || b.skill !== undefined
      ? resolveFinalScore({ knowledge, skill, finalScore: numOrNull(b.finalScore) })
      : grade!.finalScore;
  const updated = await prisma.gradeEntry.update({
    where: { id },
    data: {
      knowledge,
      skill,
      finalScore,
      predicate:
        typeof b.predicate === "string"
          ? b.predicate.trim() || predicateFor(finalScore)
          : b.finalScore !== undefined || b.knowledge !== undefined || b.skill !== undefined
            ? predicateFor(finalScore)
            : grade!.predicate,
      description: typeof b.description === "string" ? b.description : grade!.description,
      subjectId: typeof b.subjectId === "string" ? b.subjectId : grade!.subjectId,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { response } = await loadGrade(id);
  if (response) return response;
  await prisma.gradeEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
