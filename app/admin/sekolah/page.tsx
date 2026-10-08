"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {ArrowLeft,School,Save,Image as ImageIcon} from "lucide-react";
import "./sekolah.css";
export default function SchoolSettings(){
 const [d,setD]=useState<any>({name:"",npsn:"",address:"",logoPath:"",principalName:""});const [loading,setLoading]=useState(true);const [msg,setMsg]=useState("");
 useEffect(()=>{fetch("/api/admin/sekolah").then(r=>r.json()).then(x=>x&&setD(x)).finally(()=>setLoading(false))},[]);
 const set=(k:string,v:string)=>setD((x:any)=>({...x,[k]:v}));
 async function save(){setMsg("");const r=await fetch("/api/admin/sekolah",{method:d.id?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});const x=await r.json();if(r.ok){setD(x);setMsg("Profil sekolah tersimpan.");}else setMsg(x.error||"Gagal menyimpan.")}
 if(loading)return <main className="schoolShell"><p>Memuat...</p></main>;
 return <main className="schoolShell"><header><Link href="/admin" className="back"><ArrowLeft size={16}/> Admin GuruWali</Link><p className="eyebrow">PROFIL SEKOLAH</p><h1>Data Sekolah & Kop Dokumen</h1><p className="muted">Data ini digunakan otomatis pada DOCX dan PDF perangkat ajar.</p></header>
 <section className="schoolCard"><div className="cardTitle"><School/><div><h2>Identitas Sekolah</h2><p>Lengkapi data resmi sekolah.</p></div></div><div className="formGrid">
 <label>Nama Sekolah<input value={d.name||""} onChange={e=>set("name",e.target.value)} placeholder="SMPN 1 Sungai Batang"/></label>
 <label>NPSN<input value={d.npsn||""} onChange={e=>set("npsn",e.target.value)} placeholder="Nomor Pokok Sekolah Nasional"/></label>
 <label>Kepala Sekolah<input value={d.principalName||""} onChange={e=>set("principalName",e.target.value)} placeholder="Nama Kepala Sekolah"/></label>
 <label>Logo Sekolah / URL Logo<input value={d.logoPath||""} onChange={e=>set("logoPath",e.target.value)} placeholder="/uploads/logo.png atau URL"/></label>
 <label className="full">Alamat Sekolah<textarea value={d.address||""} onChange={e=>set("address",e.target.value)} placeholder="Alamat lengkap sekolah"/></label>
 </div><div className="logoHint"><ImageIcon size={17}/><span>Logo akan digunakan pada kop setelah penyimpanan file logo di storage GuruWali.</span></div>
 <div className="actions"><button onClick={save}><Save size={16}/> Simpan Profil</button>{msg&&<span>{msg}</span>}</div></section>
 <section className="schoolCard preview"><h2>Pratinjau Kop</h2><div className="letterhead">{d.logoPath?<img src={d.logoPath} alt="Logo sekolah"/>:<div className="logoPlaceholder">LOGO</div>}<div><b>{d.name||"NAMA SEKOLAH"}</b><span>{d.address||"Alamat sekolah"}</span>{d.npsn&&<small>NPSN: {d.npsn}</small>}</div></div></section>
 </main>