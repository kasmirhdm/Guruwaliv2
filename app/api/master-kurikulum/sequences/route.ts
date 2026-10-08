import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
export async function GET(req:Request){
  const objectiveId=new URL(req.url).searchParams.get("objectiveId");
  return NextResponse.json(await prisma.learningSequence.findMany({where:objectiveId?{objectiveId}:undefined,include:{objective:true},orderBy:{createdAt:"desc"}}));
}
export async function POST(req:Request){const b=await req.json();if(!b.objectiveId||!b.title||!b.content)return NextResponse.json({error:"TP, judul dan isi ATP wajib diisi"},{status:400});return NextResponse.json(await prisma.learningSequence.create({data:{objectiveId:b.objectiveId,title:b.title,content:b.content}}),{status:201})}