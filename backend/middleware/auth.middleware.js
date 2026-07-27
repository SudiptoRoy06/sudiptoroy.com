import { environment } from '../config/environment.js';
import { findActiveSession } from '../services/auth.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies[environment.session.cookieName];
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  const session = await findActiveSession(token);
  if (!session) {
    res.clearCookie(environment.session.cookieName, { path: '/' });
    return res.status(401).json({ error: 'Session expired' });
  }

  req.user = { id: session.user._id.toString(), email: session.user.email };
  req.sessionId = session._id;
  return next();
});
