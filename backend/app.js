import path from 'node:path';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { environment } from './config/environment.js';
import { frontendDist } from './config/paths.js';
import { showUploadedAsset } from './controllers/asset.controller.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { apiRouter } from './routes/index.js';
import { asyncHandler } from './utils/async-handler.js';

export const app = express();

app.use((req, res, next) => {
  const origin = req.get('Origin')?.replace(/\/+$/, '');
  if (origin && environment.frontendOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Credentials', 'true');
    res.vary('Origin');
  }
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE');
    res.set('Access-Control-Allow-Headers', req.get('Access-Control-Request-Headers') || 'Content-Type');
    return res.status(204).end();
  }
  return next();
});
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.get(/^\/uploads\/(.+)$/, asyncHandler(showUploadedAsset));
app.use('/api', apiRouter);

if (environment.isProduction) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => (
    req.method === 'GET' && !req.path.startsWith('/api/')
      ? res.sendFile(path.join(frontendDist, 'index.html'))
      : next()
  ));
}

app.use(notFound);
app.use(errorHandler);
