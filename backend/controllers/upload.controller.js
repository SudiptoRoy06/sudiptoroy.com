import { saveContentUpload, saveProfileUpload } from '../services/upload.service.js';
import { triggerFrontendDeployment } from '../services/deployment.service.js';

export async function uploadProfileAsset(req, res) {
  const url = ['logo', 'image'].includes(req.params.kind)
    ? await saveContentUpload(req.params.kind, req.file, req.body?.folder)
    : await saveProfileUpload(req.params.kind, req.file);
  if (!url) return res.status(400).json({ error: 'Unsupported file type or upload folder' });
  const deployment = ['logo', 'image'].includes(req.params.kind) ? undefined : await triggerFrontendDeployment();
  return res.json({ url, deployment });
}
