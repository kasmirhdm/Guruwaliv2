"use client";
import "../auth.css";
import {useState} from "react";
import {Mail,ArrowRight,CheckCircle2} from "lucide-react";
import {useRouter} from "next/navigation";

export default function RegisterPage(){
 const router=useRouter(); const [message,setMessage]=useState(""); const [done,setDone]=useState(false); const [loading,setLoading]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setMessage("");const fd=new FormData(e.currentTarget);const res=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:fd.get("name"),email:fd.get("email"),password:fd.get("password")})});const data=await res.json();if(!res.ok){setMessage(data.error||"Pendaftaran gagal.");setLoading(false);return}setDone(true);setLoading(false);}
 if(done)return <main className="authPage"><div className="authCard"><div className="success"><CheckCircle2 size={44}/><h1>Pendaftaran berhasil</h1><p>Akun Anda dibuat sebagai <b>Guru Individu</b>.</p><button className="primary wide" onClick={()=>router.push("/login")}>Masuk ke GuruWali</button></div></div></main>;
 return <main className="authPage"><div className="authCard"><h1>Daftar sebagai Guru</h1><p className="muted">Mulai sebagai guru individu. Hubungkan akun ke sekolah kapan saja.</p><form onSubmit={submit}><label>Nama Lengkap<input name="name" placeholder="Nama lengkap" required /></label><label>Email<input name="email" type="email" placeholder="nama@email.com" required /></label><label>Password<input name="password" type="password" placeholder="Minimal 8 karakter" minLength={8} required /></label><button className="primary wide" disabled={loading} type="submit">{loading?"Membuat akun...":"Buat Akun"} <ArrowRight size={17}/></button></form>{message&&<p className="authMessage">{message}</p>}<p className="authNote"><Mail size={15}/> Akun dimulai sebagai Guru Individu.</p></div></main>
}