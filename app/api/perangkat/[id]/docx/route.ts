import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { prisma } from "@/lib/prisma";

function label(key:string){return key.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase())}

export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const {id}=await params;
    const device=await prisma.teachingDevice.findUnique({where:{id},include:{school:true}});
    if(!device)return NextResponse.json({error:"Perangkat tidak ditemukan."},{status:404});
    const content=(device.content||{}) as Record<string,unknown>;\n    const school=device.school;
    const children:Paragraph[]=[\n      new Paragraph({text:school?.name||String(content.namaSekolah||"Nama Sekolah"),alignment:1,heading:HeadingLevel.HEADING_1}),\n      new Paragraph({text:school?.address||String(content.alamatSekolah||""),alignment:1}),\n      new Paragraph({text:school?.npsn?`NPSN: ${school.npsn}`:"",alignment:1}),
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
    children.push(new Paragraph({text:" "}));\n    children.push(new Paragraph({text:"Mengetahui,",alignment:2}));\n    children.push(new Paragraph({text:school?.name||"Nama Sekolah",alignment:2}));\n    children.push(new Paragraph({text:"Kepala Sekolah",alignment:2}));\n    children.push(new Paragraph({text:"\n\n\n"+(school?.principalName||"________________________"),alignment:2}));\n    if(school?.principalNip)children.push(new Paragraph({text:"NIP. "+school.principalNip,alignment:2}));\n    const doc=new Document({sections:[{properties:{},children}]});\n    const buffer=await Packer.toBuffer(doc);
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