import {NextRequest,NextResponse} from "next/server";
import * as XLSX from "xlsx";
import {prisma} from "@/lib/prisma";
import {requireSchoolAdmin} from "@/lib/school-access";

const norm=(v:any)=>String(v??"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"");
const clean=(v:any)=>{const s=String(v??"").trim();return s||null};
function parseDate(v:any):Date|null{
 if(!v)return null;
 if(typeof v==="number"){const d=XLSX.SSF.parse_date_code(v);return d?new Date(Date.UTC(d.y,d.m-1,d.d)):null}
 const s=String(v).trim();
 const m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
 if(m)return new Date(Date.UTC(+m[3],+m[2]-1,+m[1]));
 const d=new Date(s);return isNaN(d.getTime())?null:d;
}
function sheetRows(wb:XLSX.WorkBook,terms:string[]){
 const hit=wb.SheetNames.find(n=>terms.some(t=>norm(n).includes(norm(t))));
 if(!hit)return [];
 return XLSX.utils.sheet_to_json(wb.Sheets[hit],{header:1,defval:""}) as any[][];
}
function table(rows:any[][]){
 let header=-1;
 for(let i=0;i<Math.min(rows.length,15);i++){
  const keys=rows[i].map(norm);
  if(keys.some(k=>["nisn","nama","namasiswa","namapesertadidik","rombel","kelas"].includes(k))){header=i;break}
 }
 if(header<0)return {headers:[],rows:[]};
 const headers=rows[header].map(norm);
 return {headers,rows:rows.slice(header+1).filter(r=>r.some((x:any)=>String(x).trim()))};
}
function val(headers:string[],row:any[],names:string[]){
 const i=headers.findIndex(h=>names.includes(h));return i>=0?clean(row[i]):null;
}
function gradeOf(name:string){
 const m=String(name||"").toUpperCase().match(/\b(VII|VIII|IX|7|8|9)\b/);
 if(!m)return null;
 return ({VII:"VII",VIII:"VIII",IX:"IX","7":"VII","8":"VIII","9":"IX"} as any)[m[1]]||null;
}
function parseTeachers(wb:XLSX.WorkBook){
 const rows=sheetRows(wb,["ptk","gtk","guru","tenaga"]);
 const t=table(rows);return t.rows.map(r=>({
  name:val(t.headers,r,["nama","namapendidik","namaguru","namaptk"]),
  nip:val(t.headers,r,["nip","nipbaru"]),
  nuptk:val(t.headers,r,["nuptk"]),
  nik:val(t.headers,r,["nik"]),
  email:val(t.headers,r,["email","emailptk"]),
  phone:val(t.headers,r,["nomorhp","nohp","telepon","notelp"])
 })).filter(x=>x.name);
}
function parseStudents(wb:XLSX.WorkBook){
 const rows=sheetRows(wb,["pesertadidik","pesertadidik","siswa"]);
 const t=table(rows);return t.rows.map(r=>({
  nis:val(t.headers,r,["nis"]),
  nisn:val(t.headers,r,["nisn"]),
  nik:val(t.headers,r,["nik"]),
  name:val(t.headers,r,["nama","namasiswa","namapesertadidik"]),
  gender:val(t.headers,r,["jeniskelamin","jk"]),
  birthPlace:val(t.headers,r,["tempatlahir"]),
  birthDate:parseDate(val(t.headers,r,["tanggallahir","tgllahir"])||""),
  address:val(t.headers,r,["alamat","alamattinggal"]),
  parentName:val(t.headers,r,["namaayah","namaibu","namaorangtua","namaibukandung"]),
  parentPhone:val(t.headers,r,["nohporangtua","nohpibu","nohpayah","nomorhporangtua"]),
  className:val(t.headers,r,["rombel","rombonganbelajar","kelas"]),homeroomTeacherName:val(t.headers,r,["walikelas","namawalikelas","guruwalikelas"])
 })).filter(x=>x.name);
}

export async function POST(req:NextRequest){
 const {schoolId,response}=await requireSchoolAdmin();if(response)return response;
 try{
  const form=await req.formData(),file=form.get("file"),mode=String(form.get("mode")||"preview");
  if(!(file instanceof File))return NextResponse.json({error:"File Profil Dapodik belum dipilih."},{status:400});
  if(file.size>5*1024*1024)return NextResponse.json({error:"Ukuran file melebihi 5 MB."},{status:413});
  const wb=XLSX.read(await file.arrayBuffer(),{type:"array"});
  const students=parseStudents(wb),teachers=parseTeachers(wb);
  if(!students.length&&!teachers.length)return NextResponse.json({error:"Data Peserta Didik/PTK tidak ditemukan pada workbook ini."},{status:422});
  const [classes,activeTeachers]=await Promise.all([prisma.schoolClass.findMany({where:{schoolId:schoolId!},include:{homeroomTeacher:{select:{id:true,name:true,email:true}}}}),prisma.schoolMembership.findMany({where:{schoolId:schoolId!,status:"ACTIVE",role:"TEACHER"},select:{userId:true,user:{select:{id:true,name:true,email:true}}}})]);
  if(mode==="preview")return NextResponse.json({
   sheets:wb.SheetNames,
   summary:{students:students.length,teachers:teachers.length},
   studentPreview:students.slice(0,10),
   teacherPreview:teachers.slice(0,10),
   classes:classes.map(x=>({id:x.id,name:x.name,grade:x.grade,homeroomTeacher:x.homeroomTeacher}))
  });
  const classMap=new Map(classes.map(x=>[norm(x.name),x]));
  const teacherMap=new Map(activeTeachers.map(x=>[norm(x.user.name),x.user]));
  const importedTeachers=[];
  for(const t of teachers){
   const existingTeacher=t.nuptk
     ? await prisma.importedTeacher.findFirst({where:{schoolId:schoolId!,nuptk:t.nuptk}})
     : await prisma.importedTeacher.findFirst({where:{schoolId:schoolId!,name:t.name!},orderBy:{updatedAt:"desc"}});
   if(existingTeacher){
     await prisma.importedTeacher.update({where:{id:existingTeacher.id},data:{name:t.name!,nip:t.nip,nuptk:t.nuptk,nik:t.nik,email:t.email,phone:t.phone,status:"IMPORTED"}});
   }else{
     await prisma.importedTeacher.create({data:{schoolId:schoolId!,name:t.name!,nip:t.nip,nuptk:t.nuptk,nik:t.nik,email:t.email,phone:t.phone,status:"IMPORTED"}});
   }
   importedTeachers.push(t);
  }
  let created=0,updated=0,matchedClass=0,unmatchedClass=0,createdClasses=0;
  for(const s of students){
   if(!s.nisn&&!s.nik&&!s.name)continue;
   let cls=s.className?classMap.get(norm(s.className)):undefined;
   if(!cls&&s.className){
    const grade=gradeOf(s.className);
    const matchedTeacher=s.homeroomTeacherName?teacherMap.get(norm(s.homeroomTeacherName)):undefined;
    const createdClass=await prisma.schoolClass.create({data:{schoolId:schoolId!,name:s.className,grade,homeroomTeacherId:matchedTeacher?.id||null}});
    cls={...createdClass,homeroomTeacher:null};classMap.set(norm(s.className),cls);createdClasses++;
   }
   if(cls){matchedClass++; if(s.homeroomTeacherName&&!cls.homeroomTeacherId){const matchedTeacher=teacherMap.get(norm(s.homeroomTeacherName)); if(matchedTeacher) {await prisma.schoolClass.update({where:{id:cls.id},data:{homeroomTeacherId:matchedTeacher.id}}); cls={...cls,homeroomTeacher:{id:matchedTeacher.id,name:matchedTeacher.name,email:matchedTeacher.email}};}}}else if(s.className)unmatchedClass++;
   
   const existing=await prisma.student.findFirst({where:{schoolId:schoolId!,OR:[
    ...(s.nisn?[{nisn:s.nisn}]:[]),...(s.nik?[{nik:s.nik}]:[]),{name:s.name!}
   ]},orderBy:{updatedAt:"desc"}});
   const data:any={schoolId:schoolId!,schoolClassId:cls?.id||null,nis:s.nis,nisn:s.nisn,nik:s.nik,name:s.name!,gender:s.gender,birthPlace:s.birthPlace,birthDate:s.birthDate,address:s.address,parentName:s.parentName,parentPhone:s.parentPhone,source:"DAPODIK",status:"ACTIVE"};
   if(existing){await prisma.student.update({where:{id:existing.id},data});updated++}else{await prisma.student.create({data});created++}
  }
  await prisma.dapodikImportLog.create({data:{schoolId:schoolId!,fileName:file.name,studentsCreated:created,studentsUpdated:updated,teachersImported:importedTeachers.length,classesCreated:createdClasses,matchedClasses:matchedClass}});
  return NextResponse.json({message:"Data Dapodik berhasil diimpor.",summary:{created,updated,teachers:importedTeachers.length,matchedClass,unmatchedClass,createdClasses}});
 }catch(e){console.error("Dapodik people import:",e);return NextResponse.json({error:"Data Dapodik gagal diproses. Pastikan workbook berasal dari Dapodik."},{status:500})}
}
