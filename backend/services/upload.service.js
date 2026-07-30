import crypto from 'node:crypto';
import path from 'node:path';
import mongoose from 'mongoose';
import { Profile } from '../models/index.js';
import { deleteObject, putObject } from './r2.service.js';

export const uploadConfig = {
  portrait: { field: 'portrait', folder: 'avatar', mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  cv: { field: 'cv', folder: 'cv', mimeTypes: ['application/pdf'] },
  logo: { mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  image: { mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] }
};

const safeFolder = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const reservedFolders = new Set(['avatar', 'cv', 'top', 'about', 'skills', 'experience', 'contact', 'content']);
const objectKeyFromUrl = url => url?.match(/^\/uploads\/((?:[a-z0-9-]+\/)?[a-zA-Z0-9._-]+)$/)?.[1];

export function validContentFolder(folder) {
  return safeFolder.test(folder || '') && !reservedFolders.has(folder);
}

export const removeUploadedFile = async (url) => {
  const key = objectKeyFromUrl(url);
  if (key) await deleteObject(key);
};

async function uploadFile(file, folder) {
  const key = `${folder}/${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
  await putObject(key, file);
  return `/uploads/${key}`;
}

export async function saveProfileUpload(kind, file) {
  const config = uploadConfig[kind];
  if (!config || !file || !config.mimeTypes.includes(file.mimetype)) {
    return null;
  }

  const url = await uploadFile(file, config.folder);
  let oldProfile;
  try {
    oldProfile = await Profile.findOneAndUpdate(
      { identity: 'primary' },
      { $set: { [config.field]: url } },
      { new: false, runValidators: true }
    ).lean();
    if (!oldProfile) throw new mongoose.Error.DocumentNotFoundError('Profile');
  } catch (error) {
    await removeUploadedFile(url).catch(() => {});
    throw error;
  }

  const oldUrl = oldProfile[config.field];
  if (oldUrl?.startsWith('/uploads/')) {
    await removeUploadedFile(oldUrl).catch(() => {});
  }
  return url;
}

export async function saveContentUpload(kind, file, folder) {
  const config = uploadConfig[kind];
  if (!config || config.field || !file || !config.mimeTypes.includes(file.mimetype) || !validContentFolder(folder)) {
    return null;
  }
  return uploadFile(file, folder);
}
