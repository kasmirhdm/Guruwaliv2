"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {ArrowLeft,Users,Upload} from "lucide-react";
import "../school-admin.css";
export default function SiswaPage(){
 const [rows,setRows]=useState<any[]>([]),[q,setQ]=useState("");
 useEffect(()=>{fetch("/api/school-admin/siswa").then(r=>r.json()).then(x=>Array.isArray(x)&&setRows(x))},[]);
 const filtered=rows.filter(x=>[x.name,x.nisn,x.nis,x.schoolClass?.name].some(v=>String(v||"").toLowerCase().includes(q.toLowerCase())));
 return <main className="saContent" style={{minHeight:"100vh"}}><header><Link href="/school-admin" style={{display:"inline-flex",alignItems:"center",gap:5,color:"#15916c",fontSize:12,textDecoration:"none"}}><ArrowLeft size={14}/> Dashboard Sekolah</Link><p className="eyebrow">DATA PESERTA DIDIK</p><h1>Siswa</h1><p className="muted">Data siswa yang masuk melalui import Dapodik GuruWali.</p></header>
 <section className="saCard" style={{maxWidth:1050,margin:"22px auto"}}><div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari nama, NISN, atau kelas..." style={{flex:1,minWidth:220,padding:10,border:"1px solid #dce5e5",borderRadius:8,fontSize:11}}/><Link href="/school-admin/dapodik/data" style={{display:"inline-flex",alignItems:"center",gap:6,textDecoration:"none",background:"#15916c",color:"#fff",padding:"10px 13px",borderRadius:8,fontSize:11,fontWeight:700}}><Upload size={14}/> Import Dapodik</Link></div><p style={{fontSize:10,color:"#899597"}}>{filtered.length} siswa ditampilkan • total {rows.length}</p>
 <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}><thead><tr><th style={th}>Nama</th><th style={th}>NISN</th><th style={th}>NIS</th><th style={th}>Kelas</th><th style={th}>Sumber</th></tr></thead><tbody>{filtered.map(s=><tr key={s.id}><td style={td}><b>{s.name}</b></td><td style={td}>{s.nisn||"-"}</td><td style={td}>{s.nis||"-"}</td><td style={td}>{s.schoolClass?.name||"Belum ditempatkan"}</td><td style={td}>{s.source}</td></tr>)}{!filtered.length&&<tr><td colSpan={5} style={{padding:25,textAlign:"center",color:"#899597"}}><Users size={24}/><br/>Belum ada data siswa.</td></tr>}</tbody></table></div></section></main>
}
const th={textAlign:"left" as const,padding:9,borderBottom:"1px solid #e5ecec",color:"#627174"},td={padding:9,borderBottom:"1px solid #edf1f1"};
