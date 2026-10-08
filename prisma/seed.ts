import { PrismaClient, CurriculumSource } from "@prisma/client";
const prisma = new PrismaClient();
async function main(){
  const subjects=["Matematika","Bahasa Indonesia","Bahasa Inggris","IPA","IPS","Pendidikan Pancasila","Informatika","PJOK","Seni Budaya"];
  for(const name of subjects){ await prisma.masterSubject.upsert({where:{name},update:{isActive:true},create:{name,isActive:true}}); }
  const curriculum=await prisma.curriculum.upsert({where:{id:"master-kurikulum-merdeka"},update:{name:"Kurikulum Merdeka",sourceType:CurriculumSource.PLATFORM_MASTER},create:{id:"master-kurikulum-merdeka",name:"Kurikulum Merdeka",description:"Master kurikulum resmi platform GuruWali",sourceType:CurriculumSource.PLATFORM_MASTER}});
  for(const name of ["A","B","C","D","E","F"]){ const id="master-phase-"+name; await prisma.phase.upsert({where:{id},update:{name},create:{id,curriculumId:curriculum.id,name}}); }
  console.log("Master curriculum ready:",curriculum.name);
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
