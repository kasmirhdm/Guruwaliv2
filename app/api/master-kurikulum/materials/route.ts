import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/require-auth";
import { prisma } from "../../../../lib/prisma";
export async function GET(req:Request){const guard=await requireRole(["GURUWALI_ADMIN"]);if(guard.response)return guard.response;const sequenceId=new URL(req.url).searchParams.get("sequenceId");return NextResponse.json(await prisma.learningMaterial.findMany({where:sequenceId?{sequenceId}:undefined,include:{sequence:true},orderBy:{createdAt:"desc"}}));}
export async function POST(req:Request){const guard=await requireRole(["GURUWALI_ADMIN"]);if(guard.response)return guard.response;const b=await req.json();if(!b.sequenceId||!b.title||!b.content)return NextResponse.json({error:"ATP, judul dan isi materi wajib diisi"},{status:400});return NextResponse.json(await prisma.learningMaterial.create({data:{sequenceId:b.sequenceId,title:b.title,content:b.content}}),{status:201});}
