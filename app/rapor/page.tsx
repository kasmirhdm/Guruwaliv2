"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Printer } from "lucide-react";

type Period = { id: string; name: string; academicYear: string; semester: string; isActive: boolean };
type ClassRow = { id: string; name: string; grade?: string | null };
type StudentLite = { id: string; name: string; schoolClass?: { id: string; name: string; grade?: string | null } | null };
type RaporData = {
  period: Period & { academicYear: string; semester: string };
  student: StudentLite & { nis?: string | null; nisn?: string | null; schoolClass?: (ClassRow & { homeroomTeacher?: { name: string } | null }) | null };
  school?: { name: string; address?: string | null; npsn?: string | null; principalName?: string | null } | null;
  grades: { id: string; subjectName: string; finalScore: number | null; predicate: string | null; description: string | null }[];
  waliNote?: { note: string } | null;
};

const inputStyle: React.CSSProperties = { width: "100%", padding: "7px 8px", border: "1px solid #dce5e2", borderRadius: 8, fontSize: 12, boxSizing: "border-box" };

export default function RaporPreviewPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [periodId, setPeriodId] = useState("");
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState<StudentLite[]>([]);
  const [studentId, setStudentId] = useState("");
  const [data, setData] = useState<RaporData | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/rapor").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/perangkat/kelas").then((r) => (r.ok ? r.json() : [])),
    ]).then(([p, c]) => {
      setPeriods(p); setClasses(c);
      const active = p.find((x: Period) => x.isActive) || p[0];
      if (active) setPeriodId(active.id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!periodId) return;
    const q = new URLSearchParams({ periodId });
    if (classId) q.set("schoolClassId", classId);
    fetch(`/api/rapor/grades?${q}`)
      .then((r) => (r.ok ? r.json() : { students: [] }))
      .then((d) => setStudents(d.students || []))
      .catch(() => {});
  }, [periodId, classId]);

  const loadPreview = async (sid: string) => {
    setStudentId(sid);
    if (!sid) { setData(null); return; }
    const r = await fetch(`/api/rapor/preview?periodId=${periodId}&studentId=${sid}`);
    const d = await r.json();
    if (!r.ok) { setMsg(d.error || "Gagal memuat rapor."); setData(null); return; }
    setMsg("");
    setData(d);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f5f8f7", padding: 28, fontFamily: "Arial,sans-serif" }}>
      <header style={{ maxWidth: 900, margin: "0 auto 20px" }}>
        <Link href="/penilaian" style={{ color: "#15916c", textDecoration: "none", fontSize: 12 }}>
          <ArrowLeft size={14} /> Kembali ke Penilaian
        </Link>
        <p style={{ fontSize: 11, letterSpacing: 1.5, color: "#15916c", fontWeight: 800, marginTop: 18 }}>RAPOR</p>
        <h1 style={{ margin: "5px 0", fontSize: 28 }}>Preview Rapor Siswa</h1>
        <p style={{ color: "#748281", fontSize: 13 }}>Periksa tampilan rapor sebelum mengunduh PDF resmi.</p>
      </header>

      <section style={{ maxWidth: 900, margin: "0 auto 18px", background: "#fff", border: "1px solid #e5ecea", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#394746" }}>Periode
            <select style={inputStyle} value={periodId} onChange={(e) => { setPeriodId(e.target.value); setData(null); setStudentId(""); }}>
              <option value="">Pilih periode</option>
              {periods.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.academicYear} • {p.semester})</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#394746" }}>Kelas
            <select style={inputStyle} value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">Semua kelas</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.grade ? c.grade + " " : ""}{c.name}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#394746" }}>Siswa
            <select style={inputStyle} value={studentId} onChange={(e) => loadPreview(e.target.value)}>
              <option value="">Pilih siswa</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
        </div>
        {msg && <p style={{ fontSize: 12, color: "#b3261e", marginTop: 10 }}>{msg}</p>}
      </section>

      {data && (
        <section style={{ maxWidth: 900, margin: "0 auto", background: "#fff", border: "1px solid #e5ecea", borderRadius: 16, padding: 32 }}>
          <div style={{ textAlign: "center", borderBottom: "2px solid #394746", paddingBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>{data.school?.name || "Nama Sekolah"}</h2>
            {data.school?.address && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#748281" }}>{data.school.address}</p>}
            {data.school?.npsn && <p style={{ margin: "2px 0 0", fontSize: 10, color: "#748281" }}>NPSN: {data.school.npsn}</p>}
          </div>
          <h3 style={{ textAlign: "center", fontSize: 16, margin: "16px 0 4px" }}>RAPOR HASIL BELAJAR</h3>
          <p style={{ textAlign: "center", fontSize: 12, color: "#748281", margin: 0 }}>{data.period.name} • {data.period.academicYear} • Semester {data.period.semester}</p>

          <div style={{ marginTop: 18, fontSize: 13, display: "grid", gridTemplateColumns: "160px 1fr", gap: "4px 12px" }}>
            <b>Nama Siswa</b><span>{data.student.name}</span>
            <b>NIS / NISN</b><span>{[data.student.nis, data.student.nisn].filter(Boolean).join(" / ") || "-"}</span>
            <b>Kelas</b><span>{data.student.schoolClass ? (data.student.schoolClass.grade ? data.student.schoolClass.grade + " " : "") + data.student.schoolClass.name : "-"}</span>
            <b>Wali Kelas</b><span>{data.student.schoolClass?.homeroomTeacher?.name || "-"}</span>
          </div>

          <h4 style={{ fontSize: 14, margin: "22px 0 8px" }}>Capaian Pembelajaran</h4>
          {!data.grades.length && <p style={{ fontSize: 12, color: "#899597" }}>Belum ada nilai pada periode ini.</p>}
          {data.grades.map((g, i) => (
            <div key={g.id} style={{ borderTop: "1px solid #eef2f1", padding: "10px 0" }}>
              <b style={{ fontSize: 13 }}>{i + 1}. {g.subjectName}</b>
              <span style={{ fontSize: 12, color: "#394746", marginLeft: 10 }}>Nilai Akhir: <b>{g.finalScore ?? "-"}</b> • Predikat: <b>{g.predicate ?? "-"}</b></span>
              {g.description && <p style={{ fontSize: 12, color: "#394746", margin: "6px 0 0", lineHeight: 1.6 }}>{g.description}</p>}
            </div>
          ))}

          <h4 style={{ fontSize: 14, margin: "22px 0 8px" }}>Catatan Wali Kelas</h4>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: "#394746" }}>{data.waliNote?.note || "-"}</p>

          <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
            <a href={`/api/rapor/pdf?periodId=${periodId}&studentId=${studentId}`} style={{ background: "#15916c", color: "#fff", padding: "10px 18px", borderRadius: 9, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
              <Printer size={14} /> Unduh PDF Rapor
            </a>
            <Link href="/wali-kelas/catatan" style={{ background: "#f3f8f6", color: "#15916c", padding: "10px 18px", borderRadius: 9, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
              <FileText size={14} /> Edit Catatan Wali Kelas
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
