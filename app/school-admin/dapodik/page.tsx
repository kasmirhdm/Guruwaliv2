"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {ArrowLeft,Database,Upload,CheckCircle2,AlertCircle,FileSpreadsheet} from "lucide-react";
import "../school-admin.css";

type Profile={name?:string;npsn?:string;address?:string;principalName?:string;principalNip?:string};
const labels:{key:keyof Profile;label:string}[]=[
 {key:"name",label:"Nama Sekolah"},{key:"npsn",label:"NPSN"},{key:"address",label:"Alamat"},
 {key:"principalName",label:"Kepala Sekolah"},{key:"principalNip",label:"NIP Kepala Sekolah"}
];

export default function DapodikPage(){
 const [file,setFile]=useState<File|null>(null);
 const [profile,setProfile]=useState<Profile|null>(null);
 const [current,setCurrent]=useState<Profile|null>(null);
 const [busy,setBusy]=useState(false);
 const [msg,setMsg]=useState("");
 const [history,setHistory]=useState<any[]>([]);
 useEffect(()=>{fetch("/api/school-admin/dapodik/history").then(r=>r.ok?r.json():[]).then(x=>setHistory(Array.isArray(x)?x:[]))},[msg]);
 const [error,setError]=useState("");

 async function preview(){
  if(!file)return;
  setBusy(true);setMsg("");setError("");setProfile(null);
  const fd=new FormData();fd.append("file",file);fd.append("mode","preview");
  const r=await fetch("/api/school-admin/dapodik/profil",{method:"POST",body:fd});
  const x=await r.json();setBusy(false);
  if(!r.ok){setError(x.error||"Gagal membaca file.");return}
  setProfile(x.profile);setCurrent(x.current);
 }
 async function importNow(){
  if(!file)return;
  setBusy(true);setMsg("");setError("");
  const fd=new FormData();fd.append("file",file);fd.append("mode","import");
  const r=await fetch("/api/school-admin/dapodik/profil",{method:"POST",body:fd});
  const x=await r.json();setBusy(false);
  if(!r.ok){setError(x.error||"Gagal mengimpor.");return}
  setMsg(x.message||"Profil berhasil diimpor.");setCurrent(x.school);
 }
 return <main className="saContent" style={{minHeight:"100vh"}}>
  <header>
   <Link href="/school-admin" style={{display:"inline-flex",alignItems:"center",gap:5,color:"#15916c",fontSize:12,textDecoration:"none"}}><ArrowLeft size={14}/> Dashboard Sekolah</Link>
   <p className="eyebrow">INTEGRASI DAPODIK</p>
   <h1>Import Profil Dapodik</h1>
   <p className="muted">Ambil file Excel <b>Profil</b> dari Dapodik lalu GuruWali mengisi identitas sekolah secara otomatis.</p>
  </header>
  <div style={{marginBottom:14}}><Link href="/school-admin/dapodik/data" style={{display:"inline-flex",alignItems:"center",gap:7,color:"#15916c",fontWeight:700,fontSize:11,textDecoration:"none"}}>→ Import Guru, Siswa & Rombel Dapodik</Link></div><section className="saCard" style={{maxWidth:1050,margin:"22px auto"}}>
   <div style={{display:"flex",gap:12,alignItems:"flex-start",padding:14,borderRadius:11,background:"#f1faf6"}}>
    <Database size={22} color="#15916c"/>
    <div><b style={{fontSize:13}}>Sumber resmi Dapodik</b><p style={{fontSize:10,color:"#627174",margin:"4px 0 0"}}>Di Aplikasi Dapodik buka <b>Pusat Unduhan → Manajemen → Profil</b>. File Profil yang diunduh berbentuk Excel.</p></div>
   </div>
   <label style={{display:"block",marginTop:18,border:"2px dashed #cbdcda",borderRadius:12,padding:22,textAlign:"center",cursor:"pointer"}}>
    <FileSpreadsheet size={30} color="#15916c"/>
    <b style={{display:"block",fontSize:13,marginTop:7}}>{file?file.name:"Pilih File Profil Dapodik"}</b>
    <span style={{display:"block",fontSize:10,color:"#899597",marginTop:4}}>Format .xlsx atau .xls</span>
    <input type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{setFile(e.target.files?.[0]||null);setProfile(null);setError("");setMsg("")}}/>
   </label>
   <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
    <button disabled={!file||busy} onClick={preview} style={{border:0,background:"#15916c",color:"#fff",borderRadius:9,padding:"10px 14px",fontWeight:700,fontSize:11,display:"inline-flex",alignItems:"center",gap:7}}><Upload size={15}/>{busy?"Membaca...":"Baca & Pratinjau"}</button>
   </div>
   {error&&<div style={{marginTop:14,padding:11,borderRadius:9,background:"#fff2f2",color:"#b42318",fontSize:11,display:"flex",gap:7}}><AlertCircle size={16}/>{error}</div>}
   {msg&&<div style={{marginTop:14,padding:11,borderRadius:9,background:"#effaf5",color:"#16724f",fontSize:11,display:"flex",gap:7}}><CheckCircle2 size={16}/>{msg}</div>}
  </section>
  {profile&&<section className="saCard" style={{maxWidth:1050,margin:"18px auto"}}>
   <h2 style={{fontSize:16,marginTop:0}}>Pratinjau Data</h2>
   <p style={{fontSize:10,color:"#899597"}}>Periksa hasil pembacaan sebelum menimpa profil sekolah GuruWali.</p>
   <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
    {labels.map(x=><div key={x.key} style={{padding:12,border:"1px solid #e5ecec",borderRadius:9}}><span style={{display:"block",fontSize:9,color:"#899597"}}>{x.label}</span><b style={{display:"block",fontSize:11,marginTop:4}}>{profile[x.key]||"Tidak ditemukan"}</b>{current&&profile[x.key]&&current[x.key]&&profile[x.key]!==current[x.key]&&<small style={{display:"block",fontSize:8,color:"#b97800",marginTop:4}}>Sebelumnya: {current[x.key]}</small>}</div>)}
   </div>
   <div style={{marginTop:16,padding:11,background:"#fff9e8",borderRadius:9,fontSize:10,color:"#755b13"}}>Import hanya memperbarui data yang berhasil ditemukan dari file. Data lain tidak dihapus.</div>
   <button disabled={busy} onClick={importNow} style={{marginTop:14,border:0,background:"#15916c",color:"#fff",borderRadius:9,padding:"11px 16px",fontWeight:700,fontSize:11}}>{busy?"Mengimpor...":"Import ke Profil Sekolah"}</button>
  </section>}
 </main>
}
