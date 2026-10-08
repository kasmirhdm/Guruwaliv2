import {NextResponse} from "next/server";
import {getCurrentUser} from "../../../../lib/auth";
import {prisma} from "../../../../lib/prisma";

export async function POST(){
 const user=await getCurrentUser();
 const response=NextResponse.json({ok:true});
 if(user){
  const cookie=(await import("next/headers")).cookies;
  const store=await cookie();
  const token=store.get("guruwali_session")?.value;
  if(token){
   const crypto=await import("crypto");
   const tokenHash=crypto.createHash("sha256").update(token).digest("hex");
   await prisma.session.deleteMany({where:{tokenHash}});
  }
 }
 response.cookies.set("guruwali_session","",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:0});
 return response;
}