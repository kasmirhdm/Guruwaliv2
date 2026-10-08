import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";

export async function GET(req:Request){
  const user=await getCurrentUser();
  if(!user)return NextResponse.json({error:"Anda harus login."},{status:401});
  const requested=new URL(req.url).searchParams.get("userId");
  const userId=user.role==="GURUWALI_ADMIN"&&requested?requested:user.id;
  return NextResponse.json(await prisma.teachingDevice.findMany({where:{ownerUserId:userId},orderBy:{updatedAt:"desc"}}));
}

export async function POST(req:Request){
  const user=await getCurrentUser();
  if(!user)return NextResponse.json({error:"Anda harus login."},{status:401});
  const b=await req.json();
  if(!b.type||!b.title)return NextResponse.json({error:"Jenis dan judul wajib diisi"},{status:400});
  let schoolId:string|null=null;
  if(user.role!=="GURUWALI_ADMIN"){
    const memberships=await prisma.schoolMembership.findMany({where:{userId:user.id,status:"ACTIVE"},select:{schoolId:true}});
    if(memberships.length===1) schoolId=memberships[0].schoolId;
    else if(b.schoolId&&memberships.some(m=>m.schoolId===b.schoolId)) schoolId=b.schoolId;
  } else if(b.schoolId){
    const school=await prisma.school.findUnique({where:{id:b.schoolId},select:{id:true}});
    if(!school)return NextResponse.json({error:"Sekolah tidak ditemukan."},{status:400});
    schoolId=school.id;
  }

  const content={...(b.content||{})};

  if(b.curriculumId && b.phaseId){
    const phase=await prisma.phase.findFirst({where:{id:b.phaseId,curriculumId:b.curriculumId}});
    if(!phase)return NextResponse.json({error:"Fase tidak sesuai dengan kurikulum yang dipilih."},{status:400});
  }

  if(b.outcomeId){
    const cp=await prisma.learningOutcome.findFirst({
      where:{id:b.outcomeId,curriculumId:b.curriculumId||undefined,phaseId:b.phaseId||undefined,masterSubjectId:b.subjectId||undefined,isMaster:true,sourceType:"PLATFORM_MASTER"}
    });
    if(!cp)return NextResponse.json({error:"CP Master tidak sesuai dengan Kurikulum, Fase, atau Mata Pelajaran yang dipilih."},{status:400});
    if(b.type==="MODUL_AJAR"){content.cp=cp.content||cp.title;}
  }

  if(b.objectiveId){
    const tp=await prisma.learningObjective.findFirst({where:{id:b.objectiveId,outcomeId:b.outcomeId||undefined}});
    if(!tp)return NextResponse.json({error:"TP tidak sesuai dengan CP yang dipilih."},{status:400});
    if(b.type==="MODUL_AJAR")content.tp=tp.content||tp.title;
  }

  if(b.sequenceId){
    const atp=await prisma.learningSequence.findFirst({where:{id:b.sequenceId,objectiveId:b.objectiveId||undefined}});
    if(!atp)return NextResponse.json({error:"ATP tidak sesuai dengan TP yang dipilih."},{status:400});
    if(b.type==="MODUL_AJAR")content.atp=atp.content||atp.title;
  }

  if(b.materialId){
    const materi=await prisma.learningMaterial.findFirst({where:{id:b.materialId,sequenceId:b.sequenceId||undefined}});
    if(!materi)return NextResponse.json({error:"Materi tidak sesuai dengan ATP yang dipilih."},{status:400});
    if(b.type==="MODUL_AJAR"){content.materi=materi.content||materi.title;content.titleMateri=materi.title;}
  }

  if(b.type==="MODUL_AJAR" && (b.outcomeId || b.objectiveId || b.sequenceId || b.materialId)){
    if(!b.curriculumId||!b.phaseId||!b.subjectId||!b.outcomeId||!b.objectiveId||!b.sequenceId||!b.materialId){
      return NextResponse.json({error:"Untuk Modul Ajar, pilih lengkap: Kurikulum → Fase → Mata Pelajaran → CP → TP → ATP → Materi."},{status:400});
    }
  }

  const device=await prisma.teachingDevice.create({data:{
    ownerUserId:user.id,schoolId,type:b.type,title:b.title,subjectName:b.subjectName||null,className:b.className||null,
    academicYear:b.academicYear||null,curriculumId:b.curriculumId||null,phaseId:b.phaseId||null,outcomeId:b.outcomeId||null,
    objectiveId:b.objectiveId||null,sequenceId:b.sequenceId||null,materialId:b.materialId||null,schoolClassId:b.schoolClassId||null,content
  }});
  return NextResponse.json(device,{status:201});
}
