"use client";
import { useState } from "react";
import { UserRound, Mail, Lock, School, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RegisterPage(){
  const [done,setDone]=useState(false);
  if(done) return <main className="authPage"><div className="authCard"><div className="success"><CheckCircle2 size={44}/><h1>Pendaftaran berhasil</h1><p>Akun Anda dibuat sebagai <b>Guru Individu</b>. Anda dapat menghubungkannya ke sekolah nanti tanpa membuat akun baru.</p><button className="primary wide" onClick={()=>setDone(false)}>Kembali</button></div></div></main>;
  return <main className="authPage"><div className="authCard"><div className="authBrand"><div className="brandMark">G</div><div><b>GuruWali</b><span>GuruWali V2</span></div></div><h1>Daftar sebagai Guru</h1><p className="muted">Mulai sebagai guru individu. Hubungkan akun ke sekolah kapan saja.</p><form onSubmit={(e)=>{e.preventDefault();setDone(true)}}><label>Nama Lengkap<input placeholder="Nama lengkap" required /></label><label>Email<input type="email" placeholder="nama@email.com" required /></label><label>Password<input type="password" placeholder="Minimal 8 karakter" minLength={8} required /></label><label>NIP / NUPTK <small>(opsional)</small><input placeholder="Nomor identitas" /></label><button className="primary wide" type="submit">Buat Akun <ArrowRight size={17}/></button></form><p className="authNote"><School size={15}/> Belum punya sekolah? Tidak masalah. Akun tetap dapat digunakan secara individu.</p></div></main>
}