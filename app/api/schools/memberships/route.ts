import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function schoolForAdmin(userId:string){
  return prisma.schoolMembership.findFirst({where:{userId,status:"ACTIVE",role:"SCHOOL_ADMIN"},select:{schoolId:true}});
}
export async function GET(){
  const user=await getCurrentUser();
  if(!user)return NextResponse.json({error:"Anda harus login."},{status:401});
  if(user.role!=="SCHOOL_ADMIN")return NextResponse.json({error:"Akses ditolak."},{status:403});
  const membership=await schoolForAdmin(user.id);
  if(!membership)return NextResponse.json({error:"Admin Sekolah belum terhubung ke sekolah."},{status:403});
  const rows=await prisma.schoolMembership.findMany({where:{schoolId:membership.schoolId,status:"PENDING"},include:{user:{select:{id:true,name:true,email:true,teacherMode:true,createdAt:true}}},orderBy:{createdAt:"asc"}});
  return NextResponse.json(rows);
}