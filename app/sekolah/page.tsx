"use client";
import {useEffect,useState} from "react";
import {School,Search,Send,CheckCircle,Clock,ArrowLeft} from "lucide-react";
import Link from "next/link";
import "./sekolah.css";

export default function SekolahPage(){
 const [q,setQ]=useState(""); const [schools,setSchools]=useState<any[]>([]); const [memberships,setMemberships]=useState<any[]>([]); const [msg,setMsg]=useState("");
 async function load(){const [a,b]=await Promise.all([fetch("/api/sekolah"),fetch("/api/schools/join")]);setSchools(a.ok?await a.json():[]);setMemberships(b.ok?await b.json():[])}
 useEffect(()=>{load()},[]);
 async function search(){const r=await fetch("/api/sekolah?q="+encodeURIComponent(q));setSchools(r.ok?await r.json():[])}
 async function join(id:string){setMsg("");const r=await fetch("/api/schools/join",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({schoolId:id})});const x=await r.json();setMsg(x.message||x.error||"");if(r.ok)load()}
 return <main className="schoolPage"><header><Link href="/" className="back"><ArrowLeft size={16}/> Kembali</Link><p className="eyebrow">SEKOLAH SAYA</p><h1>Gabung ke Sekolah</h1><p className="muted">Cari sekolah berdasarkan nama atau NPSN, lalu kirim permintaan bergabung.</p></header>
 <section className="joinCard"><div className="search"><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()} placeholder="Cari nama sekolah atau NPSN"/><button onClick={search}><Search size={16}/> Cari</button></div>{msg&&<div className="message">{msg}</div>}
 <div className="schoolList">{schools.map(s=>{const m=memberships.find(x=>x.schoolId===s.id);return <div className="schoolRow" key={s.id}><div className="schoolIcon"><School size={19}/></div><div className="schoolInfo"><b>{s.name}</b><span>{s.npsn?"NPSN: "+s.npsn:"NPSN belum diisi"}{s.address?" • "+s.address:""}</span></div>{m?.status==="ACTIVE"?<span className="state active"><CheckCircle size={14}/> Aktif</span>:m?.status==="PENDING"?<span className="state pending"><Clock size={14}/> Menunggu</span>:<button onClick={()=>join(s.id)}><Send size={14}/> Gabung</button>}</div>})}{!schools.length&&<p className="empty">Belum ada sekolah yang cocok.</p>}</div></section>
 <section className="joinCard"><h2>Riwayat Keanggotaan</h2>{memberships.length?memberships.map(m=><div className="history" key={m.id}><b>{m.school.name}</b><span>{m.status}</span></div>):<p className="empty">Belum ada riwayat keanggotaan.</p>}</section>
 </main>
}