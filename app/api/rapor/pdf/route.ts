import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { requirePeriodAccess } from "@/lib/rapor-access";
import { getRaporData } from "@/lib/rapor-data";

// PDF Rapor Kurikulum Merdeka satu siswa (mengikuti pola kop sekolah
// pada PDF perangkat ajar: nama sekolah, alamat, NPSN, tanda tangan).
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const periodId = q.get("periodId");
  const studentId = q.get("studentId");
  if (!periodId || !studentId)
    return NextResponse.json({ error: "periodId dan studentId wajib diisi." }, { status: 400 });
  const access = await requirePeriodAccess(periodId);
  if (access.response) return access.response;
  const data = await getRaporData(periodId, studentId);
  if (!data) return NextResponse.json({ error: "Data rapor tidak ditemukan." }, { status: 404 });

  const { period, student, school, grades, waliNote } = data;
  const doc = new PDFDocument({ size: "A4", margin: 48 });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  // Kop sekolah
  doc.fontSize(15).font("Helvetica-Bold").text(school?.name || "Nama Sekolah", { align: "center" });
  if (school?.address) doc.fontSize(9).font("Helvetica").text(school.address, { align: "center" });
  if (school?.npsn) doc.fontSize(8).text("NPSN: " + school.npsn, { align: "center" });
  doc.moveDown(0.4).moveTo(48, doc.y).lineTo(547, doc.y).stroke().moveDown(1);

  doc.fontSize(16).font("Helvetica-Bold").text("RAPOR HASIL BELAJAR", { align: "center" });
  doc.fontSize(11).font("Helvetica").text(period.name, { align: "center" }).moveDown(1);

  // Identitas siswa
  const kelas = student.schoolClass
    ? `${student.schoolClass.grade ? student.schoolClass.grade + " " : ""}${student.schoolClass.name}`
    : "-";
  const identitas: [string, string][] = [
    ["Nama Siswa", student.name],
    ["NIS / NISN", [student.nis, student.nisn].filter(Boolean).join(" / ") || "Belum diisi"],
    ["Kelas", kelas],
    ["Tahun Ajaran", period.academicYear],
    ["Semester", period.semester],
  ];
  for (const [a, b] of identitas) {
    doc.fontSize(9.5).font("Helvetica-Bold").text(a + ": ", { continued: true });
    doc.font("Helvetica").text(b);
  }
  doc.moveDown(1);

  // Tabel nilai (tata letak teks sederhana, konsisten dengan gaya PDF perangkat)
  doc.fontSize(12).font("Helvetica-Bold").text("Capaian Pembelajaran").moveDown(0.4);
  if (!grades.length) {
    doc.fontSize(9.5).font("Helvetica").text("Belum ada nilai pada periode ini.");
  }
  grades.forEach((g, i) => {
    doc.fontSize(10).font("Helvetica-Bold").text(`${i + 1}. ${g.subjectName}`);
    doc
      .fontSize(9.5)
      .font("Helvetica")
      .text(
        `Nilai Akhir: ${g.finalScore ?? "-"}   Predikat: ${g.predicate ?? "-"}`
      );
    if (g.description)
      doc.fontSize(9.5).text("Deskripsi: " + g.description, { lineGap: 2 });
    doc.moveDown(0.5);
  });

  // Catatan wali kelas
  doc.moveDown(0.6).fontSize(12).font("Helvetica-Bold").text("Catatan Wali Kelas").moveDown(0.3);
  doc.fontSize(9.5).font("Helvetica").text(waliNote?.note || "-", { lineGap: 3 });

  // Tanda tangan
  doc.moveDown(2);
  const y = doc.y;
  const waliName = student.schoolClass?.homeroomTeacher?.name || "____________________";
  doc.fontSize(9.5).text("Wali Kelas", 48, y);
  doc.text("Mengetahui, Kepala Sekolah", 330, y);
  doc.moveDown(3);
  doc.font("Helvetica-Bold").text(waliName, 48);
  doc.text(school?.principalName || "____________________", 330, doc.y - 12);
  if (school?.principalNip) doc.font("Helvetica").fontSize(8.5).text("NIP. " + school.principalNip, 330);

  doc.end();
  const buffer = await done;
  const filename = ("Rapor-" + student.name).replace(/[^a-zA-Z0-9_-]+/g, "-") + ".pdf";
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
