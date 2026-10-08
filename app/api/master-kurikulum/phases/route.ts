import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
export async function GET(){return NextResponse.json(await prisma.phase.findMany({include:{curriculum:true},orderBy:{name:"asc"}}))}
export async function POST(req:Request){const body=await req.json();if(!body.curriculumId||!body.name?.trim())return NextResponse.json({error:"Kurikulum dan nama fase wajib diisi"},{status:400});return NextResponse.json(await prisma.phase.create({data:{curriculumId:body.curriculumId,name:body.name.trim()}}),{status:201})}