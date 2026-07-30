import { z } from 'zod';
import { findProfileCv, updateProfile } from '../services/profile.service.js';
import { getObject } from '../services/r2.service.js';

const optionalHttpUrl = z.union([
  z.literal(''),
  z.string().url().max(500).refine(value => /^https?:\/\//i.test(value))
]).default('');

const profileInput = z.object({
  headline: z.string().min(3).max(180),
  bio: z.string().min(10).max(5000),
  email: z.union([z.literal(''), z.string().email()]),
  phone: z.union([z.literal(''), z.string().trim().min(7).max(30).regex(/^\+?[\d\s().-]+$/)]).default(''),
  linkedinUrl: optionalHttpUrl,
  githubUrl: optionalHttpUrl,
  wordpressUrl: optionalHttpUrl,
  available: z.boolean()
});

export async function saveProfile(req, res) {
  const parsed = profileInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid profile content' });

  await updateProfile(parsed.data);
  return res.json({ ok: true });
}

export async function downloadCv(_req, res) {
  const profile = await findProfileCv();
  if (!profile?.cv) return res.status(404).json({ error: 'CV not published' });
  const key = profile.cv.match(/^\/uploads\/((?:cv\/)?[a-zA-Z0-9._-]+)$/)?.[1];
  if (!key) return res.status(404).json({ error: 'CV not published' });
  try {
    const object = await getObject(key);
    res.attachment('Sudipto-Roy-CV.pdf');
    res.type(object.ContentType || 'application/pdf');
    if (object.ContentLength !== undefined) res.set('Content-Length', String(object.ContentLength));
    return object.Body.pipe(res);
  } catch (error) {
    if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({ error: 'CV not found' });
    }
    throw error;
  }
}
