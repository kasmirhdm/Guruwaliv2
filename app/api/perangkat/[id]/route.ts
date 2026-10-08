import { NextResponse } from "next/server";
import { requireDeviceAccess } from "../../../../lib/device-access";
import { prisma } from "../../../../lib/prisma";

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params; const access=await requireDeviceAccess(id); if(access.response)return access.response; return NextResponse.json(access.device);
}
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params; const access=await requireDeviceAccess(id,true); if(access.response)return access.response; const b=await req.json();
 const data=await prisma.teachingDevice.update({where:{id},data:{title:b.title,type:b.type,subjectName:b.subjectName,className:b.className,academicYear:b.academicYear,curriculumId:b.curriculumId,phaseId:b.phaseId,outcomeId:b.outcomeId,objectiveId:b.objectiveId,sequenceId:b.sequenceId,materialId:b.materialId,content:b.content,status:b.status}});
 return NextResponse.json(data);
}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params; const access=await requireDeviceAccess(id,true); if(access.response)return access.response; await prisma.teachingDevice.delete({where:{id}}); return NextResponse.json({ok:true});
}