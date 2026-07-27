import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import { backendDir } from '../config/paths.js';
import { Profile } from '../models/index.js';

export const uploadConfig = {
  portrait: { field: 'portrait', mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  cv: { field: 'cv', mimeTypes: ['application/pdf'] }
};

export const removeUploadedFile = (filePath) => fs.promises.rm(filePath, { force: true });

export async function saveProfileUpload(kind, file) {
  const config = uploadConfig[kind];
  if (!config || !file || !config.mimeTypes.includes(file.mimetype)) {
    if (file) await removeUploadedFile(file.path);
    return null;
  }

  const url = `/uploads/${file.filename}`;
  let oldProfile;
  try {
    oldProfile = await Profile.findOneAndUpdate(
      { identity: 'primary' },
      { $set: { [config.field]: url } },
      { new: false, runValidators: true }
    ).lean();
    if (!oldProfile) throw new mongoose.Error.DocumentNotFoundError('Profile');
  } catch (error) {
    await removeUploadedFile(file.path);
    throw error;
  }

  const oldUrl = oldProfile[config.field];
  if (oldUrl?.startsWith('/uploads/')) {
    await removeUploadedFile(path.join(backendDir, oldUrl)).catch(() => {});
  }
  return url;
}
