import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
export async function GET(req:Request){
  const p=new URL(req.url).searchParams;
  const curriculumId=p.get("curriculumId"); const phaseId=p.get("phaseId"); const masterSubjectId=p.get("masterSubjectId");
  return NextResponse.json(await prisma.learningOutcome.findMany({where:{isMaster:true,sourceType:"PLATFORM_MASTER",...(curriculumId?{curriculumId}:{}),...(phaseId?{phaseId}:{}),...(masterSubjectId?{masterSubjectId}:{})},include:{phase:true,masterSubject:true},orderBy:{createdAt:"desc"}}));
}
export async function POST(req:Request){const body=await req.json();if(!body.curriculumId||!body.phaseId||!body.title||!body.content)return NextResponse.json({error:"Kurikulum, fase, judul dan isi CP wajib diisi"},{status:400});const data=await prisma.learningOutcome.create({data:{curriculumId:body.curriculumId,phaseId:body.phaseId,masterSubjectId:body.masterSubjectId||null,title:body.title,content:body.content,sourceType:"PLATFORM_MASTER",isMaster:true}});return NextResponse.json(data,{status:201})}