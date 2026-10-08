"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {ArrowLeft,BookOpen,FileText,Save,ChevronRight,Target,Route,Layers} from "lucide-react";

const types=[["MODUL_AJAR","Modul Ajar"],["LKPD","LKPD"],["BAHAN_AJAR","Bahan Ajar"],["ASESMEN","Asesmen"],["KISI_KISI","Kisi-Kisi"],["PROGRAM_SEMESTER","Program Semester"],["PROGRAM_TAHUNAN","Program Tahunan"]];
const api={curricula:"/api/master-kurikulum/curricula",phases:"/api/master-kurikulum/phases",outcomes:"/api/master-kurikulum/outcomes",objectives:"/api/master-kurikulum/objectives",sequences:"/api/master-kurikulum/sequences",materials:"/api/master-kurikulum/materials"};

export default function PerangkatPage(){
 const [type,setType]=useState("MODUL_AJAR");
 const [refs,setRefs]=useState<any>({});
 const [form,setForm]=useState<any>({ownerUserId:"demo-teacher",title:"",subjectName:"",className:"",academicYear:"2026/2027"});
 const [saving,setSaving]=useState(false); const [message,setMessage]=useState("");
 useEffect(()=>{Promise.all(Object.entries(api).map(async ([k,u])=>[k,await fetch(u).then(r=>r.ok?r.json():[])])).then(x=>setRefs(Object.fromEntries(x as any))).catch(()=>{})},[]);
 const set=(k:string,v:string)=>setForm((f:any)=>({...f,[k]:v}));
 const save=async()=>{setSaving(true);setMessage("");try{const r=await fetch("/api/perangkat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,type})});const d=await r.json();setMessage(r.ok?"Perangkat berhasil disimpan sebagai draft.":d.error||"Gagal menyimpan.");}catch{setMessage("Tidak dapat terhubung ke server.")}finally{setSaving(false)}};
 const dropdown=(label:string,key:string,list:any[])=> <label>{label}<select value={form[key]||""} onChange={e=>set(key,e.target.value)}><option value="">Pilih {label}</option>{list.map(x=><option key={x.id} value={x.id}>{x.name||x.title||x.content?.slice(0,70)}</option>)}</select></label>;
 return <main className="paShell">
  <header className="paTop"><div><Link href="/" className="back"><ArrowLeft size={16}/> Kembali ke Beranda</Link><p className="eyebrow">PERANGKAT AJAR</p><h1>Buat Perangkat Ajar</h1><p className="muted">Gunakan Master Kurikulum sebagai referensi tanpa mengubah data master.</p></div><div className="paBadge"><BookOpen size={18}/> Guru • Matematika</div></header>
  <div className="typeGrid">{types.map(([v,l])=><button className={type===v?"type active":"type"} onClick={()=>setType(v)} key={v}><FileText size={16}/>{l}</button>)}</div>
  <section className="paCard"><h2>Informasi Perangkat</h2><p className="muted">Tentukan identitas perangkat yang akan dibuat.</p><div className="formGrid"><label>Judul Perangkat<input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Contoh: Modul Ajar Persamaan Kuadrat"/></label><label>Mata Pelajaran<input value={form.subjectName} onChange={e=>set("subjectName",e.target.value)} placeholder="Matematika"/></label><label>Kelas<input value={form.className} onChange={e=>set("className",e.target.value)} placeholder="IX"/></label><label>Tahun Ajaran<input value={form.academicYear} onChange={e=>set("academicYear",e.target.value)}/></label></div></section>
  <section className="paCard"><div className="paHead"><div><h2>Referensi Master Kurikulum</h2><p className="muted">Pilih hubungan pembelajaran dari data Master.</p></div><span className="masterPill">MASTER PLATFORM</span></div><div className="formGrid">{dropdown("Kurikulum","curriculumId",refs.curricula||[])}{dropdown("Fase","phaseId",refs.phases||[])}{dropdown("CP Master","outcomeId",refs.outcomes||[])}{dropdown("TP","objectiveId",refs.objectives||[])}{dropdown("ATP","sequenceId",refs.sequences||[])}{dropdown("Materi","materialId",refs.materials||[])}</div><div className="chain"><span><Target/> CP</span><ChevronRight/><span><Route/> TP</span><ChevronRight/><span><Route/> ATP</span><ChevronRight/><span><Layers/> Materi</span></div></section>
  <section className="paCard"><h2>Isi / Catatan</h2><textarea className="contentArea" value={form.content||""} onChange={e=>set("content",e.target.value)} placeholder="Tulis catatan atau isi awal perangkat di sini..."/><div className="paActions"><button className="save" disabled={saving} onClick={save}><Save size={16}/>{saving?"Menyimpan...":"Simpan Draft"}</button>{message&&<span className="message">{message}</span>}</div></section>
 </main>;
}