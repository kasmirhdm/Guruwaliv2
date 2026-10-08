import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req:Request){
  const {searchParams}=new URL(req.url);
  const curriculumId=searchParams.get("curriculumId");
  if(!curriculumId)return NextResponse.json({error:"curriculumId wajib diisi"},{status:400});
  const revisions=await prisma.masterCurriculumRevision.findMany({
    where:{curriculumId},
    orderBy:{version:"desc"},
    select:{id: true, version:true, label:true, createdAt:true}
  });
  return NextResponse.json(revisions);
}
