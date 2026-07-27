import crypto from 'node:crypto';

export const normalizeEmail = (email) => email.trim().toLowerCase();
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
export const createSessionToken = () => crypto.randomBytes(32).toString('base64url');
