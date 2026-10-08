import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
export async function GET(){return NextResponse.json(await prisma.learningObjective.findMany({include:{outcome:true,sequences:true},orderBy:{createdAt:"desc"}}))}
export async function POST(req:Request){const b=await req.json();if(!b.outcomeId||!b.title||!b.content)return NextResponse.json({error:"CP, judul dan isi TP wajib diisi"},{status:400});return NextResponse.json(await prisma.learningObjective.create({data:{outcomeId:b.outcomeId,title:b.title,content:b.content}}),{status:201})}