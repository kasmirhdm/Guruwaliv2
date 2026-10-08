"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Plus, Trash2, HelpCircle } from "lucide-react";

type Question = {
  id: string; subjectName: string; type: string; question: string;
  options?: string[] | null; answer: string; explanation?: string | null;
  difficulty: string; ownerUserId: string; schoolId?: string | null;
};

const inputStyle: React.CSSProperties = { width: "100%", padding: "7px 8px", border: "1px solid #dce5e2", borderRadius: 8, fontSize: 12, boxSizing: "border-box" };

export default function BankSoalPage() {
  const [items, setItems] = useState<Question[]>([]);
  const [filter, setFilter] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [type, setType] = useState("PILIHAN_GANDA");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("SEDANG");
  const [shareSchool, setShareSchool] = useState(false);
  const [mySchoolId, setMySchoolId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const q = filter ? `?search=${encodeURIComponent(filter)}` : "";
    const r = await fetch(`/api/bank-soal${q}`);
    if (r.ok) setItems(await r.json());
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => {
    fetch("/api/perangkat/kelas")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => { if (rows[0]) setMySchoolId(rows[0].schoolId); })
      .catch(() => {});
  }, []);

  const save = async () => {
    const r = await fetch("/api/bank-soal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectName, type, question,
        options: type === "PILIHAN_GANDA" ? options.filter((o) => o.trim()) : undefined,
        answer, explanation, difficulty,
        schoolId: shareSchool ? mySchoolId : undefined,
      }),
    });
    const d = await r.json();
    if (!r.ok) { setMsg(d.error || "Gagal menyimpan soal."); return; }
    setMsg("Soal tersimpan.");
    setQuestion(""); setAnswer(""); setExplanation(""); setOptions(["", "", "", ""]);
    await load();
  };

  const remove = async (id: string) => {
    const r = await fetch(`/api/bank-soal/${id}`, { method: "DELETE" });
    const d = await r.json();
    if (!r.ok) { setMsg(d.error || "Gagal menghapus."); return; }
    await load();
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f5f8f7", padding: 28, fontFamily: "Arial,sans-serif" }}>
      <header style={{ maxWidth: 1000, margin: "0 auto 20px" }}>
        <Link href="/" style={{ color: "#15916c", textDecoration: "none", fontSize: 12 }}>
          <ArrowLeft size={14} /> Kembali ke Beranda
        </Link>
        <p style={{ fontSize: 11, letterSpacing: 1.5, color: "#15916c", fontWeight: 800, marginTop: 18 }}>BANK SOAL</p>
        <h1 style={{ margin: "5px 0", fontSize: 28 }}>Bank Soal</h1>
        <p style={{ color: "#748281", fontSize: 13 }}>Kumpulan soal milik Anda{shareSchool ? "" : ""} — dapat dibagikan ke sekolah agar dipakai rekan guru.</p>
      </header>

      <section style={{ maxWidth: 1000, margin: "0 auto 18px", background: "#fff", border: "1px solid #e5ecea", borderRadius: 16, padding: 20 }}>
        <b style={{ fontSize: 13 }}><Plus size={14} /> Tambah Soal</b>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#394746" }}>Mata Pelajaran
            <input style={inputStyle} value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="cth: Matematika" />
          </label>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#394746" }}>Tipe
            <select style={inputStyle} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="PILIHAN_GANDA">Pilihan Ganda</option>
              <option value="ISIAN">Isian</option>
              <option value="ESAI">Esai</option>
            </select>
          </label>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#394746" }}>Kesulitan
            <select style={inputStyle} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option>MUDAH</option><option>SEDANG</option><option>SULIT</option>
            </select>
          </label>
        </div>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#394746", display: "block", marginTop: 12 }}>Soal
          <textarea style={{ ...inputStyle, minHeight: 70 }} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Tulis pertanyaan..." />
        </label>
        {type === "PILIHAN_GANDA" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            {options.map((o, i) => (
              <label key={i} style={{ fontSize: 12, fontWeight: 700, color: "#394746" }}>Pilihan {String.fromCharCode(65 + i)}
                <input style={inputStyle} value={o} onChange={(e) => setOptions((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))} />
              </label>
            ))}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#394746" }}>Kunci Jawaban
            <input style={inputStyle} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={type === "PILIHAN_GANDA" ? "cth: B" : "Jawaban benar"} />
          </label>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#394746" }}>Pembahasan (opsional)
            <input style={inputStyle} value={explanation} onChange={(e) => setExplanation(e.target.value)} />
          </label>
        </div>
        {mySchoolId && (
          <label style={{ fontSize: 12, color: "#394746", display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
            <input type="checkbox" checked={shareSchool} onChange={(e) => setShareSchool(e.target.checked)} />
            Bagikan ke sekolah saya (rekan guru dapat melihat)
          </label>
        )}
        {msg && <p style={{ fontSize: 12, color: "#15916c", marginTop: 10 }}>{msg}</p>}
        <button onClick={save} style={{ marginTop: 14, background: "#15916c", color: "#fff", border: 0, padding: "10px 18px", borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
          <Plus size={14} /> Simpan Soal
        </button>
      </section>

      <section style={{ maxWidth: 1000, margin: "0 auto", background: "#fff", border: "1px solid #e5ecea", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <b style={{ fontSize: 13 }}><BookOpen size={14} /> Daftar Soal ({items.length})</b>
          <input style={{ ...inputStyle, maxWidth: 260, marginLeft: "auto" }} value={filter} onChange={(e) => setFilter(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Cari soal lalu Enter" />
        </div>
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {items.map((q) => (
            <div key={q.id} style={{ border: "1px solid #eef2f1", borderRadius: 12, padding: 14 }}>
              <b style={{ fontSize: 13 }}><HelpCircle size={13} /> {q.subjectName}</b>
              <span style={{ fontSize: 11, color: "#899597", marginLeft: 8 }}>{q.type} • {q.difficulty}{q.schoolId ? " • Dibagikan ke sekolah" : ""}</span>
              <p style={{ fontSize: 12.5, margin: "8px 0 0", lineHeight: 1.6 }}>{q.question}</p>
              {Array.isArray(q.options) && (
                <ol type="A" style={{ fontSize: 12, margin: "6px 0 0", paddingLeft: 22 }}>
                  {q.options.map((o, i) => <li key={i}>{o}</li>)}
                </ol>
              )}
              <p style={{ fontSize: 12, margin: "8px 0 0" }}>Kunci: <b>{q.answer}</b></p>
              {q.explanation && <p style={{ fontSize: 12, color: "#748281", margin: "4px 0 0" }}>{q.explanation}</p>}
              <button onClick={() => remove(q.id)} style={{ marginTop: 8, background: "#fdecec", color: "#b3261e", border: 0, borderRadius: 8, padding: "6px 10px", fontSize: 11, cursor: "pointer" }}>
                <Trash2 size={12} /> Hapus
              </button>
            </div>
          ))}
          {!items.length && <p style={{ fontSize: 12, color: "#899597" }}>Belum ada soal.</p>}
        </div>
      </section>
    </main>
  );
}
