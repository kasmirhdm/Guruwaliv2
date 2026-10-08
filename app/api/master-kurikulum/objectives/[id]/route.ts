import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const b=await req.json();return NextResponse.json(await prisma.learningObjective.update({where:{id},data:{outcomeId:b.outcomeId,title:b.title,content:b.content}}))}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;await prisma.learningObjective.delete({where:{id}});return NextResponse.json({ok:true})}