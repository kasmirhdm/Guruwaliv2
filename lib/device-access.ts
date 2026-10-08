import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import { prisma } from "./prisma";

export async function requireDeviceAccess(id:string,write=false){
  const user=await getCurrentUser();
  if(!user)return {user:null,device:null,response:NextResponse.json({error:"Anda harus login."},{status:401})};
  const device=await prisma.teachingDevice.findUnique({where:{id}});
  if(!device)return {user,device:null,response:NextResponse.json({error:"Perangkat tidak ditemukan."},{status:404})};
  const admin=user.role==="GURUWALI_ADMIN";
  const schoolAdmin=user.role==="SCHOOL_ADMIN"&&device.schoolId&&user.memberships.some(m=>m.schoolId===device.schoolId&&m.status==="ACTIVE");
  const owner=device.ownerUserId===user.id;
  if(!admin&&!schoolAdmin&&!owner)return {user,device,response:NextResponse.json({error:"Anda tidak memiliki akses ke perangkat ini."},{status:403})};
  if(write&&schoolAdmin&&!admin&&!owner)return {user,device,response:NextResponse.json({error:"Admin Sekolah tidak dapat mengubah perangkat milik guru."},{status:403})};
  return {user,device,response:null};
}
