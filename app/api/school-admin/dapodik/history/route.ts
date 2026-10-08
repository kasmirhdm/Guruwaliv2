import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {requireSchoolAdmin} from "@/lib/school-access";
export async function GET(){
 const {schoolId,response}=await requireSchoolAdmin();if(response)return response;
 const rows=await prisma.dapodikImportLog.findMany({where:{schoolId:schoolId!},orderBy:{createdAt:"desc"},take:10});
 return NextResponse.json(rows);
}
