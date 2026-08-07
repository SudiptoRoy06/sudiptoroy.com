import { CustomSection, Experience, Profile, Project, Skill } from '../models/index.js';

const serializeMedia = value => {
  if (!value || typeof value !== 'string') return value || '';
  const match=value.match(/^(\/uploads\/.*)-original\.[^.]+$/);
  return match ? {url:value,width:1200,height:1200,srcSet:[480,800,1200].map(width=>({width,url:`${match[1]}-${width}.webp`}))} : value;
};

const serializeProfile = (profile) => profile && ({
  headline: profile.headline,
  bio: profile.biography,
  email: profile.email,
  phone: profile.phone,
  linkedinUrl: profile.linkedinUrl,
  githubUrl: profile.githubUrl,
  wordpressUrl: profile.wordpressUrl,
  available: profile.availability,
  portrait: serializeMedia(profile.portrait),
  cv: profile.cv
});

const serializeSkill = (item) => ({
  id: item._id.toString(),
  name: item.name,
  description: item.description,
  icon: item.icon
});

const serializeProject = (item) => ({
  id: item._id.toString(),
  title: item.title,
  summary: item.summary,
  stack: item.technologies.join(' · '),
  technologies: item.technologies,
  technologyIcons: item.technologyIcons,
  url: item.url,
  repositoryUrl: item.repositoryUrl,
  image: serializeMedia(item.imageUrls?.[0] || item.imageUrl),
  images: (item.imageUrls?.length ? item.imageUrls : (item.imageUrl ? [item.imageUrl] : [])).map(serializeMedia),
  logo: serializeMedia(item.logoUrl),
  published: item.published
});

const serializeExperience = (item) => ({
  id: item._id.toString(),
  role: item.role,
  company: item.company,
  period: item.period,
  startDate: item.startDate,
  endDate: item.endDate,
  summary: item.summary
});

const toSlug = value => String(value || '').toLowerCase().trim()
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';

const serializeBlocks = blocks => {
  const used = new Set();
  return blocks.map((block, index) => {
    const base = toSlug(block.heading || `item-${index + 1}`);
    let slug = base;
    let suffix = 2;
    while (used.has(slug)) slug = `${base}-${suffix++}`;
    used.add(slug);
    return {...block,logo:serializeMedia(block.logo),image:serializeMedia(block.image),images:(block.images||[]).map(serializeMedia),slug};
  });
};

const serializeCustomSection = (item) => ({
  id: item._id.toString(),
  title: item.title,
  slug: item.slug,
  intro: item.intro,
  presentation: item.presentation || 'section',
  itemPresentation: item.itemPresentation || 'modal',
  blocks: serializeBlocks(item.blocks),
  published: item.published
});

export async function getContent(includeUnpublished = false) {
  const [profile, skills, projects, experiences, customSections] = await Promise.all([
    Profile.findOne({ identity: 'primary' }).lean(),
    Skill.find().sort({ sortOrder: 1, _id: 1 }).lean(),
    Project.find(includeUnpublished ? {} : { published: true }).sort({ sortOrder: 1, _id: 1 }).lean(),
    Experience.find().sort({ sortOrder: 1, _id: 1 }).lean(),
    CustomSection.find(includeUnpublished ? {} : { published: true }).sort({ sortOrder: 1, _id: 1 }).lean()
  ]);

  return {
    profile: serializeProfile(profile),
    skills: skills.map(serializeSkill),
    projects: projects.map(serializeProject),
    experience: experiences.map(serializeExperience),
    customSections: customSections.map(serializeCustomSection)
  };
}
