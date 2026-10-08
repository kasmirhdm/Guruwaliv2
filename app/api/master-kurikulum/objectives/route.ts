import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/require-auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(req:Request){
  const guard=await requireRole(["GURUWALI_ADMIN"]); if(guard.response)return guard.response;
  const outcomeId=new URL(req.url).searchParams.get("outcomeId");
  return NextResponse.json(await prisma.learningObjective.findMany({where:outcomeId?{outcomeId}:undefined,include:{outcome:true,sequences:true},orderBy:{createdAt:"desc"}}));
}
export async function POST(req:Request){
  const guard=await requireRole(["GURUWALI_ADMIN"]); if(guard.response)return guard.response;
  const b=await req.json();
  if(!b.outcomeId||!b.title||!b.content)return NextResponse.json({error:"CP, judul dan isi TP wajib diisi"},{status:400});
  return NextResponse.json(await prisma.learningObjective.create({data:{outcomeId:b.outcomeId,title:b.title,content:b.content}}),{status:201});
}
