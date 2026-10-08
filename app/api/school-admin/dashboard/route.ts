import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {requireSchoolAdmin} from "@/lib/school-access";

export async function GET(){
 const {schoolId,response}=await requireSchoolAdmin(); if(response)return response;
 const [school,guru,kelas,devices,pending]=await Promise.all([
  prisma.school.findUnique({where:{id:schoolId!},select:{id:true,name:true,npsn:true,address:true,principalName:true,principalNip:true,logoPath:true}}),
  prisma.schoolMembership.count({where:{schoolId:schoolId!,status:"ACTIVE",role:"TEACHER"}}),
  prisma.schoolClass.count({where:{schoolId:schoolId!}}),
  prisma.teachingDevice.count({where:{schoolId:schoolId!}}),
  prisma.schoolMembership.count({where:{schoolId:schoolId!,status:"PENDING"}}),
  prisma.student.count({where:{schoolId:schoolId!}})
 ]);
 return NextResponse.json({school,guru,kelas,devices,pending,siswa});
}