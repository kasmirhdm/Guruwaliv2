"use client";
import {useState} from "react";
import Link from "next/link";
import {ArrowLeft,Users,Upload,CheckCircle2,AlertCircle,FileSpreadsheet} from "lucide-react";
import "../../school-admin.css";

export default function DapodikDataPage(){
 const [file,setFile]=useState<File|null>(null),[preview,setPreview]=useState<any>(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState(""),[error,setError]=useState("");
 async function send(mode:string){
  if(!file)return;setBusy(true);setError("");setMsg("");
  const fd=new FormData();fd.append("file",file);fd.append("mode",mode);
  const r=await fetch("/api/school-admin/dapodik/data",{method:"POST",body:fd});const x=await r.json();setBusy(false);
  if(!r.ok){setError(x.error||"Gagal memproses data.");return}
  if(mode==="preview")setPreview(x);else{setMsg(x.message+" "+JSON.stringify(x.summary));setPreview(null)}
 }
 return <main className="saContent" style={{minHeight:"100vh"}}>
  <header><Link href="/school-admin/dapodik" style={{display:"inline-flex",alignItems:"center",gap:5,color:"#15916c",fontSize:12,textDecoration:"none"}}><ArrowLeft size={14}/> Profil Dapodik</Link>
  <p className="eyebrow">INTEGRASI DAPODIK</p><h1>Import Guru, Siswa & Rombel</h1><p className="muted">GuruWali membaca data Peserta Didik dan PTK dari workbook Dapodik. Rombel yang belum ada dapat dibuat otomatis.</p></header>
  <section className="saCard" style={{maxWidth:1050,margin:"22px auto"}}>
   <label style={{display:"block",border:"2px dashed #cbdcda",borderRadius:12,padding:22,textAlign:"center",cursor:"pointer"}}><FileSpreadsheet size={30} color="#15916c"/><b style={{display:"block",fontSize:13,marginTop:7}}>{file?file.name:"Pilih file Excel Dapodik"}</b><span style={{display:"block",fontSize:10,color:"#899597",marginTop:4}}>Gunakan file Profil/rekap Dapodik .xlsx atau .xls</span><input type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{setFile(e.target.files?.[0]||null);setPreview(null);setMsg("");setError("")}}/></label>
   <div style={{display:"flex",gap:8,marginTop:14}}><button disabled={!file||busy} onClick={()=>send("preview")} style={{border:0,background:"#15916c",color:"#fff",borderRadius:9,padding:"10px 14px",fontWeight:700,fontSize:11,display:"inline-flex",gap:7,alignItems:"center"}}><Upload size={15}/>{busy?"Memproses...":"Baca & Pratinjau"}</button></div>
   {error&&<div style={{marginTop:14,padding:11,borderRadius:9,background:"#fff2f2",color:"#b42318",fontSize:11,display:"flex",gap:7}}><AlertCircle size={16}/>{error}</div>}
   {msg&&<div style={{marginTop:14,padding:11,borderRadius:9,background:"#effaf5",color:"#16724f",fontSize:11,display:"flex",gap:7}}><CheckCircle2 size={16}/>{msg}</div>}
  </section>
  {preview&&<section className="saCard" style={{maxWidth:1050,margin:"18px auto"}}><h2 style={{fontSize:16,marginTop:0}}>Hasil Pembacaan</h2>
   <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:14}}><Stat icon={<Users/>} label="Siswa" value={preview.summary.students}/><Stat icon={<Users/>} label="PTK/Guru" value={preview.summary.teachers}/><Stat icon={<FileSpreadsheet/>} label="Sheet" value={preview.sheets.length}/></div>
   <h3 style={{fontSize:13,marginTop:22}}>Contoh Siswa</h3><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}><thead><tr><th style={th}>Nama</th><th style={th}>NISN</th><th style={th}>Kelas/Rombel</th></tr></thead><tbody>{preview.studentPreview.map((s:any,i:number)=><tr key={i}><td style={td}>{s.name}</td><td style={td}>{s.nisn||"-"}</td><td style={td}>{s.className||"-"}</td></tr>)}</tbody></table></div>
   <h3 style={{fontSize:13,marginTop:22}}>Contoh Guru/PTK</h3><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}><thead><tr><th style={th}>Nama</th><th style={th}>NIP</th><th style={th}>NUPTK</th></tr></thead><tbody>{preview.teacherPreview.map((t:any,i:number)=><tr key={i}><td style={td}>{t.name}</td><td style={td}>{t.nip||"-"}</td><td style={td}>{t.nuptk||"-"}</td></tr>)}</tbody></table></div>
   <div style={{marginTop:16,padding:11,background:"#fff9e8",borderRadius:9,fontSize:10,color:"#755b13"}}>Import tidak menghapus data. Siswa dicocokkan berdasarkan NISN/NIK/nama. Rombel yang belum ditemukan akan dibuat sebagai kelas baru.</div>
   <button disabled={busy} onClick={()=>send("import")} style={{marginTop:14,border:0,background:"#15916c",color:"#fff",borderRadius:9,padding:"11px 16px",fontWeight:700,fontSize:11}}>Import Data ke GuruWali</button>
  </section>}
 </main>
}
function Stat({icon,label,value}:{icon:any;label:string;value:any}){return <div style={{padding:14,border:"1px solid #e5ecec",borderRadius:10}}>{icon}<span style={{display:"block",fontSize:9,color:"#899597",marginTop:5}}>{label}</span><b style={{fontSize:22}}>{value}</b></div>}
const th={textAlign:"left" as const,padding:8,borderBottom:"1px solid #e5ecec",color:"#627174"},td={padding:8,borderBottom:"1px solid #edf1f1"};
