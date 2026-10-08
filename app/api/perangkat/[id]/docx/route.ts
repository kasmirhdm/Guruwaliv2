import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { prisma } from "@/lib/prisma";

function label(key:string){return key.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase())}

export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const {id}=await params;
    const device=await prisma.teachingDevice.findUnique({where:{id}});
    if(!device)return NextResponse.json({error:"Perangkat tidak ditemukan."},{status:404});
    const content=(device.content||{}) as Record<string,unknown>;
    const children:Paragraph[]=[
      new Paragraph({text:device.title,heading:HeadingLevel.TITLE}),
      new Paragraph({children:[new TextRun({text:"GuruWali • Perangkat Ajar",bold:true})]}),
      new Paragraph({text:`Mata Pelajaran: ${device.subjectName||"-"} | Kelas: ${device.className||"-"} | Tahun Ajaran: ${device.academicYear||"-"}`}),
      new Paragraph({text:" "})
    ];
    for(const [key,value] of Object.entries(content)){
      if(value===null||value===undefined||String(value).trim()==="")continue;
      children.push(new Paragraph({text:label(key),heading:HeadingLevel.HEADING_2}));
      children.push(...String(value).split(/\\n+/).map(x=>new Paragraph({text:x.trim()})));
    }
    const doc=new Document({sections:[{properties:{},children}]});
    const buffer=await Packer.toBuffer(doc);
    const filename=device.title.replace(/[^a-zA-Z0-9_-]+/g,"-")+".docx";
    return new NextResponse(buffer,{status:200,headers:{
      "Content-Type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition":`attachment; filename="${filename}"`
    }});
  }catch(error){
    console.error(error);
    return NextResponse.json({error:"Gagal membuat DOCX."},{status:500});
  }
}