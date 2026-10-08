import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/require-auth";
import { prisma } from "../../../../lib/prisma";
export async function GET(req:Request){
  const cuconst guard=await requireRole(["GURUWALI_ADMIN"]);if(guard.response)return guard.response;
  const curriculumId=new URL(req.url).searchParams.get("curriculumId");
  return NextResponse.json(await prisma.phase.findMany({where:curriculumId?{curriculumId}:undefined,include:{curriculum:true},orderBy:{name:"asc"}}));
}
export async function POST(req:Request){const body=const guard=await requireRole(["GURUWALI_ADMIN"]);if(guard.response)return guard.response;const body=await req.json();if(!body.curriculumId||!body.name?.trim())return NextResponse.json({error:"Kurikulum dan nama fase wajib diisi"},{status:400});return NextResponse.json(await prisma.phase.create({data:{curriculumId:body.curriculumId,name:body.name.trim()}}),{status:201})}