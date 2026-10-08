import { NextResponse } from "next/server";
import { requireRole } from "../../../../../lib/require-auth";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(["GURUWALI_ADMIN"]);
  if (guard.response) return guard.response;
  const { id } = await params;
  const body = await req.json();
  const data = await prisma.masterSubject.update({
    where: { id },
    data: { name: body.name?.trim(), code: body.code ?? null, isActive: body.isActive ?? true },
  });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(["GURUWALI_ADMIN"]);
  if (guard.response) return guard.response;
  const { id } = await params;
  await prisma.masterSubject.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
