import { Router } from 'express';
import { downloadCv } from '../controllers/profile.controller.js';
import { showPublicContent } from '../controllers/content.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

export const contentRouter = Router();
contentRouter.get('/content', asyncHandler(showPublicContent));
contentRouter.get('/cv', asyncHandler(downloadCv));
