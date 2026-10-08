import { NextResponse } from "next/server";
import { requireRole } from "../../../../../lib/require-auth";
import { prisma } from "../../../../../lib/prisma";
import { snapshotMasterCurriculum } from "../../../../../lib/master-curriculum-revision";

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
  const guard=await requireRole(["GURUWALI_ADMIN"]); if(guard.response)return guard.response;
  const {id}=await params; const b=await req.json();
  const current=await prisma.learningObjective.findUnique({where:{id},select:{outcome:{select:{curriculumId:true}}}});
  if(current?.outcome.curriculumId) await snapshotMasterCurriculum(current.outcome.curriculumId,"Sebelum perubahan Master Kurikulum");
  return NextResponse.json(await prisma.learningObjective.update({where:{id},data:{outcomeId:b.outcomeId,title:b.title,content:b.content}}));
}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
  const guard=await requireRole(["GURUWALI_ADMIN"]); if(guard.response)return guard.response;
  const {id}=await params; const current=await prisma.learningObjective.findUnique({where:{id},select:{outcome:{select:{curriculumId:true}}}});
  if(current?.outcome.curriculumId) await snapshotMasterCurriculum(current.outcome.curriculumId,"Sebelum penghapusan Master Kurikulum");
  await prisma.learningObjective.delete({where:{id}}); return NextResponse.json({ok:true});
}
