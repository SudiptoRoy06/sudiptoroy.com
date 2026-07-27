import { Router } from 'express';
import { adminRouter } from './admin.routes.js';
import { authRouter } from './auth.routes.js';
import { contentRouter } from './content.routes.js';

export const apiRouter = Router();
apiRouter.use(contentRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/admin', adminRouter);
