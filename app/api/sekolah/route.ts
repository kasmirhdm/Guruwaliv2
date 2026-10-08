import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req:NextRequest){
  const user=await getCurrentUser();
  if(!user)return NextResponse.json({error:"Anda harus login."},{status:401});
  const q=new URL(req.url).searchParams.get("q")?.trim()||"";
  const schools=await prisma.school.findMany({where:q?{OR:[{name:{contains:q,mode:"insensitive"}},{npsn:{contains:q,mode:"insensitive"}}]}:undefined,select:{id:true,name:true,npsn:true,address:true},orderBy:{name:"asc"},take:20});
  return NextResponse.json(schools);
}