import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

function label(key:string){return key.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase())}

export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 try{
  const {id}=await params;
  const device=await prisma.teachingDevice.findUnique({where:{id},include:{school:true}});
  if(!device)return NextResponse.json({error:"Perangkat tidak ditemukan."},{status:404});
  const content=(device.content||{}) as Record<string,unknown>;
  const school=device.school;
  const doc=new PDFDocument({size:"A4",margin:48});
  const chunks:Buffer[]=[];
  doc.on("data",b=>chunks.push(b));
  const done=new Promise<Buffer>((resolve,reject)=>{doc.on("end",()=>resolve(Buffer.concat(chunks)));doc.on("error",reject)});
  doc.fontSize(15).font("Helvetica-Bold").text(school?.name||String(content.namaSekolah||"Nama Sekolah"),{align:"center"});
  if(school?.address||content.alamatSekolah)doc.fontSize(9).font("Helvetica").text(school?.address||String(content.alamatSekolah),{align:"center"});\n  if(school?.npsn)doc.fontSize(8).text("NPSN: "+school.npsn,{align:"center"});
  doc.moveDown(0.5).moveTo(48,doc.y).lineTo(547,doc.y).stroke().moveDown(1);
  doc.fontSize(18).font("Helvetica-Bold").text(device.title);
  doc.moveDown(.3).fontSize(9).font("Helvetica").text(`Mata Pelajaran: ${device.subjectName||"-"}   |   Kelas: ${device.className||"-"}   |   Tahun Ajaran: ${device.academicYear||"-"}`);
  doc.moveDown(1);
  for(const [key,value] of Object.entries(content)){
   if(value===null||value===undefined||String(value).trim()==="")continue;
   doc.fontSize(11).font("Helvetica-Bold").text(label(key));
   doc.moveDown(.15).fontSize(9.5).font("Helvetica").text(String(value),{lineGap:3});
   doc.moveDown(.7);
  }
  doc.moveDown(2);\n  doc.text("Mengetahui,",380);\n  doc.text(school?.name||"Nama Sekolah",380);\n  doc.text("Kepala Sekolah",380);\n  doc.moveDown(2.5);\n  doc.font("Helvetica-Bold").text(school?.principalName||"________________________",380);\n  if(school?.principalNip)doc.font("Helvetica").text("NIP. "+school.principalNip,380);\n  doc.end();
  const buffer=await done;
  const filename=device.title.replace(/[^a-zA-Z0-9_-]+/g,"-")+".pdf";
  return new NextResponse(buffer,{status:200,headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${filename}"`}});
 }catch(error){console.error(error);return NextResponse.json({error:"Gagal membuat PDF."},{status:500})}
}