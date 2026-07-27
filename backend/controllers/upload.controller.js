import { saveProfileUpload } from '../services/upload.service.js';

export async function uploadProfileAsset(req, res) {
  const url = await saveProfileUpload(req.params.kind, req.file);
  if (!url) return res.status(400).json({ error: 'Unsupported file type' });
  return res.json({ url });
}
