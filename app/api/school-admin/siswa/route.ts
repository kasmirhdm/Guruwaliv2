import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {requireSchoolAdmin} from "@/lib/school-access";
export async function GET(){
 const {schoolId,response}=await requireSchoolAdmin();if(response)return response;
 const rows=await prisma.student.findMany({where:{schoolId:schoolId!},select:{id:true,name:true,nis:true,nisn:true,gender:true,status:true,source:true,schoolClass:{select:{id:true,name:true,grade:true}}},orderBy:{name:"asc"}});
 return NextResponse.json(rows);
}
