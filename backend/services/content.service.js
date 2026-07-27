import { Experience, Profile, Project, Skill } from '../models/index.js';

const serializeProfile = (profile) => profile && ({
  headline: profile.headline,
  bio: profile.biography,
  email: profile.email,
  available: profile.availability,
  portrait: profile.portrait,
  cv: profile.cv
});

const serializeSkill = (item) => ({
  id: item._id.toString(),
  name: item.name,
  description: item.description
});

const serializeProject = (item) => ({
  id: item._id.toString(),
  title: item.title,
  summary: item.summary,
  stack: item.technologies.join(' · '),
  technologies: item.technologies,
  url: item.url,
  repositoryUrl: item.repositoryUrl,
  image: item.imageUrl,
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

export async function getContent(includeUnpublished = false) {
  const [profile, skills, projects, experiences] = await Promise.all([
    Profile.findOne({ identity: 'primary' }).lean(),
    Skill.find().sort({ sortOrder: 1, _id: 1 }).lean(),
    Project.find(includeUnpublished ? {} : { published: true }).sort({ sortOrder: 1, _id: 1 }).lean(),
    Experience.find().sort({ sortOrder: 1, _id: 1 }).lean()
  ]);

  return {
    profile: serializeProfile(profile),
    skills: skills.map(serializeSkill),
    projects: projects.map(serializeProject),
    experience: experiences.map(serializeExperience)
  };
}
