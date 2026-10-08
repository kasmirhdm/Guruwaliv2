import { prisma } from "./prisma";

export async function snapshotMasterCurriculum(curriculumId:string,label?:string){
  const curriculum=await prisma.curriculum.findUnique({
    where:{id:curriculumId},
    include:{
      phases:{orderBy:{name:"asc"}},
      outcomes:{orderBy:{title:"asc"},include:{
        masterSubject:true,
        objectives:{orderBy:{title:"asc"},include:{
          sequences:{orderBy:{title:"asc"},include:{
            materials:{orderBy:{title:"asc"}}
          }}
        }}
      }}
    }
  });
  if(!curriculum) return null;
  const last=await prisma.masterCurriculumRevision.findFirst({
    where:{curriculumId},
    orderBy:{version:"desc"}
  });
  return prisma.masterCurriculumRevision.create({
    data:{
      curriculumId,
      version:(last?.version||0)+1,
      label:label||null,
      snapshot:curriculum
    }
  });
}
