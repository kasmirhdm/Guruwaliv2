"use client";
import {useEffect,useState} from "react";
import {Users,Check, X,ArrowLeft,Clock} from "lucide-react";
import Link from "next/link";
import "./permintaan.css";
export default function PermintaanPage(){
 const [rows,setRows]=useState<any[]>([]);const [msg,setMsg]=useState("");
 async function load(){const r=await fetch("/api/schools/memberships");if(r.ok)setRows(await r.json());else setMsg((await r.json()).error||"Gagal memuat.");}
 useEffect(()=>{load()},[]);
 async function act(id:string,status:string){setMsg("");const r=await fetch("/api/schools/memberships/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});const x=await r.json();setMsg(r.ok?(status==="ACTIVE"?"Guru disetujui.":"Permintaan ditolak."):x.error||"Gagal memproses.");if(r.ok)load()}
 return <main className="requestShell"><header><Link href="/admin" className="back"><ArrowLeft size={16}/> Admin Sekolah</Link><p className="eyebrow">KEANGGOTAAN SEKOLAH</p><h1>Permintaan Bergabung</h1><p className="muted">Tinjau guru yang meminta bergabung ke sekolah.</p></header><section className="requestCard">{msg&&<div className="message">{msg}</div>}{rows.length?rows.map(x=><div className="requestRow" key={x.id}><div className="avatar"><Users size={17}/></div><div className="info"><b>{x.user.name}</b><span>{x.user.email} • Diajukan {new Date(x.createdAt).toLocaleDateString("id-ID")}</span></div><span className="pending"><Clock size={13}/> Menunggu</span><button className="approve" onClick={()=>act(x.id,"ACTIVE")}><Check size={15}/> Setujui</button><button className="reject" onClick={()=>act(x.id,"REJECTED")}><X size={15}/> Tolak</button></div>):<div className="empty">Tidak ada permintaan yang menunggu.</div>}</section></main>
}