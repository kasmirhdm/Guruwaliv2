import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/require-auth";
import { prisma } from "../../../../../lib/prisma";
export async function PATCH(req:Request,{params}:{paconst guard=await requireRole(["GURUWALI_ADMIN"]);if(guard.response)return guard.response;params}:{params:Promise<{id:string}>}){const {id}=await params;const body=await req.json();return NextResponse.json(await prisma.phase.update({where:{id},data:{name:body.name?.trim()}}))}
export async function DELETE(_:Request,{params}:{const guard=await requireRole(["GURUWALI_ADMIN"]);if(guard.response)return guard.response;params}:{params:Promise<{id:string}>}){const {id}=await params;await prisma.phase.delete({where:{id}});return NextResponse.json({ok:true})}