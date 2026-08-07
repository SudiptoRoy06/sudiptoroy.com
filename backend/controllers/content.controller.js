import { getContent } from '../services/content.service.js';

export async function showPublicContent(_req, res) {
  res.set('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
  return res.json(await getContent());
}

export async function showAdminContent(_req, res) {
  res.set('Cache-Control', 'private, no-store');
  return res.json(await getContent(true));
}
