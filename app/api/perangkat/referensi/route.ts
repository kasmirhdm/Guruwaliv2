import {NextResponse} from "next/server";import {prisma} from "@/lib/prisma";import {getCurrentUser} from "@/lib/auth";
export async function GET(req:Request){const user=await getCurrentUser();if(!user)return NextResponse.json({error:"Anda harus login."},{status:401});const q=new URL(req.url).searchParams;const kind=q.get("kind");const id=q.get("id");const curriculumId=q.get("curriculumId");const phaseId=q.get("phaseId");const subjectId=q.get("subjectId");const outcomeId=q.get("outcomeId");const objectiveId=q.get("objectiveId");const sequenceId=q.get("sequenceId");
const memberships=await prisma.schoolMembership.findMany({where:{userId:user.id,status:"ACTIVE"},select:{schoolId:true}});const schoolIds=memberships.map(x=>x.schoolId);
if(kind==="curricula"){const data=await prisma.curriculum.findMany({where:{sourceType:"SCHOOL",schoolId:{in:schoolIds}},select:{id:true,name:true,description:true},orderBy:{name:"asc"}});return NextResponse.json(data)}
if(!curriculumId)return NextResponse.json([]);
const allowed=await prisma.curriculum.findFirst({where:{id:curriculumId,sourceType:"SCHOOL",schoolId:{in:schoolIds}},select:{id:true}});if(!allowed)return NextResponse.json({error:"Kurikulum sekolah tidak tersedia untuk akun ini."},{status:403});
if(kind==="phases")return NextResponse.json(await prisma.phase.findMany({where:{curriculumId},orderBy:{name:"asc"}}));
if(kind==="subjects"){return NextResponse.json(await prisma.masterSubject.findMany({where:{isActive:true,learningOutcomes:{some:{curriculumId}}},orderBy:{name:"asc"}}))}
if(kind==="outcomes")return NextResponse.json(await prisma.learningOutcome.findMany({where:{curriculumId,phaseId:phaseId||undefined,masterSubjectId:subjectId||undefined,sourceType:"SCHOOL"},orderBy:{title:"asc"}}));
if(kind==="objectives")return NextResponse.json(await prisma.learningObjective.findMany({where:{outcomeId:id||outcomeId||undefined},orderBy:{title:"asc"}}));
if(kind==="sequences")return NextResponse.json(await prisma.learningSequence.findMany({where:{objectiveId:id||objectiveId||undefined},orderBy:{title:"asc"}}));
if(kind==="materials")return NextResponse.json(await prisma.learningMaterial.findMany({where:{sequenceId:id||sequenceId||undefined},orderBy:{title:"asc"}}));
return NextResponse.json([])}