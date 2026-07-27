// Compatibility entry point for scripts and tests. Application code imports from
// the focused model, service, and configuration modules directly.
export { connectDatabase, closeDatabase } from './config/database.js';
export { User, Session, Profile, Skill, Project, Experience } from './models/index.js';
export { getContent as content } from './services/content.service.js';
export { normalizeEmail } from './utils/auth.js';
