import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
export async function GET(){return NextResponse.json(await prisma.learningMaterial.findMany({include:{sequence:true},orderBy:{createdAt:"desc"}}))}
export async function POST(req:Request){const b=await req.json();if(!b.sequenceId||!b.title||!b.content)return NextResponse.json({error:"ATP, judul dan isi materi wajib diisi"},{status:400});return NextResponse.json(await prisma.learningMaterial.create({data:{sequenceId:b.sequenceId,title:b.title,content:b.content}}),{status:201})}