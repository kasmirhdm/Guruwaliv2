import {NextResponse} from "next/server";
import {requireDeviceAccess} from "../../../../lib/device-access";
import {prisma} from "../../../../lib/prisma";

async function validateChain(b:any){
 if(!b.curriculumId&&!b.phaseId&&!b.outcomeId&&!b.objectiveId&&!b.sequenceId&&!b.materialId)return null;
 if(!b.curriculumId||!b.phaseId||!b.subjectId||!b.outcomeId||!b.objectiveId||!b.sequenceId||!b.materialId)return "Rangkaian harus lengkap: Kurikulum → Fase → Mata Pelajaran → CP → TP → ATP → Materi.";
 const curriculum=await prisma.curriculum.findFirst({where:{id:b.curriculumId,sourceType:"SCHOOL"}});
 if(!curriculum)return "Kurikulum sekolah tidak ditemukan.";
 const phase=await prisma.phase.findFirst({where:{id:b.phaseId,curriculumId:b.curriculumId}});
 if(!phase)return "Fase tidak sesuai dengan kurikulum.";
 const cp=await prisma.learningOutcome.findFirst({where:{id:b.outcomeId,curriculumId:b.curriculumId,phaseId:b.phaseId,masterSubjectId:b.subjectId,sourceType:"SCHOOL"}});
 if(!cp)return "CP tidak sesuai dengan rantai kurikulum sekolah.";
 const tp=await prisma.learningObjective.findFirst({where:{id:b.objectiveId,outcomeId:cp.id}});
 if(!tp)return "TP tidak sesuai dengan CP.";
 const atp=await prisma.learningSequence.findFirst({where:{id:b.sequenceId,objectiveId:tp.id}});
 if(!atp)return "ATP tidak sesuai dengan TP.";
 const materi=await prisma.learningMaterial.findFirst({where:{id:b.materialId,sequenceId:atp.id}});
 if(!materi)return "Materi tidak sesuai dengan ATP.";
 return null;
}

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params; const access=await requireDeviceAccess(id); if(access.response)return access.response; return NextResponse.json(access.device);
}
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params; const access=await requireDeviceAccess(id,true); if(access.response)return access.response;
 const b=await req.json(); if(!b.title)return NextResponse.json({error:"Judul wajib diisi."},{status:400});
 const chainError=await validateChain(b); if(chainError)return NextResponse.json({error:chainError},{status:400});
 const device=access.device!;
 if(b.schoolClassId){
  const schoolClass=await prisma.schoolClass.findFirst({where:{id:b.schoolClassId,schoolId:device.schoolId||undefined}});
  if(!schoolClass)return NextResponse.json({error:"Kelas tidak sesuai dengan sekolah perangkat."},{status:400});
 }
 const data=await prisma.teachingDevice.update({where:{id},data:{
  title:b.title,type:b.type||device.type,subjectName:b.subjectName??null,className:b.className??null,academicYear:b.academicYear??null,
  curriculumId:b.curriculumId??null,phaseId:b.phaseId??null,outcomeId:b.outcomeId??null,objectiveId:b.objectiveId??null,sequenceId:b.sequenceId??null,materialId:b.materialId??null,schoolClassId:b.schoolClassId??null,content:b.content??device.content,status:b.status||device.status
 }});
 return NextResponse.json(data);
}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params; const access=await requireDeviceAccess(id,true); if(access.response)return access.response; await prisma.teachingDevice.delete({where:{id}}); return NextResponse.json({ok:true});
}