import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { closeDatabase, connectDatabase } from '../config/database.js';
import { CustomSection, Profile, Project } from '../models/index.js';
import { getObject, putObject } from '../services/r2.service.js';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uploadDir = path.join(backendDir, 'uploads');
const legacyUrl = /^\/uploads\/([a-zA-Z0-9._-]+)$/;
const contentTypes = {
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.webp': 'image/webp'
};
const migrated = new Map();
let copied = 0;
let failed = 0;

async function readSource(key) {
  try {
    return {
      buffer: await fs.readFile(path.join(uploadDir, key)),
      mimetype: contentTypes[path.extname(key).toLowerCase()] || 'application/octet-stream'
    };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const object = await getObject(key);
  return {
    buffer: Buffer.from(await object.Body.transformToByteArray()),
    mimetype: object.ContentType || contentTypes[path.extname(key).toLowerCase()] || 'application/octet-stream'
  };
}

async function migrateUrl(url, folder) {
  const key = url?.match(legacyUrl)?.[1];
  if (!key) return url;
  const destination = `${folder}/${key}`;
  if (migrated.has(destination)) return migrated.get(destination);

  try {
    await putObject(destination, await readSource(key));
    const nextUrl = `/uploads/${destination}`;
    migrated.set(destination, nextUrl);
    copied += 1;
    console.log(`Copied ${url} -> ${nextUrl}`);
    return nextUrl;
  } catch (error) {
    failed += 1;
    console.error(`Failed ${url} -> ${destination}: ${error.message}`);
    return url;
  }
}

async function migrateProfile() {
  const profile = await Profile.findOne({ identity: 'primary' }).lean();
  if (!profile) return;
  const portrait = await migrateUrl(profile.portrait, 'avatar');
  const cv = await migrateUrl(profile.cv, 'cv');
  await Profile.updateOne({ _id: profile._id }, { $set: { portrait, cv } });
}

async function migrateProjects() {
  for (const project of await Project.find().lean()) {
    const imageUrl = await migrateUrl(project.imageUrl, 'projects');
    const imageUrls = await Promise.all((project.imageUrls || []).map(url => migrateUrl(url, 'projects')));
    const logoUrl = await migrateUrl(project.logoUrl, 'projects');
    await Project.updateOne({ _id: project._id }, { $set: { imageUrl, imageUrls, logoUrl } });
  }
}

async function migrateCustomSections() {
  for (const section of await CustomSection.find().lean()) {
    const blocks = await Promise.all((section.blocks || []).map(async block => ({
      ...block,
      logo: await migrateUrl(block.logo, section.slug),
      image: await migrateUrl(block.image, section.slug),
      images: await Promise.all((block.images || []).map(url => migrateUrl(url, section.slug)))
    })));
    await CustomSection.updateOne({ _id: section._id }, { $set: { blocks } });
  }
}

try {
  await connectDatabase();
  await migrateProfile();
  await migrateProjects();
  await migrateCustomSections();
  console.log(`Migration complete: ${copied} object(s) copied, ${failed} failure(s). Legacy sources were preserved.`);
  if (failed) process.exitCode = 1;
} finally {
  await closeDatabase();
}
