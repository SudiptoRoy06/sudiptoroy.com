import { getObject } from '../services/r2.service.js';

export async function showUploadedAsset(req, res) {
  const key = req.params[0];
  if (!/^(?:[a-z0-9-]+\/)?[a-zA-Z0-9._-]+$/.test(key || '')) {
    return res.status(404).json({ error: 'Asset not found' });
  }
  try {
    const object = await getObject(key);
    if (object.ContentType) res.type(object.ContentType);
    if (object.ContentLength !== undefined) res.set('Content-Length', String(object.ContentLength));
    if (object.ETag) res.set('ETag', object.ETag);
    res.set('Cache-Control', object.CacheControl || 'public, max-age=31536000, immutable');
    return object.Body.pipe(res);
  } catch (error) {
    if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    throw error;
  }
}
