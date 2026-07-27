import { Router } from 'express';
import { showAdminContent } from '../controllers/content.controller.js';
import { saveProfile } from '../controllers/profile.controller.js';
import { saveCollection } from '../controllers/collection.controller.js';
import { uploadProfileAsset } from '../controllers/upload.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { acceptSingleUpload } from '../middleware/upload.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

export const adminRouter = Router();
adminRouter.use(requireAuth);
adminRouter.get('/content', asyncHandler(showAdminContent));
adminRouter.put('/profile', asyncHandler(saveProfile));
adminRouter.put('/:section', asyncHandler(saveCollection));
adminRouter.post('/upload/:kind', acceptSingleUpload, asyncHandler(uploadProfileAsset));
