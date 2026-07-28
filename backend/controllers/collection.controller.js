import { z } from 'zod';
import { CustomSection, Experience, Project, Skill } from '../models/index.js';
import { getContent } from '../services/content.service.js';

const optionalUrl = z.union([z.literal(''), z.string().url()]);
const optionalUpload = z.union([z.literal(''), z.string().regex(/^\/uploads\/[a-zA-Z0-9._-]+$/)]);
const schemas = {
  skills: z.array(z.object({
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(1000).default(''),
    icon: z.string().trim().max(80).regex(/^[a-z0-9-]*$/).default('')
  })).max(100),
  projects: z.array(z.object({
    title: z.string().trim().min(1).max(160),
    summary: z.string().trim().min(1).max(3000),
    technologies: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
    technologyIcons: z.array(z.string().trim().max(80).regex(/^[a-z0-9-]+$/)).max(20).default([]),
    url: optionalUrl.default(''),
    repositoryUrl: optionalUrl.default(''),
    images: z.array(optionalUpload).max(5).default([]),
    logo: optionalUpload.default(''),
    published: z.boolean().default(true)
  })).max(100),
  experience: z.array(z.object({
    role: z.string().trim().min(1).max(160),
    company: z.string().trim().min(1).max(160),
    period: z.string().trim().max(120).default(''),
    summary: z.string().trim().min(1).max(3000)
  })).max(100),
  customSections: z.array(z.object({
    title: z.string().trim().min(1).max(100),
    intro: z.string().trim().max(1000).default(''),
    presentation: z.enum(['section', 'page']).default('section'),
    itemPresentation: z.enum(['modal', 'page']).default('modal'),
    blocks: z.array(z.object({
      heading: z.string().trim().max(160).default(''),
      body: z.string().trim().min(1).max(5000),
      logo: optionalUpload.default(''),
      image: optionalUpload.default(''),
      images: z.array(optionalUpload).max(5).default([]),
      url: optionalUrl.default(''),
      linkLabel: z.string().trim().max(100).default(''),
      publishedAt: z.union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)]).default('')
    })).max(50).default([]).refine(blocks => blocks.reduce((count, block) => count + block.images.length + (block.image && !block.images.includes(block.image) ? 1 : 0), 0) <= 5, 'A section can have at most 5 images'),
    published: z.boolean().default(true)
  })).max(50)
};

const toSlug = value => value.toLowerCase().trim()
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';

const withUniqueSlugs = items => {
  const used = new Set(['top', 'about', 'skills', 'experience', 'projects', 'contact', 'content']);
  return items.map((item, sortOrder) => {
    const base = toSlug(item.title);
    let slug = base;
    let suffix = 2;
    while (used.has(slug)) slug = `${base}-${suffix++}`;
    used.add(slug);
    return {...item, slug, sortOrder};
  });
};

const config = {
  skills: {
    model: Skill,
    documents: items => items.map((item, sortOrder) => ({...item, sortOrder}))
  },
  projects: {
    model: Project,
    documents: items => items.map(({images, logo, ...item}, sortOrder) => ({...item, imageUrl: images[0] || '', imageUrls: images, logoUrl: logo, sortOrder}))
  },
  experience: {
    model: Experience,
    documents: items => items.map((item, sortOrder) => ({...item, sortOrder}))
  },
  customSections: {
    model: CustomSection,
    documents: withUniqueSlugs
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
