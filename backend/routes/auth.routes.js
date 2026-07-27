import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getSession, login, logout } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
});

export const authRouter = Router();
authRouter.get('/session', requireAuth, getSession);
authRouter.post('/login', loginLimiter, asyncHandler(login));
authRouter.post('/logout', requireAuth, asyncHandler(logout));
