import 'dotenv/config';
import path from 'node:path';
import sharp from 'sharp';
import {connectDatabase, closeDatabase} from '../db.js';
import {CustomSection, Profile, Project} from '../models/index.js';
import {getObject, putBuffer} from '../services/r2.service.js';

const widths=[480,800,1200];
const keyFor=url=>url?.match(/^\/uploads\/((?:[a-z0-9-]+\/)?[a-zA-Z0-9._-]+)$/)?.[1];
const streamBuffer=async stream=>Buffer.concat(await Array.fromAsync(stream));
async function migrateUrl(url){
  const key=keyFor(url);
  if(!key||/-original\.[^.]+$/.test(key)||/\.pdf$/i.test(key))return url;
  const object=await getObject(key),buffer=await streamBuffer(object.Body);
  const base=key.slice(0,-path.extname(key).length);
  const originalKey=`${base}-original${path.extname(key).toLowerCase()}`;
  await putBuffer(originalKey,buffer,object.ContentType||'application/octet-stream');
  await Promise.all(widths.map(async width=>putBuffer(`${base}-${width}.webp`,await sharp(buffer).rotate().resize({width,withoutEnlargement:true}).webp({quality:82}).toBuffer(),'image/webp')));
  return `/uploads/${originalKey}`;
}

await connectDatabase();
try{
  const profile=await Profile.findOne({identity:'primary'});
  if(profile?.portrait){profile.portrait=await migrateUrl(profile.portrait);await profile.save();}
  for(const project of await Project.find()){
    project.imageUrls=await Promise.all((project.imageUrls||[]).map(migrateUrl));
    project.imageUrl=project.imageUrls[0]||await migrateUrl(project.imageUrl);
    project.logoUrl=await migrateUrl(project.logoUrl);
    await project.save();
  }
  for(const section of await CustomSection.find()){
    for(const block of section.blocks){
      block.logo=await migrateUrl(block.logo);block.image=await migrateUrl(block.image);
      block.images=await Promise.all((block.images||[]).map(migrateUrl));
    }
    await section.save();
  }
  console.log('Responsive image migration complete. Originals were retained in R2.');
}finally{await closeDatabase();}
