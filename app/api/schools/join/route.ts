import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req:NextRequest){
  const user=await getCurrentUser();
  if(!user)return NextResponse.json({error:"Anda harus login."},{status:401});
  if(user.role!=="TEACHER")return NextResponse.json({error:"Hanya akun Guru yang dapat mengajukan bergabung ke sekolah."},{status:403});
  const b=await req.json();
  const schoolId=String(b.schoolId||"");
  if(!schoolId)return NextResponse.json({error:"Sekolah wajib dipilih."},{status:400});
  const school=await prisma.school.findUnique({where:{id:schoolId},select:{id:true,name:true}});
  if(!school)return NextResponse.json({error:"Sekolah tidak ditemukan."},{status:404});
  const existing=await prisma.schoolMembership.findUnique({where:{schoolId_userId:{schoolId,userId:user.id}}});
  if(existing){
    if(existing.status==="PENDING")return NextResponse.json({error:"Permintaan Anda masih menunggu persetujuan."},{status:409});
    if(existing.status==="ACTIVE")return NextResponse.json({error:"Anda sudah menjadi anggota sekolah ini."},{status:409});
    const membership=await prisma.schoolMembership.update({where:{id:existing.id},data:{status:"PENDING",role:"TEACHER",joinedAt:null}});
    return NextResponse.json({message:"Permintaan bergabung dikirim ulang.",membership});
  }
  const membership=await prisma.schoolMembership.create({data:{schoolId,userId:user.id,role:"TEACHER",status:"PENDING"}});
  return NextResponse.json({message:"Permintaan bergabung berhasil dikirim.",membership},{status:201});
}

export async function GET(){
  const user=await getCurrentUser();
  if(!user)return NextResponse.json({error:"Anda harus login."},{status:401});
  const memberships=await prisma.schoolMembership.findMany({where:{userId:user.id},include:{school:{select:{id:true,name:true,npsn:true}}},orderBy:{createdAt:"desc"}});
  return NextResponse.json(memberships);
}