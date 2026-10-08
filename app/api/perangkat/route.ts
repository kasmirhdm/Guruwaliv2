import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req:Request){
  const userId=new URL(req.url).searchParams.get("userId");
  if(!userId)return NextResponse.json({error:"userId wajib diisi"},{status:400});
  return NextResponse.json(await prisma.teachingDevice.findMany({where:{ownerUserId:userId},orderBy:{updatedAt:"desc"}}));
}

export async function POST(req:Request){
  const b=await req.json();
  if(!b.ownerUserId||!b.type||!b.title)return NextResponse.json({error:"Pemilik, jenis dan judul wajib diisi"},{status:400});
  const content={...(b.content||{})};

  if(b.type==="MODUL_AJAR"){
    const [cp,tp,atp,materi]=await Promise.all([
      b.outcomeId?prisma.learningOutcome.findUnique({where:{id:b.outcomeId}}):null,
      b.objectiveId?prisma.learningObjective.findUnique({where:{id:b.objectiveId}}):null,
      b.sequenceId?prisma.learningSequence.findUnique({where:{id:b.sequenceId}}):null,
      b.materialId?prisma.learningMaterial.findUnique({where:{id:b.materialId}}):null
    ]);
    if(cp)content.cp=cp.content||cp.title;
    if(tp)content.tp=tp.content||tp.title;
    if(atp)content.atp=atp.content||atp.title;
    if(materi)content.materi=materi.content||materi.title;
    if(!content.titleMateri && materi)content.titleMateri=materi.title;
  }

  const device=await prisma.teachingDevice.create({data:{
    ownerUserId:b.ownerUserId,type:b.type,title:b.title,subjectName:b.subjectName||null,className:b.className||null,
    academicYear:b.academicYear||null,curriculumId:b.curriculumId||null,phaseId:b.phaseId||null,outcomeId:b.outcomeId||null,
    objectiveId:b.objectiveId||null,sequenceId:b.sequenceId||null,materialId:b.materialId||null,content
  }});
  return NextResponse.json(device,{status:201});
}