"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck, Save, Trash2, BarChart3 } from "lucide-react";

type Period = { id: string; name: string; academicYear: string; semester: string; isActive: boolean; _count?: { grades: number } };
type ClassRow = { id: string; name: string; grade?: string | null };
type Grade = {
  id: string; subjectName: string; knowledge: number | null; skill: number | null;
  finalScore: number | null; predicate: string | null; description: string | null; teacherId: string | null;
} | null;
type StudentRow = {
  id: string; name: string; nis?: string | null; nisn?: string | null;
  schoolClass?: { id: string; name: string; grade?: string | null } | null; grade: Grade;
};
type Draft = { knowledge: string; skill: string; finalScore: string; predicate: string; description: string };
type Rekap = {
  totalStudents: number; totalGrades: number;
  subjects: { subjectName: string; count: number; average: number | null; min: number | null; max: number | null; predicates: Record<string, number> }[];
  students: { studentId: string; name: string; subjectsGraded: number; average: number | null }[];
};

const inputStyle: React.CSSProperties = { width: "100%", padding: "7px 8px", border: "1px solid #dce5e2", borderRadius: 8, fontSize: 12, boxSizing: "border-box" };

export default function PenilaianPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [periodId, setPeriodId] = useState("");
  const [classId, setClassId] = useState("");
  const [subject, setSubject] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [rekap, setRekap] = useState<Rekap | null>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/rapor").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/perangkat/kelas").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([p, c]) => {
        setPeriods(p);
        setClasses(c);
        const active = p.find((x: Period) => x.isActive) || p[0];
        if (active) setPeriodId(active.id);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadGrades = async () => {
    if (!periodId) return;
    const q = new URLSearchParams({ periodId });
    if (classId) q.set("schoolClassId", classId);
    if (subject.trim()) q.set("subjectName", subject.trim());
    const r = await fetch(`/api/rapor/grades?${q}`);
    const d = await r.json();
    if (!r.ok) { setMsg(d.error || "Gagal memuat nilai."); return; }
    setStudents(d.students || []);
    const dr: Record<string, Draft> = {};
    for (const s of d.students || []) {
      const g = s.grade;
      dr[s.id] = {
        knowledge: g?.knowledge ?? "",
        skill: g?.skill ?? "",
        finalScore: g?.finalScore ?? "",
        predicate: g?.predicate ?? "",
        description: g?.description ?? "",
      };
    }
    setDrafts(dr);
  };

  const loadRekap = async () => {
    if (!periodId) return;
    const q = new URLSearchParams({ periodId });
    if (classId) q.set("schoolClassId", classId);
    const r = await fetch(`/api/rapor/rekap?${q}`);
    if (r.ok) setRekap(await r.json());
  };

  useEffect(() => { if (periodId) { loadGrades(); loadRekap(); } /* eslint-disable-next-line */ }, [periodId, classId]);

  const setDraft = (sid: string, k: keyof Draft, v: string) =>
    setDrafts((d) => ({ ...d, [sid]: { ...d[sid], [k]: v } }));

  const save = async (s: StudentRow) => {
    if (!subject.trim()) { setMsg("Isi nama mata pelajaran dulu."); return; }
    const d = drafts[s.id];
    const r = await fetch("/api/rapor/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        periodId, studentId: s.id, subjectName: subject.trim(),
        knowledge: d.knowledge, skill: d.skill, finalScore: d.finalScore,
        predicate: d.predicate, description: d.description,
      }),
    });
    const x = await r.json();
    if (!r.ok) { setMsg(x.error || "Gagal menyimpan."); return; }
    setMsg(`Nilai ${s.name} tersimpan.`);
    await loadGrades(); await loadRekap();
  };

  const remove = async (s: StudentRow) => {
    if (!s.grade?.id) return;
    const r = await fetch(`/api/rapor/grades/${s.grade.id}`, { method: "DELETE" });
    const x = await r.json();
    if (!r.ok) { setMsg(x.error || "Gagal menghapus."); return; }
    setMsg(`Nilai ${s.name} dihapus.`);
    await loadGrades(); await loadRekap();
  };

  const period = useMemo(() => periods.find((p) => p.id === periodId), [periods, periodId]);

  return (
    <main style={{ minHeight: "100vh", background: "#f5f8f7", padding: 28, fontFamily: "Arial,sans-serif" }}>
      <header style={{ maxWidth: 1100, margin: "0 auto 20px" }}>
        <Link href="/" style={{ color: "#15916c", textDecoration: "none", fontSize: 12 }}>
          <ArrowLeft size={14} /> Kembali ke Beranda
        </Link>
        <p style={{ fontSize: 11, letterSpacing: 1.5, color: "#15916c", fontWeight: 800, marginTop: 18 }}>PENILAIAN & REKAP</p>
        <h1 style={{ margin: "5px 0", fontSize: 28 }}>Penilaian Rapor</h1>
        <p style={{ color: "#748281", fontSize: 13 }}>Input nilai per periode, mata pelajaran, dan kelas. Nilai akhir & predikat terhitung otomatis bila dikosongkan.</p>
      </header>

      <section style={{ maxWidth: 1100, margin: "0 auto", background: "#fff", border: "1px solid #e5ecea", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#394746" }}>Periode Rapor
            <select style={inputStyle} value={periodId} onChange={(e) => setPeriodId(e.target.value)}>
              <option value="">Pilih periode</option>
              {periods.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.academicYear} • {p.semester}){p.isActive ? " • Aktif" : ""}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#394746" }}>Kelas
            <select style={inputStyle} value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">Semua kelas</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.grade ? c.grade + " " : ""}{c.name}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#394746" }}>Mata Pelajaran
            <input style={inputStyle} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="cth: Matematika" />
          </label>
          <div style={{ alignSelf: "end" }}>
            <button onClick={loadGrades} style={{ background: "#15916c", color: "#fff", border: 0, padding: "9px 16px", borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
              <ClipboardCheck size={14} /> Muat Nilai
            </button>
          </div>
        </div>
        {msg && <p style={{ fontSize: 12, color: "#15916c", marginTop: 10 }}>{msg}</p>}

        {loading ? <p style={{ fontSize: 12, color: "#899597" }}>Memuat...</p> : !period ? (
          <p style={{ fontSize: 12, color: "#899597", marginTop: 14 }}>Belum ada periode rapor. Admin Sekolah dapat membuat periode lewat API rapor.</p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 14 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#748281" }}>
                  <th style={{ padding: 8 }}>Siswa</th><th>Pengetahuan</th><th>Keterampilan</th>
                  <th>Nilai Akhir</th><th>Predikat</th><th style={{ minWidth: 220 }}>Deskripsi Capaian</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} style={{ borderTop: "1px solid #eef2f1" }}>
                    <td style={{ padding: 8 }}><b>{s.name}</b><span style={{ display: "block", color: "#899597" }}>{s.schoolClass ? (s.schoolClass.grade ? s.schoolClass.grade + " " : "") + s.schoolClass.name : "Tanpa kelas"}</span></td>
                    <td><input style={inputStyle} type="number" min={0} max={100} value={drafts[s.id]?.knowledge ?? ""} onChange={(e) => setDraft(s.id, "knowledge", e.target.value)} /></td>
                    <td><input style={inputStyle} type="number" min={0} max={100} value={drafts[s.id]?.skill ?? ""} onChange={(e) => setDraft(s.id, "skill", e.target.value)} /></td>
                    <td><input style={inputStyle} type="number" min={0} max={100} value={drafts[s.id]?.finalScore ?? ""} onChange={(e) => setDraft(s.id, "finalScore", e.target.value)} placeholder="otomatis" /></td>
                    <td><input style={inputStyle} value={drafts[s.id]?.predicate ?? ""} onChange={(e) => setDraft(s.id, "predicate", e.target.value)} placeholder="otomatis" /></td>
                    <td><textarea style={{ ...inputStyle, minHeight: 54 }} value={drafts[s.id]?.description ?? ""} onChange={(e) => setDraft(s.id, "description", e.target.value)} placeholder="Deskripsi capaian siswa..." /></td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button onClick={() => save(s)} title="Simpan" style={{ background: "#15916c", color: "#fff", border: 0, borderRadius: 8, padding: "7px 10px", cursor: "pointer", marginRight: 6 }}><Save size={13} /></button>
                      {s.grade?.id && <button onClick={() => remove(s)} title="Hapus nilai" style={{ background: "#fdecec", color: "#b3261e", border: 0, borderRadius: 8, padding: "7px 10px", cursor: "pointer" }}><Trash2 size={13} /></button>}
                    </td>
                  </tr>
                ))}
                {!students.length && <tr><td colSpan={7} style={{ padding: 12, color: "#899597" }}>Tidak ada siswa pada filter ini.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {rekap && period && (
        <section style={{ maxWidth: 1100, margin: "18px auto 0", background: "#fff", border: "1px solid #e5ecea", borderRadius: 16, padding: 20 }}>
          <h2 style={{ fontSize: 16, margin: "0 0 4px" }}><BarChart3 size={16} /> Rekap — {period.name}</h2>
          <p style={{ fontSize: 12, color: "#748281" }}>{rekap.totalGrades} nilai dari {rekap.totalStudents} siswa.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12, marginTop: 12 }}>
            {rekap.subjects.map((s) => (
              <div key={s.subjectName} style={{ background: "#f7faf9", borderRadius: 12, padding: 14 }}>
                <b style={{ fontSize: 13 }}>{s.subjectName}</b>
                <p style={{ fontSize: 12, color: "#394746", margin: "6px 0 0" }}>Rata-rata: <b>{s.average ?? "-"}</b> • Min {s.min ?? "-"} • Maks {s.max ?? "-"}</p>
                <p style={{ fontSize: 11, color: "#748281", margin: "4px 0 0" }}>{Object.entries(s.predicates).map(([k, v]) => `${k}: ${v}`).join(" • ") || "Belum ada predikat"}</p>
              </div>
            ))}
            {!rekap.subjects.length && <p style={{ fontSize: 12, color: "#899597" }}>Belum ada nilai untuk direkap.</p>}
          </div>
        </section>
      )}
    </main>
  );
}
