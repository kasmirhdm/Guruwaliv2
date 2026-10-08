import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePeriodAccess } from "@/lib/rapor-access";
import { rateLimit, clientKey } from "@/lib/rate-limit";

// Generate Deskripsi Rapor dengan AI (Gemini).
//
// Aturan produk (mengikat):
// - AI hanya menghasilkan TEKS deskripsi; endpoint ini TIDAK menulis database.
// - Nilai & predikat selalu dibaca dari GradeEntry tersimpan (bukan dari klien),
//   jadi AI tidak pernah bisa mengubah nilai.
// - Guru menyimpan hasil akhir secara eksplisit lewat PATCH /api/rapor/grades/[id]
//   setelah Generate -> Review -> Edit -> Regenerate -> Simpan.
//
// Input klien: periodId, studentId, subjectName, dan teks CP/TP/ATP/Materi
// pilihan guru (dari rantai kurikulum sekolah).

function clean(v: unknown, max = 1500): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  if (!rateLimit(`ai-generate:${clientKey(req)}`, 30, 60 * 1000))
    return NextResponse.json(
      { error: "Terlalu banyak permintaan AI. Tunggu sebentar lalu coba lagi." },
      { status: 429 }
    );
  const b = await req.json();
  if (!b.periodId || !b.studentId || !clean(b.subjectName, 120))
    return NextResponse.json(
      { error: "Periode, siswa, dan mata pelajaran wajib diisi." },
      { status: 400 }
    );
  const access = await requirePeriodAccess(String(b.periodId));
  if (access.response) return access.response;
  const period = access.period!;

  const student = await prisma.student.findFirst({
    where: { id: String(b.studentId), schoolId: period.schoolId },
    select: { id: true, name: true },
  });
  if (!student) return NextResponse.json({ error: "Siswa tidak ditemukan di sekolah ini." }, { status: 404 });

  const grade = await prisma.gradeEntry.findUnique({
    where: {
      periodId_studentId_subjectName: {
        periodId: period.id,
        studentId: student.id,
        subjectName: clean(b.subjectName, 120),
      },
    },
  });
  if (!grade || grade.finalScore === null)
    return NextResponse.json(
      { error: "Simpan nilai siswa ini terlebih dahulu sebelum membuat deskripsi." },
      { status: 400 }
    );

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      { error: "Fitur AI belum dikonfigurasi (GEMINI_API_KEY belum diisi di server)." },
      { status: 503 }
    );

  const cp = clean(b.cp);
  const tp = clean(b.tp);
  const atp = clean(b.atp);
  const materi = clean(b.materi);

  const prompt = [
    "Kamu adalah guru di Indonesia yang menulis deskripsi capaian rapor Kurikulum Merdeka.",
    "Tulis deskripsi capaian pembelajaran SATU siswa berikut ini dalam Bahasa Indonesia formal, positif, dan spesifik (2-4 kalimat).",
    "Sebutkan kekuatan capaian siswa berdasarkan CP/TP/ATP/materi yang dikuasai, lalu satu hal yang masih perlu ditingkatkan.",
    "Jangan menyebut angka nilai secara eksplisit. Jangan mengubah atau menilai ulang nilai. Tulis dalam sudut pandang laporan guru.",
    "",
    `Nama siswa: ${student.name}`,
    `Mata pelajaran: ${grade.subjectName}`,
    `CP (Capaian Pembelajaran): ${cp || "-"}`,
    `TP (Tujuan Pembelajaran): ${tp || "-"}`,
    `ATP (Alur Tujuan Pembelajaran): ${atp || "-"}`,
    `Materi: ${materi || "-"}`,
    `Nilai akhir: ${grade.finalScore}`,
    `Predikat: ${grade.predicate || "-"}`,
    "",
    "Tulis hanya teks deskripsinya saja, tanpa judul, tanpa pembuka/penutup surat.",
  ].join("\n");

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Gemini error", res.status, detail.slice(0, 300));
      return NextResponse.json(
        { error: "Layanan AI sedang bermasalah. Coba lagi sebentar." },
        { status: 502 }
      );
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("").trim();
    if (!text) return NextResponse.json({ error: "AI tidak menghasilkan teks. Coba lagi." }, { status: 502 });
    return NextResponse.json({ description: text });
  } catch (e) {
    console.error("Gemini fetch failed", e);
    return NextResponse.json(
      { error: "Tidak dapat menghubungi layanan AI. Periksa koneksi server." },
      { status: 502 }
    );
  }
}
