import path from 'node:path';
import { z } from 'zod';
import { backendDir } from '../config/paths.js';
import { findProfileCv, updateProfile } from '../services/profile.service.js';

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

  return res.download(
    path.join(backendDir, profile.cv.replace(/^\//, '')),
    'Sudipto-Roy-CV.pdf'
  );
}
