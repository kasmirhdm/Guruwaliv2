import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "../../../../lib/auth";

function verifyPassword(password:string,stored:string){
  const [salt,hex]=stored.split(":");
  if(!salt||!hex)return false;
  const actual=scryptSync(password,salt,64);
  const expected=Buffer.from(hex,"hex");
  return expected.length===actual.length&&timingSafeEqual(actual,expected);
}

export async function POST(req:Request){
  const b=await req.json();
  const email=String(b.email||"").trim().toLowerCase();
  const password=String(b.password||"");
  const user=await prisma.user.findUnique({where:{email}});
  if(!user||!verifyPassword(password,user.passwordHash)||user.status!=="ACTIVE")return NextResponse.json({error:"Email atau password salah."},{status:401});
  const token=randomBytes(32).toString("hex");
  const tokenHash=createHash("sha256").update(token).digest("hex");
  await prisma.session.create({data:{tokenHash,userId:user.id,expiresAt:new Date(Date.now()+1000*60*60*24*30)}});
  const store=await cookies();
  store.set(SESSION_COOKIE,token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*30});
  return NextResponse.json({ok:true,user:{id:user.id,name:user.name,email:user.email,role:user.role}});
}
