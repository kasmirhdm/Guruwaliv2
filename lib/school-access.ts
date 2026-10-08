import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { getCurrentUser } from "./auth";

export async function requireSchoolAdmin(){
  const user=await getCurrentUser();
  if(!user)return {user:null,schoolId:null,response:NextResponse.json({error:"Anda harus login."},{status:401})};
  if(user.role!=="SCHOOL_ADMIN")return {user:null,schoolId:null,response:NextResponse.json({error:"Akses Admin Sekolah ditolak."},{status:403})};
  const membership=await prisma.schoolMembership.findFirst({where:{userId:user.id,status:"ACTIVE"},select:{schoolId:true}});
  if(!membership)return {user,schoolId:null,response:NextResponse.json({error:"Admin Sekolah belum terhubung ke sekolah."},{status:403})};
  return {user,schoolId:membership.schoolId,response:null};
}