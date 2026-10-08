import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(){
  const data=await prisma.curriculum.findMany({where:{sourceType:"PLATFORM_MASTER"},include:{phases:true},orderBy:{name:"asc"}});
  return NextResponse.json(data);
}
export async function POST(req:Request){
  const body=await req.json();
  if(!body.name?.trim()) return NextResponse.json({error:"Nama kurikulum wajib diisi"},{status:400});
  const data=await prisma.curriculum.create({data:{name:body.name.trim(),description:body.description||null,sourceType:"PLATFORM_MASTER"}});
  return NextResponse.json(data,{status:201});
}