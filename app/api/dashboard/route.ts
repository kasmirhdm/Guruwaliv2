import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentUser} from "@/lib/auth";

export async function GET(){
 const user=await getCurrentUser();
 if(!user)return NextResponse.json({error:"Anda harus login."},{status:401});
 const [devices,documents,memberships]=await Promise.all([
  prisma.teachingDevice.count({where:{ownerUserId:user.id}}),
  prisma.document.count({where:{ownerUserId:user.id}}),
  prisma.schoolMembership.count({where:{userId:user.id,status:"ACTIVE"}})
 ]);
 const activeMemberships=await prisma.schoolMembership.findMany({where:{userId:user.id,status:"ACTIVE"},select:{schoolId:true}});
 const schoolIds=activeMemberships.map(x=>x.schoolId);
 const classes=schoolIds.length?await prisma.schoolClass.count({where:{schoolId:{in:schoolIds}}}):0;
 const school=schoolIds.length===1?await prisma.school.findUnique({where:{id:schoolIds[0]},select:{id:true,name:true,npsn:true}}):null;
 return NextResponse.json({user:{name:user.name,role:user.role},school,devices,documents,classes,memberships});
}