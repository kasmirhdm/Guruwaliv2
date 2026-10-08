import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { randomBytes, scryptSync } from "crypto";
import { rateLimit, clientKey } from "../../../../lib/rate-limit";

function hashPassword(password:string){
  const salt=randomBytes(16).toString("hex");
  const hash=scryptSync(password,salt,64).toString("hex");
  return salt+":"+hash;
}

export async function POST(req:Request){
  if(!rateLimit(`register:${clientKey(req)}`,10,60*60*1000))
    return NextResponse.json({error:"Terlalu banyak pendaftaran dari alamat ini. Coba lagi nanti."},{status:429});
  const b=await req.json();
  const name=String(b.name||"").trim();
  const email=String(b.email||"").trim().toLowerCase();
  const password=String(b.password||"");
  if(!name||!email||password.length<8)return NextResponse.json({error:"Nama, email, dan password minimal 8 karakter wajib diisi."},{status:400});
  const exists=await prisma.user.findUnique({where:{email}});
  if(exists)return NextResponse.json({error:"Email sudah terdaftar."},{status:409});
  const user=await prisma.user.create({data:{name,email,passwordHash:hashPassword(password),role:"TEACHER",teacherMode:"INDIVIDUAL"}});
  return NextResponse.json({ok:true,user:{id:user.id,name:user.name,email:user.email,role:user.role}},{status:201});
}
