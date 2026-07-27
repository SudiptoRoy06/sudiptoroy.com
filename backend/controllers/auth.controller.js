import { z } from 'zod';
import { environment } from '../config/environment.js';
import { authenticateUser, createSession, deleteSession } from '../services/auth.service.js';

const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200)
});

export const getSession = (req, res) => res.json({ user: req.user });

export async function login(req, res) {
  const parsed = loginInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Valid credentials are required' });

  const user = await authenticateUser(parsed.data.email, parsed.data.password);
  if (!user) return res.status(401).json({ error: 'Email or password is incorrect' });

  const token = await createSession(user._id, environment.session.ttlMs);
  return res
    .cookie(environment.session.cookieName, token, {
      httpOnly: true,
      sameSite: environment.isProduction ? 'none' : 'lax',
      secure: environment.isProduction,
      maxAge: environment.session.ttlMs,
      path: '/'
    })
    .json({ user: { id: user._id.toString(), email: user.email } });
}

export async function logout(req, res) {
  await deleteSession(req.sessionId);
  res.clearCookie(environment.session.cookieName, {
    path: '/',
    sameSite: environment.isProduction ? 'none' : 'lax',
    secure: environment.isProduction
  });
  return res.status(204).end();
}
