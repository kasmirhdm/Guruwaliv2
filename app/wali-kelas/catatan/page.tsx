"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, NotebookPen, Save } from "lucide-react";

type Period = { id: string; name: string; academicYear: string; semester: string; isActive: boolean };
type NoteRow = { id: string; note: string } | null;
type StudentRow = {
  id: string; name: string;
  schoolClass?: { id: string; name: string; grade?: string | null } | null;
  note: NoteRow;
};

const inputStyle: React.CSSProperties = { width: "100%", padding: "7px 8px", border: "1px solid #dce5e2", borderRadius: 8, fontSize: 12, boxSizing: "border-box" };

export default function CatatanWaliKelasPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [periodId, setPeriodId] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [noClass, setNoClass] = useState(false);

  useEffect(() => {
    fetch("/api/rapor")
      .then((r) => (r.ok ? r.json() : []))
      .then((p) => {
        setPeriods(p);
        const active = p.find((x: Period) => x.isActive) || p[0];
        if (active) setPeriodId(active.id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!periodId) return;
    fetch(`/api/wali-kelas/catatan?periodId=${periodId}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) { setMsg(d.error || "Gagal memuat catatan."); return; }
        setStudents(d.students || []);
        setNoClass((d.classes || []).length === 0);
        const dr: Record<string, string> = {};
        for (const s of d.students || []) dr[s.id] = s.note?.note || "";
        setDrafts(dr);
      })
      .catch(() => setMsg("Tidak dapat terhubung ke server."));
  }, [periodId]);

  const save = async (s: StudentRow) => {
    const r = await fetch("/api/wali-kelas/catatan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ periodId, studentId: s.id, note: drafts[s.id] || "" }),
    });
    const d = await r.json();
    setMsg(r.ok ? `Catatan ${s.name} tersimpan.` : d.error || "Gagal menyimpan.");
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f5f8f7", padding: 28, fontFamily: "Arial,sans-serif" }}>
      <header style={{ maxWidth: 900, margin: "0 auto 20px" }}>
        <Link href="/wali-kelas" style={{ color: "#15916c", textDecoration: "none", fontSize: 12 }}>
          <ArrowLeft size={14} /> Kembali ke Wali Kelas
        </Link>
        <p style={{ fontSize: 11, letterSpacing: 1.5, color: "#15916c", fontWeight: 800, marginTop: 18 }}>WALI KELAS</p>
        <h1 style={{ margin: "5px 0", fontSize: 28 }}>Catatan Wali Kelas</h1>
        <p style={{ color: "#748281", fontSize: 13 }}>Catatan ini tampil di rapor siswa pada periode yang dipilih.</p>
      </header>

      <section style={{ maxWidth: 900, margin: "0 auto", background: "#fff", border: "1px solid #e5ecea", borderRadius: 16, padding: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#394746" }}>Periode Rapor
          <select style={{ ...inputStyle, maxWidth: 420 }} value={periodId} onChange={(e) => setPeriodId(e.target.value)}>
            <option value="">Pilih periode</option>
            {periods.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.academicYear} • {p.semester})</option>)}
          </select>
        </label>
        {msg && <p style={{ fontSize: 12, color: "#15916c", marginTop: 10 }}>{msg}</p>}
        {noClass && <p style={{ fontSize: 12, color: "#899597", marginTop: 12 }}>Anda belum ditetapkan sebagai wali kelas pada sekolah periode ini.</p>}

        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {students.map((s) => (
            <div key={s.id} style={{ border: "1px solid #eef2f1", borderRadius: 12, padding: 14 }}>
              <b style={{ fontSize: 13 }}><NotebookPen size={13} /> {s.name}</b>
              <span style={{ fontSize: 11, color: "#899597", marginLeft: 8 }}>{s.schoolClass ? (s.schoolClass.grade ? s.schoolClass.grade + " " : "") + s.schoolClass.name : ""}</span>
              <textarea
                style={{ ...inputStyle, minHeight: 64, marginTop: 8 }}
                value={drafts[s.id] ?? ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [s.id]: e.target.value }))}
                placeholder="Tulis catatan wali kelas untuk siswa ini..."
              />
              <button onClick={() => save(s)} style={{ marginTop: 8, background: "#15916c", color: "#fff", border: 0, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                <Save size={13} /> Simpan Catatan
              </button>
            </div>
          ))}
          {periodId && !students.length && !noClass && (
            <p style={{ fontSize: 12, color: "#899597" }}>Belum ada siswa di kelas yang Anda walikan.</p>
          )}
        </div>
      </section>
    </main>
  );
}
