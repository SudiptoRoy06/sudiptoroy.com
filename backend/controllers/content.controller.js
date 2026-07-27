import { getContent } from '../services/content.service.js';

export async function showPublicContent(_req, res) {
  return res.json(await getContent());
}

export async function showAdminContent(_req, res) {
  return res.json(await getContent(true));
}
