import bcrypt from 'bcryptjs';
import { Session, User } from '../models/index.js';
import { createSessionToken, hashToken, normalizeEmail } from '../utils/auth.js';

export async function authenticateUser(email, password) {
  const user = await User.findOne({ email: normalizeEmail(email) }).select('+passwordHash');
  if (!user || !await bcrypt.compare(password, user.passwordHash)) return null;
  return user;
}

export async function createSession(userId, ttlMs) {
  const token = createSessionToken();
  await Session.create({
    tokenHash: hashToken(token),
    user: userId,
    expiresAt: new Date(Date.now() + ttlMs)
  });
  return token;
}

export async function findActiveSession(token) {
  const session = await Session.findOne({ tokenHash: hashToken(token) })
    .select('+tokenHash')
    .populate('user', 'email')
    .exec();

  if (!session || !session.user || session.expiresAt <= new Date()) {
    if (session) await Session.deleteOne({ _id: session._id });
    return null;
  }
  return session;
}

export const deleteSession = (sessionId) => Session.deleteOne({ _id: sessionId });
