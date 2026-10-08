import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {requireSchoolAdmin} from "@/lib/school-access";

export async function GET(){
 const {schoolId,response}=await requireSchoolAdmin(); if(response)return response;
 const rows=await prisma.schoolMembership.findMany({where:{schoolId:schoolId!,status:"ACTIVE",role:"TEACHER"},include:{user:{select:{id:true,name:true,email:true,teacherMode:true,status:true,createdAt:true}}},orderBy:{joinedAt:"desc"});
 return NextResponse.json(rows);
}