import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentUser} from "@/lib/auth";

export async function GET(req:Request){
 const user=await getCurrentUser(); if(!user)return NextResponse.json({error:"Anda harus login."},{status:401});
 const schoolIds=(await prisma.schoolMembership.findMany({where:{userId:user.id,status:"ACTIVE"},select:{schoolId:true}})).map(x=>x.schoolId);
 if(!schoolIds.length)return NextResponse.json({periods:[]});
 const periods=await prisma.reportPeriod.findMany({where:{schoolId:{in:schoolIds}},include:{_count:{select:{grades:true}}},orderBy:{academicYear:"desc"}});
 return NextResponse.json(periods);
}
export async function POST(req:Request){
 const user=await getCurrentUser(); if(!user)return NextResponse.json({error:"Anda harus login."},{status:401});
 const b=await req.json(); const schoolId=typeof b.schoolId==="string"?b.schoolId:null;
 if(!schoolId||!b.academicYear||!b.semester||!b.name)return NextResponse.json({error:"Sekolah, tahun ajaran, semester, dan nama periode wajib diisi."},{status:400});
 const allowed=await prisma.schoolMembership.findFirst({where:{schoolId,userId:user.id,status:"ACTIVE",role:{in:["SCHOOL_ADMIN","TEACHER"]}}});
 if(!allowed)return NextResponse.json({error:"Anda tidak memiliki akses ke sekolah ini."},{status:403});
 const period=await prisma.reportPeriod.create({data:{schoolId,academicYear:b.academicYear,semester:b.semester,name:b.name,isActive:true}});
 return NextResponse.json(period,{status:201});
}