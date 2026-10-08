import {NextRequest,NextResponse} from "next/server";
import * as XLSX from "xlsx";
import {prisma} from "@/lib/prisma";
import {requireSchoolAdmin} from "@/lib/school-access";

type Profile={name?:string;npsn?:string;address?:string;principalName?:string;principalNip?:string};

const norm=(v:any)=>String(v??"").trim().toLowerCase().replace(/[\s_\-./:()]+/g,"");
const aliases:Record<keyof Profile,string[]>={
 name:["namasekolah","namasatuanpendidikan","namasekolah/satuanpendidikan","satuanpendidikan"],
 npsn:["npsn","nomorpokoksekolahnasional"],
 address:["alamat","alamatsekolah","alamatlengkap"],
 principalName:["namakepalasekolah","kepalasekolah","namakepala"],
 principalNip:["nipkepalasekolah","nipkepala","nipkepsek"]
};

function findValue(rows:any[][], keys:string[]){
 for(let r=0;r<rows.length;r++){
  for(let c=0;c<rows[r].length;c++){
   const key=norm(rows[r][c]);
   if(!keys.includes(key))continue;
   const same=String(rows[r][c+1]??"").trim();
   if(same && !keys.includes(norm(same)))return same;
   for(let rr=r+1;rr<Math.min(rows.length,r+4);rr++){
    const below=String(rows[rr][c]??"").trim();
    if(below)return below;
   }
  }
 }
 return "";
}

function parseWorkbook(buf:ArrayBuffer):Profile{
 const wb=XLSX.read(buf,{type:"array"});
 const result:Profile={};
 for(const sheetName of wb.SheetNames){
  const rows=XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{header:1,defval:""}) as any[][];
  if(!rows.length)continue;
  (Object.keys(aliases) as (keyof Profile)[]).forEach(field=>{
   if(result[field])return;
   const value=findValue(rows,aliases[field]);
   if(value)result[field]=value;
  });
 }
 return result;
}

export async function POST(req:NextRequest){
 const {schoolId,response}=await requireSchoolAdmin();
 if(response)return response;
 try{
  const form=await req.formData();
  const file=form.get("file");
  const mode=String(form.get("mode")||"preview");
  if(!(file instanceof File))return NextResponse.json({error:"File Profil Dapodik belum dipilih."},{status:400});
  const name=file.name.toLowerCase();
  if(!name.endsWith(".xlsx")&&!name.endsWith(".xls"))return NextResponse.json({error:"Gunakan file Profil Dapodik Excel (.xlsx/.xls). File .prf bukan format import GuruWali."},{status:400});
  const profile=parseWorkbook(await file.arrayBuffer());
  if(!profile.name&&!profile.npsn)return NextResponse.json({error:"Data profil sekolah tidak ditemukan. Pastikan yang diunggah adalah file Profil dari Pusat Unduhan Dapodik."},{status:422});
  const current=await prisma.school.findUnique({where:{id:schoolId!},select:{name:true,npsn:true,address:true,principalName:true,principalNip:true}});
  if(!current)return NextResponse.json({error:"Sekolah tidak ditemukan."},{status:404});
  if(mode==="preview")return NextResponse.json({profile,current});
  const data:any={};
  for(const field of ["name","npsn","address","principalName","principalNip"] as (keyof Profile)[]){
   if(profile[field])data[field]=profile[field]!.trim();
  }
  if(data.npsn){
   const other=await prisma.school.findFirst({where:{npsn:data.npsn,id:{not:schoolId!}},select:{id:true,name:true}});
   if(other)return NextResponse.json({error:"NPSN tersebut sudah terdaftar pada sekolah lain di GuruWali.",profile},{status:409});
  }
  const school=await prisma.school.update({where:{id:schoolId!},data});
  return NextResponse.json({message:"Profil Dapodik berhasil diimpor.",school});
 }catch(e){
  console.error("Dapodik profile import:",e);
  return NextResponse.json({error:"File Profil Dapodik tidak dapat dibaca."},{status:500});
 }
}
