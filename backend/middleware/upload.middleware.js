import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { uploadDir } from '../config/paths.js';

fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, callback) => {
      callback(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase());
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024 }
});

export const acceptSingleUpload = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error) return res.status(400).json({ error: 'File rejected' });
    return next();
  });
};
