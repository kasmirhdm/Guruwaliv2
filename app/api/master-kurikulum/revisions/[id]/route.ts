import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const revision=await prisma.masterCurriculumRevision.findUnique({where:{id}});
  if(!revision)return NextResponse.json({error:"Versi tidak ditemukan"},{status:404});
  return NextResponse.json(revision);
}
