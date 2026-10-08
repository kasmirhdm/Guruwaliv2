import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
export async function GET(){return NextResponse.json(await prisma.masterSubject.findMany({orderBy:{name:"asc"}}))}
export async function POST(req:Request){const body=await req.json();if(!body.name?.trim())return NextResponse.json({error:"Nama mata pelajaran wajib diisi"},{status:400});const data=await prisma.masterSubject.create({data:{name:body.name.trim(),code:body.code||null}});return NextResponse.json(data,{status:201})}