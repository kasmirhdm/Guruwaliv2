import "./page.css";
"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {ArrowLeft,FileText,Plus,ChevronRight} from "lucide-react";
export default function PerangkatSaya(){
 const [items,setItems]=useState<any[]>([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{fetch("/api/perangkat?userId=demo-teacher").then(r=>r.ok?r.json():[]).then(setItems).finally(()=>setLoading(false))},[]);
 return <main className="listShell"><header><Link href="/" className="back"><ArrowLeft size={16}/> Beranda</Link><p className="eyebrow">PERANGKAT AJAR</p><h1>Perangkat Ajar Saya</h1><p className="muted">Semua perangkat yang Anda buat tersimpan di sini.</p></header><div className="actions"><Link href="/perangkat-ajar" className="newBtn"><Plus size={16}/> Buat Perangkat</Link></div>{loading?<div className="empty">Memuat perangkat...</div>:items.length===0?<div className="empty"><FileText size={35}/><h3>Belum ada perangkat</h3><p>Mulai buat perangkat ajar dari Master Kurikulum.</p><Link href="/perangkat-ajar" className="newBtn">Buat Perangkat</Link></div>:<div className="deviceList">{items.map(x=><Link href={"/perangkat-ajar/"+x.id} className="device" key={x.id}><div className="deviceIcon"><FileText size={18}/></div><div><b>{x.title}</b><span>{x.subjectName||"Mata Pelajaran"} • Kelas {x.className||"-"} • {x.type.replaceAll("_"," ")}</span><small>{x.status==="DRAFT"?"Draft":"Tersimpan"} • {new Date(x.updatedAt).toLocaleDateString("id-ID")}</small></div><ChevronRight size={17}/></Link>)}</div>}</main>
}