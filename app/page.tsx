"use client";
import { useState } from "react";
import Link from "next/link";
import { BookOpen, FileText, GraduationCap, LayoutDashboard, Settings, Users, ClipboardCheck, ChevronRight, School, LogOut } from "lucide-react";

const menus = [
  {label:"Beranda", icon:LayoutDashboard},
  {label:"Perangkat Ajar", icon:BookOpen},
  {label:"Dokumen Saya", icon:FileText},
  {label:"Kurikulum", icon:GraduationCap},
  {label:"Wali Kelas", icon:Users},
  {label:"Penilaian", icon:ClipboardCheck},
  {label:"Pengaturan", icon:Settings}
];

export default function Home(){
  const [active,setActive]=useState("Beranda");
  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brandMark">G</div><div><b>GuruWali</b><span>Platform Guru V2</span></div></div>
      <div className="schoolMini"><School size={18}/><div><b>SMPN 1 Sungai Batang</b><span>2026/2027 • Ganjil</span></div></div><Link href="/sekolah" className="schoolJoin"><School size={15}/> Gabung / Kelola Sekolah</Link>
      <nav>{menus.map(m=>{const Icon=m.icon; return <button key={m.label} className={active===m.label?"nav active":"nav"} onClick={()=>setActive(m.label)}><Icon size={19}/><span>{m.label}</span>{active===m.label&&<ChevronRight size={16} className="navArrow"/>}</button>})}</nav>
      <div className="sidebarBottom"><button className="nav"><LogOut size={19}/><span>Keluar</span></button></div>
    </aside>
    <section className="content">
      <header className="topbar"><div><p className="eyebrow">GURU / DASHBOARD</p><h1>Selamat datang, Pak Kasmir 👋</h1><p className="muted">Kelola perangkat pembelajaran dan administrasi Anda dari satu tempat.</p></div><div className="profile"><div className="avatar">K</div><div><b>Kasmir, S.Pd</b><span>Guru • Matematika</span></div></div></header>

      <div className="hero"><div><span className="pill">GURUWALI V2</span><h2>Semua administrasi guru,<br/><strong>lebih rapi dan terarah.</strong></h2><p>Mulai dari kurikulum, perangkat ajar, penilaian hingga dokumen siap cetak.</p></div><button className="primary" onClick={()=>setActive("Perangkat Ajar")}>Buat Perangkat Ajar <ChevronRight size={18}/></button></div>

      <div className="sectionHead"><div><h3>Ringkasan</h3><p className="muted">Data pekerjaan Anda saat ini</p></div></div>
      <div className="stats">
        {[["12","Perangkat Ajar","Terakhir dibuat 2 hari lalu"],["48","Dokumen","8 dokumen bulan ini"],["36","Bank Soal","12 soal perlu ditinjau"],["4","Kelas","Matematika • VII–IX"]].map(([n,t,s])=><div className="stat" key={t}><div className="statIcon"><FileText size={20}/></div><b>{n}</b><strong>{t}</strong><span>{s}</span></div>)}
      </div>

      <div className="grid2">
        <div className="card"><div className="cardHead"><div><h3>Aktivitas Terakhir</h3><p className="muted">Dokumen yang baru Anda kerjakan</p></div><button className="link" onClick={()=>setActive("Dokumen Saya")}>Lihat semua</button></div>
          {["Modul Ajar — Persamaan Kuadrat","LKPD — Fungsi Linear","Kisi-Kisi Asesmen — Geometri"].map((x,i)=><div className="row" key={x}><div className="docIcon"><FileText size={17}/></div><div><b>{x}</b><span>Matematika • Kelas {i===0?"IX":"VIII"} • {i+1} hari lalu</span></div><ChevronRight size={17}/></div>)}
        </div>
        <div className="card"><div className="cardHead"><div><h3>Alur Kurikulum</h3><p className="muted">Hubungan data pembelajaran</p></div></div>
          <div className="flow"><span>CP</span><i>→</i><span>TP</span><i>→</i><span>ATP</span><i>→</i><span className="flowStrong">Perangkat</span></div>
          <div className="infoBox"><GraduationCap size={20}/><div><b>Master Kurikulum aktif</b><p>CP bertanda master digunakan sebagai sumber resmi sekolah.</p></div></div>
        </div>
      </div>
    </section>
  </main>
}