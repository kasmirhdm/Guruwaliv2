import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  const user=await getCurrentUser();
  if(!user)return NextResponse.json({error:"Anda harus login."},{status:401});
  if(user.role!=="SCHOOL_ADMIN")return NextResponse.json({error:"Akses ditolak."},{status:403});
  const admin=await prisma.schoolMembership.findFirst({where:{userId:user.id,status:"ACTIVE",role:"SCHOOL_ADMIN"},select:{schoolId:true}});
  if(!admin)return NextResponse.json({error:"Admin Sekolah belum terhubung ke sekolah."},{status:403});
  const {id}=await params; const b=await req.json(); const status=b.status;
  if(status!=="ACTIVE"&&status!=="REJECTED")return NextResponse.json({error:"Status tidak valid."},{status:400});
  const target=await prisma.schoolMembership.findFirst({where:{id,schoolId:admin.schoolId,status:"PENDING"}});
  if(!target)return NextResponse.json({error:"Permintaan tidak ditemukan."},{status:404});
  const updated=await prisma.schoolMembership.update({where:{id},data:{status,joinedAt:status==="ACTIVE"?new Date():null}});
  if(status==="ACTIVE")await prisma.user.update({where:{id:target.userId},data:{teacherMode:"SCHOOL"}});
  return NextResponse.json(updated);
}