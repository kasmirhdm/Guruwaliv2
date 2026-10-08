import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/require-auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const guard = await requireRole(["GURUWALI_ADMIN"]);
  if (guard.response) return guard.response;
  return NextResponse.json(await prisma.masterSubject.findMany({ orderBy: { name: "asc" } }));
}

export async function POST(req: Request) {
  const guard = await requireRole(["GURUWALI_ADMIN"]);
  if (guard.response) return guard.response;
  const body = await req.json();
  if (!body.name?.trim()) return NextResponse.json({ error: "Nama mata pelajaran wajib diisi" }, { status: 400 });
  const data = await prisma.masterSubject.create({
    data: { name: body.name.trim(), code: body.code || null },
  });
  return NextResponse.json(data, { status: 201 });
}
