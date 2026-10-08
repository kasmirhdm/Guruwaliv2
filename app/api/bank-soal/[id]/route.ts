import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Ubah/hapus soal: hanya pemilik soal atau Admin GuruWali.
async function requireOwnedQuestion(id: string) {
  const user = await getCurrentUser();
  if (!user)
    return { user: null, question: null, response: NextResponse.json({ error: "Anda harus login." }, { status: 401 }) };
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question)
    return { user, question: null, response: NextResponse.json({ error: "Soal tidak ditemukan." }, { status: 404 }) };
  if (question.ownerUserId !== user.id && user.role !== "GURUWALI_ADMIN")
    return {
      user,
      question,
      response: NextResponse.json({ error: "Hanya pemilik soal yang dapat mengubahnya." }, { status: 403 }),
    };
  return { user, question, response: null };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { question, response } = await requireOwnedQuestion(id);
  if (response) return response;
  const b = await req.json();
  const updated = await prisma.question.update({
    where: { id },
    data: {
      subjectName: typeof b.subjectName === "string" ? b.subjectName : question!.subjectName,
      question: typeof b.question === "string" ? b.question : question!.question,
      answer: typeof b.answer === "string" ? b.answer : question!.answer,
      explanation: typeof b.explanation === "string" ? b.explanation : question!.explanation,
      type: typeof b.type === "string" ? b.type : question!.type,
      difficulty: typeof b.difficulty === "string" ? b.difficulty : question!.difficulty,
      options: Array.isArray(b.options) ? b.options.map((o: unknown) => String(o)) : question!.options ?? undefined,
      outcomeId: typeof b.outcomeId === "string" ? b.outcomeId : question!.outcomeId,
      objectiveId: typeof b.objectiveId === "string" ? b.objectiveId : question!.objectiveId,
      sequenceId: typeof b.sequenceId === "string" ? b.sequenceId : question!.sequenceId,
      materialId: typeof b.materialId === "string" ? b.materialId : question!.materialId,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { response } = await requireOwnedQuestion(id);
  if (response) return response;
  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
