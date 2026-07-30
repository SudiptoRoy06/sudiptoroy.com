import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});

export const acceptSingleUpload = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error) return res.status(400).json({ error: 'File rejected' });
    return next();
  });
};
