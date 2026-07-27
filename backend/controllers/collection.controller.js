import { z } from 'zod';
import { Experience, Project, Skill } from '../models/index.js';
import { getContent } from '../services/content.service.js';

const optionalUrl = z.union([z.literal(''), z.string().url()]);
const optionalAsset = z.union([z.literal(''), z.string().url(), z.string().regex(/^\/uploads\/[a-zA-Z0-9._/-]+$/)]);
const schemas = {
  skills: z.array(z.object({
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(1000).default('')
  })).max(100),
  projects: z.array(z.object({
    title: z.string().trim().min(1).max(160),
    summary: z.string().trim().min(1).max(3000),
    technologies: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
    url: optionalUrl.default(''),
    repositoryUrl: optionalUrl.default(''),
    image: optionalAsset.default(''),
    published: z.boolean().default(true)
  })).max(100),
  experience: z.array(z.object({
    role: z.string().trim().min(1).max(160),
    company: z.string().trim().min(1).max(160),
    period: z.string().trim().max(120).default(''),
    summary: z.string().trim().min(1).max(3000)
  })).max(100)
};

const config = {
  skills: {
    model: Skill,
    documents: items => items.map((item, sortOrder) => ({...item, sortOrder}))
  },
  projects: {
    model: Project,
    documents: items => items.map(({image, ...item}, sortOrder) => ({...item, imageUrl: image, sortOrder}))
  },
  experience: {
    model: Experience,
    documents: items => items.map((item, sortOrder) => ({...item, sortOrder}))
  }
};

export async function saveCollection(req, res) {
  const section = req.params.section;
  const parsed = schemas[section]?.safeParse(req.body?.items);
  if (!parsed?.success) return res.status(400).json({ error: `Invalid ${section || 'section'} content` });

  const {model, documents} = config[section];
  await model.deleteMany({});
  if (parsed.data.length) await model.insertMany(documents(parsed.data));
  const content = await getContent(true);
  return res.json({ ok: true, items: content[section] });
}
