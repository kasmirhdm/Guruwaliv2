"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {BookOpen,FileText,GraduationCap,LayoutDashboard,Settings,Users,ClipboardCheck,ChevronRight,School,LogOut,ClipboardList} from "lucide-react";

type Dash={user?:{name:string;role:string};school?:{id:string;name:string;npsn?:string|null};devices:number;documents:number;classes:number;memberships:number};

const menus=[
 {label:"Beranda",icon:LayoutDashboard},
 {label:"Perangkat Ajar",icon:BookOpen,href:"/perangkat-ajar"},
 {label:"Dokumen Saya",icon:FileText,href:"/perangkat-ajar/saya"},
 {label:"Kurikulum",icon:GraduationCap,href:"/perangkat-ajar"},
 {label:"Wali Kelas",icon:Users,href:"/wali-kelas"},
 {label:"Penilaian",icon:ClipboardCheck,href:"/penilaian"},
 {label:"Pengaturan",icon:Settings}
];

export default function Home(){
 const [active,setActive]=useState("Beranda"); const [d,setD]=useState<Dash|null>(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{fetch("/api/dashboard").then(r=>r.ok?r.json():null).then(setD).catch(()=>{}).finally(()=>setLoading(false))},[]);
 const school=d?.school;
 const go=(m:any)=>{setActive(m.label);if(m.href)window.location.href=m.href};
 return <main className="shell">
  <aside className="sidebar">
   <div className="brand"><div className="brandMark">G</div><div><b>GuruWali</b><span>Platform Guru V2</span></div></div>
   <div className="schoolMini"><School size={18}/><div><b>{school?.name||"Guru Individu"}</b><span>{school?.npsn?"NPSN "+school.npsn:"Belum terhubung sekolah"}</span></div></div>
   <Link href="/sekolah" className="schoolJoin"><School size={15}/> Gabung / Kelola Sekolah</Link>
   <nav>{menus.map(m=>{const Icon=m.icon;return <button key={m.label} className={active===m.label?"nav active":"nav"} onClick={()=>go(m)}><Icon size={19}/><span>{m.label}</span>{active===m.label&&<ChevronRight size={16} className="navArrow"/>}</button>})}</nav>
   <div className="sidebarBottom"><button className="nav" onClick={async()=>{await fetch("/api/auth/logout",{method:"POST"});window.location.href="/login"}}><LogOut size={19}/><span>Keluar</span></button></div>
  </aside>
  <section className="content">
   <header className="topbar"><div><p className="eyebrow">GURU / DASHBOARD</p><h1>Selamat datang, {d?.user?.name||"Guru"} 👋</h1><p className="muted">Kelola perangkat pembelajaran dan administrasi Anda dari satu tempat.</p></div><div className="profile"><div className="avatar">{(d?.user?.name||"G").slice(0,1).toUpperCase()}</div><div><b>{d?.user?.name||"Guru"}</b><span>Guru</span></div></div></header>
   <div className="hero"><div><span className="pill">GURUWALI V2</span><h2>Semua administrasi guru,<br/><strong>lebih rapi dan terarah.</strong></h2><p>Mulai dari kurikulum, perangkat ajar, penilaian hingga dokumen siap cetak.</p></div><button className="primary" onClick={()=>window.location.href="/perangkat-ajar"}>Buat Perangkat Ajar <ChevronRight size={18}/></button></div>
   <div className="sectionHead"><div><h3>Ringkasan</h3><p className="muted">Data pekerjaan Anda saat ini</p></div></div>
   <div className="stats">
    {[[String(d?.devices??0),"Perangkat Ajar","Perangkat yang Anda buat"],[String(d?.documents??0),"Dokumen","Dokumen milik Anda"],[String(d?.classes??0),"Kelas","Kelas yang terhubung"],[String(d?.memberships??0),"Sekolah","Keanggotaan aktif"]].map(([n,t,s])=><div className="stat" key={t}><div className="statIcon"><FileText size={20}/></div><b>{loading?"—":n}</b><strong>{t}</strong><span>{s}</span></div>)}
   </div>
   <div className="grid2">
    <div className="card"><div className="cardHead"><div><h3>Akses Cepat</h3><p className="muted">Fitur utama GuruWali</p></div></div>
     <div className="row" onClick={()=>window.location.href="/perangkat-ajar"}><div className="docIcon"><BookOpen size={17}/></div><div><b>Perangkat Ajar</b><span>Buat Modul Ajar, LKPD, Asesmen, dan lainnya</span></div><ChevronRight size={17}/></div>
     <div className="row" onClick={()=>window.location.href="/wali-kelas"}><div className="docIcon"><Users size={17}/></div><div><b>Wali Kelas</b><span>Kelola kelas dan data peserta didik</span></div><ChevronRight size={17}/></div>
     <div className="row" onClick={()=>window.location.href="/sekolah"}><div className="docIcon"><School size={17}/></div><div><b>Sekolah</b><span>Hubungkan atau kelola keanggotaan sekolah</span></div><ChevronRight size={17}/></div>
    </div>
    <div className="card"><div className="cardHead"><div><h3>Alur Kurikulum</h3><p className="muted">Hubungan data pembelajaran</p></div></div>
     <div className="flow"><span>CP</span><i>→</i><span>TP</span><i>→</i><span>ATP</span><i>→</i><span className="flowStrong">Materi</span><i>→</i><span className="flowStrong">Perangkat</span></div>
     <div className="infoBox"><GraduationCap size={20}/><div><b>Struktur pembelajaran</b><p>Kurikulum → Fase → Mata Pelajaran → CP → TP → ATP → Materi.</p></div></div>
    </div>
   </div>
  </section>
 </main>
}