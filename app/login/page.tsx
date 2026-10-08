"use client";
import "../auth.css";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

export default function LoginPage(){
  const [message,setMessage]=useState("");
  function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setMessage("Login backend akan diaktifkan setelah koneksi PostgreSQL tersedia.");
  }
  return <main className="authPage"><div className="authCard">
    <div className="authBrand"><div className="brandMark">G</div><div><b>GuruWali</b><span>GuruWali V2</span></div></div>
    <h1>Masuk ke GuruWali</h1>
    <p className="muted">Gunakan akun Guru, Admin Sekolah, atau Admin GuruWali.</p>
    <form onSubmit={submit}>
      <label><Mail size={14}/> Email<input type="email" placeholder="nama@email.com" required /></label>
      <label><LockKeyhole size={14}/> Password<input type="password" placeholder="Password" required /></label>
      <button className="primary wide" type="submit">Masuk <ArrowRight size={17}/></button>
    </form>
    {message && <p className="authMessage">{message}</p>}
    <p className="authNote">Belum punya akun guru? Anda dapat mendaftar sebagai Guru Individu.</p>
  </div></main>
}