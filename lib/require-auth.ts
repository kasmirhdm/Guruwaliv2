import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";

export async function requireUser(){
  const user=await getCurrentUser();
  if(!user) return {user:null,response:NextResponse.json({error:"Anda harus login."},{status:401})};
  return {user,response:null};
}

export async function requireRole(roles:string[]){
  const {user,response}=await requireUser();
  if(response||!user)return {user:null,response};
  if(!roles.includes(user.role))return {user:null,response:NextResponse.json({error:"Akses ditolak."},{status:403})};
  return {user,response:null};
}
