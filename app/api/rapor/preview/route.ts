import { NextResponse } from "next/server";
import { requirePeriodAccess } from "@/lib/rapor-access";
import { getRaporData } from "@/lib/rapor-data";

// Data preview rapor satu siswa (dipakai halaman preview sebelum cetak PDF).
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const periodId = q.get("periodId");
  const studentId = q.get("studentId");
  if (!periodId || !studentId)
    return NextResponse.json({ error: "periodId dan studentId wajib diisi." }, { status: 400 });
  const access = await requirePeriodAccess(periodId);
  if (access.response) return access.response;
  const data = await getRaporData(periodId, studentId);
  if (!data) return NextResponse.json({ error: "Data rapor tidak ditemukan." }, { status: 404 });
  return NextResponse.json(data);
}
