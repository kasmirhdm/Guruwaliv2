"use client";
import "../auth.css";
import {useState} from "react";
import {ArrowRight,LockKeyhole,Mail} from "lucide-react";
import {useRouter} from "next/navigation";

export default function LoginPage(){
 const router=useRouter(); const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setMessage("");const fd=new FormData(e.currentTarget);const res=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:fd.get("email"),password:fd.get("password")})});const data=await res.json();if(!res.ok){setMessage(data.error||"Login gagal.");setLoading(false);return}router.push("/");router.refresh();}
 return <main className="authPage"><div className="authCard"><div className="authBrand"><div className="brandMark">G</div><div><b>GuruWali</b><span>GuruWali V2</span></div></div><h1>Masuk ke GuruWali</h1><p className="muted">Gunakan akun Guru, Admin Sekolah, atau Admin GuruWali.</p><form onSubmit={submit}><label><Mail size={14}/> Email<input name="email" type="email" placeholder="nama@email.com" required /></label><label><LockKeyhole size={14}/> Password<input name="password" type="password" placeholder="Password" required /></label><button className="primary wide" disabled={loading} type="submit">{loading?"Memproses...":"Masuk"} <ArrowRight size={17}/></button></form>{message&&<p className="authMessage">{message}</p>}<p className="authNote">Belum punya akun guru? Daftar sebagai Guru Individu.</p></div></main>
}